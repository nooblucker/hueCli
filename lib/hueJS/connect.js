var config = require('./config');
config.load();

var url = require('url');
var request = require('request');

function createUser(ip, username) {
  var address = url.parse('http://' + ip + '/api');
  request({
    uri: address,
    method: 'POST',
    json: {
      "devicetype": "hueCli",
      "username": username
    }
  }, function(error, response, body) {
    if (body && body[0]) {
      if (body[0].error && body[0].error.type === 101) {
        console.log('please press the link button');
        setTimeout(function() {
          createUser(ip, username);
        }, 1000);
      } else if (body[0].success) {
        console.log('user is now connected: ' + body[0].success.username);
        config.set('ip', ip);
        config.save();
      }
    }
  });
}

function connectUser(ip, username) {

  request({
    uri: url.parse('http://' + ip + '/api/' + username),
    json: {}
  }, function(err, res, body) {
    if (body && body[0] && body[0].error) {
      createUser(ip, username);
    } else {
      console.log('connected');
      config.set('ip', ip);
      config.save();
    }
  });
}

module.exports = function connect(opt) {
  var knownBridges = config.get('bridges');
  var username = config.get('username');
  var bridge = knownBridges[0];
  this.emit('info', 'connect user ' + username + ' to bridge ' + bridge);
  connectUser(bridge, username);
};
