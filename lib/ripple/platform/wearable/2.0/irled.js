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

var t = require('ripple/platform/wearable/2.0/typecast'),
    event = require('ripple/event'),
    errorcode = require('ripple/platform/wearable/2.0/errorcode'),
    WebAPIException = require('ripple/platform/wearable/2.0/WebAPIException'),
    _security = {
        "http://developer.samsung.com/privilege/irled": ["send"]
    },
    _self;

_self = function () {
    var irled;

    function send(data, successCallback, errorCallback) {
        if (!_security.send) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.IrLedManager("send", arguments);

        window.setTimeout(function () {
            event.trigger("irled-send-data", [data]);

            if (successCallback) {
                successCallback();
            }
        }, 1);
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    irled = {
        send: send,
        handleSubFeatures: handleSubFeatures
    };

    return irled;
};

module.exports = _self;
