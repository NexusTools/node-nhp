@nodereq util
@nodereq stream
@nodereq fs

@include Instruction

class TemplateReader extends stream.Readable {
    private nhp;
    private _context;
    private _compiled;
    private _cursor:number = 0;
    constructor(nhp, compiled, context, options) {
        super(options);
        this.nhp = nhp;
        this._compiled = compiled;
        this._context = context;
    }
    
    public _read() {
        if(!(this._cursor in this._compiled)) {
            this.push(null);
            return;
        }
        
        var operation = this._compiled[this._cursor];
        switch(operation[0]) {
            case Instruction.WRITE:
                this.push(operation[1]);
                break;

            case Instruction.WRITECODE:
                var code = this.nhp.compileCode(operation[1]);
                this.push(code.run(this._context));
                break;

            default:
                throw new Error("Unhandled operation: " + operation[0]);
        }
        this._cursor++;
    }
}

class Template {
    private nhp;
    private _compiled;
    constructor(nhp, compiled) {
        this.nhp = nhp;
        this._compiled = compiled;
    }
    
    public createReadStream(context, options) {
        return new TemplateReader(this.nhp, this._compiled, context, options);
    }
    
    public run(output, context:Object, complete, options) {
        try {
            if(!("write" in output))
                throw "Not a pipe";
        } catch(e) {
            if(output)
                output = fs.createWriteStream(output);
            else
                output = process.stdout;
        }
        var readStream = this.createReadStream(context, options);
        readStream.on("error", complete);
        output.on("finish", complete);
        readStream.pipe(output);
    }
}

@main Template