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
            level,
            chargingTime,
            dischargingTime,
            INTERVAL = 1000;

        function updateBatteryVolumeValues() {
            var volumeStr = volume.value + "", batteryVolume, timeValue;
  

            volumeStr = volumeStr.substring(0, 5);
            batteryVolume = _getBatteryVolume(volumeStr);
            timeValue = volumeStr * time.value / 100;
            timeValue = Math.floor(timeValue * 100) / 100;
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
                if ((time.value !== undefined) && (time.value * 1 > 0)) {
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
            var step, status;

            if ((volume.value * 1) + 100 / (60 * time.value) > 100 || (volume.value * 1) - 100 / (60 * time.value) < 0) {
                clearInterval(interval);
            }

            chargingTime = (60 * (100 - time.value) * volume.value) / 100;

            if (charging.checked) {
                step = 100;
                status = {
                    charging: true,
                    chargingTime: chargingTime,
                    dischargingTime: Infinity,
                    level: level,
                    type: "chargingchange"
                };
            } else {
                step = -100;
                status = {
                    charging: false,
                    chargingTime: chargingTime,
                    dischargingTime: dischargingTime,
                    level: level,
                    type: "dischargingtimechange"
                };
            }

            level = Math.floor(((volume.value * 1) + step / (60 * time.value)) / 10) * 0.1;
            event.trigger("BatteryEvent", [status]);
            document.getElementById(constants.BATTERY.VOLUME).value = (volume.value * 1) + step / (60 * time.value);
            updateBatteryVolumeValues();
        }

        initializeValues();
    }
};
