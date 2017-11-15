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
    private _cache;
    constructor(filename: string, nhp: NHP);
    render(options: any, cb: (err?: Error, html?: string) => void): void;
    renderToStream(options: any, stream: NodeJS.WritableStream, cb: (err?: Error) => void): void;
    static encodeHTML(html: string, attr?: boolean): string;
    getSource(): string;
    isCompiled(): {
        runInContext: Function;
    };
    hasAsyncInstructions(): boolean;
    private compile();
    run(context: any, out: NodeJS.WritableStream, callback: (err?: Error) => void, contextIsVMC?: boolean): void;
}
