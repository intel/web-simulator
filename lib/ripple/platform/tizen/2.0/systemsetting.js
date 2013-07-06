/*
 *  Copyright 2013 Intel Corporation.
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

var db = require('ripple/db'),
    event = require('ripple/event'),
    t = require('ripple/platform/tizen/2.0/typedef'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    _systemSettingTypes = ["HOME_SCREEN", "LOCK_SCREEN", "INCOMING_CALL", "NOTIFICATION_EMAIL"],
    _systemSettings = {},
    DBSYSTEMSETTING_KEY = "tizen2-systemsetting",
     _security = {
        "http://tizen.org/privilege/setting": ["setProperty"]
    },
    _self = {};

function _isTypeFound(type) {
    if (_systemSettingTypes.indexOf(type) !== -1) {
        return true;
    }
    return false;
}

function _initialize() {
    _systemSettings = db.retrieveObject(DBSYSTEMSETTING_KEY);
    if (!_systemSettings) {
        _systemSettings = {"HOME_SCREEN": "images/home_screen.jpg", "LOCK_SCREEN": "images/lock_screen.jpg", "INCOMING_CALL": "sounds/incoming.wav", "NOTIFICATION_EMAIL": "sounds/notification.wav"};
        db.saveObject(DBSYSTEMSETTING_KEY, _systemSettings);
        event.trigger("SystemSettingChanged");
    }
}

_self = function () {
    function setProperty(type, value, successCallback, errorCallback) {
        if (!_security.setProperty) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.DOMString)).match(type)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!_isTypeFound(type)) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (!(new TypeCoerce(t.DOMString)).match(value)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!(new TypeCoerce(t.SuccessCallback)).match(successCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!(new TypeCoerce(t.ErrorCallback)).match(errorCallback) && (arguments.length !== 3)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        _systemSettings = db.retrieveObject(DBSYSTEMSETTING_KEY);
        _systemSettings[type] = value;

        db.saveObject(DBSYSTEMSETTING_KEY, _systemSettings);
        event.trigger("SystemSettingChanged");
        successCallback();
    }
    function getProperty(type, successCallback, errorCallback) {
        if (arguments.length === 2) {
            errorCallback = null;
        }
        if (!(new TypeCoerce(t.DOMString)).match(type)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!_isTypeFound(type)) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }

        if (!(new TypeCoerce(t.SuccessCallback)).match(successCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!(new TypeCoerce(t.ErrorCallback)).match(errorCallback) && (arguments.length !== 2)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        _systemSettings = db.retrieveObject(DBSYSTEMSETTING_KEY);
        successCallback(_systemSettings[type]);
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    var systemsetting = {
        setProperty: setProperty,
        getProperty: getProperty,
        handleSubFeatures: handleSubFeatures
    };
    return systemsetting;
};

_initialize();

module.exports = _self;
