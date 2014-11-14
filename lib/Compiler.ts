@nodereq htmlparser2
@nodereq underscore:_
@nodereq stream
@nodereq async
@nodereq fs

@reference Instruction

@include Runtime

// Instructions
@include Moustache
@include MoustacheResolver
@include Echo

class Compiler {
	private static resolverRegex = /^\#/;
	private _instructions:Array<Instruction> = [];
    private _nhp;
    
    constructor(nhp) {
        this._nhp = nhp;
    }

	private static compileText(text:String, compiler, attrib:boolean = false) {
		var at = 0, next;
		while((next = text.indexOf("{{", at)) > -1) {
			var size;
			var raw;
			var end = -1;
			if(text.substring(next+2, next+3) == "{") {
				end = text.indexOf("}}}", next+(size = 3));
				raw = true;
			} else  {
				end = text.indexOf("}}", next+(size = 2));
				raw = false;
			}
			if(end < 0)
				break; // No end, just output the malformed code...
			
			if(next > at)
    			compiler._instructions.push(new Echo(text.substring(next, at)));
			
			var moustache = text.substring(next+size, end);
			if(Compiler.resolverRegex.test(moustache))
    			compiler._instructions.push(new MoustacheResolver(moustache.substring(1), attrib, raw));
			else
    			compiler._instructions.push(new Moustache(moustache, attrib, raw));
			at = end + size;
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
				throw new Error("Cannot handle");
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