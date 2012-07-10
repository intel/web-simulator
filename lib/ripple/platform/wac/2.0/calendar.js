/*
 *  Copyright 2011 Intel Corporation.
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
    utils = require('ripple/utils'),
    exception = require('ripple/exception'),
    constants = require('ripple/constants'),
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    PendingOperation = require('ripple/platform/wac/2.0/pendingoperation'),
    PendingObject = require('ripple/platform/wac/2.0/pendingObject'),
    wac2_utils = require('ripple/platform/wac/2.0/wac2_utils'),
    _console = require('ripple/console'),
    DeviceApiError = require('ripple/platform/wac/2.0/deviceapierror'),
    _SIM_CALENDAR = 0, _DEVICE_CALENDAR = 1,
    _NO_RECURRENCE = 0, _DAILY_RECURRENCE = 1, _WEEKLY_RECURRENCE = 2,
    _MONTHLY_RECURRENCE = 3, _YEARLY_RECURRENCE = 4,
    _TENTATIVE_STATUS = 0, _CONFIRMED_STATUS = 1, _CANCELLED_STATUS = 2,
    _NO_ALARM = 0, _SILENT_ALARM = 1, _SOUND_ALARM = 2,
    _calendars = [], _DB_CALENDARS_KEY = "wac2-db-calendars",
    _FAKEWAITTIME = 5, _FAKE_LONG_WAITTIME = 10,
    _save_calendars, _eventPropCheck, _eventFilterCheck,
    _addEventAllowed = true, _deleteEventAllowed = true,
    _updateEventAllowed = true, _findEventsAllowed = true,
    CalendarEventProperties, Calendar, CalendarEvent;

_save_calendars = function (_name, _type, _events) {
    var i;
    for (i = 0; i < _calendars.length; i++) {
        if (_calendars[i].name === _name && _calendars[i].type === _type) {
            _calendars[i].events = _events;
            break;
        }
    }
    db.saveObject(_DB_CALENDARS_KEY, _calendars);
};

_eventPropCheck = function (prop, dst) {
    var i;
    if (prop.description !== null && prop.description !== undefined) {
        dst.description = String(prop.description);
    }
    if (prop.summary !== null && prop.summary !== undefined) {
        dst.summary = String(prop.summary);
    } 
    if (prop.startTime !== null && prop.startTime !== undefined) {
        if (!wac2_utils.isValidDate(prop.startTime)) {
            return false;
        }
        dst.startTime = new Date(prop.startTime);
    }
    dst.duration = prop.duration | 0;
    if (prop.location !== null && prop.location !== undefined) {
        dst.location = String(prop.location);
    }
    if (prop.categories !== null && prop.categories !== undefined) {
        if (!wac2_utils.isValidArray(prop.categories))  {
            return false;
        }
        dst.categories = [];
        for (i = 0; i < prop.categories.length; i++) {
            dst.categories.push(String(prop.categories[i]));
        }
    }
    if (prop.recurrence !== null && prop.recurrence !== undefined) {
        if (prop.recurrence === _NO_RECURRENCE ||
            prop.recurrence === _DAILY_RECURRENCE ||
            prop.recurrence === _WEEKLY_RECURRENCE ||
            prop.recurrence === _MONTHLY_RECURRENCE ||
            prop.recurrence === _YEARLY_RECURRENCE) {
            dst.recurrence = prop.recurrence | 0;
        } else {
            return false;
        }
    }
    if (dst.recurrence === _NO_RECURRENCE) {
        dst.expires = null;
        dst.interval = null;
    } else {
        // expires and interval matters when recurrence is not NO_RECURRENCE
        if (prop.expires !== null && prop.expires !== undefined) {
            if (!wac2_utils.isValidDate(prop.expires)) {
                return false;
            }
            dst.expires = new Date(prop.expires);
        }
        // expires === undefined -> to recur indefinitely
        // expires === null -> keep dst.expires unchanged, even it's null
        if (prop.expires === undefined) {
            dst.expires = null;
        }
        if (prop.interval !== null && prop.interval !== undefined) {
            dst.interval = prop.interval | 0;
        }
    }

    if (prop.status !== null && prop.status !== undefined) {
        if (prop.status === _TENTATIVE_STATUS ||
            prop.status === _CONFIRMED_STATUS ||
            prop.status === _CANCELLED_STATUS) {
            dst.status = prop.status | 0;
        } else {
            return false;
        }
    }

    if (prop.alarmType !== null && prop.alarmType !== undefined) {
        if (prop.alarmType === _NO_ALARM ||
            prop.alarmType === _SILENT_ALARM ||
            prop.alarmType === _SOUND_ALARM) {
            dst.alarmType = prop.alarmType;
        } else {
            return false;
        }
    } 
    if (dst.alarmType !== _NO_ALARM && prop.alarmTrigger !== undefined && prop.alarmTrigger !== undefined) {
        dst.alarmTrigger = prop.alarmTrigger | 0;
    }
};

_eventFilterCheck = function (filter) {
    if (filter.id !== undefined && filter.id !== null) {
        filter.id = String(filter.id);
    } else {
        filter.id = undefined;
    }
    if (filter.summary !== undefined && filter.summary !== null) {
        filter.summary = String(filter.summary);
    } else {
        filter.summary = undefined;
    }
    if (filter.description !== undefined && filter.description !== null) {
        filter.description = String(filter.description);
    } else {
        filter.description = undefined;
    }
    if (filter.location !== undefined && filter.location !== null) {
        filter.location = String(filter.location);
    } else {
        filter.location = undefined;
    }
    if (filter.catetory !== undefined && filter.catetory !== null) {
        filter.catetory = String(filter.catetory);
    } else {
        filter.catetory = undefined;
    }
    if (filter.status !== undefined && filter.status !== null) {
        var i;
        if (!wac2_utils.isValidArray(filter.status))  {
            return false;
        }
        for (i = 0; i < filter.status.length; i++) {
            filter.status[i] = filter.status[i] | 0;
            if (filter.status[i] > _CANCELLED_STATUS || filter.status[i] < _TENTATIVE_STATUS)
                return false;
        }
    } else {
        filter.status = undefined;
    }
    if (filter.initialStartDate !== undefined && filter.initialStartDate !== null) {
        if (!wac2_utils.isValidDate(filter.initialStartDate)) {
            return false;
        }
        filter.initialStartDate = new Date(filter.initialStartDate);
    } else {
        filter.initialStartDate = undefined;
    }
    if (filter.endStartDate !== undefined && filter.endStartDate !== null) {
        if (!wac2_utils.isValidDate(filter.endStartDate)) {
            return false;
        }
        filter.endStartDate = new Date(filter.endStartDate);
    } else {
        filter.endStartDate = undefined;
    }
    return true;
};

CalendarEventProperties = function (prop) {
    var _self;
    _self = {
        description : "",
        summary : "",
        startTime : new Date(),
        duration : 0,
        location : "",
        categories : undefined,
        recurrence : _NO_RECURRENCE,
        expires : null,  // ignored if recurrence == NO_RECURRENCE
        interval : null, // ignored if recurrence == NO_RECURRENCE
        status : _CONFIRMED_STATUS,
        alarmTrigger : 0,
        alarmType : _NO_ALARM
    };
    if (prop) {
        if (_eventPropCheck(prop, _self) === false) {
            return undefined;
        }
    }
    return _self;
};

CalendarEvent = function (prop, genNewID) {
    var id, _self = new CalendarEventProperties(prop);

    /* if error occurs during checking, _self is an empty object.
       so i randomly pick description to check if property check fails */
    if (_self.description === undefined) {
        return undefined;
    }

    if (genNewID === true) {
        id = Math.uuid(undefined, 16);
    } else {
        id = prop.id;
    }
    _self.__defineGetter__("id", function () {
        return id;
    });
    return _self;
};

