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

var TZDate = require('ripple/platform/tizen/2.0/TZDate'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    db = require('ripple/db'),
    tz = require('ripple/platform/tizen/2.0/timezone_info'),
    _timeFormat = "h:m:s ap", _shortDateFormat = "d/m/y",
    _longDateFormat = "D, M d y", _self;

_self = {
    getCurrentDateTime: function () {
        return new TZDate();
    },
    setCurrentDateTime: function (dt) {
        throw new WebAPIError(errorcode.NOT_SUPPORTED_ERR);
    },
    getLocalTimezone: function () {
        var tz = db.retrieve("tizen-timezone") || "Coordinated Universal Time";
        return tz;
    },
    getAvailableTimezones: function () {
        var ret = tz.getAllTimezone();
        return ret;
    },
    getDateFormat: function (shortformat) {
        if (shortformat !== undefined && shortformat !== null &&
            typeof shortformat !== 'boolean') {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }
        if (shortformat) {
            return _shortDateFormat;
        } else {
            return _longDateFormat;
        }
    },
    getTimeFormat: function () {
        return _timeFormat;
    },
    isLeapYear: function (year) {
        if (typeof year !== 'number') {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }
        return ((year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0));
    }
};

module.exports = _self;
