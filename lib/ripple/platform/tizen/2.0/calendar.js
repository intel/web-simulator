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

var utils = require('ripple/utils'),
    db = require('ripple/db'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    TZDate = require('ripple/platform/tizen/2.0/TZDate'),
    TDur = require('ripple/platform/tizen/2.0/TimeDuration'),
    CalendarItem = require('ripple/platform/tizen/2.0/CalendarItem'),
    CalendarEvent = require('ripple/platform/tizen/2.0/CalendarEvent'),
    CalendarEventId = require('ripple/platform/tizen/2.0/CalendarEventId'),
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
        "http://tizen.org/privilege/calendar.read": ["getCalendars",
                "getUnifiedCalendar", "getDefaultCalendar", "getCalendar",
                "get", "find", "addChangeListener", "removeChangeListener",
                "expandRecurrence", "convertToString", "clone"],
        "http://tizen.org/privilege/calendar.write": ["add", "addBatch",
                "update", "updateBatch", "remove", "removeBatch"]
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
    function loadCalendars(type) {
        var calsStorage, defCalendar, id, i, item;

        retrieveCalendars();
        calsStorage = _calendarsStorage[type];

        if (tizen1_utils.isEmptyObject(calsStorage)) {
            defCalendar = new Calendar(type, "Default " + type.toLowerCase() + " calendar");

            _calendars[type][defCalendar.id] = defCalendar;
            calsStorage[defCalendar.id] = new CalendarStorage(defCalendar);
        } else {
            for (id in calsStorage) {
                for (i in calsStorage[id].items) {
                    item = calsStorage[id].items[i];
                }
                _calendars[type][id] = new Calendar(type, calsStorage[id].name,
                        calsStorage[id].items, id);
            }
        }
    }

    // public
    function getCalendars(type, successCallback, errorCallback) {
        if (!_security.getCalendars) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.CalendarManager("getCalendars", arguments);

        window.setTimeout(function () {
            var i, result = [];

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
        }, 1);
    }

    function getUnifiedCalendar(type) {
        var id, calendar;

        if (!_security.getUnifiedCalendar) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.CalendarManager("getUnifiedCalendar", arguments);

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

    function getDefaultCalendar(type) {
        var id, calendar;

        if (!_security.getDefaultCalendar) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.CalendarManager("getDefaultCalendar", arguments);

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

        t.CalendarManager("getCalendar", arguments);

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
        getUnifiedCalendar: getUnifiedCalendar,
        getDefaultCalendar: getDefaultCalendar,
        getCalendar:        getCalendar,
        handleSubFeatures:  handleSubFeatures
    };

    return calendarManager;
};

Calendar = function (type, name, storageItems, calendarId) {
    var privateItems = {},
        defaultWatchId = 0;
    calendarId = calendarId || Math.uuid(null, 16);

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
        calendarItem.startDate      = storageItem.startDate;
        if (storageItem.startDate instanceof TZDate) {
            calendarItem.startDate      = storageItem.startDate.addDuration(new TDur(0, 'MSECS'));
        }
        if (typeof storageItem.startDate === 'string') {
            calendarItem.startDate      = new TZDate(new Date(storageItem.startDate));
        }

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

        calendarItem.endDate = storageItem.endDate;
        if (storageItem.endDate instanceof TZDate) {
            calendarItem.endDate = storageItem.endDate.addDuration(new TDur(0, 'MSECS'));
        }
        if (typeof storageItem.endDate === 'string') {
            calendarItem.endDate = new TZDate(new Date(storageItem.endDate));
        }
        calendarItem.availability = utils.copy(storageItem.availability);
        calendarItem.recurrenceRule = utils.copy(storageItem.recurrenceRule);
        calendarItem.expandRecurrence = function (startDate, endDate, successCallback, errorCallback) {
            if (!_security.expandRecurrence) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }

            calendarItem.startDate = startDate;
            calendarItem.endDate   = endDate;

            if (errorCallback) {
                window.setTimeout(function () {
                    errorCallback(new WebAPIError(errorcode.NOT_SUPPORTED_ERR));
                }, 1);
            }
        };
        calendarItem.frequency       = utils.copy(storageItem.frequency);
        calendarItem.interval        = utils.copy(storageItem.interval);
        calendarItem.untilDate = storageItem.untilDate;
        if (storageItem.untilDate instanceof TZDate) {
            calendarItem.untilDate = storageItem.untilDate.addDuration(new TDur(0, 'MSECS'));
        }
        if (typeof storageItem.untilDate === 'string') {
            calendarItem.untilDate = new TZDate(new Date(storageItem.untilDate));
        }
        calendarItem.occurrenceCount = utils.copy(storageItem.occurrenceCount);
        calendarItem.daysOfTheWeek   = utils.copy(storageItem.daysOfTheWeek);
        calendarItem.setPositions    = utils.copy(storageItem.setPositions);
        calendarItem.exceptions      = utils.copy(storageItem.exceptions);
    }

    function loadCalendarTaskInit(calendarItem, storageItem) {
        loadCalendarItemInit(calendarItem, storageItem);

        calendarItem.dueDate = storageItem.dueDate;
        if (storageItem.dueDate instanceof TZDate) {
            calendarItem.dueDate = storageItem.dueDate.addDuration(new TDur(0, 'MSECS'));
        }
        if (typeof storageItem.dueDate === 'string') {
            calendarItem.dueDate = new TZDate(new Date(storageItem.dueDate));
        }
        calendarItem.completeDate = storageItem.completeDate;
        if (storageItem.completeDate instanceof TZDate) {
            calendarItem.completeDate = storageItem.completeDate.addDuration(new TDur(0, 'MSECS'));
        }
        if (typeof storageItem.completeDate === 'string') {
            calendarItem.completeDate = new TZDate(new Date(storageItem.completeDate));
        }
        calendarItem.progress      = utils.copy(storageItem.progress);
    }

    function loadCalendarItems() {
        var i, calendarItem;

        if (storageItems === undefined)
            return;

        for (i in storageItems) {
            calendarItem = new CalendarItem(type, i, storageItems[i].lastModificationDate? new TZDate(new Date(storageItems[i].lastModificationDate)) : null, _security);

            if (type === "EVENT") {
                loadCalendarEventInit(calendarItem, storageItems[i]);
            } else {
                loadCalendarTaskInit(calendarItem, storageItems[i]);
            }

            privateItems[i] = calendarItem;
        }
    }

    function saveCalendarItems() {
        _calendarsStorage[type][calendarId] ||  (_calendarsStorage[type][calendarId] = {});
        _calendarsStorage[type][calendarId].items = new CalendarItemsStorage(privateItems);
        saveCalendars();
    }

    // public
    function get(id) {
        var item, uid, CalendarItemType, external = {};

        if (!_security.get) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Calendar("get", arguments);

        if (type === "EVENT") {
            if (typeof id !== "object") {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            uid = id.uid;
            CalendarItemType = CalendarEvent;
        } else {
            uid = id;
            CalendarItemType = CalendarTask;
        }

        if (!isValidCalendarItemId(uid))
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);

        item = new CalendarItemType(privateItems[uid]);
        external.id                   = privateItems[uid].id;
        external.lastModificationDate = privateItems[uid].lastModificationDate;

        item.__defineGetter__("calendarId", function () {
            return calendarId;
        });

        item.__defineGetter__("id", function () {
            return external.id;
        });

        item.__defineGetter__("lastModificationDate", function () {
            return external.lastModificationDate;
        });

        return item;
    }

    function add(item) {
        var uid, external = {};

        if (!_security.add) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Calendar("add", arguments);

        uid = Math.uuid(null, 16);
        privateItems[uid] = t.CalendarItem(item, "+");
        if (type === "EVENT") {
            privateItems[uid].id = new CalendarEventId(uid);
        } else {
            privateItems[uid].id = uid;
        }
        privateItems[uid].lastModificationDate = new TZDate();

        external.id = privateItems[uid].id;
        external.lastModificationDate = privateItems[uid].lastModificationDate;

        saveCalendarItems();

        // set the calendarId of the item
        item.__defineGetter__("calendarId", function () {
            return calendarId;
        });

        item.__defineGetter__("id", function () {
            return external.id;
        });

        item.__defineGetter__("lastModificationDate", function () {
            return external.lastModificationDate;
        });

        window.setTimeout(function () {
            for (var i in _watchers) {
                _watchers[i].onitemsadded([item]);
            }
        }, 1);
    }

    function addBatch(items, successCallback, errorCallback) {
        if (!_security.addBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Calendar("addBatch", arguments, true);

        window.setTimeout(function () {
            var i, j, uid, external = [];

            for (i in items) {
                uid = Math.uuid(null, 16);
                privateItems[uid] = utils.copy(items[i]);

                if (type === "EVENT") {
                    privateItems[uid].id = new CalendarEventId(uid);
                } else {
                    privateItems[uid].id = uid;
                }

                external[i] = {};
                external[i].id = privateItems[uid].id;
                external[i].lastModificationDate = new TZDate();

                items[i].__defineGetter__("calendarId", function () {
                    return calendarId;
                });

                items[i].__defineGetter__("id", function () {
                    return external[i].id;
                });

                items[i].__defineGetter__("lastModificationDate", function () {
                    return external[i].lastModificationDate;
                });
            }

            saveCalendarItems();

            if (successCallback) {
                successCallback(items);
            }
            for (j in _watchers) {
                _watchers[j].onitemsadded(items);
            }
        }, 1);
    }

    function update(item, updateAllInstances) {
        var calendarItem, attr, uid;

        if (!_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Calendar("update", arguments);

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

    function updateBatch(items, successCallback, errorCallback,
            updateAllInstances) {
        if (!_security.updateBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Calendar("updateBatch", arguments, true);

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

        t.Calendar("remove", arguments);

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

        t.Calendar("removeBatch", arguments, true);

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

        t.Calendar("find", arguments, true);

        window.setTimeout(function () {
            var i, calendarItems = [], result = [];

            for (i in privateItems) {
                calendarItems.push(privateItems[i]);
            }
            if (calendarItems.length > 0) {
                result = tizen1_utils.query(calendarItems, filter, sortMode);
            }
            successCallback(result);
        }, 1);
    }

    function addChangeListener(successCallback) {
        var watchId;

        if (!_security.addChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Calendar("addChangeListener", arguments);

        watchId = ++defaultWatchId;
        _watchers[watchId] = successCallback;

        return watchId;
    }

    function removeChangeListener(watchId) {
        if (!_security.removeChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Calendar("removeChangeListener", arguments);

        if (!_watchers[watchId])
            return;

        delete _watchers[watchId];
    }

    loadCalendarItems(type, privateItems, storageItems);

    this.__defineGetter__("id", function () {
        return calendarId;
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
            //TODO: should be
            //      if (privateItems[i][attr] instanceof TZDate) {
            //But, we used "utils.copy" before store the item to privateItems list.
            //So the constructor information all lost
            if ((attr === "startDate" || attr === "endDate" || attr === "dueDate" || attr === "completedDate" || attr === "lastModificationDate") &&
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
