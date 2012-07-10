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
    Event = require('ripple/platform/tizen/1.0/EventBase');

module.exports = function () {
    var _self = {
            acceleration: {
                x: null,
                y: null,
                z: null
            },
            accelerationIncludingGravity: {
                x: null,
                y: null,
                z: null
            },
            rotationRate: {
                alpha: null,
                beta: null,
                gamma: null
            },
            interval: 0
        };

    Event.call(this);

    this.__defineGetter__("acceleration", function () {
        return _self.acceleration;
    });

    this.__defineGetter__("accelerationIncludingGravity", function () {
        return _self.accelerationIncludingGravity;
    });

    this.__defineGetter__("rotationRate", function () {
        return _self.rotationRate;
    });

    this.__defineGetter__("interval", function () {
        return _self.interval;
    });

    this.initAccelerometerEvent = function (accelerometerType, accelerometerBubbles, accelerometerCancelable,
                                            accelerationData, accelerationGData, rotationRateData, intervalValue) {
        this.initEvent(accelerometerType, accelerometerBubbles, accelerometerCancelable);

        _self.acceleration = utils.copy(accelerationData);
        _self.accelerationIncludingGravity = utils.copy(accelerationGData);
        _self.rotationRate = utils.copy(rotationRateData);
        _self.interval = intervalValue;
    };
};

