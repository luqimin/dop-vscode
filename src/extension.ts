'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { languages } from 'vscode';
import { fail } from 'assert';

import tools from './dophin';
import CONST from './const';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // This line of code will only be executed once when your extension is activated
    let dopTerminal: vscode.Terminal,
        dopOutput: vscode.OutputChannel;
    const osType = os.type();

    // dophin任务
    const dophinTask = (taskName: string, projectName: string, cwd: string, extraOption: string = ''): void => {
        dopOutput.appendLine(`正在执行: dop ${taskName} ${projectName} ${extraOption}`);
        vscode.window.withProgress({
            location: 10,
            title: `正在执行: dop ${taskName} ${projectName} ${extraOption}`,
        }, () => {
            return tools.dophinTask(taskName, projectName, cwd, extraOption).then((res) => {
                dopOutput.append(res);
                vscode.window.showInformationMessage(`执行完成! dop ${taskName} ${projectName} ${extraOption}`, CONST.buttonName.showLog).then((selection) => {
                    if (selection === CONST.buttonName.showLog) {
                        dopOutput.show();
                    }
                });
            }).catch((err) => {
                dopOutput.append(err.message);
                vscode.window.showErrorMessage(`执行错误! dop ${taskName} ${projectName} ${extraOption}`, CONST.buttonName.showLog).then((selection) => {
                    if (selection === CONST.buttonName.showLog) {
                        dopOutput.show();
                    }
                });
            });
        });
    };

    const dophinCommand = (taskName: string, filedata: any, options: any = {}) => {
        const { useFullpath, extra } = options;
        // 判断不同context获取到的文件路径
        const fileStats = filedata && fs.statSync(filedata.path);
        let fileDir,
            cwd;
        if (fileStats && fileStats.isFile()) {
            fileDir = path.dirname(filedata.path);
            cwd = path.dirname(filedata.path);
        } else if (fileStats && fileStats.isDirectory()) {
            fileDir = filedata.path;
            cwd = filedata.path;
        } else {
            fileDir = '';
            cwd = vscode.workspace.rootPath;
        }

        // 获取项目名
        const projectName = tools.getProjectName(fileDir);

        if (!dopOutput) {
            dopOutput = vscode.window.createOutputChannel('dophin');
        }

        if (projectName) {
            dophinTask(taskName, useFullpath ? filedata.path : projectName, cwd, extra);
            return;
        }

        // 如果获取不到项目名, 则弹出input对话框
        const projectArray = tools.getAllprojects(filedata && filedata.path);
        vscode.window.showQuickPick(projectArray, {
            placeHolder: '请选择您的项目名称',
            ignoreFocusOut: true,
        }).then((name) => {
            name && dophinTask(taskName, useFullpath ? filedata.path : name, cwd, extra);
        });
    };

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json

    // dop server
    let dopServer = vscode.commands.registerCommand('extension.dopServer', (filedata) => {
        if (dopTerminal && dopTerminal.name === 'dophin') {
            dopTerminal.show();
            vscode.window.showWarningMessage('检测到已开启dophin终端, 是否销毁', CONST.buttonName.disposeWarning).then((selection) => {
                if (selection === CONST.buttonName.disposeWarning) {
                    dopTerminal.dispose();
                }
            });
            return;
        }

        // 判断不同context获取到的文件路径
        const fileStats = filedata && fs.statSync(filedata.path);
        let fileDir;
        if (fileStats && fileStats.isFile()) {
            fileDir = path.dirname(filedata.path);
        } else if (fileStats && fileStats.isDirectory()) {
            fileDir = filedata.path;
        } else {
            fileDir = '';
        }
        const projectName = tools.getProjectName(fileDir);

        // 启动服务方法
        const startServer = (name: string): void => {
            dopTerminal = vscode.window.createTerminal('dophin');
            dopTerminal.show();

            vscode.window.showInformationMessage('请选择dophin本地服务监听端口号', '80', '6666').then((port) => {
                if (!port) {
                    return;
                }
                if (port == '80') {
                    if (osType === 'Windows_NT') {
                        dopTerminal.sendText(`dop server ${name}`);
                    } else {
                        dopTerminal.sendText(`sudo dop server ${name}`);
                    }
                } else {
                    dopTerminal.sendText(`dop server ${name} --port ${port}`);
                }
            });
            // dopTerminal被dispose时销毁当前变量
            vscode.window.onDidCloseTerminal((event) => {
                if (dopTerminal) {
                    dopTerminal = null;
                }
            });
        };

        if (projectName) {
            startServer(projectName);
        } else {
            const projectArray = tools.getAllprojects(filedata && filedata.path);
            vscode.window.showQuickPick(projectArray, {
                placeHolder: '请选择您的项目名称',
                ignoreFocusOut: true,
            }).then((name) => {
                name && startServer(name);
            });
        }
    });

    // dop compile
    let dopCompile = vscode.commands.registerCommand('extension.dopCompile', (filedata) => {
        vscode.window.showWarningMessage('是否立即编译静态文件?', CONST.buttonName.compileWithUglify, CONST.buttonName.compileWithoutUglify).then((selection) => {
            switch (selection) {
                case CONST.buttonName.compileWithUglify:
                    dophinCommand(CONST.taskName.compile, filedata, { extra: '-e p' });
                    break;
                case CONST.buttonName.compileWithoutUglify:
                    dophinCommand(CONST.taskName.compile, filedata);
                    break;
                default:
                    break;
            }
        });
    });

    // dop deploy
    let dopDeploy = vscode.commands.registerCommand('extension.dopDeploy', (filedata) => {
        vscode.window.showWarningMessage('是否立即部署静态文件?', CONST.buttonName.deployWithUglify, CONST.buttonName.deployWithoutUglify).then((selection) => {
            switch (selection) {
                case CONST.buttonName.deployWithUglify:
                    dophinCommand(CONST.taskName.deploy, filedata, { extra: '-e p' });
                    break;
                case CONST.buttonName.deployWithoutUglify:
                    dophinCommand(CONST.taskName.deploy, filedata);
                    break;
                default:
                    break;
            }
        });
    });

    // dop format
    let dopFormat = vscode.commands.registerCommand('extension.dopFormat', (filedata) => {
        dophinCommand(CONST.taskName.format, filedata, { useFullpath: true });
    });

    context.subscriptions.push(dopServer, dopCompile, dopDeploy, dopFormat);
}

// this method is called when your extension is deactivated
export function deactivate() {
}