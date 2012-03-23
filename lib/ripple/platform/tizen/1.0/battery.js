/*
 *  Copyright 2012 Intel Corporation
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
    _data = {
        charging: true,
        chargingTime: 0,
        level: 1.0,
        dischargingTime: Infinity,
        chargingchange: {},
        chargingtimechange: {},
        levelchange: {},
        dischargingtimechange: {}
    },
    _self;

_self = {
    addEventListener: function (event, callback, capture) {
        switch (event) {
        case "chargingchange":
        case "chargingtimechange":
        case "levelchange":
        case "dischargingtimechange":
            _data[event].set(callback);
            break;

        default:
            break;
        }
    },

    removeEventListener: function (event, callback, capture) {
        _data[event].unbind(callback);
    },

    dispatchEvent: function (event) {
        return _data[event].exec(event);
    }
};

_self.__defineGetter__("charging", function () {
    return _data.charging;
});

_self.__defineGetter__("chargingTime", function () {
    return _data.chargingTime;
});

_self.__defineGetter__("level", function () {
    return _data.level;
});

_self.__defineGetter__("dischargingTime", function () {
    return _data.dischargingTime;
});

function _initialize() {
    var callback = null;

    function bind(name) {
        _self.__defineGetter__(name, function () {
            return callback;
        });

        _self.__defineSetter__(name, function (cb) {
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
                return callback || callback(arg);
            },

            unbind: function (cb) {
                callback = (cb === callback) ? null : callback;
            }
        };
    }

    _data.chargingchange        = bind("onchargingchange");
    _data.chargingtimechange    = bind("onchargingtimechange");
    _data.levelchange           = bind("onlevelchange");
    _data.dischargingtimechange = bind("ondischargingtimechange");

    event.on("BatteryEvent", function (status) {
        for (var ev in status) {
            if ((status[ev] !== undefined && (status[ev] !== _data[ev])) {
                _data[ev] = status[ev];
                _data[ev].exec();
            }
        }
    });
}

_initialize();

module.exports = _self;
