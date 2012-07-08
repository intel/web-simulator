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

module.exports = function () {
    var _self = {
        CAPTURING_PHASE: 1,
        AT_TARGET:  2,
        BUBBLING_PHASE: 3,

        type: '',
        target: null, //new EventTarget(),
        currentTarget: null, //new EventTarget(),
        eventPhase: 0,
        bubbles: false,
        cancelable: false,
        timeStamp: 0
    };

    this.__defineGetter__("type", function () {
        return _self.type;
    });

    this.__defineGetter__("target", function () {
        return _self.target;
    });

    this.__defineGetter__("currentTarget", function () {
        return _self.currentTarget;
    });

    this.__defineGetter__("eventPhase", function () {
        return _self.eventPhase;
    });

    this.__defineGetter__("bubbles", function () {
        return _self.bubbles;
    });

    this.__defineGetter__("cancelable", function () {
        return _self.cancelable;
    });

    this.__defineGetter__("timeStamp", function () {
        return _self.timeStamp;
    });

    this.stopPropagation = function () {};

    this.preventDefault = function () {};

    this.initEvent = function (eventTypeArg, canBubbleArg, cancelableArg) {
        _self.type = eventTypeArg;
        _self.bubbles = canBubbleArg;
        _self.cancelable = cancelableArg;

        _self.timeStamp = (new Date()).getTime();
    };

    return _self;
};

