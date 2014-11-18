@nodereq nulllogger:logger
@nodereq underscore:_
@nodereq entities
@nodereq events
@nodereq async
@nodereq fs
@nodereq vm

@include Compiler

logger = logger("nhp");

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
				
				self._compiler.optimize(self._nhp.constants, function(err) {
					try {
						if(err) throw err;
						
						var source = self._compiler.generateSource();
						logger.gears("Generated source code", source);
						
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
		_.extend(vmc, this._nhp.constants);
		_.extend(vmc, context);
		var self = this;
		
		vmc.__out = out;
		vmc.__done = callback;
		vmc.__series = async.series;
		vmc.__each = function(eachOf, iterator, callback) {
			if(_.isArray(eachOf))
				async.eachSeries(eachOf, iterator, callback);
			else if(_.isObject(eachOf))
				async.eachSeries(_.keys(eachOf), function(key, callback) {
					iterator({
						"key": key,
						"value": eachOf[key]
					}, callback);
				}, callback);
			else
				callback(); // Silently fail
		};
		vmc.__if = function(segments, callback) {
			var __next, i = 0;
			__next = function() {
				if(i < segments.length) {
					var segment = segments[i++];
					if(segment[0]())
						async.series(segment[1], callback);
					else
						__next();
				} else
					callback();
			}
			__next();
		};
		vmc.__encode = entities.encodeHTML;
		vmc.__resolver = function(name, callback) {
			self._nhp.resolver(name)(callback);
		}
		vmc.__error = function(err, attrib:boolean = false) {
			err = entities.encodeHTML("" + err);
			if(attrib)
				return err;
			return "<error>" + err + "</error>";
		}
		vmc.__string = function(data, raw) {
			if(raw)
				return "" + data;
			return entities.encodeHTML("" + data);
		}
		this._compiledScript.runInContext(vmc);
    }
}

@main Template