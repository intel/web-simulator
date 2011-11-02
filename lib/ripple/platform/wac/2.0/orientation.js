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
    Rotation = function (alpha, beta, gamma) {
        return {
            alpha: alpha || 0,
            beta:  beta  || 0,
            gamma: gamma || 0
        };
    },
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    DeviceApiError = require('ripple/platform/wac/2.0/deviceapierror'),
    _rotationInfo = new Rotation(),
    _defaultInterval = 100,
    _watches = {},
    _self;

module.exports = _self = {
    getCurrentOrientation: function (onSuccess, onError) {

        if (onSuccess) {
            utils.validateArgumentType(onSuccess, "function", null, "getCurrentOrientation invalid successCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (onError) {
            utils.validateArgumentType(onError, "function", null, "getCurrentOrientation invalid errorCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (onSuccess) {
            setTimeout(function () {
                onSuccess(utils.copy(_rotationInfo));
            }, 1);
            return null;
        } else {
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                }, 1);
            }
        }

        return undefined;
    },

    watchOrientation: function (orientationSuccess, orientationError, options) {

        if (orientationSuccess) {
            utils.validateArgumentType(orientationSuccess, "function", null, "watchOrientation invalid successCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (orientationError) {
            utils.validateArgumentType(orientationError, "function", null, "watchOrientation invalid errorCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (orientationSuccess) {
            var watchId = (new Date()).getTime() | 0,
                watchObj = {},
                opt = Object(options),
                minNotificationInterval = opt.minNotificationInterval | 0,
                orientationInterval = _defaultInterval;

            if (minNotificationInterval > 0) {
                orientationInterval = minNotificationInterval;
            }

            watchObj = {
                onSuccess: orientationSuccess,
                onError: orientationError,
                interval: orientationInterval
            };

            _watches[watchId] = watchObj;

            _watches[watchId].intervalId = setInterval(function () {
                _self.getCurrentOrientation(_watches[watchId].onSuccess, _watches[watchId].onError);
            }, _watches[watchId].interval);

            return watchId;
        } else {
            if (orientationError) {
                setTimeout(function () {
                    orientationError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                }, 1);
            }
        }

        return undefined;
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

event.on("AccelerometerInfoChangedEvent", function (orientationInfo) {
    _rotationInfo.alpha = orientationInfo.orientation.alpha;
    _rotationInfo.beta  = orientationInfo.orientation.beta;
    _rotationInfo.gamma = orientationInfo.orientation.gamma;
});

