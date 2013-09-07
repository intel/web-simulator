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

function TZDate (dt) {
    var d, UTCd, UTC_diff, tzid = "", target_diff, temp_date, localeTime_fmt = 'h:m:s', localeDate_fmt = 'D, d M y',
    time = require('ripple/platform/tizen/2.0/time'),
        hour = arguments[3] || 0, min = arguments[4] || 0,
        sec = arguments[5] || 0, msec = arguments[6] || 0,

    _checkTZDate = function (dat) {
        var Tzdate = require('ripple/platform/tizen/2.0/TZDate'),
            i, tzd;
        if (typeof dat !== 'object' || dat === undefined || dat === null) {
            return false;
        }
        tzd = new Tzdate();
        for (i in tzd) {
            if (dat.hasOwnProperty(i) === false) {
                return false;
            }
        }
        return true;
    },
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
    _formatDateString = function (fmt) {
        var i, ret = '';
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
    _formatTimeString = function (fmt) {
        var i, hh, mm, ss, AP, ret = "";
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
    };

    if (arguments[7] !== undefined) {
        tzid = arguments[7];
    }

    if (dt === null || dt === undefined) {
        temp_date = new Date();
        if (arguments[1] !== undefined) {
            if (typeof arguments[1] !== 'string') {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (tz.isValidTimezone(arguments[1]) === false) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            tzid = arguments[1];
        } else {
            tzid = time.getLocalTimezone();
        }
        target_diff = tz.getTimezoneDiff(tzid);
        d = new Date(temp_date.valueOf() + (target_diff + temp_date.getTimezoneOffset() / 60) * 1000 * 60 * 60);
    } else {
        if (tizen1_utils.isValidDate(dt)) {
            d = new Date(dt);
            if (arguments[1] !== undefined) {
                tzid = arguments[1];
            } else {
                tzid = time.getLocalTimezone();
            }
        } else {
            if (arguments.length === 1) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            } else {
                d = new Date(arguments[0], arguments[1], arguments[2], hour, min, sec, msec);
            }
        }
    }

    if (tz.isValidTimezone(tzid) === false) {
        tzid = 'UTC';
    }
    UTC_diff = tz.getTimezoneDiff(tzid);
    _d2UTCd_sync();

    this.getDate = function () {
        return d.getDate();
    };
    this.setDate = function (dt) {
        d.setDate(dt);
        _d2UTCd_sync();
    };
    this.getDay = function () {
        return d.getDay();
    };
    this.getFullYear = function () {
        return d.getFullYear();
    };
    this.setFullYear = function (yr) {
        d.setFullYear(yr);
        _d2UTCd_sync();
    };
    this.getHours = function () {
        return d.getHours();
    };
    this.setHours = function (hr) {
        d.setHours(hr);
        _d2UTCd_sync();
    };
    this.getMilliseconds = function () {
        return d.getMilliseconds();
    };
    this.setMilliseconds = function (msec) {
        d.setMilliseconds(msec);
        _d2UTCd_sync();
    };
    this.getMinutes = function () {
        return d.getMinutes();
    };
    this.setMinutes = function (min) {
        d.setMinutes(min);
        _d2UTCd_sync();
    };
    this.getMonth = function () {
        return d.getMonth();
    };
    this.setMonth = function (m) {
        d.setMonth(m);
        _d2UTCd_sync();
    };
    this.getSeconds = function () {
        return d.getSeconds();
    };
    this.setSeconds = function (s) {
        d.setSeconds(s);
        _d2UTCd_sync();
    };
    this.getUTCDate = function () {
        return UTCd.getDate();
    };
    this.setUTCDate = function (dt) {
        UTCd.setDate(dt);
        _UTCd2d_sync();
    };
    this.getUTCDay = function () {
        return UTCd.getDay();
    };
    this.getUTCFullYear = function () {
        return UTCd.getFullYear();
    };
    this.setUTCFullYear = function (yr) {
        UTCd.setFullYear(yr);
        _UTCd2d_sync();
    };
    this.getUTCHours = function () {
        return UTCd.getHours();
    };
    this.setUTCHours = function (hr) {
        UTCd.setHours(hr);
        _UTCd2d_sync();
    };
    this.getUTCMilliseconds = function () {
        return UTCd.getMilliseconds();
    };
    this.setUTCMilliseconds = function (msec) {
        UTCd.setMilliseconds(msec);
        _UTCd2d_sync();
    };
    this.getUTCMinutes = function () {
        return UTCd.getMinutes();
    };
    this.setUTCMinutes = function (min) {
        UTCd.setMinutes(min);
        _UTCd2d_sync();
    };
    this.getUTCMonth = function () {
        return UTCd.getMonth();
    };
    this.setUTCMonth = function (m) {
        UTCd.setMonth(m);
        _UTCd2d_sync();
    };
    this.getUTCSeconds = function () {
        return UTCd.getSeconds();
    };
    this.setUTCSeconds = function (s) {
        UTCd.setSeconds(s);
        _UTCd2d_sync();
    };
    this.getTimezone = function () {
        return tzid;
    };
    this.toTimezone = function (new_tzid) {
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
    };
    this.toLocalTimezone = function () {
        var diff,
            localTzid,
            Tzdate = require('ripple/platform/tizen/2.0/TZDate');
        localTzid = time.getLocalTimezone();

        diff = tz.getTimezoneDiff(localTzid) - UTC_diff;
        return new Tzdate(new Date(d.valueOf() + (diff * 1000 * 60 * 60)), localTzid);
    };
    this.toUTC = function () {
        var Tzdate = require('ripple/platform/tizen/2.0/TZDate');
        return new Tzdate(UTCd, "UTC");
    };
    this.difference = function (other) {
        var diff,
            TDur = require('ripple/platform/tizen/2.0/TimeDuration');
        if (_checkTZDate(other) === false) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        diff = (UTCd.valueOf() - _getValue(other));
        if (diff % 86400000 === 0) {
            return new TDur(diff/86400000, 'DAYS');
        } else {
            return new TDur(diff);
        }
    };
    this.equalsTo = function (other) {
        if (_checkTZDate(other) === false) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        return (UTCd.valueOf() === _getValue(other));
    };
    this.earlierThan = function (other) {
        if (_checkTZDate(other) === false) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        return (UTCd.valueOf() < _getValue(other));
    };
    this.laterThan = function (other) {
        if (_checkTZDate(other) === false) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        return (UTCd.valueOf() > _getValue(other));
    };
    this.addDuration = function (dur) {
        var Tzdate = require('ripple/platform/tizen/2.0/TZDate'),
            Tunit = {"MSECS": 1,
                "SECS": 1000,
                "MINS": 60 * 1000,
                "HOURS": 60 * 60 * 1000,
                "DAYS": 24 * 60 * 60 * 1000
            };
        if (typeof dur !== 'object' || dur === undefined || dur === null) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
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
        return new Tzdate(new Date(d.valueOf() + (parseInt(dur.length, 10) * Tunit[dur.unit])), tzid);
    };
    this.toLocaleDateString = function () {
        if (d.toString() === "Invalid Date") {
            return d.toString();
        } else {
            return _formatDateString(localeDate_fmt);
        }
    };
    this.toLocaleTimeString = function () {
        if (d.toString() === "Invalid Date") {
            return d.toString();
        } else {
            return _formatTimeString(localeTime_fmt);
        }
    };
    this.toLocaleString = function () {
        if (d.toString() === "Invalid Date") {
            return d.toString();
        } else {
            return (this.toLocaleDateString() + " " + this.toLocaleTimeString());
        }
    };
    this.toDateString = function () {
        var ret = "", fmt = time.getDateFormat();
        if (d.toString() === "Invalid Date") {
            return d.toString();
        }
        ret = _formatDateString(fmt);
        return ret;
    };
    this.toTimeString = function () {
        var ret, fmt = time.getTimeFormat();

        if (d.toString() === "Invalid Date") {
            return d.toString();
        }

        ret = _formatTimeString(fmt);
        if (tz.getTimezoneDesc(tzid) !== null) {
            return ret + " " + tz.getTimezoneDesc(tzid);
        } else {
            return ret + " " + tz.getTimezoneAbbr(tzid);
        }
        return ret;
    };
    this.toString = function () {
        if (d.toString() === "Invalid Date") {
            return d.toString();
        } else {
            return (this.toDateString() + " " + this.toTimeString());
        }
    };
    this.getTimezoneAbbreviation = function () {
        return tz.getTimezoneAbbr(tzid);
    };
    this.secondsFromUTC = function () {
        return (-1 * UTC_diff * 60 * 60);
    };
    this.isDST = function () {
        throw (new WebAPIException(errorcode.NOT_SUPPORTED_ERR));
    };
    this.getPreviousDSTTransition = function () {
        throw (new WebAPIException(errorcode.NOT_SUPPORTED_ERR));
    };
    this.getNextDSTTransition = function () {
        throw (new WebAPIException(errorcode.NOT_SUPPORTED_ERR));
    };
    return this;
}

module.exports = TZDate;
