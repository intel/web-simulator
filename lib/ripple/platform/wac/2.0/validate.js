/*
 *  Copyright 2011 Intel Corporation.
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
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    DeviceApiError = require('ripple/platform/wac/2.0/deviceapierror');

module.exports = {
    validateTypeMismatch: function (onSuccess, onError, name, callback) {
        if (onSuccess) {
            utils.validateArgumentType(onSuccess, "function", null,
                                       name + " invalid successCallback parameter",
                                       new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (onError) {
            utils.validateArgumentType(onError, "function", null,
                                       name + " invalid errorCallback parameter",
                                       new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (onSuccess) {
            return callback && callback();
        } else {
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                }, 1);
            }
        }
        return undefined;
    }
};

