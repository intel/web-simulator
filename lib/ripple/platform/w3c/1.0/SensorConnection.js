/*
 *  Copyright 2012 Intel Corporation.
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
    platform = require('ripple/platform'),    
    event = require('ripple/event'), 
    sensorSettings = require('ripple/sensorSettings'), 
    exception = require('ripple/exception'),

    _permission = true,
    _self;

function ErrorMsg() {
    this.__defineGetter__("UNKNOWN_ERROR", function () {
        return "An unknown error has occurred.";
    });

    this.__defineGetter__("TYPE_MISMATCH_ERROR", function () {
        return "The object type is incompatible with the expected type.";
    });

    this.__defineGetter__("INVALID_VALUES_ERROR", function () {
        return "The content of an object does not contain valid values.";
    });

    this.__defineGetter__("ILLEGAL_STATE", function () {
        return "The status of connection is illegal.";
    });
}

// TODO: Should be replaced by a global object in tizen 1.0
function ErrorCode() {
    this.__defineGetter__("UNKNOWN_ERR", function () {
        return 0;
    });

    this.__defineGetter__("INVALID_VALUES_ERROR", function () {
        return 1;
    });

    this.__defineGetter__("TYPE_MISMATCH_ERROR", function () {
        return 2;
    });    

    this.__defineGetter__("ILLEGAL_STATE", function () {
        return 3;
    });
}

function SensorError(code, msg) {
    this.__defineGetter__("message", function () {
        return msg;
    });
    this.__defineGetter__("code", function () {
        return code;
    });

    this.PERMISSION_DENIED = -100;
}

function Event() {
    var _self = {
        CAPTURING_PHASE: 1,
        AT_TARGET:  2,
        BUBBLING_PHASE: 3,

        type: '',
        target: null, //new EventTarget(),
        currentTarget: null, //new EventTarget(),
        eventPhase: 0,
        bubbles: false,
        cancelable: false,
        timeStamp: 0
    };
        
    this.__defineGetter__("type", function () {
        return _self.type;
    });

    this.__defineGetter__("target", function () {
        return _self.target;
    });

    this.__defineGetter__("currentTarget", function () {
        return _self.currentTarget;
    });

    this.__defineGetter__("eventPhase", function () {
        return _self.eventPhase;
    });    

    this.__defineGetter__("bubbles", function () {
        return _self.bubbles;
    });

    this.__defineGetter__("cancelable", function () {
        return _self.cancelable;
    });
    
    this.__defineGetter__("timeStamp", function () {
        return _self.timeStamp;
    });

    this.stopPropagation = function () {};

    this.preventDefault = function () {};

    this.initEvent = function (eventTypeArg, canBubbleArg, cancelableArg) {
        _self.type = eventTypeArg;
        _self.bubbles = canBubbleArg;
        _self.cancelable = cancelableArg;            
    };

    return _self;
}

function SensorDataEvent() {
    var _self = {
        data: 0,
        accuracy: 0,
        timestamp: 0,
        reason: ''
    };

    // This type of event inherit from Event
    Event.call(this); 

    this.__defineGetter__("data", function () {
        return _self.data;
    });

    this.__defineGetter__("accuracy", function () {
        return _self.accuracy;
    });

    this.__defineGetter__("timestamp", function () {
        return _self.timestamp;
    });

    this.__defineGetter__("reason", function () {
        return _self.reason;
    });

    this.initSensorDataEvent = function (type, bubbles, cancelable, reason, timestamp, accuracy, data) {
        this.initEvent(type, bubbles, cancelable);

        _self.reason = reason;
        _self.timestamp = timestamp;
        _self.accuracy = accuracy;
        
        // If the data has only one part, just return the value, not the data object    
        if (utils.count(data) === 1) {
            utils.forEach(data, function (section, key) {
                _self.data = data[key];
            });
        }
        else {
            _self.data = utils.copy(data);
        }
    };
}

// As only one sensor will be used during the simulation with a SensorConnection object,
// we can get that sensor object first and then the following read or write operations will be simplified
function _getSensorObj(type, name) {
    var settings = platform.current().sensor, _sensor;

    utils.forEach(settings, function (settingSection, settingType) {
        if (settingSection.type === type) {

            if (settingSection.name && settingSection.name !== name) {
                return;
            }

            _sensor = utils.copy(settingSection);
        }
    });

    return _sensor;
}

// The parameter of event callback is an object that contains the latest value, not the value itself,
// so we need a function to create such object.
function _getSensorData(sensorType, sensor, onerror) {
    var data = {}, value;

    utils.forEach(sensor, function (sensorSection, key) {
        try {
            value = sensorSettings.retrieve(sensorType + "." + key);
        }
        catch (e) {
            if (onerror) {
                onerror(e);
            }
        }
        
        if (value) {
            data[key] = value;
        }                    
    });
    
    return data;
}

// As the event type in sensor.js file are named in this way, so we can get it with this function.
function _getSensorEventTypes(type, sensor) {
    var types = [];

    utils.forEach(sensor, function (sensorSection, sensorType) {
        if (typeof sensorSection === "object") {
            types.push(type + "-" + sensorType + "Changed");
        }
    });

    return types;
}

function _onEventCallback(type, options, currentSensor, length, eventCallback, onerror) {
    return function (values) {
        var sensorEvent = new SensorDataEvent();

        // Only the sensor that has one attribute could be compared with the threshold
        if (options && options.threshold && length === 1 && values[0] < options.threshold) {
            return;
        }

        if (eventCallback) {
            sensorEvent.initSensorDataEvent(type, false, false, "read", (new Date()).getTime(), 
                                            currentSensor.resolution, _getSensorData(type, currentSensor, onerror));

            eventCallback(sensorEvent);
        }
    };
}

function _bind(name, obj) {
    var callback = null;

    obj.__defineGetter__(name, function () {
        return callback;
    });

    obj.__defineSetter__(name, function (cb) {
        callback = cb;
    });

    return {
        get: function () {
            return callback;
        },
        set: function (value) {
            callback = value;
        },
        exec: function (arg) {
            return callback && callback(arg);
        },
        unbind: function (cb) {
            callback = cb === callback ? null : callback;
        }
    };
}

function SensorConnection(type, name) {
    var _self,
        currentSensor = _getSensorObj(type, name),
        sensorEvent = new SensorDataEvent(),
        sensorEventTypes = _getSensorEventTypes(type, currentSensor),
        watches = [],
        _errorCode = new ErrorCode(),
        _errorMsg = new ErrorMsg(),
        sensorListener;

    if (currentSensor) {
        _self = {
            sensor: {
                resolution: currentSensor.resolution,
                minDelay: currentSensor.minDelay,
                range: currentSensor.range,
                name: currentSensor.name,
                type: currentSensor.type
            },
            status: "open",
            error: null,
            read: function () {

                if (_self.status !== "open" && _self.status !== "watching") {
                    exception.raise(exception.types.Argument, "illegal state", new SensorError(_errorCode.ILLEGAL_STATE, _errorMsg.ILLEGAL_STATE));
                    return;
                }                

                setTimeout(function () {
                    if (sensorListener.get()) {
                        sensorEvent.initSensorDataEvent(type, false, false, "read", (new Date()).getTime(), 
                                                        currentSensor.resolution, _getSensorData(type, currentSensor, _self.onerror));

                        sensorListener.exec(sensorEvent);
                    }
                }, 1);  

                return;
            },

            startWatch: function (options) {
                var index, watchId, watchObj = {};

                if (_self.status !== "open") {
                    exception.raise(exception.types.Argument, "illegal state", new SensorError(_errorCode.ILLEGAL_STATE, _errorMsg.ILLEGAL_STATE));
                    return;
                }
                    
                if (typeof options !== "object") {
                    if (_self.onerror) {
                        _self.onerror(new SensorError(_errorCode.TYPE_MISMATCH_ERROR, _errorMsg.TYPE_MISMATCH_ERROR)); 
                    }
                }

                setTimeout(function () {
                    watchId = (new Date()).getTime();   

                    // As there will be many attributes for some sensor, each of them is needed to be watched.
                    for (index = 0; index < sensorEventTypes.length; index++) {
                        watchObj = {
                            eventType: sensorEventTypes[index],
                            onEvent: _onEventCallback(type, options, currentSensor, sensorEventTypes.length, sensorListener.get(), _self.onerror),
                        };

                        watches.push(watchObj);
                        if (watchObj.eventType) {
                            event.on(watchObj.eventType, watchObj.onEvent);                                               
                        }
                    }

                    
                    if (options && options.interval) {
                        watchObj.intervalId = setInterval(_onEventCallback(type, options, currentSensor, sensorEventTypes.length, sensorListener.get(), _self.onerror), 
                                                          options.interval);
                    }

                    _self.status = "watching";
                    if (_self.onstatuschange) {
                        _self.onstatuschange();
                    }
                                                                                                        
                }, 1);  

                return;
            },

            endWatch: function () {
                var index, watchObj;

                if (_self.status !== "watching") {
                    exception.raise(exception.types.Argument, "illegal state", new SensorError(_errorCode.ILLEGAL_STATE, _errorMsg.ILLEGAL_STATE));
                    return;
                }

                for (index = 0; index < watches.length; index++) {
                    watchObj = watches[index];

                    try {
                        event.deleteEventHandler(watchObj.eventType, watchObj.onEvent);  
                    }
                    catch (e) {
                        if (_self.onerror) {
                            _self.onerror(e);
                        }
                    }

                    if (watchObj.intervalId) {
                        clearInterval(watchObj.intervalId);
                    }                
                }

                watches = [];

                _self.status = "open";
                if (_self.onstatuschange) {
                    _self.onstatuschange();
                }
            },

            // These functions are inherited from the EventTarget object
            addEventListener: function (eventType, callback, useCapture) {
                var sensorEvent;
                
                if (eventType === "sensordata") {
                    sensorListener.set(callback);  

                    event.on("sensordata", function (data) {
                        sensorEvent = new SensorDataEvent();        
                        sensorEvent.initSensorDataEvent("sensordata", false, false, "read", (new Date()).getTime(), 
                                                        currentSensor.resolution, _getSensorData(type, currentSensor, _self.onerror));           

                        sensorListener.exec(sensorEvent);
                    });             
                }               
            },

            removeEventListener: function (eventType, callback) {
                event.clear(eventType, callback);
                sensorListener.unbind(callback);                                
            },

            dispatchEvent: function (evt) {
                event.trigger("sensordata", evt);
            }
        };

        sensorListener = _bind("onsensordata", _self);
    }    

    return _self;
}

module.exports = function (option) {
 
    var connectionObj,
        _errorCode = new ErrorCode(),
        _errorMsg = new ErrorMsg();

    if (option === null || option === undefined) {
        return null;
    }

    // There are two ways to construct an object
    if (typeof option === "object") {
        if ((option.type === null || option.type === undefined) &&
            (option.name === null || option.name === undefined)) {
            // Spec: If none of the dictionary members are defined then raise an instantiation exception    
            exception.raise(exception.types.Argument, "type illegal", new SensorError(_errorCode.ILLEGAL_TYPE, _errorMsg.ILLEGAL_TYPE));             
        }

        connectionObj = new SensorConnection(option.type, option.name);
    }
    else if (typeof option === "string") {
        connectionObj = new SensorConnection(option, option);
    }

    return connectionObj;
};

