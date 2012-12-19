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
    power = require('ripple/platform/tizen/2.0/power'),
    _volume  = document.getElementById(constants.BATTERY.VOLUME),
    _volumeLabel  = document.getElementById(constants.BATTERY.VOLUME + "-label"),
    _charging = document.getElementById(constants.BATTERY.CHARGING),
    _battery = {
        volume: 600,
        level:  1.0,
        timerId: null,
        charge: function (isStart, isCharge, callback) {
            var currentVolume,
                checkValue = function () {
                    if (_battery.level < 0 || _battery.level > 1.0 || !isStart) {
                        clearInterval(_battery.timerId);
                        _battery.timerId = null;
                        if (_battery.level < 0)
                            _battery.level = 0;
                        else if (_battery.level > 1.0)
                            _battery.level = 1.0;
                    }
                };

            if (isStart && !_battery.timerId) {
                _battery.timerId = setInterval(function () {
                    currentVolume = isCharge ? _battery.level * _battery.volume + 1 : _battery.level * _battery.volume - 1;
                    _battery.level = currentVolume / _battery.volume;
                    checkValue();
                    return callback && callback();
                }, 1000);
            }
            checkValue();
            return callback && callback();
        }
    };

function _triggerEvent(chargingStatus, chargingTime, dischargingTime, level, type) {
    var status = {
        charging: chargingStatus,
        chargingTime: chargingTime,
        dischargingTime: dischargingTime,
        level: level,
        type: type
    };
    event.trigger("BatteryEvent", [status]);
}

