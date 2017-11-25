import { Instruction } from "../Instruction";
export declare class Set implements Instruction {
    private _what;
    private _to;
    constructor(input: string);
    generateSource(): string;
}
