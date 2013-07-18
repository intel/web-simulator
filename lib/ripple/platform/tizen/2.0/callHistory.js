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
    db = require('ripple/db'),
    event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    t = require('ripple/platform/tizen/2.0/typedef'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    _DB_CALL_KEY = "tizen1-db-callhistory",
    _data = {
        observers: {},
        callHistory: []
    },
    _security = {
        "http://tizen.org/privilege/callhistory.read": ["find", "addChangeListener", "removeChangeListener"],
        "http://tizen.org/privilege/callhistory.write": ["remove", "removeBatch", "removeAll"]
    },
    _self;

function _getValue(inputValue, key) {
    var keys = key.split("."),
        value = inputValue[keys[0]],
        index;

    for (index = 1; index < keys.length; index++) {
        if (value[keys[index]]) {
            value = value[keys[index]];
        }
    }

    return value;
}

function _filter(inputArray, filter) {
    var index, filterResults = [], compositeResultArray;

    if (filter === null || filter === undefined) {
        return inputArray;
    }

    if (filter.type && filter.filters) {
        filterResults = _filter(inputArray, filter.filters[0]);
        for (index = 1; index < filter.filters.length; index++) {
            compositeResultArray = _filter(inputArray, filter.filters[index]);

            filterResults = tizen1_utils.arrayComposite(filter.type, filterResults, compositeResultArray);
        }
        return filterResults;
    }

    if (filter.attributeName === null || filter.attributeName === undefined) {
        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
    }

    if (filter.matchFlag) {
        if (filter.attributeName === 'features') {
            filterResults = tizen1_utils.matchAttributeArrayFilter(inputArray, filter.attributeName, filter.matchFlag, filter.matchValue);
        } else {
            filterResults = tizen1_utils.matchAttributeFilter(inputArray, filter.attributeName, filter.matchFlag, filter.matchValue);
        }
    }
    else if (filter.initialValue || filter.endValue) {
        filterResults = tizen1_utils.matchAttributeRangeFilter(inputArray, filter.attributeName, filter.initialValue, filter.endValue);
    }

    return filterResults;
}

function _sort(inputArray, sortMode) {
    if (sortMode.attributeName === null || sortMode.attributeName === undefined) {
        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
    }

    inputArray.sort(function (a, b) {
        return sortMode.order === "ASC" ? _getValue(a, sortMode.attributeName) - _getValue(b, sortMode.attributeName) :
               _getValue(b, sortMode.attributeName) - _getValue(a, sortMode.attributeName);
    });

    return inputArray;
}

function _save() {
    db.saveObject(_DB_CALL_KEY, _data.callHistory);
}

function _retrieve() {
    var index;

    _data.callHistory = db.retrieveObject(_DB_CALL_KEY) || [];

    for (index = 0; index < _data.callHistory.length; index++) {
        _data.callHistory[index].startTime = new Date(_data.callHistory[index].startTime);
    }
}

function _isValidCallHistoryEntry(arg) {
    return arg && arg.hasOwnProperty("uid") && arg.hasOwnProperty("type") &&
           arg.hasOwnProperty("features") && arg.hasOwnProperty("remoteParties") &&
           arg.hasOwnProperty("startTime") && arg.hasOwnProperty("duration") &&
           arg.hasOwnProperty("direction");
}

function _rtnRmtPty(pty) {
    var _remoteParty = pty.remoteParty,
        _personId = pty.personId,
        _self = {};
    _self.__defineGetter__("remoteParty", function () {
        return _remoteParty;
    });
    _self.__defineGetter__("personId", function () {
        return _personId;
    });
    return _self;
}

function _rtnEntry(entry) {
    var _uid = entry.uid,
        _type = entry.type,
        _features = tizen1_utils.copy(entry.features),
        _remoteParties = [],
        _startTime = new Date(entry.startTime),
        _duration = entry.duration,
        _direction = entry.direction,
        _self = {}, i;

    for (i = 0; i < entry.remoteParties.length; i++) {
        _remoteParties.push(_rtnRmtPty(entry.remoteParties[i]));
    }
    _self.__defineGetter__("uid", function () {
        return _uid;
    });
    _self.__defineGetter__("type", function () {
        return _type;
    });
    _self.__defineGetter__("features", function () {
        return _features;
    });
    _self.__defineGetter__("remoteParties", function () {
        return _remoteParties;
    });
    _self.__defineGetter__("startTime", function () {
        return _startTime;
    });
    _self.__defineGetter__("duration", function () {
        return _duration;
    });
    _self.direction = _direction;

    return _self;
}

function _initialize() {
    _retrieve();

    event.on("CallInProgress", function () {
    });

    event.on("CallRecorded", function (record) {
        var historyEntry = tizen1_utils.copy(record);
        historyEntry.uid = Math.uuid(8, 16);

        _data.callHistory.push(historyEntry);
        _save();

        utils.forEach(_data.observers, function (observer) {
            observer.onadded([historyEntry]);
        });
    });
}

_self = function () {
    this.find = function (successCallback, errorCallback, filter, sortMode, limit, offset) {
        var i, rtn = [],
            filterResults,
            limitValue = limit | 0,
            offsetValue = offset | 0;

        if (!_security.find) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (!(new TypeCoerce(t.SuccessCallback)).match(successCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((arguments.length > 1) && errorCallback !== null && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((arguments.length > 2) && filter !== null && !(new TypeCoerce(t.AbstractFilter)).match(filter)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((arguments.length > 3) && sortMode !== null && !(new TypeCoerce(t.SortMode)).match(sortMode)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if ((arguments.length > 4) && limit !== null && !(new TypeCoerce(t['unsigned long'])).match(limit)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((arguments.length > 5) && offset !== null && !(new TypeCoerce(t['unsigned long'])).match(offset)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        filterResults = tizen1_utils.copy(_data.callHistory);
        if (filter !== null && filter !== undefined) {
            filterResults = _filter(filterResults, filter);
        }

        if (sortMode !== null && sortMode !== undefined) {
            _sort(filterResults, sortMode);
        }

        setTimeout(function () {
            if (limitValue > 0) {
                offsetValue = offsetValue > 0 ? offsetValue : 0;
                filterResults = filterResults.slice(offsetValue, limitValue);
            }

            for (i = 0; i < filterResults.length; i++) {
                rtn.push(_rtnEntry(filterResults[i]));
            }
            successCallback(rtn);
        }, 1);
    };
    this.remove = function (entry) {
        var isFound = false, rtn = [];

        if (!_security.remove) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (!_isValidCallHistoryEntry(entry)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        _data.callHistory = _data.callHistory.filter(function (element) {
            return utils.some(element, function (value, key) {
                if (tizen1_utils.isEqual(entry[key], value)) {
                    isFound = true;
                    return false;
                }
                return true;
            });
        });

        if (!isFound) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        _save();
        rtn.push(_rtnEntry(entry));
        utils.forEach(_data.observers, function (observer) {
            observer.onchanged(rtn);
        });

    };
    this.removeBatch = function (entries, successCallback, errorCallback) {
        var isFound = false, i, rtn = [];

        if (!_security.removeBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (tizen1_utils.isValidArray(entries) === false) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((arguments.length > 1) && successCallback !== null && !(new TypeCoerce(t.SuccessCallback)).match(successCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((arguments.length > 2) && errorCallback !== null && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        for (i = 0; i < entries.length; i++) {
            if (!_isValidCallHistoryEntry(entries[i])) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
        }

        setTimeout(function () {
            isFound = entries.every(function (element) {
                return _data.callHistory.some(function (callHistory) {
                    return element.uid === callHistory.uid;
                });
            });

            if (!isFound) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
                return;
            }

            _data.callHistory = _data.callHistory.filter(function (element) {
                return !entries.some(function (entryValue, entryIndex) {
                    return tizen1_utils.isEqual(element, entryValue);
                });
            });

            _save();

            if (successCallback) {
                successCallback();
            }
            for (i = 0; i < entries.length; i++) {
                rtn.push(_rtnEntry(entries[i]));
            }
            utils.forEach(_data.observers, function (observer) {
                observer.onchanged(rtn);
            });
        }, 1);
    };
    this.removeAll = function (successCallback, errorCallback) {
        var i, rtn = [];

        if (!_security.removeAll) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if ((arguments.length > 0) && successCallback !== null && !(new TypeCoerce(t.SuccessCallback)).match(successCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if ((arguments.length > 1) && errorCallback !== null && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        for (i = 0; i < _data.callHistory.length; i++) {
            rtn.push(_rtnEntry(_data.callHistory[i]));
        }

        _data.callHistory = [];
        _save();

        utils.forEach(_data.observers, function (observer) {
            observer.onchanged(rtn);
        });

        if (successCallback) {
            setTimeout(function () {
                successCallback();
            }, 1);
        }

    };
    this.addChangeListener = function (observerObj) {
        var handle = Number(Math.uuid(8, 10));

        if (!_security.addChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (observerObj === null || typeof observerObj !== 'object' ||
            (observerObj.hasOwnProperty("onadded") && typeof observerObj.onadded !== 'function') ||
            (observerObj.hasOwnProperty("onremoved") && typeof observerObj.onremoved !== 'function') ||
            (observerObj.hasOwnProperty("onchanged") && typeof observerObj.onchanged !== 'function')) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        _data.observers[handle] = observerObj;

        return handle;
    };
    this.removeChangeListener = function (handle) {
        if (!_security.removeChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (typeof handle !== 'number') {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (_data.observers[handle]) {
            delete _data.observers[handle];
        }
        else {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
    };
    this.handleSubFeatures = function (subFeatures) {
        function setSecurity(method) {
            _security[method] = true;
        }

        for (var subFeature in subFeatures) {
            utils.forEach(_security[subFeature], setSecurity);
        }
    };
};

_initialize();

module.exports = _self;
