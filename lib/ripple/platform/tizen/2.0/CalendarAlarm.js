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
    TZDate = require('ripple/platform/tizen/2.0/TZDate'),
    TimeDuration = require('ripple/platform/tizen/2.0/TimeDuration'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    _alarmMethods = ["SOUND", "DISPLAY"];

function CalendarAlarm (triggerTime, method, description) {
    var absoluteDate = null,
        before = null,
        isValid = false,
        _self = this;

    if (triggerTime instanceof TZDate) {
        absoluteDate = triggerTime;
    } else if (triggerTime instanceof TimeDuration) {
        before = triggerTime;
    } else {
        throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }

    isValid = utils.arrayContains(_alarmMethods, method);
    if (!isValid)
        throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

    _self.absoluteDate = absoluteDate;
    _self.before       = before;
    _self.method       = method;
    _self.description  = description || "";

    return _self;
}

module.exports = CalendarAlarm;
