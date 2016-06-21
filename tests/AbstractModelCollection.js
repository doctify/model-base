'use strict';

const chai = require('chai');
const Model = require('../model');
const ModelCollection = require('../model_collection');


// test collection of collections
//
// collection fails different types
//
// collection fails different types failed model
//
// collection passes same types same models
//
// models coerced
//
// regular object coerced

let test_attributes = {
	test_string: {
		type: 'string',
		'required': true,
		defaultValue: 'blah',
		options: {} // None at the moment
	},
	test_object: {
		type: 'object',
		'required': true
	},
	test_number: {
		type: 'number',
		required: true
	},
	test_boolean: {
		type: 'boolean',
		required: true
	},
	test_uuid: {
		type: 'uuid',
		required: true
	},
	test_email: {
		type: 'email',
		required: true
	}
};

let test_values = [{
	test_number: 0,
	test_boolean: false,
	test_string: 'test',
	test_email: 'foo@test.com',
	test_object: { 'test': true },
	test_uuid: '426fc69a-7572-4c39-95a7-683a97166973'
}];

class TestModel1 extends Model {
	constructor(values) {
		super(test_attributes, values);
	}
}

class TestModel2 extends Model {
	constructor(values) {
		super(test_attributes, values);
	}
}

describe('AbstractModelCollection', () => {

	describe('Constructor', () => {
		it('Set Nothing', done => {
			let coll = new ModelCollection();
			chai.assert(coll.getValues().length === 0);
			chai.assert(coll.isValid() === true);
			done();
		});

		it('Set Only Type', done => {
			let coll = new ModelCollection(TestModel1);
			chai.assert(coll.getValues().length === 0);
			chai.assert(coll.isValid() === true);
			done();
		});

		it('Set Only Values', done => {
			let coll = new ModelCollection(null, test_values);
			chai.assert(coll.getValues().length === 1);
			chai.assert(coll.isValid() === false);
			done();
		});

		it('Set Type And Values (No Type Coercion)', done => {
			let coll = new ModelCollection(TestModel1, test_values);
			chai.assert(coll.getValues().length === 1);
			chai.assert(coll.isValid() === false);
			done();
		});

		it('Set Type And Values (Type Coercion)', done => {
			let coll = new ModelCollection(TestModel1, test_values, true);
			chai.assert(coll.getValues().length === 1);
			chai.assert(coll.isValid() === true);
			done();
		});
	});

	it('Coerce', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let model = coll.coerce(test_values[0]);
		let str = model.constructor.name;
		chai.assert(str === 'TestModel1', 'Incorrect Coercion of Model');
		done();
	});

	it('To String', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let str = coll.toString();
		chai.assert(str === 'TestModel1', 'Incorrect Stringification of Model Collection');
		done();
	});

	it('To JSON', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let json = coll.toJSON();
		chai.assert(json.length === 1 && json[0].test_string === 'test' && json[0].__attributes, 'Incorrect JSON representation of Model Collection');
		done();
	});

	it('To JSON (Strict)', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let json = coll.toJSON(null, true);
		chai.assert(json.length === 1 && json[0].test_string === 'test' && !json[0].__attributes, 'Incorrect JSON representation of Model Collection');
		done();
	});

	it('To JSON (No Attributes)', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let json = coll.toJSON(true);
		chai.assert(json.length === 1 && json[0].test_string === 'test' && !json[0].__attributes, 'Incorrect JSON representation of Model Collection');
		done();
	});

	it('To JSON (No Attributes | Strict)', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let json = coll.toJSON(true, true);
		chai.assert(json.length === 1 && json[0].test_string === 'test' && !json[0].__attributes, 'Incorrect JSON representation of Model Collection');
		done();
	});

	it('Set Values', done => {
		let coll = new ModelCollection(TestModel1);
		coll.setValues(test_values, true);
		let values = coll.getValues();
		chai.assert(Object.keys(values).length === 1, 'Incorrect length of set values');
		done();
	});

	it('Get Values', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let values = coll.getValues();
		chai.assert(Object.keys(values).length === 1, 'Incorrect length of set values');
		done();
	});

	it('Get Value', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let value = coll.getValue(0);
		chai.assert(value.getValues().test_string === 'test' && !value.getValues().__attributes, 'Incorrect Value Returned');
		done();
	});

	it('Get Value (Get Model Value)', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let value = coll.getValue(0, true);
		chai.assert(value.test_string === 'test' && !value.__attributes, 'Incorrect Value Returned');
		done();
	});

	it('Add Value', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let value = coll.addValue(test_values[0]).getValue(1);
		chai.assert(value.test_string === 'test' && !value.__attributes, 'Incorrect Value Returned');
		done();
	});

	it('Add Value (Coerce)', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let value = coll.addValue(test_values[0], null, true).getValue(1);
		chai.assert(value.test_string === 'test' && value.__attributes, 'Incorrect Value Returned');
		done();
	});

	it('Delete Value', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let value = coll.deleteValue(0).getValue(0);
		chai.assert(value === undefined, 'Incorrect value deleted');
		done();
	});

	it('Get Type', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let type = coll.getType();
		chai.assert(type.name === 'TestModel1', 'Incorrect model type returned');
		done();
	});

	it('Set Type', done => {
		let coll = new ModelCollection(null, test_values, true);
		let type = coll.setType(TestModel1).getType();
		chai.assert(type.name === 'TestModel1', 'Incorrect model type set');
		done();
	});

	it('Set Type (Coerce)', done => {
		let coll = new ModelCollection(null, test_values, true);
		let type = coll.setType(TestModel2, true).getType();
		let value = coll.getValue(0);
		chai.assert(type.name === 'TestModel2' && value.constructor.name === type.name, 'Incorrect model type set and coerced');
		done();
	});

	it('Is Valid', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let valid = coll.isValid();
		chai.assert(valid === true, 'Incorrect Validation');
		done();
	});

	it('Validate', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let valid = coll.validate();
		chai.assert(valid.toString() === 'TestModel1', 'Incorrect validation');
		done();
	});

	it('Test', done => {
		let coll = new ModelCollection(TestModel1, test_values, true);
		let valid = coll.test();
		chai.assert(valid === 'Model collection does not have a valid type to validate its models', 'Incorrect validation');
		done();
	});
});
