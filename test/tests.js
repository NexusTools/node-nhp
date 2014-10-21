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
describe('Code', function() {
    describe('Constants', function() {
        it('true', function() {
            var code = nhp.createCode("true");
            assert.equal(code.run(), true);
        });
        it('false', function() {
            var code = nhp.createCode("false");
            assert.equal(code.run(), false);
        });
        it('null', function() {
            var code = nhp.createCode("null");
            assert.equal(code.run(), null);
        });
        it('undefined', function() {
            var code = nhp.createCode("undefined");
            assert.equal(code.run(), undefined);
        });
    });
    describe('Comparisons', function() {
        it('12 == 12 == true', function() {
            var code = nhp.createCode("12 == 12");
            assert.equal(code.run(), true);
        });
        it('false || true == true', function() {
            var code = nhp.createCode("false || true");
            assert.equal(code.run(), true);
        });
    });
    describe('Brackets', function() {
        it('code false || ( 0 || "Farm" ) == "Farm"', undefined);
    });
});
describe('Compile', function() {
    it('compile simple test', function(done) {
    	nhp.compile(__dirname + path.sep + "test.nhp", undefined, function(error) {
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
