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

var event = require('ripple/event'),
    platform = require('ripple/platform'),
    INTERVAL = 60000,
    _self;

function _bind(name, win) {
    var callback = null;

    win.__defineGetter__(name, function () {
        return callback;
    });

    win.__defineSetter__(name, function (cb) {
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

_self = {
    init: function (win, doc) {
        var widgetWindow = win,
            _motion,
            _orientation,
            _calibration,
            add = widgetWindow.addEventListener,
            remove = widgetWindow.removeEventListener;

        //Hang events off window (these are used to check for API existence by developer)
        widgetWindow.DeviceMotionEvent = function DeviceMotionEvent() {};
        widgetWindow.DeviceOrientationEvent = function DeviceOrientationEvent() {};

        _motion = _bind("ondevicemotion", widgetWindow);
        _orientation = _bind("ondeviceorientation", widgetWindow);
        _calibration = _bind("oncompassneedscalibration", widgetWindow);

        widgetWindow.addEventListener = function (event, callback, useCapture) {
            switch (event) {
            case "deviceorientation":
                _orientation.set(callback);
                break;

            case "devicemotion":
                _motion.set(callback);
                break;

            case "compassneedscalibration":
                _calibration.set(callback);
                break;

            default:
                add.apply(widgetWindow, arguments);
                break;
            }
        };

        widgetWindow.removeEventListener = function (event, callback) {
            _motion.unbind(callback);
            _orientation.unbind(callback);
            remove.apply(widgetWindow, arguments);
        };

        event.on("DeviceMotionEvent", function (motion) {
            var _motionEvent, DeviceMotionEvent;

            if (platform.current().DeviceMotionEvent) {
                DeviceMotionEvent = platform.current().DeviceMotionEvent;
                if (typeof DeviceMotionEvent !== "function")
                    return;

                _motionEvent = new DeviceMotionEvent();
                _motionEvent.initAccelerometerEvent("devicemotion", true, false, motion.acceleration, motion.accelerationIncludingGravity, 
                                                    motion.rotationRate, INTERVAL);    
            }
            else {
                _motionEvent = {
                    acceleration: motion.acceleration,
                    accelerationIncludingGravity: motion.accelerationIncludingGravity,
                    rotationRate: motion.rotationRate
                };
            }

            _motion.exec(_motionEvent);
        });

        event.on("DeviceOrientationEvent", function (motion) {
            var _orientationEvent, DeviceOrientationEvent;

            if (platform.current().DeviceOrientationEvent) {
                DeviceOrientationEvent = platform.current().DeviceOrientationEvent;
                if (typeof DeviceOrientationEvent !== "function")
                    return;

                _orientationEvent = new DeviceOrientationEvent();        
                _orientationEvent.initDeviceOrientationEvent("deviceorientation", true, false, motion.orientation.alpha, 
                                                              motion.orientation.beta, motion.orientation.gamma, true);
            }
            else {
                _orientationEvent = motion.orientation;
            }

            _orientation.exec(_orientationEvent);
        });
    }
};

module.exports = _self;
