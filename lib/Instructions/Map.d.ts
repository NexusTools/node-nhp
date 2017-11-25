import { Instruction } from "../Instruction";
export declare class Map implements Instruction {
    private _what;
    private _at;
    private _with;
    constructor(input: string);
    generateSource(): string;
}
