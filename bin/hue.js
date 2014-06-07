#!/usr/bin/env node
var program = require('commander');

program
  .version('0.1.1')
  .command('scene <scene>', 'activate a scene').
  parse(process.argv);
