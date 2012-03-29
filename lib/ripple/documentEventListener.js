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

var event = require('ripple/event'),
    constants = require('ripple/constants'),
    deviceSettings = require('ripple/deviceSettings'),
    ui = require('ripple/ui'),
    _self;

function _bind(name) {
    var _listeners = [];

    return {
        add: function (callback, useCapture) {
            // ignore non-function
            if (typeof callback === "function") {
                // ignore useCapture as we could not handle it
                if (!useCapture) {
                    if (!_listeners.some(function (listener) {
                        return (listener === callback);
                    })) {
                        _listeners.push(callback);
                    }
                }
            }
        },
        exec: function (arg) {
            _listeners.forEach(function (listener) {
                listener(arg);
            });
        },
        remove: function (callback, useCapture) {
            // ignore non-function
            if (typeof callback === "function") {
                // ignore useCapture as we do not add them into _listeners
                if (!useCapture) {
                    _listeners = _listeners.filter(function (listener) {
                        return (listener !== callback);
                    });
                }
            }
        }
    };
}

_self = {
    mask: function (frame) {
        /* 
         * The current issue is that "document.addEventListener(visibilitychange, function(){...})" 
         * does not work if it is invoked in the document.DOMContentLoaded listeners, for example, at 
         * JQuery(document).ready function.

         * The reason is that window.DOMContentLoaded is fired after the document.DOMContentLoaded. 
         * Currently we have not found a proper event to override the document.addEventListener. 
         * The beforeload is fine for window.addEventListener, while does not work for document.addEventListener 
         * because the contentDocument will be reset after loading. 
         */
        frame.contentWindow.addEventListener("DOMContentLoaded", function () {
            var widgetDocument = frame.contentDocument,
                _pageVisibility,
                add = widgetDocument.addEventListener,
                remove = widgetDocument.removeEventListener;

            widgetDocument.PAGE_HIDDEN  = "hidden";
            widgetDocument.PAGE_VISIBLE = "visible";
            widgetDocument.PAGE_PREVIEW = "preview";

            function _lockScreen(on) {
                var hidden = on;

                if (on) {
                    ui.showOverlay("lock-screen-window", function (background) {});
                } else {
                    ui.hideOverlay("lock-screen-window", function (background) {});
                }

                event.trigger("visibilitychange", [hidden]);
            }

            function _isLockScreenOn() {
                return deviceSettings.retrieve("Config.lockScreen");
            }

            _lockScreen(_isLockScreenOn());

            _pageVisibility = _bind("visibilitychange");

            widgetDocument.addEventListener = function (event, callback, useCapture) {
                switch (event) {
                case "visibilitychange":
                    _pageVisibility.add(callback, useCapture);
                    break;

                default:
                    add.apply(widgetDocument, arguments);
                    break;
                }
            };

            widgetDocument.removeEventListener = function (event, callback, useCapture) {
                _pageVisibility.remove(callback, useCapture);
                remove.apply(widgetDocument, arguments);
            };

            event.on("LockScreenChanged", function (on) {
                _lockScreen(on);
            });

            event.on("visibilitychange", function (hidden) {
                widgetDocument.hidden = hidden;
                widgetDocument.visibilityState = hidden ? widgetDocument.PAGE_HIDDEN : widgetDocument.PAGE_VISIBLE;
                _pageVisibility.exec();
            });
        });
    }
};

module.exports = _self;
