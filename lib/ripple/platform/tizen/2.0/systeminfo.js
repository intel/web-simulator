/*
 *  Copyright 2013 Intel Corporation.
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

var deviceSettings = require('ripple/deviceSettings'),
    db = require('ripple/db'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    typedef = require('ripple/platform/tizen/2.0/typedef'),
    constants = require('ripple/constants'),
    event = require('ripple/event'),
    tizen_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    SystemInfoDeviceCapability,
    _systemInfoProperties = typedef.SystemInfoPropertyId,
    _propertyMap = {}, // Object like: {"BATTERY": ["level", "isCharging"], ...}
    _batteryEvent = ["BatteryLevelChanged", "BatteryChargingChanged"],
    _watches = {},
    _firstCall_watches = {},
    _powerData = {},
    _systemInfoDeviceCapability = null,
    _security = {
        "http://tizen.org/privilege/system": ["SystemInfoSIM", "webApiVersion",
                "nativeApiVersion", "platformVersion"],
        "http://tizen.org/privilege/systemmanager": ["NetworkImei"]
    },
    _self;

function _prepareObj(obj, aspect, property, value) {
    if ((aspect === "CELLULAR_NETWORK") && (property === "imei")) {
        obj.__defineGetter__("imei", function () {
            if (!_security.NetworkImei) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }
            return deviceSettings.retrieve("CELLULAR_NETWORK.imei");
        });
    } else {
        if (aspect === "WIFI_NETWORK" || aspect === "CELLULAR_NETWORK") {
            if (property === 'status') {
                if (value === true) {
                    value = "ON";
                } else {
                    value = "OFF";
                }
            }
        }
        obj.__defineGetter__(property, function () {
            return value;
        });
    }
}

function _getValue(aspect, successCallback) {
    var properties = [], value, index = 0, property, obj = {};

    if ((aspect === "SIM") && !_security.SystemInfoSIM) {
        throw new WebAPIException(errorcode.SECURITY_ERR);
    }

    if (aspect === "BATTERY") {
        successCallback(_powerData);
        return;
    }

    properties = _propertyMap[aspect];
    for (; index < properties.length; index++) {
        property = properties[index];
        value = deviceSettings.retrieve(aspect + "." + property);
        _prepareObj(obj, aspect, property, value);
    }

    if (aspect === "STORAGE") {
        obj.__defineGetter__("units", function () {
            return [obj];
        });
    }

    successCallback(obj);
}

function _initialize() {
    var aspectName, index, i, vol;

    for (index = 0; index < _systemInfoProperties.length; index++) {
        aspectName = _systemInfoProperties[index];
        _propertyMap[aspectName] = [];
        for (i in deviceSettings.retrieve(aspectName)) {
            _propertyMap[aspectName].push(i);
        }
    }

    _propertyMap.BATTERY.push("level");
    _propertyMap.BATTERY.push("isCharging");

    _powerData.__defineGetter__("isCharging", function () {
        return false;
    });

    vol = db.retrieve(constants.BATTERY.VOLUME) || 100.0;
    _powerData.__defineGetter__("level", function () {
        return Number((vol / 100.0).toFixed(4));
    });

    event.on("BatteryEvent", function (status) {
        _powerData.__defineGetter__("isCharging", function () {
            return status.charging;
        });
        _powerData.__defineGetter__("level", function () {
            return Number(status.level.toFixed(4));
        });
    });
}

function _isPropertyFound(property) {
    if (tizen_utils.isEmptyObject(_propertyMap)) {
        _initialize();
    }

    if (_propertyMap[property]) {
        return true;
    }

    return false;
}

function _delayGetValue(timeout, property, successCallback, errorCallback) {
    return window.setInterval(function () {
        _getValue(property, successCallback, errorCallback);
    }, timeout);
}

_self = function () {
    function getCapabilities() {
        if (_systemInfoDeviceCapability === null) {
            _systemInfoDeviceCapability = new SystemInfoDeviceCapability();
        }
        return _systemInfoDeviceCapability;
    }

    function getPropertyValue(property, successCallback, errorCallback) {
        t.SystemInfo("getPropertyValue", arguments);

        if (!_isPropertyFound(property)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        window.setTimeout(function () {
            _getValue(property, successCallback, errorCallback);
        }, 1);
    }

    function addPropertyValueChangeListener(property, successCallback, options) {
        var WatchOBJ, watchId = Number(Math.uuid(8, 10)),
            _options = new Object(options), properties, prop, index = 0,
            deviceEventType, watchObj, firstCallWatchObj;

        t.SystemInfo("addPropertyValueChangeListener", arguments);

        if (!_isPropertyFound(property)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        WatchOBJ = function (deviceEventType, property, successCallback) {
            var obj = this;

            this.eventType = deviceEventType;
            this.onEvent = function (newValue) {
                if (obj.timeout) {
                    window.clearInterval(obj.intervalId);
                    obj.intervalId = window.setInterval(function () {
                        _getValue(property, successCallback, null);
                    }, obj.timeout);
                }

                if ((obj.highThreshold && (newValue < obj.highThreshold)) ||
                    (obj.lowThreshold && (newValue > obj.lowThreshold))) {
                    return;
                }

                _getValue(property, successCallback, null);
            };
        };

        // A listener will listen all the properties of one aspect, each of the property
        // will have an internal watchObj to record the information.
        _watches[watchId] = [];

        if (property === "BATTERY") {
            properties = _batteryEvent;
        } else {
            properties = _propertyMap[property];
        }

        for (; index < properties.length; index++) {
            prop = properties[index];
            if (property === "BATTERY") {
                deviceEventType = prop;
            } else {
                deviceEventType = deviceSettings.retrieve(property)[prop].event;
            }

            if (deviceEventType === undefined) continue;
            // These two items are needed when delete an event listener.
            watchObj = new WatchOBJ(deviceEventType, property, successCallback);

            if (options && _options.timeout) {
                watchObj.intervalId = _delayGetValue(_options.timeout, property,
                        successCallback, null);
            }

            if ((watchObj.eventType === "CpuLoadChanged") ||
                    (watchObj.eventType === "DisplayBrightnessChanged") ||
                    (watchObj.eventType === "BatteryLevelChanged")) {
                if (options && _options.highThreshold) {
                    watchObj.highThreshold = _options.highThreshold;
                }

                if (options && _options.lowThreshold) {
                    watchObj.lowThreshold = _options.lowThreshold;
                }
            }

            _watches[watchId].push(watchObj);
            if (watchObj.eventType) {
                event.on(watchObj.eventType, watchObj.onEvent);
            }
        }

        firstCallWatchObj = window.setTimeout(function () {
            _getValue(property, successCallback, null);
            delete _firstCall_watches[watchId];
        }, 1);

        _firstCall_watches[watchId] = firstCallWatchObj;

        return watchId;
    }

    function removePropertyValueChangeListener(listenerID) {
        var _handler = listenerID, index = 0, watchObjs = [], watchObj;

        if (!_watches[_handler])
            return;

        watchObjs = _watches[_handler];
        if (watchObjs) {
            for (; index < watchObjs.length; index++) {
                watchObj = watchObjs[index];
                event.deleteEventHandler(watchObj.eventType, watchObj.onEvent);
                if (watchObj.intervalId) {
                    window.clearInterval(watchObj.intervalId);
                }
            }
            delete _watches[_handler];
        }

        if (_firstCall_watches[_handler]) {
            window.clearTimeout(_firstCall_watches[_handler]);
            delete _firstCall_watches[_handler];
        }
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    var systeminfo = {
        getCapabilities: getCapabilities,
        getPropertyValue: getPropertyValue,
        addPropertyValueChangeListener: addPropertyValueChangeListener,
        removePropertyValueChangeListener: removePropertyValueChangeListener,
        handleSubFeatures: handleSubFeatures
    };

    return systeminfo;
};

SystemInfoDeviceCapability = function () {
    this.__defineGetter__("bluetooth", function () {
        return true;
    });
    this.__defineGetter__("nfc", function () {
        return true;
    });
    this.__defineGetter__("nfcReservedPush", function () {
        return false;
    });
    this.__defineGetter__("multiTouchCount", function () {
        return 5;
    });
    this.__defineGetter__("inputKeyboard", function () {
        return false;
    });
    this.__defineGetter__("inputKeyboardLayout", function () {
        return false;
    });
    this.__defineGetter__("wifi", function () {
        return true;
    });
    this.__defineGetter__("wifiDirect", function () {
        return true;
    });
    this.__defineGetter__("opengles", function () {
        return false;
    });
    this.__defineGetter__("openglestextureFormat", function () {
        return "";
    });
    this.__defineGetter__("openglesVersion1_1", function () {
        return false;
    });
    this.__defineGetter__("openglesVersion2_0", function () {
        return false;
    });
    this.__defineGetter__("fmRadio", function () {
        return false;
    });
    this.__defineGetter__("platformVersion", function () {
        if (!_security.platformVersion) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        return "2.2.0";
    });
    this.__defineGetter__("webApiVersion", function () {
        if (!_security.webApiVersion) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        return "2.2";
    });
    this.__defineGetter__("nativeApiVersion", function () {
        if (!_security.nativeApiVersion) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        return "2.2";
    });
    this.__defineGetter__("platformName", function () {
        return "Tizen";
    });
    this.__defineGetter__("camera", function () {
        return false;
    });
    this.__defineGetter__("cameraFront", function () {
        return false;
    });
    this.__defineGetter__("cameraFrontFlash", function () {
        return false;
    });
    this.__defineGetter__("cameraBack", function () {
        return false;
    });
    this.__defineGetter__("cameraBackFlash", function () {
        return false;
    });
    this.__defineGetter__("location", function () {
        return true;
    });
    this.__defineGetter__("locationGps", function () {
        return true;
    });
    this.__defineGetter__("locationWps", function () {
        return false;
    });
    this.__defineGetter__("microphone", function () {
        return false;
    });
    this.__defineGetter__("usbHost", function () {
        return true;
    });
    this.__defineGetter__("usbAccessory", function () {
        return false;
    });
    this.__defineGetter__("screenOutputRca", function () {
        return false;
    });
    this.__defineGetter__("screenOutputHdmi", function () {
        return false;
    });
    this.__defineGetter__("platformCoreCpuArch", function () {
        return "x86";
    });
    this.__defineGetter__("platformCoreFpuArch", function () {
        return "ssse3";
    });
    this.__defineGetter__("sipVoip", function () {
        return false;
    });
    this.__defineGetter__("duid", function () {
        return "device unique ID";
    });
    this.__defineGetter__("speechRecognition", function () {
        return false;
    });
    this.__defineGetter__("speechSynthesis", function () {
        return false;
    });
    this.__defineGetter__("accelerometer", function () {
        return true;
    });
    this.__defineGetter__("accelerometerWakeup", function () {
        return false;
    });
    this.__defineGetter__("barometer", function () {
        return false;
    });
    this.__defineGetter__("barometerWakeup", function () {
        return false;
    });
    this.__defineGetter__("gyroscope", function () {
        return true;
    });
    this.__defineGetter__("gyroscopeWakeup", function () {
        return false;
    });
    this.__defineGetter__("magnetometer", function () {
        return false;
    });
    this.__defineGetter__("magnetometerWakeup", function () {
        return false;
    });
    this.__defineGetter__("photometer", function () {
        return false;
    });
    this.__defineGetter__("photometerWakeup", function () {
        return false;
    });
    this.__defineGetter__("proximity", function () {
        return false;
    });
    this.__defineGetter__("proximityWakeup", function () {
        return false;
    });
    this.__defineGetter__("tiltmeter", function () {
        return false;
    });
    this.__defineGetter__("tiltmeterWakeup", function () {
        return false;
    });
    this.__defineGetter__("dataEncryption", function () {
        return false;
    });
    this.__defineGetter__("graphicsAcceleration", function () {
        return false;
    });
    this.__defineGetter__("push", function () {
        return true;
    });
    this.__defineGetter__("telephony", function () {
        return true;
    });
    this.__defineGetter__("telephonyMms", function () {
        return true;
    });
    this.__defineGetter__("telephonySms", function () {
        return true;
    });
    this.__defineGetter__("screenSizeNormal", function () {
        return true;
    });
    this.__defineGetter__("screenSize480_800", function () {
        return true;
    });
    this.__defineGetter__("screenSize720_1280", function () {
        return true;
    });
    this.__defineGetter__("autoRotation", function () {
        return true;
    });
    this.__defineGetter__("shellAppWidget", function () {
        return false;
    });
    this.__defineGetter__("visionImageRecognition", function () {
        return false;
    });
    this.__defineGetter__("visionQrcodeGeneration", function () {
        return false;
    });
    this.__defineGetter__("visionQrcodeRecognition", function () {
        return false;
    });
    this.__defineGetter__("visionFaceRecognition", function () {
        return false;
    });
    this.__defineGetter__("secureElement", function () {
        return false;
    });
    this.__defineGetter__("nativeOspCompatible", function () {
        return false;
    });
    this.__defineGetter__("profile", function () {
        return "MOBILE_WEB";
    });
};

module.exports = _self;
