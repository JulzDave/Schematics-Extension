import { workspace, extensions, Terminal, window } from 'vscode';
import { F_FIND_VSIX_BY_FILE_NAME, F_FIND_DIR } from './helpers/file-searcher';
import { reconsilePath } from './helpers/path-reconsiler';
import { PACKAGE_NAME } from './helpers/read-package-json';
import { linkSchematic } from './schematic-linking';

const ROOT_DIR = F_FIND_DIR('\\..');

const ESLINT_VSIX_FILE_NAME = F_FIND_VSIX_BY_FILE_NAME(
    '\\..',
    '.vsix',
    'eslint',
);

const ESLINT_EXTENSION_ID = 'dbaeumer.vscode-eslint';

const NOTIFY_USER_TO_RELOAD =
    'ESlint extension was installed.\nPlease address the terminal and Reload the window only after applying the schematic.';
const NOTIFY_USER_TO_ADDRESS_TERMINAL =
    'You have been prompted by the "Mataf Schematics" extension.\nAddress the integrated terminal to proceed.';

export const enum ESchematicFactories {
    nxNestjs = 'nxNestJS',
    nestjs = 'nestJS',
}

// TODO: look into improving this codeline syntax...
const workspaceDirectoryPath = () => {
    try {
        return workspace.workspaceFolders![0]?.uri?.path;
    } catch (err) {
        throw window.showErrorMessage(
            `${PACKAGE_NAME} cannot operate in a vacum, make sure you have a designated project location`,
        );
    }
};

let REMOTE_PATH = reconsilePath(workspaceDirectoryPath());

if (REMOTE_PATH[0] === '/') {
    REMOTE_PATH = REMOTE_PATH.substr(1);
}

const INSTALL_SCHEMATIC_COMMAND = (schematicFactory: ESchematicFactories) =>
    `schematics '${PACKAGE_NAME}:${schematicFactory}' --debug=false --force`;

let ESLINT_INSTALLATION_COMMAND = `code --install-extension ${ROOT_DIR}/${ESLINT_VSIX_FILE_NAME}`;

const ESLINT_EXTENSION_EXISTS = extensions.getExtension(ESLINT_EXTENSION_ID);
const ACTIVE_TERMINAL = window.activeTerminal;

function install(
    terminalInstance: Terminal,
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
        ? window.showInformationMessage(NOTIFY_USER_TO_ADDRESS_TERMINAL)
        : window.showInformationMessage(NOTIFY_USER_TO_RELOAD);
}

export function installSchematic(schematicFactory: ESchematicFactories) {
    linkSchematic();

    if (!ACTIVE_TERMINAL) {
        const newTerminalInstance = window.createTerminal();
        install(newTerminalInstance, schematicFactory);
    } else {
        install(ACTIVE_TERMINAL, schematicFactory);
    }
    showInformationMessage();
}
