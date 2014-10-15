var testCase = require('mocha').describe
var pre = require('mocha').before
var assertions = require('mocha').assertions
var path = require('path')
var assert = require('assert')

describe('api', function() {
	var nhp;
    it('include index.js', function() { // added "done" as parameter
        nhp = require(path.dirname(__dirname) + path.sep + "index");
    });
    it('compile simple test', function(done) {
    	nhp.compile("test", function(error) {
    		if(error)
    			throw error;
    		
    		done();
    	});
    });
});
