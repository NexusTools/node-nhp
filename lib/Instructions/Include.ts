@reference Instruction

class Include implements Instruction {
	private _file:String;
	
	constructor() {
	}
	
	save():String {
	}
	
	load(data:String) {
	}
	
	process(source:String) {
	}
	
	run(runtime:Runtime, out:stream.Writable) {
		runtime.include(this._file);
	}
	
}

@main Include