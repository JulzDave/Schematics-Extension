// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
    installSchematic,
    ESchematicFactories,
} from './schematic-installation-script';

enum EschematicTitles {
    nestJS = 'NestJS Project Schematic',
    nxNestJS = 'NRWL/NX NestJS Plugin Schematic',
}

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
    const matafSchematicsCommand = vscode.commands.registerCommand(
        'mataf-schematics.matafSchematicsQuickPick',
        (): void => {
            // The code you place here will be executed every time your command is executed
            const quickPick = vscode.window.createQuickPick();
            quickPick.items = Object.values(EschematicTitles).map(
                (item): vscode.QuickPickItem => {
                    return { label: item };
                },
            );
            quickPick.onDidChangeSelection(([item]): void => {
                try {
                    switch (item.label) {
                        case EschematicTitles.nestJS:
                            installSchematic(ESchematicFactories.nestjs);
                            break;
                        case EschematicTitles.nxNestJS:
                            installSchematic(ESchematicFactories.nxNestjs);
                            break;
                    }
                } finally {
                    quickPick.dispose();
                }
            });
            quickPick.onDidHide(() => quickPick.dispose());
            quickPick.show();
        },
    );
    context.subscriptions.push(matafSchematicsCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}
