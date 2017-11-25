import { Instruction } from "../Instruction";
export declare class Done implements Instruction {
    readonly async: boolean;
    constructor();
    generateSource(stackControl: {
        push: Function;
        pop: Function;
    }): string;
}
