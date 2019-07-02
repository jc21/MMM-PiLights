# MMM-PiLights
MagicMirror Module to control a led strip attached to a Raspberry Pi


## Requirements

This module is specifically meant for the Raspberry Pi system, using SPI and a LPD8806 or WS2801
LED strip. It may be compatible with other LED strips, but this has not been tested.

[Buy the LPD8806 LED Strip here](https://www.adafruit.com/products/306) and [learn how to connect it here](https://learn.adafruit.com/light-painting-with-raspberry-pi/hardware)

If using Raspbian, you will need to enable SPI:

```bash
sudo raspi-config
```

then navigate to `Advanced` options and enable `SPI`


## Module installation

Clone the module and npm install:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/jc21/MMM-PiLights.git
cd MMM-PiLights
npm install
```

Add the module config to `~/MagicMirror/config/config.js`

```javascript
modules: [
    {
        module: 'MMM-PiLights',
        config: {
            ledCount: 64,
            type: 'ws2801', // 'ws2801' or 'lpd8806'
            bus: 0, 
            device: 0,
            brightness: 1.0 // between 0.0 and 1.0
        }
    }
]
```


## Module Configuration Options

<table width="100%">
    <thead>
        <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Default</th>
            <th width="100%">Description</th>
        </tr>
    <thead>
    <tbody>
        <tr>
            <td><code>ledCount</code></td>
            <td>Integer</td>
            <td><code>64</code></td>
            <td>Number LEDs on your strip</td>
        </tr>
        <tr>
            <td><code>type</code></td>
            <td>String</td>
            <td><code>ws2801</code></td>
            <td>The LED strip type, either 'ws2801' or 'lpd8806'</td>
        </tr>
        <tr>
            <td><code>bus</code></td>
            <td>Integer</td>
            <td><code>0</code></td>
            <td>The SPI bus number for your LED strip</td>
        </tr>
        <tr>
            <td><code>device</code></td>
            <td>Integer</td>
            <td><code>0</code></td>
            <td>The SPI device number for your LED strip</td>
        </tr>
        <tr>
            <td><code>brightness</code></td>
            <td>Float</td>
            <td><code>0.0</code></td>
            <td>The LED strip brightness (between 0.0 and 1.0)</td>
        </tr>
    </tbody>
</table>


## Trigger from another module

If you're developing a module and want to trigger a light sequence, here's an example of
what you'd use in your module:

```javascript
this.sendNotification('PILIGHTS_SEQUENCE', 'blue_pulse');
```

My other MagicMirror module is able to trigger light sequences with notifications:
[MMM-IFTTT](https://github.com/jc21/MMM-IFTTT)

## Trigger from a endpoint

The GET endpoint is pretty simple:

`http://yourmagicmirror/PiLights?sequence=blue_pulse`

From the command line:

```bash
curl -X GET "http://yourmagicmirror/PiLights?sequence=blue_pulse"
```

## Available Sequences

- white_pulse
- blue_pulse
- lightblue_pulse
- red_pulse
- green_pulse
- orange_pulse
- pink_pulse

More to come later.
