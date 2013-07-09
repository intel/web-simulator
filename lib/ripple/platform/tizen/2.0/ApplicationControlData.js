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
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException');

ApplicationControlData = function (key, AppControlDataValue) {
    var value = [], i;

    tizen1_utils.validateArgumentType(key, 'string',
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    this.key = key;

    if (tizen1_utils.isValidArray(AppControlDataValue)) {
        for (i in AppControlDataValue) {
            tizen1_utils.validateArgumentType(AppControlDataValue[i], 'string',
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
            value.push(AppControlDataValue[i]);
        }
    } else {
        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
    }

    this.__defineGetter__("value", function () {
        return value;
    });

    this.__defineSetter__("value", function (AppControlDataValue) {
        var _value = AppControlDataValue || [];
        if (!tizen1_utils.isValidArray(_value)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        value = _value;
    });
};

module.exports = ApplicationControlData;
