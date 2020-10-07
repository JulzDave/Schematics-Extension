import { window } from 'vscode';
import { reconsilePath } from './helpers/path-reconsiler';
import { getExtensionPath } from './helpers/get-extension-path';
import { F_FIND_FILE } from './helpers/file-searcher';

const PACKED_SCHEMATIC_FILE_NAME = F_FIND_FILE('\\..\\schematics', '.tgz');

export const extensionPath = getExtensionPath;

const ACTIVE_TERMINAL = window.activeTerminal;

const PACKED_SCHEMATIC_PATH = `npm i -g '${reconsilePath(
    extensionPath + '/schematics' + `/${PACKED_SCHEMATIC_FILE_NAME}`,
)}'`;

export function linkSchematic() {
    if (!ACTIVE_TERMINAL) {
        const newTerminalInstance = window.createTerminal();
        newTerminalInstance.sendText(PACKED_SCHEMATIC_PATH);
    } else {
        ACTIVE_TERMINAL.sendText(PACKED_SCHEMATIC_PATH);
    }
}
