function HueJS() {
}

var util = require('util');
var EventEmitter = require('events').EventEmitter;
util.inherits(HueJS, EventEmitter);

HueJS.prototype.search = require('./search');

module.exports = HueJS;
