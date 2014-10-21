var path = require("path");

process.env.NODE_ENV = 'test';
process.env.NODE_PATH = path.dirname(path.dirname(__dirname)) + path.sep + "node_modules:" + process.env.NODE_PATH;
console.log(process.env.NODE_PATH);
//process.env.TYPEINCLUDE_VERBOSE = true;