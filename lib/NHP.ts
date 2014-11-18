@nodereq underscore:_
@nodereq path

@reference Instruction

@include Template

@include Set
@include Add

@include Exec
@include JSON

@include Each
@include Done

@include If
@include ElseIf
@include Else
@include EndIf

@include Include

var extension = /\.\w+$/;
class NHP {
    private constants:Object;
	private templates:Array<Template> = {};
	private processors = {
		"set": function(data) {
			return new Set(data);
		},
		"add": function(data) {
			return new Add(data);
		},
		
		"exec": function(source) {
			return new Exec(source);
		},
		"json": function(source) {
			return new JSON(source);
		},
		
		"each": function(data) {
			return new Each(data);
		},
		"done": function() {
			return new Done();
		},
		
		"if": function(condition) {
			return new If(condition);
		},
		"elseif": function(condition) {
			return new ElseIf(condition);
		},
		"else": function() {
			return new Else();
		},
		"endif": function() {
			return new EndIf();
		},
		
		"include": function(file) {
			return new Include(file);
		}
	};
	private resolvers = {};
    
    public static create(constants:Object) {
        return new NHP(constants);
    }
    
    public constructor(constants:Object) {
		if(!(this instanceof NHP)) 
			return new NHP(constants);
		
        this.constants = constants || {};
    }

	public processingInstruction(name, data) {
		if(!(name in this.processors))
			throw new Error("No processor found with name `" + name + "`");
		return this.processors[name](data);
	}

	public resolver(name:String):Resolver {
		if(!(name in this.resolvers))
			throw new Error("No resolver found with name `" + name + "`");
		return this.resolvers[name];
	}

	public installResolver(name:String, resolver:Function/* => (calllback:Function => (err, value))*/) {
		this.resolvers[name] = resolver;
	}

    public setConstant(name, value) {
        if(this.hasConstant(name))
            throw new Error("Cannot redefine constants", name, value);
        this.constants[name] = value;
    }
    
    public hasConstant(name) {
        return name in this.constants;
    }
    
    public getConstant(name) {
        return this.constants[name];
    }
    
    public mixin(object:Object) {
		_.extend(this.constants, object);
    }

	public template(filename:String) {
		if(!extension.test(filename))
			filename += ".nhp";
		filename = path.resolve(filename);
		
		if(!(filename in this.templates))
			return this.templates[filename] = new Template(filename, this);
		
		return this.templates[filename];
	}
    
}

@main NHP