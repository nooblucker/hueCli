#!/usr/bin/env node
var Operetta = require('../node-operetta/operetta').Operetta;
var scenes = require('hue-scenes');
var getHueApi = require('../index');

operetta = new Operetta();

operetta.command('scene', 'load and save scenes', function(command) {
  command.options(['-s','--save'], "Save the current light settings into a scene with the given name.");
  command.options(['-f','--force'], "Use in combination with --save to overwrite an existing scene with the same name.");
  command.start(function(args) {
    var scene = args.positional[0];
    if (!scene) {
      console.error('please provide a scene name');
      process.exit(1);
    }
    getHueApi(function(api) {
      if (args['-s']) {
        // save the current state to scene
        api.getFullState().then(function(fullState) {
          var lights = {};
          for (var key in fullState.lights) {
            if (fullState.lights.hasOwnProperty(key)) {
              if (fullState.lights[key].state) {
                lights[key] = fullState.lights[key].state;
              }
            }
          }
          scenes.save(scene, {
            "lights": lights
          }, args['-f']);
        }).done();
      } else {
        // load the scene
        console.log('loading scene ' + scene);
        var sceneJson = scenes.load(scene);
        console.dir(sceneJson);
        if (sceneJson.groups) {
          for (var group in sceneJson.groups) {
            if (sceneJson.groups.hasOwnProperty(group)) {
                api.setGroupLightState(group, sceneJson.groups[group]).then(console.dir).done();
            }
          }
        }
      }
    });
  });
});

operetta.command('lights', "Commit Changes", function(command) {
  command.options(['-a','--all'], "Tell the command to automatically stage files that have been modified and deleted, but new files you have not told git about are not affected.");
  command.parameters(['-m','--message'], "Use the given message as the commit message.", function(value) {
    console.log("Staging modified files.");
  });
  command.start();
});

operetta.start();
