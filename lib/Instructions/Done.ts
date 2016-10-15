/// <reference path="../../node_modules/@types/node/index.d.ts" />
import {Instruction} from "../Instruction";
import {Runtime} from "../Runtime"

import stream = require("stream")

export class Done implements Instruction {
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
		return "], __next);}, __next);}catch(e){__out.write(__error(e));__next();};";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
	}
	
	async():boolean {
		return false;
	}
	
}