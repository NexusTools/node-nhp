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
				if(name == data) {
					name = name.substring(1, name.length-1);
					data = "";
				} else {
					data = data.substring(name.length+1, data.length-1);
					name = name.substring(1);
				}
                self._instructions.push(self._nhp.processingInstruction(name, data));
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
		var stack=[{
			first: true
		}];
		var stackControl = {
			push: function() {
				stack.push({
					first: stack[stack.length-1].first,
					pushed: true
				});
			},
			pop: function() {
				if(stack.length < 2)
					throw new Error("Cannot pop anymore frames from the stack...");
				
				stack.pop();
				stack[stack.length-1].popped = true;
			}
		};
		var source = "__series([";
		this._instructions.forEach(function(instruction) {
			var instructionSource = instruction.generateSource(stackControl);
			var frame = stack[stack.length-1];
			
			if(!frame.popped) {
				if(frame.first)
					frame.first = false;
				else
					source += ",";
			}
			if(frame.pushed)
				frame.first = true;
			
			if(!frame.popped)
				source += "function(__next){";
			else
				delete frame.popped;
			source += instructionSource;
			if(!frame.pushed)
				source += "}";
			else
				delete frame.pushed;
		});
		source += "], __done);";
		return source;
	}
	
	public optimize(constants:any, callback:Function) {
		var cBuffer = "";
		var optimized = [];
		this._instructions.forEach(function(instruction) {
			if(instruction instanceof Echo)
				cBuffer += instruction._data;
			else {
				if(cBuffer.length > 0) {
					optimized.push(new Echo(cBuffer));
					cBuffer = "";
				}
				optimized.push(instruction);
			}
		});
		if(cBuffer.length > 0)
			optimized.push(new Echo(cBuffer));
		this._instructions = optimized;
		callback();
	}
    
}

@main Compiler