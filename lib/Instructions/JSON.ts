/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = new log("nhp");

export class JSON implements Instruction {
	private _source:string;
	
	constructor(source:string) {
		try {
			if(!global.JSON.stringify(this._source = source))
				throw new Error("Could not parse source");
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile source `" + source + "`");
		}
	}
	
	save():string {
		return this._source;
	}
	
	load(data:string) {
		this._source = data;
	}
	
	process(source:string) {
		this._source = source;
	}
	
	generateSource():string {
		var source = "try{__out.write(JSON.stringify(" + this._source;
		source += "));}catch(e){__out.write(__error(e";
		source += "));};__next();";
		return source;
	}
	
	run(runtime:Runtime, out:stream.Writable) {
		
	}
	
	async():boolean {
		return false;
	}
	
}