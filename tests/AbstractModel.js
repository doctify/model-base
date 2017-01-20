const chai = require('chai');
const _ = require('lodash');
const Model = require('../lib/model');

const createExpectations = (type, values) => {
	let test_key = 'test_key';
	type = type || 'string';
	values = values || [];

	let expectations = [{
		test_return: `${test_key} of type ${type} is required`,
		label: 'Required, Empty, N/A Type',
		attributes: { required: true, type: type }
	}, {
		test_return: null,
		label: 'Required, Not Empty, Right Type',
		attributes: { required: true, type: type }
	}, {
		test_return: `${test_key} should be of type ${type}`,
		label: 'Required, Not Empty, Wrong Type',
		attributes: { required: true, type: type }
	}, {
		test_return: null,
		label: 'Not Required, Empty, N/A Type',
		attributes: { required: false, type: type }
	}, {
		test_return: null,
		label: 'Not Required, Not Empty, Right Type',
		attributes: { required: false, type: type }
	}, {
		test_return: `${test_key} should be of type ${type}`,
		label: 'Not Required, Not Empty, Wrong Type',
		attributes: { required: false, type: type }
	}];

	expectations.forEach( (expectation, index) => {
		expectation.test_attributes = {};
		expectation.test_values = {};

		expectation.attributes.type = expectation.attributes.type || type;
		expectation.test_attributes[test_key] = expectation.attributes;
		expectation.test_values[test_key] = values[index];
	});

	return expectations;
};

const runTests = (expectations) => {
	expectations.forEach( expectation => {
		it(expectation.label, done => {
			let TestModel = new Model();
			TestModel.setAttributes(expectation.test_attributes);
			TestModel.setOptions(expectation.test_options);
			TestModel.setValues(expectation.test_values);

			let test_return = TestModel.isValid(true);
			test_return = test_return ? test_return[0] : test_return;
			chai.assert(test_return === expectation.test_return, `actual: ${test_return}, expected: ${expectation.test_return}`);
			done();
		});
	});
};

