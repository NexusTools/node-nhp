@noautocompile

interface Instruction {
	save():any;
	load(data:any);
	
	process(source:String);
	generateSource():String;
	run(runtime:Runtime, out:stream.Writable, callback:Function);
	async():boolean;
}