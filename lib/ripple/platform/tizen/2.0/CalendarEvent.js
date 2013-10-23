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
    typedef = require('ripple/platform/tizen/2.0/typedef'),
    CalendarItem = require('ripple/platform/tizen/2.0/CalendarItem'),
    CalendarEvent;

CalendarEvent = function () {
    var voc, calendarEvent = {};

    // private
    function construct(eventInitDict) {
        CalendarItem.call(this, eventInitDict);

        this.status = "CONFIRMED";

        calendarEvent.convertToString  = this.convertToString;
        calendarEvent.isDetached       = false;
        calendarEvent.endDate          = null;
        calendarEvent.availability     = "BUSY";
        calendarEvent.recurrenceRule   = null;

        this.__defineGetter__("isDetached", function () {
            return calendarEvent.isDetached;
        });

        this.__defineGetter__("endDate", function () {
            return calendarEvent.endDate;
        });
        this.__defineSetter__("endDate", function (val) {
            try {
                calendarEvent.endDate = t.TZDate(val, "?");
            } catch (e) {
            }
        });

        this.__defineGetter__("availability", function () {
            return calendarEvent.availability;
        });
        this.__defineSetter__("availability", function (val) {
            try {
                calendarEvent.availability = t.EventAvailability(val);
            } catch (e) {
            }
        });

        this.__defineGetter__("recurrenceRule", function () {
            return calendarEvent.recurrenceRule;
        });
        this.__defineSetter__("recurrenceRule", function (val) {
            try {
                calendarEvent.recurrenceRule = t.CalendarRecurrenceRule(val,
                        "?");
            } catch (e) {
            }
        });

        this.convertToString  = convertToString;
        this.clone            = clone(this);
        this.expandRecurrence = expandRecurrence;
    }

    function clone(self) {
        return function () {
            return new CalendarEvent(self);
        };
    }

    // public
    function convertToString(format) {
        var str;

        str = calendarEvent.convertToString.call(this, format);
        str = str.replace(/#TYPE#/g, "VEVENT");

        // TODO: endDate is not supported
        // TODO: recurrenceRule is not supported
        str = str.replace(/#AVAILABILITY#/g, "FREEBUSY;FBTYPE=" +
                calendarEvent.availability);

        str = str.replace(/#[^#]*#/g, "");

        return str;
    }

    function expandRecurrence(startDate, endDate, successCallback,
            errorCallback) {
    }

    // Constructor
    function CalendarEvent_CalendarEventInit(eventInitDict) {
        var attr;

        construct.call(this, eventInitDict);

        if (eventInitDict) {
            for (attr in eventInitDict) {
                if (attr in typedef.CalendarEventInit) {
                    calendarEvent[attr] = eventInitDict[attr];
                }
            }
        }
    }

    function CalendarEvent_DOMString_CalendarTextFormat(stringRepresentation,
            format) {
    }

    voc = [CalendarEvent_CalendarEventInit,
           CalendarEvent_DOMString_CalendarTextFormat];
    t.CalendarEvent(arguments, this, voc);
};

module.exports = CalendarEvent;
