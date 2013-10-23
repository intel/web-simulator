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

var t = require('ripple/platform/tizen/2.0/typecast'),
    CalendarAttendee;

CalendarAttendee = function (uri, attendeeInitDict) {
    var calendarAttendee = {}, attr;

    t.CalendarAttendee(arguments, this);

    calendarAttendee.uri          = uri;
    calendarAttendee.name         = undefined;
    calendarAttendee.role         = "REQ_PARTICIPANT";
    calendarAttendee.status       = "PENDING";
    calendarAttendee.RSVP         = false;
    calendarAttendee.type         = "INDIVIDUAL";
    calendarAttendee.group        = undefined;
    calendarAttendee.delegatorURI = undefined;
    calendarAttendee.delegateURI  = undefined;
    calendarAttendee.contactRef   = null;

    if (attendeeInitDict) {
        for (attr in attendeeInitDict) {
            calendarAttendee[attr] = attendeeInitDict[attr];
        }
    }

    this.__defineGetter__("uri", function () {
        return calendarAttendee.uri;
    });
    this.__defineSetter__("uri", function (val) {
        try {
            calendarAttendee.uri = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("name", function () {
        return calendarAttendee.name;
    });
    this.__defineSetter__("name", function (val) {
        try {
            calendarAttendee.name = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("role", function () {
        return calendarAttendee.role;
    });
    this.__defineSetter__("role", function (val) {
        try {
            calendarAttendee.role = t.AttendeeRole(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("status", function () {
        return calendarAttendee.status;
    });
    this.__defineSetter__("status", function (val) {
        try {
            calendarAttendee.status = t.AttendeeStatus(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("RSVP", function () {
        return calendarAttendee.RSVP;
    });
    this.__defineSetter__("RSVP", function (val) {
        try {
            calendarAttendee.RSVP = t.boolean(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("type", function () {
        return calendarAttendee.type;
    });
    this.__defineSetter__("type", function (val) {
        try {
            calendarAttendee.type = t.AttendeeType(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("group", function () {
        return calendarAttendee.group;
    });
    this.__defineSetter__("group", function (val) {
        try {
            calendarAttendee.group = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("delegatorURI", function () {
        return calendarAttendee.delegatorURI;
    });
    this.__defineSetter__("delegatorURI", function (val) {
        try {
            calendarAttendee.delegatorURI = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("delegateURI", function () {
        return calendarAttendee.delegateURI;
    });
    this.__defineSetter__("delegateURI", function (val) {
        try {
            calendarAttendee.delegateURI = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("contactRef", function () {
        return calendarAttendee.contactRef;
    });
    this.__defineSetter__("contactRef", function (val) {
        try {
            calendarAttendee.contactRef = t.ContactRef(val, "?");
        } catch (e) {
        }
    });
};

module.exports = CalendarAttendee;
