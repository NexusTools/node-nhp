@reference Instruction

@nodereq vm
@nodereq nulllogger:logger
logger = logger("nhp");

class Moustache implements Instruction {
	private _source:String;
	
	constructor(source:String) {
		try {
			vm.createScript(source); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile source `" + source + "`");
		}
		
		this._source = source;
	}
	
	save():String {
		return this._sources;
	}
	
	load(data:String) {}
	
	process(source:String) {
		this._source = source;
	}
	
	generateSource():String {
		return "try{" + this._source + ";}catch(e){__out.write(__error(e));};__next();";
	}
	
	run(runtime:Runtime, out:stream.Writable) {
		
	}
	
	async():boolean {
		return false;
	}
	
}

@main Moustache