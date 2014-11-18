@reference Instruction

class If implements Instruction {
	private _condition:String;
	
	constructor(condition:String) {
		this._condition = condition;
	}
	
	save():String {}
	
	load(data:String) {}
	
	generateSource(stack):String {
		stack.push();
		return "try{__if([[function(){return " + this._condition + ";}, [";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
	}
	
	async():boolean {
		return false;
	}
	
}

@main If