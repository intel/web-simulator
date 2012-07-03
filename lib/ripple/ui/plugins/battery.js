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

var event = require('ripple/event'),
    db = require('ripple/db'),
    constants = require('ripple/constants');

function _getBatteryVolume(volume) {
    volume = volume.substring(0, 5);
    return volume + '%';
}

module.exports = {
    panel: {
        domId: "battery-container",
        collapsed: true,
        pane: "left",
        titleName: "Battery",
        display: true
    },
    initialize: function () {
        var time     = document.getElementById(constants.BATTERY.TIME),
            volume   = document.getElementById(constants.BATTERY.VOLUME),
            charging = document.getElementById(constants.BATTERY.CHARGING),
            comment  = document.getElementById("error-comment"),
            INTERVAL = 1000,
            isValid  = false,
            interval,
            _volume;


        function updateBatteryVolumeValues() {
            var volumeStr = _volume + "", batteryVolume, timeValue;

            batteryVolume = _getBatteryVolume(volumeStr);
            timeValue = volumeStr * time.value / 100.0;
            timeValue = Math.floor(timeValue * 100.0) / 100.0;
            document.getElementById("battery-volume-label").innerHTML = batteryVolume;
            document.getElementById("battery-remaining-power").innerHTML = timeValue;
        }

        function initializeValues() {
            var timeValue     =  db.retrieve(constants.BATTERY.TIME) || 600,
                volumeValue   =  db.retrieve(constants.BATTERY.VOLUME) || 100,
                chargingValue =  db.retrieve(constants.BATTERY.CHARGING);
                
            chargingValue = (chargingValue === "true");
            _volume       =   volumeValue * 1.00;
            document.getElementById(constants.BATTERY.TIME).value       = timeValue;
            document.getElementById(constants.BATTERY.VOLUME).value     = volumeValue;
            document.getElementById(constants.BATTERY.CHARGING).checked = chargingValue;

            updateBatteryVolumeValues();
            chargingVolume();
            interval = setInterval(chargingVolume, INTERVAL);
        }
        function checkTimeValue(value) {
            var pattern = /^(?:600|[1-5]\d{0,2}|[1-9]\d|[1-9])$/;
            return pattern.test(value);
        }
        function updateBattery() {
            var timeValue     =  db.retrieve(constants.BATTERY.TIME) || 600,
                volumeValue   =  db.retrieve(constants.BATTERY.VOLUME) || 100;

            clearInterval(interval);
            _volume       =   volumeValue * 1.00;
            document.getElementById(constants.BATTERY.TIME).value       = timeValue;
            document.getElementById(constants.BATTERY.VOLUME).value     = volumeValue;
            updateBatteryVolumeValues();
            interval = setInterval(chargingVolume, INTERVAL);
        }
        document.getElementById(constants.BATTERY.TIME)
            .addEventListener("change", function () {
                isValid = checkTimeValue(time.value);
                if (isValid) {//Valid value
                    comment.style.display = "none";
                    time.style.color = "black";
                    db.save(constants.BATTERY.TIME, time.value);
                    updateBattery();
                } else {
					   comment.style.display = "inline";
                    time.style.color = "red";
                    updateBattery();
                }
            }, false);

        document.getElementById(constants.BATTERY.VOLUME)
            .addEventListener("change", function () {
                _volume = volume.value * 1.00;
                updateBatteryVolumeValues();
                db.save(constants.BATTERY.VOLUME, volume.value);
                clearInterval(interval);
                interval = setInterval(chargingVolume, INTERVAL);
            }, false);

        document.getElementById(constants.BATTERY.CHARGING)
            .addEventListener("change", function () {
                db.save(constants.BATTERY.CHARGING, charging.checked);
                clearInterval(interval);
                interval = setInterval(chargingVolume, INTERVAL);
            }, false);

        function chargingVolume() {
            var step, status, level, type, batteryLifeTime, batteryPercent, chargingStatus, chargingTime, dischargingTime;

            batteryLifeTime = 60.0 * time.value;
            batteryPercent = _volume * 1.0;

            if (charging.checked) {
                step = 100;
                chargingStatus = true;
                // charging is 10 times faster than discharging
                chargingTime = (batteryLifeTime * (100.0 - batteryPercent)) / 100.0 / 10.0;
                dischargingTime = Infinity;
                type = "chargingchange";

                if (batteryPercent + 100 / batteryLifeTime > 99.9999) {
                    clearInterval(interval);
                }
            } else {
                step = -100;
                chargingStatus = false;
                chargingTime = Infinity;
                dischargingTime = batteryLifeTime * batteryPercent / 100.0;
                type = "dischargingtimechange";

                if (batteryPercent - 100 / batteryLifeTime < 0.0001) {
                    clearInterval(interval);
                }
            }
            level = (_volume  + step /(60.0 *  time.value)) / 100.0;
            if (level < 0.0001) {
                level = 0;
            } else if (level > 0.9999) {
                level = 1.0;
            }

            status = {
                charging: chargingStatus,
                chargingTime: chargingTime,
                dischargingTime: dischargingTime,
                level: level,
                type: type
            };

            event.trigger("BatteryEvent", [status]);
            _volume = level * 100.0;
            updateBatteryVolumeValues();
        }

        initializeValues();
    }
};
