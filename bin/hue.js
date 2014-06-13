#!/usr/bin/env node
var Operetta = require('../node-operetta/operetta').Operetta;
var scenes = require('hue-scenes');
var getHueApi = require('../index');
var csscolors = require('css-color-names');
var Q = require('q');

function exitErr(message) {
  console.error(message);
  process.exit(1);
}

operetta = new Operetta();

operetta.command('config', 'manages your hue system, access control etc.', function(command) {

  command.command('removeuser', 'deletes user by id or name', function(removeUserCmd) {
    removeUserCmd.banner = 'Example usage: hue config removeuser asdfg qwerty -n "iPad"\nwill delete user ids asdfg, qwerty and all users whose name contains iPad. if your own username contains iPad, it will not be deleted. to delete your own user, provide the ID explicitly.';
    removeUserCmd.parameters(['-n', '--name'], 'delete by name');
    removeUserCmd.start(function(args) {

      getHueApi(function(api) {

        var findMatchingUserIds = function(config) {
          var userIds = args.positional;
          if (args['-n']) {
            var userRegExp = new RegExp(args['-n'], 'i');
            Object.keys(config.whitelist).forEach(function(userId) {
              var name = config.whitelist[userId].name;
              if (userRegExp.test(name)) {
                if (userId != api.username) {
                  userIds.push(userId);
                }
              }
            });
          }
          return Q.fcall(function () {
            return userIds;
          });
        };

        var removeUserIds = function(userIds) {
          userIds.forEach(function(id) {
            api.deleteUser(id).then(function() {
              console.log('deleted userid ' + id);
            }).done();
          });
        };

        api.config().then(findMatchingUserIds).then(removeUserIds).done();
      });

    });
  });

  command.command('show', 'shows the configuration', function(showCmd) {
    showCmd.start(function(args) {
      getHueApi(function(api) {
        api.config().then(console.dir).done();
      });
    });
  });

  command.start();

});

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
  command.options(['--off'], 'turn off the lights');
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
      var state = LightState.create();

      if (opt['--off']) {
        state.off();
      } else {
        state.on();
      }

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

      console.log(state);

      getHueApi(function(api) {
        // no specific lights provided -> apply to all lights
        if (opt.positional.length === 0) {
          api.setGroupLightState('0', state).then(console.dir).done();
        } else {
          // apply to each provided light
          for (var i = 0; i < opt.positional.length; ++i) {
            var lightId = +opt.positional[i];
            if (lightId) {
              api.setLightState(lightId, state).then(console.dir).done();
            }
          }
        }
      });
    }

  });
});

operetta.start();
