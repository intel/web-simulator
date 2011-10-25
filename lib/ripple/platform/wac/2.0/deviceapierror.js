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

var errorcode = require('ripple/platform/wac/2.0/errorcode');

module.exports = function (code) {
    for (var c in errorcode) {
        var g = errorcode.__lookupGetter__(c);
        if (g) {
            this.__defineGetter__(c, g);
        }
    }

    this.code = code;
    this.message = errorcode.message[code];
    this.type =  "";

    this.toString = function () {
        var result = this.type + ': "' + this.message + '"';

        if (this.stack) {
            result += "\n" + this.stack;
        }
        return result;
    };
};

