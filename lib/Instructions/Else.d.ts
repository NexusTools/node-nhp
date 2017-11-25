import { Instruction } from "../Instruction";
export declare class Else implements Instruction {
    readonly usesStackControl: boolean;
    constructor();
    generateSource(stackControl: {
        push: Function;
        pop: Function;
    }): string;
}
