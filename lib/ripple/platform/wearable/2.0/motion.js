/*
 *  Copyright 2014 Intel Corporation.
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

var db = require('ripple/db'),
    event = require('ripple/event'),
    t = require('ripple/platform/wearable/2.0/typecast'),
    errorcode = require('ripple/platform/wearable/2.0/errorcode'),
    WebAPIException = require('ripple/platform/wearable/2.0/WebAPIException'),
    WebAPIError = require('ripple/platform/wearable/2.0/WebAPIError'),
    MotionInfo,
    MotionPedometerInfo,
    _security = {
        "http://developer.samsung.com/privilege/healthinfo": ["getMotionInfo",
                "start", "stop"]
    },
    _data = {
        MOTIONINFO: {
            WALKING: {
                // speed(km/h):4.1~5.6, step(f/m): 90~120.
                speed: [4.2, 4.4, 4.5, 4.7, 4.8, 4.9, 5.0, 5.1, 5.3, 5.5],
                frequency: [1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.2, 2.2],
                calorie: [0.04, 0.05 ,0.06 ,0.07, 0.08, 0.09, 0.10, 0.11, 0.12,
                        0.13],
            },
            RUNNING: {
                speed: [17.0, 18.0, 19.0, 20.0, 21.0, 22.0, 23.0, 24.0, 25.0,
                        26.0],
                frequency: [5.2, 5.4, 5.6, 5.8, 6.0, 6.2, 6.4, 6.6, 6.8, 7.0],
                calorie: [0.15, 0.17, 0.19, 0.21, 0.23, 0.25, 0.27, 0.29, 0.31,
                        0.33],
            }
        },
        tMotionStart: null,
        motionInfo: null,
        motionObject: null,
        motionCB: null
    },
    _self;

function _initialize() {
    _data.motionInfo = db.retrieveObject("wearable-motion-data") || {
        stepStatus: "NOT_MOVING",
        speed: 0,
        walkingFrequency: 0,
        cumulativeDistance: 0,
        cumulativeCalorie: 0,
        cumulativeWalkStepCount: 0,
        cumulativeRunStepCount: 0
    };

    _stopMotionCount();
}

function _startMotionCount() {
    var count = 0, status = "WALKING";
    _data.tMotionStart = window.setInterval(function () {
        var index, speed, frequency, distance, calorie,
            walkStepCount, runStepCount;

        if (count === 60) {
            status = (status === "WALKING") ? "RUNNING" : "WALKING";
            count = 0;
        }
        count++;

        index = Math.floor((Math.random() * 4));
        speed = _data.MOTIONINFO[status].speed[index];
        frequency = _data.MOTIONINFO[status].frequency[index];
        distance = _data.MOTIONINFO[status].speed[index] / 3.6;
        calorie = _data.MOTIONINFO[status].calorie[index];
        walkStepCount = _data.MOTIONINFO[status].frequency[index];
        runStepCount = _data.MOTIONINFO[status].frequency[index];


        _data.motionInfo.stepStatus = status;
        _data.motionInfo.speed = speed;
        _data.motionInfo.walkingFrequency = frequency;
        _data.motionInfo.cumulativeDistance += distance;
        _data.motionInfo.cumulativeCalorie += calorie;
        if (status === "WALKING") {
            _data.motionInfo.cumulativeWalkStepCount += walkStepCount;
        }
        if (status === "RUNNING") {
            _data.motionInfo.cumulativeRunStepCount += runStepCount;
        }
        _data.motionInfo.cumulativeTotalStepCount = 
                _data.motionInfo.cumulativeWalkStepCount +
                _data.motionInfo.cumulativeRunStepCount;

        _motionCallback();
        db.saveObject("wearable-motion-data", _data.motionInfo);
        event.trigger("wearable-motion-pedometer-data", [_formatMotionData()]);
    }, 1000);
}

function _formatMotionData() {
    var motionInfo = {}, key;

    function _format(value) {
        return Math.round(value * 100) / 100;
    }

    for (key in _data.motionInfo) {
        if (key === "stepStatus") {
            motionInfo[key] = _data.motionInfo[key];
            continue;
        }
        motionInfo[key] = _format(_data.motionInfo[key]);
    }

    return motionInfo;
}

function _motionCallback() {
    var motionInfo = _formatMotionData(_data.motionInfo);
    _data.motionObject = new MotionPedometerInfo(motionInfo);
    if (_data.motionCB) {
        _data.motionCB(_data.motionObject);
    }
}

function _stopMotionCount() {
    if (_data.tMotionStart) {
        window.clearInterval(_data.tMotionStart);
    }

    _data.motionInfo.speed = 0;
    _data.motionInfo.walkingFrequency = 0;
    _data.motionInfo.stepStatus = "NOT_MOVING";
    event.trigger("wearable-motion-pedometer-data", [_formatMotionData()]);
}

_self = function () {
    var motion;

    function getMotionInfo(type, successCallback, errorCallback) {
        if (!_security.getMotionInfo) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.MotionManager("getMotionInfo", arguments);

        if (type === "WRIST_UP") {
            // Only supports the PEDOMETER type.
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.isMotionStart) {
            throw new WebAPIException(errorcode.SERVICE_NOT_AVAILABLE_ERR);
        }

        window.setTimeout(function () {
            if (!_data.motionInfo) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            successCallback(_data.motionObject);
        }, 1);
    }

    function start(type, successCallback) {
        if (!_security.start) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.MotionManager("start", arguments);

        if (type === "WRIST_UP") {
            // Only supports the PEDOMETER type.
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (_data.isMotionStart)
            return;

        _startMotionCount();
        if (successCallback) {
            _data.motionCB = successCallback;
        }
    }

    function stop(type) {
        if (!_security.stop) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.MotionManager("stop", arguments);

        if (type === "WRIST_UP") {
            // Only supports the PEDOMETER type.
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        _stopMotionCount();
        _data.motionCB = null;
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    motion = {
        getMotionInfo: getMotionInfo,
        start: start,
        stop: stop,
        handleSubFeatures: handleSubFeatures
    };

    return motion;
};

MotionInfo = function () {};

MotionPedometerInfo = function (attributes) {
    var info = {};

    MotionInfo.call(this, attributes);

    info.stepStatus = attributes.stepStatus || "NOT_MOVING";
    info.speed = attributes.speed || 0;
    info.walkingFrequency = attributes.walkingFrequency || 0;
    info.cumulativeDistance = attributes.cumulativeDistance || 0;
    info.cumulativeCalorie = attributes.cumulativeCalorie || 0;
    info.cumulativeTotalStepCount = attributes.cumulativeTotalStepCount || 0;
    info.cumulativeWalkStepCount = attributes.cumulativeWalkStepCount || 0;
    info.cumulativeRunStepCount = attributes.cumulativeRunStepCount || 0;

    this.__defineGetter__("stepStatus", function () {
        return info.stepStatus;
    });

    this.__defineGetter__("speed", function () {
        return info.speed;
    });

    this.__defineGetter__("walkingFrequency", function () {
        return info.walkingFrequency;
    });

    this.__defineGetter__("cumulativeDistance", function () {
        return info.cumulativeDistance;
    });

    this.__defineGetter__("cumulativeCalorie", function () {
        return info.cumulativeCalorie;
    });

    this.__defineGetter__("cumulativeTotalStepCount", function () {
        return info.cumulativeTotalStepCount;
    });

    this.__defineGetter__("cumulativeWalkStepCount", function () {
        return info.cumulativeWalkStepCount;
    });

    this.__defineGetter__("cumulativeRunStepCount", function () {
        return info.cumulativeRunStepCount;
    });
};

_initialize();

module.exports = _self;
