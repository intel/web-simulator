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

var utils = require('ripple/utils'),
    t = require('ripple/platform/tizen/2.0/typedef'),
    _self;

_self = function (pattern) {
    var typeCoerce, typeOfPattern;

    // private
    function getType(val, isPattern) {
        var type = Object.prototype.toString.call(val);

        switch (type) {
        case "[object Array]":
            type = (isPattern && (val.length > 1) && (typeof val[0] === "string")) ? "enum" : "Array";
            break;

        case "[object Boolean]":
            type = "boolean";
            break;

        case "[object Date]":
            type = "Date";
            break;

        case "[object Function]":
            type = "function";
            break;

        case "[object Number]":
            type = "number";
            break;

        case "[object Object]":
            type = "Object";
            break;

        case "[object String]":
            if (!isPattern) {
                type = "DOMString";
                break;
            }

            switch (val) {
            case "":    // Empty string: generic string type
                type = "DOMString";
                break;

            case "any": // Any type
                type = "any";
                break;

            default:    // Non-empty string: type name, e.g., "AbstractFilter"
                type = "Type";
                break;
            }
            break;
        }

        return type;
    }

    // public
    function cast(obj) {
        var validObj,
            validValue,
            elementType,
            typeOfObj = getType(obj, false);

        switch (typeOfPattern) {
        case "DOMString":
            validObj = (typeOfObj !== typeOfPattern) ? String(obj) : obj;
            break;

        case "number":
            validObj = (typeOfObj !== typeOfPattern) ? Number(obj) : obj;
            break;

        case "Object":
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

        case "Array":
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

    function match(obj) {
        var matchTab,
            typeOfObj = getType(obj, false);

        matchTab = {
            "Array": function () {
                var elementType, i;

                if (typeOfObj !== typeOfPattern)
                    return false;

                elementType = _self(pattern[0]);
                for (i in obj) {
                    if (!elementType.match(obj[i])) {
                        return false;
                    }
                }

                return true;
            },

            "DOMString": function () {
                return (typeOfObj === typeOfPattern);
            },

            "Date": function () {
                return (typeOfObj === typeOfPattern);
            },

            "Object": function () {
                var attr, isMatched = false, i;

                if (typeOfObj !== typeOfPattern)
                    return false;

                for (attr in pattern) {
                    switch (attr) {
                    case "_optional":
                        break;

                    case "_derived":
                        isMatched = false;

                        for (i in pattern._derived) {
                            isMatched = _self(pattern._derived[i]).match(obj);
                            if (isMatched)
                                break;
                        }
                        break;

                    default:
                        if (pattern._optional && pattern._optional[attr]) {
                            isMatched = ((obj[attr] === null) ||
                                         (obj[attr] === undefined) ||
                                         _self(pattern[attr]).match(obj[attr]));
                        } else {
                            isMatched = (obj[attr] !== undefined) && _self(pattern[attr]).match(obj[attr]);
                        }
                        break;
                    }

                    if (!isMatched)
                        break;
                }

                /*// Check if verbose attributes are present
                if (isMatched) {
                    for (attr in obj) {
                        if (pattern[attr] === undefined) {
                            isMatched = false;
                            break;
                        }
                    }
                }*/

                return isMatched;
            },

            "Type": function () {
                return _self(t[pattern]).match(obj);
            },

            "any": function () {
                return true;
            },

            "boolean": function () {
                return (typeOfObj === typeOfPattern);
            },

            "enum": function () {
                for (var i in pattern) {
                    if (obj === pattern[i]) {
                        return true;
                    }
                }

                return false;
            },

            "function": function () {
                return (typeOfObj === typeOfPattern);
            },

            "number": function () {
                return (typeOfObj === typeOfPattern);
            }
        };

        return matchTab[typeOfPattern]();
    }

    typeOfPattern = getType(pattern, true);

    typeCoerce = {
        cast:  cast,
        match: match
    };

    return typeCoerce;
};

module.exports = _self;
