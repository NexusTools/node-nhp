import { Instruction, StackControl } from "../Instruction";
export declare class Each implements Instruction {
    readonly async: boolean;
    private _eachOf;
    constructor(eachOf: string);
    generateSource(stackControl: StackControl): string;
}
