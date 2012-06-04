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

var Event = require('ripple/platform/tizen/1.0/EventBase');

module.exports = function () {
    var _self = {
            alpha: null,
            beta: null,
            gamma: null,
            absolute: false,
        };

    Event.call(this);

    this.__defineGetter__("alpha", function () {
        return _self.alpha;
    });

    this.__defineGetter__("beta", function () {
        return _self.beta;
    });

    this.__defineGetter__("gamma", function () {
        return _self.gamma;
    });

    this.__defineGetter__("absolute", function () {
        return _self.absolute;
    });

    this.initDeviceOrientationEvent = function (orientationType, orientationBubbles, orientationCancelable,
                                               alphaData, betaData, gammaData, isAbsolute) {
        this.initEvent(orientationType, orientationBubbles, orientationCancelable);

        _self.alpha    = alphaData;
        _self.beta     = betaData;
        _self.gamma    = gammaData;
        _self.absolute = isAbsolute;
    };
};

