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

var CommonError = require('ripple/platform/tizen/1.0/CommonError'),
    SortMode = require('ripple/platform/tizen/1.0/SortMode');

module.exports = function (_sortMode, _maxResults) {
    var _self;
    if (_sortMode !== null && _sortMode !== undefined) {
        if (typeof _sortMode !== "object") {
            throw new CommonError("TYPE_MISMATCH_ERROR");
        }
        try {
            new SortMode(_sortMode.attributeName, _sortMode.order);
        } catch (e) {
            throw new CommonError("TYPE_MISMATCH_ERROR");
        }
    }
    if (_maxResults !== null && _maxResults !== undefined) {
        if (typeof _maxResults !== "number") {
            throw new CommonError("TYPE_MISMATCH_ERROR");
        }
    }

    _self = {
        sortMode : _sortMode,
        maxResults : _maxResults || 0
    };

    return _self;
};

