import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

interface DophinTools {
    getProjectName: (path: string) => string;
    getAllprojects: (path: string) => string[];
    dophinTask: (taskname: string, name: string, cwd: string, extraOption: string) => Promise<string>;
}

let projectArrCache: string[];

const dophinTools: DophinTools = {
    getProjectName(_path = '') {
        const reg = /project\/([\w-]+)/;
        const regResult = reg.exec(_path);
        return regResult && regResult[1] || '';
    },
    getAllprojects(_path) {
        if (projectArrCache) {
            return projectArrCache;
        }
        const reg = /(.+\/project)\/\w+/;
        const regResult = reg.exec(_path);
        let projectPath = regResult && regResult[1];
        let projectArr: string[] = [];
        if (!projectPath) {
            const rootPath = vscode.workspace.rootPath;
            const files = fs.readdirSync(rootPath);
            if (files.indexOf('do.config.js') === -1) {
                vscode.window.showErrorMessage('当前 workspace 找不到 do.config.js ！');
            } else {
                projectPath = path.resolve(rootPath, 'project');
            }
        }
        const dirs: string[] = projectPath && fs.readdirSync(projectPath) || [];
        projectArr = dirs.filter((dir) => dir.indexOf('.') === -1);
        projectArrCache = projectArr;
        return projectArr;
    },
    dophinTask(taskname, name, cwd, extraOption) {
        return new Promise((resolve, reject) => {
            exec(`dop ${taskname} ${name} ${extraOption}`, {
                cwd,
                encoding: 'utf8',
                maxBuffer: 1000 * 1024,
            }, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res);
            });
        });

    }
};

export default dophinTools;