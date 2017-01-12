/* SAMPLE USAGE
	// Data Can be set initially or using its set methods
	let values = {};
	let attributes = {};
	let TestModel = new Model(attributes, values);

	// It could also be extended
	class ExtendedModel extends Model {
		constructor() {
			super(..arguments);
		}
		// Extended Methods
	}

	TestModel = new ExtendedModel(attributes, values);

	TestModel.setAttributes({
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
	});

	TestModel.setValues({
		test_number: 0,
		test_boolean: false,
		test_string: 'test',
		test_email: 'foo@test.com',
		test_object: { 'test': true },
		test_uuid: '426fc69a-7572-4c39-95a7-683a97166973'
	});

	console.log('\nAttributes');
	console.log(TestModel.getAttributes());

	console.log('\nValues');
	console.log(TestModel.getValues());

	console.log('\nStringified');
	console.log(JSON.stringify(TestModel));

	console.log('\nIs Valid');
	console.log(TestModel.isValid());

	console.log('\nValidate'); // Throws Error
	console.log(TestModel.validate());
*/

const {
	exists,
	isArray,
	isFunction,
	cloneObject,
	flattenArray
} = require('./model_utilities');

const ModelValidator = require('./model_validator');

/**
 * Model Class
 * @type { object } attributes [ object representing the structure the model should take ]
 * @type { object } values [ optional values that can be set at initialization time that will be validated against model ]
 */
