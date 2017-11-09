/// <reference types="node" />
import { Instruction } from "../Instruction";
import { Runtime } from "../Runtime";
import stream = require("stream");
export declare class If implements Instruction {
    private _condition;
    constructor(condition: string);
    process(source: string): void;
    save(): string;
    load(data: string): void;
    generateSource(stackControl: {
        push: Function;
        pop: Function;
    }): string;
    run(runtime: Runtime, out: stream.Writable, callback: Function): void;
    async(): boolean;
}
