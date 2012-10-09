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
    TZDate = require('ripple/platform/tizen/2.0/TZDate'),
    CalendarItem = require('ripple/platform/tizen/2.0/CalendarItem'),
    CalendarEvent = require('ripple/platform/tizen/2.0/CalendarEvent'),
    CalendarTask = require('ripple/platform/tizen/2.0/CalendarTask'),
    CalendarRecurrenceRule = require('ripple/platform/tizen/2.0/CalendarRecurrenceRule'),
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
        "http://tizen.org/api/calendar": [],
        "http://tizen.org/api/calendar.read": ["find", "addChangeListener"],
        "http://tizen.org/api/calendar.write": ["add", "addBatch", "update", "updateBatch", "remove", "removeBatch"],
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
    function getCalendar(type, id) {
        var calendar;

        if (!isValidType(type) || !_isValidId(id))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        loadCalendars(type);

        calendar = _calendars[type][id];
        if (calendar === undefined)
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        return calendar;
    }

    function getCalendars(type, successCallback, errorCallback) {
        function _getCalendars() {
            if (!isValidType(type))
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

            loadCalendars(type);

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
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        loadCalendars(type);

        for (id in _calendars[type]) {
            calendar = _calendars[type][id];
            break;
        }

        if (calendar === undefined)
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        return calendar;
    }

    function handleSubFeatures(subFeatures) {
        for (var subFeature in subFeatures) {
            if (_security[subFeature].length === 0) {
                _security.all = true;
                return;
            }
            _security.all = false;
            utils.forEach(_security[subFeature], function (method) {
                _security[method] = true;
            });
        }
    }

    calendarManager = {
        getCalendar:        getCalendar,
        getCalendars:       getCalendars,
        getDefaultCalendar: getDefaultCalendar,
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
        calendarItem.untilDate       = storageItem.untilDate?new TZDate(new Date(storageItem.untilDate)):storageItem.untilDate;
        calendarItem.occurrenceCount = utils.copy(storageItem.occurrenceCount);
        calendarItem.daysOfTheWeek   = utils.copy(storageItem.daysOfTheWeek);
        calendarItem.setPositions    = utils.copy(storageItem.setPositions);
        calendarItem.exceptions      = utils.copy(storageItem.exceptions);
    }

    function loadCalendarTaskInit(calendarItem, storageItem) {
        loadCalendarItemInit(calendarItem, storageItem);

        calendarItem.endDate       = new TZDate(new Date(storageItem.endDate));
        calendarItem.completedDate = storageItem.completedDate?new TZDate(new Date(storageItem.completedDate)):storageItem.completedDate;
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
        if (!isValidCalendarItemId(id))
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        return privateItems[id];
    }

    function add(item) {
        if (!_security.all && !_security.add)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        // typecoerce
        privateItems[item.id] = utils.copy(item);

        saveCalendarItems();

        for (var i in _watchers) {
            _watchers[i].onitemsadded([utils.copy(item)]);
        }
    }

    function addBatch(items, successCallback, errorCallback) {
        if (!_security.all && !_security.addBatch)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        function _addBatch() {
            var i;

            // typecoerce items

            for (i in items) {
                privateItems[items[i].id] = utils.copy(items[i]);
            }

            saveCalendarItems();

            for (i in _watchers) {
                _watchers[i].onitemsadded(utils.copy(items));
            }

            successCallback(utils.copy(items));
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "calendar:addBatch", _addBatch);
    }

    function update(item, updateAllInstances) {
        var calendarItem, i, j, attr;

        if (!_security.all && !_security.update)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        // typecoerce item, updateAllInstances

        if (!isValidCalendarItemId(item.id))
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        if (updateAllInstances) {
            for (attr in privateItems[item.id]) {
                if ((attr !== "id") && (attr !== "lastModificationDate") && (item[attr] !== undefined))
                    privateItems[item.id][attr] = utils.copy(item[attr]);
            }
            for (i in _watchers) {
                _watchers[i].onitemsupdated([utils.copy(privateItems[item.id])]);
            }
        } else {
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
            for (j in _watchers) {
                _watchers[j].onitemsupdated([utils.copy(calendarItem)]);
            }
        }
        saveCalendarItems();
    }

    function updateBatch(items, successCallback, errorCallback, updateAllInstances) {
        var calendarItems = [], updatedItems = [];

        if (!_security.all && !_security.updateBatch)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        function _updateBatch() {
            var i, j, attr, calendarItem;

            // typecoerce items updateAllInstances

            for (i in items) {
                if (!isValidCalendarItemId(items[i].id))
                    throw new WebAPIError(errorcode.NOT_FOUND_ERR);
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
            for (i in _watchers) {
                _watchers[i].onitemsupdated(updatedItems);
            }
            successCallback(updatedItems);
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "calendar:updateBatch", _updateBatch);
    }

    function remove(id) {
        var isFound = false, i, removedItem;

        if (!_security.all && !_security.remove)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (!_isValidId(id))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!isValidCalendarItemId(id))
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        for (i in privateItems) {
            if (i === id) {
                removedItem = utils.copy(privateItems[i]);
                delete privateItems[i];
                isFound = true;
                break;
            }
        }

        if (!isFound)
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        saveCalendarItems();
        for (i in _watchers) {
            _watchers[i].onitemsremoved(removedItem);
        }
    }

    function removeBatch(ids, successCallback, errorCallback) {
        var i, j, isFound = false, removedItems = [];

        if (!_security.all && !_security.removeBatch)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        function _removeBatch() {
            var i, j;

            for (i in ids) {
                if (!_isValidId(ids[i]))
                    throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

                if (!isValidCalendarItemId(id))
                    throw new WebAPIError(errorcode.NOT_FOUND_ERR);
            }

            for (i in ids) {
                isFound = false;
                for (j in privateItems) {
                    if (j === ids[i])
                        isFound = true;
                }
                if (!isFound)
                    throw new WebAPIError(errorcode.NOT_FOUND_ERR);
            }

            for (i in ids) {
                for (j in privateItems) {
                    if (j === ids[i]) {
                        removedItems.push(utils.copy(privateItems[j]));
                        delete privateItems[j];
                    }
                }
            }

            saveCalendarItems();
            successCallback(removedItems);
            for (i in _watchers) {
                _watchers[i].onitemsremoved(utils.copy(removedItems));
            }
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "calendar:removeBatch", _removeBatch);
    }

    function find(successCallback, errorCallback, filter, sortMode) {
        if (!_security.all && !_security.find)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        function _find() {
            var i, calendarItems = [], result = [];

            for (i in privateItems) {
                calendarItems.push(privateItems[i]);
            }

            result = tizen1_utils.query(calendarItems, filter, sortMode);
            successCallback(result);
        }
        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "calendar:find", _find);
    }

    function addChangeListener(successCallback, errorCallback) {
        var watchId;

        if (!_security.all && !_security.addChangeListener)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (//(typeof successCallback !== "function") ||
            (typeof errorCallback !== "function"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        watchId = Math.uuid(null, 16);
        _watchers[watchId] = successCallback;

        return watchId;
    }

    function removeChangeListener(watchId) {
        if (!_isValidId(watchId))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!_watchers[watchId])
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

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
                (privateItems[i][attr] !== undefined)) {
                itemsStorage[i][attr] = privateItems[i][attr].toString();
            } else if (typeof privateItems[i] !== "function") {
                itemsStorage[i][attr] = privateItems[i][attr];
            }
        }
    }

    return itemsStorage;
};

module.exports = _self;
