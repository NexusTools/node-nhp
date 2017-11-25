import { Instruction } from "../Instruction";
export declare class Exec implements Instruction {
    private _source;
    constructor(source: string);
    generateSource(): string;
}
