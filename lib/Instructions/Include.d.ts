import { Instruction } from "../Instruction";
export declare class Include implements Instruction {
    readonly async: boolean;
    private _source;
    private _root;
    constructor(source: string, root?: string);
    generateSource(): string;
}
