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
    wac2_utils = require('ripple/platform/wac/2.0/wac2_utils'),
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    _console = require('ripple/console'),
    DeviceApiError = require('ripple/platform/wac/2.0/deviceapierror'),
    deviceSettings = require('ripple/deviceSettings'),    
    event = require('ripple/event'),    
    PendingOperation = require('ripple/platform/wac/2.0/pendingoperation'),
    PendingObject = require('ripple/platform/wac/2.0/pendingObject'),
    _getDeviceInfoAspect = true,
    _getNetworkInfoAspect = true,    
    _deviceInfoAspect = ["Battery", "Device", "Display", "MemoryUnit", "OperatingSystem", "WebRuntime"],    
    _networkInfoAspect = ["CellularHardware", "CellularNetwork", "WiFiHardware", "WiFiNetwork"],
    _aspectArray = [], 
    _propertyMap = {},
    _watches = {},
    _self;

function _asynchErrorCallback(errorCallback, errorCode) {
    if (errorCallback) {        
        setTimeout(function () {
            errorCallback(errorCode);
        }, 1);  
    }
}

function _initialize() {
    var aspectName, index, i;

    _aspectArray = _deviceInfoAspect.concat(_networkInfoAspect);
    for (index = 0; index < _aspectArray.length; index++) {
        aspectName = _aspectArray[index];
        _propertyMap[aspectName] = [];
        for (i in deviceSettings.retrieve(aspectName)) {
            _propertyMap[aspectName].push(i);
        }
    }     
}

function _isPropertyFound(aspect, property) {
    if (_aspectArray.length === 0) {
        _initialize();
    }

    if (_propertyMap[aspect]) {
        if (property) {
            return _propertyMap[aspect].some(function (prop) {
                return prop === property;
            });
        }
        return true;
    }
    return false;
}

function _isPropertySupported(aspect) {
    if (_getDeviceInfoAspect === false) {
        return _deviceInfoAspect.some(function (asp) {
            return asp !== aspect;
        });
    }
    if (_getNetworkInfoAspect === false) {
        return _networkInfoAspect.some(function (asp) {
            return asp !== aspect;
        });
    }
    return true;
}

function _isPropertyValid(prop, errorCallback) {
    var _prop = Object(prop);

    if (_prop && _prop.aspect && _prop.property) {
        if (_isPropertyFound(_prop.aspect, _prop.property) === false) {
            _asynchErrorCallback(errorCallback, new DeviceApiError(errorcode.NOT_FOUND_ERR));
            return false;
        }
        else if (_isPropertySupported(_prop.aspect) === false) {
            _asynchErrorCallback(errorCallback, new DeviceApiError(errorcode.NOT_SUPPORTED_ERR));
            return false;
        }
    } 
    else {
        _asynchErrorCallback(errorCallback, new DeviceApiError(errorcode.INVALID_VALUES_ERR));
        return false;
    }
    return true;
}

module.exports = _self = {  
    getComponents: function (aspect) {
        if (_isPropertyFound(aspect))
            return ["_default"];
        return null;              
    },

    isSupported: function (aspect, property) {
        return _isPropertyFound(aspect, property) && _isPropertySupported(aspect) ? true : false;
    },

    getPropertyValue: function (successCallback, errorCallback, prop) {
        return wac2_utils.validateTypeMismatch(successCallback, errorCallback, "getPropertyValue", function () {                                  
            if (_isPropertyValid(prop, errorCallback) !== true)
                return undefined;
            
            var value = deviceSettings.retrieve(prop.aspect + "." + prop.property);
            if (value !== undefined) {
                successCallback(value, prop);
            }
            else {
                _asynchErrorCallback(errorCallback, new DeviceApiError(errorcode.NOT_AVAILABLE_ERR)); 
            }
            
            return null;    
        });        
    },
   
    watchPropertyChange: function (successCallback, errorCallback, prop, options) {  
        return wac2_utils.validateTypeMismatch(successCallback, errorCallback, "watchPropertyChange", function () {
            if (_isPropertyValid(prop, errorCallback) !== true)
                return undefined;

            var _options = Object(options),
                eventType = deviceSettings.retrieve(prop.aspect)[prop.property].event,
                watchObj = {
                    eventType: eventType,
                    onEvent: function (newValue) {
                        if (watchObj.timeStamp && 
                            ((new Date()).getTime() - watchObj.timeStamp < options.minNotificationInterval)) {
                            return undefined;
                        }                       
                        else if (watchObj.value &&
                                 (newValue > watchObj.value * (1 - _options.minChangePercent) && 
                                  newValue < watchObj.value * (1 + _options.minChangePercent))) {
                            return undefined;
                        }

                        if (watchObj.intervalId) {
                            clearInterval(watchObj.intervalId);
                            watchObj.intervalId = setInterval(function () {
                                successCallback(deviceSettings.retrieve(prop.aspect + "." + prop.property), prop);
                            }, _options.maxNotificationInterval);
                        }
                        successCallback(newValue, prop);
                        if (watchObj.timeStamp) {
                            watchObj.timeStamp = (new Date()).getTime();
                        }
                        if (watchObj.value) {
                            watchObj.value = newValue;
                        }
                    }                              
                },
                watchId = (new Date()).getTime() | 0;

            if (options && _options.minNotificationInterval && _options.maxNotificationInterval && 
                (_options.minNotificationInterval < 0 || _options.maxNotificationInterval < 0 || 
                 _options.minNotificationInterval >= _options.maxNotificationInterval)) {
                _asynchErrorCallback(errorCallback, new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                return undefined;
            }

            if (options && _options.maxNotificationInterval) {
                watchObj.intervalId = setInterval(function () {
                    successCallback(deviceSettings.retrieve(prop.aspect + "." + prop.property), prop);
                }, _options.maxNotificationInterval);
            }    

            if (options && _options.minNotificationInterval) {
                watchObj.timeStamp = (new Date()).getTime();
            }                    

            if (options && _options.minChangePercent) {
                if (_options.minNotificationInterval || _options.maxNotificationInterval) {}
                else {                
                    watchObj.value = deviceSettings.retrieve(prop.aspect + "." + prop.property);
                }
            }
           
            _watches[watchId] = watchObj;
            event.on(watchObj.eventType, watchObj.onEvent);

            return watchId;
        });             
    },

    clearPropertyChange: function (watchHandler) {
        var _handler = watchHandler | 0;
        
        if (_watches[_handler]) {
            event.deleteEventHandler(_watches[_handler].eventType, _watches[_handler].onEvent);            
            if (_watches[_handler].intervalId) {
                clearInterval(_watches[_handler].intervalId);
            }
            delete(_watches[_handler]); 
        }
        return null;
    },

    handleSubFeatures: function (subFeatures) {
        if (wac2_utils.isEmptyObject(subFeatures) ||
            subFeatures["http://wacapps.net/api/devicestatus"] || 
            (subFeatures["http://wacapps.net/api/devicestatus.deviceinfo"] &&
             subFeatures["http://wacapps.net/api/devicestatus.networkinfo"])) {
            return;
        }
        if (subFeatures["http://wacapps.net/api/devicestatus.deviceinfo"]) {
            _getNetworkInfoAspect = false;
            return;
        }
        if (subFeatures["http://wacapps.net/api/devicestatus.networkinfo"]) {
            _getDeviceInfoAspect = false;
            return;
        }
        _console.warn("WAC-2.0-Devicestatus-handleSubFeatures: something wrong");
    }
};

