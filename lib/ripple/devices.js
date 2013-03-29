/*
 *  Copyright 2011 Research In Motion Limited.
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
var _self,
    db = require('ripple/db'),
    utils = require('ripple/utils'),
    exception = require('ripple/exception'),
    platform = require('ripple/platform'),
    constants = require('ripple/constants'),
    event = require('ripple/event'),
    _devices = {};

event.on("HardwareKeyDefault", function (key) {
    if (key === 0 || key === "0") { //back button key
        require('ripple/emulatorBridge').window().history.back();
    }
});

_self = module.exports = {
    initialize: function () {
        _devices = [
/* 
           "Bold9700",
            "Bold9900",
            "Colt",
            "Curve9300",
            "Curve9350-9360-9370",
            "FWVGA",
            "G1",
*/
            "tizen-WVGA",
            "tizen-HD",
/*
            "HPPre3",
            "HPVeer",
*/
//            "HVGA",
/*
            "iPad",
            "iPhone3",
            "Legend",
            "Nexus",
            "NexusS",
            "NexusGalaxy",
            "Nexus7",
            "NokiaN8",
            "NokiaN97",
            "PalmPre",
            "PalmPre2",
            "Pearl9100",
            "Playbook",
            "QVGA",
            "Style9670",
            "Tattoo",
            "Torch9800",
            "Torch9810",
            "Torch9860-9850",
            "Wave",
            "WQVGA",
*/
//            "WSVGA",
            "WVGA",
            "HD",
            "custom"
        ].reduce(function (hash, deviceID) {
            hash[deviceID] = require('ripple/devices/' + deviceID);
            return hash;
        }, {});

        var current = this.getCurrentDevice();
        require('ripple/bus').send('userAgent', current.userAgent);
    },

    getCurrentDevice: function () {
        var deviceId = db.retrieve("device-key"),
            device = this.getDevice(deviceId),
            platformId = platform.current().id,
            does = function (device) {
                return {
                    include: function (platformId) {
                        return device.platforms.some(function (id) {
                            return platformId === id;
                        });
                    }
                };
            };

        if (deviceId !== "custom" && (!device || !does(device).include(platformId))) {
            deviceId = utils.reduce(_devices, function (current, device, id) {
                return does(device).include(platformId) ? id : current;
            });
            device = this.getDevice(deviceId);
        }

        return device;
    },

    getDevice: function (deviceId) {
        var device, width, height;

        device = _devices[deviceId] ? utils.copy(_devices[deviceId]) : null;
        width = db.retrieve("custom_width");
        height = db.retrieve("custom_height");

        if (width === undefined) {
            width = 600;
        } else {
            width =  parseInt(width, 10);
        }

        if (height === undefined) {
            height = 800;
        } else {
            height =  parseInt(height, 10);
        }

        $('#resolution-custom-width').val(width);
        $('#resolution-custom-height').val(height);
        if (deviceId === "custom") {
            device.screen.width = device.viewPort.portrait.width = width;
            device.screen.height = device.viewPort.portrait.height = height;
            device.viewPort.landscape.height = width;
            device.viewPort.landscape.width = height;
            $('input:radio[name="resolution-type"][value="custom"]').click();
        }
        return device;
    },

    getDevicesForPlatform: function (platformId) {
        return utils.filter(_devices, function (device) {
            return device.platforms.indexOf(platformId) > -1;
        });
    }
};
