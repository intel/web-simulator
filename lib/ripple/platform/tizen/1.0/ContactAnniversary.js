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

var tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    CommonError = require('ripple/platform/tizen/1.0/CommonError');

module.exports = function (date, label) {
    var _self, _date,
        _label = null;

    if (tizen1_utils.isValidDate(date)) {
        _date = new Date(date);
    } else {
        throw new CommonError("TYPE_MISMATCH_ERROR");
    }

    if (label) {
        _label = String(label);
    }

    _self = {
        date : _date,
        label : _label
    };

    return _self;
};
