@reference Instruction

@nodereq vm
@nodereq nulllogger:logger
logger = logger("nhp");

var syntax = /^([^\s]+)\s(.+)$/;
class Set implements Instruction {
	private _what:String;
	private _to:String;
	
	constructor(input:String) {
		var parts = input.match(syntax);
		if(!parts)
			throw new Error("Invalid <?add sytnax");
		this._what = parts[2];
		this._to = parts[1];
		
		try {
			vm.createScript("(" + this._what + ")"); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile source `" + this._what + "`");
		}
	}
	
	save():String {}
	
	load(data:String) {}
	
	process(source:String) {
		throw new Error("This instruction can't process data");
	}
	
	generateSource(stack):String {
		return "try{__add(" + JSON.stringify(this._to) + ", " + this._what + ");__next();}catch(e){__out.write(__error(e));__next();};";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
	}
	
	async():boolean {
		return false;
	}
	
}

@main Set