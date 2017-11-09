"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var path = require("path");
var Template_1 = require("./Template");
var Set_1 = require("./Instructions/Set");
var Add_1 = require("./Instructions/Add");
var Map_1 = require("./Instructions/Map");
var Exec_1 = require("./Instructions/Exec");
var JSON_1 = require("./Instructions/JSON");
var Each_1 = require("./Instructions/Each");
var Done_1 = require("./Instructions/Done");
var If_1 = require("./Instructions/If");
var ElseIf_1 = require("./Instructions/ElseIf");
var Else_1 = require("./Instructions/Else");
var EndIf_1 = require("./Instructions/EndIf");
var Include_1 = require("./Instructions/Include");
var extension = /\.\w+$/;
var NHP = (function () {
    function NHP(constants, options) {
        if (constants === void 0) { constants = {}; }
        if (!(this instanceof NHP))
            return new NHP(constants);
        this.resolvers = {};
        this.templates = {};
        this.constants = constants;
        this.options = {};
        _.merge(this.options, NHP.defaults);
        if (options)
            _.merge(this.options, options);
    }
    NHP.create = function (constants) {
        return new NHP(constants);
    };
    NHP.prototype.processingInstruction = function (name, data) {
        if (!(name in NHP.PROCESSORS))
            throw new Error("No processor found with name `" + name + "`");
        return NHP.PROCESSORS[name](data);
    };
    NHP.prototype.resolver = function (name) {
        if (!(name in this.resolvers))
            throw new Error("No resolver found with name `" + name + "`");
        return this.resolvers[name];
    };
    NHP.prototype.installResolver = function (name, resolver) {
        this.resolvers[name] = resolver;
    };
    NHP.prototype.setConstant = function (name, value) {
        if (this.hasConstant(name))
            throw new Error("Cannot redefine constant: " + name);
        this.constants[name] = value;
    };
    NHP.prototype.hasConstant = function (name) {
        return name in this.constants;
    };
    NHP.prototype.getConstant = function (name) {
        return this.constants[name];
    };
    NHP.prototype.mixin = function (object) {
        _.merge(this.constants, object);
    };
    NHP.prototype.template = function (filename) {
        if (!extension.test(filename))
            filename += ".nhp";
        filename = path.resolve(filename);
        if (!(filename in this.templates))
            return this.templates[filename] = new Template_1.Template(filename, this);
        return this.templates[filename];
    };
    NHP.instance = function () {
        if (!NHP.__expressInst)
            return NHP.__expressInst = new NHP();
        return NHP.__expressInst;
    };
    NHP.__express = function (path, options, callback) {
        throw new Error("No idea where the documentation is on what options actually contains... once thats figured out this will work...");
    };
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
    return NHP;
}());
exports.NHP = NHP;
//# sourceMappingURL=NHP.js.map