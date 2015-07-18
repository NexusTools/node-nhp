@nodereq nulllogger:logger
@nodereq vm

@reference Instruction

class JSON implements Instruction {
	private _source:String;
	
	constructor(source:String, attrib:boolean, raw:boolean) {
		try {
			vm.createScript(this._source = source); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile source `" + source + "`");
		}
	}
	
	save():String {
		return this._sources;
	}
	
	load(data:String) {}
	
	process(source:String) {
		this._source = source;
	}
	
	generateSource():String {
		var source = "try{__out.write(JSON.stringify(" + this._source;
		source += "));}catch(e){__out.write(__error(e";
		source += "));};__next();";
		return source;
	}
	
	run(runtime:Runtime, out:stream.Writable) {
		
	}
	
	async():boolean {
		return false;
	}
	
}

@main JSON