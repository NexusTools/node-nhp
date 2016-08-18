@nodereq nulllogger:logger
@nodereq vm

@reference Instruction

class MoustacheResolver implements Instruction {
	private _key:String;
	private _source:String;
	private _attrib:boolean;
	private _raw:boolean;
	
	constructor(key:String, attrib:boolean, raw:boolean) {
		this._key = key;
	}
	
	save():String {
		return this._key;
	}
	
	load(data:String) {}
	
	process(source:String) {
		this._source = source;
	}
	
	generateSource():String {
		var source = "try{__resolver(";
		source += JSON.stringify(this._key);
		source += ")(function(err, value){try{if(err){throw err;};__out.write(__string(value";
		if(this._attrib) {
			source += ",true";
			if(this._raw)
				source += ",true";
		} else if(this._raw)
			source += ",false,true";
		source += "));}catch(e){__out.write(__error(e";
		if(this._attrib) {
			source += ",true";
			if(this._raw)
				source += ",true";
		} else if(this._raw)
			source += ",false,true";
		source += "));};__next();});}catch(e){__out.write(__error(e";
		if(this._attrib) {
			source += ",true";
			if(this._raw)
				source += ",true";
		} else if(this._raw)
			source += ",false,true";
		source += "));__next();};";
		return source
	}
	
	run(runtime:Runtime, out:stream.Writable) {
		
	}
	
	async():boolean {
		return true;
	}
	
}

@main MoustacheResolver