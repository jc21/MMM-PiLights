/* global require */

const _          = require('lodash');
const Color      = require('color');
const NodeHelper = require('node_helper');
const bodyParser = require('body-parser');
const async      = require('async');
const moment     = require('moment');

let ajv = require('ajv')({
    allErrors:   true,
    format:      'full',
    coerceTypes: true
});

module.exports = NodeHelper.create({

    config:               {},
    animationRunning:     false,
    stopAnimationRequest: false,
    defaultSpeed:         100,
    type: 'ws2801',

    /**
     * node_helper start method
     */
    start: function() {
        this.log('Starting node_helper');

        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({extended: true}));

        this.expressApp.get('/PiLights', (req, res) => {
            this.log('Incoming:' + JSON.stringify(req.query));

            if (typeof req.query.sequence !== 'undefined') {
                // Sequence

                this.runSequence(req.query.sequence)
                    .then(function () {
                        res.status(200)
                            .send({
                                status: 200
                            });
                    })
                    .catch(function (err) {
                        res.status(400)
                            .send({
                                status: 400,
                                error: err.message
                            });
                    });

            } else {
                res.status(400)
                    .send({
                        status: 400,
                        error: 'Sequence not specified'
                     });
            }
        });
    },

    /**
     *
     * @param {String} notification
     * @param {*}      payload
     */
    socketNotificationReceived: function (notification, payload) {
        this.log('socketNotificationReceived: ' + notification + ', ' + JSON.stringify(payload), true);

        if (notification === 'START') {
            this.config = payload;

            try {
                this.log('Trying to load leds', true);
                this.type = this.config.type;
                if (this.type == 'ws2801') {
                    // Internal reference to rpi-ws2801
                    this.leds = require("rpi-ws2801");
                    this.leds.connect(this.config.ledCount, this.config.device);
                    // Initialize off
                    this.leds.clear();
                } else if (this.type == 'lpd8806') {
                    // Internal reference to lpd8806-async
                    var LPD8806 = require('lpd8806-async');
                    this.leds = new LPD8806(this.config.ledCount, this.config.device);
                    
                    // Initialize off
                    this.leds.allOFF();
                    this.leds.setMasterBrightness(this.config.brightness);
                }
                this.log('Leds connected ok', true);

            } catch (err) {
                this.log('Unable to open SPI (' + this.config.device + '), not supported? ' + err.message);
                this.leds = null;
            }

        } else if (notification === 'SEQUENCE') {
            let iterations = 2;
            let sequence   = payload;
            let delay      = 0;
            

            if (typeof payload === 'object') {
                sequence   = payload.sequence;
                iterations = payload.iterations || iterations;
                delay      = payload.delay      || delay;
            }

            Promise.resolve(this.runSequence(sequence, iterations, delay)
                .catch((err) => {
                    this.log('Sequence error: ' + err.message);
                }));
        }
    },

    /**
     * Runs a light sequence
     *
     * @param   {String}  sequence
     * @param   {Integer} [iterations]
     * @param   {Integer} [delay]
     * @returns {Promise}
     */
    runSequence: function (sequence, iterations, delay) {
        let self = this;
        iterations = iterations || 2;

        this.log('runSequence: ' + sequence + ', iterations: ' + iterations + ', delay: ' + delay);

        return new Promise(function (resolve, reject) {
            let colors = [0, 0, 0];

            switch (sequence) {
                case 'blue_pulse':
                    colors = [0, 0, 255];
                    break;
                case 'white_pulse':
                    colors = [255, 255, 255];
                    break;
                case 'lightblue_pulse':
                    colors = [0, 255, 255];
                    break;
                case 'red_pulse':
                    colors = [255, 0, 0];
                    break;
                case 'green_pulse':
                    colors = [0, 255, 0];
                    break;
                case 'orange_pulse':
                    colors = [255, 170, 0];
                    break;
                case 'pink_pulse':
                    colors = [255, 0, 255];
                    break;
                default:
                    reject(new Error('Unknown sequence: ' + sequence));
                    return;
                    break;
            }

            resolve(self.pulse(colors[0], colors[1], colors[2], iterations, 20, delay));
        });
    },

    /**
     * @param {Function} cb
     * @returns {*}
     */
    switchAnimation: function (cb) {
        if (!this.animationRunning) {
            return this.startAnimation(cb);
        }

        this.stopAnimationRequest = true;

        if (this.animationRunning) {
            let self = this;
            setTimeout(function() {
                self.switchAnimation(cb);
            }, 100);
        } else {
            this.startAnimation(cb);
        }
    },

    /**
     *
     * @param {Function} cb
     * @returns {Function}
     */
    startAnimation: function (cb) {
        this.stopAnimationRequest = false;
        this.animationRunning = true;
        return cb();
    },

    /**
     *
     */
    stopAnimation: function () {
        this.stopAnimationRequest = true;
        this.animationRunning = false;
    },

    /**
     *
     */
    update: function() {
        if (this.leds) {
            this.leds.update();
        }
    },

    /**
     *
     * @param {Integer} red
     * @param {Integer} green
     * @param {Integer} blue
     * @param {Integer} [iterations]
     * @param {Integer} [speed]
     * @param {Integer} [delay]
     */
    pulse: function (red, green, blue, iterations, speed, delay) {
        delay = delay || 1;

        let self = this;

        if (this.leds) {
            setTimeout(function () {
                self.switchAnimation(() => {
                    self.log('Pulse (' + red + ', ' + green + ', ' + blue + ') Iterations: ' + iterations + ', Speed: ' + speed + ', Delay: ' + delay, true);
                    self.flashEffect(red, green, blue, iterations, speed);
                });
            }, delay);
        }
    },

    /**
     *
     * @param r
     * @param g
     * @param b
     */
    fillRGB: function(r, g, b) {
        if (this.leds) {
            this.switchAnimation(() => {
                if (this.type == 'ws2801'){
                    this.leds.fill(r, g, b);
                }else if (this.type == 'lpd8806'){
                    this.leds.fillRGB(r, g, b);
                }
                this.stopAnimation();
            });
        }
    },

    /**
     *
     */
    off: function() {
        if (this.leds) {
            if (this.type == 'ws2801'){
                this.leds.clear();
            }else if (this.type == 'lpd8806'){
                this.leds.allOFF();
            }
            
            this.stopAnimation();
        }
    },

    /**
     *
     * @param {Integer} r
     * @param {Integer} g
     * @param {Integer} b
     * @param {Integer} [iterations]
     * @param {Integer} [speed]
     */
    flashEffect: function (r, g, b, iterations, speed) {
        let self = this;
        let step = 0.05;
        let total_iterations = 0;

        speed      = speed || 10; // ms
        iterations = iterations || 99999;

        let level = 0.00;
        let dir   = step;

        function performStep() {
            if (level <= 0.0) {
                level = 0.0;
                dir = step;
                total_iterations++;
            } else if (level >= 1.0) {
                level = 1.0;
                dir = -step;
            }

            level += dir;

            if (level < 0.0) {
                level = 0.0;
            } else if (level > 1.0) {
                level = 1.0;
            }

            if (self.stopAnimationRequest || total_iterations > iterations) {
                self.stopAnimation();
                return;
            }

            if (self.type == 'ws2801') {
                self.leds.fill(r * level,g * level,b * level);
            } else if (self.type == 'lpd8806') {
                self.leds.setMasterBrightness(level);
                self.leds.fill(new Color({
                    r: r,
                    g: g,
                    b: b
                }));
            }

            setTimeout(performStep, speed);
        }

        if (this.leds) {
            performStep();
        }
    },

    /**
     * Outputs log messages
     *
     * @param {String}  message
     * @param {Boolean} [debug_only]
     */
    log: function (message, debug_only) {
        if (!debug_only || (debug_only && typeof this.config.debug !== 'undefined' && this.config.debug)) {
            console.log('[' + moment().format('YYYY-MM-DD HH:mm:ss') + '] [MMM-PiLights] ' + message);
        }
    }

});
