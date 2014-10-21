@include Instruction

class Template {
    public run(output, context:Object) {
        try {
            if(!("write" in output))
                throw "Not a pipe";
        } catch(e) {
            output = fs.createWriteStream(output);
        }
        
        
    }
}

@main Template