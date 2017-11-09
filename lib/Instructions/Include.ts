/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = new log("nhp");

export class Include implements Instruction {
	private _source:string;
	
	constructor(source:string) {
		try {
			eval("(function(){return " + source + ";})"); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile source `" + source + "`");
		}
		
		this._source = source;
	}
	
	save():string {
		return this._source;
	}
	
	load(data:string) {
		this._source = data;
	}
	
	process(source:string) {
		throw new Error("This instruction cannot process data...");
	}
	
	generateSource():string {
		var source = "try{__include(";
		source += this._source;
		source += ", __next);}catch(e){__out.write(__error(e));__next();};";
		return source;
	}
	
	run(runtime:Runtime, out:stream.Writable) {}
	
	async():boolean {
		return false;
	}
	
}