@reference Instruction

@nodereq vm
@nodereq nulllogger:logger
logger = logger("nhp");

var short = /^([^\s]+)\s([^\s]+)\s*$/;
var syntax = /^([^\s]+)\s([^\s]+)\s(.+)$/;
class Map implements Instruction {
	private _what:String;
	private _at:String;
	private _with:String;
	
	constructor(input:String) {
		var parts = input.match(syntax);
		if(!parts) {
			parts = input.match(short);
			if(!parts)
				throw new Error("Invalid <?map sytnax");
			parts[3] = "{}";
		}
		this._what = parts[1];
		this._at = parts[2];
		this._with = parts[3];
		
		try {
			vm.createScript("(" + this._with + ")"); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile with `" + this._with + "`");
		}
	}
	
	save():String {}
	load(data:String) {}
	
	process(source:String) {
		throw new Error("This instruction can't process data");
	}
	
	generateSource(stack):String {
		return "try{__map(" + JSON.stringify(this._what) + ", " + JSON.stringify(this._at) + ", " + this._with + ");__next();}catch(e){__out.write(__error(e));__next();};";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
	}
	
	async():boolean {
		return false;
	}
	
}

@main Map