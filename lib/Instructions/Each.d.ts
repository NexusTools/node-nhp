/// <reference types="node" />
import { Instruction } from "../Instruction";
import { Runtime } from "../Runtime";
import stream = require("stream");
export declare class Each implements Instruction {
    private _eachOf;
    constructor(eachOf: string);
    save(): string;
    load(data: string): void;
    process(source: String): void;
    generateSource(stackControl: {
        push: Function;
        pop: Function;
    }): string;
    run(runtime: Runtime, out: stream.Writable, callback: Function): void;
    async(): boolean;
}
