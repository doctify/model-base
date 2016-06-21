'use strict';

const ModelUtilities = require('./model_utilities');

const flattenArray = ModelUtilities.flattenArray;
const cloneObject = ModelUtilities.cloneObject;
const isFunction = ModelUtilities.isFunction;

/**
 * Model Class
 * @type { Model Class } type [ Model Class used to validate the collection ]
 * @type { object } values [ optional values that can be set at initialization time that will be validated against model ]
 * @type { boolean } coerce [ if true this will force all objects in the values array to the accurate Model Type ]
 */
module.exports = class ModelCollection {
	constructor(type, values, coerce) {
		this.setType(type);
		this.setValues(values, coerce);
	}

	/**
	 * @param  { boolean } strict [ set true to retrieve only the keys that the model attributes specifies and false to retrieve all keys on model ]
	 * @return { object } [ the collection of models stored in collection ]
	 */
	toJSON(no_attributes, strict) {
		let json = [];
		let collection = this.__collection;

		Object.keys(collection).forEach( key => {
			let value = this.getValue(key);
			if(!value || !value.toJSON || !isFunction(value.toJSON)) { return json.push(value); }
			json.push(value.toJSON(no_attributes, strict));
		});

		return json;
	}

	/**
	 * @return { string } converts collection to string
	 */
	toString() {
		let type = this.getType();
		return `${type && type.name || ''}`;
	}

	coerce(value) {
		let type = this.getType();

		if(type && isFunction(type)) {
			value =  new ( type )(value.getValues ? value.getValues() : value );
		}

		return value;
	}

	/**
	 * @param { Model Class } type [ Model Class used to validate the collection ]
	 */
	setType(type, coerce) {
		this.__type = type;
		if(coerce) { this.setValues(this.getValues(), coerce); }
		return this;
	}

	/**
	 * @return { Model Class } [ Model Class used to validate the collection ]
	 */
	getType() {
		return this.__type;
	}

	/**
	 * @param  { boolean } strict [ set true to retrieve only the keys that the model attributes specifies and false to retrieve all keys on model ]
	 * @return { object } [ the collection of models stored in collection ]
	 */
	getValues(strict) {
		return this.toJSON(true, strict);
	}

	/**
	 * @param { object } values [ object of values/models to set in collection ]
	  * @param { boolean } coerce [ if true this will force all objects in the values array to the accurate Model Type ]
	 * @return { model } [ this instance of the model ]
	 */
	setValues(values, coerce) {
		let collection = [];
		values = values || [];

		Object.keys(values).forEach( key => {
			let value = values[key];

			if(coerce) { value = this.coerce(value); }

			value = cloneObject(value);

			collection.push(value);
		});

		this.__collection = collection;
		return this;
	}

	/**
	 * @param  { string } key [ key to determine the value to return from collection ]
	 * @return { any } [ value returned from the collection using the key ]
	 */
	getValue(key, strict) {
		let value = this.__collection[key];
		if(strict && value.getValues) { value = value.getValues(strict); }
		return value;
	}

	/**
	 * @param { string } key [ key to set against the collection ]
	 * @param { any } value [ value to set using the key ]
	 */
	addValue(value, key, coerce) {
		if(coerce) { value = this.coerce(value); }

		if(key) {
			this.__collection[key] = value;
		} else {
			this.__collection.push(value);
		}
		return this;
	}

	/**
	 * @param  { string } key [ key determining the value to delete from collection ]
	 * @return { collection } [ this instance of the model collection ]
	 */
	deleteValue(key) {
		delete this.__collection[key];
		return this;
	}

	/**
	 * @return { boolean | error } [ returns a boolean if valid and throws an error if invalid ]
	 */
	validate() {
		let errors = this.isValid(true);
		if(!errors || !errors.length) { return this; }
		throw new Error(JSON.stringify(errors));
	}

	/**
	 * @param  { boolean } return_errors [ if true returns an array of objects else returns a boolean stating if collection of models is valid ]
	 * @return { boolean | array } [ boolean stating if collection of models is valid or an array of errors ]
	 */
	isValid(return_errors) {
		let errors = [];
		let type = this.getType();
		let collection = this.getValues();

		Object.keys(collection).forEach( key => {
			let value = this.getValue(key);
			let error = this.test(value, type, key);
			if(error) { errors.push(error); }
		});

		errors = flattenArray(errors);

		if(return_errors) {
			return errors.length ? errors : null;
		}

		return errors.length ? false : true;
	}

	/**
	 * @param  { model } value [ attribute with validation definitions for that key in the model ]
	 * @param  { Model Class } type [ Model Class that collection is being validated against ]
	 * @param  { string } key [ key being tested ]
	 * @return { string } [ string specifing the error or null if no error ]
	 */
	test(value, type, key) {
		// Validation Type
		if( !type || !isFunction(type) ) {
			return `Model collection does not have a valid type to validate its models`;
		}

		// Validation Instance Type
		if( !(value instanceof type) ) {
			return `Model at index(${key}) of type ${value.constructor.name} is not an instance of ${type.name}`;
		}

		// Validate Model
		let errors = value.isValid(true);
		return errors;
	}
};

/* SAMPLE USAGE
	const Model = require(global.api_path + 'common/utils/model');
	const ModelCollection = require(global.api_path + 'common/utils/model_collection');


	let attributes = {
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
	let values = {
		test_number: 0,
		test_boolean: false,
		test_string: 'test',
		test_email: 'foo@test.com',
		test_object: { 'test': true },
		test_uuid: '426fc69a-7572-4c39-95a7-683a97166973'
	};


	class TestModel1Collection extends ModelCollection {};

	class TestModel1 extends Model {
		constructor(values) {
			super(attributes, values);
		}
	}

	class TestModel2 extends Model {
		constructor(values) {
			super(attributes, values);
		}
	}

	let coll = new TestModel1Collection(TestModel1);

	let collection = [ new TestModel1(values), new TestModel2(values), new Model(attributes, values), values ];

	coll.setValues(collection, true);

	console.log(coll.getValues());

	console.log(coll.validate());


*/
