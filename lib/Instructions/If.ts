/// <reference path="../../node_modules/@types/node/index.d.ts" />
import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import log = require("nulllogger");
import stream = require("stream");

var logger = log("nhp");

export class If implements Instruction {
	private _condition:string;
	
	constructor(condition:string) {
		try {
			eval("(function(){return " + condition + ";})"); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile condition `" + condition + "`");
		}
		
		this._condition = condition;
	}
	
	process(source:string) {
		throw new Error("This instruction can't process data");
	}
	
	save():string {
		return this._condition;
	}
	
	load(data:string) {
		this._condition = data;
	}
	
	generateSource(stackControl:{push:Function, pop:Function}):string {
		stackControl.push();
		return "try{__if([[function(){return " + this._condition + ";}, [";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
	}
	
	async():boolean {
		return false;
	}
	
}