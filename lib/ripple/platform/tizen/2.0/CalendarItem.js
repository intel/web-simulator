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
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    TZDate = require('ripple/platform/tizen/2.0/TZDate'),
    SimpleCoordinates = require('ripple/platform/tizen/2.0/SimpleCoordinates'),
    CalendarItemInit,
    CalendarEventInit,
    CalendarTaskInit,
    CalendarItem;

CalendarItem = function (type, id, lastModificationDate, _security) {
    var _self;

    function _2digital(number) {
        return ((number >= 10) ? '' : '0') + number;
    }

    if ((type !== "EVENT") && (type !== "TASK"))
        throw new WebAPIError(errorcode.NOT_FOUND_ERR);

    if (type === "EVENT") {
        _self = new CalendarEventInit();
        id = {
            uid: id || Math.uuid(null, 16),
            rid: null
        };
    } else {
        _self = new CalendarTaskInit();
        id = id || Math.uuid(null, 16);
    }

    lastModificationDate = (lastModificationDate) ? utils.copy(lastModificationDate) : (new TZDate());
    _self.status = (type === "EVENT") ? "CONFIRMED" : "NEEDS_ACTION";

    _self.__defineGetter__("id", function () {
        return id;
    });

    _self.__defineGetter__("lastModificationDate", function () {
        return lastModificationDate;
    });

    _self.clone = function () {
        var item = new CalendarItem(type);

        if (!_security.clone) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        item.id                   = Math.uuid(null, 16);
        item.lastModificationDate = new TZDate();
        item.description          = _self.description;
        item.summary              = _self.summary;
        item.isAllDay             = _self.isAllDay;
        item.startDate            = _self.startDate;
        item.duration             = _self.duration;
        item.location             = _self.location;
        item.geolocation          = _self.geolocation;
        item.organizer            = _self.organizer;
        item.visibility           = _self.visibility;
        item.status               = _self.status;
        item.priority             = _self.priority;
        item.alarms               = _self.alarms;
        item.categories           = _self.categories;
        item.attendees            = _self.attendees;

        if (type === "EVENT") {
            item.endDate          = _self.endDate;
            item.availability     = _self.availability;
            item.recurrenceRule   = _self.recurrenceRule;
        } else {
            item.dueDate          = _self.dueDate;
            item.completedDate    = _self.completedDate;
            item.progress         = _self.progress;
        }

        return item;
    };

    _self.convertToString = function (format) {
        var str = "", pri, i, date, before, y, m, d, hh, mm, ss, dateStart = "", dateEnd = "",
            header = "BEGIN:VCALENDAR\r\nPRODID:-//Tizen.org//Tizen Calendar//EN\r\nVERSION:2.0\r\n",
            end = "END:VCALENDAR\r\n";

        if (!_security.convertToString) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (format !== "ICALENDAR_20" && format !== "VCALENDAR_10") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERROR);
        }

        //TODO: vcalendar 1.0 doesn't support yet
        if (format === "VCALENDAR_10") {
            return;
        }

        str = header;
        if (type === "EVENT") {
            str += "BEGIN:VEVENT\r\n";
        } else if (type === "TASK") {
            str += "BEGIN:VTODO\r\n";
        }

        if (this.isAllDay) {
            if (this.startDate) {
                date = this.startDate;
                y = date.getFullYear();
                m = _2digital(date.getMonth() + 1);
                d = _2digital(date.getDate());
                str += "DTSTART;VALUE=DATE:" + y + m + d + "\r\n";
                dateStart = "" + y + m + d + "T000000Z";
                if (this.duration) {
                    date = date.addDuration(this.duration);
                    y = date.getFullYear();
                    m = _2digital(date.getMonth() + 1);
                    d = _2digital(date.getDate());
                    str += "DTEND;VALUE=DATE:" + y + m + d + "\r\n";
                    dateEnd = "" + y + m + d + "T000000Z";
                }
            }
        } else {
            if (this.startDate) {
                date = this.startDate;
                y = date.getFullYear();
                m = _2digital(date.getMonth() + 1);
                d = _2digital(date.getDate());
                hh = _2digital(date.getHours());
                mm = _2digital(date.getMinutes());
                ss = _2digital(date.getSeconds());
                str += "DTSTART:" + y + m + d + "T" + hh + mm + ss + "Z" + "\r\n";
                dateStart = "" + y + m + d + "T" + hh + mm + ss + "Z";
                if (this.duration && this.duration.length && this.duration.unit) {
                    date = date.addDuration(this.duration);
                    y = date.getFullYear();
                    m = _2digital(date.getMonth() + 1);
                    d = _2digital(date.getDate());
                    hh = _2digital(date.getHours());
                    mm = _2digital(date.getMinutes());
                    ss = _2digital(date.getSeconds());
                    str += "DTEND:" + y + m + d + "T" + hh + mm + ss + "Z" + "\r\n";
                    dateEnd = "" + y + m + d + "T" + hh + mm + ss + "Z";
                }
            }
        }

        if (this.description) {
            str += "DESCRIPTION:" + this.description + "\r\n";
        }
        if (this.summary) {
            str += "SUMMARY:" + this.summary + "\r\n";
        }
        if (this.location) {
            str += "LOCATION:" + this.location + "\r\n";
        }
        if (this.geolocation) {
            // Don't need to check latitude and longitude due to they are mandatory attributes
            str += "GEO:" + this.geolocation.latitude + "," + this.geolocation.longitude + "\r\n";
        }
        if (this.organizer) {
            str += "ORGANIZER:" + this.organizer + "\r\n";
        }
        if (this.visibility) {
            str += "CLASS:" + this.visibility + "\r\n";
        }
        if (this.status) {
            str += "STATUS:" + this.status + "\r\n";
        }
        if (this.priority) {
            switch (this.priority) {
            case "HIGH":
                pri = 2;
                break;
            case "MEDIUM":
                pri = 5;
                break;
            case "LOW":
                pri = 7;
                break;
            }
            str += "PRIORITY:" + pri + "\r\n";
        }
        if (tizen1_utils.isValidArray(this.alarms)) {
            for (i = 0; i < this.alarms.length; i++) {
                str += "BEGIN:VALARM\r\n";
                // Don't need to check this.alarms[i].method due to it is a mandatory attribute
                str += "ACTION:" + this.alarms[i].method + "\r\n";
                if (this.alarms[i].description) {
                    str += "DESCRIPTION:" + this.alarms[i].description + "\r\n";
                } else {
                    // description property MUST included if action is DISPLAY (RFC5545 3.6.6)
                    str += "DESCRIPTION:This is a reminder\r\n";
                }
                if (this.alarms[i].absoluteDate) {
                    date = this.alarms[i].absoluteDate;
                    y = date.getFullYear();
                    m = _2digital(date.getMonth() + 1);
                    d = _2digital(date.getDate());
                    hh = _2digital(date.getHours());
                    mm = _2digital(date.getMinutes());
                    ss = _2digital(date.getSeconds());
                    str += "TRIGGER;VALUE=DATE-TIME:" + y + m + d + "T" + hh + mm + ss + "Z" + "\r\n";
                } else {
                    //it must be included before attribute
                    before = this.alarms[i].before;
                    switch (before.unit) {
                    case "DAYS":
                        str += "TRIGGER:-P" + before.length + "D" + "\r\n";
                        break;
                    case "HOURS":
                        str += "TRIGGER:-P0DT" + before.length + "H0M0S" + "\r\n";
                        break;
                    case "MINS":
                        str += "TRIGGER:-P0DT0H" + before.length + "M0S" + "\r\n";
                        break;
                    case "SECS":
                        str += "TRIGGER:-P0DT0H0M" + before.length + "S" + "\r\n";
                        break;
                    }
                }
                str += "END:VALARM\r\n";
            }
        }
        if (tizen1_utils.isValidArray(this.categories)) {
            str += "CATEGORIES:";
            for (i = 0; i < this.categories.length; i++) {
                str += this.categories[i] + ",";
            }
            str = str.slice(0, -1);
            str += "\r\n";
        }
        if (tizen1_utils.isValidArray(this.attendees)) {
            for (i = 0; i < this.attendees.length; i++) {
                //TODO: basic implementation
                str += "ATTENDEE:mailto:" + this.attendees[i].uri + "\r\n";
            }
        }

        if (type === "EVENT" && this.availability && dateStart !== "" && dateEnd !== "") {
            switch (this.availability) {
            case "BUSY":
                str += "FREEBUSY;FBTYPE=BUSY:";
                break;
            case "FREE":
                str += "FREEBUSY;FBTYPE=FREE:";
                break;
            }
            str += dateStart + "/" + dateEnd + "\r\n";
        }
        //TODO: endDate doesn't support (CalendarEvent specific property)
        //TODO: recurrenceRule doesn't support (CalendarEvent specific property)
        //TODO: dueDate doesn't support (CalendarTask specific property)
        //TODO: completeDate doesn't support (CalendarTask specific property)
        if (type === "TASK" && this.progress) {
            str += "PERCENT-COMPLETE:" + this.progress + "\r\n";
        }

        if (type === "EVENT") {
            str += "END:VEVENT\r\n";
        } else if (type === "TASK") {
            str += "END:VTODO\r\n";
        }
        str += end;

        return str;
    };

    return _self;
};

CalendarItemInit = function () {
    return {
        description: "",
        summary:     "",
        isAllDay:    false,
        startDate:   null,
        duration:    null,
        location:    "",
        geolocation: new SimpleCoordinates(),
        organizer:   "",
        visibility:  "PUBLIC",
        status:      "",
        priority:    "LOW",
        alarms:      [],
        categories:  [],
        attendees:   []
    };
};

CalendarEventInit = function () {
    var _self = new CalendarItemInit();

    _self.endDate        = undefined;
    _self.availability   = undefined;
    _self.recurrenceRule = undefined;

    return _self;
};

CalendarTaskInit = function () {
    var _self = new CalendarItemInit();

    _self.dueDate       = undefined;
    _self.completedDate = undefined;
    _self.progress      = undefined;

    return _self;
};

module.exports = CalendarItem;
