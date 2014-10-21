@nodereq htmlparser2
@nodereq fs

@include Instruction
@include Template;

@target ES5

class Compiler {
    private nhp;
    private static $break = new Object();
    
    private _compiled:Array<Array>;
    private _path:Array<String> = [];
    private processors:Array<Array> = []
    
    public registerProcessor(pattern, handler) {
        this.processors.push([pattern, handler]);
    }
    
    get path():string {
        return this._path;
    }
    
    constructor(nhp) {
        this.nhp = nhp;
    }
    
    public compile(source, callback:Function) {
        try {
            if(!("pipe" in source))
                throw "Not a stream";
        } catch(e) {
            source = fs.createReadStream(source);
        }
        
        var sourceParts = [];
        var thisCompiler:Compiler = this;
        var processors = this.processors.slice(0);
        this.nhp.applyProcessors(processors);
        console.log(processors);
        var processValue = function(value:string) {
            while(value.length > 0) {
                var match;
                var processor;
                try {
                    processors.forEach(function(proc) {
                        match = value.match(proc[0]);
                        console.log(value, match);
                        if(!match)
                            throw "Bad match";
                        processor = proc[1];
                        throw Compiler.$break;
                    });
                } catch(e) {
                    if(e != Compiler.$break) {
                        console.error(e);
                        throw e;
                    }
                }

                if(match) {
                    console.log(match);
                    
                    if(match.index > 0)
                        sourceParts.push([Instruction.WRITE,
                            value.substring(0, match.index)]);
                    
                    sourceParts.push([Instruction.WRITE,
                            value.substring(0, match.index)]);
                    
                    sourceParts.push([Instruction.WRITECODE,
                            thisCompiler.nhp.processCode(match[1])]);
                    
                    var end = match.index + match[0].length;
                    if(end < match[0].length)
                        sourceParts.push([Instruction.WRITE,
                            match[0].substring(end)]);
                    
                    value = value.substring(end);
                } else {
                    sourceParts.push([Instruction.WRITE, value]);
                    return;
                }
                
            }
        }
        var parser = new htmlparser2.Parser({
            onopentag: function(name, attribs){
                thisCompiler._path.push(name);
                
                sourceParts.push([Instruction.WRITE, "<" + name]);
                for(var key in attribs) {
                    sourceParts.push([Instruction.WRITE, " " + key + "=\""]);
                    processValue(attribs[key]);
                    sourceParts.push([Instruction.WRITE, "\""]);
                }
                sourceParts.push([Instruction.WRITE, ">"]);
            },
            ontext: function(text){
                processValue(text);
            },
            onclosetag: function(name){
                if(thisCompiler._path.pop() != name)
                   throw new Error("Unexpected endtag: " + name);
                sourceParts.push([Instruction.WRITE, "</" + name + ">"]);
            },
            onprocessinginstruction: function(name, data) {
            },
            oncdatastart: function() {
            },
            oncdataend: function() {
            },
            onerror: callback,
            onend: function() {
                thisCompiler._compiled = sourceParts;
                thisCompiler.optimize();
                console.log(JSON.stringify(thisCompiler._compiled));
                callback();
            }
        });
        source.pipe(parser);
    }
    
    private optimize():void {
        var i;
        var cStart = -1;
        var cBuffer = "";
        console.log("Optimizing", JSON.stringify(this._compiled));
        for(i=0; i<this._compiled.length; i++) {
            var op = this._compiled[i];
            if(op[0] == Instruction.WRITE) {
                if(cStart < 0) {
                    cStart = i;
                    console.log("Entered WRITE", cStart);
                    cBuffer = op[1];
                } else
                    cBuffer += op[1];
            } else if(cStart > -1) {
                var len = i - cStart;
                cStart = -1;
                console.log("Left WRITE", len);
                if(len > 1) {
                    i -= len;
                    this._compiled.splice(i, len,
                        [Instruction.WRITE, cBuffer]);
                }
                cBuffer = "";
            }
        }
        console.log(cStart);
        if(cStart > -1) {
            var len = i - cStart;
            cStart = -1;
            console.log("Left WRITE", len);
            if(len > 1) {
                i -= len;
                this._compiled.splice(i, len,
                    [Instruction.WRITE, cBuffer]);
            }
            cBuffer = "";
        }
    }
    
    get template():Template {
        return new Template(this.nhp, this._compiled);
    }
    
}

@main Compiler