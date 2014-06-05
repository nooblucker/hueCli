#!/usr/bin/env node
var nopt = require("nopt");
var path = require("path");
var hueCli = require('../lib/cli');

var knownOpts = {
  "scene" : path,
  "verbose" : Boolean,
  "on" : Boolean,
  "off" : Boolean
};
var shortHands = {
  "v" : ["--verbose"],
  "s" : ["--scene"]
};
var opts = nopt(knownOpts, shortHands, process.argv, 2);

hueCli(opts);
