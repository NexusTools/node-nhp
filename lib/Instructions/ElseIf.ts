@reference Instruction

@nodereq vm
@nodereq nulllogger:logger
logger = logger("nhp");

class ElseIf implements Instruction {
	private _condition:String;
	
	constructor(condition:String) {
		try {
			vm.createScript("(" + condition + ")"); // Verify it compiles
		} catch(e) {
			logger.error(e);
			throw new Error("Failed to compile condition `" + condition + "`");
		}

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