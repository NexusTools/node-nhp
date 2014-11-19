@nodereq htmlparser2
@nodereq nulllogger:logger
@nodereq underscore:_
@nodereq domain
@nodereq stream
@nodereq async
@nodereq fs

@reference Instruction

@include Runtime

// Instructions
@include Moustache
@include MoustacheResolver
@include Echo

logger = logger("nhp");

class Compiler {
	private static resolverRegex = /^\#/;
	private static logicRegex = /^\?.+\?$/;
	private _instructions:Array<Instruction> = [];
    private _nhp;

	// https://github.com/fb55/htmlparser2/blob/748d3da71dc664afb8357aabfe6c4a6f74644a0e/lib/Parser.js#L59
	private static voidElements = [
		"area",
		"base",
		"basefont",
		"br",
		"col",
		"command",
		"embed",
		"frame",
		"hr",
		"img",
		"input",
		"isindex",
		"keygen",
		"link",
		"meta",
		"param",
		"source",
		"track",
		"wbr",

		//common self closing svg elements
		"path",
		"circle",
		"ellipse",
		"line",
		"rect",
		"use",
		"stop",
		"polyline",
		"polygone"
	];

	public static isVoidElement(el) {
		return Compiler.voidElements.indexOf(el) > -1;
	}
    
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
		var self = this;
		var d = domain.create();
		d.run(function() {
			if(_.isString(source))
				source = new stream.Buffer(source);
			else if(!(source instanceof stream.Readable))
				throw "Source must be a readable stream or a string";
			else
				d.add(source);
			
			var parser = new htmlparser2.Parser({
				onopentag: function(name, attribs){
					logger.gears("onopentag", arguments);

					self._instructions.push(new Echo("<" + name));
					for(var key in attribs) {
						self._instructions.push(new Echo(" " + key + "=\""));
						Compiler.compileText(attribs[key], self, true);
						self._instructions.push(new Echo("\""));
					}
					if(Compiler.isVoidElement(name))
						self._instructions.push(new Echo(" />"));
					else
						self._instructions.push(new Echo(">"));
				},
				ontext: function(text){
					logger.gears("ontext", arguments);
					Compiler.compileText(text, self);
				},
				onclosetag: function(name){
					logger.gears("onclosetag", arguments);
					if(!Compiler.isVoidElement(name))
						self._instructions.push(new Echo("</" + name + ">"));
				},
				onprocessinginstruction: function(name, data) {
					try {
						logger.gears("onprocessinginstruction", arguments);
						if(Compiler.logicRegex.test(data)) {
							if(name == data) {
								name = name.substring(1, name.length-1);
								data = "";
							} else {
								data = data.substring(name.length+1, data.length-1);
								name = name.substring(1);
							}
							self._instructions.push(self._nhp.processingInstruction(name, data));
						} else
							self._instructions.push(new Echo("<" + data + ">"));
					} catch(e) {
						logger.warning(e);
						self._instructions.push(new Echo("<error>" + Template.encodeHTML(""+e) + "</error>"));
					}
				},
				oncomment: function(data) {
					logger.gears("oncomment", arguments);
					self._instructions.push(new Echo("<!--" + data + "-->"));
				},
				oncommentend: function() {
					logger.gears("oncommentend", arguments);
				},
				onerror: function(err) {
					logger.gears("onerror", arguments);
					callback(err);
				},
				onend: function() {
					logger.gears("onend", arguments);
					callback();
				}
			});
			d.on("error", function(err) {
				logger.warning(err);
				source.unpipe(parser);
				callback(err);
			});
			source.pipe(parser);
		});
    }

	public generateSource() {
		var stack=[{
			first: true
		}];
		var stackControl = {
			push: function() {
				var frame = stack[stack.length-1];
				stack.push({
					first: frame.first,
					popped: frame.popped,
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
			logger.gears(instruction.constructor.name);
			
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