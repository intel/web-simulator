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

var t = require('ripple/platform/tizen/2.0/typecast'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    TimeDuration;

TimeDuration = function (_length, _unit) {
    var timeDuration = {},
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
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            } else {
                return TimeDurationUnit[unit];
            }
        };

    t.TimeDuration(arguments, this);

    this.__defineGetter__("length", function () {
        return timeDuration.length;
    });
    this.__defineSetter__("length", function (val) {
        try {
            timeDuration.length = t.double(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("unit", function () {
        return timeDuration.unit;
    });
    this.__defineSetter__("unit", function (val) {
        try {
            timeDuration.unit = t.TimeDurationUnit(val);
        } catch (e) {
        }
    });

    timeDuration.length = _length;
    timeDuration.unit = _unit || "MSECS";

    this.difference = function (o) {
        if (typeof o !== 'object' || o === null || o === undefined) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (o.length === undefined || o.length === null ||
                o.unit === undefined || o.unit === null) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((typeof o.length) !== 'number') {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (TimeDurationUnit[o.unit] === undefined) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        var thisMS = timeDuration.length * _toMSECS(timeDuration.unit),
            otherMS = o.length * _toMSECS(o.unit);
        return _simplifyDuration(thisMS - otherMS);
    };
    this.equalsTo = function (o) {
        if (typeof o !== 'object' || o === null || o === undefined) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (o.length === undefined || o.length === null ||
                o.unit === undefined || o.unit === null) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((typeof o.length) !== 'number') {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (TimeDurationUnit[o.unit] === undefined) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        var thisMS = timeDuration.length * _toMSECS(timeDuration.unit),
            otherMS = o.length * _toMSECS(o.unit);
        return (thisMS === otherMS);
    };
    this.lessThan = function (o) {
        if (typeof o !== 'object' || o === null || o === undefined) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (o.length === undefined || o.length === null ||
                o.unit === undefined || o.unit === null) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((typeof o.length) !== 'number') {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (TimeDurationUnit[o.unit] === undefined) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        var thisMS = timeDuration.length * _toMSECS(timeDuration.unit),
            otherMS = o.length * _toMSECS(o.unit);
        return (thisMS < otherMS);
    };
    this.greaterThan = function (o) {
        if (typeof o !== 'object' || o === null || o === undefined) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (o.length === undefined || o.length === null ||
                o.unit === undefined || o.unit === null) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((typeof o.length) !== 'number') {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (TimeDurationUnit[o.unit] === undefined) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        var thisMS = timeDuration.length * _toMSECS(timeDuration.unit),
            otherMS = o.length * _toMSECS(o.unit);
        return (thisMS > otherMS);
    };
};

module.exports = TimeDuration;
