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

var t = require('ripple/platform/tizen/2.0/typedef'),
    _self;

_self = function (pattern) {
    var typeCoerce, typeOfPattern;

    // private
    function getExtendedType(val) {
        var type;

        switch (val) {
        case "any": // Any type
            type = "any";
            break;

        case "double":
        case "float":
            type = "float";
            break;

        case "unsigned long":
            type = "unsigned long";
            break;

        default:    // Derivative type name: e.g., "AbstractFilter"
            type = "";
            break;
        }

        return type;
    }

    function getType(val, isPattern) {
        var type = Object.prototype.toString.call(val);

        switch (type) {
        case "[object Array]":
            type = (isPattern && (val.length > 1) &&
                (typeof val[0] === "string")) ? "enum" : "Array";
            break;

        case "[object Boolean]":
            type = "boolean";
            break;

        case "[object Date]":
            type = "Date";
            break;

        case "[object Function]":
            type = "Function";
            break;

        case "[object Number]":
            type = "Number";
            break;

        case "[object Object]":
            type = "Object";
            break;

        case "[object String]":
            type = (isPattern && !!val) ? getExtendedType(val) : "DOMString";
            break;
        }

        return type;
    }

    function isInstance(base, derived, obj) {
        var attr;

        for (attr in derived) {
            switch (attr) {
            case "_optional":
            case "_derived":
                break;

            default:
                if ((!derived._optional || !derived._optional[attr]) &&
                    !(attr in obj)) {
                    return false;
                }
                break;
            }
        }

        for (attr in obj) {
            if (!(attr in base) && !(attr in derived)) {
                return false;
            }
        }

        return true;
    }

    // public
    function cast(obj) {
        var typeMap,
            typeOfObj = getType(obj, false);

        typeMap = {
            "Array": function () {
                var arr = [], elementType, i;

                if (typeOfObj !== typeOfPattern) {
                    return null;
                }

                elementType = _self(pattern[0]);
                for (i in obj) {
                    arr[i] = elementType.cast(obj[i]);
                    if (arr[i] === null)
                        return null;
                }

                return arr;
            },

            "DOMString": function () {
                switch (typeOfObj) {
                case "Date":
                case "DOMString":
                case "Number":
                    obj = String(obj).trim();
                    break;

                default:
                    obj = null;
                    break;
                }

                return obj;
            },

            "Date": function () {
                return (typeOfObj === typeOfPattern) ? obj : null;
            },

            "Function": function () {
                return (typeOfObj === typeOfPattern) ? obj : null;
            },

            "Number": function () {
                var n = parseInt(obj, 10);

                if (isNaN(n))
                    return null;

                return (obj === n) ? n : parseFloat(obj);
            },

            "Object": function () {
                var ret = {}, attr, i, isMatched = false;

                if (typeOfObj !== typeOfPattern) {
                    return null;
                }

                for (attr in pattern) {
                    switch (attr) {
                    case "_optional":
                        break;

                    case "_derived":
                        for (i in pattern._derived) {
                            if (isInstance(pattern, pattern._derived[i], obj)) {
                                isMatched = true;
                                break;
                            }
                        }
                        ret = _self(pattern._derived[isMatched ? i : 0])
                            .cast(obj);
                        break;

                    default:
                        if (!pattern._optional || !pattern._optional[attr] ||
                            (obj[attr] !== undefined) && (obj[attr] !== null)) {
                            ret[attr] = _self(pattern[attr]).cast(obj[attr]);
                            if (ret[attr] === null) {
                                return null;
                            }
                        }
                        break;
                    }
                }

                return ret;
            },

            "any": function () {
                return obj;
            },

            "boolean": function () {
                return (typeOfObj === typeOfPattern) ? obj : null;
            },

            "enum": function () {
                var i;

                obj = String(obj).trim();
                for (i in pattern) {
                    if (obj === pattern[i]) {
                        return obj;
                    }
                }

                return null;
            },

            "float": function () {
                var f = parseFloat(obj, 10);

                return (isNaN(f) ? null : f);
            },

            "unsigned long": function () {
                var n = Number(obj);

                return ((!isNaN(n) && (n == obj) &&
                        (0 <= n) && (n <= 0xffffffff)) ? n : null);
            },

            "": function () {
                return _self(t[pattern]).cast(obj);
            }
        };

        return typeMap[typeOfPattern]();
    }

    function match(obj) {
        var typeMap,
            typeOfObj = getType(obj, false);

        typeMap = {
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

            "Function": function () {
                return (typeOfObj === typeOfPattern);
            },

            "Number": function () {
                return (typeOfObj === typeOfPattern);
            },

            "Object": function () {
                var attr, i, isMatched = false;

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
                            isMatched = (obj[attr] !== undefined) &&
                                _self(pattern[attr]).match(obj[attr]);
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

            "float": function () {
                return (typeOfObj === "Number");
            },

            "unsigned long": function () {
                var n = Number(obj);

                return (!isNaN(n) && (n == obj) &&
                        (0 <= n) && (n <= 0xffffffff));
            },

            "": function () {
                return _self(t[pattern]).match(obj);
            }
        };

        return typeMap[typeOfPattern]();
    }

    function validate(obj) {
        var typeMap,
            typeOfObj = getType(obj, false);

        typeMap = {
            "Array": function () {
                var elementType, i;

                if (typeOfObj !== typeOfPattern)
                    return false;

                elementType = _self(pattern[0]);
                for (i in obj) {
                    if (!elementType.validate(obj[i])) {
                        return false;
                    }
                }

                return true;
            },

            "DOMString": function () {
                return (obj !== "");
            },

            "Number": function () {
                return (obj !== 0);
            },

            "Object": function () {
                var attr, i, isValid = false, isMatched = false;

                if (typeOfObj !== typeOfPattern)
                    return false;

                for (attr in pattern) {
                    switch (attr) {
                    case "_optional":
                        break;

                    case "_derived":
                        for (i in pattern._derived) {
                            if (isInstance(pattern, pattern._derived[i], obj)) {
                                isMatched = true;
                                break;
                            }
                        }
                        isValid = _self(pattern._derived[isMatched ? i : 0])
                            .validate(obj);
                        break;

                    default:
                        if (pattern._optional && pattern._optional[attr]) {
                            isValid = true;
                        } else {
                            isValid = _self(pattern[attr]).validate(obj[attr]);
                        }
                        break;
                    }

                    if (!isValid)
                        break;
                }

                return isValid;
            },

            "enum": function () {
                for (var i in pattern) {
                    if (obj === pattern[i]) {
                        return true;
                    }
                }

                return false;
            },

            "float": function () {
                return (obj !== 0);
            },

            "": function () {
                return _self(t[pattern]).validate(obj);
            }
        };

        return !typeMap[typeOfPattern] || typeMap[typeOfPattern]();
    }

    typeOfPattern = getType(pattern, true);

    typeCoerce = {
        cast:     cast,
        match:    match,
        validate: validate
    };

    return typeCoerce;
};

module.exports = _self;
