import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

interface DophinTools {
    getProjectName: (path: string) => string;
    getAllprojects: (path: string) => string[];
    getDeployTaskName: (path: string) => Promise<string[]>;
    dophinTask: (taskname: string, name: string, cwd: string, extraOption: string) => Promise<string>;
}

let projectArrCache: string[],
    deployTaskNameCache: string[];

// 获取do.config.js文件位置
const getConfig = (curPath: string): string => {
    let configFilePath: string;
    const currentFiles: string[] = fs.readdirSync(curPath);
    for (const file of currentFiles) {
        if (file === 'do.config.js') {
            return path.resolve(curPath, file);
        }
    }
    return configFilePath;
};
// 往上级查找config文件
const findConfigFile = (curPath: string, cb?: (res: string) => void) => {
    if (!curPath || curPath === '/' || curPath.length < 5) {
        cb && cb('');
    }
    const curConfig = getConfig(curPath);
    if (curConfig) {
        cb && cb(curConfig);
    } else {
        findConfigFile(path.resolve(curPath, '../'), cb);
    }
};

const asyncFindConfigFile = (curPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        findConfigFile(curPath, (res) => {
            resolve(res);
        });
    });
}

const dophinTools: DophinTools = {
    getProjectName(_path: string = '') {
        const reg = /project\/([\w-]+)/;
        const regResult = reg.exec(_path);
        return regResult && regResult[1] || '';
    },
    getAllprojects(_path: string) {
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
    async getDeployTaskName(_path: string = vscode.workspace.rootPath) {
        if (deployTaskNameCache) {
            return deployTaskNameCache;
        }
        if (fs.statSync(_path).isFile()) {
            _path = path.dirname(_path);
        }
        const globalConfigFile = await asyncFindConfigFile(_path);
        const config = fs.existsSync(globalConfigFile) && require(globalConfigFile) || {};
        const { deploy = {} } = config;
        return Object.keys(deploy);
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