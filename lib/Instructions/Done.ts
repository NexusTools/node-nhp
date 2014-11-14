@reference Instruction

class Done implements Instruction {
	constructor() {}
	
	save():String {}
	
	load(data:String) {}
	
	process(source:String) {
		throw new Error("This instruction can't process data");
	}
	
	generateSource(stack):String {
		stack.pop();
		return "], __next);}, __next);}catch(e){__out.write(__error(e));__next();};";
	}
	
	run(runtime:Runtime, out:stream.Writable, callback:Function) {
	}
	
	async():boolean {
		return false;
	}
	
}

@main Done