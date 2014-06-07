hueCli (unstable)
======

Command line interface for philips hue. this very early version will be refactored a lot.

# Install

## via npm (recommended)

```bash
npm install -g huecli
```

# Usage

```bash
# activate test scenes
hue scene on
hue scene colorloop
hue scene off

# notify command flashes your lights once
hue notify
# or for 5 seconds
hue notify -d 5

# list all lights
hue lights -l

# turn on light 1
hue lights 1

# set light 1 to red
hue lights 1 -c red

# set all lights to a warm bright light
hue lights -T 400 -b 200
# the color temperature range is [153, 500], brightness range is [0, 255]

# turn off light 1
hue lights 1 --off

# turn off all lights
hue lights --off
```
