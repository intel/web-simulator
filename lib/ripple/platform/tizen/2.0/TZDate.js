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

var errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    tz = require('ripple/platform/tizen/2.0/timezone_info'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    _Month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    _Day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

module.exports = function (dt) {
    var d, UTCd, UTC_diff, tzid = "", target_diff, temp_date,
    time = require('ripple/platform/tizen/2.0/time'),
        hour = arguments[3] || 0, min = arguments[4] || 0,
        sec = arguments[5] || 0, msec = arguments[6] || 0,

    _d2UTCd_sync = function () {
        UTCd = new Date(d.valueOf() - (UTC_diff * 1000 * 60 * 60));
    },
    _UTCd2d_sync = function () {
        d = new Date(UTCd.valueOf() + (UTC_diff * 1000 * 60 * 60));
    },
    _getValue = function (o) {
        var other;
        other = new Date(o.getUTCFullYear(), o.getUTCMonth(), o.getUTCDate(),
                    o.getUTCHours(), o.getUTCMinutes(), o.getUTCSeconds(), o.getUTCMilliseconds());
        return other.valueOf();
    },
    _int_range_check = function (val, _min, _max) {
        var v = Number(val);

        if (v > _max || v < _min) {
            return false;
        }
        return true;
    };

    if (arguments[7] !== undefined) {
        tzid = arguments[7];
    }

    if (dt === null || dt === undefined) {
        temp_date = new Date();
        target_diff = tz.getTimezoneDiff(time.getLocalTimezone());
        d = new Date(temp_date.valueOf() + (target_diff + temp_date.getTimezoneOffset() / 60) * 1000 * 60 * 60);
    } else {
        if (tizen1_utils.isValidDate(dt)) {
            d = new Date(dt);
            if (arguments[1] !== undefined) {
                tzid = arguments[1];
            }
        } else {
            d = new Date(arguments[0], arguments[1], arguments[2], hour, min, sec, msec);
        }
    }

    if (tz.isValidTimezone(tzid) === false) {
        tzid = time.getLocalTimezone();
    }
    UTC_diff = tz.getTimezoneDiff(tzid);
    _d2UTCd_sync();

    return {
        getDate: function () {
            return d.getDate();
        },
        setDate: function (dt) {
            if (_int_range_check(dt, 1, 31)) {
                d.setDate(dt);
                _d2UTCd_sync();
            }
        },
        getDay: function () {
            return d.getDay();
        },
        getFullYear: function () {
            return d.getFullYear();
        },
        setFullYear: function (yr) {
            if (_int_range_check(yr, 1000, 9999)) {
                d.setFullYear(yr);
                _d2UTCd_sync();
            }
        },
        getHours: function () {
            return d.getHours();
        },
        setHours: function (hr) {
            if (_int_range_check(hr, 0, 23)) {
                d.setHours(hr);
                _d2UTCd_sync();
            }
        },
        getMilliseconds: function () {
            return d.getMilliseconds();
        },
        setMilliseconds: function (msec) {
            if (_int_range_check(msec, 0, 999)) {
                d.setMilliseconds(msec);
                _d2UTCd_sync();
            }
        },
        getMinutes: function () {
            return d.getMinutes();
        },
        setMinutes: function (min) {
            if (_int_range_check(min, 0, 59)) {
                d.setMinutes(min);
                _d2UTCd_sync();
            }
        },
        getMonth: function () {
            return d.getMonth();
        },
        setMonth: function (m) {
            if (_int_range_check(m, 0, 11)) {
                d.setMonth(m);
                _d2UTCd_sync();
            }
        },
        getSeconds: function () {
            return d.getSeconds();
        },
        setSeconds: function (s) {
            if (_int_range_check(s, 0, 59)) {
                d.setSeconds(s);
                _d2UTCd_sync();
            }
        },
        getUTCDate: function () {
            return UTCd.getDate();
        },
        setUTCDate: function (dt) {
            if (_int_range_check(dt, 1, 31)) {
                UTCd.setDate(dt);
                _UTCd2d_sync();
            }
        },
        getUTCDay: function () {
            return UTCd.getDay();
        },
        getUTCFullYear: function () {
            return UTCd.getFullYear();
        },
        setUTCFullYear: function (yr) {
            if (_int_range_check(yr, 1000, 9999)) {
                UTCd.setFullYear(yr);
                _UTCd2d_sync();
            }
        },
        getUTCHours: function () {
            return UTCd.getHours();
        },
        setUTCHours: function (hr) {
            if (_int_range_check(hr, 0, 23)) {
                UTCd.setHours(hr);
                _UTCd2d_sync();
            }
        },
        getUTCMilliseconds: function () {
            return UTCd.getMilliseconds();
        },
        setUTCMilliseconds: function (msec) {
            if (_int_range_check(msec, 0, 999)) {
                UTCd.setMilliseconds(msec);
                _UTCd2d_sync();
            }
        },
        getUTCMinutes: function () {
            return UTCd.getMinutes();
        },
        setUTCMinutes: function (min) {
            if (_int_range_check(min, 0, 59)) {
                UTCd.setMinutes(min);
                _UTCd2d_sync();
            }
        },
        getUTCMonth: function () {
            return UTCd.getMonth();
        },
        setUTCMonth: function (m) {
            if (_int_range_check(m, 0, 11)) {
                UTCd.setMonth(m);
                _UTCd2d_sync();
            }
        },
        getUTCSeconds: function () {
            return UTCd.getSeconds();
        },
        setUTCSeconds: function (s) {
            if (_int_range_check(s, 0, 59)) {
                UTCd.setSeconds(s);
                _UTCd2d_sync();
            }
        },
        getTimezone: function () {
            return tzid;
        },
        toTimezone: function (new_tzid) {
            var diff,
                Tzdate = require('ripple/platform/tizen/2.0/TZDate');
            if (typeof new_tzid !== 'string') {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (tz.isValidTimezone(new_tzid) === true) {
                diff = tz.getTimezoneDiff(new_tzid) - UTC_diff;
                return new Tzdate(new Date(d.valueOf() + (diff * 1000 * 60 * 60)), new_tzid);
            } else {
                throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
            }
        },
        toLocalTimezone: function () {
            var diff,
                Tzdate = require('ripple/platform/tizen/2.0/TZDate'),
                localTzid = time.getLocalTimezone();

            diff = tz.getTimezoneDiff(localTzid) - UTC_diff;
            return new Tzdate(new Date(d.valueOf() + (diff * 1000 * 60 * 60)), localTzid);
        },
        toUTC: function () {
            var Tzdate = require('ripple/platform/tizen/2.0/TZDate');
            return new Tzdate(UTCd, "UTC");
        },
        difference: function (other) {
            var diff,
                TDur = require('ripple/platform/tizen/2.0/TimeDuration');
            if (typeof other !== 'object') {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            diff = (UTCd.valueOf() - _getValue(other));
            return new TDur(diff).difference(new TDur(0));
        },
        equalsTo: function (other) {
            if (typeof other !== 'object') {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            return (UTCd.valueOf() === _getValue(other));
        },
        earlierThan: function (other) {
            if (typeof other !== 'object') {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            return (UTCd.valueOf() < _getValue(other));
        },
        laterThan: function (other) {
            if (typeof other !== 'object') {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            return (UTCd.valueOf() > _getValue(other));
        },
        addDuration: function (dur) {
            var Tzdate = require('ripple/platform/tizen/2.0/TZDate'),
                Tunit = {"MSECS": 1,
                         "SECS": 1000,
                         "MINS": 60 * 1000,
                         "HOURS": 60 * 60 * 1000,
                         "DAYS": 24 * 60 * 60 * 1000
                        };
            if (dur.length === undefined || dur.length === null ||
                dur.unit === undefined || dur.unit === null) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if ((typeof dur.length) !== 'number') {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (Tunit[dur.unit] === undefined) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            return new Tzdate(new Date(d.valueOf() + (dur.length * Tunit[dur.unit])), tzid);
        },
        toLocaleDateString: function () {
            if (d.toString() === "Invalid Date") {
                return d.toString();
            } else {
                return this.toDateString() + " (" + tz.getTimezoneAbbr(tzid) + ")";
            }
        },
        toLocaleTimeString: function () {
            if (d.toString() === "Invalid Date") {
                return d.toString();
            } else {
                return this.toTimeString() + " (" + tz.getTimezoneAbbr(tzid) + ")";
            }
        },
        toLocaleString: function () {
            if (d.toString() === "Invalid Date") {
                return d.toString();
            } else {
                return this.toString() + " (" + tz.getTimezoneAbbr(tzid) + ")";
            }
        },
        toDateString: function () {
            var i, ret = "", fmt = time.getDateFormat();
            if (d.toString() === "Invalid Date") {
                return d.toString();
            }
            for (i = 0; i < fmt.length; i++) {
                switch (fmt.charAt(i)) {
                case 'd':
                    ret = ret + d.getDate();
                    break;
                case 'y':
                    ret = ret + d.getFullYear();
                    break;
                case 'm':
                    ret = ret + (d.getMonth() + 1);
                    break;
                case 'M':
                    ret = ret + _Month[d.getMonth()];
                    break;
                case 'D':
                    ret = ret + _Day[d.getDay()];
                    break;
                default:
                    ret = ret + fmt.charAt(i);
                }
            }
            return ret;
        },
        toTimeString: function () {
            var i, hh, mm, ss, AP,
                ret = "", fmt = time.getTimeFormat();

            if (d.toString() === "Invalid Date") {
                return d.toString();
            }

            if (fmt.search(/ap/) === -1) {
                AP = false;
            } else {
                AP = true;
                if (d.getHours() > 11) {
                    fmt = fmt.replace("ap", "PM");
                } else {
                    fmt = fmt.replace("ap", "AM");
                }
            }
            for (i = 0; i < fmt.length; i++) {
                switch (fmt.charAt(i)) {
                case 'h':
                    hh = d.getHours();
                    if (AP) {
                        hh = (hh > 12) ? hh - 12 : hh;
                    }
                    hh = (hh < 10 ? "0" : "") + hh;
                    ret = ret + hh;
                    break;
                case 'm':
                    mm = d.getMinutes();
                    mm = (mm < 10 ? "0" : "") + mm;
                    ret = ret + mm;
                    break;
                case 's':
                    ss = d.getSeconds();
                    ss = (ss < 10 ? "0" : "") + ss;
                    ret = ret + ss;
                    break;
                default:
                    ret = ret + fmt.charAt(i);
                }
            }
            return ret;
        },
        toString: function () {
            if (d.toString() === "Invalid Date") {
                return d.toString();
            } else {
                return (this.toDateString() + " " + this.toTimeString());
            }
        },
        getTimezoneAbbreviation: function () {
            return tz.getTimezoneAbbr(tzid);
        },
        secondsFromUTC: function () {
            return (-1 * UTC_diff * 60 * 60);
        },
        isDST: function () {
            throw (new WebAPIException(errorcode.NOT_SUPPORTED_ERR));
        },
        getPreviousDSTTransition: function () {
            throw (new WebAPIException(errorcode.NOT_SUPPORTED_ERR));
        },
        getNextDSTTransition: function () {
            throw (new WebAPIException(errorcode.NOT_SUPPORTED_ERR));
        }
    };
};
