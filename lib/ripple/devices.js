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
            "tizen-HD",
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
        var device, width, height, viewportWidth=undefined, viewportHeight=undefined, layout, viewportTag, ratio;

        device = _devices[deviceId] ? utils.copy(_devices[deviceId]) : null;
        width = db.retrieve("custom_width") || 600;
        height = db.retrieve("custom_height") || 800;
        viewportTag = db.retrieveObject("viewportTag");
        layout = db.retrieve("layout") || "portrait" ;

        if (deviceId === undefined)
            return null;
        width =  parseInt(width, 10);
        height =  parseInt(height, 10);

        if (viewportTag != undefined) {
            if (viewportTag['width'] != undefined) {
                viewportWidth = parseInt(viewportTag['width']);
                db.saveObject("viewport_width", viewportWidth);

                if (layout === "portrait") {
                    if (deviceId != "custom") {
                        ratio = device.screen.height / device.screen.width;
                    } else {
                        ratio = height / width;
                    }
                    viewportHeight = viewportWidth * ratio;
                    db.saveObject("viewport_height", viewportHeight);
                } else {
                    if (deviceId != "custom") {
                        ratio = device.screen.width / device.screen.height;
                    } else {
                        ratio = width / height;
                    }
                    viewportHeight = viewportWidth * ratio;
                    db.saveObject("viewport_height", viewportHeight);
                }
            } else if(viewportTag['height'] != undefined) {
                viewportHeight = parseInt(viewportTag['height']);
                db.saveObject("viewport_height", viewportHeight);

                if (layout === "portrait") {
                    if (deviceId != "custom") {
                        ratio = device.screen.height / device.screen.width;
                    } else {
                        ratio = height / width;
                    }
                    viewportWidth = viewportHeight / ratio;
                    db.saveObject("viewport_width", viewportWidth);
                } else {
                    if (deviceId != "custom") {
                        ratio = device.screen.width / device.screen.height;
                    } else {
                        ratio = width / height;
                    }
                    viewportWidth = viewportHeight / ratio;
                    db.saveObject("viewport_width", viewportWidth);
                }
            }
        }

        if (viewportWidth === undefined) {
            if (deviceId === "custom") {
                viewportWidth = width;
            } else {
                viewportWidth = device.viewPort[layout].width;
            }
        }

        if (viewportHeight === undefined) {
            if (deviceId === "custom") {
                viewportHeight = height;
            } else {
                viewportHeight = device.viewPort[layout].height;
            }
        }

        $('#resolution-custom-width').val(width);
        $('#resolution-custom-height').val(height);

        if (deviceId === "custom") {
            device.screen.width = width;
            device.screen.height = height;
            $('input:radio[name="resolution-type"][value="custom"]').click();
        }

        if (layout === "portrait") {
            device.viewPort.portrait.width = viewportWidth;
            device.viewPort.portrait.height = viewportHeight;
            device.viewPort.landscape.width = viewportHeight;
            device.viewPort.landscape.height = viewportWidth;
        } else {
            device.viewPort.portrait.width = viewportHeight;
            device.viewPort.portrait.height = viewportWidth;
            device.viewPort.landscape.width = viewportWidth;
            device.viewPort.landscape.height = viewportHeight;
        }

        return device;
    },

    getDevicesForPlatform: function (platformId) {
        return utils.filter(_devices, function (device) {
            return device.platforms.indexOf(platformId) > -1;
        });
    }
};
