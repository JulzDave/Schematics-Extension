import { PACKAGE_NAME, PACKAGE_PUBLISHER } from './read-package-json';
import { extensions } from 'vscode';

export const getExtensionPath = extensions.getExtension(
    `${PACKAGE_PUBLISHER}.${PACKAGE_NAME}`,
)?.extensionPath;
