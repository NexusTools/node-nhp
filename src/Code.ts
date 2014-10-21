@target ES5

@include Instruction

class StackFrame {
    private _last:any;
    private _value:any;
    private _op:Function;
    
    get value():any {
        return this._value;
    }
    
    private static _operators:Array<Function> = {
        "*": function(left, right) {
            return left * right;
        },
        "+": function(left, right) {
            return left + right;
        },
        "-": function(left, right) {
            return left - right;
        },
        "^": function(left, right) {
            return left ^ right;
        },
        "/": function(left, right) {
            return left / right;
        },
        ">>>": function(left, right) {
            return left >>> right;
        },
        ">>": function(left, right) {
            return left >> right;
        },
        ">": function(left, right) {
            return left >> right;
        },
        "<<": function(left, right) {
            return left << right;
        },
        "<": function(left, right) {
            return left << right;
        },
        "|": function(left, right) {
            return left | right;
        },
        "||": function(left, right) {
            return left || right;
        },
        "&": function(left, right) {
            return left & right;
        },
        "&&": function(left, right) {
            return left && right;
        },
        "===": function(left, right) {
            return left === right;
        },
        "==": function(left, right) {
            return left == right;
        },
        "!==": function(left, right) {
            return left !== right;
        },
        "!=": function(left, right) {
            return left != right;
        },
        "&&": function(left, right) {
            return left && right;
        },
        "&": function(left, right) {
            return left & right;
        }
    };
    
    public pushOperator(op:string):void {
        if(this._op)
            throw new Error("Operator already queued");
        
        try {
            if("_operators" in this._value &&
                    op in this._value._operators)
                this._op = this._value._operators[op];
        } catch(e) {}
        if(!this._op)
            this._op = StackFrame._operators[op];
        if(!this._op)
            throw new Error("Unknown operator: " + op);
        this._last = this._value;
        this._value = undefined;
    }
    
    public pushValue(value) {
        if(this._op) {
            this._value = this._op(this._last, value);
            this._last = undefined;
            this._op = undefined;
        } else if(this._value !== undefined)
            throw new Error("Value already queued");
        else
            this._value = value;
    }
    
    public finalize() {
        if(this._op)
            throw new Error("Operation queued");
        return this._value;
    }
}

class CodeStack {
    private _frame:StackFrame = new StackFrame();
    private _frames:Array<StackFrame> = [];
    
    get frame():StackFrame {
        return this._frame;
    }
    
    public pushValue(value):void {
        this._frame.pushValue(value);
    }
    public pushOperator(op:string):void {
        this._frame.pushOperator(op);
    }
    
    public pushFrame():void {
        this._frames.push(this._frame);
        this._frame = new StackFrame();
    }
    public popFrame():void {
        var lastFrame = this._frames.pop();
        
        lastFrame.finalize(this._frame.value);
        lastFrame.apply(lastFrame);
        this._frame = lastFrame;
    }
    
    public finalize():void {
        if(this._frames.length > 0)
            throw new Error("Unexpected end of code");
        return this._frame.finalize();
    }
}

class Code {
    private nhp;
    private static $break = new Object();
    
    private static numberReg = /^(\d+)/;
    private static variableReg = /^([a-z]+[\w]*)/;
    private static whitespaceReg = /^(\s+)/;
    private static mathReg = /^(===|==|!===|!==|>>>|>>|>|<<|<|\|\||\||&&|&|\+|\-|\*|\^|\/)/;
    
    private static property = /^\./;
    private static propertyStart = /^\[/;
    private static propertyEnd = /^\]/;
    
    private static startComment = /^\/\*/;
    private static endComment = /^\*\//;
    
    private static startBlock = /^\(/;
    private static endBlock = /^\)/;
    
    private _compiled;
    private _source:Array<Array>;
    private _ops:Array<Array> = [];
    constructor(nhp) {
        this.nhp = nhp;
        this.registerOp(Code.whitespaceReg, function() {});
        this.registerOp(Code.numberReg, function(match, constants) {
            return [Instruction.VALUE, match[1]*1.0];
        });
        this.registerOp(Code.variableReg, function(match, constants) {
            try {
                var constant = undefined;
                if(match[1] in constants)
                    constant = constants[match[1]];
                if(constant === undefined)
                    throw "No such constant";

                return [Instruction.VALUE, constant];
            } catch(e) {
                return [Instruction.VARIABLE, match[1]];
            } 
        });
        this.registerOp(Code.mathReg, function(match, constants) {
            return [Instruction.OPERATOR, match[1]];
        });
    }
    
    public registerOp(pattern, handler:Function) {
        this._ops.push([pattern, handler]);
    }
    
    public process(source, constants:any) {
        if(source instanceof Array)
            this._source = source;
        else {
            constants = constants || {};
            this.nhp.applyConstants(constants);
            
            var sourceParts = [];
            while(source.length > 0) {
                var match;
                try {
                    this._ops.forEach(function(op, index) {
                        if(match = source.match(op[0])) {
                            var part = op[1](match, constants);
                            if(part)
                                sourceParts.push(part);
                            throw Code.$break;
                        }
                    });
                } catch(e) {
                    if(e != Code.$break)
                        throw e;
                }

                if(!match)
                    throw new Error("Syntax error: " + source);
                source = source.substring(match[0].length);
            }
            this._source = sourceParts;
        }
        console.log(this._source);
        return this._source;
    }
    
    public compile(source, constants:any) {
        if(source)
            this.process(source, constants);
        
        var parts = [];
        this._source.forEach(function(part) {
            switch(part[0]) {
                case Instruction.VALUE:
                    parts.push(function(context, stack:CodeStack) {
                        stack.pushValue(part[1]);
                    });
                    break;
                    
                case Instruction.VARIABLE:
                    parts.push(function(context, stack:CodeStack) {
                        stack.pushValue(context[part[1]]);
                    });
                    break;
                    
                case Instruction.OPERATOR:
                    parts.push(function(context, stack:CodeStack) {
                        stack.pushOperator(part[1]);
                    });
                    break;
                    
                default:
                    throw new Error("Unhandled Operation: " + part[0]);
            }
        });
        this._compiled = parts;
    }
    
    get source():string {
        return this._source;
    }
    
    public run(context:object) {
        context = context || {};
        this.nhp.applyConstants(context);
        
        var stack = new CodeStack();
        this._compiled.forEach(function(instruction:Function) {
            instruction(context, stack);
        });
        return stack.finalize();
    }
}

@main Code