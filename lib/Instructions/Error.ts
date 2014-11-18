@nodereq nulllogger:logger
@nodereq vm

@reference Instruction

class Error implements Instruction {
	private _message:String;
	
	constructor(message:String) {
		if(message instanceof Error)
			this._message = message.message;
		else
			this._message = message;
	}
	
	save():String {
		return this._message;
	}
	
	load(data:String) {}
	
	generateSource():String {
		source += "__out.write(__error(";
		source += JSON.stringify(this._message);
		if(this._attrib)
			source += ",true";
		source += "));__next();";
		return source
	}
	
	run(runtime:Runtime, out:stream.Writable) {
		
	}
	
	async():boolean {
		return false;
	}
	
}

@main Moustache