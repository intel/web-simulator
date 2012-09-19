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
    var _self, i;
    _self = {
        prefix : "",
        firstName : "",
        middleName : "",
        lastName : "",
        nicknames : [],
        phoneticName : "",
        displayName : null
    };

    if (prop) {
        if (prop.prefix !== null && prop.prefix !== undefined) {
            _self.prefix = String(prop.prefix);
        }
        if (prop.firstName !== null && prop.firstName !== undefined) {
            _self.firstName = String(prop.firstName);
        }
        if (prop.middleName !== null && prop.middleName !== undefined) {
            _self.middleName = String(prop.middleName);
        }
        if (prop.lastName !== null && prop.lastName !== undefined) {
            _self.lastName = String(prop.lastName);
        }
        if (tizen1_utils.isValidArray(prop.nicknames)) {
            for (i = 0; i < prop.nicknames.length; i++) {
                _self.nicknames.push(String(prop.nicknames[i]));
            }
        }
        if (prop.phoneticName !== null && prop.phoneticName !== undefined) {
            _self.phoneticName = String(prop.phoneticName);
        }
        if (prop.displayName !== null && prop.displayName !== undefined) {
            _self.displayName = String(prop.displayName);
        }
    }

    return _self;
};
