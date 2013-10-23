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
    CalendarRecurrenceRule;

CalendarRecurrenceRule = function (frequency, ruleInitDict) {
    var calendarRecurrenceRule = {}, attr;

    t.CalendarRecurrenceRule(arguments, this);

    calendarRecurrenceRule.frequency       = frequency;
    calendarRecurrenceRule.interval        = 1;
    calendarRecurrenceRule.untilDate       = null;
    calendarRecurrenceRule.occurrenceCount = -1;
    calendarRecurrenceRule.daysOfTheWeek   = [];
    calendarRecurrenceRule.setPositions    = [];
    calendarRecurrenceRule.exceptions      = [];

    if (ruleInitDict) {
        for (attr in ruleInitDict) {
            switch (attr) {
            case "daysOfTheWeek":
                calendarRecurrenceRule.daysOfTheWeek = t.ByDayValue(
                        ruleInitDict.daysOfTheWeek, "[]+");
                break;

            case "setPositions":
                calendarRecurrenceRule.setPositions = t.short(
                        ruleInitDict.setPositions, "[]+");
                break;

            case "exceptions":
                calendarRecurrenceRule.exceptions = t.TZDate(
                        ruleInitDict.exceptions, "[]+");
                break;

            default:
                calendarRecurrenceRule[attr] = ruleInitDict[attr];
                break;
            }
        }
    }

    this.__defineGetter__("frequency", function () {
        return calendarRecurrenceRule.frequency;
    });
    this.__defineSetter__("frequency", function (val) {
        try {
            calendarRecurrenceRule.frequency = t.RecurrenceRuleFrequency(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("interval", function () {
        return calendarRecurrenceRule.interval;
    });
    this.__defineSetter__("interval", function (val) {
        try {
            calendarRecurrenceRule.interval = t.unsigned_short(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("untilDate", function () {
        return calendarRecurrenceRule.untilDate;
    });
    this.__defineSetter__("untilDate", function (val) {
        try {
            calendarRecurrenceRule.untilDate = t.TZDate(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("occurrenceCount", function () {
        return calendarRecurrenceRule.occurrenceCount;
    });
    this.__defineSetter__("occurrenceCount", function (val) {
        try {
            calendarRecurrenceRule.occurrenceCount = t.long(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("daysOfTheWeek", function () {
        return calendarRecurrenceRule.daysOfTheWeek;
    });
    this.__defineSetter__("daysOfTheWeek", function (val) {
        try {
            calendarRecurrenceRule.daysOfTheWeek = t.ByDayValue(val, "[]");
        } catch (e) {
        }
    });

    this.__defineGetter__("setPositions", function () {
        return calendarRecurrenceRule.setPositions;
    });
    this.__defineSetter__("setPositions", function (val) {
        try {
            calendarRecurrenceRule.setPositions = t.short(val, "[]");
        } catch (e) {
        }
    });

    this.__defineGetter__("exceptions", function () {
        return calendarRecurrenceRule.exceptions;
    });
    this.__defineSetter__("exceptions", function (val) {
        try {
            calendarRecurrenceRule.exceptions = t.TZDate(val, "[]");
        } catch (e) {
        }
    });
};

module.exports = CalendarRecurrenceRule;
