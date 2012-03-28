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

// This is compatible with HTML 4.0 event listener
// TODO: Add HTML 5.0 event listener implementation

function _bind(name, win) {
    var callback = null;

    return {
        set: function (value) {
            callback = value;
        },
        exec: function (arg) {
            return callback && callback(arg);
        },
        unbind: function (cb) {
            callback = cb === callback ? null : callback;
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
                var node = jQuery("#" + constants.COMMON.VIEWPORT_CONTAINER),
                    hidden = on;

                if (on) {
                    ui.showOverlay("lock-screen-window", function (background) {});
                } else {
                    ui.hideOverlay("lock-screen-window", function (background) {});
                }

                widgetDocument.hidden = hidden;
                widgetDocument.visibilityState = hidden ? widgetDocument.PAGE_HIDDEN : widgetDocument.PAGE_VISIBLE;
            }

            function _isLockScreenOn() {
                return deviceSettings.retrieve("Config.lockScreen");
            }

            _lockScreen(_isLockScreenOn());

            _pageVisibility = _bind("visibilitychange");

            widgetDocument.addEventListener = function (event, callback, useCapture) {
                switch (event) {
                case "visibilitychange":
                    _pageVisibility.set(callback);
                    break;

                default:
                    add.apply(widgetDocument, arguments);
                    break;
                }
            };

            widgetDocument.removeEventListener = function (event, callback) {
                _pageVisibility.unbind(callback);
                remove.apply(widgetDocument, arguments);
            };

            event.on("LockScreenChanged", function (on) {
                _lockScreen(on);
                _pageVisibility.exec();
            });
        });
    }
};

module.exports = _self;
