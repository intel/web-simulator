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

var _self;

_self = function (criteria) {
    var pattern,
        messageFilter;

    messageFilter = {
        match: function (target) {
            var result = false, index;

            if (Object.prototype.toString.call(criteria) === "[object Array]") {
                for (index in criteria) {
                    if (_self(criteria[index]).match(target))
                        return true;
                }
                return false;
            }

            switch (Object.prototype.toString.call(target)) {
            case "[object Number]":
                result = (criteria === target);
                break;

            case "[object String]":
                result = pattern.test(target);
                break;

            case "[object Array]":
                for (index in target) {
                    if (messageFilter.match(target[index]))
                        return true;
                }
                break;
            }

            return result;
        }
    };

    if (typeof criteria === "string")
        pattern = new RegExp(criteria.replace(/(^|[^\\])%+/g, "$1.*").replace(/\\%/g, "%").replace(/.*/, "^$&$"), "i");

    return messageFilter;
};

module.exports = _self;
