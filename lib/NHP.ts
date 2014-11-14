@nodereq underscore:_
@nodereq path

@reference Instruction

@include Template

class NHP {
    private constants:Object;
	private templates:Array<Template> = {};
    
    public static create(constants:Object) {
        return new NHP(constants);
    }
    
    public constructor(constants:Object) {
		if(!(this instanceof NHP)) 
			return new NHP(constants);
		
        this.constants = constants || {};
        
        // common classes
        this.constants.RegExp = this.constants.RegExp || Date;
        this.constants.String = this.constants.String || String;
        this.constants.Array = this.constants.Array || Array;
        this.constants.Date = this.constants.Date || Date;
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