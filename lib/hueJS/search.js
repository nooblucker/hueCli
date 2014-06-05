module.exports = function search(opt) {

  var that = this;
  var dgram = require('dgram');
  var http = require('http');
  var xml2js = require('xml2js');
  var config = require('./config');
  config.load();

  var possibleBridges = [];
  var foundBridges = [];

  // Listen for responses
  function listen(port, cb) {
    var client = dgram.createSocket('udp4');

    client.on('listening', function () {
        var address = client.address();
        that.emit('log', 'UDP Client listening on ' + address.address + ":" + address.port);
        that.emit('info', 'searching for bridges:');
        client.setMulticastTTL(128);
        client.addMembership('239.255.255.250');
    });

    client.on('message', function (msg, remote) {
        that.emit('log', '\n\nFrom: ' + remote.address + ':' + remote.port +' \n' + msg);
        var location = msg.toString().match(/location:(.*)/im);
        if (location) {
          var url = location[1].trim();
          if (possibleBridges.indexOf(url) === -1) {
            possibleBridges.push(url);
            http.get(url, function(res) {
              var body = '';
              res.on('data', function(chunk) {
                body += chunk;
              });
              res.on('end', function () {
                xml2js.parseString(body, {
                  explicitArray: false
                }, function(err, description) {
                  if (err) {
                    that.emit('log', err);
                  } else {
                    var foundBridge = description.root.device.modelName.match(/philips hue bridge/i);
                    if (foundBridge) {
                      that.emit('info', remote.address);
                      foundBridges.push(remote.address);
                      var bridges = config.get('bridges') || [];
                      bridges.push(remote.address);
                      config.set('bridges', bridges);
                      config.save();
                    }
                  }
                });
              });
            }).on('error', function(e) {
              that.emit('warn', 'failed to get ' + url + ': ' + e.message);
            });
          }
        }
    });

    client.bind(port, function() {
      cb();
      setTimeout(function() {
        client.close();
        that.emit('log', 'UDP stopped listening');
      }, 2000);
    });
  }

  function sendMessage() {

    var message = new Buffer(
      "M-SEARCH * HTTP/1.1\r\n" +
      "HOST:239.255.255.250:1900\r\n" +
      "MAN:\"ssdp:discover\"\r\n" +
      "ST:urn:schemas-upnp-org:device:Basic:1\r\n" +
      "MX:1\r\n" +
      "\r\n"
    );

    var client = dgram.createSocket("udp4");
    client.bind(function() {
      listen(client.address().port, function() {
        possibleBridges = [];
        foundBridges = [];
        client.send(message, 0, message.length, 1900, "239.255.255.250", function(err, bytes) {
          if (err) {
            that.emit('error', 'could not send ssdp broadcast message: ' + err);
          } else {
            that.emit('log', 'sent ussdp broadcast with ' + bytes + ' bytes');
          }
          client.close();
        });
      });
    });
  }

  sendMessage();

};
