import { exec } from 'child_process';

interface DophinTools {
    getProjectName: (path: string) => string;
    dophinTask: (taskname: string, name: string, cwd: string) => Promise<string>;
}

const dophinTools: DophinTools = {
    getProjectName(path = '') {
        const reg = /project\/([\w-]+)/;
        const regResult = reg.exec(path);
        return regResult && regResult[1] || '';
    },
    dophinTask(taskname, name, cwd) {
        return new Promise((resolve, reject) => {
            exec(`dop ${taskname} ${name}`, {
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