import { Instruction } from "../Instruction";
export declare class EndIf implements Instruction {
    readonly usesStackControl: boolean;
    constructor();
    generateSource(stackControl: {
        push: Function;
        pop: Function;
    }): string;
}
