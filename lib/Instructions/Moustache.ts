/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = log("nhp");

export class Moustache implements Instruction {
	private _source:string;
	private _attrib:boolean;
	private _raw:boolean;
	
	constructor(source:string, attrib:boolean, raw:boolean) {
		try {
			eval("(function(){return " + source + ";})"); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile source `" + source + "`");
		}
		
		this._source = source;
		this._attrib = attrib;
		this._raw = raw;
	}
	
	save():string {
		return this._source;
	}
	
	load(data:string) {}
	
	process(source:string) {
		this._source = source;
	}
	
	generateSource():string {
		var source = "try{__out.write(__string(" + this._source;
		if(this._attrib) {
			source += ",true";
			if(this._raw)
				source += ",true";
		} else if(this._raw)
			source += ",false,true";
		source += "));}catch(e){__out.write(__error(e";
		if(this._attrib) {
			source += ",true";
			if(this._raw)
				source += ",true";
		} else if(this._raw)
			source += ",false,true";
		source += "));};__next();";
		return source
	}
	
	run(runtime:Runtime, out:stream.Writable) {}
	
	async():boolean {
		return false;
	}
	
}