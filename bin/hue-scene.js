var program = require('commander');

program
  .parse(process.argv);

if (program.args.length !== 1) {
  console.error('exactly one scene required');
  process.exit(1);
}

var hue = require('node-hue-api');
var HueApi = hue.HueApi;

require('../index')(function(api) {

  var scenes = require('hue-scenes');

  var scene = program.args[0];
  console.log('activating scene ' + scene);

  var sceneJson = scenes.load(scene);
  console.dir(sceneJson);

  if (sceneJson.groups) {
      for (var group in sceneJson.groups) {
        if (sceneJson.groups.hasOwnProperty(group)) {
            api.setGroupLightState(group, sceneJson.groups[group]).then(console.dir).done();
        }
      }
  }

});
