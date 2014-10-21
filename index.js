var path = require("path");
var typeinclude = require("typeinclude");
typeinclude.addclasspath(__dirname + path.sep + "node_modules");
module.exports = typeinclude("NHP", __dirname + path.sep + "src");