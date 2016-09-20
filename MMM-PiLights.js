/* global Module */

var LPD8806 = require('lpd8806-async');

Module.register('MMM-PiLights',{

    /**
     * Module config defaults
     */
    defaults: {
        ledCount: 64,
        device: '/dev/spidev0.0',
        brightness: 1.0 // between 0.0 and 1.0
    },

    leds: null,

    /**
     * Starting of the module
     */
    start: function() {
        Log.info('[' + this.name + '] Starting');
        this.sendSocketNotification('START', {message: 'start connection'});

        try {
            // Internal reference to lpd8806-async
            this.leds = new LPD8806(this.config.ledCount, this.config.device);

            // Initialize off
            this.leds.allOFF();
            this.leds.setMasterBrightness(this.config.brightness);
        } catch (err) {
            Log.warn('Unable to open SPI (' + this.config.device + '), not supported?', err.message);
            this.leds = null;
        }
    },

    /**
     * @param {String}  notification
     * @param {Object}  payload
     */
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'PILIGHTS_SEQUENCE') {

        }
    },

    notificationReceived: function(notification, payload) {
        if (notification === 'PILIGHTS_SEQUENCE') {

        }
    },

    /**
     * @returns {*}
     */
    getDom: function() {
        return document.createElement('div');
    },

    /**
     * Fade's the LED's in and out
     * @param r
     * @param g
     * @param b
     * @param speed
     */
    pulseColor: function(r, g, b, speed) {

    },
});
