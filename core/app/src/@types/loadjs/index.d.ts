declare module 'loadjs' {



    interface ILoadJsReadyInstance {
        ready: (id: string, callback: () => void) => ILoadJsReadyInstance
    }

    interface ILoadInstance extends ILoadJsReadyInstance {
        ready: (id: string, callback: () => void) => ILoadJsReadyInstance
    }

    const loadjs: (path: string | string[], callbackOrOptions: (() => void) | {
        success?: () => void,
        error?: (pathsNotFound: string[]) => void,
        before?: (path: string, scriptEl: HTMLScriptElement) => boolean
    }) => void;

    export default loadjs;
}