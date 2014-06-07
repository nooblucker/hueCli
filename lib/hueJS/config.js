var path = require('path');
var fs = require('fs');
var uuid = require('node-uuid');

var CONFIGFILE = path.join('config.json');

var cfg;

module.exports = {

  load: function() {
    if (!fs.existsSync(CONFIGFILE)) {
      fs.writeFileSync(CONFIGFILE, JSON.stringify({
        username: uuid.v4()
      }));
    }
    try {
      var data = fs.readFileSync(CONFIGFILE);
      cfg = JSON.parse(data);
      return cfg;
    }
    catch (err) {
      console.log('There has been an error parsing your config.');
      console.log(err);
    }
  },

  save: function() {
    var data = JSON.stringify(cfg);
    fs.writeFile(CONFIGFILE, data, function (err) {
      if (err) {
        console.log('There has been an error saving your configuration data.');
        console.log(err.message);
        return;
      }
      //console.log('Configuration saved successfully.');
    });
  },

  get: function(item) {
    return cfg[item];
  },

  set: function(item, value) {
    cfg[item] = value;
    return value;
  }

};
