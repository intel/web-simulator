/*
 *  Copyright 2011 Intel Corporation.
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

function deviceStatusEventTrigger(setting) {
    event.trigger("DeviceStatusChanged", [setting]);
}

module.exports = {
    "Config": {
        "vibratingMode": {
            "name": "Vibrator",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "callback": function (setting) {
                event.trigger("VibratingModeChanged", [setting]);
            }
        },
        "soundVolume": {
            "name": "Sound Volume",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 100
            },
            "callback": function (setting) {
                event.trigger("VolumeChanged", [setting]);
            }
        },
        "backlight": {
            "name": "Backlight",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "callback": function (setting) {
                event.trigger("BacklightChanged", [setting]);
            }
        }
    }
};

