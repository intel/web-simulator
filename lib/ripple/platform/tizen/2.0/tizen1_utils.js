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

var self,
    utils = require('ripple/utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException');

self = module.exports = {
    _wac2_regexSanitize: function (regexString) {
        var escapePattern = /([^\\]|^)(%)/g, percentPattern = /\\%/g;
        return regexString.replace("^", "\\^")
                .replace("$", "\\$")
                .replace("(", "\\(")
                .replace(")", "\\)")
                .replace("<", "\\<")
                .replace("[", "\\[")
                .replace("{", "\\{")
                .replace(/\\([^%])/, "\\\\$1")    /* don't replace \\% */
                .replace("|", "\\|")
                .replace(">", "\\>")
                .replace(".", "\\.")
                .replace("*", "\\*")
                .replace("+", "\\+")
                .replace("?", "\\?")
                .replace(escapePattern, "$1.*")  /* replace % with .* */
                .replace(percentPattern, "%");   /* strip excape of % */
    },

    isValidDate: function (d) {
        if (Object.prototype.toString.call(d) !== "[object Date]")
            return false;
        return !isNaN(d.getTime());
    },
    isValidTZDate: function (d) {
        if (d &&  (d instanceof tizen.TZDate)) {
            return true;
        }
        return false;
    },
    isValidArray: function (a) {
        return (Object.prototype.toString.call(a) === "[object Array]");
    },

    matchOptionArrayString: function (src, attr, pattern) {
        /* src.obj[attr] is a StringArray */
        var _pattern, re, _stringMatch;
        _pattern = this._wac2_regexSanitize(pattern);
        re = new RegExp("^" + _pattern + "$", "i");

        _stringMatch = function (obj, index) {
            if (pattern.search(/^%*$/i) === 0)
                return true;
            if (obj[attr] === undefined || obj[attr] === null)
                return false;
            return obj[attr].some(function (f) {
                return f.search(re) !== -1;
            });
        };
        return utils.filter(src, _stringMatch);
    },

    matchAttributeBooleanFilter: function (src, attr, value) {
        // only support EXACTLY matchFlag
        var _booleanMatch, atr = attr.split(".");

        if (atr.length === 2) {
            _booleanMatch = function (obj, index) {
                if (!obj[atr[0]])
                    return false;

                return (obj[atr[0]][atr[1]] === value);
            };
        } else {
            _booleanMatch = function (obj, index) {
                return (obj[attr] === value);
            };
        }

        return utils.filter(src, _booleanMatch);
    },

    matchAttributeArrayFilter: function (src, attr, matchFlag, value) {
        var _re, _arrayMatch, atr = attr.split("."), _existMatch;

        if (atr.length === 2) {
            _existMatch = function (obj, index) {
                if (!obj[atr[0]])
                    return false;

                return (obj[atr[0]][atr[1]] !== undefined);
            };
        } else {
            _existMatch = function (obj, index) {
                return (obj[attr] !== undefined);
            };
        }

        if (value === undefined || value === null) {
            return utils.filter(src, _existMatch);
        }

        switch (matchFlag)
        {
        case "EXACTLY":
            _re = new RegExp("^" + value + "$");
            break;
        case "FULLSTRING":
            _re = new RegExp("^" + value + "$", "i");
            break;
        case "CONTAINS":
            _re = new RegExp(value, "i");
            break;
        case "STARTSWITH":
            _re = new RegExp("^" + value, "i");
            break;
        case "ENDSWITH":
            _re = new RegExp(value + "$", "i");
            break;
        case "EXISTS":
            return utils.filter(src, _existMatch);
        default:
            return [];
        }

        if (atr.length === 2) {
            _arrayMatch = function (obj, index) {
                if (!obj[atr[0]])
                    return false;

                return (obj[atr[0]][atr[1]] && obj[atr[0]][atr[1]].some(function (o) {
                    return (o.search(_re) !== -1);
                }));
            };
        } else {
            _arrayMatch = function (obj, index) {
                return (obj[attr] && obj[attr].some(function (o) {
                    return (o.search(_re) !== -1);
                }));
            };
        }

        return utils.filter(src, _arrayMatch);
    },

    matchAttributeRangeFilter: function (src, attr, low, high) {
        var _rangeMatch, atr = attr.split(".");

        if (atr.length === 2) {
            _rangeMatch = function (obj, index) {
                var matched = true;

                if (!obj[atr[0]])
                    return false;

                if (low !== null && low !== undefined) {
                    matched = (obj[atr[0]][atr[1]] >= low);
                }
                if (matched && (high !== null && high !== undefined)) {
                    matched = (obj[atr[0]][atr[1]] <= high);
                }
                return matched;
            };
        } else {
            _rangeMatch = function (obj, index) {
                var matched = true;

                if (low !== null && low !== undefined) {
                    matched = (obj[attr] >= low);
                }
                if (matched && (high !== null && high !== undefined)) {
                    matched = (obj[attr] <= high);
                }
                return matched;
            };
        }
        return utils.filter(src, _rangeMatch);
    },

    matchAttributeFilter: function (src, attr, matchFlag, value) {
        var _re, _stringMatch, atr = attr.split("."),
            _existMatch;

        if (atr.length === 2) {
            _existMatch = function (obj, index) {
                if (!obj[atr[0]])
                    return false;

                return (obj[atr[0]][atr[1]] !== undefined);
            };
        } else {
            _existMatch = function (obj, index) {
                return (obj[attr] !== undefined);
            };
        }

        if (value === undefined || value === null) {
            return utils.filter(src, _existMatch);
        }

        switch (matchFlag)
        {
        case "EXACTLY":
            _re = new RegExp("^" + value + "$");
            break;
        case "FULLSTRING":
            _re = new RegExp("^" + value + "$", "i");
            break;
        case "CONTAINS":
            _re = new RegExp(value, "i");
            break;
        case "STARTSWITH":
            _re = new RegExp("^" + value, "i");
            break;
        case "ENDSWITH":
            _re = new RegExp(value + "$", "i");
            break;
        case "EXISTS":
            return utils.filter(src, _existMatch);
        default:
            return [];
        }
        if (atr.length === 2) {
            _stringMatch = function (obj, index) {
                if (!obj[atr[0]])
                    return false;

                if (matchFlag === "EXACTLY") {
                    return (obj[atr[0]][atr[1]] === value);
                } else if (typeof obj[atr[0]][atr[1]] !== 'string') {
                    return false;
                }

                return (obj[atr[0]][atr[1]].search(_re) !== -1);
            };
        } else {
            _stringMatch = function (obj, index) {
                if (matchFlag === "EXACTLY") {
                    return (obj[attr] === value);
                } else if (typeof obj[attr] !== 'string') {
                    return false;
                }

                return (obj[attr].search(_re) !== -1);
            };
        }
        return utils.filter(src, _stringMatch);
    },

    matchOptionString: function (src, attr, pattern) {
        /* src.obj[attr] is a string */
        var _stringMatch, _pattern, _re;
        _pattern = this._wac2_regexSanitize(pattern);
        _re = new RegExp("^" + _pattern + "$", "mi");

        _stringMatch = function (obj, index) {
            return (obj[attr].search(_re) !== -1);
        };
        return utils.filter(src, _stringMatch);
    },

    matchOptionDate: function (src, attr, filterStart, filterEnd) {
        var _dateMatch;
        _dateMatch = function (obj, index) {
            var matched = true, valueDate = obj[attr];

            if (filterStart !== undefined && filterStart !== null) {
                matched = (valueDate.getTime() >= filterStart.getTime());
            }
            if (matched && (filterEnd !== undefined && filterEnd !== null)) {
                matched = (valueDate.getTime() <= filterEnd.getTime());
            }
            return matched;
        };
        return utils.filter(src, _dateMatch);
    },

    matchOptionShortArray: function (src, attr, filterArray) {
        /* src.obj[attr] is a short, filterArray is an array
           i.e. find status is [CONFRIMED or TENTATIVE] */
        var arraySome = function (obj, index) {
            return filterArray.some(function (f) {
                return f === obj[attr];
            });
        };
        return utils.filter(src, arraySome);
    },

    validateArgumentType: function (arg, argType, errorObj) {
        var invalidArg = false;

        switch (argType) {
        case "array":
            if (!arg instanceof Array) {
                invalidArg = true;
            }
            break;
        case "date":
            if (!arg instanceof Date) {
                invalidArg = true;
            }
            break;
        case "integer":
            if (typeof Number(arg) !== "number" || Number(arg) !== Math.floor(arg)) {
                invalidArg = true;
            }
            break;
        default:
            if (typeof arg !== argType) {
                invalidArg = true;
            }
            break;
        }

        if (invalidArg) {
            throw errorObj;
        }
    },

    validateCallbackType: function (successCallback, errorCallback) {
        if (successCallback) {
            this.validateArgumentType(successCallback, "function",
                new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
        }
        if (errorCallback) {
            this.validateArgumentType(errorCallback, "function",
                new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
        }
    },

    validateEqualArrays: function (arrayOne, arrayTwo) {
        var isEqual = false, i;

        if (Object.prototype.toString.call(arrayTwo) === "[object Array]" &&
            Object.prototype.toString.call(arrayTwo) === "[object Array]" &&
            arrayOne.length === arrayTwo.length) {
            isEqual = true;
            for (i in arrayOne) {
                if (arrayOne[i] !== arrayTwo[i]) {
                    isEqual = false;
                    break;
                }
            }
        }
        return isEqual;
    },

    validateTypeMismatch: function (onSuccess, onError, name, callback) {

        if (onSuccess === undefined || onSuccess === null) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        this.validateArgumentType(onSuccess, "function",
                                  new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
        if (onError !== null && onError !== undefined) {
            this.validateArgumentType(onError, "function",
                                      new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
        }

        return callback && callback();
    },

    isEmptyObject: function (obj) {
        var prop;

        for (prop in obj) {
            return false;
        }
        return true;
    },

    arrayComposite: function (mode, arrayA, arrayB) {
        var combinedArray = arrayA.concat(arrayB),
            intersectionArray = arrayA.filter(function (value) {
                if (utils.arrayContains(arrayB, value)) {
                    return true;
                }

                return false;
            });

        switch (mode) {
        case "AND":
        case "INTERSECTION":
            return intersectionArray;
        case "OR":
        case "UNION":
            return intersectionArray.concat(combinedArray.filter(function (value) {
                if (utils.arrayContains(intersectionArray, value)) {
                    return false;
                }

                return true;
            }));
        default:
            return undefined;
        }
    },

    isEqual: function (srcObj, aimObj) {
        var i;

        if (typeof srcObj !== typeof aimObj) {
            return false;
        }

        if (srcObj === null || srcObj === undefined || typeof srcObj === 'number' ||
            typeof srcObj === 'string' || typeof srcObj === 'boolean') {
            return srcObj === aimObj;
        }

        for (i in srcObj) {
            if (!aimObj.hasOwnProperty(i) || !self.isEqual(srcObj[i], aimObj[i])) {
                return false;
            }
        }

        return true;
    },

    query: function (objects, filter, sortMode, count, offset) {
        function isCompositeFilter(filter) {
            return (filter.type) ? true : false;
        }

        function isAttributeFilter(filter) {
            return (filter.matchFlag) ? true : false;
        }

        function getValue(obj, key) {
            var keys = key.split("."),
                value = obj[keys[0]],
                i;

            for (i = 1; i < keys.length; i++) {
                if (value[keys[i]]) {
                    value = value[keys[i]];
                }
            }

            return value;
        }

        function _filter(objects, filter) {
            var i, results, eachResult, filterFunc;

            if (isCompositeFilter(filter)) {
                for (i in filter.filters) {
                    eachResult = _filter(objects, filter.filters[i]);
                    results = (results === undefined) ? eachResult : self.arrayComposite(filter.type, results, eachResult);
                }
                return results;
            }

            if (isAttributeFilter(filter)) {
                for (i in objects) {
                    if (filter.attributeName in objects[i])
                        break;
                }
                filterFunc = self.isValidArray(objects[i][filter.attributeName]) ? self.matchAttributeArrayFilter : self.matchAttributeFilter;
                results = filterFunc(objects, filter.attributeName, filter.matchFlag, filter.matchValue);
            } else {
                results = self.matchAttributeRangeFilter(objects, filter.attributeName, filter.initialValue, filter.endValue);
            }

            return results;
        }

        function _sort(objects, sortMode) {
            objects.sort(function (a, b) {
                return (sortMode.order === "ASC") ?
                    (getValue(a, sortMode.attributeName) < getValue(b, sortMode.attributeName) ? -1 : 1):
                    (getValue(a, sortMode.attributeName) > getValue(b, sortMode.attributeName) ? -1 : 1);
            });

            return objects;
        }

        var res = objects;

        if (filter) {
            res = _filter(res, filter);
        }

        if (sortMode) {
            _sort(res, sortMode);
        }

        if (offset || count) {
            offset = (offset > 0) ? offset : 0;
            res = (count > 0) ? res.slice(offset, offset + count) : res.slice(offset);
        }

        return res;
    },

    copyString: function (str) {
        var newStr, charConvert = [], i;

        if (typeof str !== 'string') {
            return str;
        }
        for (i = 0; i < str.length; i++) {
            charConvert[i] = str.charAt(i);
        }
        newStr = charConvert.join("");

        return newStr;
    },

    copy: function (obj) {
        var i,
            newObj = jQuery.isArray(obj) ? [] : {};

        if (typeof obj === 'number' ||
            typeof obj === 'string' ||
            typeof obj === 'boolean' ||
            obj === null ||
            obj === undefined) {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj);
        }

        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }

        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj.__lookupGetter__(i)) {
                    newObj.__defineGetter__(i, (function (key) {
                        return function () {
                            return self.copy(obj[key]);
                        };
                    }(i)));
                }
                else {
                    newObj[i] = self.copy(obj[i]);
                }
            }
        }

        return newObj;
    }
};
