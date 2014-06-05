module.exports = function(opt) {
  var config = require('./config');
  var path = require('path');
  var fs = require('fs');
  var request = require('request');
  var url = require('url');

  var SCENESFOLDER = path.join('scenes');
  var HOMEFOLDER = path.join(getUserHome(), '.hueScenes');
  var ENDING = '.json';

  function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  var scene = opt.argv.remain[1];
  var sceneFilename = scene.concat(ENDING);

  var scenePath = path.join(HOMEFOLDER, sceneFilename);

  if (!fs.existsSync(scenePath)) {
    scenePath = path.join(SCENESFOLDER, scene.concat(ENDING));
  }

  console.log('load scene ' + scenePath);

  try {
    var data = fs.readFileSync(scenePath);
    scene = JSON.parse(data);
    for (var light in scene) {
      if (scene.hasOwnProperty(light)) {
        var address = url.parse('http://' + config.get('ip') + '/api/'+ config.get('username') +'/lights/' + light + '/state');
        console.log(address);
        request({
          uri: address,
          method: 'PUT',
          json: scene[light]
        }, function(err, resp, body) {
          console.log(body);
        });
      }
    }
  }
  catch (err) {
    console.log('There has been an error parsing your scene.');
    console.log(err);
  }

};
