import { Instruction, StackControl } from "../Instruction";
export declare class EndIf implements Instruction {
    readonly usesStackControl: boolean;
    constructor();
    generateSource(stackControl: StackControl): string;
}
