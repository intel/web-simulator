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

module.exports = function (email, types) {
    var _self, _email = "", i,
        _types = [], type;
    
    if (email) {
        _email = String(email);
    }
    if (tizen1_utils.isValidArray(types)) {
        for (i = 0; i < types.length; i++) {
            type = String(types[i]).toUpperCase();
            _types.push(type);
        }
    }

    _self = {
        email : _email,
        types : _types
    };

    return _self;
};
