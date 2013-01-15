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

module.exports = function (number, types, isDefault) {
    var _self, i, type;

    _self = {
        number:    undefined,
        isDefault: false,
        types:     undefined
    };

    _self.number = number ? String(number) : "";

    if (tizen1_utils.isValidArray(types)) {
        _self.types = [];

        for (i in types) {
            type = String(types[i]).toUpperCase();
            _self.types.push(type);
        }
    } else {
        _self.types = ["VOICE"];
    }

    if (typeof isDefault === "boolean") {
        _self.isDefault = isDefault;
    }

    return _self;
};
