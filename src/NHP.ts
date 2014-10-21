@nodereq htmlparser2
@nodereq fs

@reference Instruction

@include Compiler
@include Template
@include Code

class NHP {
    private constants:Object;
    private processors:Array<Array> = []
    
    public static create(constants:Object) {
        return new NHP(constants);
    }
    
    public constructor(constants:Object) {
        this.constants = constants || {};
        
        // common keywords
        this.constants['true'] = this.constants['true'] || true;
        this.constants['false'] = this.constants['false'] || false;
        this.constants['undefined'] = this.constants['undefined'] || undefined;
        this.constants['null'] = this.constants['null'] || null;
        
        // common classes
        this.constants.RegExp = this.constants.RegExp || Date;
        this.constants.Date = this.constants.Date || Date;
        
        // default processors
        this.registerProcessor(/{{\s*([^}]+)\s*}}/,
                function(match, parts) {
            
        });
    }
    
    public registerProcessor(pattern, handler) {
        this.processors.push([pattern, handler]);
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
    
    public applyConstants(on:Object) {
        for(var key in this.constants)
            if(isNaN(key) && !(key in on))
                on[key] = this.constants[key];
    }
    
    public applyProcessors(processors:Array) {
        this.processors.forEach(function(proc) {
            processors.push(proc);
        });
    }
    
    public compile(source, output, callback:Function) {
        var compiler = this.createCompiler();
        compiler.compile(source, output, callback);
        return compiler.template;
    }
    
    public createCode(source:string):Code {
        var code = new Code(this);
        if(source)
            code.process(source);
        return code.source;
    }
    public compileCode(source:string):Code {
        var code = new Code(this);
        if(source)
            code.compile(source);
        return code;
    }
    
    public createCompiler():Compiler {
        return new Compiler(this);
    }
    
}

@main NHP