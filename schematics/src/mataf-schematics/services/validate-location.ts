// Schematics packages:
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { dasherize } from '@angular-devkit/core/src/utils/strings';
// Interface:
import { INxNestJsSchema, INestJsSchema } from '../../interfaces/schema';

const WORKSPACE_PATH = 'workspace.json';
const NOT_IN_NX_WORKSPACE_MSG = 'Not an NX CLI workspace';
const NEST_CLI_JSON_LITERAL = 'nest-cli.json';
const PACKAGE_JSON_LITERAL = 'package.json';
const NESTJS_PROJECT_NOT_FOUND = 'NestJS project not found!';
const NESTJS_PROJECT_NAME_NOT_FOUND = 'NestJS project name not found!';
const PROJECT_NAME_KEY_LITERAL = 'projectName';
const NESTJS_SRC_PATH = 'src';

const PLUGIN_NOT_FOUND = (pluginName: string) =>
    `Plugin ${pluginName} not found`;

const SOURCE_DIR_NOT_FOUND = (projectName: string) =>
    `Source directory not found for "${projectName}" project.`;

export function validateNxNestjsWorkspace(
    tree: Tree,
    options: INxNestJsSchema,
) {
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
        throw new SchematicsException(PLUGIN_NOT_FOUND(dasherizedPluginName));
    }

    return {
        pluginSrcFolderPath,
        pluginName,
        dasherizedPluginName,
    };
}

export function validateNestjsProject(tree: Tree, options: INestJsSchema) {
    const projectConfigBuffer = tree.read(NEST_CLI_JSON_LITERAL);
    const packageJsonConfigBuffer = tree.read(PACKAGE_JSON_LITERAL);

    if (!projectConfigBuffer || !packageJsonConfigBuffer) {
        throw new SchematicsException(NESTJS_PROJECT_NOT_FOUND);
    }

    const parsedPackageJson = JSON.parse(packageJsonConfigBuffer.toString());
    const projectName = parsedPackageJson?.name;

    if (!projectName) {
        throw new SchematicsException(NESTJS_PROJECT_NAME_NOT_FOUND);
    }

    options[PROJECT_NAME_KEY_LITERAL] = projectName;
    const dasherizedProjectName = dasherize(projectName);
    const srcFolderPath: any = NESTJS_SRC_PATH;

    if (!srcFolderPath) {
        throw new SchematicsException(
            SOURCE_DIR_NOT_FOUND(dasherizedProjectName),
        );
    }

    return {
        srcFolderPath,
        projectName,
        dasherizedProjectName,
    };
}
