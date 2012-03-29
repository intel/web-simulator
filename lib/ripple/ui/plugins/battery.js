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
    return volume + '%';
}

module.exports = {
    panel: {
        domId: "battery-container",
        collapsed: true,
        pane: "left"
    },
    initialize: function () {
        var time = document.getElementById(constants.BATTERY.TIME),
            volume = document.getElementById(constants.BATTERY.VOLUME),
            charging = document.getElementById(constants.BATTERY.CHARGING),
            interval,
            INTERVAL = 1000;

        function updateBatteryVolumeValues() {
            var volumeStr = volume.value + "", batteryVolume, timeValue;
  

            volumeStr = volumeStr.substring(0, 5);
            batteryVolume = _getBatteryVolume(volumeStr);
            timeValue = volumeStr * time.value / 100.0;
            timeValue = Math.floor(timeValue * 100.0) / 100.0;
            document.getElementById("battery-volume-label").innerHTML = batteryVolume;
            document.getElementById("battery-remaining-power").innerHTML = timeValue;
        }

        function initializeValues() {
            var timeValue     =  db.retrieve(constants.BATTERY.TIME),
                volumeValue   =  db.retrieve(constants.BATTERY.VOLUME) || 100,
                chargingValue =  db.retrieve(constants.BATTERY.CHARGING);

            chargingValue = (chargingValue === "true");

            document.getElementById(constants.BATTERY.TIME).value       = timeValue;
            document.getElementById(constants.BATTERY.VOLUME).value     = volumeValue;
            document.getElementById(constants.BATTERY.CHARGING).checked = chargingValue;

            updateBatteryVolumeValues();
            interval = setInterval(chargingVolume, INTERVAL);
        }

        document.getElementById(constants.BATTERY.TIME)
            .addEventListener("change", function () {
                db.save(constants.BATTERY.TIME, time.value);
                clearInterval(interval);
                if ((time.value !== undefined) && (time.value > 0)) {
                    interval = setInterval(chargingVolume, INTERVAL);
                }
            }, false);

        document.getElementById(constants.BATTERY.VOLUME)
            .addEventListener("change", function () {
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
            batteryPercent = volume.value * 1.0;

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

            level = ((volume.value * 1.0) + step / (60.0 * time.value)) / 100.0;
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
            document.getElementById(constants.BATTERY.VOLUME).value = level * 100.0;
            updateBatteryVolumeValues();
        }

        initializeValues();
    }
};
