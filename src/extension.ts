// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { relative, normalize, resolve, join } from 'path';

const NX_NESTJS_SCHEMATIC_RELATIVE_LOCATION =
    '/../schematics/NestJS/src/collection.json';
const NOTIFY_USER_TO_ADDRESS_TERMINAL =
    'You have been prompted by the "Mataf Schematics" extension.\nAddress the integrated terminal to proceed.';
const ESLINT_VSIX_NAME = 'vscode-eslint-2.1.8_vsixhub.com.vsix';
const enum SchematicFactories {
    nest = 'nest',
}
const ROOT_DIR = join(__dirname, '\\..');

const COLLECTION_JSON_ABS_PATH = normalize(
    __dirname + NX_NESTJS_SCHEMATIC_RELATIVE_LOCATION,
);
// TODO: look into improving this codeline syntax...
let REMOTE_PATH = vscode.workspace.workspaceFolders![0]?.uri.path;

const CLIENT_RELATIVE_COLLECTION_PATH = relative(
    REMOTE_PATH,
    resolve(REMOTE_PATH, COLLECTION_JSON_ABS_PATH),
);

if (REMOTE_PATH[0] === '/' || REMOTE_PATH[0] === '\\') {
    REMOTE_PATH = REMOTE_PATH.substr(1);
}
const INSTALL_SCHEMATIC_COMMAND = `schematics '${CLIENT_RELATIVE_COLLECTION_PATH}:${SchematicFactories.nest}' --debug=false --force`;
let ESLINT_INSTALLATION_COMMAND = `code --install-extension ${ROOT_DIR}\\${ESLINT_VSIX_NAME}`
    .split('\\')
    .join('/');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(
        'Congratulations, your extension "mataf-schematics" is now active!',
    );

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    // TODO: In package.json, change repository.url to azure repo url
    let disposable = vscode.commands.registerCommand(
        'mataf-schematics.nxNestJSSchematic',
        () => {
            // The code you place here will be executed every time your command is executed

            if (!vscode.window.activeTerminal) {
                const newTerminalInstance = vscode.window.createTerminal();
                newTerminalInstance.show();
                newTerminalInstance.sendText(ESLINT_INSTALLATION_COMMAND, true);
                newTerminalInstance.sendText(INSTALL_SCHEMATIC_COMMAND, true);
            } else {
                vscode.window.activeTerminal.show();
                vscode.window.activeTerminal.sendText(
                    ESLINT_INSTALLATION_COMMAND,
                    true,
                );
                vscode.window.activeTerminal.sendText(
                    INSTALL_SCHEMATIC_COMMAND,
                    true,
                );
            }

            vscode.window.showInformationMessage(
                NOTIFY_USER_TO_ADDRESS_TERMINAL,
            );

            vscode.window.showInformationMessage(ESLINT_INSTALLATION_COMMAND);
        },
    );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

// ! detect shell type snippet
/* 
(vscode.window.activeTerminal?.creationOptions as Readonly<
     vscode.TerminalOptions
 >).shellPath
     ?.toLowerCase()
     .includes('') 
     */
