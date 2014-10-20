@nodereq htmlparser2
@nodereq fs

@include Compiler
@include Template

class NHP {
    private constants:Object;
    
    public constructor(constants:Object) {
        this.constants = constants || {};
    }
    
    public compile(source:string, callback:Function, context:Object) {
        var compiler = this.createCompiler();
        compiler.setContext(context);
        
        compiler.compile(source, callback);
    }
    
    public createCompiler():Compiler {
        return new Compiler(this);
    }
    
}

@main NHP