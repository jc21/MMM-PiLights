# MMM-PiLights
MagicMirror Module to control a led strip attached to a Raspberry Pi


## Requirements

This module is specifically meant for the Raspberry Pi system, using SPI and a LPD8806
LED strip. It may be compatible with other LED strips, but this has not been tested.

[Buy the LPD8806 LED Strip here](https://www.adafruit.com/products/306)

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
            device: '/dev/spidev0.0'
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
            <td><code>device</code></td>
            <td>String</td>
            <td><code>/dev/spidev0.0</code></td>
            <td>The SPI Device for your LED strip</td>
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
