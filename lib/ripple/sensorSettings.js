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
var _PERSISTENCE_KEY = "sensorsettings",
    db = require('ripple/db'),
    platform = require('ripple/platform'),
    _currentSensorSettings = {},
    _self;

function _default(key) {
    var keys = key.split("."),
        defaults = platform.current().sensor;

    if (keys.length === 1)
        return defaults[key];

    return keys.length === 2 &&
           defaults[keys[0]] &&
           defaults[keys[0]][keys[1]] &&
           defaults[keys[0]][keys[1]].control ?
           defaults[keys[0]][keys[1]].control.value : undefined;
}

_self = {
    initialize: function () {
        _currentSensorSettings = db.retrieveObject(_PERSISTENCE_KEY) || {};
    },
    register: function (key, obj) {
        _currentSensorSettings[key] = obj;
    },

    persist: function (key, obj) {
        if (key) {
            _currentSensorSettings[key] = obj;
        }

        db.saveObject(_PERSISTENCE_KEY, _currentSensorSettings);
    },

    retrieve: function (key) {
        return _currentSensorSettings.hasOwnProperty(key) ?
               _currentSensorSettings[key] : _default(key);
    },

    retrieveAsInt: function (key) {
        return parseInt(_self.retrieve(key), 10);
    },

    retrieveAsBoolean: function (key) {
        return !!_self.retrieve(key);
    }
};

module.exports = _self;
