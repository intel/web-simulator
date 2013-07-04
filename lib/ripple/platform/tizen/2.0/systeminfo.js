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

var utils = require('ripple/utils'),
    deviceSettings = require('ripple/deviceSettings'),
    db = require('ripple/db'),
    constants = require('ripple/constants'),
    event = require('ripple/event'),
    tizen_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    _systemInfoProperties = ["BATTERY", "CPU", "STORAGE", "DISPLAY", "DEVICE_ORIENTATION", "BUILD", "LOCALE", "NETWORK", "WIFI_NETWORK", "CELLULAR_NETWORK", "SIM", "PERIPHERAL"],
    _propertyMap = {}, // Object like: {"BATTERY": ["level", "isCharging"], ...}
    _batteryEvent = ["BatteryLevelChanged", "BatteryChargingChanged"],
    _watches = {},
    _powerData = {},
    _security = {
        "http://tizen.org/privilege/system": ["SystemInfoSIM", "webApiVersion", "nativeApiVersion", "platformVersion"],
        "http://tizen.org/privilege/systemmanager": ["NetworkImei"]
    },
    _self;

function  _prepareObj(obj, aspect, property, value) {
    if ((aspect === "CELLULAR_NETWORK") && (property === "imei")) {
        obj.__defineGetter__("imei", function () {
            if (!_security.NetworkImei) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
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
        throw new WebAPIError(errorcode.SECURITY_ERR);
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
        obj = [obj];
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

function _isPropertyFound(propertyId) {
    if (tizen_utils.isEmptyObject(_propertyMap)) {
        _initialize();
    }

    if (_propertyMap[propertyId]) {
        return true;
    }

    return false;
}

function _rtnCapability() {
    var _self = {};

    _self.__defineGetter__("bluetooth", function () {
        return true;
    });
    _self.__defineGetter__("nfc", function () {
        return true;
    });
    _self.__defineGetter__("nfcReservedPush", function () {
        return false;
    });
    _self.__defineGetter__("multiTouchCount", function () {
        return 5;
    });
    _self.__defineGetter__("inputKeyboard", function () {
        return false;
    });
    _self.__defineGetter__("inputKeyboardLayout", function () {
        return false;
    });
    _self.__defineGetter__("wifi", function () {
        return true;
    });
    _self.__defineGetter__("wifiDirect", function () {
        return true;
    });
    _self.__defineGetter__("opengles", function () {
        return false;
    });
    _self.__defineGetter__("openglestextureFormat", function () {
        return "3dc";
    });
    _self.__defineGetter__("openglesVersion1_1", function () {
        return false;
    });
    _self.__defineGetter__("openglesVersion2_0", function () {
        return false;
    });
    _self.__defineGetter__("fmRadio", function () {
        return false;
    });
    _self.__defineGetter__("platformVersion", function () {
        if (!_security.platformVersion) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        return "2.1";
    });
    _self.__defineGetter__("webApiVersion", function () {
        if (!_security.webApiVersion) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        return "2.1";
    });
    _self.__defineGetter__("nativeApiVersion", function () {
        if (!_security.nativeApiVersion) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        return "2.1";
    });
    _self.__defineGetter__("platformName", function () {
        return "Tizen";
    });
    _self.__defineGetter__("camera", function () {
        return false;
    });
    _self.__defineGetter__("cameraFront", function () {
        return false;
    });
    _self.__defineGetter__("cameraFrontFlash", function () {
        return false;
    });
    _self.__defineGetter__("cameraBack", function () {
        return false;
    });
    _self.__defineGetter__("cameraBackFlash", function () {
        return false;
    });
    _self.__defineGetter__("location", function () {
        return true;
    });
    _self.__defineGetter__("locationGps", function () {
        return true;
    });
    _self.__defineGetter__("locationWps", function () {
        return false;
    });
    _self.__defineGetter__("microphone", function () {
        return false;
    });
    _self.__defineGetter__("usbHost", function () {
        return false;
    });
    _self.__defineGetter__("usbAccessory", function () {
        return false;
    });
    _self.__defineGetter__("screenOutputRca", function () {
        return false;
    });
    _self.__defineGetter__("screenOutputHdmi", function () {
        return false;
    });
    _self.__defineGetter__("platformCoreCpuArch", function () {
        return "x86";
    });
    _self.__defineGetter__("platformCoreFpuArch", function () {
        return "ssse3";
    });
    _self.__defineGetter__("sipVoip", function () {
        return false;
    });
    _self.__defineGetter__("duid", function () {
        return "device unique ID";
    });
    _self.__defineGetter__("speechRecognition", function () {
        return false;
    });
    _self.__defineGetter__("speechSynthesis", function () {
        return false;
    });
    _self.__defineGetter__("accelerometer", function () {
        return true;
    });
    _self.__defineGetter__("accelerometerWakeup", function () {
        return false;
    });
    _self.__defineGetter__("barometer", function () {
        return false;
    });
    _self.__defineGetter__("barometerWakeup", function () {
        return false;
    });
    _self.__defineGetter__("gyroscope", function () {
        return true;
    });
    _self.__defineGetter__("gyroscopeWakeup", function () {
        return false;
    });
    _self.__defineGetter__("magnetometer", function () {
        return false;
    });
    _self.__defineGetter__("magnetometerWakeup", function () {
        return false;
    });
    _self.__defineGetter__("photometer", function () {
        return false;
    });
    _self.__defineGetter__("photometerWakeup", function () {
        return false;
    });
    _self.__defineGetter__("proximity", function () {
        return false;
    });
    _self.__defineGetter__("proximityWakeup", function () {
        return false;
    });
    _self.__defineGetter__("tiltmeter", function () {
        return false;
    });
    _self.__defineGetter__("tiltmeterWakeup", function () {
        return false;
    });
    _self.__defineGetter__("dataEncryption", function () {
        return false;
    });
    _self.__defineGetter__("graphicsAcceleration", function () {
        return false;
    });
    _self.__defineGetter__("push", function () {
        return true;
    });
    _self.__defineGetter__("telephony", function () {
        return true;
    });
    _self.__defineGetter__("telephonyMms", function () {
        return true;
    });
    _self.__defineGetter__("telephonySms", function () {
        return true;
    });
    _self.__defineGetter__("screenSizeNormal", function () {
        return true;
    });
    _self.__defineGetter__("screenSize480_800", function () {
        return true;
    });
    _self.__defineGetter__("screenSize720_1280", function () {
        return true;
    });
    _self.__defineGetter__("autoRotation", function () {
        return true;
    });
    _self.__defineGetter__("shellAppWidget", function () {
        return false;
    });
    _self.__defineGetter__("visionImageRecognition", function () {
        return false;
    });
    _self.__defineGetter__("visionQrcodeGeneration", function () {
        return false;
    });
    _self.__defineGetter__("visionQrcodeRecognition", function () {
        return false;
    });
    _self.__defineGetter__("visionFaceRecognition", function () {
        return false;
    });
    _self.__defineGetter__("secureElement", function () {
        return false;
    });
    _self.__defineGetter__("nativeOspCompatible", function () {
        return false;
    });
    _self.__defineGetter__("inputKeyBack", function () {
        return true;
    });
    _self.__defineGetter__("inputKeyMenu", function () {
        return true;
    });
    return _self;
}


function _delayGetValue(timeout, propertyId, successCallback, errorCallback) {
    return setInterval(function () {
        _getValue(propertyId, successCallback, errorCallback);
    }, timeout);
}

_self = function () {
    function getCapabilities() {
        return _rtnCapability();
    }

    function getPropertyValue(propertyId, successCallback, errorCallback) {
        if (typeof propertyId !== 'string') {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (_isPropertyFound(propertyId) === false) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (typeof successCallback !== "function" || (errorCallback !== null && errorCallback !== undefined && typeof errorCallback !== "function")) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        return tizen_utils.validateTypeMismatch(successCallback, errorCallback, "getPropertyValue", function () {

            setTimeout(_getValue(propertyId, successCallback, errorCallback), 1); // Simulate a async operation

            return null;
        });
    }

    function addPropertyValueChangeListener(propertyId, successCallback, options) {
    // no error callback in spec, as of 2.0.0 RC7.
        var WatchOBJ;

        WatchOBJ = function (deviceEventType, propertyId, successCallback) {
            var obj = this;
            this.eventType = deviceEventType;
            this.onEvent = function (newValue) {
                if (obj.timeout) {
                    clearInterval(obj.intervalId);
                    obj.intervalId = setInterval(function () {
                        _getValue(propertyId, successCallback, null);
                    }, obj.timeout);
                }

                if ((obj.highThreshold && (newValue < obj.highThreshold)) ||
                    (obj.lowThreshold && (newValue > obj.lowThreshold))) {
                    return;
                }

                _getValue(propertyId, successCallback, null);
            };
        };

        if (typeof propertyId !== 'string') {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (_isPropertyFound(propertyId) === false) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (options !== undefined && options !== null) {
            if ((typeof options !== 'object') ||
               (options.hasOwnProperty("timeout") && typeof options.timeout !== 'number') ||
               (options.hasOwnProperty("highThrashold") && typeof options.highThrashold !== 'number') ||
               (options.hasOwnProperty("lowThrashold") && typeof options.lowThrashold !== 'number'))
            {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
        }

        return tizen_utils.validateTypeMismatch(successCallback, null, "addPropertyValueChangeListener", function () {
            var watchId = (new Date()).getTime(),
                _options = new Object(options),
                properties, property, index = 0, deviceEventType, watchObj;

            // A listener will listen all the properties of one aspect, each of the property
            // will have an internal watchObj to record the information.
            _watches[watchId] = [];

            if (propertyId === "BATTERY") {
                properties = _batteryEvent;
            } else {
                properties = _propertyMap[propertyId];
            }

            for (; index < properties.length; index++) {
                property = properties[index];
                if (propertyId === "BATTERY") {
                    deviceEventType = property;
                } else {
                    deviceEventType = deviceSettings.retrieve(propertyId)[property].event;
                }

                if (deviceEventType === undefined) continue;
                // These two items are needed when delete an event listener.
                watchObj = new WatchOBJ(deviceEventType, propertyId, successCallback);

                if (options && _options.timeout) {
                    watchObj.intervalId = _delayGetValue(_options.timeout, propertyId, successCallback, null);
                }

                if (watchObj.eventType === "CpuLoadChanged" || watchObj.eventType === "DisplayBrightnessChanged" || watchObj.eventType === "BatteryLevelChanged") {
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

            setTimeout(function () {
                _getValue(propertyId, successCallback, null);
            }, 1);

            return watchId;
        });
    }

    function removePropertyValueChangeListener(listenerID) {
        var _handler = listenerID, index = 0, watchObjs = [], watchObj;

        if (typeof listenerID !== 'number') {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!_watches[_handler]) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        watchObjs = _watches[_handler];
        if (watchObjs) {
            for (; index < watchObjs.length; index++) {
                watchObj = watchObjs[index];
                event.deleteEventHandler(watchObj.eventType, watchObj.onEvent);
                if (watchObj.intervalId) {
                    clearInterval(watchObj.intervalId);
                }
            }
            delete(_watches[_handler]);
        }
        return null;
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

module.exports = _self;

