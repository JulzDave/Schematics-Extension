// Schematics packages:
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

// Interfaces:
import { INxNestJsSchema, INestJsSchema } from '../interfaces/schema';
// Services:
import {
    validateNxNestjsWorkspace,
    validateNestjsProject,
} from './services/validate-location';
import { confirmChanges } from './services/execute-changes';

const NX_NESTJS_TEMPLATES_PATH = 'nx-nestjs-files'; // This path as relative to the root ./dist/nest folder
const NESTJS_TEMPLATES_PATH = 'nestjs-files'; // This path as relative to the root ./dist/nest folder

export const enum ESchematicType {
    nxNestJS = 'nxNestJS',
    nestJS = 'nestJS',
}

export function nxNestJS(options: INxNestJsSchema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const validNxNestjsWorkspace = validateNxNestjsWorkspace(tree, options);

        return confirmChanges(
            validNxNestjsWorkspace.pluginSrcFolderPath,
            validNxNestjsWorkspace.pluginName,
            options,
            validNxNestjsWorkspace.dasherizedPluginName,
            tree,
            context,
            NX_NESTJS_TEMPLATES_PATH,
            ESchematicType.nxNestJS,
        );
    };
}

export function nestJS(options: INestJsSchema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const validNestjsProject = validateNestjsProject(tree, options);

        return confirmChanges(
            validNestjsProject.srcFolderPath,
            validNestjsProject.projectName,
            options,
            validNestjsProject.dasherizedProjectName,
            tree,
            context,
            NESTJS_TEMPLATES_PATH,
            ESchematicType.nestJS,
        );
    };
}
