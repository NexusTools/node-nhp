"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const stream_1 = require("stream");
const Template_1 = require("./Template");
const Set_1 = require("./Instructions/Set");
const Add_1 = require("./Instructions/Add");
const Map_1 = require("./Instructions/Map");
const Exec_1 = require("./Instructions/Exec");
const JSON_1 = require("./Instructions/JSON");
const Each_1 = require("./Instructions/Each");
const Done_1 = require("./Instructions/Done");
const If_1 = require("./Instructions/If");
const ElseIf_1 = require("./Instructions/ElseIf");
const Else_1 = require("./Instructions/Else");
const EndIf_1 = require("./Instructions/EndIf");
const Include_1 = require("./Instructions/Include");
var extension = /\.\w+$/;
class BufferedWritable extends stream_1.Writable {
    constructor() {
        super(...arguments);
        this.buffer = "";
    }
    _write(chunk, encoding, callback) {
        this.buffer += chunk.toString("utf8");
        callback();
    }
}
class NHP {
    constructor(constants, options) {
        if (!(this instanceof NHP))
            return new NHP(constants);
        this.resolvers = {};
        this.templates = {};
        this.constants = constants || {};
        this.options = {};
        _.merge(this.options, NHP.defaults);
        if (options)
            _.merge(this.options, options);
    }
    static create(constants) {
        return new NHP(constants);
    }
    processingInstruction(name, data) {
        if (!(name in NHP.PROCESSORS))
            throw new Error("No processor found with name `" + name + "`");
        return NHP.PROCESSORS[name](data);
    }
    resolver(name) {
        if (!(name in this.resolvers))
            throw new Error("No resolver found with name `" + name + "`");
        return this.resolvers[name];
    }
    installResolver(name, resolver) {
        this.resolvers[name] = resolver;
    }
    setConstant(name, value) {
        if (this.hasConstant(name))
            throw new Error("Cannot redefine constant: " + name);
        this.constants[name] = value;
    }
    hasConstant(name) {
        return name in this.constants;
    }
    getConstant(name) {
        return this.constants[name];
    }
    mixin(object) {
        _.merge(this.constants, object);
    }
    template(filename) {
        if (!extension.test(filename))
            filename += ".nhp";
        filename = path.resolve(filename);
        if (!(filename in this.templates))
            return this.templates[filename] = new Template_1.Template(filename, this);
        return this.templates[filename];
    }
    genSource(filename, options, cb) {
        const template = this.template(filename);
        if (template.isCompiled())
            cb(undefined, template.getSource());
        else {
            var timeout;
            var onCompiled, onError;
            const _cb = function (err, source) {
                template.removeListener("compiled", onCompiled);
                template.removeListener("error", onError);
                cb(err, source);
            };
            template.on("compiled", onCompiled = function () {
                timeout = setTimeout(function () {
                    _cb(undefined, template.getSource());
                }, 100);
            });
            template.on("error", onError = function (err) {
                try {
                    clearTimeout(timeout);
                }
                catch (e) { }
                _cb(err);
            });
        }
    }
    render(filename, options, cb) {
        const bufferedWritable = new BufferedWritable();
        this.renderToStream(filename, options, bufferedWritable, function (err) {
            if (err)
                cb(err);
            else
                cb(undefined, bufferedWritable.buffer);
        });
    }
    renderToStream(filename, options, stream, cb) {
        const template = this.template(filename);
        if (template.isCompiled())
            template.run(options, stream, cb);
        else {
            var timeout;
            var onCompiled, onError;
            const _cb = function (err) {
                template.removeListener("compiled", onCompiled);
                template.removeListener("error", onError);
                cb(err);
            };
            template.on("compiled", onCompiled = function () {
                timeout = setTimeout(function () {
                    template.run(options, stream, _cb);
                }, 100);
            });
            template.on("error", onError = function (err) {
                try {
                    clearTimeout(timeout);
                }
                catch (e) { }
                _cb(err);
            });
        }
    }
    static __express(options) {
        const nhp = new NHP({}, options);
        return nhp.render.bind(nhp);
    }
}
NHP.defaults = {
    tidyAttribs: ["false", "null", "undefined"],
    tidyComments: "not-if",
    tidyOutput: true
};
NHP.PROCESSORS = {
    "set": function (data) {
        return new Set_1.Set(data);
    },
    "add": function (data) {
        return new Add_1.Add(data);
    },
    "map": function (data) {
        return new Map_1.Map(data);
    },
    "exec": function (source) {
        return new Exec_1.Exec(source);
    },
    "json": function (source) {
        return new JSON_1.JSON(source);
    },
    "each": function (data) {
        return new Each_1.Each(data);
    },
    "done": function () {
        return new Done_1.Done();
    },
    "if": function (condition) {
        return new If_1.If(condition);
    },
    "elseif": function (condition) {
        return new ElseIf_1.ElseIf(condition);
    },
    "else": function () {
        return new Else_1.Else();
    },
    "endif": function () {
        return new EndIf_1.EndIf();
    },
    "include": function (file) {
        return new Include_1.Include(file);
    }
};
exports.NHP = NHP;
//# sourceMappingURL=NHP.js.map