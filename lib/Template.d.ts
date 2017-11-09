/// <reference types="node" />
import events = require("events");
import { NHP } from "./NHP";
export declare class Template extends events.EventEmitter {
    private static echoElements;
    private static rawElements;
    private static $break;
    private _nhp;
    private _source;
    private _compiledScript;
    private _dirname;
    private _filename;
    private _compiler;
    constructor(filename: string, nhp: NHP);
    static encodeHTML(html: string, attr?: boolean): string;
    getSource(): string;
    isCompiled(): {
        runInContext: Function;
    };
    hasAsyncInstructions(): boolean;
    private compile();
    run(context: Object, out: NodeJS.WritableStream, callback: (err?: Error) => void, contextIsVMC?: boolean): void;
}
