import { Instruction } from "../Instruction";
export declare class Translate implements Instruction {
    private _data;
    constructor(data: string);
    generateSource(): string;
}
