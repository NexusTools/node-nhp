/// <reference types="node" />
import stream = require("stream");
import { Instruction } from "./Instruction";
export declare class Runtime {
    private _instructions;
    private _context;
    constructor(instructions: Array<Instruction>, context: any);
    private static _apply(from, to);
    apply(data: any): void;
    mark(state: any): void;
    peek(): void;
    reset(): void;
    done(): void;
    include(file: String, sandbox?: boolean): any;
    run(out: stream.Writable): void;
}
