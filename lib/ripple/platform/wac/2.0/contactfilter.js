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
    _self;

_self = function (criteria) {
    var pattern,
        contactFilter;

    contactFilter = {
        match: function (target) {
            var result = false, key, value, index;

            switch (Object.prototype.toString.call(target)) {
            case "[object String]":
                result = pattern.test(target);
                break;

            case "[object Object]":
                for (key in criteria) {
                    result = true;
                    value = criteria[key];
                    if ((value !== undefined) && (!_self(value).match(target[key])))
                        return false;
                }
                break;

            case "[object Array]":
                for (index in target) {
                    if (contactFilter.match(target[index]))
                        return true;
                }
                break;
            }

            return result;
        }
    };

    if (typeof criteria === "string")
        pattern = new RegExp(criteria.replace(/(^|[^\\])%+/g, "$1.*").replace(/\\%/g, "%"));

    return contactFilter;
};

module.exports = _self;
