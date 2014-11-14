@nodereq underscore:_
@nodereq path

@reference Instruction

@include Template

@include Each
@include Done

@include If
@include ElseIf

class NHP {
    private constants:Object;
	private templates:Array<Template> = {};
	private processors = {
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
		"endif": function() {
			return new Done();
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
		filename = path.resolve(filename);
		
		if(!(filename in this.templates))
			return this.templates[filename] = new Template(filename, this);
		
		return this.templates[filename];
	}
    
}

@main NHP