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

var tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils');

module.exports = function (prop) {
    var _self, type, i;
    _self = {};
    if (prop) {
        if (prop.country !== null && prop.country !== undefined) {
            _self.country = String(prop.country);
        }
        if (prop.region !== null && prop.region !== undefined) {
            _self.region = String(prop.region);
        }
        if (prop.city !== null && prop.city !== undefined) {
            _self.city = String(prop.city);
        }
        if (prop.streetAddress !== null && prop.streetAddress !== undefined) {
            _self.streetAddress = String(prop.streetAddress);
        }
        if (prop.additionalInformation !== null && prop.additionalInformation !== undefined) {
            _self.additionalInformation = String(prop.additionalInformation);
        }
        if (prop.postalCode !== null && prop.postalCode !== undefined) {
            _self.postalCode = String(prop.postalCode);
        }
        _self.types = [];
        if (tizen1_utils.isValidArray(prop.types)) {
            for (i = 0; i < prop.types.length; i++) {
                type = String(prop.types[i]).toUpperCase();
                _self.types.push(type);
            }
        }
    }

    return _self;
};
