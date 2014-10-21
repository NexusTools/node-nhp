@target ES5

class StackFrame {
    private _last:any;
    private _value:any;
    private _op:Function;
    
    get value():any {
        return this._value;
    }
    
    private static _mathOps:Array<Function> = {
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
    
    public pushMath(op:string):void {
        if(this._op)
            throw new Error("Operation already queued");
        
        this._op = StackFrame._mathOps[op];
        if(!this._op)
            throw new Error("Unknown math operation: " + op);
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
    public pushMath(op:string):void {
        this._frame.pushMath(op);
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
    
    private _source;
    private _compiled;
    private _ops:Array<Array> = [];
    constructor(nhp) {
        this.nhp = nhp;
        this.registerOp(Code.whitespaceReg, function() {});
        this.registerOp(Code.numberReg, function(match, parts, constants) {
            var value = match[1]*1.0;
            
            parts.push(function(context, stack:CodeStack) {
                stack.pushValue(value);
            });
        });
        this.registerOp(Code.variableReg, function(match, parts, constants) {
            try {
                var constant = undefined;
                if(match[1] in constants)
                    constant = constants[match[1]];
                if(constant === undefined)
                    throw "No such constant";

                parts.push(function(context, stack:CodeStack) {
                    stack.pushValue(constant);
                });
            } catch(e) {
                parts.push(function(context, stack:CodeStack) {
                    stack.pushValue(context[match[1]]);
                });
            } 
        });
        this.registerOp(Code.mathReg, function(match, parts, constants) {
            parts.push(function(context, stack:CodeStack) {
                stack.pushMath(match[1]);
            });
        });
    }
    
    public registerOp(pattern, handler:Function) {
        this._ops.push([pattern, handler]);
    }
    
    public compile(source:string, constants:any) {
        constants = constants || {};
        this.nhp.applyConstants(constants);
        
        var parts = [];
        while(source.length > 0) {
            var match;
            try {
                this._ops.forEach(function(op) {
                    if(match = source.match(op[0])) {
                        op[1](match, parts, constants);
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