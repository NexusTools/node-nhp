import { Instruction } from "../Instruction";
export declare class JSON implements Instruction {
    private _source;
    constructor(source: string);
    generateSource(): string;
}
