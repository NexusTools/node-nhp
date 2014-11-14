@nodereq underscore:_
@nodereq path

@reference Instruction
@reference Resolver

@include Template

class NHP {
    private constants:Object;
	private templates:Array<Template> = {};
	private resolvers = {};
    
    public static create(constants:Object) {
        return new NHP(constants);
    }
    
    public constructor(constants:Object) {
		if(!(this instanceof NHP)) 
			return new NHP(constants);
		
        this.constants = constants || {};
    }

	public resolver(name:String):Resolver {
		if(!(name in this.resolvers))
			throw new Error("No resolver found with name `" + name + "`");
		return this.resolvers[name];
	}

	public installResolver(name:String, resolver:Resolver) {
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