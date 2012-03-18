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
    CommonError = require('ripple/platform/tizen/1.0/CommonError');

module.exports = {
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
                return (obj[atr[0]][atr[1]] !== undefined);
            };
        } else {
            _existMatch = function (obj, index) {
                return (obj[attr] !== undefined);
            };
        }

        if (value === undefined) {
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
                return (obj[atr[0]][atr[1]].some(function (o) {
                    return (o.search(_re) !== -1);
                }));
            };
        } else {
            _arrayMatch = function (obj, index) {
                return (obj[attr].some(function (o) {
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
                return (obj[atr[0]][atr[1]] !== undefined);
            };
        } else {
            _existMatch = function (obj, index) {
                return (obj[attr] !== undefined);
            };
        }

        if (value === undefined) {
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
                if (typeof obj[atr[0]][atr[1]] !== 'string') {
                    return false;
                } else {
                    return (obj[atr[0]][atr[1]].search(_re) !== -1);
                }
            };
        } else {
            _stringMatch = function (obj, index) {
                if (typeof obj[attr] !== 'string') {
                    return false;
                } else {
                    return (obj[attr].search(_re) !== -1);
                }
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
            if (typeof arg === "number") {
                if (arg !== Math.floor(arg)) {
                    invalidArg = true;
                }
            }
            else {
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

    validateTypeMismatch: function (onSuccess, onError, name, callback) {

        if (onSuccess === undefined || onSuccess === null) {
            throw new CommonError("TYPE_MISMATCH_ERROR");
        }
        if (onSuccess) {
            this.validateArgumentType(onSuccess, "function",
                                      new CommonError("TYPE_MISMATCH_ERROR"));
        }
        if (onError) {
            this.validateArgumentType(onError, "function",
                                      new CommonError("TYPE_MISMATCH_ERROR"));
        }

        return callback && callback();
    },

    isEmptyObject: function (obj) {
        var prop;

        for (prop in obj) {
            return false;
        }
        return true;
    }
};

