@reference Instruction

/*
	The base of all <?logic ...?> instructions
*/
class Logic implements Instruction {
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

@main Logic