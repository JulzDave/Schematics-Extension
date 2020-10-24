import { window, Terminal } from 'vscode';
import { reconsilePath } from './helpers/path-reconsiler';
import { getExtensionPath } from './helpers/get-extension-path';
import { F_FIND_FILE } from './helpers/file-searcher';

const PACKED_SCHEMATIC_FILE_NAME = F_FIND_FILE('\\..\\schematics', '.tgz');

export const extensionPath = getExtensionPath;

const ACTIVE_TERMINAL = window.activeTerminal;

const PACKED_SCHEMATIC_PATH = `npm i -g '${reconsilePath(
    extensionPath + '/schematics' + `/${PACKED_SCHEMATIC_FILE_NAME}`,
)}'`;

const SCHEMATICS_CLI_INSTALLATION = 'npm i -g @angular-devkit/schematics-cli';

function sendTextsToTerminal(terminalInstance: Terminal) {
    terminalInstance.sendText(SCHEMATICS_CLI_INSTALLATION);
    terminalInstance.sendText(PACKED_SCHEMATIC_PATH);
}

export function linkSchematic() {
    if (!ACTIVE_TERMINAL) {
        const newTerminalInstance = window.createTerminal();
        sendTextsToTerminal(newTerminalInstance);
    } else {
        sendTextsToTerminal(ACTIVE_TERMINAL);
    }
}
