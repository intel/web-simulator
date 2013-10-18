/*
 *  Copyright 2013 Intel Corporation.
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
    ApplicationControlData;

ApplicationControlData = function (key, value) {
    var applicationControlData = {};

    t.ApplicationControlData(arguments, this);

    applicationControlData.key   = key;
    applicationControlData.value = value;

    this.__defineGetter__("key", function () {
        return applicationControlData.key;
    });
    this.__defineSetter__("key", function (val) {
        try {
            applicationControlData.key = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("value", function () {
        return applicationControlData.value;
    });
    this.__defineSetter__("value", function (val) {
        try {
            applicationControlData.value = t.DOMString(val, '[]');
        } catch (e) {
        }
    });
};

module.exports = ApplicationControlData;
