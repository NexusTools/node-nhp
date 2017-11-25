import { Instruction } from "../Instruction";
export declare class Moustache implements Instruction {
    private _source;
    private _attrib;
    private _raw;
    constructor(source: string, attrib: boolean, raw: boolean);
    generateSource(): string;
}
