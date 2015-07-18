@reference Instruction

class Else implements Instruction {
	constructor() {}
	
	save():String {}
	load(data:String) {}
	
	generateSource(stack):String {
		stack.pop();
		stack.push();
		return "]],[function(){return true;}, [";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {}
	
	async():boolean {
		return false;
	}
	
}

@main Else