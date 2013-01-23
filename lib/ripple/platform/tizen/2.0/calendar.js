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

var utils = require('ripple/utils'),
    db = require('ripple/db'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    TZDate = require('ripple/platform/tizen/2.0/TZDate'),
    CalendarItem = require('ripple/platform/tizen/2.0/CalendarItem'),
    CalendarEvent = require('ripple/platform/tizen/2.0/CalendarEvent'),
    CalendarTask = require('ripple/platform/tizen/2.0/CalendarTask'),
    Calendar,
    CalendarStorage,
    CalendarItemsStorage,
    _DB_CALENDARS_KEY = "tizen1-db-calendars",
    _watchers = [],
    _calendars = {
        EVENT: {},
        TASK: {}
    },
    _calendarsStorage,
    _security = {
        "http://tizen.org/privilege/calendar.read": ["get", "find", "addChangeListener"],
        "http://tizen.org/privilege/calendar.write": ["add", "addBatch", "update", "updateBatch", "remove", "removeBatch"],
        all: true
    },
    _self;

function _isValidId(id) {
    return (/[a-z]|[A-Z]|[0-9]|[\-]/).test(id);
}

function retrieveCalendars() {
    _calendarsStorage = db.retrieveObject(_DB_CALENDARS_KEY) || {EVENT: {}, TASK: {}};
}

function saveCalendars() {
    db.saveObject(_DB_CALENDARS_KEY, _calendarsStorage);
}

_self = function () {
    var calendarManager;

    // private
    function isValidType(type) {
        for (var t in _calendars) {
            if (type === t)
                return true;
        }
        return false;
    }

    function loadCalendars(type) {
        var calsStorage, defCalendar, id, i, item;

        retrieveCalendars();
        calsStorage = _calendarsStorage[type];

        if (tizen1_utils.isEmptyObject(calsStorage)) {
            defCalendar = new Calendar(type, "DEF_CAL_" + type);

            _calendars[type][defCalendar.id] = defCalendar;
            calsStorage[defCalendar.id] = new CalendarStorage(defCalendar);
        } else {
            for (id in calsStorage) {
                for (i in calsStorage[id].items) {
                    item = calsStorage[id].items[i];
                }
                _calendars[type][id] = new Calendar(type, calsStorage[id].name, calsStorage[id].items, id, 0);
            }
        }
    }

    // public
    function getCalendars(type, successCallback, errorCallback) {
        function _getCalendars() {
            if (!isValidType(type))
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);

            if (tizen1_utils.isEmptyObject(_calendars[type])) {
                loadCalendars(type);
            }

            if (_calendars.length !== 0) {
                successCallback(utils.copy(_calendars[type]));
            } else if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "calendar:getCalendars", _getCalendars);
    }

    function getDefaultCalendar(type) {
        var id, calendar;

        if (!isValidType(type))
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);

        if (tizen1_utils.isEmptyObject(_calendars[type])) {
            loadCalendars(type);
        }

        for (id in _calendars[type]) {
            calendar = _calendars[type][id];
            break;
        }

        if (calendar === undefined)
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        return calendar;
    }

    function getCalendar(type, id) {
        var calendar;

        if (!isValidType(type) || !_isValidId(id))
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);

        if (tizen1_utils.isEmptyObject(_calendars[type])) {
            loadCalendars(type);
        }

        calendar = _calendars[type][id];
        if (calendar === undefined)
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        return calendar;
    }

    function handleSubFeatures(subFeatures) {
        var subFeature, i;

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

    calendarManager = {
        getCalendars:       getCalendars,
        getDefaultCalendar: getDefaultCalendar,
        getCalendar:        getCalendar,
        handleSubFeatures:  handleSubFeatures
    };

    return calendarManager;
};

