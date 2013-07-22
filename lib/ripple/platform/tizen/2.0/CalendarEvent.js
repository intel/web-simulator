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
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    TZDate = require('ripple/platform/tizen/2.0/TZDate'),
    TDur = require('ripple/platform/tizen/2.0/TimeDuration'),
    CalendarItem = require('ripple/platform/tizen/2.0/CalendarItem'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    SimpleCoordinates = require('ripple/platform/tizen/2.0/SimpleCoordinates'),
    CalendarRecurrenceRule = require('ripple/platform/tizen/2.0/CalendarRecurrenceRule');

module.exports = function (eventInitDict) {
    var _self, isDetached = false, isInvalid = false;

    _self = new CalendarItem("EVENT");

    if ((eventInitDict !== undefined) && (eventInitDict !== null)) {
        _self.endDate        = tizen1_utils.isValidTZDate(eventInitDict.endDate) ? eventInitDict.endDate.addDuration(new TDur(0, "MSECS")) : null;
        _self.availability   = (eventInitDict.availability) ? String(eventInitDict.availability) : "BUSY";
        _self.recurrenceRule = utils.copy(eventInitDict.recurrenceRule);
        if (eventInitDict.description) {
            _self.description = String(eventInitDict.description);
        }
        if (eventInitDict.summary) {
            _self.summary = String(eventInitDict.summary);
        }
        if (eventInitDict.isAllDay && (typeof eventInitDict.isAllDay === "boolean")) {
            _self.isAllDay = eventInitDict.isAllDay;
        }
        if (eventInitDict.startDate && tizen1_utils.isValidTZDate(eventInitDict.startDate)) {
            _self.startDate = eventInitDict.startDate;
        }
        if (eventInitDict.duration && (typeof eventInitDict.duration === "object")) {
            _self.duration = eventInitDict.duration;
        }
        if (eventInitDict.location) {
            _self.location = String(eventInitDict.location);
        }
        if (eventInitDict.geolocation && eventInitDict.geolocation.latitude && eventInitDict.geolocation.longitude) {
            _self.geolocation = new SimpleCoordinates(eventInitDict.geolocation.latitude, eventInitDict.geolocation.longitude);
        }
        if (eventInitDict.organizer) {
            _self.organizer = String(eventInitDict.organizer);
        }
        if (eventInitDict.visibility) {
            _self.visibility = String(eventInitDict.visibility);
        }
        if (eventInitDict.status) {
            _self.status = String(eventInitDict.status);
        }
        if (eventInitDict.priority) {
            _self.priority = String(eventInitDict.priority);
        }
        if (eventInitDict.alarms && tizen1_utils.isValidArray(eventInitDict.alarms)) {
            isInvalid = false;
            eventInitDict.alarms.some(function (alarm) {
                if (!alarm || alarm.method === undefined) {// 'method' is CalendarAlarm's property.
                    isInvalid = true;
                    return;
                }
            });
            if (!isInvalid) {
                _self.alarms = eventInitDict.alarms;
            }
        }
        if (eventInitDict.categories && tizen1_utils.isValidArray(eventInitDict.categories)) {
            isInvalid = false;
            eventInitDict.categories.some(function (categorie) {
                if (!categorie || typeof categorie !== "string") {
                    isInvalid = true;
                    return;
                }
            });
            if (!isInvalid) {
                _self.categories = eventInitDict.categories;
            }
        }
        if (eventInitDict.attendees && tizen1_utils.isValidArray(eventInitDict.attendees)) {
            isInvalid = false;
            eventInitDict.attendees.some(function (attendee) {
                if (!attendee || attendee.uri === undefined) {// 'uri' is CalendarAttendee's property.
                    isInvalid = true;
                    return;
                }
            });
            if (!isInvalid) {
                _self.attendees = eventInitDict.attendees;
            }
        }
    } else {
        _self.endDate        = null;
        _self.availability   = "BUSY";
        _self.recurrenceRule = new CalendarRecurrenceRule();
    }

    _self.expandRecurrence = function (startDate, endDate, successCallback, errorCallback) {
        _self.startDate = startDate;
        _self.endDate   = endDate;
        if (errorCallback) {
            window.setTimeout(function () {
                errorCallback(new WebAPIError(errorcode.NOT_SUPPORTED_ERR));
            }, 1);
        }
    };
    _self.__defineGetter__("isDetached", function () {
        return isDetached;
    });
    return _self;
};
