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
    TZDate = require('ripple/platform/tizen/2.0/TZDate');

module.exports = function (frequency, ruleInitDict) {
    var _self = {};

    _self.frequency = (frequency) ? frequency : 0;

    if ((ruleInitDict !== undefined) && (ruleInitDict !== null)) {
        _self.interval        = ruleInitDict.interval;
        _self.untilDate       = utils.copy(ruleInitDict.untilDate);
        _self.occurrenceCount = ruleInitDict.occurrenceCount;
        _self.daysOfTheWeek   = utils.copy(ruleInitDict.daysOfTheWeek);
        _self.setPositions     = utils.copy(ruleInitDict.setPositions);
        _self.exceptions      = utils.copy(ruleInitDict.exceptions);
    } else {
        _self.interval        = 0;
        _self.untilDate       = new TZDate();
        _self.occurrenceCount = 0;
        _self.daysOfTheWeek      = [""];
        _self.setPositions     = [];
        _self.exceptions      = [new TZDate()];
    }

    return _self;
};