function _updateLevelIcons() {
    var colors = ["black", "black", "black", "black", "black", "black", "#404040", "#606060", "#808080", "#b0b0b0", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        colorIndex = 10 - Math.round(_battery.level * 10),
        index;

    //map the battery level to the color range
    for (index = 0 ; index <= 5 ; index++) {
        $("#block" + index).css("backgroundColor", colors[colorIndex]);
        colorIndex++;
    }
}

function _setVolumeReadOnly(flag) {
    if (flag) {
        $("#" + constants.BATTERY.VOLUME).hide();
        $("#" + constants.BATTERY.VOLUME + "-label").show();
    } else {
        $("#" + constants.BATTERY.VOLUME).show();
        $("#" + constants.BATTERY.VOLUME + "-label").hide();
    }
}

function _startDischarging() {
    var remainVolume = $("#simulate-low-battery #low-battery-remain-time").val();

    _setVolumeReadOnly(true);
    if (_charging.checked) {
        _charging.checked = false;
        _battery.charge(false);
    }
    $("#is-charging").attr("disabled", "disable");
    $("#remaining-time-label").html("Remaining Time to empty (seconds)");
    $("#charging-state").html("Plugged in?");

    if ($("#simulate-low-battery #low-battery-start-at").val() > 100) {
        $("#simulate-low-battery #low-battery-start-at").val(100);
    }
    _battery.level = $("#simulate-low-battery #low-battery-start-at").val() / 100.0;
    if (_battery.level === 0) {
        $("#simulate-low-battery").dialog("close");
        return;
    }

    _battery.volume = remainVolume / _battery.level;
    _volumeLabel.innerText = (_battery.level * 100).toFixed(2);
    _battery.charge(true, false, function () {
        _volumeLabel.innerText = (_battery.level * 100).toFixed(2);
        _volume.value = (_battery.level * 100).toFixed(2);
        changeBatteryVolume();
        $("#remain-time").html(Math.round(_battery.volume * _battery.level) + " Seconds");
        _updateLevelIcons();
        _triggerEvent(false, Infinity, Math.round(_battery.volume * _battery.level), _battery.level, "dischargingtimechange");
        if (_battery.level <= 0.0) {
            _stopDischarging();
        }
    });
    $("#simulate-low-battery").dialog("close");
    $("#simulate-low-battery-btn").hide();
    $("#stop-btn").show();
}

function _stopDischarging() {
    $("#is-charging").removeAttr("disabled");
    _battery.level = _volume.value / 100.0;
    $("#remain-time").html("");
    $("#remaining-time-label").html("Remaining Time (seconds)");
    _setVolumeReadOnly(false);
    _battery.charge(false);
    $("#simulate-low-battery-btn").show();
    $("#stop-btn").hide();
    _updateLevelIcons();
}

function _setCharging() {
    // if it's unchecked, the timer will stop in this function call, the UI update blow it
    _battery.charge(_charging.checked, true, function () {
        _volumeLabel.innerText = (_battery.level * 100).toFixed(2);
        _volume.value = (_battery.level * 100).toFixed(2);
        changeBatteryVolume();
        $("#remain-time").html(Math.round(_battery.volume * (1 - _battery.level)) + " Seconds");    //show current remain time
        _updateLevelIcons();
        _triggerEvent(true, Math.round(_battery.volume * (1 - _battery.level)), Infinity, _battery.level, "chargingtimechange");
    });

    // update the UI parts
    if (_charging.checked) {
        _battery.volume = 600;
        _battery.level = _volume.value / 100;
        _setVolumeReadOnly(true);
        $("#remaining-time-label").html("Remaining Time to fully charged (seconds)");
        $("#charging-state").html("Plugged in - charging rate 0.17%/second");
    } else {
        _battery.level = _volume.value / 100.0;
        _updateLevelIcons();
        $("#remain-time").html("");
        _setVolumeReadOnly(false);
        $("#remaining-time-label").html("Remaining Time (seconds)");
        $("#charging-state").html("Plugged in?");
    }
}


function changeBatteryVolume() {
    if (_volume.value < 0)
        _volume.value = 0;
    else if (_volume.value > 100)
        _volume.value = 100;

    _battery.level = _volume.value / 100.0;
    _triggerEvent(true, 0, Infinity, _battery.level, "chargingtimechange");
    db.save(constants.BATTERY.VOLUME, _battery.level * 100);
    _updateLevelIcons();
}

function initBattery() {
    $("#" + constants.BATTERY.CHARGING).bind("change", _setCharging);

    $("#simulate-low-battery-btn").bind("click", function () {
        $("#simulate-low-battery").dialog("open");
    });

        $("#simulate-low-battery-cancel").bind("click", function () {
            $("#low-battery-start-at").val = 20;  //UI initialize
            $("#low-battery-remain-time").val = 1200;
            $("#simulate-low-battery").dialog("close");
        });

        $("#simulate-low-battery-start").bind("click", _startDischarging);
        $("#stop-btn").bind("click", _stopDischarging);

        $("#" + constants.BATTERY.VOLUME).bind("change", function () {
            changeBatteryVolume();
        });

        _charging.checked = false;
        _battery.level = db.retrieve(constants.BATTERY.VOLUME) / 100.0;
        _volume.value = (_battery.level * 100).toFixed(2);
        _updateLevelIcons();
        $("#simulate-low-battery").dialog({
            resizable: false,
            draggable: true,
            modal: true,
            autoOpen: false,
            position: 'center',
            minWidth: '460',
            minHeight: '240'
        });
}

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
            _DISPLAY_STATE  = constants.POWER_RESOURCE.DISPLAY.STATE,
            displayObj       = document.getElementById("display-power-state"),
            brightnessLabel  = document.getElementById("diplay-brightness-label"),
            brightness, stateObj;

        function initPowerState() {
            var obj, dbRules;
            brightness = deviceSettings.retrieve("Display.brightness");
            brightness = Number(brightness);
            brightnessLabel.innerHTML = "Display : (brightness = " + brightness + ")";
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
        event.on("DisplayBrightnessChanged", initPowerState);
        event.on("DisplayBrightnessChangedByPower", initPowerState);

        displayObj.addEventListener("change", function () {
            var state = displayObj.value, value;
            value = _DISPLAY_STATE[state].VALUE;
            deviceSettings.persist("Display.brightness", value);
            event.trigger("DisplayBrightnessChanged", [value]);
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
        initBattery();
    }
};