import { relative, normalize, resolve, join } from 'path';
import { readdirSync } from 'fs';
import * as vscode from 'vscode';

function reconsilePath(path: string) {
    return path.split('\\').join('/');
}
const F_ROOT_DIR = () => reconsilePath(join(__dirname, '\\..'));

const ROOT_DIR_FILES = readdirSync(F_ROOT_DIR());

const F_VSIX_FILES = () =>
    ROOT_DIR_FILES.filter(
        (file) => file.toLowerCase().substr(file.length - 5) === '.vsix',
    );

const F_ESLINT_VSIX_FILE_NAME = () => {
    const eslintExtensionFiles = F_VSIX_FILES()
        .filter((file) => file.includes('eslint'))!
        .sort();
    return eslintExtensionFiles[eslintExtensionFiles.length - 1];
};

const ESLINT_EXTENSION_ID = 'dbaeumer.vscode-eslint';
const NX_NESTJS_SCHEMATIC_RELATIVE_LOCATION =
    '/../schematics/NestJS/src/collection.json';
const NOTIFY_USER_TO_RELOAD =
    'ESlint extension was installed.\nPlease address the terminal and Reload the window only after applying the schematic.';
const NOTIFY_USER_TO_ADDRESS_TERMINAL =
    'You have been prompted by the "Mataf Schematics" extension.\nAddress the integrated terminal to proceed.';

export const enum ESchematicFactories {
    nxNestjs = 'nxNestJS',
    nestjs = 'nestJS',
}

const COLLECTION_JSON_ABS_PATH = normalize(
    __dirname + NX_NESTJS_SCHEMATIC_RELATIVE_LOCATION,
);

// TODO: look into improving this codeline syntax...
let REMOTE_PATH = reconsilePath(
    vscode.workspace.workspaceFolders![0]?.uri.path,
);

const CLIENT_RELATIVE_COLLECTION_PATH = reconsilePath(
    relative(REMOTE_PATH, resolve(REMOTE_PATH, COLLECTION_JSON_ABS_PATH)),
);

if (REMOTE_PATH[0] === '/') {
    REMOTE_PATH = REMOTE_PATH.substr(1);
}

const INSTALL_SCHEMATIC_COMMAND = (schematicFactory: ESchematicFactories) =>
    `schematics '${CLIENT_RELATIVE_COLLECTION_PATH}:${schematicFactory}' --debug=false --force`;

let ESLINT_INSTALLATION_COMMAND = `code --install-extension ${F_ROOT_DIR()}/${F_ESLINT_VSIX_FILE_NAME()}`;

const ESLINT_EXTENSION_EXISTS = vscode.extensions.getExtension(
    ESLINT_EXTENSION_ID,
);
const ACTIVE_TERMINAL = vscode.window.activeTerminal;

function install(
    terminalInstance: vscode.Terminal,
    schematicFactory: ESchematicFactories,
) {
    terminalInstance.show();
    if (!ESLINT_EXTENSION_EXISTS) {
        terminalInstance.sendText(ESLINT_INSTALLATION_COMMAND, true);
    }
    terminalInstance.sendText(
        INSTALL_SCHEMATIC_COMMAND(schematicFactory),
        true,
    );
}

function showInformationMessage() {
    ESLINT_EXTENSION_EXISTS
        ? vscode.window.showInformationMessage(NOTIFY_USER_TO_ADDRESS_TERMINAL)
        : vscode.window.showInformationMessage(NOTIFY_USER_TO_RELOAD);
}

export function installSchematic(schematicFactory: ESchematicFactories) {
    if (!ACTIVE_TERMINAL) {
        const newTerminalInstance = vscode.window.createTerminal();
        install(newTerminalInstance, schematicFactory);
    } else {
        install(ACTIVE_TERMINAL, schematicFactory);
    }
    showInformationMessage();
}
