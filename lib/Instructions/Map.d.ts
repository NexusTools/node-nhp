/// <reference types="node" />
import { Instruction } from "../Instruction";
import { Runtime } from "../Runtime";
import stream = require("stream");
export declare class Map implements Instruction {
    private _what;
    private _at;
    private _with;
    constructor(input: string);
    save(): string;
    load(data: string): void;
    process(source: string): void;
    generateSource(): string;
    run(runtime: Runtime, out: stream.Writable, callback: Function): void;
    async(): boolean;
}
