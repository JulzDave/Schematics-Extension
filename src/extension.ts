// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { relative, normalize, resolve } from "path";

const NX_NESTJS_SCHEMATIC_RELATIVE_LOCATION =
    "/../schematics/NestJS/src/collection.json";
const NOTIFY_USER_TO_ADDRESS_TERMINAL =
    'You have been prompted by the "Mataf Schematics" extension.\nAddress the integrated terminal to proceed.';
const enum SchematicFactories {
    nest = "nest"
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(
        'Congratulations, your extension "mataf-schematics" is now active!'
    );

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const absoluteCollectionPath = normalize(
        __dirname + NX_NESTJS_SCHEMATIC_RELATIVE_LOCATION
    );
    // TODO: look into improving this codeline syntax...
    let remotePath = vscode.workspace.workspaceFolders![0]?.uri.path;

    const clientRelativeCollectionPath = relative(
        remotePath,
        resolve(remotePath, absoluteCollectionPath)
    );

    if (remotePath[0] === "/" || remotePath[0] === "\\") {
        remotePath = remotePath.substr(1);
    }

    const installSchematicCmd = `schematics "${clientRelativeCollectionPath}:${SchematicFactories.nest}" --debug=false --force`;

    // TODO: In package.json, change repository.url to azure repo url
    let disposable = vscode.commands.registerCommand(
        "mataf-schematics.nxNestJSSchematic",
        async () => {
            // The code you place here will be executed every time your command is executed
            if (!vscode.window.activeTerminal) {
                const newTerminalInstance = vscode.window.createTerminal();
                newTerminalInstance.show();
                newTerminalInstance.sendText(installSchematicCmd, true);
            } else {
                vscode.window.activeTerminal?.show();
                vscode.window.activeTerminal?.sendText(
                    installSchematicCmd,
                    true
                );
            }
            vscode.window.showInformationMessage(
                NOTIFY_USER_TO_ADDRESS_TERMINAL
            );
        }
    );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
