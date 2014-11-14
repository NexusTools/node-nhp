@nodereq nulllogger:logger
@nodereq underscore:_
@nodereq entities
@nodereq events
@nodereq async
@nodereq fs
@nodereq vm

@include Compiler

class Template extends events.EventEmitter {
    private _nhp;
	private _compiledScript;
    private _filename:String;
	private _compiler:Compiler;
    constructor(filename:String, nhp) {
		super();
		
        this._nhp = nhp;
        this._filename = filename;
		
		this.compile();
		var self = this;
		fs.watch(this._filename, function(event) {
			self.compile();
		});
    }

	public isCompiled() {
		return !!this._compiledScript;
	}

	public hasAsyncInstructions() {
		return true;
	}

	private compile() {
		try {
			// Stop the active compiler, if any
			this._compiler.cancel();
		} catch(e) {}
		
		var self = this;
		logger.gears("Compiling", this.filename);
		this._compiler = new Compiler(this._nhp);
		this._compiler.compile(fs.createReadStream(this._filename), function(err) {
			try {
				if(err) throw err;
				var firstTime = !self._compiledScript;
				
				console.dir(self._compiler);
				
				self._compiler.optimize(self._nhp.constants, function(err) {
					try {
						if(err) throw err;
						
						var source = self._compiler.generateSource();
						console.log("Generated source code", source);
						
						self._compiledScript = vm.createScript(source.toString(), self._filename);

						if(firstTime)
							self.emit("compiled");
						self.emit("updated");

						logger.gears("Compiled", this.filename);
						delete self._compiled
					} catch(e) {
						logger.error("Failed to compile", this.filename, e);
						self.emit("error", e);
					}
				});
			} catch(e) {
				logger.error("Failed to compile", this.filename, e);
				self.emit("error", e);
			}
		});
	}
    
    public run(context, out:stream.Writable, callback) {
		var vmc = vm.createContext();
		_.extend(vmc, context);
		
		vmc.__out = out;
		vmc.__done = callback;
		vmc.console = console;
		vmc.__series = async.series;
		vmc.__each = async.eachSeries;
		vmc.__encode = entities.encodeHTML;
		vmc.__error = function(err, attrib:boolean = false) {
			err = entities.encodeHTML("" + err);
			if(attrib)
				return err;
			return "<error>" + err + "</error>";
		}
		vmc.__string = function(data) {
			return entities.encodeHTML("" + data);
		}
		this._compiledScript.runInContext(vmc);
    }
}

@main Template