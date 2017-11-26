import { Instruction, StackControl } from "../Instruction";
export declare class Else implements Instruction {
    readonly usesStackControl: boolean;
    constructor();
    generateSource(stackControl: StackControl): string;
}
