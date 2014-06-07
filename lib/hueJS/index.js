var util = require('util');
var EventEmitter = require('events').EventEmitter;

function HueJS() {
}

util.inherits(HueJS, EventEmitter);

HueJS.prototype.search = require('./search');
HueJS.prototype.connect = require('./connect');
HueJS.prototype.scene = require('./scene');

module.exports = new HueJS();
