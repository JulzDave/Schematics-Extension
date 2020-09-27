// Schematics packages:
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { strings } from '@angular-devkit/core';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';
import {
    apply,
    mergeWith,
    template,
    url,
    move,
    renameTemplateFiles,
    Source,
    Tree,
    SchematicContext,
} from '@angular-devkit/schematics';
import {
    NodeDependency,
    addPackageJsonDependency,
    NodeDependencyType,
} from '@schematics/angular/utility/dependencies';

// NodeJS packages:
import { existsSync } from 'fs';

// Interfaces:
import { IDependency } from '../../interfaces/dependency';
import { INestJsSchema, INxNestJsSchema } from '../../interfaces/schema';

// services:
import { displayMsgToStdOut } from './display-message';
import { ESchematicType } from '..';

// eslint-disable-next-line
const { Default: dependencies, Dev: devDependencies } = NodeDependencyType;

const DEPENDENCIES: IDependency[] = [
    { name: 'elastic-apm-node', version: '^3.6.1', type: dependencies },
    { name: '@nestjs/swagger', version: '^4.5.7', type: dependencies },
    { name: 'swagger-ui-express', version: '^4.1.4', type: dependencies },
    { name: 'compression', version: '^1.7.4', type: dependencies },
    { name: 'helmet', version: '^3.22.0', type: dependencies },
    { name: '@types/helmet', version: '0.0.48', type: devDependencies },
    { name: 'csurf', version: '^1.11.0', type: dependencies },
];

const NESTJS_SRC_FOLDER = 'src';

const NESTJS_FILES_TO_DELETE = {
    fromSourceDirectory: [
        '/app.controller.spec.ts',
        '/app.controller.ts',
        '/app.service.spec.ts',
        '/app.service.ts',
        '/app.service.ts',
    ],
    fromRootDirectory: ['package-lock.json'],
};

function prepareNestjsFilesForDeletion(
    schematicType: ESchematicType,
    pluginName: string,
): string[] {
    const deleteFromDir =
        schematicType === ESchematicType.nxNestJS
            ? `apps/${pluginName}/src/app`
            : NESTJS_SRC_FOLDER;
    const { fromSourceDirectory, fromRootDirectory } = NESTJS_FILES_TO_DELETE;
    const sourceDirFilesWithPath = fromSourceDirectory.map(
        (file): string => deleteFromDir + file,
    );
    return sourceDirFilesWithPath.concat(fromRootDirectory);
}

function deleteFiles(
    cb: Function,
    dasherizedPluginName: string,
    tree: Tree,
    schematicType: ESchematicType,
): void {
    (cb(schematicType, dasherizedPluginName) as string[]).forEach(
        (file): void => {
            if (existsSync(file)) {
                tree.delete(file);
            }
        },
    );
}

function nodeDependencyFactory(
    packageName: string,
    version: string,
    nodeDependencyType: NodeDependencyType,
): NodeDependency {
    return {
        type: nodeDependencyType,
        name: packageName,
        version: version,
        overwrite: true,
    };
}

function assignDependenciesToPackageJson(tree: Tree): void {
    DEPENDENCIES.forEach((dependency) => {
        const { name, version, type } = dependency;
        const dependencyDetails: NodeDependency = nodeDependencyFactory(
            name,
            version,
            type,
        );
        addPackageJsonDependency(tree, dependencyDetails);
    });
}

export function confirmChanges(
    srcFolderPath: any,
    projectName: any,
    options: INestJsSchema | INxNestJsSchema,
    dasherizedProjectName: string,
    tree: Tree,
    context: SchematicContext,
    templatePath: string,
    schematicType: ESchematicType,
) {
    const defaultProjectPath = buildDefaultPath(srcFolderPath);
    const parsedPath = parseName(defaultProjectPath, projectName);
    const { name } = parsedPath;
    const sourceTemplates = url(templatePath);
    const sourceParameterizedTemplates = applyRules(
        name,
        sourceTemplates,
        options,
        srcFolderPath,
    );
    deleteFiles(
        prepareNestjsFilesForDeletion,
        dasherizedProjectName,
        tree,
        schematicType,
    );

    assignDependenciesToPackageJson(tree);
    context.addTask(new NodePackageInstallTask());
    context.engine.executePostTasks().subscribe(() => {
        displayMsgToStdOut(DEPENDENCIES, schematicType);
    });

    return mergeWith(sourceParameterizedTemplates)(tree, context);
}

function applyRules(
    name: string,
    sourceTemplates: Source,
    options: INestJsSchema | INxNestJsSchema,
    srcFolderPath: any,
) {
    return apply(sourceTemplates, [
        renameTemplateFiles(),
        template({
            ...options,
            ...strings,
            name,
        }),
        move(srcFolderPath),
    ]);
}
