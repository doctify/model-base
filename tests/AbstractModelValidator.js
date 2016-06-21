'use strict';

const chai = require('chai');
const ModelValidator = require('../lib/model_validator');

/* First 3 values should be valid and last 3 invalid */
const createExpectations = (test_object) => {
	let expectations = [];
	let valid_breakpoint = 3;
	Object.keys(test_object).forEach( (test_function) => {
		let current_test = test_object[test_function];

		current_test.forEach( (test_value, index) => {
			let valid = index < valid_breakpoint ? 'Valid' : 'Invalid';
			let test_return = index < valid_breakpoint ? true : false;
			expectations.push({
				test_value: test_value,
				label: `Test: ${valid}`,
				test_return: test_return,
				test_function: test_function

			});
		});
	});

	return expectations;
};

const runTests = (expectations) => {
	expectations.forEach( expectation => {
		it(expectation.label, done => {
			let test_return = ModelValidator[expectation.test_function](expectation.test_value);
			chai.assert(test_return === expectation.test_return, `actual: ${test_return}, expected: ${expectation.test_return}`);
			done();
		});
	});
};

describe('AbstractModelValidator', () => {

	describe('Array', () => {
		let test_object = {
			'array': [ [], new Array(10), [].concat([]), '[]', {}, undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Buffer', () => {
		let test_object = {
			'buffer': [ new Buffer(''), new Buffer([]), new Buffer(0), '', [], undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('String', () => {
		let test_object = {
			'string': [ '', 'abc', [].toString(), 0, false, undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Boolean', () => {
		let test_object = {
			'boolean': [ false, true, false, 'false', 'true', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('IP', () => {
		let test_object = {
			'ip': [ '127.0.0.1', '192.168.0.1', '0.0.0.0', '0', 'localhost', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('URL', () => {
		let test_object = {
			'url': [ 'test.com', 'http://test.com', 'test.co.uk?here', 'test', '', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Slug', () => {
		let test_object = {
			'slug': [ 'en', 'title', 'null', 'f4abbb11-32e2-4581-af8c-274cf6b00123', 0, undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('UUID', () => {
		let test_object = {
			'uuid': [ '426fc69a-7572-4c39-95a7-683a97166973', 'f4abbb11-32e2-4581-af8c-274cf6b00123', '980f3562-05ab-4364-b3dd-99d4d2f588ff', '', '0', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('FQDN', () => {
		let test_object = {
			'fqdn': [ 'test.com', 'www.test.co.uk', 'www.test.com', 'http://test.com', 'test.co.uk?here', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('JSON', () => {
		let test_object = {
			'json': [ '{}', '[]', '{"test": ""}', '', null, undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Email', () => {
		let test_object = {
			'email': [ 'test@me.com', '%@i.co.uk', 'stop.this@no.ok', '', 'test.co.uk', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Alpha', () => {
		let test_object = {
			'alpha': [ 'abc', 'xyz', 'asdf', '', 'h3r3', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Base64', () => {
		let test_object = {
			'base64': [ 'YmFzZTY0', 'YmFzZTY0AB==', 'YmFzZT==', '', 'ab', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Hex', () => {
		let test_object = {
			'hex': [ '686578', '612345678578', '682213477089', '0z,', 'a1;', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('AlphaNumeric', () => {
		let test_object = {
			'alpha_numeric': [ 'abc', '123', 'abc123', '123;', '1-3', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Phone', () => {
		let test_object = {
			'phone': [ '07584341234', '+447584341234', '447584341234', '0123', 'abc123', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Function', () => {
		let test_object = {
			'function': [ function(){}, createExpectations, describe, undefined, null, '' ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Date', () => {
		let test_object = {
			'date': [ new Date(), '1990-10-10', '10/10/1990', '', +new Date(), undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Date Range', () => {
		let test_object = {
			'daterange': [ [ new Date(), new Date() ], [ '1990-10-10', '1990-10-10'], [ '10/10/1990', '10/10/1990' ], '', [ new Date(), +new Date() ], undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Object', () => {
		let test_object = {
			'object': [ {}, { test: '' }, Object.assign({}, {}), [], null, undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Integer', () => {
		let test_object = {
			'integer': [ '0', 0, 23, 23.45, '0.1234', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Float', () => {
		let test_object = {
			'float': [ 23.45, '0.1234', 1.1, 'abc', '', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Number', () => {
		let test_object = {
			'number': [ 0, '01234', 11, 'abc', '', undefined ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});
});
