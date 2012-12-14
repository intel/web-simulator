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

var tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    event = require('ripple/event'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError');

module.exports = function (prop) {
    var _self,
        _uuid = prop.uuid || "",
        _name = prop.name || "",
        _isConnected = prop.isConnected || false,
        _security = prop.metaData || {};

    _self = {
        onconnect : null,
        unregister : function (successCallback, errorCallback) {
            if (!_security.all && !_security.unregister) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            tizen1_utils.validateCallbackType(successCallback, errorCallback);
            event.trigger("bt-unregister-service", [_uuid, successCallback, errorCallback]);
        }
    };

    _self.__defineGetter__("uuid", function () {
        return _uuid;
    });
    _self.__defineGetter__("name", function () {
        return _name;
    });
    _self.__defineGetter__("isConnected", function () {
        return _isConnected;
    });

    return _self;
};
