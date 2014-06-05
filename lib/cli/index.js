module.exports = function(opt) {

  var HueJS = require('../hueJS');
  var hue = new HueJS();

  if (opt.verbose) {
    hue.on('log', function(msg) {
      console.log(msg);
    });
  }

  hue.on('info', function(msg) {
    console.info(msg);
  });

  hue.on('warn', function(msg) {
    console.info(msg);
  });

  hue.on('error', function(msg) {
    console.error(msg);
    process.exit(1);
  });

  if (opt.argv.remain) {
    hue[opt.argv.remain[0]](opt);
  }

};
