module.exports = function Hue(cb) {

  var uuid = require('node-uuid');

  var hue = require("node-hue-api");
  var HueApi = hue.HueApi;

  var storage = require('node-persist');
  storage.initSync();

  var user = storage.getItem('user');
  if (!user) {
    user = uuid.v4();
    storage.setItem('user', user);
    console.log('you are now user ' + user);
  }

  var ip = storage.getItem('ip');
  var result;

  function getUserName() {
    return process.env[(process.platform == 'win32') ? 'USERNAME' : 'USER'];
  }

  function register(ip, user, cb) {
    console.log('press the link button');
    var api = new HueApi(ip, user);
    api.registerUser(ip, user, 'hue cli ' + getUserName())
      .then(function(user) {
        storage.setItem('user', user);
        cb();
      })
      .fail(function(err) {
        console.log(err);
        setTimeout(function() {
          register(ip, user, cb);
        }, 1000);
      })
      .done();
  }

  function returnApi(ip, user) {
    console.log(user + '@' + ip);
    var api = new HueApi(ip, user);
    api.connect().then(function(res) {
      if (!res.whitelist) {
        console.dir(res);
        throw new Error('your username (' + user + ') is not registered.');
      }
    }).then(function () {
        cb(api);
    }).fail(function(err) {
      console.log(err);
      register(ip, user, function() {
        returnApi(ip, user);
      });
    }).done();
  }

  if (!ip) {

    var displayBridges = function(bridges) {
        ip = bridges[0].ipaddress;
        storage.setItem('ip', ip);
        console.log('found bridge at ' + ip);
    };

    hue.locateBridges().then(displayBridges).done(function() {
      returnApi(ip, user);
    });

  } else {
    returnApi(ip, user);
  }

};
