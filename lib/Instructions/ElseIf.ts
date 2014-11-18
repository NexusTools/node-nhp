@reference Instruction

class ElseIf implements Instruction {
	private _condition:String;
	
	constructor(condition:String) {
		this._condition = condition;
	}
	
	save():String {}
	
	load(data:String) {}
	
	generateSource(stack):String {
		stack.pop();
		stack.push();
		return "]],[function(){" + this._condition + ";}, [";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
	}
	
	async():boolean {
		return false;
	}
	
}

@main ElseIf