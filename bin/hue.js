#!/usr/bin/env node
var Operetta = require('../node-operetta/operetta').Operetta;
var scenes = require('hue-scenes');
var getHueApi = require('../index');
var csscolors = require('css-color-names');

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

operetta.command('lights', 'control single lights', function(command) {
  command.options(['-l', '--list'], 'list all available lights');
  command.options(['-C','--colors'], 'show available color names. but you can use hex values, if you are not happy with them.');
  command.parameters(['-c','--color'], 'hex value or css name');
  command.parameters(['-b','--brightness'], 'in range 0..255');
  command.parameters(['-T','--temperature'], 'set temperature between [153, 500] = [6500K, 2000K]');
  command.start(function(opt) {

    if (opt['-l']) {
      // list all lights
      getHueApi(function(api) {
        api.lights().then(function(res) {
          console.dir(res);
        }).done(function() {
          process.exit(0);
        });
      });
    } else if (opt['-C']) {
      // list all colors
      for(var key in csscolors) {
        if (csscolors.hasOwnProperty(key)) {
          console.log(key);
        }
      }
      process.exit(0);
    } else {
      // set state
      var LightState = require('node-hue-api').lightState;
      var state = LightState.create().on(true);
      if (opt['-c']) {
        var toRGB = function(hex) {
          var b = parseInt(hex.replace('#', ''),16);
          return [b>>16, b>>8&255, b&255];
        };
        var hex = csscolors[opt['-c']] || opt['-c'];
        var rgb = toRGB(hex);
        state = state.rgb(rgb[0], rgb[1], rgb[2]);
      }
      if (opt['-T']) {
        state.ct = parseInt(opt['-T']);
      }
      if (opt['-b']) {
        state.bri = parseInt(opt['-b']);
      }

      getHueApi(function(api) {
        // no specific lights provided -> apply to all lights
        if (opt.positional.length === 0) {
          api.setGroupLightState('0', state).then(console.dir).done();
        } else {
          // apply to each provided light
          for (var i = 0; i < opt.positional.length; ++i) {
            api.setLightState(parseInt(opt.positional[i]), state).then(console.dir).done();
          }
        }
      });
    }

  });
});

operetta.start();
