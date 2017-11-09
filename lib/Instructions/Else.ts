/// <reference types="node" />

import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime";

import stream = require("stream");

export class Else implements Instruction {
	constructor() {}
	
	save():string {
		return "";
	}
	load(data:string) {}
	
	process(source:string) {
		throw new Error("This instruction can't process data");
	}
	
	generateSource(stackControl:{push:Function, pop:Function}):string {
		stackControl.pop();
		stackControl.push();
		return "]],[function(){return true;}, [";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {}
	
	async():boolean {
		return false;
	}
	
}