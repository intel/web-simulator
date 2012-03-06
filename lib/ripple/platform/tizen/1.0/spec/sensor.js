/*
 *  Copyright 2012 Intel Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var event = require('ripple/event');

function sensorStatusEventTrigger(setting) {
    event.trigger("SensorStatusChanged", [setting]);
}

module.exports = {
    "Accelerometer": {        
        "x": {
            "name": "x-axis",
            "control": {
                "type": "range",
                "value": 15,
                "min": 0,
                "max": 20.051639556884766
            },
            "callback": function (setting) {
                event.trigger("Accelerometer-xChanged", [setting]);
            }
        },
        
        "y": {
            "name": "y-axis",
            "control": {
                "type": "range",
                "value": 15,
                "min": 0,
                "max": 20.051639556884766
            },
            "callback": function (setting) {
                event.trigger("Accelerometer-yChanged", [setting]);
            }
        },

        "z": {
            "name": "z-axis",
            "control": {
                "type": "range",
                "value": 15,
                "min": 0,
                "max": 20.051639556884766
            },
            "callback": function (setting) {
                event.trigger("Accelerometer-zChanged", [setting]);
            }
        },
        
        "resolution": 0.039239998906850815,
        "minDelay": 20,
        "range": 20.051639556884766,
        "name": "Accelerometer",
        "type": "Accelerometer"
    },
    "MagneticField": {
        "x": {
            "name": "X",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 359
            },
            "callback": function (setting) {
                event.trigger("MagneticField-xChanged", [setting]);
            }
        },

        "y": {
            "name": "Y",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 359
            },
            "callback": function (setting) {
                event.trigger("MagneticField-yChanged", [setting]);
            }
        },

        "z": {
            "name": "Z",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 359
            },
            "callback": function (setting) {
                event.trigger("MagneticField-zChanged", [setting]);
            }
        },

        "resolution": 1,
        "minDelay": 20,
        "range": 359,
        "name": "MagneticField",
        "type": "MagneticField"
    },
    "Rotation": {
        "x": {
            "name": "X",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 359
            },
            "callback": function (setting) {
                event.trigger("Rotation-xChanged", [setting]);
            }
        }, 

        "y": {
            "name": "Y",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 359
            },
            "callback": function (setting) {
                event.trigger("Rotation-yChanged", [setting]);
            }
        }, 

        "z": {
            "name": "Z",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 359
            },
            "callback": function (setting) {
                event.trigger("Rotation-zChanged", [setting]);
            }
        }, 

        "resolution": 1,
        "minDelay": 20,
        "range": 359,
        "name": "Rotation",
        "type": "Rotation"
    },
    "Orientation": {
        "alpha": {
            "name": "alpha",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 359
            },
            "callback": function (setting) {
                event.trigger("Orientation-alphaChanged", [setting]);
            }
        }, 

        "beta": {
            "name": "beta",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 359
            },
            "callback": function (setting) {
                event.trigger("Orientation-betaChanged", [setting]);
            }
        }, 

        "gamma": {
            "name": "gamma",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 359
            },
            "callback": function (setting) {
                event.trigger("Orientation-gammaChanged", [setting]);
            }
        }, 

        "resolution": 1,
        "minDelay": 20,
        "range": 359,
        "name": "Orientation",
        "type": "Orientation"
    },
    "Gyroscope": {
        "value": {
            "name": "value",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 2293.68994140625
            },
            "callback": function (setting) {
                event.trigger("Gyroscope-valueChanged", [setting]);
            }
        },

        "resolution": 0.07000000029802322,
        "minDelay": 20,
        "range": 2293.68994140625,
        "name": "Gyroscope",
        "type": "Gyroscope"
    },
    "AmbientLight": {
        "value": {
            "name": "value",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 10
            },
            "callback": function (setting) {
                event.trigger("AmbientLight-valueChanged", [setting]);
            }   
        },

        "resolution": 1,
        "minDelay": 100,
        "range": 10,
        "name": "AmbientLight",
        "type": "AmbientLight"
    },

    "Proximity": {
        "value": {
            "name": "value",        
            "control": {
                "type": "range",
                "value": 0.5,
                "min": 0,
                "max": 1
            },
            "callback": function (setting) {
                event.trigger("Proximity-valueChanged", [setting]);
            }  
        },

        "resolution": 1,
        "minDelay": 0,
        "range": 1,
        "name": "Proximity",
        "type": "Proximity"
    }
};