Calendar = function (type, name, storageItems, id, accountServiceId) {
    var privateItems = {};
    id = id || Math.uuid(null, 16);
    accountServiceId = accountServiceId || 0;

    // private
    function createCalendarItem() {
        var calendarItem = null;

        switch (type) {
        case "EVENT":
            calendarItem = new CalendarEvent();
            break;

        case "TASK":
            calendarItem = new CalendarTask();
            break;

        default:
            break;
        }

        return calendarItem;
    }

    function isValidCalendarItemId(itemId) {
        var i;

        if (!_isValidId(itemId))
            return false;

        for (i in privateItems) {
            if (i === itemId)
                return true;
        }

        return false;
    }

    function loadCalendarItemInit(calendarItem, storageItem) {
        calendarItem.description    = utils.copy(storageItem.description);
        calendarItem.summary        = utils.copy(storageItem.summary);
        calendarItem.isAllDay       = utils.copy(storageItem.isAllDay);
        calendarItem.startDate      = new TZDate(new Date(storageItem.startDate));
        calendarItem.duration       = utils.copy(storageItem.duration);
        calendarItem.location       = utils.copy(storageItem.location);
        calendarItem.geolocation    = utils.copy(storageItem.geolocation);
        calendarItem.organizer      = utils.copy(storageItem.organizer);
        calendarItem.visibility     = utils.copy(storageItem.visibility);
        calendarItem.status         = utils.copy(storageItem.status);
        calendarItem.priority       = utils.copy(storageItem.priority);
        calendarItem.alarms         = utils.copy(storageItem.alarms);
        calendarItem.categories     = utils.copy(storageItem.categories);
        calendarItem.attendees      = utils.copy(storageItem.attendees);
    }

    function loadCalendarEventInit(calendarItem, storageItem) {
        loadCalendarItemInit(calendarItem, storageItem);

        calendarItem.endDate = new TZDate(new Date(storageItem.endDate));
        calendarItem.availability = utils.copy(storageItem.availability);
        calendarItem.recurrenceRule = utils.copy(storageItem.recurrenceRule);
        calendarItem.expandRecurrence = function (startDate, endDate, successCallback, errorCallback) {
            calendarItem.startDate = startDate;
            calendarItem.endDate   = endDate;
        };
        calendarItem.frequency       = utils.copy(storageItem.frequency);
        calendarItem.interval        = utils.copy(storageItem.interval);
        calendarItem.untilDate       = storageItem.untilDate ? new TZDate(new Date(storageItem.untilDate)):storageItem.untilDate;
        calendarItem.occurrenceCount = utils.copy(storageItem.occurrenceCount);
        calendarItem.daysOfTheWeek   = utils.copy(storageItem.daysOfTheWeek);
        calendarItem.setPositions    = utils.copy(storageItem.setPositions);
        calendarItem.exceptions      = utils.copy(storageItem.exceptions);
    }

    function loadCalendarTaskInit(calendarItem, storageItem) {
        loadCalendarItemInit(calendarItem, storageItem);

        calendarItem.endDate       = new TZDate(new Date(storageItem.endDate));
        calendarItem.completedDate = storageItem.completedDate ? new TZDate(new Date(storageItem.completedDate)):storageItem.completedDate;
        calendarItem.progress      = utils.copy(storageItem.progress);
    }

    function loadCalendarItems() {
        var i, calendarItem;

        if (storageItems === undefined)
            return;

        for (i in storageItems) {
            calendarItem = new CalendarItem(type, i, new TZDate(new Date(storageItems[i].lastModificationDate)));

            if (type === "EVENT") {
                loadCalendarEventInit(calendarItem, storageItems[i]);
            } else {
                loadCalendarTaskInit(calendarItem, storageItems[i]);
            }

            privateItems[i] = calendarItem;
        }
    }

    function saveCalendarItems() {
        _calendarsStorage[type][id].items = new CalendarItemsStorage(privateItems);
        saveCalendars();
    }

    // public
    function get(id) {
        if (!_security.all && !_security.get)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        if (!isValidCalendarItemId(id))
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        return privateItems[id];
    }

    function add(item) {
        if (!_security.all && !_security.add)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        // typecoerce
        privateItems[item.id] = utils.copy(item);

        saveCalendarItems();

        for (var i in _watchers) {
            _watchers[i].onitemsadded([utils.copy(item)]);
        }
    }

    function addBatch(items, successCallback, errorCallback) {
        if (!_security.all && !_security.addBatch)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        // typecoerce items

        window.setTimeout(function () {
            var i;

            for (i in items) {
                privateItems[items[i].id] = utils.copy(items[i]);
            }

            saveCalendarItems();

            if (successCallback) {
                successCallback(utils.copy(items));
            }
            for (i in _watchers) {
                _watchers[i].onitemsadded(utils.copy(items));
            }
        }, 1);
    }

    function update(item, updateAllInstances) {
        var calendarItem, i, attr;

        if (!_security.all && !_security.update)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        // typecoerce item, updateAllInstances

        if (!isValidCalendarItemId(item.id))
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        if (updateAllInstances === undefined || updateAllInstances === null) {
            updateAllInstances = true;
        }

        if ((type === "EVENT") && !updateAllInstances) {
            calendarItem = createCalendarItem();

            for (attr in privateItems[item.id]) {
                if (attr !== "id" && attr !== "lastModificationDate") {
                    if (item[attr] !== undefined)
                        calendarItem[attr] = utils.copy(item[attr]);
                    else
                        calendarItem[attr] = utils.copy(privateItems[item.id][attr]);
                }
            }

            add(calendarItem);
        } else {
            for (attr in privateItems[item.id]) {
                if ((attr !== "id") && (attr !== "lastModificationDate") && (item[attr] !== undefined))
                    privateItems[item.id][attr] = utils.copy(item[attr]);
            }
            for (i in _watchers) {
                _watchers[i].onitemsupdated([utils.copy(privateItems[item.id])]);
            }
        }
        saveCalendarItems();
    }

    function updateBatch(items, successCallback, errorCallback, updateAllInstances) {
        if (!_security.all && !_security.updateBatch)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        // typecoerce items updateAllInstances
        if (!tizen1_utils.isValidArray(items) ||
            (items.length === 0)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        window.setTimeout(function () {
            var i, j, attr, calendarItem, updatedItems = [];

            for (i in items) {
                if (!items[i].id || !privateItems[items[i].id]) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                    }
                    return;
                }
            }

            if (updateAllInstances) {
                for (i in privateItems) {
                    for (j in items) {
                        if (i === items[j].id) {
                            for (attr in privateItems[i]) {
                                if (attr !== "id" && attr !== "lastModificationDate" && items[j][attr] !== undefined)
                                    privateItems[i][attr] = utils.copy(items[j][attr]);
                            }
                            saveCalendarItems();
                            updatedItems.push(utils.copy(privateItems[i]));
                        }
                    }
                }
            } else {
                for (i in items) {
                    calendarItem = createCalendarItem();

                    for (attr in privateItems[items[i].id]) {
                        if (attr !== "id" && attr !== "lastModificationDate") {
                            if (items[i][attr] !== undefined)
                                calendarItem[attr] = utils.copy(items[i][attr]);
                            else
                                calendarItem[attr] = utils.copy(privateItems[items[i].id][attr]);
                        }
                    }

                    add(calendarItem);
                    updatedItems.push(utils.copy(calendarItem));
                }
            }

            saveCalendarItems();
            if (successCallback) {
                successCallback();
            }
            for (i in _watchers) {
                _watchers[i].onitemsupdated(utils.copy(updatedItems));
            }
        }, 1);
    }

    function remove(id) {
        var isFound = false, i, removedItem;

        if (!_security.all && !_security.remove)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        if (!_isValidId(id))
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);

        if (!isValidCalendarItemId(id))
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        for (i in privateItems) {
            if (i === id) {
                removedItem = utils.copy(privateItems[i]);
                delete privateItems[i];
                isFound = true;
                break;
            }
        }

        if (!isFound)
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        saveCalendarItems();
        for (i in _watchers) {
            _watchers[i].onitemsremoved(removedItem);
        }
    }

    function removeBatch(ids, successCallback, errorCallback) {
        var i;

        if (!_security.all && !_security.removeBatch)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!tizen1_utils.isValidArray(ids) || (ids.length === 0)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        for (i in ids) {
            if (typeof ids[i] !== "string" || !ids[i]) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
        }

        window.setTimeout(function () {
            var i;

            for (i in ids) {
                if (!privateItems[ids[i]]) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                    }
                    return;
                }
            }

            for (i in ids) {
                delete privateItems[ids[i]];
            }
            saveCalendarItems();
            if (successCallback) {
                successCallback();
            }

            for (i in _watchers) {
                _watchers[i].onitemsremoved(utils.copy(ids));
            }
        }, 1);
    }

    function find(successCallback, errorCallback, filter, sortMode) {
        if (!_security.all && !_security.find)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        function _find() {
            var i, calendarItems = [], result = [];

            for (i in privateItems) {
                calendarItems.push(privateItems[i]);
            }

            result = tizen1_utils.query(calendarItems, filter, sortMode);
            successCallback(result);
        }

        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "calendar:find", _find);
    }

    function addChangeListener(successCallback) {
        var watchId;

        if (!_security.all && !_security.addChangeListener)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        if ((typeof successCallback !== "object") ||
            (typeof successCallback.onitemsadded   !== "function") ||
            (typeof successCallback.onitemsupdated !== "function") ||
            (typeof successCallback.onitemsremoved !== "function"))
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);

        watchId = Math.uuid(null, 16);
        _watchers[watchId] = successCallback;

        return watchId;
    }

    function removeChangeListener(watchId) {
        if (!_isValidId(watchId))
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);

        if (!_watchers[watchId])
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        delete _watchers[watchId];
    }

    loadCalendarItems(type, privateItems, storageItems);

    this.__defineGetter__("id", function () {
        return id;
    });
    this.__defineGetter__("accountServiceId", function () {
        return accountServiceId;
    });
    this.__defineGetter__("name", function () {
        return name;
    });

    this.get                  = get;
    this.add                  = add;
    this.addBatch             = addBatch;
    this.update               = update;
    this.updateBatch          = updateBatch;
    this.remove               = remove;
    this.removeBatch          = removeBatch;
    this.find                 = find;
    this.addChangeListener    = addChangeListener;
    this.removeChangeListener = removeChangeListener;
};

CalendarStorage = function (calendar) {
    this.id               = calendar.id;
    this.accountServiceId = calendar.accountServiceId;
    this.name             = calendar.name;
};

CalendarItemsStorage = function (privateItems) {
    var itemsStorage = {}, i, attr;

    for (i in privateItems) {
        itemsStorage[i] = {};
        for (attr in privateItems[i]) {
            if ((attr === "startDate" || attr === "endDate" || attr === "untilDate" || attr === "completedDate" || attr === "lastModificationDate") &&
                (privateItems[i][attr])) {
                itemsStorage[i][attr] = privateItems[i][attr].toString();
            } else if (typeof privateItems[i] !== "function") {
                itemsStorage[i][attr] = privateItems[i][attr];
            }
        }
    }

    return itemsStorage;
};

module.exports = _self;
