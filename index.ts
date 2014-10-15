@nodereq node-expat:expat
@nodereq fs

class NHP {
    private globals:Object = {};
    
    public compile(input:String, output:String, callback:Function) {
        console.log("Compiling", input);
        
        var parser = new expat.Parser('UTF-8');
        
        parser.on("processingInstruction", function(target, data) {
            console.log(target, data);
        });
        parser.on("error", function(error) {
            callback(error);
        });
        parser.on("end", function() {
            callback();
        });

        fs.createReadStream(input).pipe(parser);
    }
}

module.exports = NHP;
