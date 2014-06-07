module.exports = function(opt) {
  var config = require('./config');
  var path = require('path');
  var fs = require('fs');
  var request = require('request');
  var url = require('url');

  var HOMEFOLDER = path.join(getUserHome(), '.hueScenes');
  var ENDING = '.json';

  function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  var scene = opt.argv.remain[1];
  var sceneFilename = scene.concat(ENDING);

  var scenePath = path.join(HOMEFOLDER, sceneFilename);

  var sceneJson;

  if (!fs.existsSync(scenePath)) {
    sceneJson = require(path.join('../../scenes/', scene + '.json'));
  } else {
    try {
      var data = fs.readFileSync(scenePath);
      sceneJson = JSON.parse(data);
    } catch (err) {
      console.log('There has been an error parsing your scene.');
      console.log(err);
    }
  }

  function log(err, resp, body) {
    console.log(body);
  }

  for (var light in scene) {
    if (scene.hasOwnProperty(light)) {
      var address = url.parse('http://' + config.get('ip') + '/api/'+ config.get('username') +'/lights/' + light + '/state');
      console.log(address);
      request({
        uri: address,
        method: 'PUT',
        json: scene[light]
      }, log);
    }
  }

};
