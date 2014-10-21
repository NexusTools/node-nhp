@include Instruction
@nodereq htmlparser2
@nodereq fs

@target ES5

class Compiler {
    private nhp;
    
    private blocks = [];
    private silence = false;
    private _path:Array<String> = [];
    
    get path():string {
        return this._path;
    }
    
    constructor(nhp) {
        this.nhp = nhp;
    }
    
    public compile(source, output, callback:Function) {
        output = output || process.stdout;
        try {
            if(!("write" in output))
                throw "No write method";
        } catch(e) {
            output = fs.createWriteStream(output);
        }
        try {
            if(!("pipe" in source))
                throw "Not a stream";
        } catch(e) {
            source = fs.createReadStream(source);
        }
        
        var thisCompiler:Compiler = this;
        var parser = new htmlparser2.Parser({
            onopentag: function(name, attribs){
                output.write("<" + name + " " + attribs + "\n");
                thisCompiler._path.push(name);
            },
            ontext: function(text){
                output.write("--> " + text + "\n");
            },
            onclosetag: function(name){
                output.write("</ " + name + "\n");
                if(thisCompiler._path.pop() != name)
                    throw new Error("Unexpected endtag: " + name);
            },
            onprocessinginstruction: function(name, data) {
                output.write(name + " " + data + "\n");
            },
            oncdatastart: function() {
                output.write("Enter CDATA");
            },
            oncdataend: function() {
                output.write("Leave CDATA");
            },
            onerror: callback,
            onend: callback
        });
        source.pipe(parser);
    }
    
}

@main Compiler