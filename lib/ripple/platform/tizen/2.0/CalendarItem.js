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
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    typedef = require('ripple/platform/tizen/2.0/typedef'),
    CalendarItem;

CalendarItem = function (itemInitDict) {
    var calendarItem = {}, attr;

    // private
    function toDigit(number) {
        return ((number >= 10) ? "" : "0") + number;
    }

    // public
    function convertToString(format) {
        var header = "BEGIN:VCALENDAR\r\nPRODID:-//Tizen.org//Tizen Calendar//EN\r\nVERSION:2.0\r\n",
            end = "END:VCALENDAR\r\n", str = "", pri, i, date, before, y, m, d,
            hh, mm, ss, dateStart = "", dateEnd = "";

        t.CalendarItem("convertToString", arguments);

        //TODO: vcalendar 1.0 doesn't support yet
        if (format === "VCALENDAR_10") {
            return;
        }

        str = header + "BEGIN:#TYPE#\r\n";

        if (this.isAllDay) {
            if (this.startDate) {
                date = this.startDate;
                y = date.getFullYear();
                m = toDigit(date.getMonth() + 1);
                d = toDigit(date.getDate());
                str += "DTSTART;VALUE=DATE:" + y + m + d + "\r\n";
                dateStart = "" + y + m + d + "T000000Z";
                if (this.duration) {
                    date = date.addDuration(this.duration);
                    y = date.getFullYear();
                    m = toDigit(date.getMonth() + 1);
                    d = toDigit(date.getDate());
                    str += "DTEND;VALUE=DATE:" + y + m + d + "\r\n";
                    dateEnd = "" + y + m + d + "T000000Z";
                }
            }
        } else {
            if (this.startDate) {
                date = this.startDate;
                y = date.getFullYear();
                m = toDigit(date.getMonth() + 1);
                d = toDigit(date.getDate());
                hh = toDigit(date.getHours());
                mm = toDigit(date.getMinutes());
                ss = toDigit(date.getSeconds());
                str += "DTSTART:" + y + m + d + "T" + hh + mm + ss + "Z" + "\r\n";
                dateStart = "" + y + m + d + "T" + hh + mm + ss + "Z";
                if (this.duration && this.duration.length && this.duration.unit) {
                    date = date.addDuration(this.duration);
                    y = date.getFullYear();
                    m = toDigit(date.getMonth() + 1);
                    d = toDigit(date.getDate());
                    hh = toDigit(date.getHours());
                    mm = toDigit(date.getMinutes());
                    ss = toDigit(date.getSeconds());
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
                    m = toDigit(date.getMonth() + 1);
                    d = toDigit(date.getDate());
                    hh = toDigit(date.getHours());
                    mm = toDigit(date.getMinutes());
                    ss = toDigit(date.getSeconds());
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

        if ((dateStart !== "") && (dateEnd !== "")) {
            str += "#AVAILABILITY#:" + dateStart + "/" + dateEnd + "\r\n";
        }

        str += "#ENDDATE##RECURRENCERULE#";
        str += "#DUEDATE##COMPLETEDDATE##PROGRESS#";
        str += "END:#TYPE#\r\n" + end;

        return str;
    }

    calendarItem.description = "";
    calendarItem.summary     = "";
    calendarItem.isAllDay    = false;
    calendarItem.startDate   = null;
    calendarItem.duration    = null;
    calendarItem.location    = "";
    calendarItem.geolocation = null;
    calendarItem.organizer   = "";
    calendarItem.visibility  = "PUBLIC";
    calendarItem.status      = "TENTATIVE";
    calendarItem.priority    = "LOW";
    calendarItem.alarms      = [];
    calendarItem.categories  = [];
    calendarItem.attendees   = [];

    if (itemInitDict) {
        for (attr in itemInitDict) {
            if (!(attr in typedef.CalendarItemInit))
                continue;

            switch (attr) {
            case "alarms":
                calendarItem.alarms = t.CalendarAlarm(itemInitDict.alarms,
                        "[]+");
                break;

            case "categories":
                calendarItem.categories = t.DOMString(itemInitDict.categories,
                        "[]+");
                break;

            case "attendees":
                calendarItem.attendees = t.CalendarAttendee(
                        itemInitDict.attendees, "[]+");
                break;

            default:
                calendarItem[attr] = itemInitDict[attr];
                break;
            }
        }
    }

    this.__defineGetter__("id", function () {
        return null;
    });

    this.__defineGetter__("calendarId", function () {
        return null;
    });

    this.__defineGetter__("lastModificationDate", function () {
        return null;
    });

    this.__defineGetter__("description", function () {
        return calendarItem.description;
    });
    this.__defineSetter__("description", function (val) {
        try {
            calendarItem.description = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("summary", function () {
        return calendarItem.summary;
    });
    this.__defineSetter__("summary", function (val) {
        try {
            calendarItem.summary = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("isAllDay", function () {
        return calendarItem.isAllDay;
    });
    this.__defineSetter__("isAllDay", function (val) {
        try {
            calendarItem.isAllDay = t.boolean(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("startDate", function () {
        return calendarItem.startDate;
    });
    this.__defineSetter__("startDate", function (val) {
        try {
            calendarItem.startDate = t.TZDate(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("duration", function () {
        return calendarItem.duration;
    });
    this.__defineSetter__("duration", function (val) {
        try {
            calendarItem.duration = t.TimeDuration(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("location", function () {
        return calendarItem.location;
    });
    this.__defineSetter__("location", function (val) {
        try {
            calendarItem.location = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("geolocation", function () {
        return calendarItem.geolocation;
    });
    this.__defineSetter__("geolocation", function (val) {
        try {
            calendarItem.geolocation = t.SimpleCoordinates(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("organizer", function () {
        return calendarItem.organizer;
    });
    this.__defineSetter__("organizer", function (val) {
        try {
            calendarItem.organizer = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("visibility", function () {
        return calendarItem.visibility;
    });
    this.__defineSetter__("visibility", function (val) {
        try {
            calendarItem.visibility = t.CalendarItemVisibility(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("status", function () {
        return calendarItem.status;
    });
    this.__defineSetter__("status", function (val) {
        try {
            calendarItem.status = t.CalendarItemStatus(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("priority", function () {
        return calendarItem.priority;
    });
    this.__defineSetter__("priority", function (val) {
        try {
            calendarItem.priority = t.CalendarItemPriority(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("alarms", function () {
        return calendarItem.alarms;
    });
    this.__defineSetter__("alarms", function (val) {
        try {
            calendarItem.alarms = t.CalendarAlarm(val, "[]");
        } catch (e) {
        }
    });

    this.__defineGetter__("categories", function () {
        return calendarItem.categories;
    });
    this.__defineSetter__("categories", function (val) {
        try {
            calendarItem.categories = t.DOMString(val, "[]");
        } catch (e) {
        }
    });

    this.__defineGetter__("attendees", function () {
        return calendarItem.attendees;
    });
    this.__defineSetter__("attendees", function (val) {
        try {
            calendarItem.attendees = t.CalendarAttendee(val, "[]");
        } catch (e) {
        }
    });

    this.convertToString = convertToString;
};

module.exports = CalendarItem;
