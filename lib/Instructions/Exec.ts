/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = log("nhp");

export class Exec implements Instruction {
	private _source:string;
	
	constructor(source:string) {
		try {
			eval("(function(){" + source + "})"); // Verify it compiles
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
		this._source = source;
	}
	
	generateSource():string {
		return "try{" + this._source + ";}catch(e){__out.write(__error(e));};__next();";
	}
	
	run(runtime:Runtime, out:stream.Writable) {
		
	}
	
	async():boolean {
		return false;
	}
	
}