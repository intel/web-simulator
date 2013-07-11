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

var TZDate = require('ripple/platform/tizen/2.0/TZDate'),
    CalendarItem = require('ripple/platform/tizen/2.0/CalendarItem'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    SimpleCoordinates = require('ripple/platform/tizen/2.0/SimpleCoordinates');

module.exports = function (taskInitDict) {
    var _self, isInvalid = false;

    _self = new CalendarItem("TASK");

    if ((taskInitDict !== undefined) && (taskInitDict !== null)) {
        _self.dueDate       = tizen1_utils.isValidTZDate(taskInitDict.dueDate) ? (new TZDate(new Date(taskInitDict.dueDate))) : undefined;
        _self.completedDate = tizen1_utils.isValidTZDate(taskInitDict.completedDate) ? (new TZDate(new Date(taskInitDict.completedDate))) : undefined;
        _self.progress      = ((0 <= taskInitDict.progress) && (taskInitDict.progress <= 100)) ? Number(taskInitDict.progress) : 0;

        if (taskInitDict.description) {
            _self.description = String(taskInitDict.description);
        }
        if (taskInitDict.summary) {
            _self.summary = String(taskInitDict.summary);
        }
        if (taskInitDict.isAllDay && (typeof taskInitDict.isAllDay === "boolean")) {
            _self.isAllDay = taskInitDict.isAllDay;
        }
        if (taskInitDict.startDate && tizen1_utils.isValidTZDate(taskInitDict.startDate)) {
            _self.startDate = taskInitDict.startDate;
        }
        if (taskInitDict.duration instanceof tizen.TimeDuration) {
            _self.duration = taskInitDict.duration;
        }
        if (taskInitDict.location) {
            _self.location = String(taskInitDict.location);
        }
        if (taskInitDict.geolocation && taskInitDict.geolocation.latitude && taskInitDict.geolocation.longitude) {
            _self.geolocation = new SimpleCoordinates(taskInitDict.geolocation.latitude, taskInitDict.geolocation.longitude);
        }
        if (taskInitDict.organizer) {
            _self.organizer = String(taskInitDict.organizer);
        }
        if (taskInitDict.visibility) {
            _self.visibility = String(taskInitDict.visibility);
        }
        if (taskInitDict.status) {
            _self.status = String(taskInitDict.status);
        }
        if (taskInitDict.priority) {
            _self.priority = String(taskInitDict.priority);
        }
        if (taskInitDict.alarms && tizen1_utils.isValidArray(taskInitDict.alarms)) {
            isInvalid = false;
            taskInitDict.alarms.some(function (alarm) {
                if (!alarm || alarm.method === undefined) {// 'method' is CalendarAlarm's property.
                    isInvalid = true;
                    return;
                }
            });
            if (!isInvalid) {
                _self.alarms = taskInitDict.alarms;
            }
        }
        if (taskInitDict.categories && tizen1_utils.isValidArray(taskInitDict.categories)) {
            isInvalid = false;
            taskInitDict.categories.every(function (categorie) {
                if (!categorie || typeof categorie !== "string") {
                    isInvalid = true;
                    return;
                }
            });
            if (!isInvalid) {
                _self.categories = taskInitDict.categories;
            }
        }
        if (taskInitDict.attendees && tizen1_utils.isValidArray(taskInitDict.attendees)) {
            isInvalid = false;
            taskInitDict.attendees.some(function (attendee) {
                if (!attendee || attendee.uri === undefined) {// 'uri' is CalendarAttendee's property.
                    isInvalid = true;
                    return;
                }
            });
            if (!isInvalid) {
                _self.attendees = taskInitDict.attendees;
            }
        }
    } else {
        _self.dueDate       = undefined;
        _self.completedDate = undefined;
        _self.progress      = 0;
    }

    return _self;
};
