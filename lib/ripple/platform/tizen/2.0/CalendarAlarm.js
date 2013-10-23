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
    CalendarAlarm;

CalendarAlarm = function () {
    var voc, calendarAlarm = {};

    // private
    function construct() {
        this.__defineGetter__("absoluteDate", function () {
            return calendarAlarm.absoluteDate;
        });
        this.__defineSetter__("absoluteDate", function (val) {
            try {
                calendarAlarm.absoluteDate = t.TZDate(val, "?");
            } catch (e) {
            }
        });

        this.__defineGetter__("before", function () {
            return calendarAlarm.before;
        });
        this.__defineSetter__("before", function (val) {
            try {
                calendarAlarm.before = t.TimeDuration(val, "?");
            } catch (e) {
            }
        });

        this.__defineGetter__("method", function () {
            return calendarAlarm.method;
        });
        this.__defineSetter__("method", function (val) {
            try {
                calendarAlarm.method = t.AlarmMethod(val);
            } catch (e) {
            }
        });

        this.__defineGetter__("description", function () {
            return calendarAlarm.description;
        });
        this.__defineSetter__("description", function (val) {
            try {
                calendarAlarm.description = t.DOMString(val, "?");
            } catch (e) {
            }
        });
    }

    // Constructor
    function CalendarAlarm_TZDate_AlarmMethod_DOMString(absoluteDate, method,
            description) {
        construct.call(this);

        calendarAlarm.absoluteDate = absoluteDate;
        calendarAlarm.before       = null;
        calendarAlarm.method       = method;
        calendarAlarm.description  = description || "";
    }

    function CalendarAlarm_TimeDuration_AlarmMethod_DOMString(before, method,
            description) {
        construct.call(this);

        calendarAlarm.absoluteDate = null;
        calendarAlarm.before       = before;
        calendarAlarm.method       = method;
        calendarAlarm.description  = description || "";
    }

    voc = [CalendarAlarm_TZDate_AlarmMethod_DOMString,
           CalendarAlarm_TimeDuration_AlarmMethod_DOMString];
    t.CalendarAlarm(arguments, this, voc);
};

module.exports = CalendarAlarm;
