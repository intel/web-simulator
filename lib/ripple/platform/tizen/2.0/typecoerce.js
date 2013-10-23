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
        var type, attr;

        if (typeof val === "object") {
            if ("_dictionary" in val) {
                return "dictionary";
            }

            type = "Object";

            for (attr in val) {
                if (attr === "0") {
                    type = "Arguments";
                } else if (val[attr] === "Callback") {
                    type = "Callback";
                }
                break;
            }

            return type;
        }

        switch (val) {
        case "Callback":
            type = "Function";
            break;

        case "TZDate":
        case "any": // Any type
        case "byte":
        case "octet":
        case "unsigned long":
        case "unsigned short":
            type = val;
            break;

        case "double":
        case "float":
            type = "float";
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

        case "[object Arguments]":
            type = "Arguments";
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
            type = isPattern ? getExtendedType(val) : "Object";
            break;

        case "[object String]":
            type = (isPattern && !!val) ? getExtendedType(val) : "DOMString";
            break;
        }

        return type;
    }

    function instanceOfPattern(pattern, obj) {
        var ret, i, derived;

        if ("_constructor" in pattern) {
            if (obj instanceof window.tizen[pattern._constructor]) {
                return -1;
            }
            ret = NaN;
        } else {
            ret = -1;
        }

        if (!("_derived" in pattern)) {
            return ret;
        }

        for (i in pattern._derived) {
            derived = pattern._derived[i];

            if (typeof derived !== "object") {
                return (typeof derived === typeof obj) ? i : NaN;
            }
            if (!isNaN(instanceOfPattern(derived, obj))) {
                return i;
            }
        }

        return NaN;
    }

    function toInteger(x) {
        return (x < 0) ? Math.ceil(x) : Math.floor(x);
    }

    function modulo(a, b) {
        return a - Math.floor(a / b) * b;
    }

    function toUInt(x, bits) {
        x = Number(x);

        if (isNaN(x) || !isFinite(x))
            return null;

        return modulo(toInteger(x), Math.pow(2, bits));
    }

    function toUInt16(x) {
        return toUInt(x, 16);
    }

    function toUInt32(x) {
        return toUInt(x, 32);
    }

    // public
    function cast(obj) {
        var typeMap,
            typeOfObj = getType(obj, false);

        typeMap = {
            "Arguments": function () {
                var i, isNullable, ret;

                for (i in pattern) {
                    if (i === "_optional")
                        continue;

                    isNullable = !!(pattern._optional && pattern._optional[i]);

                    if (i > obj.length - 1) {
                        if (!isNullable) {
                            return null;
                        }
                        obj[i] = null;
                        continue;
                    }

                    if ((obj[i] === null) || (obj[i] === undefined)) {
                        if (!isNullable || ((i in obj) && (obj[i] !== null))) {
                            return null;
                        }
                    } else {
                        ret = _self(pattern[i]).cast(obj[i]);
                        if (ret === null) {
                            return null;
                        }
                        obj[i] = ret;
                    }
                }

                return obj;
            },

            "Array": function () {
                var elementType, i, ret;

                if (typeOfObj !== typeOfPattern) {
                    return null;
                }

                elementType = _self(pattern[0]);
                for (i in obj) {
                    ret = elementType.cast(obj[i]);
                    if (ret === null) {
                        return null;
                    }
                    obj[i] = ret;
                }

                return obj;
            },

            "Callback": function () {
                var attr;

                if (typeOfObj !== "Object") {
                    return null;
                }

                for (attr in pattern) {
                    if (attr in obj) {
                        obj[attr] = _self(pattern[attr]).cast(obj[attr]);
                        if (obj[attr] === null) {
                            return null;
                        }
                    }
                }

                return obj;
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
                var n = toInteger(obj);

                if (isNaN(n))
                    return null;

                return (obj === n) ? n : parseFloat(obj);
            },

            "Object": function () {
                var attr, iInstance, ret;

                if (!("_derived" in pattern) &&
                        (typeOfObj !== typeOfPattern)) {
                    return null;
                }

                iInstance = instanceOfPattern(pattern, obj);
                if (isNaN(iInstance)) {
                    return null;
                }

                for (attr in pattern) {
                    switch (attr) {
                    case "_optional":
                    case "_constructor":
                        break;

                    case "_derived":
                        if (iInstance !== -1) {
                            ret = _self(pattern._derived[iInstance]).cast(obj);
                            if (ret === null) {
                                return null;
                            }
                        }
                        break;

                    default:
                        if (!pattern._optional || !pattern._optional[attr] ||
                                (obj[attr] !== undefined) &&
                                (obj[attr] !== null)) {
                            ret = _self(pattern[attr]).cast(obj[attr]);
                            if (ret === null) {
                                return null;
                            }
                            obj[attr] = ret;
                        }
                        break;
                    }
                }

                return obj;
            },

            "TZDate": function () {
                if (typeOfObj !== "Object") {
                    return null;
                }
                return (obj instanceof window.tizen.TZDate) ? obj : null;
            },

            "any": function () {
                return obj;
            },

            "boolean": function () {
                return (typeOfObj === typeOfPattern) ? obj : null;
            },

            "dictionary": function () {
                var attr, ret;

                if (typeOfObj !== "Object") {
                    return null;
                }

                for (attr in pattern) {
                    switch (attr) {
                    case "_dictionary":
                        if (pattern._dictionary !== null) {
                            ret = _self(pattern._dictionary).cast(obj);
                            if (ret === null) {
                                return null;
                            }
                        }
                        break;

                    default:
                        if ((attr in obj) && (obj[attr] !== null) &&
                                (obj[attr] !== undefined)) {
                            ret = _self(pattern[attr]).cast(obj[attr]);
                            if (ret === null) {
                                return null;
                            }
                            obj[attr] = ret;
                        }
                        break;
                    }
                }

                return obj;
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
                var n;

                n = toUInt32(obj);

                return (n === null) ? null : n;
            },

            "unsigned short": function () {
                var n;

                n = toUInt16(obj);

                return (n === null) ? null : n;
            },

            "octet": function () {
                var n;

                try {
                    n = Number(obj);

                    return ((!isNaN(n) && (n == obj) &&
                            (0 <= n) && (n <= 0xff)) ? n : null);
                } catch (e) {
                    return null;
                }
            },

            "byte": function () {
                var n, ch;

                switch (typeOfObj) {
                case "Number":
                    try {
                        n = Number(obj);

                        return ((!isNaN(n) && (n == obj) &&
                                (0 <= n) && (n <= 0xff)) ? n : null);
                    } catch (e) {
                        return null;
                    }
                    break;

                case "DOMString":
                    if (obj.length > 1)
                        return null;

                    try {
                        ch = obj.charCodeAt();

                        return ((!isNaN(ch) && (0 <= ch) &&
                                (ch <= 0xff)) ? String(obj) : null);
                    } catch (e) {
                        return null;
                    }
                    break;

                default:
                    break;
                }

                return null;
            },

            "": function () {
                return _self(t[pattern]).cast(obj);
            }
        };

        return typeMap[typeOfPattern]();
    }

    function copy(obj) {
        var typeMap,
            typeOfObj = getType(obj, false);

        typeMap = {
            "Arguments": function () {
                var i, isNullable, ret = [];

                for (i in pattern) {
                    if (i === "_optional")
                        continue;

                    isNullable = !!(pattern._optional && pattern._optional[i]);

                    if (i > obj.length - 1) {
                        if (!isNullable) {
                            return null;
                        }
                        ret[i] = null;
                        continue;
                    }

                    if ((obj[i] === null) || (obj[i] === undefined)) {
                        if (!isNullable || ((i in obj) && (obj[i] !== null))) {
                            return null;
                        }
                    } else if ((ret[i] = _self(pattern[i])
                            .copy(obj[i])) === null) {
                        return null;
                    }
                }

                for (i in ret) {
                    obj[i] = ret[i];
                }

                return obj;
            },

            "Array": function () {
                var arr = [], elementType, i;

                if (typeOfObj !== typeOfPattern) {
                    return null;
                }

                elementType = _self(pattern[0]);
                for (i in obj) {
                    if (obj[i]) {
                        arr[i] = elementType.copy(obj[i]);
                        if (arr[i] === null)
                            return null;
                    }
                }

                return arr;
            },

            "Callback": function () {
                var ret = {}, attr;

                if (typeOfObj !== "Object") {
                    return null;
                }

                for (attr in pattern) {
                    if (attr in obj) {
                        ret[attr] = _self(pattern[attr]).copy(obj[attr]);
                        if (ret[attr] === null) {
                            return null;
                        }
                    }
                }

                return ret;
            },

            "Object": function () {
                var ret = {}, iInstance, attr, derived, i;

                if (typeOfObj !== typeOfPattern) {
                    return null;
                }

                iInstance = instanceOfPattern(pattern, obj);
                if (isNaN(iInstance)) {
                    return null;
                }

                if ("_constructor" in pattern) {
                    ret.__proto__ = window.tizen[pattern._constructor].prototype;
                }

                for (attr in pattern) {
                    switch (attr) {
                    case "_optional":
                    case "_constructor":
                        break;

                    case "_derived":
                        if (iInstance !== -1) {
                            derived = _self(pattern._derived[iInstance])
                                    .copy(obj);

                            for (i in derived) {
                                ret[i] = derived[i];
                            }
                        }
                        break;

                    default:
                        if (!pattern._optional || !pattern._optional[attr] ||
                                (obj[attr] !== undefined) &&
                                (obj[attr] !== null)) {
                            ret[attr] = _self(pattern[attr]).copy(obj[attr]);
                            if (ret[attr] === null) {
                                return null;
                            }
                        }
                        break;
                    }
                }

                return ret;
            },

            "dictionary": function () {
                var ret = {}, attr, base, i;

                if (typeOfObj !== "Object") {
                    return null;
                }

                for (attr in pattern) {
                    switch (attr) {
                    case "_dictionary":
                        if (pattern._dictionary !== null) {
                            base = _self(pattern._dictionary).copy(obj);
                            if (base === null) {
                                return null;
                            }
                            for (i in base) {
                                ret[i] = base[i];
                            }
                        }
                        break;

                    default:
                        if ((attr in obj) && (obj[attr] !== null) &&
                                (obj[attr] !== undefined)) {
                            ret[attr] = _self(pattern[attr]).copy(obj[attr]);
                            if (ret[attr] === null) {
                                return null;
                            }
                        }
                        break;
                    }
                }

                return ret;
            },

            "": function () {
                return _self(t[pattern]).copy(obj);
            }
        };

        return (typeOfPattern in typeMap) ? typeMap[typeOfPattern]() :
                cast(obj);
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

            "Callback": function () {
                var attr, isMatched = true;

                if (typeOfObj !== "Object") {
                    return false;
                }

                for (attr in pattern) {
                    if (attr in obj) {
                        isMatched = _self(pattern[attr]).match(obj[attr]);
                        if (!isMatched) {
                            break;
                        }
                    }
                }

                return isMatched;
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
                var iInstance, attr, isMatched = false;

                if (typeOfObj !== typeOfPattern)
                    return false;

                iInstance = instanceOfPattern(pattern, obj);
                if (isNaN(iInstance)) {
                    return false;
                }

                for (attr in pattern) {
                    switch (attr) {
                    case "_optional":
                    case "_constructor":
                        break;

                    case "_derived":
                        if (iInstance !== -1) {
                            isMatched = _self(pattern._derived[iInstance])
                                    .match(obj);
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

            "dictionary": function () {
                var attr, isMatched = true;

                if (typeOfObj !== "Object") {
                    return false;
                }

                for (attr in pattern) {
                    switch (attr) {
                    case "_dictionary":
                        if (pattern._dictionary !== null) {
                            isMatched = _self(pattern._dictionary).match(obj);
                            if (!isMatched)
                                break;
                        }
                        break;

                    default:
                        if ((attr in obj) && (obj[attr] !== null) &&
                                (obj[attr] !== undefined)) {
                            isMatched = _self(pattern[attr]).match(obj[attr]);
                            if (!isMatched)
                                break;
                        }
                        break;
                    }
                }

                return isMatched;
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
                var n;

                n = toUInt32(obj);

                return (n !== null);
            },

            "unsigned short": function () {
                var n;

                n = toUInt16(obj);

                return (n !== null);
            },

            "octet": function () {
                var n;

                try {
                    n = Number(obj);

                    return (!isNaN(n) && (n == obj) &&
                            (0 <= n) && (n <= 0xff));
                } catch (e) {
                    return false;
                }
            },

            "byte": function () {
                var n, ch;

                switch (typeOfObj) {
                case "Number":
                    try {
                        n = Number(obj);

                        return (!isNaN(n) && (n == obj) &&
                                (0 <= n) && (n <= 0xff));
                    } catch (e) {
                        return false;
                    }
                    break;

                case "DOMString":
                    if (obj.length > 1)
                        return false;

                    try {
                        ch = obj.charCodeAt();

                        return (!isNaN(ch) && (0 <= ch) && (ch <= 0xff));
                    } catch (e) {
                        return false;
                    }
                    break;

                default:
                    break;
                }

                return false;
            },

            "Arguments": function () {
                return true;
            },

            "": function () {
                return _self(t[pattern]).match(obj);
            }
        };

        return typeMap[typeOfPattern]();
    }

    typeOfPattern = getType(pattern, true);

    typeCoerce = {
        cast:  cast,
        copy:  copy,
        match: match
    };

    return typeCoerce;
};

module.exports = _self;
