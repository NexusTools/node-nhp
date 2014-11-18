@reference Instruction

var syntax = /^([^\s]+)\s(.+)$/;
class Set implements Instruction {
	private _what:String;
	private _to:String;
	
	constructor(input:String) {
		var parts = input.match(syntax);
		if(!parts)
			throw new Error("Invalid <?Set sytnax");
		this._what = parts[1];
		this._to = parts[2];
	}
	
	save():String {}
	
	load(data:String) {}
	
	process(source:String) {
		throw new Error("This instruction can't process data");
	}
	
	generateSource(stack):String {
		return "try{__global['" + this._what + "']=" + this._to + ";__next();}catch(e){__out.write(__error(e));__next();};";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
	}
	
	async():boolean {
		return false;
	}
	
}

@main Set