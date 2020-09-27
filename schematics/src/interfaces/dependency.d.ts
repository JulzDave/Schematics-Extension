import { NodeDependencyType } from '@schematics/angular/utility/dependencies';

export interface IDependency {
    name: string;
    version: string;
    type: NodeDependencyType;
}
