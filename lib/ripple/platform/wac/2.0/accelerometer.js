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
    event = require('ripple/event'),
    Acceleration = function (x, y, z) {
        return {
            xAxis: x || 0,
            yAxis: y || 0,
            zAxis: z || 0
        };
    },
    validate = require('ripple/platform/wac/2.0/validate'),
    _accelerometerInfo = new Acceleration(),
    _defaultInterval = 100,
    _watches = {},
    _self;

module.exports = _self = {
    getCurrentAcceleration: function (onSuccess, onError) {
        function _getCurrentAcceleration() {
            setTimeout(function () {
                onSuccess(utils.copy(_accelerometerInfo));
            }, 1);
            return null;
        }

        return validate.validateTypeMismatch(onSuccess, onError, "getCurrentAcceleration", _getCurrentAcceleration); 
    },

    watchAcceleration: function (accelerometerSuccess, accelerometerError, options) {
        function _watchAcceleration() {
            var watchId = (new Date()).getTime() | 0,
                watchObj = {},
                opt = Object(options),
                minNotificationInterval = opt.minNotificationInterval | 0,
                accelerometerInterval = _defaultInterval;

            if (minNotificationInterval > 0) {
                accelerometerInterval = minNotificationInterval;
            }

            watchObj = {
                onSuccess: accelerometerSuccess,
                onError: accelerometerError,
                interval: accelerometerInterval
            };

            _watches[watchId] = watchObj;

            _watches[watchId].intervalId = setInterval(function () {
                _self.getCurrentAcceleration(_watches[watchId].onSuccess, _watches[watchId].onError);
            }, _watches[watchId].interval);

            return watchId;
        }

        return validate.validateTypeMismatch(accelerometerSuccess, accelerometerError, "watchAcceleration", _watchAcceleration); 
    },

    clearWatch: function (watchId) {

        var id = watchId | 0;

        if (_watches[id]) {
            clearInterval(_watches[id].intervalId);
            delete(_watches[id]);
            return null;
        }

        return undefined;
    }
};

event.on("AccelerometerInfoChangedEvent", function (accelerometerInfo) {
    _accelerometerInfo.xAxis = accelerometerInfo.accelerationIncludingGravity.x;
    _accelerometerInfo.yAxis = accelerometerInfo.accelerationIncludingGravity.y;
    _accelerometerInfo.zAxis = accelerometerInfo.accelerationIncludingGravity.z;
});

