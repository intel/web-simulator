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

var geo = require('ripple/geo'),
    Position = require('ripple/platform/w3c/1.0/Position'),
    PositionError = require('ripple/platform/w3c/1.0/PositionError'),
    _lastPosition = null,
    _watches = {},
    _defaultInterval = 100,
    _defaultDelay = 50,
    _self;

function _createPosition() {
    var position = new Position(),
        positionInfo = geo.getPositionInfo();

    position.coords.latitude = positionInfo.latitude;
    position.coords.longitude = positionInfo.longitude;
    position.coords.altitude = positionInfo.altitude;
    position.coords.altitudeAccuracy = positionInfo.altitudeAccuracy;
    position.coords.accuracy = positionInfo.accuracy;
    position.coords.heading = positionInfo.heading;
    position.coords.speed = positionInfo.speed;
    position.timestamp = positionInfo.timeStamp.getTime();

    return position;
}

function _isValid(onSuccess, onError, options, argLength) {
    if (argLength < 1 || argLength > 3)
        return false;

    if (typeof onSuccess !== "function")   // imply onSuccess == null
        return false;

    if (onError && (typeof onError !== "function"))
        return false;

    if ((options !== undefined) &&
        ((typeof options !== "object") ||
        (options.enableHighAccuracy !== undefined) && (typeof options.enableHighAccuracy !== "boolean") ||
        (options.timeout            !== undefined) && (typeof options.timeout            !== "number") ||
        (options.maximumAge         !== undefined) && (typeof options.maximumAge         !== "number")))
        return false;

    return true;
}

function _processOptions(options) {
    var validOptions = {
        enableHighAccuracy: false,
        timeout: 0,
        maximumAge: 0
    };

    if (options !== undefined &&
        options.maximumAge !== undefined &&
        options.maximumAge === Math.floor(options.maximumAge) &&
        options.maximumAge >= 0) {
        validOptions.maximumAge = options.maximumAge | 0;
    } else {
        validOptions.maximumAge = 0;
    }

    if (options !== undefined &&
        options.timeout !== undefined &&
        options.timeout === Math.floor(options.timeout)) {
        validOptions.timeout = (options.timeout >= 0) ? (options.timeout | 0) : 0;
    } else {
        validOptions.timeout = Infinity;
    }

    if (options !== undefined && options.enableHighAccuracy !== undefined) {
        validOptions.enableHighAccuracy = options.enableHighAccuracy;
    } else {
        validOptions.enableHighAccuracy = false;
    }

    validOptions.delay = geo.delay * 1000 || _defaultDelay;

    return validOptions;
}

function _errorOccur(code, onError) {
    if (!onError)
        return;

    var error = new PositionError();

    error.code = code;
    switch (code) {
    case PositionError.POSITION_UNAVAILABLE:
        error.message = "Position unavailable";
        break;

    case PositionError.TIMEOUT:
        error.message = "Position timed out";
        break;
    }

    onError(error);
}

function _execute(data) {
    return function () {
        if (_lastPosition !== null &&
            ((new Date()).getTime() - _lastPosition.timestamp <= data.maximumAge)) {
            window.setTimeout(function () {
                data.onSuccess(_lastPosition);
            }, 1);
        } else if (data.timeout === 0) {
            _errorOccur(PositionError.TIMEOUT, data.onError);
        } else {
            window.setTimeout(function () {
                if (data.delay <= data.timeout) {
                    _lastPosition = _createPosition();

                    if (_lastPosition !== null) {
                        data.onSuccess(_lastPosition);
                    } else {
                        _errorOccur(PositionError.POSITION_UNAVAILABLE, data.onError);
                    }
                } else {
                    _errorOccur(PositionError.TIMEOUT, data.onError);
                }
            }, Math.min(data.delay, data.timeout));
        }
    };
}

function _interval(k, n) { 
    return k * Math.floor((n + k - 1) / k) || k;
}

_self = {
    getCurrentPosition: function (onSuccess, onError, options) {
        if (!_isValid(onSuccess, onError, options, arguments.length))
            return;

        var validData = _processOptions(options);

        validData.onSuccess = onSuccess;
        validData.onError   = onError;

        _execute(validData)();
    },

    watchPosition: function (geolocationSuccess, geolocationError, geolocationOptions) {
        if (!_isValid(geolocationSuccess, geolocationError, geolocationOptions, arguments.length))
            return undefined;

        var validData = _processOptions(geolocationOptions),
            watchId = (new Date()).getTime() | 0,
            watchObj = {
                onSuccess:          geolocationSuccess,
                onError:            geolocationError,
                enableHighAccuracy: validData.enableHighAccuracy,
                timeout:            validData.timeout,
                maximumAge:         validData.maximumAge,
                delay:              validData.delay,
                interval:           _interval(validData.maximumAge || _defaultInterval,
                                        Math.min(validData.delay, validData.timeout)),
            };

        _watches[watchId] = watchObj;

        _watches[watchId].intervalId = window.setInterval(_execute(_watches[watchId]),
            _watches[watchId].interval);

        return watchId;
    },

    clearWatch: function (watchId) {
        if (arguments.length !== 1)
            return undefined;

        var id = watchId | 0;

        if (_watches[id]) {
            window.clearInterval(_watches[id].intervalId);
            delete _watches[id];

            return null;
        }

        return undefined;
    }
};

module.exports = _self;
