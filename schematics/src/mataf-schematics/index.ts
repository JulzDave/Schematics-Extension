// Schematics packages:
import {
    Rule,
    SchematicContext,
    Tree,
    apply,
    mergeWith,
    template,
    url,
    SchematicsException,
    move,
    renameTemplateFiles,
    Source,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import { strings } from '@angular-devkit/core';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';
import {
    NodeDependency,
    addPackageJsonDependency,
    NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import { existsSync } from 'fs';
// Interfaces:
import { IDependency } from '../interfaces/dependency';
import { INxNestJsSchema, INestJsSchema } from '../interfaces/schema';
// Services:
import { displayMsgToStdOut } from './services/display-message';

const enum ESchematicType {
    nxNestJS = 'nxNestJS',
    nestJS = 'nestJS',
}
const WORKSPACE_PATH = 'workspace.json';
const NOT_IN_NX_WORKSPACE_MSG = 'Not an NX CLI workspace';
const NX_NESTJS_TEMPLATES_PATH = 'nx-nestjs-files'; // This path as relative to the root ./dist/nest folder
const NESTJS_TEMPLATES_PATH = 'nestjs-files'; // This path as relative to the root ./dist/nest folder
const NESTJS_SRC_FOLDER = 'src';

const NEST_CLI_JSON_LITERAL = 'nest-cli.json';
const PACKAGE_JSON_LITERAL = 'package.json';
const NESTJS_PROJECT_NOT_FOUND = 'NestJS project not found!';
const NESTJS_PROJECT_NAME_NOT_FOUND = 'NestJS project name not found!';
const PROJECT_NAME_KEY_LITERAL = 'projectName';
const NESTJS_SRC_PATH = 'src';
const NESTJS_FILES_TO_DELETE = {
    fromAppDirectory: [
        '/app.controller.spec.ts',
        '/app.controller.ts',
        '/app.service.spec.ts',
        '/app.service.ts',
        '/app.service.ts',
    ],
    fromRootDirectory: ['package-lock.json'],
};

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

function nxNestjsfilesToDelete(pluginName: string): string[] {
    const appDirectory = `apps/${pluginName}/src/app`;
    const { fromAppDirectory, fromRootDirectory } = NESTJS_FILES_TO_DELETE;
    const appDirFilesWithPath = fromAppDirectory.map(
        (file): string => appDirectory + file,
    );
    return appDirFilesWithPath.concat(fromRootDirectory);
}

function nestjsfilesToDelete(_: never): string[] {
    const appDirectory = NESTJS_SRC_FOLDER;
    const { fromAppDirectory, fromRootDirectory } = NESTJS_FILES_TO_DELETE;
    const appDirFilesWithPath = fromAppDirectory.map(
        (file): string => appDirectory + file,
    );
    return appDirFilesWithPath.concat(fromRootDirectory);
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

function deleteFiles(
    cb: Function,
    dasherizedPluginName: string,
    tree: Tree,
): void {
    (cb(dasherizedPluginName) as string[]).forEach((file): void => {
        if (existsSync(file)) {
            tree.delete(file);
        }
    });
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

// You don't have to export the function as default. You can also have more than one rule factory
// per file.

export function nxNestJS(options: INxNestJsSchema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read(WORKSPACE_PATH);

        if (!workspaceConfigBuffer) {
            throw new SchematicsException(NOT_IN_NX_WORKSPACE_MSG);
        }

        const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
        const { pluginName } = options;
        const dasherizedPluginName = dasherize(pluginName);
        const pluginSrcFolderPath =
            workspaceConfig?.projects?.[dasherizedPluginName]?.sourceRoot;

        if (!pluginSrcFolderPath) {
            throw new SchematicsException(
                `Plugin ${dasherizedPluginName} not found`,
            );
        }

        return confirmChanges(
            pluginSrcFolderPath,
            pluginName,
            options,
            dasherizedPluginName,
            tree,
            context,
            NX_NESTJS_TEMPLATES_PATH,
            nxNestjsfilesToDelete,
        );
    };
}

export function nestJS(options: INestJsSchema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const projectConfigBuffer = tree.read(NEST_CLI_JSON_LITERAL);
        const packageJsonConfigBuffer = tree.read(PACKAGE_JSON_LITERAL);

        if (!projectConfigBuffer || !packageJsonConfigBuffer) {
            throw new SchematicsException(NESTJS_PROJECT_NOT_FOUND);
        }

        const parsedPackageJson = JSON.parse(
            packageJsonConfigBuffer.toString(),
        );
        const projectName = parsedPackageJson?.name;
        if (!projectName) {
            throw new SchematicsException(NESTJS_PROJECT_NAME_NOT_FOUND);
        }
        options[PROJECT_NAME_KEY_LITERAL] = projectName;
        const dasherizedProjectName = dasherize(projectName);
        const srcFolderPath: any = NESTJS_SRC_PATH;

        if (!srcFolderPath) {
            throw new SchematicsException(
                `Source directory not found for "${dasherizedProjectName}" project.`,
            );
        }

        return confirmChanges(
            srcFolderPath,
            projectName,
            options,
            dasherizedProjectName,
            tree,
            context,
            NESTJS_TEMPLATES_PATH,
            nestjsfilesToDelete,
        );
    };
}

function confirmChanges(
    srcFolderPath: any,
    projectName: any,
    options: INestJsSchema | INxNestJsSchema,
    dasherizedProjectName: string,
    tree: Tree,
    context: SchematicContext,
    templatePath: string,
    filesToDelete: Function,
) {
    const defaultProjectPath = buildDefaultPath(srcFolderPath);
    const parsedPath = parseName(defaultProjectPath, projectName);
    const { name } = parsedPath;
    const sourceTemplates = url(templatePath);
    const sourceParameterizedTemplates = executeChanges(
        name,
        sourceTemplates,
        options,
        srcFolderPath,
    );
    deleteFiles(filesToDelete, dasherizedProjectName, tree);

    assignDependenciesToPackageJson(tree);
    context.addTask(new NodePackageInstallTask());
    context.engine.executePostTasks().subscribe(() => {
        displayMsgToStdOut(DEPENDENCIES, ESchematicType.nestJS);
    });

    return mergeWith(sourceParameterizedTemplates)(tree, context);
}

function executeChanges(
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