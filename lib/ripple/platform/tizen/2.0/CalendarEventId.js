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
    CalendarEventId;

CalendarEventId = function (uid, rid) {
    var calendarEventId = {};

    t.CalendarEventId(arguments, this);

    calendarEventId.uid = uid;
    calendarEventId.rid = rid || null;

    this.__defineGetter__("uid", function () {
        return calendarEventId.uid;
    });
    this.__defineSetter__("uid", function (val) {
        try {
            calendarEventId.uid = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("rid", function () {
        return calendarEventId.rid;
    });
    this.__defineSetter__("rid", function (val) {
        try {
            calendarEventId.rid = t.DOMString(val, "?");
        } catch (e) {
        }
    });
};

module.exports = CalendarEventId;
