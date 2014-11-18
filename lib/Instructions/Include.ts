@reference Instruction

@nodereq vm
@nodereq nulllogger:logger
logger = logger("nhp");

class Include implements Instruction {
	private _source:String;
	
	constructor(source) {
		try {
			vm.createScript("(" + source + ")"); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile source `" + source + "`");
		}
		
		this._source = source;
	}
	
	save():String {
	}
	
	load(data:String) {
	}
	
	process(source:String) {
	}
	
	generateSource(stack):String {
		var source = "try{__include(";
		source += this._source;
		source += ", __next);}catch(e){__out.write(__error(e));__next();};";
		return source;
	}
	
	run(runtime:Runtime, out:stream.Writable) {}
	
}

@main Include