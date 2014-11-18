@reference Instruction

var extension = /\.\w+$/;
class Include implements Instruction {
	private _file:String;
	
	constructor(file) {
		if(!extension.test(file))
			file += ".nhp";
		this._file = file;
	}
	
	save():String {
	}
	
	load(data:String) {
	}
	
	process(source:String) {
	}
	
	generateSource(stack):String {
		var source = "try{__include(";
		source += JSON.stringify(this._file);
		source += ", __next);}catch(e){__out.write(__error(e));__next();};";
		return source;
	}
	
	run(runtime:Runtime, out:stream.Writable) {}
	
}

@main Include