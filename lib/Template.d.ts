/// <reference types="node" />
import events = require("events");
import { NHP } from "./NHP";
export declare class Template extends events.EventEmitter {
    private static echoElements;
    private static rawElements;
    private static $break;
    private _nhp;
    private _source;
    private _compiledSource;
    private _compiledVariables;
    private _compiledScript;
    private _dirname;
    private _filename;
    private _compiler;
    private _fswatcher;
    private _cache;
    constructor(filename: string, nhp: NHP, mutable?: boolean);
    /**
     * Render this template and return HTML.
     *
     * @param locals The locals to use for rendering
     * @param cb The callback
     */
    render(locals: any, cb: (err?: Error, html?: string) => void): void;
    /**
     * Render this template to a stream.
     *
     * @param locals The locals to use for rendering
     * @param stream The target stream
     * @param cb The callback
     */
    renderToStream(locals: any, stream: NodeJS.WritableStream, cb: (err?: Error) => void): void;
    static encodeHTML(html: string, attr?: boolean): string;
    /**
     * Get the last successfully generated JavaScript source for this template.
     *
     * @returns The source, or undefined if not compiled yet or an error occured.
     */
    getSource(): string;
    /**
     * Check whether this template has been compiled or not.
     *
     * @returns True if compiled, False otherwise.
     */
    isCompiled(): boolean;
    private compile();
    protected run(context: any, out: NodeJS.WritableStream, callback: (err?: Error) => void): void;
    destroy(): void;
}
