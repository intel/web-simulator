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
        "http://tizen.org/privilege/calendar.read": ["getCalendars", "getDefaultCalendar", "getCalendar", "get", "find",
            "addChangeListener", "removeChangeListener", "expandRecurrence", "convertToString", "clone"],
        "http://tizen.org/privilege/calendar.write": ["add", "addBatch", "update", "updateBatch", "remove", "removeBatch"]
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
                _calendars[type][id] = new Calendar(type, calsStorage[id].name, calsStorage[id].items, id);
            }
        }
    }

    // public
    function getCalendars(type, successCallback, errorCallback) {
        if (!_security.getCalendars) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        function _getCalendars() {
            var i, result = [];

            if (!isValidType(type))
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);

            if (tizen1_utils.isEmptyObject(_calendars[type])) {
                loadCalendars(type);
            }

            if (_calendars.length !== 0) {
                for (i in _calendars[type]) {
                    result.push(_calendars[type][i]);
                }
                successCallback(result);
            } else if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "calendar:getCalendars", _getCalendars);
    }

    function getDefaultCalendar(type) {
        var id, calendar;

        if (!_security.getDefaultCalendar) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
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

        if (!_security.getCalendar) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
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
        var i, subFeature;

        for (subFeature in subFeatures) {
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

Calendar = function (type, name, storageItems, id) {
    var privateItems = {};
    id = id || Math.uuid(null, 16);

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
            if (!_security.expandRecurrence) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }

            calendarItem.startDate = startDate;
            calendarItem.endDate   = endDate;

            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.NOT_SUPPORTED_ERR));
            }
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
            calendarItem = new CalendarItem(type, i, new TZDate(new Date(storageItems[i].lastModificationDate)), _security);

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
        var uid;

        if (!_security.get) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!isValidCalendarItemId(id))
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        uid = (type === "EVENT") ? id.uid : id;

        return privateItems[uid];
    }

    function add(item) {
        var uid;

        if (!_security.add) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        // typecoerce
        uid = (type === "EVENT") ? item.id.uid : item.id;
        privateItems[uid] = utils.copy(item);

        saveCalendarItems();

        window.setTimeout(function () {
            for (var i in _watchers) {
                _watchers[i].onitemsadded([utils.copy(item)]);
            }
        }, 1);
    }

    function addBatch(items, successCallback, errorCallback) {
        if (!_security.addBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        // typecoerce items

        window.setTimeout(function () {
            var i, uid;

            for (i in items) {
                uid = (type === "EVENT") ? items[i].id.uid : items[i].id;
                privateItems[uid] = utils.copy(items[i]);
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
        var calendarItem, attr, uid;

        if (!_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        // typecoerce item, updateAllInstances

        uid = (type === "EVENT") ? item.id.uid : item.id;
        if (!isValidCalendarItemId(uid))
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        if (updateAllInstances === undefined || updateAllInstances === null) {
            updateAllInstances = true;
        }

        if ((type === "EVENT") && !updateAllInstances) {
            calendarItem = createCalendarItem();

            for (attr in privateItems[uid]) {
                if (attr !== "id" && attr !== "lastModificationDate") {
                    if (item[attr] !== undefined)
                        calendarItem[attr] = utils.copy(item[attr]);
                    else
                        calendarItem[attr] = utils.copy(privateItems[uid][attr]);
                }
            }

            add(calendarItem);
        } else {
            for (attr in privateItems[uid]) {
                if ((attr !== "id") && (attr !== "lastModificationDate") && (item[attr] !== undefined))
                    privateItems[uid][attr] = utils.copy(item[attr]);
            }
            window.setTimeout(function () {
                var i;

                for (i in _watchers) {
                    _watchers[i].onitemsupdated([utils.copy(privateItems[uid])]);
                }
            }, 1);
        }
        saveCalendarItems();
    }

    function updateBatch(items, successCallback, errorCallback, updateAllInstances) {
        if (!_security.updateBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        // typecoerce items updateAllInstances
        if (!tizen1_utils.isValidArray(items) ||
            (items.length === 0)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        window.setTimeout(function () {
            var i, j, attr, calendarItem, updatedItems = [], uid;

            for (i in items) {
                uid = (type === "EVENT") ? items[i].id.uid : items[i].id;
                if (!uid || !privateItems[uid]) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                    }
                    return;
                }
            }

            if (updateAllInstances) {
                for (i in privateItems) {
                    for (j in items) {
                        uid = (type === "EVENT") ? items[j].id.uid : items[j].id;
                        if (i === uid) {
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

                    uid = (type === "EVENT") ? items[i].id.uid : items[i].id;
                    for (attr in privateItems[uid]) {
                        if (attr !== "id" && attr !== "lastModificationDate") {
                            if (items[i][attr] !== undefined)
                                calendarItem[attr] = utils.copy(items[i][attr]);
                            else
                                calendarItem[attr] = utils.copy(privateItems[uid][attr]);
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
        var isFound = false, i, uid;

        if (!_security.remove) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        uid = (type === "EVENT") ? id.uid : id;
        for (i in privateItems) {
            if (i === uid) {
                delete privateItems[i];
                isFound = true;
                break;
            }
        }

        if (!isFound)
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        saveCalendarItems();

        window.setTimeout(function () {
            var i;

            for (i in _watchers) {
                _watchers[i].onitemsremoved([id]);
            }
        }, 1);
    }

    function removeBatch(ids, successCallback, errorCallback) {
        if (!_security.removeBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!tizen1_utils.isValidArray(ids) || (ids.length === 0)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        window.setTimeout(function () {
            var i, uid;

            for (i in ids) {
                uid = (type === "EVENT") ? ids[i].uid : ids[i];

                if (!privateItems[uid]) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                    }
                    return;
                }
            }

            for (i in ids) {
                uid = (type === "EVENT") ? ids[i].uid : ids[i];
                delete privateItems[uid];
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
        if (!_security.find) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        function _find() {
            var i, calendarItems = [], result = [];

            for (i in privateItems) {
                calendarItems.push(privateItems[i]);
            }
            if (calendarItems.length > 0) {
                result = tizen1_utils.query(calendarItems, filter, sortMode);
            }
            successCallback(result);
        }

        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "calendar:find", _find);
    }

    function addChangeListener(successCallback) {
        var watchId;

        if (!_security.addChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
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
        if (!_security.removeChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
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
    this.id   = calendar.id;
    this.name = calendar.name;
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
