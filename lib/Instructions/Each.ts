@reference Instruction

class Each implements Instruction {
	private _eachOf:String;
	
	constructor(eachOf:String) {
		this._eachOf = eachOf;
	}
	
	save():String {}
	
	load(data:String) {}
	
	process(source:String) {
		throw new Error("This instruction can't process data");
	}
	
	generateSource(stack):String {
		stack.push();
		return "try{__each(" + this._eachOf + ", function(entry, __next) {__series([";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
	}
	
	async():boolean {
		return false;
	}
	
}

@main Each