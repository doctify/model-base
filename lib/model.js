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
	isObject,
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
	constructor(attributes, values, options) {
		this.setAttributes(attributes);
		this.setOptions(options);
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
		let attribute_keys = ['__attributes', '__options'];

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
	 * @return { object } [ returns the attributes defining the model's validation ]
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
	 * @return { object } [ returns the options defining the model ]
	 */
	getOptions() {
		return this.__options;
	}

	/**
	 * @param { object } options [ set options definining the model ]
	 * @return { model } [ this instance of the model ]
	 */
	setOptions(options) {
		this.__options = cloneObject(options || {});
		return this;
	}

	/**
	 * @param  { string } key [ the key of value retrieving from options ]
	 * @return { object } [ the option corresponding to the key passed in ]
	 */
	getOption(key) {
		return this.__options[key];
	}

	/**
	 * @param { string } key [ key to extend the options object with a new option ]
	 * @param { any } value [ the model validation object to add to options ]
	 * @return { model } [ this instance of the model ]
	 */
	addOption(key, value) {
		this.__options[key] = cloneObject(value || {});
		return this;
	}

	/**
	 * @param  { string } key [ key to delete from options object ]
	 * @return { model } [ this instance of the model ]
	 */
	deleteOption(key) {
		delete this.__options[key];
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
	 * @return { array } [ attribute keys ]
	 */
	mergeKeys(values) {
		let attributes = this.getAttributes();

		let merged = Object.assign({}, values, attributes);
		let keys = Object.keys(merged);
		merged = null;

		return keys;
	}

	/**
	 * @param { object } values [ object of values to set on model ]
	 * @return { model } [ this instance of the model ]
	 */
	setValues(values) {
		values = values || {};

		let keys = this.mergeKeys(values);
		let isInput = this.getOption('input');
		let isOutput = this.getOption('output');

		let reduceAlias = (a, b) => [ a, this.getValue(b) ].join(' ').trim();

		keys.forEach((key) => {
			let attribute = this.getAttribute(key);

			if( attribute && (
				(attribute.input && isOutput) ||
				(attribute.output && isInput)
			)) { return; }

			let type = attribute && exists(attribute.type) && attribute.type;
			let transform = attribute && isFunction(attribute.transform) && attribute.transform;

			let value = values && exists(values[key]) ? values[key] : undefined;
			value = ( type !== 'function' && isFunction(value) ) ? value(key, type) : value;

			if(attribute && attribute.alias) {
				let alias = attribute.alias;
				value = !isArray(alias) ? this.getValue(alias) : alias.reduce(reduceAlias, '');
			}

			let default_value = attribute && exists(attribute.default_value) ? attribute.default_value : undefined;
			default_value = ( type !== 'function' && isFunction(default_value) ) ? default_value(key, type) : default_value;

			let final_value =  exists(value) ? value : default_value;
			final_value = isFunction(transform) ? transform(final_value) : final_value;

			this[key] = final_value;
		});

		keys = null;
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

		let isInput = this.getOption('input');
		let isOutput = this.getOption('output');

		Object.keys(attributes).forEach((key) => {
			let attribute = this.getAttribute(key);

			if( attribute && (
				(attribute.input && isOutput) ||
				(attribute.output && isInput)
			)) { return; }

			let error = this.test(attribute, key);
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

		errors = flattenArray(errors);

		return errors.length ? errors : null;
	}

	/**
	 * @param  { object } attribute [ attribute with validation definitions for that key in the model ]
	 * @param  { string } key [ key being tested ]
	 * @return { string } [ string specifing the error or null if no error ]
	 */
	test(attribute, key) {
		let value = this[key];

		// Validation Function exists
		if(!ModelValidator[attribute.type]) { return `No validation function for type ${attribute.type} used for ${key}`; }

		// Validate required and value exists
		if(!attribute.required && !exists(value)) { return; }
		if( attribute.required && !exists(value)) { return `${key} of type ${attribute.type} is required`; }

		// Validate type and value is of type
		if(!ModelValidator[attribute.type](value, attribute.options)) { return `${key} should be of type ${attribute.type}`; }

		// Validate an array of choices against the value
		if(
			attribute.choices &&
			attribute.choices.length &&
			isArray(attribute.choices) &&
			!attribute.choices.includes(value)
		) { return `${key} of type ${attribute.type} should be one of ${attribute.choices}`; }

		// Validate each element in an array / object
		if(attribute.items && (isArray(value) || isObject(value))) {
			let testItemValues = (key) => this.test.call(value, attribute.items, key);
			let error = Object.keys(value).map(testItemValues).filter(error => error);
			if(error) { return error; }
		}

		// Custom Validation Tests
		if(attribute.custom) { return this.custom_validation(this[key], attribute.custom, attribute.options); }
	}
};
