/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime";

import stream = require("stream");

export class Translate implements Instruction {
	private _data:string;
	
	constructor(data:string) {
		this._data = data;
	}
	
	save():string {
		return this._data;
	}
	
	load(data:string) {
		this._data = data;
	}
	
	process(source:string) {
		throw new Error("This instruction can't process data");
	}
	
	generateSource():string {
		return "__out.write(__(" + JSON.stringify(this._data) + "));__next();";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
		out.write(this._data);
		callback();
	}
	
	async():boolean {
		return false;
	}
	
}