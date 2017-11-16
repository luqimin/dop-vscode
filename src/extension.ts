'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as os from 'os';
import { exec } from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // This line of code will only be executed once when your extension is activated
    let dopTerminal: vscode.Terminal,
        dopOutput: vscode.OutputChannel;
    const osType = os.type();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let dopServer = vscode.commands.registerCommand('extension.dopServer', () => {
        if (dopTerminal && dopTerminal.name === 'dophin') {
            dopTerminal.show();
            return;
        }
        vscode.window.showInputBox({
            ignoreFocusOut: true,
            placeHolder: '请输入您的项目名称',
            prompt: '项目名称',
        }).then((name) => {
            if (name) {
                dopTerminal = vscode.window.createTerminal('dophin');
                dopTerminal.show();
                if (osType === 'Windows_NT') {
                    dopTerminal.sendText(`dop server ${name}`);
                } else {
                    dopTerminal.sendText(`sudo dop server ${name}`);
                }
                // dopTerminal被dispose时销毁当前变量
                vscode.window.onDidCloseTerminal((event) => {
                    if (dopTerminal) {
                        dopTerminal = null;
                    }
                });
            }
        })
    });

    let dopCompile = vscode.commands.registerCommand('extension.dopCompile', () => {
        vscode.window.showInputBox({
            ignoreFocusOut: true,
            placeHolder: '请输入您的项目名称',
            prompt: '项目名称',
        }).then((name) => {
            if (name) {
                if (dopOutput) {
                    dopOutput.clear();
                } else {
                    dopOutput = vscode.window.createOutputChannel('dophin');
                    dopOutput.show();
                }
                dopOutput.appendLine(`正在执行: dop compile ${name}`);
                let compileTask = exec(`dop compile ${name}`, {
                    cwd: vscode.workspace.rootPath,
                    encoding: 'utf8',
                    maxBuffer: 1000 * 1024,
                });
                compileTask.stdout.on('data', function (data) {
                    dopOutput.append(data.toString());
                });
            }
        })
    });

    let dopDeploy = vscode.commands.registerCommand('extension.dopDeploy', () => {
        vscode.window.showInputBox({
            ignoreFocusOut: true,
            placeHolder: '请输入您的项目名称',
            prompt: '项目名称',
        }).then((name) => {
            if (name) {
                if (dopOutput) {
                    dopOutput.clear();
                } else {
                    dopOutput = vscode.window.createOutputChannel('dophin');
                    dopOutput.show();
                }
                dopOutput.appendLine(`正在执行: dop deploy ${name}`);
                let compileTask = exec(`dop deploy ${name}`, {
                    cwd: vscode.workspace.rootPath,
                    encoding: 'utf8',
                    maxBuffer: 1000 * 1024,
                });
                compileTask.stdout.on('data', function (data) {
                    dopOutput.append(data.toString());
                });
            }
        })
    });

    context.subscriptions.push(dopServer, dopCompile, dopDeploy);
}

// this method is called when your extension is deactivated
export function deactivate() {
}