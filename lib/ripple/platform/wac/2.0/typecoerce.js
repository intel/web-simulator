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

_self = function (pattern) {
    var typeCoerce,
        typeOfPattern = Object.prototype.toString.call(pattern);

    typeCoerce = {
        cast: function (obj) {
            var validObj,
                validValue,
                elementType,
                typeOfObj = Object.prototype.toString.call(obj);

            switch (typeOfPattern) {
            case "[object String]":
                validObj = (typeOfObj !== typeOfPattern) ? String(obj) : obj;
                break;

            case "[object Number]":
                validObj = (typeOfObj !== typeOfPattern) ? (Number(obj) | 0) : obj;
                break;

            case "[object Object]":
                if (typeOfObj !== typeOfPattern) {
                    validObj = {};
                } else {
                    validObj = obj;
                    utils.forEach(validObj, function (value, key) {
                        if (pattern[key] === undefined) {
                            delete validObj[key];
                        } else {
                            validValue = _self(pattern[key]).cast(value);
                            if (validObj[key] !== validValue)
                                validObj[key] = validValue;
                        }
                    });
                }
                break;

            case "[object Array]":
                if (typeOfObj !== typeOfPattern) {
                    validObj = [];
                } else {
                    validObj = obj;
                    elementType = _self(pattern[0]);
                    utils.forEach(validObj, function (element, index) {
                        validObj[index] = elementType.cast(element);
                    });
                }
                break;
            }

            return validObj;
        }
    };

    return typeCoerce;
};

module.exports = _self;
