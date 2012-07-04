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
    exception = require('ripple/exception'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    AlarmBase = require('ripple/platform/tizen/1.0/AlarmBase'),
    _byDayValue = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
    PERIOD_WEEK = (7 * 24 * 60 * 60), MILLI_SECOND = 1000;

module.exports = function (date, frequency) {
    var alarm, period = null, daysOfTheWeek = [], ascDays = [];

    function checkDayValue(days) {
        var isDayType = false, i;
        for (i in days) {
            isDayType = utils.arrayContains(_byDayValue, days[i]);
            if (!isDayType)
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }
        return days;
    }

    function getScheduleDateByPeriod(current, date, period) {
        var diff = period * MILLI_SECOND,
            triggerDate = new Date(date);

        while (current > (triggerDate - MILLI_SECOND)) { // In advance 1s - MILLI_SECOND
            triggerDate.setTime(triggerDate.getTime() + diff);
        }
        return triggerDate;
    }

    function getSchedulteDateByDay(current, triggerTime, startDay, endDay) {
        startDay = (7 + (endDay - startDay)) % 7;
        current.setHours(triggerTime.getHours());
        current.setMinutes(triggerTime.getMinutes());
        current.setSeconds(triggerTime.getSeconds());
        current.setMilliseconds(triggerTime.getMilliseconds());
        current.setDate(current.getDate() + startDay);
        return current;
    }

    function getAscDays() { // Get asc order array
        for (var i in daysOfTheWeek) {
            ascDays.push(_byDayValue.lastIndexOf(daysOfTheWeek[i]));
        }
        return ascDays.sort();
    }

    /*
     * Return
     *     true:  A is bigger than B
     *     false: otherwise
     */
    function compareTime(current, triggerTime) {
        var diff = current.getHours() - triggerTime.getHours();
        if (diff !== 0)
            return (diff > 0);

        diff = current.getMinutes() - triggerTime.getMinutes();
        if (diff !== 0)
            return (diff > 0);

        diff = current.getSeconds() - triggerTime.getSeconds();
        if (diff < -1) // Delay 1s
            return false;

        return true;
    }

    alarm = new AlarmBase();
    date = new Date(date);
    if (frequency !== undefined) {
        if (tizen1_utils.isValidArray(frequency)) {
            daysOfTheWeek = checkDayValue(frequency);
            if (daysOfTheWeek.length !== 0) {
                period = PERIOD_WEEK;
            }
        } else {
            period = frequency;
        }
    }

    alarm.getNextScheduledDate = function () {
        var current = new Date(),
            diff, isPass, today, total, i, nextDate;

        diff = current - date;
        if (diff < -1000) // Advance 1s
            return date; // Before first trigger, return date

        if (period === null)
            return null;

        if (period !== PERIOD_WEEK)
            return getScheduleDateByPeriod(current, date, period); // Repeat by period

        today = current.getDay(); // 0~6
        ascDays = getAscDays();
        total = ascDays.length;

        if ((ascDays[0] <= today) && (today <= ascDays[total - 1])) { // Today out of ascDays
            for (i in ascDays) { // Today in ascDays
                if (ascDays[i] < today) {
                    continue;
                } else if (ascDays[i] > today) {
                    nextDate = ascDays[i];
                    break;
                } else {
                    isPass = compareTime(current, date); // Is triggerTime pass
                    if (isPass) {
                        nextDate = ascDays[(i < total - 1) ? (parseInt(i, 10) + 1) : 0];
                    } else {
                        nextDate = today;
                    }
                    break;
                }
            }
        } else {
            nextDate = ascDays[0];
        }

        return getSchedulteDateByDay(current, date, today, nextDate);
    };

    alarm.__defineGetter__("date", function () {
        return date;
    });
    alarm.__defineGetter__("period", function () {
        return period;
    });
    alarm.__defineGetter__("daysOfTheWeek", function () {
        return daysOfTheWeek;
    });

    return alarm;
};
