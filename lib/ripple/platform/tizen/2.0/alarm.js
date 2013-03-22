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

var db = require('ripple/db'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    event = require('ripple/event'),
    utils = require('ripple/utils'),
    t = require('ripple/platform/tizen/2.0/typedef'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    Alarm = require('ripple/platform/tizen/2.0/AlarmBase'),
    AlarmRelative = require('ripple/platform/tizen/2.0/AlarmRelative'),
    AlarmAbsolute = require('ripple/platform/tizen/2.0/AlarmAbsolute'),
    AlarmStore,
    _DB_ALARMS_KEY = "tizen1.0-db-alarms",
    PERIOD_MINUTE = 60,
    PERIOD_HOUR   = 60 * PERIOD_MINUTE,
    PERIOD_DAY    = 24 * PERIOD_HOUR,
    PERIOD_WEEK   = 7 * PERIOD_DAY,
    _alarms = {}, _alarmStack = [],
    _security = {
        "http://tizen.org/privilege/alarm": ["add", "remove", "removeAll"],
        all: true
    },
    _isInitialized = false, _self;

function _initialize() {
    _alarms = db.retrieveObject(_DB_ALARMS_KEY);
    utils.forEach(_alarms, function (alarmStore) {
        _alarmStack.push(alarmStore);
    });
    _isInitialized = true;
}

function _get() {
    if (!_isInitialized) {
        _initialize();
    }
}

function _save() {
    db.saveObject(_DB_ALARMS_KEY, _alarmStack);
}

function _updateDB(alarmStore) {
    _alarmStack.push(alarmStore);
    _save();
}

function _getCurrentAppId() {
    return db.retrieve("current-url");
}

function _checkTriggerAlarm(alarm) {
    var remainingTime, nextTriggerDate;

    if (alarm.delay !== undefined) { // Alarm is relative
        if (alarm.period !== null)
            return false;

        remainingTime = alarm.getRemainingSeconds();
        if (remainingTime === null)
            return true; // This alarm is triggered, remove it
    } else if (alarm.period !== undefined) { // Alarm is absolute,no repeat
        nextTriggerDate = alarm.getNextScheduledDate();
        if (nextTriggerDate === null)
            return true; // Already triggered
    }

    return false; // Alarm is repeat, not expired
}

function _convertToAlarm(alarmStore) {
    var alarm, frequency;

    if (alarmStore.delay !== null) { // AlarmRelative
        alarm = new AlarmRelative(alarmStore.delay, alarmStore.period);
        alarm.date = alarmStore.date;
    } else { // AlarmAbsolute
        if (alarmStore.period !== null && alarmStore.period !== PERIOD_WEEK) {
            frequency = alarmStore.period;
        } else if (alarmStore.period === PERIOD_WEEK) {
            frequency = alarmStore.daysOfTheWeek;
        }
        alarm = new AlarmAbsolute(alarmStore.date, frequency);
    }
    alarm.id = alarmStore.id;

    return alarm;
}

function _eventCheckAlarm(id) {
    var alarm, diff;

    _get();
    utils.forEach(_alarmStack, function (alarmStore) {
        if (alarmStore.id !== id)
            return;

        alarm = _convertToAlarm(alarmStore);
        if (alarm.delay !== undefined) {
            diff = alarm.getRemainingSeconds();
            if (0 < diff && diff < 2) {
                event.trigger("SendTriggerAppId", [alarmStore.applicationId]);
            }
        } else {
            diff = (new Date()) - alarm.getNextScheduledDate();
            if (-2000 < diff && diff < 2000) {
                event.trigger("SendTriggerAppId", [alarmStore.applicationId]);
            }
        }
    });
}


_self = function () {
    var currentAppId, alarm;

    alarm = {
        add: function (alarm, applicationId, appControl) {
            var alarmStore;

            if (!_security.all && !_security.add) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (!(new TypeCoerce(t.Alarm)).match(alarm) ||
                !(new TypeCoerce(t.ApplicationId)).match(applicationId) ||
                (appControl && !(new TypeCoerce(t.ApplicationControl)).match(appControl))) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            currentAppId = _getCurrentAppId(); // Update The Current URL.
            alarmStore = new AlarmStore(alarm, applicationId, currentAppId, appControl);
            _updateDB(alarmStore);
        },

        remove: function (id) {
            var isFound = false, i;

            if (!_security.all && !_security.remove) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (!(new TypeCoerce(t.AlarmId)).match(id)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            for (i in _alarmStack) {
                if (_alarmStack[i].id !== id)
                    continue;

                _alarmStack.splice(i, 1);
                _save();
                isFound = true;
            }
            if (!isFound)
                throw (new WebAPIException(errorcode.NOT_FOUND_ERR));
        },

        removeAll: function () {
            var availableStack = [], i;

            if (!_security.all && !_security.removeAll)
                throw (new WebAPIException(errorcode.SECURITY_ERR));

            for (i in _alarmStack) {
                if (_alarmStack[i].currentAppId === currentAppId)
                    continue;

                availableStack.push(_alarmStack[i]);
            }
            _alarmStack = availableStack;
            _save();
        },

        get: function (id) {
            var isFound = false, item, isExpired, alarm;

            if (!(new TypeCoerce(t.AlarmId)).match(id)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            for (item in _alarmStack) {
                if (_alarmStack[item].id === id) {
                    alarm = _convertToAlarm(_alarmStack[item]);
                    isExpired = _checkTriggerAlarm(alarm);
                    if (isExpired) {
                        _alarmStack.splice(item, 1);
                        _save();
                    } else {
                        isFound = true;
                    }
                    break;
                }
            }
            if (!isFound)
                throw (new WebAPIException(errorcode.NOT_FOUND_ERR));

            return alarm;
        },

        getAll: function () {
            var availableStack = [], backAlarms = [], isExpired, alarm, i;

            for (i in _alarmStack) {
                alarm = _convertToAlarm(_alarmStack[i]); // alarmStore --> alarm
                isExpired = _checkTriggerAlarm(alarm); // Check if the alarm is expired
                if (isExpired)
                    continue;

                availableStack.push(_alarmStack[i]);
                if (_alarmStack[i].currentAppId === currentAppId)
                    backAlarms.push(alarm);
            }
            _alarmStack = availableStack;
            _save();
            return backAlarms;
        },

        handleSubFeatures: function (subFeatures) {
            var i, subFeature;

            for (subFeature in subFeatures) {
                if (_security[subFeature].length === 0) {
                    _security.all = true;
                    return;
                }
                _security.all = false;
                for (i in _security[subFeature]) {
                    _security[_security[subFeature][i]] = true;
                }
            }
        }
    };

    currentAppId = _getCurrentAppId();
    _get();

    alarm.__defineGetter__("PERIOD_MINUTE", function () {
        return PERIOD_MINUTE;
    });

    alarm.__defineGetter__("PERIOD_HOUR", function () {
        return PERIOD_HOUR;
    });

    alarm.__defineGetter__("PERIOD_DAY", function () {
        return PERIOD_DAY;
    });

    alarm.__defineGetter__("PERIOD_WEEK", function () {
        return PERIOD_WEEK;
    });

    return alarm;
};

AlarmStore = function (alarmObject, applicationId, currentAppId, appControl) {
    var _self;
    _self = {
        id: alarmObject.id,
        delay: alarmObject.delay || null,
        date: alarmObject.date || null,
        period: alarmObject.period || null,
        daysOfTheWeek: alarmObject.daysOfTheWeek || null,
        applicationId: applicationId,
        currentAppId: currentAppId,
        appControl: appControl || null
    };
    return _self;
};

event.on("CheckAlarm", function (id) {
    _eventCheckAlarm(id);
});

module.exports = _self;
