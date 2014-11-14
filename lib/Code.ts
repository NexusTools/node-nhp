@nodereq vm

class Code {
	private _script;
	constructor(source:String, filename:String = "anonymous-vm") {
		this._script = vm.createScript(source, filename);
	}
	
	run(context:any):any {
		return this._script.runInContext(context);
	}
}

@main Code