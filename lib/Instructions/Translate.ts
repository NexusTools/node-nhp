/// <reference types="node" />

import {Instruction} from "../Instruction";

export class Translate implements Instruction {
    private _data: string;

    constructor(data: string) {
        this._data = data;
    }

    generateSource(): string {
        return "__out.write(__(" + JSON.stringify(this._data) + "));";
    }

}