@nodereq nulllogger:logger
@nodereq vm

@include Code
@reference Instruction

class Moustache implements Instruction {
	private _source:String;
	private _attrib:boolean;
	
	constructor(source:String, attrib:boolean) {
		try {
			vm.createScript(source); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile source `" + source + "`");
		}
		
		this._source = source;
		this._attrib = attrib;
	}
	
	save():String {
		return this._sources;
	}
	
	load(data:String) {}
	
	process(source:String) {
		this._source = source;
	}
	
	generateSource():String {
		var source = "try{__out.write(__string(" + this._source + "));}catch(e){__out.write(__error(e";
		if(this._attrib)
			source += ",true";
		source += "));};__next();";
		return source
	}
	
	run(runtime:Runtime, out:stream.Writable) {
		
	}
	
	async():boolean {
		return false;
	}
	
}

@main Moustache