"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const Template_1 = require("./Template");
const Set_1 = require("./Instructions/Set");
const Add_1 = require("./Instructions/Add");
const Map_1 = require("./Instructions/Map");
const Exec_1 = require("./Instructions/Exec");
const JSON_1 = require("./Instructions/JSON");
const Each_1 = require("./Instructions/Each");
const Done_1 = require("./Instructions/Done");
const Custom_1 = require("./Instructions/Custom");
const If_1 = require("./Instructions/If");
const ElseIf_1 = require("./Instructions/ElseIf");
const Else_1 = require("./Instructions/Else");
const EndIf_1 = require("./Instructions/EndIf");
const Include_1 = require("./Instructions/Include");
const Echo_1 = require("./Instructions/Echo");
const Translate_1 = require("./Instructions/Translate");
const Moustache_1 = require("./Instructions/Moustache");
const MoustacheResolver_1 = require("./Instructions/MoustacheResolver");
var extension = /\.\w+$/;
class NHP {
    constructor(constants, options) {
        if (!(this instanceof NHP))
            return new NHP(constants);
        Object.defineProperties(this, {
            processors: {
                value: {}
            },
            resolvers: {
                value: {}
            },
            templates: {
                value: {}
            },
            constants: {
                value: constants || {}
            },
            options: {
                value: {}
            }
        });
        _.merge(this.processors, NHP.defaultProcessors);
        _.merge(this.options, NHP.defaults);
        if (options)
            _.merge(this.options, options);
    }
    static create(constants) {
        return new NHP(constants);
    }
    /**
     * Return a processing instruction for a processor by name and with data.
     *
     * @param name The name of the processor
     * @param data The data to pass to the processor
     */
    processingInstruction(name, data) {
        const processor = this.processors[name];
        if (processor)
            return processor(data);
        throw new Error("No processor found with name `" + name + "`");
    }
    resolver(name) {
        const resolver = this.resolvers[name];
        if (resolver)
            return resolver;
        throw new Error("No resolver found with name `" + name + "`");
    }
    installResolver(name, resolver) {
        this.resolvers[name] = resolver;
    }
    /**
     * Install a processor for key.
     *
     * @param key The key to use
     * @param processor The processor to install
     */
    installProcessor(key, processor) {
        this.processors[key] = processor;
    }
    /**
     * Set or update a constant.
     *
     * @param key The key for the constant
     * @param value The value of the constant
     */
    setConstant(key, value) {
        if (this.hasConstant(key))
            throw new Error("Cannot redefine constant: " + key);
        this.constants[key] = value;
    }
    /**
     * Check whether or not a specific constant is set for a given key.
     *
     * @param key The key
     * @returns true if key is set, false otherwise
     */
    hasConstant(key) {
        return key in this.constants;
    }
    /**
     * Delete a constant for a specific key
     *
     * @param key The key
     * @returns true if deleted, false otherwise
     */
    deleteConstant(key) {
        return delete this.constants[key];
    }
    /**
     * Retreive a constant by key.
     *
     * @param key The key
     * @returns The value of the constant, or undefined
     */
    constant(name) {
        return this.constants[name];
    }
    /**
     * Assign the source object's properties to the constants for this NHP instance.
     *
     * @param object The source object
     */
    assignConstants(object) {
        _.assignIn(this.constants, object);
    }
    /**
     * Create or retreive a template associated to this NHP instance.
     *
     * @param filename The template filename
     * @param mutable Whether or not to watch for changes, true by default
     */
    template(filename, mutable = true) {
        if (!extension.test(filename))
            filename += ".nhp";
        filename = path.resolve(filename);
        if (!(filename in this.templates))
            return this.templates[filename] = new Template_1.Template(filename, this, mutable);
        return this.templates[filename];
    }
    /**
     * Generate JavaScript source for a given NHP template.
     *
     * @param filename The template filename
     * @param cb The callback
     */
    genSource(filename, cb) {
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
    /**
     * Render a NHP template and return HTML
     *
     * @param filename The filename
     * @param locals The locals to use for rendering
     * @param cb The callback
     */
    render(filename, options, cb) {
        this.template(filename).render(options, cb);
    }
    /**
     * Render a NHP template to a stream
     *
     * @param filename The filename
     * @param locals The locals to use for rendering
     * @param stream The target stream
     * @param cb The callback
     */
    renderToStream(filename, locals, stream, cb) {
        this.template(filename).renderToStream(locals, stream, cb);
    }
    /**
     * Create an express handler out of this NHP instance.
     */
    __express() {
        return this.render.bind(this);
    }
}
/**
 * References to the built in Instructions
 */
NHP.Instructions = {
    Set: Set_1.Set, Add: Add_1.Add, Map: Map_1.Map, Exec: Exec_1.Exec, JSON: JSON_1.JSON, Each: Each_1.Each, Done: Done_1.Done, If: If_1.If, ElseIf: ElseIf_1.ElseIf, Else: Else_1.Else, EndIf: EndIf_1.EndIf, Include: Include_1.Include, Moustache: Moustache_1.Moustache, MoustacheResolver: MoustacheResolver_1.MoustacheResolver, Echo: Echo_1.Echo, Translate: Translate_1.Translate, Custom: Custom_1.Custom
};
NHP.defaults = {
    tidyAttribs: ["false", "null", "undefined"],
    tidyComments: "not-if",
    tidyOutput: true
};
NHP.defaultProcessors = {
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