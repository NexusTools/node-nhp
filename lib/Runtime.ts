@nodereq vm
@nodereq async
@nodereq stream

@reference Instruction

class Runtime {
	private _instructions:Array<Instruction>;
	private _context:any;

	constructor(instructions:Array<Instruction>, context:any) {
		this._instructions = instructions;
		this._context = context || vm.createContext();
	}

	private static _apply(from:any, to:any) {
	}

	apply(data:any) {
		Runtime._apply(data, this._context);
	}

	/*
		Marks the current cursor location
	*/
	mark(state:any) {
	}

	// Returns the current marked state, if any
	peek() {
	}

	/*
		Resets to the last marked location, returns the last state
	*/
	reset() {
	}

	/*
		Clears the last marked location, returns the last state
	*/
	done() {
	}
	
	/**
		Includes a file onto the runtime

		@param file File to include
		@param sandbox Whether or not to merge runtime contexts
	*/
	include(file:String, sandbox:boolean = false):any {
	}

	/*
		Runs the instructions in this runtime
	*/
	run(out:stream.Writable) {
		var self = this;
		/*this._instructions.forEach(function(instruction:Instruction) {
			instruction.run(self, out);
		});*/
	}
	
}

@main Runtime