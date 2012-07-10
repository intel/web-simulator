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
    sensors = require('ripple/platform/tizen/1.0/spec/sensor'),
    _sensors = ["Accelerometer", "MagneticField", "Rotation", "Orientation"],
    _permission = true,    
    _isWriteable = false, 
    _self;

function SensorError(code, msg) {
    this.__defineGetter__("message", function () {
        return msg;
    });
    this.__defineGetter__("code", function () {
        return code;
    });

    this.PERMISSION_DENIED = -100;
}

function SensorRequest() {
    var _self = {
        result: [],
        error: null,
        readyState: "processing"        
    };

    this.__defineGetter__("result", function () {
        return _self.result;
    });
    this.__defineSetter__("result", function (resultData) { 
        if (_isWriteable) {
            _self.result = utils.copy(resultData);
            _isWriteable = false;
            return;
        }
    });

    this.__defineGetter__("error", function () {
        return _self.error;
    });
    this.__defineSetter__("error", function (errorData) { 
        if (_isWriteable) {
            _self.error = utils.copy(errorData);
            _isWriteable = false;
            return;
        }
    });

    this.__defineGetter__("readyState", function () {
        return _self.readyState;
    });
    this.__defineSetter__("readyState", function (readyStateData) { 
        if (_isWriteable) {
            _self.readyState = readyStateData;
            _isWriteable = false;
            return;
        }
    });
}

_self = {  
    findSensors: function (type) {
        var sensorRequest = new SensorRequest(), index, sensorName = "";

        setTimeout(function () {
            if (_permission) {
                for (index = 0; index < _sensors.length; index++) {
                    sensorName = _sensors[index]; 
                    if (type === null || type === undefined || type === sensorName) {   
                        _isWriteable = true;                                     
                        sensorRequest.result.push(sensors[sensorName]);
                    }
                }

                _isWriteable = true;    
                sensorRequest.readyState = "done";

                if (sensorRequest.onsuccess) {
                    sensorRequest.onsuccess();
                }
            }
            else {
                // error event on the request with error code PERMISSION_DENIED must be fired.
                sensorRequest.error = new SensorError(-100, "permission denied!");
                if (sensorRequest.onerror) {
                    sensorRequest.onerror();
                }
            }
        }, 1);

        return sensorRequest;
    }
};

module.exports = _self;

