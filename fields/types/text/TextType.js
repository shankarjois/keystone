var FieldType = require('../Type');
var util = require('util');
var utils = require('keystone-utils');

/**
 * Text FieldType Constructor
 * @extends Field
 * @api public
 */
function text (list, path, options) {
	this.options = options;
	this._nativeType = String;
	this._properties = ['monospace'];
	this._underscoreMethods = ['crop'];
	text.super_.call(this, list, path, options);
}
text.properName = 'Text';
util.inherits(text, FieldType);

text.prototype.validateInput = function (data, callback) {
	var max = this.options.max;
	var min = this.options.min;
	var value = this.getValueFromData(data);
	var result1 = true;
	var result2 = true;
	var result3 = true;
	var lmin = (!min)? 0: Math.max(min,0); // min cannot benegative
	var lmax = (!max)? 2000: Math.min(max,2000); // cap max at 2000
	lmax = Math.max(lmax,0,lmin); // max cannot be nagative, max shd be atleast equal to min
	result1 = value === undefined || value === null || typeof value === 'string';
	if (lmax && typeof value === 'string') {
		result2 = value.length <= max;
	}
	if (lmin && typeof value === 'string') {
		result3 = value.length >= min;
	}
	var result = (result1 && result2 && result3);
	utils.defer(callback, result);
};

text.prototype.validateRequiredInput = function (item, data, callback) {
	var value = this.getValueFromData(data);
	var result = !!value;
	if (value === undefined && item.get(this.path)) {
		result = true;
	}
	utils.defer(callback, result);
};

/**
 * Add filters to a query
 */
text.prototype.addFilterToQuery = function (filter) {
	var query = {};
	if (filter.mode === 'exactly' && !filter.value) {
		query[this.path] = filter.inverted ? { $nin: ['', null] } : { $in: ['', null] };
		return query;
	}
	var value = utils.escapeRegExp(filter.value);
	if (filter.mode === 'beginsWith') {
		value = '^' + value;
	} else if (filter.mode === 'endsWith') {
		value = value + '$';
	} else if (filter.mode === 'exactly') {
		value = '^' + value + '$';
	}
	value = new RegExp(value, filter.caseSensitive ? '' : 'i');
	query[this.path] = filter.inverted ? { $not: value } : value;
	return query;
};

/**
 * Crops the string to the specifed length.
 */
text.prototype.crop = function (item, length, append, preserveWords) {
	return utils.cropString(item.get(this.path), length, append, preserveWords);
};

/* Export Field Type */
module.exports = text;
