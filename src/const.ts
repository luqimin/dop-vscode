interface TaskName {
    init?: string;
    deploy?: string;
    compile?: string;
    server?: string;
    format?: string;
}

interface ButtonName {
    showLog?: string;
    confirmBtn?: string;
    disposeWarning?: string;
    deployWithUglify?: string;
    deployWithoutUglify?: string;
    compileWithUglify?: string;
    compileWithoutUglify?: string;
}

interface ConstantVariable {
    taskName: TaskName;
    buttonName: ButtonName;
}

const CONST: ConstantVariable = {
    taskName: {
        compile: 'compile',
        deploy: 'deploy',
        format: 'format',
    },
    buttonName: {
        showLog: '查看日志',
        confirmBtn: '确认',
        disposeWarning: '销毁当前终端',
        deployWithUglify: '部署(混淆)',
        deployWithoutUglify: '部署(不混淆)',
        compileWithUglify: '编译(混淆)',
        compileWithoutUglify: '编译(不混淆)',
    }
};

export default CONST;