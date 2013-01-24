/*
 *  Copyright 2012 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use _self file except in compliance with the License.
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

var errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError');

module.exports = function (prop) {
    var _self,
        _major = prop.major || 0,
        _minor = prop.minor || 0,
        _services = prop.services || [];

    _self = {
        hasService: function (service) {
            if (typeof service !== "number") {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }
            return (_services.join(",").indexOf(service) !== -1);
        }
    };

    _self.__defineGetter__("major", function () {
        return _major;
    });
    _self.__defineGetter__("minor", function () {
        return _minor;
    });
    _self.__defineGetter__("services", function () {
        return _services;
    });
    return _self;
};