describe('AbstractModel', () => {

	describe('Unit Tests', () => {

		let expectation = {
			test_values: { test_key: 'test' },
			test_attributes: { test_key: { required: true, type: 'string' } }
		};

		describe('Constructor', () => {
			it('Set Nothing', done => {
				let TestModel = new Model();
				let values = TestModel.getValues();
				let attributes = TestModel.getAttributes();
				chai.assert(Object.keys(values).length === 0, 'Incorrect length of set values');
				chai.assert(Object.keys(attributes).length === 0, 'Incorrect length of set attributes');
				done();
			});

			it('Set Only Attributes', done => {
				let TestModel = new Model(expectation.test_attributes);
				let values = TestModel.getValues();
				let attributes = TestModel.getAttributes();
				chai.assert(Object.keys(values).length === 1, 'Incorrect length of set values');
				chai.assert(Object.keys(attributes).length === 1, 'Incorrect length of set attributes');
				done();
			});

			it('Set Only Values', done => {
				let TestModel = new Model(null, expectation.test_values);
				let values = TestModel.getValues();
				let attributes = TestModel.getAttributes();
				chai.assert(Object.keys(values).length === 1, 'Incorrect length of set values');
				chai.assert(Object.keys(attributes).length === 0, 'Incorrect length of set attributes');
				done();
			});

			it('Set Values And Attributes', done => {
				let TestModel = new Model(expectation.test_attributes, expectation.test_values);
				let values = TestModel.getValues();
				let attributes = TestModel.getAttributes();
				chai.assert(Object.keys(values).length === 1, 'Incorrect length of set values');
				chai.assert(Object.keys(attributes).length === 1, 'Incorrect length of set attributes');
				done();
			});
		});

		it('To String', done => {
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			let str = TestModel.toString('test_key');
			chai.assert(str === 'test', 'Incorrect Stringification of Model');
			done();
		});

		it('To JSON', done => {
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			let json = TestModel.toJSON();
			chai.assert(json.test_key === 'test' && json.__attributes, 'Incorrect JSON representation of Model');
			done();
		});

		it('To JSON (Strict)', done => {
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			let json = TestModel.toJSON(null, true);
			chai.assert(json.test_key === 'test' && !json.__attributes, 'Incorrect JSON representation of Model');
			done();
		});

		it('To JSON (No Attributes)', done => {
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			let json = TestModel.toJSON(true);
			chai.assert(json.test_key === 'test' && !json.__attributes, 'Incorrect JSON representation of Model');
			done();
		});

		it('To JSON (No Attributes | Strict)', done => {
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			let json = TestModel.toJSON(true, true);
			chai.assert(json.test_key === 'test' && !json.__attributes, 'Incorrect JSON representation of Model');
			done();
		});

		it('Set Values', done => {
			let TestModel = new Model();
			TestModel.setValues(expectation.test_values);
			let values = TestModel.getValues();
			chai.assert(Object.keys(values).length === 1, 'Incorrect length of set values');
			done();
		});

		it('Get Values', done => {
			let TestModel = new Model(null, expectation.test_values);
			let values = TestModel.getValues();
			chai.assert(Object.keys(values).length === 1, 'Incorrect length of set values');
			done();
		});

		it('Get Value', done => {
			let TestModel = new Model(null, expectation.test_values);
			let value = TestModel.getValue('test_key');
			chai.assert(value === 'test', 'Incorrect value returned');
			done();
		});

		it('Add Value', done => {
			let TestModel = new Model(null, expectation.test_values);
			let value = TestModel.addValue('test_key2', 'test2').getValue('test_key2');
			chai.assert(value === 'test2', 'Incorrect value returned');
			done();
		});

		it('Delete Value', done => {
			let TestModel = new Model(null, expectation.test_values);
			let value = TestModel.deleteValue('test_key').getValue('test_key');
			chai.assert(value === undefined, 'Incorrect value deleted');
			done();
		});

		it('Set Attributes', done => {
			let TestModel = new Model();
			TestModel.setAttributes(expectation.test_attributes);
			let attributes = TestModel.getAttributes();
			chai.assert(Object.keys(attributes).length === 1, 'Incorrect length of set attributes');
			done();
		});

		it('Get Attributes', done => {
			let TestModel = new Model(expectation.test_attributes);
			let attributes = TestModel.getAttributes();
			chai.assert(Object.keys(attributes).length === 1, 'Incorrect length of set attributes');
			done();
		});

		it('Get Attribute', done => {
			let TestModel = new Model(expectation.test_attributes);
			let attribute = TestModel.getAttribute('test_key');
			chai.assert(attribute.required === true && attribute.type === 'string', 'Incorrect attribute returned');
			done();
		});

		it('Add Attribute', done => {
			let TestModel = new Model(expectation.test_attributes);
			let attribute = TestModel.addAttribute('test_key2', { required: false, type: 'number' }).getAttribute('test_key2');
			chai.assert(attribute.required === false && attribute.type === 'number', 'Incorrect attribute added');
			done();
		});

		it('Delete Attribute', done => {
			let TestModel = new Model(expectation.test_attributes);
			let attribute = TestModel.deleteAttribute('test_key').getAttribute('test_key');
			chai.assert(!attribute, 'Incorrect attribute deleted');
			done();
		});

		it('Is Valid', done => {
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');
			done();
		});

		it('Custom Validation', done => {
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			let valid = TestModel.custom_validation();
			chai.assert(valid === null, 'Incorrect Validation');
			done();
		});

		it('Validate Pass', done => {
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			let valid = TestModel.validate();
			chai.assert(valid.toString('test_key') === 'test', 'Incorrect Validation');
			done();
		});

		it('Validate Fail', done => {
			let expectation = {
				test_values: { test_key: 'test' },
				test_attributes: { test_key: { required: true, type: 'integer' } }
			};
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			try { TestModel.validate(); }
			catch(e) {
				chai.assert(JSON.parse(e.message)[0] === 'test_key should be of type integer');
			}
			done();
		});

		it('Test', done => {
			let test_key = 'test_key';
			let TestModel = new Model(expectation.test_attributes, expectation.test_values);
			let valid = TestModel.test(expectation.test_attributes[test_key], test_key);
			chai.assert(!valid, 'Incorrect Validation');
			done();
		});
	});

	describe('Options Tests', () => {

		let test_expectation = {
			test_options: { output: true },
			test_options2: { input: true },
			test_values: { test_key: 'test' },
			test_attributes: { test_key: { required: true, type: 'string' } }
		};

		it('Default Value Valid', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'integer',
				default_value: 0
			};

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			done();
		});

		it('Default Value Invalid', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'integer',
				default_value: () => {
					return false;
				}
			};

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			done();
		});

		it('Output only Value Valid', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				input: true,
				required: true,
				type: 'integer'
			};

			let TestModel = new Model(expectation.test_attributes, expectation.test_values, expectation.test_options);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			done();
		});

		it('Output only Value Fail', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				output: true,
				required: true,
				type: 'integer'
			};

			let TestModel = new Model(expectation.test_attributes, expectation.test_values, expectation.test_options);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			done();
		});

		it('Input only Value Valid', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				output: true,
				required: true,
				type: 'integer'
			};

			let TestModel = new Model(expectation.test_attributes, expectation.test_values, expectation.test_options2);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			done();
		});

		it('Input only Value Fail', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				input: true,
				required: true,
				type: 'integer'
			};

			let TestModel = new Model(expectation.test_attributes, expectation.test_values, expectation.test_options2);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			done();
		});

		it('Custom Validation Pass', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key.custom = [
				(value) => {
					return value === 'test' ? null : 'value should equal test';
				}
			];

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			valid = TestModel.validate();
			chai.assert(valid.toString('test_key') === 'test', 'Incorrect Validation');

			done();
		});

		it('Custom Validation Fail', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key.custom = [
				(value) => {
					return value !== 'test' ? null : 'value should not equal test';
				}
			];

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			try { TestModel.validate(); }
			catch(e) {
				chai.assert(JSON.parse(e.message)[0] === 'value should not equal test');
			}

			done();
		});

		it('Transform Value Pass', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'boolean',
				transform: (value) => {
					return !!value;
				}
			};

			expectation.test_values.test_key2 = '0.2';

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			valid = TestModel.validate();
			chai.assert(valid.toString('test_key') === 'test', 'Incorrect Validation');

			done();
		});

		it('Transform Value Fail', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'integer',
				transform: (value) => {
					return !!value;
				}
			};

			expectation.test_values.test_key2 = 0;

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			try { TestModel.validate(); }
			catch(e) {
				chai.assert(JSON.parse(e.message)[0] === 'test_key2 should be of type integer');
			}

			done();
		});

		it('Choices Validation Pass', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key.choices = [ 'test' ];

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			valid = TestModel.validate();
			chai.assert(valid.toString('test_key') === 'test', 'Incorrect Validation');

			done();
		});

		it('Choices Validation Fail', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key.choices = [ 'test2', 'fake_test' ];

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			try { TestModel.validate(); }
			catch(e) {
				chai.assert(JSON.parse(e.message)[0] === 'test_key of type string should be one of test2,fake_test');
			}

			done();
		});

		it('Alias Value Pass', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'string',
				alias: 'test_key'
			};

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			valid = TestModel.validate();
			chai.assert(valid.toString('test_key2') === 'test', 'Incorrect Validation');

			done();
		});

		it('Alias Value Array Pass', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'string',
				alias: [ 'test_key', 'test_key' ]
			};

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			valid = TestModel.validate();
			chai.assert(valid.toString('test_key2') === 'test test', 'Incorrect Validation');

			done();
		});

		it('Alias Value Fail', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'integer',
				alias: 'test_key'
			};

			expectation.test_values.test_key2 = 0;

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			try { TestModel.validate(); }
			catch(e) {
				chai.assert(JSON.parse(e.message)[0] === 'test_key2 should be of type integer');
			}

			done();
		});

		it('Items for array pass', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'array',
				items: {
					type: 'string',
					required: true
				}
			};

			expectation.test_values.test_key2 = ['a', 'b', 'c'];

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			valid = TestModel.validate();
			chai.assert(valid.toString('test_key') === 'test', 'Incorrect Validation');

			done();
		});

		it('Items for array pass not required', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'array',
				items: {
					type: 'string',
					required: false
				}
			};

			expectation.test_values.test_key2 = ['a', 'b', null];

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			valid = TestModel.validate();
			chai.assert(valid.toString('test_key') === 'test', 'Incorrect Validation');

			done();
		});

		it('Items for array fail required', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'array',
				items: {
					type: 'string',
					required: true
				}
			};

			expectation.test_values.test_key2 = ['a', 'b', null];

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			try { TestModel.validate(); }
			catch(e) {
				chai.assert(JSON.parse(e.message)[0] === '2 of type string is required');
			}

			done();
		});

		it('Items for array fail invalid type', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'array',
				items: {
					type: 'string',
					required: false
				}
			};

			expectation.test_values.test_key2 = ['a', 'b', 2];

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			try { TestModel.validate(); }
			catch(e) {
				chai.assert(JSON.parse(e.message)[0] === '2 should be of type string');
			}

			done();
		});

		it('Items for object pass', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'object',
				items: {
					type: 'string',
					required: true
				}
			};

			expectation.test_values.test_key2 = { a: 'a', b: 'b', c: 'c' };

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			valid = TestModel.validate();
			chai.assert(valid.toString('test_key') === 'test', 'Incorrect Validation');

			done();
		});

		it('Items for object pass not required', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'object',
				items: {
					type: 'string',
					required: false
				}
			};

			expectation.test_values.test_key2 = { a: 'a', b: 'b', c: null };

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === true, 'Incorrect Validation');

			valid = TestModel.validate();
			chai.assert(valid.toString('test_key') === 'test', 'Incorrect Validation');

			done();
		});

		it('Items for object fail required', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'object',
				items: {
					type: 'string',
					required: true
				}
			};

			expectation.test_values.test_key2 = { a: 'a', b: 'b', c: null };

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			try { TestModel.validate(); }
			catch(e) {
				chai.assert(JSON.parse(e.message)[0] === 'c of type string is required');
			}

			done();
		});

		it('Items for object fail invalid type', done => {
			let expectation = _.cloneDeep(test_expectation);
			expectation.test_attributes.test_key2 = {
				required: true,
				type: 'object',
				items: {
					type: 'string',
					required: false
				}
			};

			expectation.test_values.test_key2 = { a: 'a', b: 'b', c: 2 };

			let TestModel = new Model(expectation.test_attributes, expectation.test_values);

			let valid = TestModel.isValid();
			chai.assert(valid === false, 'Incorrect Validation');

			try { TestModel.validate(); }
			catch(e) {
				chai.assert(JSON.parse(e.message)[0] === 'c should be of type string');
			}

			done();
		});
	});

	describe('Validation', () => {
		describe('Invalid Type', () => {
			let type = 'invalid';
			let test_key = 'test_key';
			let expectation = {
				label: 'Invalid Type Set',
				test_values: { test_key: null },
				test_return: `No validation function for type ${type} used for ${test_key}`,
				test_attributes: { test_key: { required: false, type: type } }
			};

			runTests([expectation]);
		});

		describe('Custom Validation (Pass)', () => {
			let minlength = 3;
			let type = 'string';
			let error = `value did not pass minimum length(${minlength}) requirement`;
			let expectation = {
				test_return: null,
				test_values: { test_key: 'test' },
				label: 'Custom (Min Length - Pass)',
				test_attributes: { test_key: { required: true, type: type, custom: [
					function(value) { return value && value.length >= minlength ? null : error; }
				] } }
			};

			runTests([expectation]);
		});

		describe('Custom Validation (Fail)', () => {
			let minlength = 10;
			let type = 'string';
			let error = `value did not pass minimum length(${minlength}) requirement`;
			let expectation = {
				test_return: error,
				test_values: { test_key: 'test' },
				label: 'Custom (Min Length - Fail)',
				test_attributes: { test_key: { required: true, type: type, custom: [
					function(value) { return value && value.length >= minlength ? null : error; }
				] } }
			};

			runTests([expectation]);
		});

		describe('String Validation', () => {
			let type = 'string';
			let valid_value = '';
			let invalid_value = 0;
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Alpha Validation', () => {
			let type = 'alpha';
			let valid_value = 'a';
			let invalid_value = '';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Alpha Numeric Validation', () => {
			let type = 'alpha_numeric';
			let valid_value = 'a1';
			let invalid_value = '';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Number Validation', () => {
			let type = 'number';
			let valid_value = 0;
			let invalid_value = '';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Integer Validation', () => {
			let type = 'integer';
			let valid_value = 0;
			let invalid_value = '';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Float Validation', () => {
			let type = 'float';
			let invalid_value = '';
			let valid_value = 1.234;
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Date Validation', () => {
			let type = 'date';
			let invalid_value = '';
			let valid_value = new Date();
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Time Validation', () => {
			let type = 'time';
			let invalid_value = '';
			let valid_value = '09:00';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Date Time Validation', () => {
			let type = 'datetime';
			let invalid_value = '';
			let valid_value = '1900-01-01 09:00:00';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Date Range Validation', () => {
			let type = 'daterange';
			let invalid_value = '';
			let valid_value = JSON.stringify(['1900-01-01 09:00:00', '1900-01-01 09:00:00']);
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Timestamp Validation', () => {
			let type = 'timestamp';
			let invalid_value = '';
			let valid_value = '1900-01-01 09:00:00.000+00';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Email Validation', () => {
			let type = 'email';
			let invalid_value = '';
			let valid_value = 'test@test.com';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Phone Validation', () => {
			let type = 'phone';
			let invalid_value = '';
			let valid_value = '07584341234';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Boolean Validation', () => {
			let type = 'boolean';
			let invalid_value = '';
			let valid_value = false;
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Function Validation', () => {
			let type = 'function';
			let invalid_value = '';
			let valid_value = function(){};
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Object Validation', () => {
			let type = 'object';
			let valid_value = {};
			let invalid_value = [];
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Array Validation', () => {
			let type = 'array';
			let valid_value = [];
			let invalid_value = {};
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('JSON Validation', () => {
			let type = 'json';
			let valid_value = '{}';
			let invalid_value = '';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('IP Validation', () => {
			let type = 'ip';
			let invalid_value = '';
			let valid_value = '127.0.0.1';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('URL Validation', () => {
			let type = 'url';
			let invalid_value = '';
			let valid_value = 'https://www.test.com';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('FQDN Validation', () => {
			let type = 'fqdn';
			let invalid_value = '';
			let valid_value = 'test.com';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('UUID Validation', () => {
			let type = 'uuid';
			let invalid_value = '';
			let valid_value = '426fc69a-7572-4c39-95a7-683a97166973';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Slug Validation', () => {
			let type = 'slug';
			let invalid_value = '426fc69a-7572-4c39-95a7-683a97166973';
			let valid_value = 'slug';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Base64 Validation', () => {
			let type = 'base64';
			let invalid_value = '';
			let valid_value = 'YmFzZTY0';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Hexadecimal Validation', () => {
			let type = 'hex';
			let invalid_value = '';
			let valid_value = '686578';
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});

		describe('Buffer Validation', () => {
			let type = 'buffer';
			let invalid_value = '';
			let valid_value = new Buffer('');
			let values = [ undefined, valid_value, invalid_value, undefined, valid_value, invalid_value ];
			let expectations = createExpectations(type, values);
			runTests(expectations);
		});
	});
});