module.exports = class Model {
	constructor(attributes, values) {
		this.setAttributes(attributes);
		this.setValues(values);
	}

	/**
	 * @param  { boolean } no_attributes [ set true to remove __attributes as part of collection ]
	 * @param  { boolean } strict [ set true to retrieve only the keys that the model attributes specifies and false to retrieve all keys on model ]
	 * @return { object } [ the collection of values stored in model ]
	 */
	toJSON(no_attributes, strict) {
		let json = {};
		let attributes = this.getAttributes();
		let attribute_keys = ['__attributes'];

		let keys = strict ? Object.keys(attributes) : Object.keys(this);

		( keys || [] ).forEach( key => {
			if(no_attributes && attribute_keys.includes(key)) { return; }
			if(isFunction(this[key])) { return; }
			json[key] = this[key];
		});

		return json;
	}

	/**
	 * @return { string } converts model to string
	 */
	toString(name_key, id_key) {
		let id = `${this.getValue(name_key || 'name') || ''}-${this.getValue(id_key || 'id') || ''}`;
		return id.replace(/^\-/, '').replace(/\-$/, '');
	}

	/**
	 * @return { object } [ returns the attributes definiing the model's validation ]
	 */
	getAttributes() {
		return this.__attributes;
	}

	/**
	 * @param { object } attributes [ set attributes definining the model's validation ]
	 * @return { model } [ this instance of the model ]
	 */
	setAttributes(attributes) {
		this.__attributes = cloneObject(attributes || {});
		return this;
	}

	/**
	 * @param  { string } key [ the key of value retrieving from attributes ]
	 * @return { object } [ the attribute corresponding to the key passed in ]
	 */
	getAttribute(key) {
		return this.__attributes[key];
	}

	/**
	 * @param { string } key [ key to extend the attributes object with a new model validation definition ]
	 * @param { value } value [ the model validation object to add to attributes ]
	 * @return { model } [ this instance of the model ]
	 */
	addAttribute(key, value) {
		this.__attributes[key] = cloneObject(value || {});
		return this;
	}

	/**
	 * @param  { string } key [ key to delete from attributes object ]
	 * @return { model } [ this instance of the model ]
	 */
	deleteAttribute(key) {
		delete this.__attributes[key];
		return this;
	}

	/**
	 * @param  { boolean } strict [ set true to retrieve only the keys that the model attributes specifies and false to retrieve all keys on model ]
	 * @return { object } [ the collection of values stored in model ]
	 */
	getValues(strict) {
		return this.toJSON(true, strict);
	}

	/**
	 * @param { object } values [ object of values to set on model ]
	 * @return { model } [ this instance of the model ]
	 */
	setValues(values) {
		values = values || {};
		let attributes = this.getAttributes();

		// Dedupes array of keys by creating clone
		// making it a Set ( so only one key to each value )
		// and then using the spread operator to take the set back to an array
		let set = [...new Set(
			Object.assign([],
				Object.keys(values),
				Object.keys(attributes)
			))
		];

		set.forEach((key) => {
			let attribute = this.getAttribute(key);

			let type = attribute && exists(attribute.type) && attribute.type;
			let transform = attribute && isFunction(attribute.transform) && attribute.transform;

			let value = values && exists(values[key]) ? values[key] : undefined;
			value = ( type !== 'function' && isFunction(value) ) ? value(key, type) : value;

			let default_value = attribute && exists(attribute.default_value) ? attribute.default_value : undefined;
			default_value = ( type !== 'function' && isFunction(default_value) ) ? default_value(key, type) : default_value;

			let final_value =  exists(value) ? value : default_value;
			final_value = isFunction(transform) ? transform.call(this, final_value) : final_value;

			this[key] = final_value;
		});

		return this;
	}

	/**
	 * @param  { string } key [ key to determine the value to return from model ]
	 * @return { any } [ value returned from the model using the key ]
	 */
	getValue(key) {
		return this[key];
	}

	/**
	 * @param { string } key [ key to set against the model ]
	 * @param { any } value [ value to set using the key ]
	 */
	addValue(key, value) {
		let values =  {};
		values[key] = value;
		this.setValues(values);
		return this;
	}

	/**
	 * @param  { string } key [ key determining the value to delete from model ]
	 * @return { model } [ this instance of the model ]
	 */
	deleteValue(key) {
		delete this[key];
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
	 * @param  { boolean } return_errors [ if true returns an array of objects else returns a boolean stating if model is valid ]
	 * @return { boolean | array } [ boolean stating if model is valid or an array of errors ]
	 */
	isValid(return_errors) {
		let errors = [];
		let attributes = this.getAttributes();

		Object.keys(attributes).forEach((key) => {
			let attr = this.getAttribute(key);
			let error = this.test(attr, key);
			if(error) { errors.push(error); }
		});

		errors = flattenArray(errors);

		if(return_errors) {
			return errors.length ? errors : null;
		}

		return errors.length ? false : true;
	}

	/**
	 * @type { any } value [ value to validate ]
	 * @type { array } tests [ collection of custom tests to run ]
	 * @type { object } options [ optional object with extra constraints]
	 * @return { string | null } Error message from invalid test or null if all valid
	 * @description Set of custom validation functions to be used to test a value
	 */
	custom_validation(value, tests, options) {
		let errors = [];

		( tests || [] ).forEach((test) => {
			if(!test || !isFunction(test)) { return; }
			let error = test(value, options);
			if(error) { errors.push(error); }
		});

		return errors.length ? errors : null;
	}

	/**
	 * @param  { object } attr [ attribute with validation definitions for that key in the model ]
	 * @param  { string } key [ key being tested ]
	 * @return { string } [ string specifing the error or null if no error ]
	 */
	test(attr, key) {
		// Validation Function exists
		if(!ModelValidator[attr.type]) { return `No validation function for type ${attr.type} used for ${key}`; }

		// Validate required and value exists
		if(!attr.required && !exists(this[key])) { return; }
		if( attr.required && !exists(this[key])) { return `${key} of type ${attr.type} is required`; }

		// Validate type and value is of type
		if(!ModelValidator[attr.type](this[key], attr.options)) { return `${key} should be of type ${attr.type}`; }

		if(
			attr.choices &&
			attr.choices.length &&
			isArray(attr.choices) &&
			!attr.choices.includes(this[key])
		) { return `${key} of type ${attr.type} should be one of ${attr.choices}`; }

		// Custom Validation Tests
		if(attr.custom) { return this.custom_validation(this[key], attr.custom, attr.options); }
	}
};