Calendar = function (type, name, events) {
    var _type = type,
        _name = name,
        _events = events, _self;

    _self = {
        createEvent: function (evtProp) {
            var rst = {};
            rst = new CalendarEventProperties(evtProp);
            /* if error occurs during checking, rst is an empty object.
               so i randomly pick description to check if property check fails */
            if (rst.description === undefined) {
                exception.raise(exception.types.Argument, "EventProperties: input parameter contains invalid values", new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                return undefined;
            } else {
                return rst;
            }
        },

        addEvent: function (onSuccess, onError, calEvent) {
            var pendingOperation, pendingObj = {},
                newEvent = {}, _doAddEvent, _calEvent = Object(calEvent);

            _doAddEvent = function () {
                if (!_addEventAllowed) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                newEvent = new CalendarEvent(_calEvent, true);
                /* if newEvent.id === undefined,
                   means somthing wrong in calEvent  */
                if (newEvent.id === undefined) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                pendingObj = new PendingObject();
                pendingObj.pendingID = setTimeout(function () {
                    pendingObj.setCancelFlag(false);
                    _events[newEvent.id] = newEvent;
                    _save_calendars(_name, _type, _events);
                    onSuccess(new CalendarEvent(newEvent), false);
                }, _FAKEWAITTIME);
                pendingOperation = new PendingOperation(pendingObj);
                return pendingOperation;
            };

            return wac2_utils.validateTypeMismatch(onSuccess, onError, "Calendar:addEvent", _doAddEvent);
        },

        updateEvent: function (onSuccess, onError, calEvent) {
            var pendingOperation, pendingObj = {},
                chkEvent, _doUpdateEvent, _calEvent = Object(calEvent);

            _doUpdateEvent = function () {
                if (!_updateEventAllowed) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                if (!_events[_calEvent.id]) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.NOT_FOUND_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                chkEvent = new CalendarEvent(_events[_calEvent.id], false);
                /* _eventPropCheck will also update chkEvent btw */
                if (_eventPropCheck(_calEvent, chkEvent) === false) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                pendingObj = new PendingObject();
                pendingObj.pendingID = setTimeout(function () {
                    pendingObj.setCancelFlag(false);

                    _events[chkEvent.id] = chkEvent;
                    _save_calendars(_name, _type, _events);
                    onSuccess();
                }, _FAKEWAITTIME);
                pendingOperation = new PendingOperation(pendingObj);
                return pendingOperation;
            };

            return wac2_utils.validateTypeMismatch(onSuccess, onError, "Calendar:updateEvent", _doUpdateEvent);
        },

        deleteEvent: function (onSuccess, onError, id) {
            var pendingOperation, pendingObj = {},
                _doDeleteEvent;

            _doDeleteEvent = function () {
                /* according to spec  "If any of the input parameters are not 
                   compatible with the expected type for that parameter, 
                   a DeviceAPIError with code TYPE_MISMATCH_ERR MUST be 
                   synchronously thrown." 
                   so an error is raised synchronously */
                utils.validateArgumentType(id, "string", null,
                                       "Calendar:deleteEvent: " + " invalid id parameter",
                                       new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));

                if (!_deleteEventAllowed) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                if (!_events[id]) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.NOT_FOUND_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                pendingObj = new PendingObject();
                pendingObj.pendingID = setTimeout(function () {
                    pendingObj.setCancelFlag(false);

                    delete _events[id];
                    _save_calendars(_name, _type, _events);
                    onSuccess();
                }, _FAKEWAITTIME);
                pendingOperation = new PendingOperation(pendingObj);
                return pendingOperation;
            };

            return wac2_utils.validateTypeMismatch(onSuccess, onError, "Calendar:deleteEvent", _doDeleteEvent);
        },

        findEvents: function (onSuccess, onError, eventFilter) {
            var pendingOperation, pendingObj = {}, i,
                tmp = [], valid_tmp = false, rst = [], _doFindEvents,
                _eventFilter = Object(eventFilter);

            _doFindEvents = function () {
                if (!_eventFilterCheck(_eventFilter)) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                if (!_findEventsAllowed) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                pendingObj = new PendingObject();
                pendingObj.pendingID = setTimeout(function () {
                    pendingObj.setCancelFlag(false);
                    if (_eventFilter.id !== undefined) {
                        tmp = wac2_utils.matchOptionString(_events, "id", _eventFilter.id);
                        valid_tmp = true;
                    }
                    if (_eventFilter.summary !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionString(tmp, "summary", _eventFilter.summary);
                        } else {
                            tmp = wac2_utils.matchOptionString(_events, "summary", _eventFilter.summary);
                            valid_tmp = true;
                        }
                    }
                    if (_eventFilter.description !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionString(tmp, "description", _eventFilter.description);
                        } else {
                            tmp = wac2_utils.matchOptionString(_events, "description", _eventFilter.description);
                            valid_tmp = true;
                        }
                    }
                    if (_eventFilter.location !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionString(tmp, "location", _eventFilter.location);
                        } else {
                            tmp = wac2_utils.matchOptionString(_events, "location", _eventFilter.location);
                            valid_tmp = true;
                        }
                    }
                    if (_eventFilter.category !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionArrayString(tmp, "categories", _eventFilter.category);
                        } else {
                            tmp = wac2_utils.matchOptionArrayString(_events, "categories", _eventFilter.category);
                            valid_tmp = true;
                        }
                    }
                    if (_eventFilter.status !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionShortArray(tmp, "status", _eventFilter.status);
                        } else {
                            tmp = wac2_utils.matchOptionShortArray(_events, "status", _eventFilter.status);
                            valid_tmp = true;
                        }
                    }
                    if (_eventFilter.initialStartDate !== undefined ||
                        _eventFilter.endStartDate !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionDate(tmp, "startTime", _eventFilter.initialStartDate, _eventFilter.endStartDate);
                        } else {
                            tmp = wac2_utils.matchOptionDate(_events, "startTime", _eventFilter.initialStartDate, _eventFilter.endStartDate);
                            valid_tmp = true;
                        }
                    }

                    // to make id readonly
                    if (valid_tmp) {
                        for (i = 0; i < tmp.length; i++) {
                            rst.push(new CalendarEvent(tmp[i], false));
                        }
                    } else {
                        for (var e in _events) {
                            rst.push(new CalendarEvent(_events[e], false));
                        }
                    }
                    onSuccess(rst);
                }, _FAKE_LONG_WAITTIME);
                pendingOperation = new PendingOperation(pendingObj);
                return pendingOperation;
            };

            return wac2_utils.validateTypeMismatch(onSuccess, onError, "Calendar:findEvent", _doFindEvents);
        },
    };
    _self.__defineGetter__("type", function () {
        return _type;
    });
    _self.__defineGetter__("name", function () {
        return name;
    });
    return _self;
};

