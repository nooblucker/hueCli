function HueJS() {
}

var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(HueJS, EventEmitter);

HueJS.prototype.search = require('./search');
HueJS.prototype.connect = require('./connect');
HueJS.prototype.status = require('./status');
HueJS.prototype.scene = require('./scene');

module.exports = HueJS;
