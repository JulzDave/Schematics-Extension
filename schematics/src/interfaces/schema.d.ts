import { nxNestJS } from '../nest/index';
export interface INxNestJsSchema {
    pluginName: string;
}
export interface INestJsSchema {
    projectName: string;
}

export interface ISchematicTypes {
    nxNestJS: string[];
    nestJS: string[];
}
