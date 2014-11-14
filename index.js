var path = require("path");
var logger = require("nulllogger");
var typeinclude = require("typeinclude")(__dirname,
				path.resolve(__dirname, "lib", "Instructions"));
module.exports = typeinclude("NHP");