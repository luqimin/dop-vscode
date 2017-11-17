interface TaskName {
    init?: string;
    deploy?: string;
    compile?: string;
    server?: string;
    format?: string;
}

interface ButtonName {
    showLog?: string
    confirmBtn?: string
    disposeWarning?: string
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
    }
};

export default CONST;