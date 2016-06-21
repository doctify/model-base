
const _ = require('lodash');

/**
 * @param  { any } [ value to test for existence ]
 * @return { boolean } [ true / false if parameter exists ]
 * @description  Tests value to see if it exists
 */
module.exports.exists = (value) => {
	return ( value || value === false || value === 0 || value === '') &&
	!( _.isNull(value) || _.isUndefined(value) || _.isNaN(value) );
};

/**
 * @param  { any } value [ value to test is an object ]
 * @return { boolean } [ true / false if parameter is a object ]
 * @description  Tests value to see if it is a valid object
 */
module.exports.isObject = (value) => {
	return typeof value === 'object' && value !== null;
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
 * @param  { object } value [ object to clone ]
 * @return { object } [ a cloned object ]
 * @description  Clone object
 */
module.exports.cloneObject = (value) => {
	return _.isPlainObject(value) ? Object.assign({}, value) : value;
};
