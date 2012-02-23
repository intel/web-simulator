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

var _self,
    _timezone_data = {
    "Asia/Tokyo": {diff: 9, abbr: "JST"},
    "Asia/Beijing": {diff: 8, abbr: "CST"},
    "Asia/Seoul": {diff: 9, abbr: "KST"},
    "Asia/Singapore": {diff: 8, abbr: "SGT"},
    "Afirca/Egypt/Cairo": {diff: 2, abbr: "EET"},
    "America/Argentina/Buenos_Aires": {diff: -3, abbr: "ART"},
    "America/Chicago": {diff: -6, abbr: "CST"},
    "America/New_York": {diff: -5, abbr: "EST"},
    "America/Portland": {diff: -8, abbr: "PST"},
    "Australia/Sydney": {diff: 10, abbr: "EST"},
    "Europe/Bucharest": {diff: 2, abbr: "EET"},
    "Europe/France/Paris": {diff: 1, abbr: "CET"},
    "Europe/London": {diff: 0, abbr: "WET"},
    "UTC": {diff: 0, abbr: "UTC"}
};

module.exports = {
    getAllTimezone: function () {
        var i, ret = [];
        for (i in _timezone_data)
            ret.push(i);
        return ret;
    },
    getTimezoneDiff: function (zone) {
        return _timezone_data[zone].diff;
    },
    getTimezoneAbbr: function (zone) {
        return _timezone_data[zone].abbr;
    },
    isValidTimezone: function (zone) {
        return (_timezone_data[zone] === undefined) ? false:true;
    }
};

