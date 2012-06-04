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

var TZDate = require('ripple/platform/tizen/1.0/TZDate'),
    CalendarItem = require('ripple/platform/tizen/1.0/CalendarItem'),
    CalendarRecurrenceRule = require('ripple/platform/tizen/1.0/CalendarRecurrenceRule');

module.exports = function (eventInitDict) {
    var _self, isDetached = false; //isDetached

    _self = new CalendarItem("EVENT");

    if ((eventInitDict !== undefined) && (eventInitDict !== null)) {
        _self.endDate        = eventInitDict.endDate;
        _self.availability   = eventInitDict.availability;
        _self.recurrenceRule = eventInitDict.recurrenceRule;
    } else {
        _self.endDate        = new TZDate();
        _self.availability   = "";
        _self.recurrenceRule = new CalendarRecurrenceRule();
    }

    _self.expandRecurrence = function (startDate, endDate, successCallback, errorCallback) {
        _self.startDate = startDate;
        _self.endDate   = endDate;
    };
    _self.__defineGetter__("isDetached", function () {
        return isDetached;
    });
    return _self;
};
