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
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    deviceapierror = require('ripple/platform/wac/2.0/deviceapierror'),
    _accelerometerInfo = new Acceleration(),
    defaultInterval = 100,
    _watches = {},
    _self;

module.exports = _self = {
    getCurrentAcceleration: function (onSuccess, onError) {

        utils.validateNumberOfArguments(1, 2, arguments.length, null, "getCurrentAcceleration invalid number of parameters", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));
        if (onSuccess) {
            utils.validateArgumentType(onSuccess, "function", null, "getCurrentAcceleration invalid successCallback parameter", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));
        };
        if (onError) {
            utils.validateArgumentType(onError, "function", null, "getCurrentAcceleration invalid errorCallback parameter", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));
        };

        if (onSuccess) {
            setTimeout(function () {
                onSuccess(utils.copy(_accelerometerInfo));
            }, 1);
            return null;
        } else {
            if (onError) {
                setTimeout(function () {
                    onError(new deviceapierror(errorcode.INVALID_VALUES_ERR));
                }, 1);
            }
        };

        return undefined;
    },

    watchAcceleration: function (accelerometerSuccess, accelerometerError, options) {

        utils.validateNumberOfArguments(2, 3, arguments.length, null, "watchAcceleration invalid number of parameters", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));
        if (accelerometerSuccess) {
            utils.validateArgumentType(accelerometerSuccess, "function", null, "watchAcceleration invalid successCallback parameter", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));
        };
        if (accelerometerError) {
            utils.validateArgumentType(accelerometerError, "function", null, "watchAcceleration invalid errorCallback parameter", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));
        };
        if (options) {
            utils.validateArgumentType(options, "object", null, "watchAcceleration invalid options parameter", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));
            utils.validateArgumentType(options.minNotificationInterval, "number", null, "watchAcceleration invalid options parameter", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));
        };

        if (accelerometerSuccess) {
            var watchId = (new Date()).getTime(),
                watchObj = {},
                accelerometerInterval = defaultInterval;

            if (options &&
                options.minNotificationInterval === Math.floor(options.minNotificationInterval) &&
                options.minNotificationInterval > 0) {
                accelerometerInterval = options.minNotificationInterval;
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
        } else {
            if (accelerometerError) {
                setTimeout(function () {
                    accelerometerError(new deviceapierror(errorcode.INVALID_VALUES_ERR));
                }, 1);
            }
        };

        return undefined;
    },

    clearWatch: function (watchId) {

        utils.validateNumberOfArguments(1, 1, arguments.length, null, "clearWatch invalid number of parameters", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));
        utils.validateArgumentType(watchId, "number", null, "clearWatch invalid watchId parameter", new deviceapierror(errorcode.TYPE_MISMATCH_ERR));

        if (_watches[watchId]) {
            clearInterval(_watches[watchId].intervalId);
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

