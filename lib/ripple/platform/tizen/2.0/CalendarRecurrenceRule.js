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
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    TZDate = require('ripple/platform/tizen/2.0/TZDate');

module.exports = function (frequency, ruleInitDict) {
    var _self = {};

    _self.frequency = (frequency) ? frequency : 0;

    if ((ruleInitDict !== undefined) && (ruleInitDict !== null)) {
        _self.interval        = ((ruleInitDict.interval > 0) && (ruleInitDict.interval === parseInt(ruleInitDict.interval))) ? Number(ruleInitDict.interval) : 1;
        _self.untilDate       = tizen1_utils.isValidTZDate(ruleInitDict.untilDate) ? (new TZDate(new Date(ruleInitDict.untilDate))) : null;
        _self.occurrenceCount = (ruleInitDict.occurrenceCount === parseInt(ruleInitDict.occurrenceCount)) ? Number(ruleInitDict.occurrenceCount) : -1;
        _self.daysOfTheWeek   = tizen1_utils.isValidArray(ruleInitDict.daysOfTheWeek) ? utils.copy(ruleInitDict.daysOfTheWeek) : [];
        _self.setPositions    = tizen1_utils.isValidArray(ruleInitDict.setPositions) ? utils.copy(ruleInitDict.setPositions) : [];
        _self.exceptions      = tizen1_utils.isValidArray(ruleInitDict.exceptions) ? utils.copy(ruleInitDict.exceptions) : [];
    } else {
        _self.interval        = 1;
        _self.untilDate       = null;
        _self.occurrenceCount = -1;
        _self.daysOfTheWeek   = [];
        _self.setPositions    = [];
        _self.exceptions      = [];
    }

    return _self;
};
