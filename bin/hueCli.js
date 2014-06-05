#!/usr/bin/env node
var nopt = require("nopt");
var path = require("path");
var hueCli = require('../lib/cli');

var knownOpts = {
  "verbose" : Boolean
};
var shortHands = {
  "v" : ["--verbose"]
};
var opts = nopt(knownOpts, shortHands, process.argv, 2);

hueCli(opts);
