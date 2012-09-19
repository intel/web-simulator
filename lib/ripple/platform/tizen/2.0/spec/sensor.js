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
                "value": 100.0000000000000000,
                "min": 0.0000000000000000,
                "max": 200.0000000000000000,
                "step": 0.0000000000000001
            },
            "callback": function (setting) {
                event.trigger("MagneticField-xChanged", [setting]);
            }
        },

        "y": {
            "name": "Y",
            "control": {
                "type": "range",
                "value": 100.0000000000000000,
                "min": 0.0000000000000000,
                "max": 200.0000000000000000,
                "step": 0.0000000000000001
            },
            "callback": function (setting) {
                event.trigger("MagneticField-yChanged", [setting]);
            }
        },

        "z": {
            "name": "Z",
            "control": {
                "type": "range",
                "value": 100.0000000000000000,
                "min": 0.0000000000000000,
                "max": 200.0000000000000000,
                "step": 0.0000000000000001
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
        "resolution": 1,
        "minDelay": 20,
        "range": 359,
        "name": "Rotation",
        "type": "Rotation"
    },
    "Orientation": {
        "resolution": 1,
        "minDelay": 20,
        "range": 359,
        "name": "Orientation",
        "type": "Orientation"
    }
};
