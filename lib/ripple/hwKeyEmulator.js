/*
 *  Copyright 2011 Research In Motion Limited.
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
   _self;

function _HWKeyEvent(keyName) {
    var doc = document.getElementById('document').contentDocument,
    event;

    event = doc.createEvent('Event');
    event.initEvent("tizenhwkey", true, false);
    event.__defineGetter__("keyName", function () {
        return keyName;
    });
    doc.dispatchEvent(event);
}


_self = {
    init: function (win, doc) {
        event.clear("tizenhwkeyEvent");
        event.on("tizenhwkeyEvent", function (keyName) {
            _HWKeyEvent(keyName);
        });
    }
};

module.exports = _self;
