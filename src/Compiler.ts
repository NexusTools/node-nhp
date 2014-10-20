@include Instruction
@nodereq htmlparser2

class Compiler {
    private nhp;
    
    private blocks = [];
    private silence = false;
    private context:Object = {};
    
    constructor(nhp) {
        this.nhp = nhp;
    }
    
    public setContext(context:Object) {
        this.context = context;
    }
    
    public compile(source, callback) {
        
    }
    
    public writeString(data) {
    }

    public writeVar(name) {
    }

    public startBlock(conditionResult) {
    }
    public elseBlock(conditionResult) {
    }
    public endBlock() {
    }
    
}

@main Compiler