@reference Instruction

class Echo implements Instruction {
	private _data:String;
	
	constructor(data:String) {
		this._data = data;
	}
	
	save():String {
		return this._data;
	}
	
	load(data:String) {
		this._data = data;
	}
	
	process(source:String) {
		throw new Error("This instruction can't process data");
	}
	
	generateSource():String {
		return "__out.write(" + JSON.stringify(this._data) + ");__next();";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
		out.write(this._data);
		callback();
	}
	
	async():boolean {
		return false;
	}
	
}

@main Echo