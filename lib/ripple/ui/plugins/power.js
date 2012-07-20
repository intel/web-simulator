/*
 *  Copyright 2012 Intel Corporation
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

var db = require('ripple/db'),
    event = require('ripple/event'),
    utils = require('ripple/utils'),
    constants = require('ripple/constants'),
    deviceSettings = require('ripple/deviceSettings'),
    power = require('ripple/platform/tizen/1.0/power');
module.exports = {
    panel: {
        domId: "power-container",
        collapsed: true,
        pane: "left",
        titleName: "Power",
        display: true
    },

    initialize: function () {
        var _RULES          =  constants.POWER_RULES,
            _PORWER_RULES_KEY = "tizen1-db-power-role",
            _CPU_STATE      = constants.POWER_RESOURCE.CPU.STATE,
            _DISPLAY_STATE  = constants.POWER_RESOURCE.DISPLAY.STATE,
            cpuObj           = document.getElementById("cpu-state"),
            displayObj       = document.getElementById("display-state"),
            loadLabel        = document.getElementById("cpu-load-label"),
            brightnessLabel  = document.getElementById("diplay-brightness-label"),
            load, brightness, stateObj;

        function initPowerState() {
            var obj, dbRules;
            load = deviceSettings.retrieve("Cpu.load");
            brightness = deviceSettings.retrieve("Display.brightness");
            brightness = Number(brightness);
            loadLabel.innerHTML = "CPU : (load = " + load + ")";
            brightnessLabel.innerHTML = "Display : (brightness = " + brightness + ")";
            //Init CPU state.
            if (load <= _CPU_STATE.LOW.MAX) {
                cpuObj.options[0].selected = true;//LOW
            } else {
                cpuObj.options[1].selected = true;
            }
            //Init DISPLAY state.
            if (brightness ===  _DISPLAY_STATE.OFF.MAX) {
                displayObj.options[0].selected = true;
            } else if (brightness <= _DISPLAY_STATE.DIM.MAX) {
                displayObj.options[1].selected = true;
            } else if (brightness <= _DISPLAY_STATE.NORMAL.MAX) {
                displayObj.options[2].selected = true;
            } else {
                displayObj.options[3].selected = true;
            }
            //Init rules
            dbRules = db.retrieveObject(_PORWER_RULES_KEY);
            _RULES =  dbRules && _RULES ? dbRules : _RULES;
            for (obj in _RULES) {
                stateObj = document.getElementById(obj.toLowerCase() + "-role");
                if (_RULES[obj]) {//Allow : true
                    stateObj.options[0].selected = true;
                } else {//Deny : false
                    stateObj.options[1].selected = true;
                }
            }
        }
        event.on("initPowerDB", function (rules) { //Update rule selects
            var obj;
            _RULES = rules;
            for (obj in rules) {
                stateObj = document.getElementById(obj.toLowerCase() + "-role");
                if (rules[obj]) {//Allow : true
                    stateObj.options[0].selected = true;
                } else {//Deny : false
                    stateObj.options[1].selected = true;
                }
            }
        });
        event.on("CpuLoadChanged", initPowerState);
        event.on("DisplayBrightnessChanged", initPowerState);
        event.on("CpuLoadChangedByPower", initPowerState);
        event.on("DisplayBrightnessChangedByPower", initPowerState);
        cpuObj.addEventListener("change", function () {
            var state = cpuObj.value, value;
            value = _CPU_STATE[state].VALUE;
            deviceSettings.persist("Cpu.load", value);
            event.trigger("CpuLoadChanged", [value]);
        });
        displayObj.addEventListener("change", function () {
            var state = displayObj.value, value;
            value = _DISPLAY_STATE[state].VALUE;
            deviceSettings.persist("Display.brightness", value);
            event.trigger("DisplayBrightnessChanged", [value]);
        });
        document.getElementById("high-role").addEventListener("change", function () {
            var value = this.value;
            value = (value === '1' ? true : false);
            event.trigger("updatePowerRules", [{"state": 'HIGH', "value": value}]);
        });
        
        document.getElementById("low-role").addEventListener("change", function () {
            var value = this.value;
            value = (value === '1' ? true : false);
            event.trigger("updatePowerRules", [{"state": 'LOW', "value": value}]);
        });
        document.getElementById("off-role").addEventListener("change", function () {
            var value = this.value;
            value = (value === '1' ? true : false);
            event.trigger("updatePowerRules", [{"state": 'OFF', "value": value}]);
        });
        document.getElementById("dim-role").addEventListener("change", function () {
            var value = this.value;
            value = (value === '1' ? true : false);
            event.trigger("updatePowerRules", [{"state": 'DIM', "value": value}]);
        });
        document.getElementById("normal-role").addEventListener("change", function () {
            var value = this.value;
            value = (value === '1' ? true : false);
            event.trigger("updatePowerRules", [{"state": 'NORMAL', "value": value}]);
        });
        document.getElementById("bright-role").addEventListener("change", function () {
            var value = this.value;
            value = (value === '1' ? true : false);
            event.trigger("updatePowerRules", [{"state": 'BRIGHT', "value": value}]);
        });
        initPowerState();
    }
};
