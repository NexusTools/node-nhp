@reference Instruction

class Include implements Instruction {
	private _file:String;
	
	constructor(file) {
		this._file = file;
	}
	
	save():String {
	}
	
	load(data:String) {
	}
	
	process(source:String) {
	}
	
	generateSource(stack):String {
		stack.pop();
		var source = "try{__include(";
		source += JSON.stringify(this._file);
		source += ", __out, __next);}catch(e){__out.write(__error(e));__next();};";
		return source;
	}
	
	run(runtime:Runtime, out:stream.Writable) {
		runtime.include(this._file);
	}
	
}

@main Include