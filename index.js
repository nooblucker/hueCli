var path = require('path');
var uuid = require('node-uuid');

var hue = require("node-hue-api");
var HueApi = hue.HueApi;

function getUserName() {
  return process.env[(process.platform == 'win32') ? 'USERNAME' : 'USER'];
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = function Hue(cb) {


  var storage = require('node-persist');
  storage.initSync({
    dir: path.join(getUserHome(), '.hueCli')
  });

  var user = storage.getItem('user');
  if (!user) {
    user = uuid.v4();
    storage.setItem('user', user);
    console.log('you are now user ' + user);
  }

  var ip = storage.getItem('ip');
  var result;

  function register(ip, user, cb) {
    console.log('press the link button');
    var api = new HueApi(ip, user);
    api.registerUser(ip, user, 'hueCli#' + getUserName())
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
