const _ 			= require('lodash');
const moment 		= require('moment');

/**
 * a no operation function helper
 * @return {void}
 */
const noop = () => undefined;

/**
 * @param  { any } [ value to test for existence ]
 * @return { boolean } [ true / false if parameter exists ]
 * @description  Tests value to see if it exists
 */
const exists = (value) => {
	return ( value || value === false || value === 0 || value === '') &&
	!( _.isNull(value) || _.isUndefined(value) || _.isNaN(value) );
};

module.exports.exists = exists;

/**
 * @param  { any } value [ value to test is an object ]
 * @return { boolean } [ true / false if parameter is a object ]
 * @description  Tests value to see if it is a valid object
 */
module.exports.isObject = (value) => {
	return typeof value === 'object' && value !== null;
};

/**
 * @param  { any } value [ value to test is an array ]
 * @return { boolean } [ true / false if parameter is an array ]
 * @description  Tests value to see if it is a valid array
 */
module.exports.isArray = (value) => {
	return Array.isArray(value);
};

/**
 * @param  { any } value [ value to test is a function ]
 * @return { boolean } [ true / false if parameter is a function ]
 * @description  Tests value to see if it is a valid function object
 */
module.exports.isFunction = (value) => {
	return typeof value === 'function';
};

/**
 * @param  { array } value [ array of arrays ]
 * @return { array } [ a flattened array ]
 * @description  Flatten an array of arrays into a single array
 */
module.exports.flattenArray = (value) => {
	return [].concat.apply([], value);
};

/**
 * ForEach iteration function that can be used on objects
 * @param  {object}   obj object to iteration over
 * @param  {function} cb  function to run on elements of the object
 * @return {void}
 */
module.exports.forEach = (obj = {}, cb = noop) => {
	for(let key in obj) {
		if(!obj.hasOwnProperty(key)) { continue; }
		cb(key, obj[key]);
	}
};

/**
 * map iteration function that can be used on objects
 * @param  {object}   obj object to iteration over
 * @param  {function} cb  function to run on elements of the object
 * @return {void}
 */
module.exports.mapFilter = (obj = {}, cb = noop) => {
	let arr = [];
	for(let key in obj) {
		if(!obj.hasOwnProperty(key)) { continue; }
		let value = cb(key, obj[key]);
		if(exists(value) || value === null) {
			arr.push(value);
		}
	}
	return arr;
};

/**
 * @param  { date } value [ date to validate ]
 * @param  { array } formats [ array of formats to validate against ]
 * @return { boolean } [ if date is valid according to formats ]
 * @description  Clone object
 */
 module.exports.validateMoment = (value, formats) => {
	return formats.some((format) => {
		return moment(value, format).isValid() ||
		( value && value.toISOString ?
			moment(value.toISOString()).isValid() : false
		);
	});
 };
