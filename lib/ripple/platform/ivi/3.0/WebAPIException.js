/*
 *  Copyright 2013 Intel Corporation.
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

var errorcode = require('ripple/platform/ivi/3.0/errorcode');

var msg = {
        1: "Permission denied.",
        2: "Unsupported property.",
        3: "Timeout.",
        10: "Unknown."
    },
    errType = {
        1: "PermissionDeniedError",
        2: "PropertyUnavailableError",
        3: "TimeoutError",
        10: "UnknownError"
    };

module.exports = function (code, message, name) {
    var g, c, _code, _message, _name;

    for (c in errorcode) {
        g = errorcode.__lookupGetter__(c);
        if (g) {
            this.__defineGetter__(c, g);
        }
    }

    if (typeof code !== 'number') {
        _code = errorcode.UNKNOWN;
        _message = msg[_code];
        _name = errType[_code];
    } else {
        _code = code;
        if (typeof message === 'string') {
            _message = message;
        } else {
            _message = msg[_code];
        }
        if (typeof name === 'string') {
            _name = name;
        } else {
            _name = errType[_code];
        }
    }

    this.__defineGetter__("code", function () {
        return _code;
    });
    this.__defineGetter__("message", function () {
        return _message;
    });
    this.__defineGetter__("name", function () {
        return _name;
    });
};
