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
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    _systemSettings = null,
    DBSYSTEMSETTING_KEY = "tizen2-systemsetting",
    _security = {
        "http://tizen.org/privilege/setting": ["setProperty"]
    },
    _self;

function _initialize() {
    _systemSettings = db.retrieveObject(DBSYSTEMSETTING_KEY);
    if (!_systemSettings) {
        _systemSettings = {"HOME_SCREEN": "images/home_screen.jpg", "LOCK_SCREEN": "images/lock_screen.jpg", "INCOMING_CALL": "sounds/incoming.wav", "NOTIFICATION_EMAIL": "sounds/notification.wav"};
        db.saveObject(DBSYSTEMSETTING_KEY, _systemSettings);
        event.trigger("SystemSettingChanged");
    }
}

_self = function () {
    var systemSetting;

    function setProperty(type, value, successCallback, errorCallback) {
        if (!_security.setProperty) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.SystemSettingManager("setProperty", arguments);

        _systemSettings = db.retrieveObject(DBSYSTEMSETTING_KEY);
        _systemSettings[type] = value;
        db.saveObject(DBSYSTEMSETTING_KEY, _systemSettings);
        event.trigger("SystemSettingChanged");
        window.setTimeout(function () {
            successCallback();
        }, 1);
    }

    function getProperty(type, successCallback, errorCallback) {
        t.SystemSettingManager("getProperty", arguments);

        _systemSettings = db.retrieveObject(DBSYSTEMSETTING_KEY);
        window.setTimeout(function () {
            successCallback(_systemSettings[type]);
        }, 1);
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    systemSetting = {
        setProperty:       setProperty,
        getProperty:       getProperty,
        handleSubFeatures: handleSubFeatures
    };

    return systemSetting;
};

_initialize();

module.exports = _self;
