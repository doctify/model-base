'use strict';

const chai = require('chai');
const ModelUtilities = require('../model_utilities');

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
				test_return: test_return,
				test_function: test_function,
				label: `Test: ${valid}`

			});
		});
	});

	return expectations;
};

const runTests = (expectations) => {
	expectations.forEach( expectation => {
		it(expectation.label, done => {
			let test_return = ModelUtilities[expectation.test_function](expectation.test_value);
			chai.assert(test_return === expectation.test_return, `actual: ${test_return}, expected: ${expectation.test_return}`);
			done();
		});
	});
};

describe('AbstractModelUtilities', () => {

	describe('Flatten Array', () => {
		it('Flatten Array', done => {
			let arrayOfArrays = [ [1], [2, 3], 4 ];
			let value = ModelUtilities.flattenArray(arrayOfArrays);
			chai.assert(value.length === 4 && value[0] === 1 && value[1] === 2 && value[2] === 3 && value[3] === 4, 'Array not flattened');
			done();
		});
	});

	describe('Clone Object', () => {
		it('Clone Object', done => {
			let objectToClone = { test_key1: 'test', test_key2: 'test2' };
			let value = ModelUtilities.cloneObject(objectToClone);
			chai.assert(Object.keys(value).length === 2 && value.test_key2 === 'test2' && value !== objectToClone, 'Object not cloned');
			done();
		});
	});

	describe('Is Function', () => {
		let test_object = {
			'isFunction': [ function(){}, createExpectations, describe, undefined, null, '' ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Is Object', () => {
		let test_object = {
			'isObject': [ {}, [], Object.create({}), function(){}, undefined, null, '' ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});

	describe('Exists', () => {
		let test_object = {
			'exists': [ '', 0, false, undefined, null, NaN ]
		};

		let expectations = createExpectations(test_object);
		runTests(expectations);
	});
});
