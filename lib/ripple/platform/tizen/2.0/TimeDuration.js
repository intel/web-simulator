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
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError');

module.exports = function (l, u) {
    var _length, _unit,
        TimeDurationUnit = {"MSECS": 1,
                            "SECS": 1000,
                            "MINS": 60 * 1000,
                            "HOURS": 60 * 60 * 1000,
                            "DAYS": 24 * 60 * 60 * 1000
                           },
        _simplifyDuration = function (ms) {
            var TDur = require('ripple/platform/tizen/2.0/TimeDuration'),
                uni = "MSECS";
            if ((ms % 1000) === 0) {
                ms = ms / 1000;
                uni = "SECS";
                if ((ms % 60) === 0) {
                    ms = ms / 60;
                    uni = "MINS";
                    if ((ms % 60) === 0) {
                        ms = ms / 60;
                        uni = "HOURS";
                        if ((ms % 24) === 0) {
                            ms = ms / 24;
                            uni = "DAYS";
                        }
                    }
                }
            }
            return (new TDur(ms, uni));
        },
        _toMSECS = function (unit) {
            if (TimeDurationUnit[unit] === undefined) {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            } else {
                return TimeDurationUnit[unit];
            }
        };

    _length = l || 0;
    if ((u !== undefined) && (u !== null)) {
        if (TimeDurationUnit[u] === undefined) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        } else {
            _unit = u;
        }
    } else {
        _unit = "MSECS";
    }
    return {
        length: _length,
        unit: _unit,
        difference: function (o) {
            var thisMS = _length * _toMSECS(_unit),
                otherMS = o.length * _toMSECS(o.unit);
            return _simplifyDuration(thisMS - otherMS);
        },
        equalsTo: function (o) {
            var thisMS = _length * _toMSECS(_unit),
                otherMS = o.length * _toMSECS(o.unit);
            return (thisMS === otherMS);
        },
        lessThan: function (o) {
            var thisMS = _length * _toMSECS(_unit),
                otherMS = o.length * _toMSECS(o.unit);
            return (thisMS < otherMS);
        },
        greaterThan: function (o) {
            var thisMS = _length * _toMSECS(_unit),
                otherMS = o.length * _toMSECS(o.unit);
            return (thisMS > otherMS);
        }
    };
};
