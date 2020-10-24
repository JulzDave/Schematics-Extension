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
import { existsSync, writeFileSync } from 'fs';

// Interfaces:
import { IDependency } from '../../interfaces/dependency';
import { INestJsSchema, INxNestJsSchema } from '../../interfaces/schema';

// services:
import { displayMsgToStdOut } from './display-message';
import { ESchematicType } from '..';
import { readmeData } from './readme-data';

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
const PACKAGE_JSON_PATH = 'package.json';
const README_MD_PATH = 'README.md';
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

const PACKAGE_JSON_SCRIPTS_ADDITION: Record<
    ESchematicType | 'all',
    Record<string, string>
> = {
    [ESchematicType.nxNestJS]: {
        'build:all': 'nx run-many --target=build --all',
    },
    [ESchematicType.nestJS]: {},
    all: {},
};

const NX_APP_PATH = (pluginName: string) => `apps/${pluginName}/src/app`;

function prepareNestjsFilesForDeletion(
    schematicType: ESchematicType,
    pluginName: string,
): string[] {
    const deleteFromDir =
        schematicType === ESchematicType.nxNestJS
            ? NX_APP_PATH(pluginName)
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

function validatePackageJsonExistance(
    tree: Tree,
    scriptKeys: string[],
): Buffer | undefined {
    if (scriptKeys.length === 0) {
        return;
    }

    const packageJsonConfigBuffer = tree.read(PACKAGE_JSON_PATH);

    if (!packageJsonConfigBuffer) {
        return;
    }

    return packageJsonConfigBuffer;
}

function addScriptsToPackageJson(tree: Tree, schematicType: ESchematicType) {
    const scriptsToAdd = PACKAGE_JSON_SCRIPTS_ADDITION[schematicType];
    const scriptKeys = Object.keys(scriptsToAdd);

    const packageJsonConfigBuffer = validatePackageJsonExistance(
        tree,
        scriptKeys,
    );

    if (!packageJsonConfigBuffer) {
        return;
    }

    const parsedPackageJson = JSON.parse(packageJsonConfigBuffer.toString());

    scriptKeys.forEach(
        (scriptKey) =>
            (parsedPackageJson.scripts[scriptKey] = scriptsToAdd[scriptKey]),
    );

    writeFileSync(
        PACKAGE_JSON_PATH,
        JSON.stringify(parsedPackageJson, null, 4),
    );
}

function addReadmeTemplate() {
    writeFileSync(README_MD_PATH, readmeData);
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

    addScriptsToPackageJson(tree, schematicType);

    addReadmeTemplate();

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
