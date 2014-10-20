var testCase = require('mocha').describe
var pre = require('mocha').before
var assertions = require('mocha').assertions
var path = require('path')
var assert = require('assert')

var nhp;
it('include index.js', function() { // added "done" as parameter
    nhp = require(path.dirname(__dirname) + path.sep + "index");
    nhp = new nhp();
});
describe('Compiler', function() {

    it('compile simple test', function(done) {
    	nhp.compile(__dirname + path.sep + "test.nhp", function(error) {
    		if(error)
    			throw error;
    		
    		done();
    	});
    });
});
describe('Template', function() {
    it('run compiled template', function() {
    });
});
