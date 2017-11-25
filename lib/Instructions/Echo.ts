/// <reference types="node" />

import {Instruction} from "../Instruction";

export class Echo implements Instruction {
    _data: string;

    constructor(data: string) {
        this._data = data;
    }

    generateSource(): string {
        return "__out.write(" + JSON.stringify(this._data) + ");";
    }

}