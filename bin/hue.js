#!/usr/bin/env node
var Operetta = require('../node-operetta/operetta').Operetta;
var scenes = require('hue-scenes');
var getHueApi = require('../index');

operetta = new Operetta();

operetta.command('scene', 'load and save scenes', function(command) {
  command.banner = 'Load a scene: hue scene myscene\nSave the current state to a scene: hue scene -s fancyscene\nOverwrite an existing scene: hue scene -sf fancyscene';
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

operetta.command('notify', 'flashes all lights once', function(command) {
  command.parameters(['-d','--duration'], "After this many seconds the alert effect is canceled. If this argument is not given, the lights flash once.");
  command.start(function(opt) {
    getHueApi(function(api) {
      var alertMode = opt['-d'] ? 'lselect' : 'select';
      api.setGroupLightState('0', {'alert': alertMode}).then(function(res) {
        console.log('hue got notified :D');
        if (opt['-d']) {
          setTimeout(function() {
            api.setGroupLightState('0', {'alert': 'none'}).then(function(res) {
              console.log('stop notifying after ' + opt['-d'] + ' seconds');
            }).done();
          }, parseInt(opt['-d'])*1000);
        }
      }).done();
    });
  });
});

operetta.start();
