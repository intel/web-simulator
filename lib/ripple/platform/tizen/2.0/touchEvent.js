/*
 *  Copyright 2012 Intel Corporation
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

var emulatorBridge = require('ripple/emulatorBridge'),
    event = require('ripple/event'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    Touch,
    TouchList,
    TouchEvent,
    _touchCanvasElements = [],
    _dataEnlargeRatio = 4,
    _self;

function _isValidTouch(touches) {
    var touche, _touches = [], i;
    if (!touches) {
        return false;
    }
    if (!tizen1_utils.isValidArray(touches)) {
        _touches = [touches];
    }

    for (i = 0; i < _touches.length; i++) {
        touche = _touches[i];
        if ((touche !== undefined) &&
            ((typeof touche !== "object") ||
            (typeof touche.target !== "object") ||
            (touche.identifier !== undefined) && (typeof touche.identifier !== "number") ||
            (touche.screenX !== undefined) && (typeof touche.screenX !== "number") ||
            (touche.screenY !== undefined) && (typeof touche.screenY !== "number") ||
            (touche.clientX !== undefined) && (typeof touche.clientX !== "number") ||
            (touche.clientY !== undefined) && (typeof touche.clientY !== "number") ||
            (touche.pageX !== undefined) && (typeof touche.pageX !== "number") ||
            (touche.pageY !== undefined) && (typeof touche.pageY !== "number")))
            return false;
    }
    return true;
}

function _dispatchAllEvents(event) {
    _touchCanvasElements.forEach(function (value) {
        if (value !== undefined) {
            value.dispatchEvent(event);
        }
    });
}

function _touchMove(event) {
    var data = event.data,
        touches = [],
        removedTouches = [],
        touchList,
        simulatedEvent,
        dataId,
        ids = [],
        intervalId,
        currentIndex,
        item = {};

    if (_touchCanvasElements.length === 0)
        return;

    for (dataId in data) {
        if (!data[dataId].length || data[dataId].length === 0)
            return;

        ids.push(dataId);
        item = data[dataId][0];
        touches.push(new Touch(item.target, dataId, item.pageX * _dataEnlargeRatio, item.pageY * _dataEnlargeRatio, item.screenX * _dataEnlargeRatio,
                               item.screenY * _dataEnlargeRatio, item.offsetX * _dataEnlargeRatio, item.offsetY * _dataEnlargeRatio));
    }

    // touch start
    touchList = new TouchList(touches);
    simulatedEvent = new TouchEvent("touchstart", true, true, touchList, touchList, touchList, event.altKey, event.metaKey, event.ctrlKey, event.shiftKey);
    _dispatchAllEvents(simulatedEvent);
    currentIndex = 0;

    // touch move and touch end
    intervalId = setInterval(function () {
        touches = [];
        removedTouches = [];

        ids.forEach(function (id) {
            var points = data[id],
                touchItem, removedItem;

            if (currentIndex < points.length) {
                touchItem = points[currentIndex];
            } else {
                removedItem = points[points.length - 1];
            }

            if (touchItem)
                touches.push(new Touch(touchItem.target, id, touchItem.pageX * _dataEnlargeRatio, touchItem.pageY * _dataEnlargeRatio, touchItem.screenX * _dataEnlargeRatio,
                                       touchItem.screenY * _dataEnlargeRatio, touchItem.offsetX * _dataEnlargeRatio, touchItem.offsetY * _dataEnlargeRatio));
            if (removedItem)
                removedTouches.push(new Touch(removedItem.target, id, removedItem.pageX * _dataEnlargeRatio, removedItem.pageY * _dataEnlargeRatio, removedItem.screenX * _dataEnlargeRatio,
                                    removedItem.screenY * _dataEnlargeRatio, removedItem.offsetX * _dataEnlargeRatio, removedItem.offsetY * _dataEnlargeRatio));
        });

        if (touches.length > 0) {
            simulatedEvent = new TouchEvent("touchmove", true, true, new TouchList(touches), new TouchList(touches), new TouchList(touches),
                event.altKey, event.metaKey, event.ctrlKey, event.shiftKey);
            _dispatchAllEvents(simulatedEvent);
        } else {
            clearInterval(intervalId);
        }

        if (removedTouches.length > 0) {
            simulatedEvent = new TouchEvent("touchend", true, true, new TouchList(removedTouches), new TouchList(removedTouches), new TouchList(removedTouches),
                event.altKey, event.metaKey, event.ctrlKey, event.shiftKey);
            _dispatchAllEvents(simulatedEvent);
        }
        currentIndex++;
    }, 50);
}

function _touchCancel(event) {
    var mousedownEvent = event.touchEvent,
        simulatedEvent;

    simulatedEvent = new TouchEvent("touchcancel", true, true, new TouchList([]), new TouchList([]), new TouchList([]),
        event.altKey, event.metaKey, event.ctrlKey, event.shiftKey);
    _dispatchAllEvents(simulatedEvent);
}

function _initialize() {
    event.on("touchCancel", _touchCancel);
    event.on("touchEvent", _touchMove);
}

Touch = function (target, identifier, pageX, pageY, screenX, screenY, clientX, clientY) {
    var _identifier = Number(identifier) || 0,
        _screenX = Number(screenX) || 0,
        _screenY = Number(screenY) || 0,
        _clientX = Number(clientX) || 0,
        _clientY = Number(clientY) || 0,
        _pageX = Number(pageX) || 0,
        _pageY = Number(pageY) || 0;

    this.__defineGetter__("identifier", function () {
        return _identifier;
    });
    this.__defineGetter__("target", function () {
        return target;
    });
    this.__defineGetter__("screenX", function () {
        return _screenX;
    });
    this.__defineGetter__("screenY", function () {
        return _screenY;
    });
    this.__defineGetter__("clientX", function () {
        return _clientX;
    });
    this.__defineGetter__("clientY", function () {
        return _clientY;
    });
    this.__defineGetter__("pageX", function () {
        return _pageX;
    });
    this.__defineGetter__("pageY", function () {
        return _pageY;
    });
};

TouchList = function (touches) {
    var _touches = _isValidTouch(touches) ? tizen1_utils.copy(touches) : [],
        i, _self;

    _self = {
        item : function (index) {
            if (typeof index !== "number") {
                return null;
            }
            if (index.toString().indexOf(".") !== -1) {
                return null;
            }
            if (/^\\d+$/.test(index) || index >= _touches.length) {
                return null;
            }
            if (!_touches) {
                return null;
            }
            return _touches[index];
        },

        identifiedTouch : function (identifier) {
            if (typeof identifier !== "number") {
                return null;
            }
            if (!_touches) {
                return null;
            }
            for (var i in _touches) {
                if (_touches[i].identifier === identifier) {
                    return _touches[i];
                }
            }
            return null;
        }
    };

    for (i = 0; i < _touches.length; i++) {
        _self.__defineGetter__(i, (function (index) {
            return function () {
                return _touches[index];
            };
        }(i)));
    }

    _self.__defineGetter__("length", function () {
        return _touches.length;
    });

    return _self;
};

TouchEvent = function (type, canBubble, cancelable, touches, targetTouches, changedTouches, altKey, metaKey, ctrlKey, shiftKey) {
    var touchEvent = emulatorBridge.document().createEvent("UIEvents");
    touchEvent.initUIEvent(type, canBubble, cancelable, emulatorBridge.window(), 1);

    touchEvent.__defineGetter__("touches", function () {
        return touches;
    });
    touchEvent.__defineGetter__("targetTouches", function () {
        return targetTouches;
    });
    touchEvent.__defineGetter__("changedTouches", function () {
        return changedTouches;
    });
    touchEvent.__defineGetter__("altKey", function () {
        return altKey;
    });
    touchEvent.__defineGetter__("metaKey", function () {
        return metaKey;
    });
    touchEvent.__defineGetter__("ctrlKey", function () {
        return ctrlKey;
    });
    touchEvent.__defineGetter__("shiftKey", function () {
        return shiftKey;
    });
    return touchEvent;
};

_self = {
    mask: function (frame) {
        frame.addEventListener("DOMContentLoaded", function () {
            /*
            var widgetDocument = frame.contentDocument,
                getElementByIdOri = widgetDocument.getElementById;

            widgetDocument.getElementById = function () {
                var element, addEventListenerOri;

                element = getElementByIdOri.apply(widgetDocument, Array.prototype.slice.call(arguments));

                if (element) {
                    addEventListenerOri = element.addEventListener;
                    element.addEventListener = function (event, callback, useCapture) {
                        if (event === "touchstart") {
                            _touchCanvasElements.push(element);
                        }
                        addEventListenerOri.apply(element, arguments);
                    };
                }
                return element;
            };

            widgetDocument.createTouch = function (view, target, identifier, pageX, pageY, screenX, screenY) {
                return new Touch(view, target, identifier, pageX, pageY, screenX, screenY);
            };

            widgetDocument.createTouchList = function (pattern) {
                if (arguments.length !== 1) {
                    return null;
                }
                return new TouchList(pattern);
            };
            */
        });
    }
};

_initialize();

module.exports = _self;
