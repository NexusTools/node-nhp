import { Instruction } from "../Instruction";
export declare class MoustacheResolver implements Instruction {
    private _key;
    private _source;
    private _attrib;
    private _raw;
    constructor(key: string, attrib: boolean, raw: boolean);
    process(source: string): void;
    generateSource(): string;
}