module.exports = function () {
    this.__defineGetter__("SIM_CALENDAR", function () {
        return 0;
    });
    this.__defineGetter__("DEVICE_CALENDAR", function () {
        return 1;
    });
    this.__defineGetter__("NO_RECURRENCE", function () { 
        return 0;
    });
    this.__defineGetter__("DAILY_RECURRENCE", function () {
        return 1;
    });
    this.__defineGetter__("WEEKLY_RECURRENCE", function () {
        return 2;
    });
    this.__defineGetter__("MONTHLY_RECURRENCE", function () {
        return 3;
    });
    this.__defineGetter__("YEARLY_RECURRENCE", function () {
        return 4;
    });
    this.__defineGetter__("TENTATIVE_STATUS", function () {
        return 0;
    });
    this.__defineGetter__("CONFIRMED_STATUS", function () {
        return 1;
    });
    this.__defineGetter__("CANCELLED_STATUS", function () {
        return 2;
    });
    this.__defineGetter__("NO_ALARM", function () {
        return 0;
    });
    this.__defineGetter__("SILENT_ALARM", function () {
        return 1;
    });
    this.__defineGetter__("SOUND_ALARM", function () {
        return 2;
    });

    this.getCalendars = function (onSuccess, onError) {
        var i, pendingOperation, pendingObj = {}, cal, _doGetCalendars;

        _doGetCalendars = function () {
            pendingObj = new PendingObject();

            pendingObj.pendingID = setTimeout(function () {
                pendingObj.setCancelFlag(false);
                cal = db.retrieveObject(_DB_CALENDARS_KEY) || [];
                _calendars = [];
                if (cal.length === 0) {
                    _calendars.push(new Calendar(_SIM_CALENDAR, "sim cal", {}));
                    _calendars.push(new Calendar(_DEVICE_CALENDAR, "dev cal", {}));
                } else {
                    for (i = 0; i < cal.length; i++) {
                        /* after getting Date out of DB, Date will become 
                           a string, so need to recast it back to Date */
                        /* NOTE: id becomes writable, so need to recast it
                           before passing to application */
                        for (var e in cal[i].events) {
                            if ((cal[i].events[e].startTime !== undefined) &&
                                cal[i].events[e].startTime !== null) {
                                cal[i].events[e].startTime = new Date(cal[i].events[e].startTime);
                            }
                            if ((cal[i].events[e].expires !== undefined) &&
                                cal[i].events[e].expires !== null) {
                                cal[i].events[e].expires = new Date(cal[i].events[e].expires);
                            }
                        }
                        _calendars.push(new Calendar(cal[i].type, cal[i].name, cal[i].events));
                    }
                }
                if (_calendars.length !== 0) {
                    onSuccess(utils.copy(_calendars));
                } else {
                    if (onError) {
                        onError(new DeviceApiError(errorcode.UNKNOWN_ERR));
                    }
                }
            }, _FAKEWAITTIME);
            pendingOperation = new PendingOperation(pendingObj);
            return pendingOperation;
        };
    
        return wac2_utils.validateTypeMismatch(onSuccess, onError, "getCalendars", _doGetCalendars);
    };

    this.handleSubFeatures = function (subFeatures) {
        if (wac2_utils.isEmptyObject(subFeatures) ||
            subFeatures["http://wacapps.net/api/pim.calendar"] ||
            (subFeatures["http://wacapps.net/api/pim.calendar.read"] &&
            subFeatures["http://wacapps.net/api/pim.calendar.write"])) {
            return;
        } 
        if (subFeatures["http://wacapps.net/api/pim.calendar.read"]) {
            _addEventAllowed = false;
            _deleteEventAllowed = false;
            _updateEventAllowed = false;
            return;
        } 
        if (subFeatures["http://wacapps.net/api/pim.calendar.write"]) {
            _findEventsAllowed = false;
            return;
        } 
        _console.warn("WAC-2.0-Calendar-handleSubFeatures: something wrong");
    };
};
