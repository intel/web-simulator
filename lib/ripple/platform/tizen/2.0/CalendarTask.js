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
    CalendarTask;

CalendarTask = function () {
    var voc, calendarTask = {};

    // private
    function construct(taskInitDict) {
        CalendarItem.call(this, taskInitDict);

        this.status = "NEEDS_ACTION";

        calendarTask.convertToString = this.convertToString;
        calendarTask.dueDate         = null;
        calendarTask.completedDate   = null;
        calendarTask.progress        = 0;

        this.__defineGetter__("dueDate", function () {
            return calendarTask.dueDate;
        });
        this.__defineSetter__("dueDate", function (val) {
            try {
                calendarTask.dueDate = t.TZDate(val, "?");
            } catch (e) {
            }
        });

        this.__defineGetter__("completedDate", function () {
            return calendarTask.completedDate;
        });
        this.__defineSetter__("completedDate", function (val) {
            try {
                calendarTask.completedDate = t.TZDate(val, "?");
            } catch (e) {
            }
        });

        this.__defineGetter__("progress", function () {
            return calendarTask.progress;
        });
        this.__defineSetter__("progress", function (val) {
            try {
                calendarTask.progress = t.unsigned_short(val);
            } catch (e) {
            }
        });

        this.convertToString = convertToString;
        this.clone           = clone(this);
    }

    function clone(self) {
        return function () {
            return new CalendarTask(self);
        };
    }

    // public
    function convertToString(format) {
        var str;

        str = calendarTask.convertToString.call(this, format);
        str = str.replace(/#TYPE#/g, "VTASK");

        // TODO: dueDate is not supported
        // TODO: completedDate is not supported
        if (this.progress) {
            str = str.replace(/#PROGRESS#/g, "PERCENT-COMPLETE:" +
                    this.progress + "\r\n");
        }

        str = str.replace(/#AVAILABILITY#.*\r\n/g, "");
        str = str.replace(/#[^#]*#/g, "");

        return str;
    }

    // Constructor
    function CalendarTask_CalendarTaskInit(taskInitDict) {
        var attr;

        construct.call(this, taskInitDict);

        if (taskInitDict) {
            for (attr in taskInitDict) {
                if (attr in typedef.CalendarTaskInit) {
                    calendarTask[attr] = taskInitDict[attr];
                }
            }
        }
    }

    function CalendarTask_DOMString_CalendarTextFormat(stringRepresentation,
            format) {
    }

    voc = [CalendarTask_CalendarTaskInit,
           CalendarTask_DOMString_CalendarTextFormat];
    t.CalendarTask(arguments, this, voc);
};

module.exports = CalendarTask;
