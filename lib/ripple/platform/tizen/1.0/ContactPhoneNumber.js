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

var tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils');

module.exports = function (number, types) {
    var _self, _number = "", i,
        _types = [], type;
    
    if (number) {
        _number = String(number);
    }
    if (tizen1_utils.isValidArray(types)) {
        for (i = 0; i < types.length; i++) {
            type = String(types[i]).toUpperCase();
            _types.push(type);
        }
    }

    _self = {
        number : _number,
        types : _types
    };

    return _self;
};
