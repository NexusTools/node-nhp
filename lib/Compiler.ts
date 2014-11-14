@nodereq htmlparser2
@nodereq underscore:_
@nodereq stream
@nodereq async
@nodereq fs

@reference Instruction

@include Runtime

// Instructions
@include Moustache
@include Echo

class Compiler {
    private _nhp;
	private _instructions:Array<Instruction> = [];
    
    constructor(nhp) {
        this._nhp = nhp;
    }

	private static compileText(text:String, compiler, attrib:boolean = false) {
		var at = 0, next;
		while((next = text.indexOf("{{", at)) > -1) {
			var end = text.indexOf("}}", next+2);
			if(end < 0)
				break; // No end, just output the malformed code...
			
			if(next > at)
    			compiler._instructions.push(new Echo(text.substring(next, at)));
    		compiler._instructions.push(new Moustache(text.substring(next+2, end), attrib));
			at = end + 2;
		}
		if(at < text.length)
    		compiler._instructions.push(new Echo(text.substring(at)));
	}
    
    public compile(source:String, callback:Function) {
        if(_.isString(source))
            source = new stream.Buffer(source);
        else if(!(source instanceof stream.Readable))
            throw "Source must be a readable stream or a string";
        
		var self = this;
        var parser = new htmlparser2.Parser({
            onopentag: function(name, attribs){
				console.log("onopentag", arguments);
				
				self._instructions.push(new Echo("<" + name));
                for(var key in attribs) {
                    self._instructions.push(new Echo(" " + key + "=\""));
					Compiler.compileText(attribs[key], self, true);
                    self._instructions.push(new Echo("\""));
                }
                self._instructions.push(new Echo(">"));
            },
            ontext: function(text){
				console.log("ontext", arguments);
				Compiler.compileText(text, self);
            },
            onclosetag: function(name){
				console.log("onclosetag", arguments);
				
                self._instructions.push(new Echo("</" + name + ">"));
            },
            onprocessinginstruction: function(name, data) {
				console.log("onprocessinginstruction", arguments);
            },
            onerror: function(err) {
				console.log("onerror", arguments);
				callback(err);
			},
            onend: function() {
				console.log("onend", arguments);
				callback();
            }
        });
        source.pipe(parser);
    }

	public generateSource() {
		var first = true;
		var source = "__series([";
		this._instructions.forEach(function(instruction) {
			if(first)
				first = false;
			else
				source += ",";
			
			source += "function(__next){";
			source += instruction.generateSource();
			source += "}";
		});
		source += "], __done);";
		return source;
	}
	
	public optimize(constants:any, callback:Function) {
		// TODO: Implement optimizations
		callback();
	}
    
}

@main Compiler