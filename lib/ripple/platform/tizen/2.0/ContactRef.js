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

var tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError');

module.exports = function (addressBookId, contactId) {
    var _self, _addressBookId,
        _contactId;
    
    if (typeof addressBookId !== "string") {
        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
    }

    if (typeof contactId !== "string") {
        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
    }

    _self = {
        addressBookId : _addressBookId,
        contactId : _contactId
    };

    return _self;
};
