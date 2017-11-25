import { Instruction } from "../Instruction";
export declare class Echo implements Instruction {
    _data: string;
    constructor(data: string);
    generateSource(): string;
}
