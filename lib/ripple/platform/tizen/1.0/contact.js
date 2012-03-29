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

var db = require('ripple/db'),
    utils = require('ripple/utils'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    Contact = require('ripple/platform/tizen/1.0/Contact'),
    ContactName = require('ripple/platform/tizen/1.0/ContactName'),
    ContactOrganization = require('ripple/platform/tizen/1.0/ContactOrganization'),
    ContactWebSite = require('ripple/platform/tizen/1.0/ContactWebSite'),
    ContactAnniversary = require('ripple/platform/tizen/1.0/ContactAnniversary'),
    ContactAccount = require('ripple/platform/tizen/1.0/ContactAccount'),
    ContactAddress = require('ripple/platform/tizen/1.0/ContactAddress'),
    ContactPhoneNumber = require('ripple/platform/tizen/1.0/ContactPhoneNumber'),
    ContactEmailAddress = require('ripple/platform/tizen/1.0/ContactEmailAddress'),
    PendingObject = require('ripple/platform/tizen/1.0/pendingObject'),
    PendingOperation = require('ripple/platform/tizen/1.0/pendingoperation'),
    _self,
    _KEY = "tizen1-contact",
    _security = {
        "http://tizen.org/api/contact": [],
        "http://tizen.org/api/contact.read": ["find", "addChangeListener"],
        "http://tizen.org/api/contact.write": ["add", "addBatch", "update", "updateBatch", 
        "remove", "removeBatch"],
        all: true
    },
    _addressBooks = [],
    _PENDING_TIME = 10;

function _pendingOperate(operate) {
    var pendingObj, pendingOperation, i, argumentVector = [];

    for (i = 0; i < arguments.length - 1; i++) {
        argumentVector[i] = arguments[i + 1];
    }

    pendingObj = new PendingObject();

    pendingObj.pendingID = window.setTimeout(function () {
        pendingObj.setCancelFlag(false);
        operate.apply(this, argumentVector);
    }, _PENDING_TIME);

    pendingOperation = new PendingOperation(pendingObj);

    return pendingOperation;
}

function _validateCallbackType(onSuccess, onError, callback) {
    if (onSuccess) {
        tizen1_utils.validateArgumentType(onSuccess, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }
    if (onError) {
        tizen1_utils.validateArgumentType(onError, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }

    return callback && callback();
}

function _checkContactProperties(prop, checkIDEmpty) {
    var i;

    if (prop) {
        if (checkIDEmpty === true) {
            /* id should not be exist */
            if (prop.id !== null && prop.id !== undefined) {
                return false;
            }
        } else {
            if (typeof prop.id !== "string") {
                return false;
            }
        }

        /* if prop.addresses exists, it must be a array */
        if (prop.addresses && !tizen1_utils.isValidArray(prop.addresses)) {
            return false;
        }

        /* if prop.phoneNumbers exists, it must be a array */
        if (prop.phoneNumbers && !tizen1_utils.isValidArray(prop.phoneNumbers)) {
            return false;
        }

        /* if prop.emails exists, it must be a array */
        if (prop.emails && !tizen1_utils.isValidArray(prop.emails)) {
            return false;
        }

        /* if prop.birthday exists, its type is Date */
        if (prop.birthday && !tizen1_utils.isValidDate(prop.birthday)) {
            return false;
        }

        /* if prop.anniversaries exists, it must be a array */
        if (prop.anniversaries && !tizen1_utils.isValidArray(prop.anniversaries)) {
            for (i = 0; i < prop.anniversaries; i++) {
                if (tizen1_utils.isValidDate(prop.anniversaries[i].date)) {
                    return false;
                }
            }
        }

        /* if prop.notes exists, it must be a array */
        if (prop.notes && !tizen1_utils.isValidArray(prop.notes)) {
            return false;
        }

        /* if prop.urls exists, it must be a array */
        if (prop.urls && !tizen1_utils.isValidArray(prop.urls)) {
            return false;
        }

        /* if prop.isFavorite exists, its type is boolean */
        if (prop.isFavorite && typeof prop.isFavorite !== "boolean") {
            return false;
        }

        /* if prop.ringtoneURI exists, its type is string */
        if (prop.ringtoneURI && typeof prop.ringtoneURI !== "string") {
            return false;
        }

        /* if prop.categories exists, it must be a array */
        if (prop.categories && !tizen1_utils.isValidArray(prop.categories)) {
            return false;
        }
    }

    /* pass all check */
    return true;
}

/* check filter type (it's a recursive function)
   0: It is not a filter
   1: CompositeFilter
   2: AttributeFilter
   3: AttributeRangeFilter
 */
function _filterType(filter) {
    var i = 0, ret;

    if (Object.prototype.toString.call(filter) !== "[object Object]") {
        return 0; // 0: it is not a filter
    }

    /* check if it is CompositFilter or not */
    if (filter.type !== null && filter.type !== undefined) {
        /* attribute 'type' of CompositeFilter must be "UNION" or "INTERSECTION" */
        if (filter.type === "UNION" || filter.type === "INTERSECTION") {
            /*attribute 'filters' of CompositeFilter must be AbstractFilter array */
            if (tizen1_utils.isValidArray(filter.filters)) {
                for (i = 0; i < filter.filters.length; i++) {
                    /* recursive call */
                    if (_filterType(filter.filters[i]) === 0) {
                        return 0; // 0: it is not a filter
                    }
                }
            } else {
                return 0; // 0: it is not a filter
            }
        } else {
            return 0; // 0: it is not a filter
        }
        return 1; // CompositeFilter
    }

    /* AttributeFilter or AttributeRangeFilter must have attributeName */
    if (filter.attributeName === null || filter.attributeName === undefined) {
        return 0; // 0: it is not a filter
    } else {
        ret = 2; // assume it is an AttributeFilter
        if ((filter.initialValue !== null || filter.initialValue !== undefined) ||
            (filter.endValue !== null || filter.endValue !== undefined)) {
            ret = 3; // AttributeRangeFilter
        }
        return ret;
    }
}

function ContactPublic(prop) {
    var _self;

    if (typeof prop.id !== "string") {
        return undefined;
    }
    if (!tizen1_utils.isValidDate(prop.lastUpdated)) {
        return undefined;
    }
    _self = new Contact(prop);

    _self.__defineGetter__("id", function () {
        return prop.id;
    });
    _self.__defineGetter__("lastUpdated", function () {
        return prop.lastUpdated;
    });
    return _self;
}

function ContactPrivate(prop, newID) {
    var _self;
    _self = new Contact(prop);
    if (newID === true) {
        _self.id = Math.uuid(undefined, 16);
    } else {
        _self.id = prop.id;
    }
    _self.lastUpdated = new Date();
    return _self;
}

function AddressBook(id, name, readOnly, contacts) {
    var addressBook;
    
    addressBook = {
        _contacts : contacts,
        _listenerCount : 0,
        _listeners : {},
        get : function (id) {
            if (typeof id !== "string") {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }

            if (this._contacts[id]) {
                return new ContactPublic(this._contacts[id]);
            } else {
                throw new WebAPIError(errorcode.NOT_FOUND_ERR);
            }
        },
        add : function (contact) {
            var item, item2;
            if (!_security.all && !_security.add) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            if (Object.prototype.toString.call(contact) !== "[object Object]") {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }

            if (this.readOnly === true) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            if (_checkContactProperties(contact, true) === false) {
                throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
            }
            item = new ContactPrivate(contact, true);
            this._contacts[item.id] = item;
            _save();

            contact.id = item.id;
            contact.lastUpdated = item.lastUpdated;

            /* send changed notification */
            utils.forEach(this._listeners, function (listenerCB) {
                item2 = new ContactPublic(item);
                listenerCB.onContactsAdded([item2]);
            });
        },
        addBatch : function (contacts, successCB, errorCB) {
            var inner = this, 
                item, item2, listenArray;
            function _addBatch() {
                var ret, i;
                if (!_security.all && !_security.addBatch) {
                    throw new WebAPIError(errorcode.SECURITY_ERR);
                }

                if (!tizen1_utils.isValidArray(contacts)) {
                    throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                } else {
                    if (contacts.length === 0) {
                        throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
                    }
                    for (i = 0; i < contacts.length; i++) {
                        if (_checkContactProperties(contacts[i], true) === false) {
                            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
                        }
                    }
                }
                if (inner.readOnly === true) {
                    throw new WebAPIError(errorcode.SECURITY_ERR);
                }

                ret = _pendingOperate(function () {
                    var i;
                    for (i = 0; i < contacts.length; i++) {
                        item = new ContactPrivate(contacts[i], true);
                        contacts[i] = new ContactPublic(item);
                        inner._contacts[item.id] = item;
                    }
                    _save();
                    if (successCB) {
                        successCB(contacts);
                    }

                    /* send changed notification */
                    utils.forEach(inner._listeners, function (listenerCB) {
                        listenArray = [];
                        for (i = 0; i < contacts.length; i++) {
                            item2 = new ContactPublic(contacts[i]);
                            listenArray.push(item2);
                        }
                        listenerCB.onContactsAdded(listenArray);
                    });
                });
            }

            _validateCallbackType(successCB, errorCB, _addBatch);
        },
        update : function (contact) {
            var item, item2, inner = this;
            if (!_security.all && !_security.update) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            if (Object.prototype.toString.call(contact) !== "[object Object]") {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }

            if (this.readOnly === true) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            if (_checkContactProperties(contact, false) === false) {
                throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
            }
            if (contact.id && this._contacts[contact.id]) {
                item = new ContactPrivate(contact, false);
                this._contacts[item.id] = item;
                _save();
            } else {
                throw new WebAPIError(errorcode.NOT_FOUND_ERR);
            }

            /* send changed notification */
            utils.forEach(this._listeners, function (listenerCB) {
                item2 = new ContactPublic(inner._contacts[contact.id]);
                listenerCB.onContactsUpdated([item2]);
            });
        },
        updateBatch : function (contacts, successCB, errorCB) {
            var inner = this, 
                item, listenArray, item2;
            function _updateBatch() {
                var ret, i;
                if (!_security.all && !_security.updateBatch) {
                    throw new WebAPIError(errorcode.SECURITY_ERR);
                }

                if (!tizen1_utils.isValidArray(contacts)) {
                    throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                } else {
                    if (contacts.length === 0) {
                        throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
                    }
                    for (i = 0; i < contacts.length; i++) {
                        if (_checkContactProperties(contacts[i], false) === false) {
                            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
                        }
                    }
                }
                if (inner.readOnly === true) {
                    throw new WebAPIError(errorcode.SECURITY_ERR);
                }

                ret = _pendingOperate(function () {
                    var i;
                    for (i = 0; i < contacts.length; i++) {
                        if (!contacts[i].id || !inner._contacts[contacts[i].id]) {
                            if (errorCB) {
                                errorCB(new WebAPIError(errorcode.NOT_FOUND_ERR));
                            }
                            return;
                        }
                    }
                    for (i = 0; i < contacts.length; i++) {
                        item = new ContactPrivate(contacts[i], false);
                        inner._contacts[item.id] = item;
                    }
                    _save();
                    if (successCB) {
                        successCB();
                    }

                    /* send changed notification */
                    utils.forEach(inner._listeners, function (listenerCB) {
                        listenArray = [];
                        for (i = 0; i < contacts.length; i++) {
                            item2 = new ContactPublic(inner._contacts[contacts[i].id]);
                            listenArray.push(item2);
                        }
                        listenerCB.onContactsUpdated(listenArray);
                    });
                });
            }

            _validateCallbackType(successCB, errorCB, _updateBatch);
        },
        remove : function (id) {
            if (!_security.all && !_security.remove) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            if (typeof id !== "string") {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }

            if (this.readOnly === true) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            if (this._contacts[id]) {
                delete this._contacts[id];
                _save();
            } else {
                throw new WebAPIError(errorcode.NOT_FOUND_ERR);
            }

            /* send changed notification */
            utils.forEach(this._listeners, function (listenerCB) {
                listenerCB.onContactsRemoved([id]);
            });
        },
        removeBatch : function (ids, successCB, errorCB) {
            var inner = this;
            function _removeBatch() {
                var ret, i;
                if (!_security.all && !_security.removeBatch) {
                    throw new WebAPIError(errorcode.SECURITY_ERR);
                }

                if (!tizen1_utils.isValidArray(ids)) {
                    throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                } else {
                    if (ids.length === 0) {
                        throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
                    }
                    for (i = 0; i < ids.length; i++) {
                        if (typeof ids[i] !== "string") {
                            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                        }
                    }
                }

                if (inner.readOnly === true) {
                    throw new WebAPIError(errorcode.SECURITY_ERR);
                }

                ret = _pendingOperate(function () {
                    var i;
                    for (i = 0; i < ids.length; i++) {
                        if (!inner._contacts[ids[i]]) {
                            if (errorCB) {
                                errorCB(new WebAPIError(errorcode.NOT_FOUND_ERR));
                            }
                            return;
                        }
                    }
                    for (i = 0; i < ids.length; i++) {
                        if (inner._contacts[ids[i]]) {
                            delete inner._contacts[ids[i]];
                        }
                    }
                    _save();
                    if (successCB) {
                        successCB();
                    }

                    /* send changed notification */
                    utils.forEach(inner._listeners, function (listenerCB) {
                        listenerCB.onContactsRemoved(ids);
                    });
                });
            }

            _validateCallbackType(successCB, errorCB, _removeBatch);
        },
        find : function (successCB, errorCB, filter, sortMode) {
            var inner = this;

            function _find() {
                var result = [], result2 = [], begin, end, ret, i,
                    atr, _re, errFlag = false, _rangeMatch, low, high, matched,
                    _existMatch, _arrayMatch;

                if (!_security.all && !_security.find) {
                    throw new WebAPIError(errorcode.SECURITY_ERR);
                }

                if (filter) {
                    switch (_filterType(filter)) {
                    case 0:
                        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                    case 1:
                        //TODO:
                        //"compositeFilter doesn't support"
                        throw new WebAPIError(errorcode.NOT_SUPPORTED_ERR);
                        break;
                    case 2:
                    case 3:
                        break;
                    }
                }

                /* return all contacts if no filter argument */
                if (filter === null || filter === undefined) {
                    utils.forEach(inner._contacts, function (contact) {
                        result.push(new ContactPublic(contact));
                    });
                    ret = _pendingOperate(function () {
                        successCB(result);
                    });
                    return;
                }

                /* check composition of filter.attributeName */
                switch (filter.attributeName) {
                case "id" :
                case "name.prefix" :
                case "name.firstName" :
                case "name.middleName" :
                case "name.lastName" :
                case "name.phoneticName" :
                case "name.displayName" :
                case "account.accountServiceId" :
                case "account.contactURI" :
                case "photoURI" :
                case "organization.name" :
                case "organization.department" :
                case "organization.office" :
                case "organization.title" :
                case "organization.role" :
                case "organization.logoURI" :
                case "ringtoneURI" :
                    result = tizen1_utils.matchAttributeFilter(inner._contacts,
                            filter.attributeName, filter.matchFlag, filter.matchValue);
                    break;
                case "name.nicknames" :
                case "notes" :
                case "categories" :
                    result = tizen1_utils.matchAttributeArrayFilter(inner._contacts,
                            filter.attributeName, filter.matchFlag, filter.matchValue);
                    break;
                case "addresses.country" :
                case "addresses.region" :
                case "addresses.city" :
                case "addresses.streetAddress" :
                case "addresses.additionalInformation" :
                case "addresses.postalCode" :
                case "phoneNumbers.number" :
                case "emails.email" :
                case "anniversaries.label" :
                case "urls.url" :
                case "urls.type" :
                    atr = filter.attributeName.split(".");
                    _existMatch = function (obj, index) {
                        return (obj[atr[0]] !== undefined);
                    };

                    if (filter.matchValue === undefined || filter.matchFlag === "EXISTS") {
                        result = utils.filter(inner._contacts, _existMatch);
                        break;
                    }

                    errFlag = false;

                    switch (filter.matchFlag)
                    {
                    case "EXACTLY":
                        _re = new RegExp("^" + filter.matchValue + "$");
                        break;
                    case "FULLSTRING":
                        _re = new RegExp("^" + filter.matchValue + "$", "i");
                        break;
                    case "CONTAINS":
                        _re = new RegExp(filter.matchValue, "i");
                        break;
                    case "STARTSWITH":
                        _re = new RegExp("^" + filter.matchValue, "i");
                        break;
                    case "ENDSWITH":
                        _re = new RegExp(filter.matchValue + "$", "i");
                        break;
                    default:
                        errFlag = true;
                    }

                    if (errFlag) {
                        result = [];
                        break;
                    }

                    _arrayMatch = function (obj, index) {
                        return (obj[atr[0]].some(function (o) {
                            if (typeof o[atr[1]] !== "string") {
                                return false;
                            } else {
                                return (o[atr[1]].search(_re) !== -1);
                            }
                        }));
                    };

                    result = utils.filter(inner._contacts, _arrayMatch);
                    break;
                case "addresses.types" :
                case "phoneNumbers.types" :
                case "emails.types" :
                    atr = filter.attributeName.split(".");
                    _existMatch = function (obj, index) {
                        return (obj[atr[0]].some(function (o) {
                            return (o[atr[1]] !== undefined);
                        }));
                    };

                    if (filter.matchValue === undefined || filter.matchFlag === "EXISTS") {
                        result = utils.filter(inner._contacts, _existMatch);
                        break;
                    }

                    errFlag = false;

                    switch (filter.matchFlag)
                    {
                    case "EXACTLY":
                        _re = new RegExp("^" + filter.matchValue + "$");
                        break;
                    case "FULLSTRING":
                        _re = new RegExp("^" + filter.matchValue + "$", "i");
                        break;
                    case "CONTAINS":
                        _re = new RegExp(filter.matchValue, "i");
                        break;
                    case "STARTSWITH":
                        _re = new RegExp("^" + filter.matchValue, "i");
                        break;
                    case "ENDSWITH":
                        _re = new RegExp(filter.matchValue + "$", "i");
                        break;
                    default:
                        errFlag = true;
                    }

                    if (errFlag) {
                        result = [];
                        break;
                    }

                    _arrayMatch = function (obj, index) {
                        return (obj[atr[0]].some(function (o) {
                            if (!tizen1_utils.isValidArray(o[atr[1]])) {
                                return false;
                            } else {
                                return (o[atr[1]].some(function (t) {
                                    return (t.search(_re) !== -1);
                                }));
                            }
                        }));
                    };

                    result = utils.filter(inner._contacts, _arrayMatch);
                    break;
                case "anniversaries.date" :
                    low = filter.initialValue;
                    high = filter.endValue;
                    atr = filter.attributeName.split(".");

                    if (low !== undefined && low !== null) {
                        if (!tizen1_utils.isValidDate(low)) {
                            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                        }
                    }
                    if (high !== undefined && high !== null) {
                        if (!tizen1_utils.isValidDate(high)) {
                            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                        }
                    }

                    _rangeMatch = function (obj, index) {
                        matched = true;
                        if (low !== null && low !== undefined) {
                            if (!tizen1_utils.isValidArray(obj[atr[0]])) {
                                matched = false;
                            } else {
                                matched = (obj[atr[0]].some(function (o) {
                                    return (o[atr[1]] >= low);
                                }));
                            }
                        }
                        if (matched && (high !== null && high !== undefined)) {
                            if (!tizen1_utils.isValidArray(obj[atr[0]])) {
                                matched = false;
                            } else {
                                matched = (obj[atr[0]].some(function (o) {
                                    return (o[atr[1]] <= high);
                                }));
                            }
                        }
                        return matched;
                    };

                    result = utils.filter(inner._contacts, _rangeMatch);
                    break;
                case "isFavorite" :
                    if (filter.matchFlag !== "EXACTLY" || typeof filter.matchValue !== "boolean") {
                        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                    } else {
                        result = tizen1_utils.matchAttributeBooleanFilter(inner._contacts,
                                filter.attributeName, filter.matchValue);
                    }
                    break;
                case "birthday" :
                    begin = filter.initialValue;
                    end = filter.endValue;

                    if (begin !== null && begin !== undefined) {
                        if (!tizen1_utils.isValidDate(begin)) {
                            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                        }
                    }

                    if (end !== null && end !== undefined) {
                        if (!tizen1_utils.isValidDate(end)) {
                            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                        }
                    }
                    
                    result = tizen1_utils.matchAttributeRangeFilter(inner._contacts,
                            filter.attributeName, begin, end);
                    break;
                default:
                    throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
                }
                ret = _pendingOperate(function () {
                    for (i = 0; i < result.length; i++) {
                        result2.push(new ContactPublic(result[i]));
                    }
                    successCB(result2);
                });
            }

            tizen1_utils.validateTypeMismatch(successCB, errorCB, "find", _find);
        },
        addChangeListener : function (successCB, errorCB) {
            var inner = this,
                id;

            if (!_security.all && !_security.addChangeListener) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            if (Object.prototype.toString.call(successCB) === "[object Object]") {
                /* onContactsAdded, onContactsUpdated, onContactsRemoved all are not optional */
                if (typeof successCB.onContactsAdded !== "function" ||
                    typeof successCB.onContactsUpdated !== "function" ||
                    typeof successCB.onContactsRemoved !== "function") {
                    throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                }
            } else {
                /* AddressBookChangedCB is not a set of functions */
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }

            if (errorCB) {
                if (typeof errorCB !== "function") {
                    throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                }
            }

            id = ++inner._listenerCount;
            inner._listeners[id] = successCB;
            return id;
        },
        removeChangeListener : function (id) {
            if (typeof id !== "number") {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }
            
            if (this._listeners[id]) {
                delete this._listeners[id];
            }
        }
    };

    addressBook.__defineGetter__("id", function () {
        return id;
    });

    addressBook.__defineGetter__("name", function () {
        return name;
    });

    addressBook.__defineGetter__("readOnly", function () {
        return readOnly;
    });

    return addressBook;
}

function _get() {
    var array = [],
        data = db.retrieveObject(_KEY);

    utils.forEach(data, function (addrBook) {
        var i, j;
        for (i in addrBook._contacts) {
            if (addrBook._contacts[i].lastUpdated !== undefined &&
                addrBook._contacts[i].lastUpdated !== null) {
                addrBook._contacts[i].lastUpdated = new Date(addrBook._contacts[i].lastUpdated);
            }
            if (addrBook._contacts[i].birthday !== undefined &&
                addrBook._contacts[i].birthday !== null) {
                addrBook._contacts[i].birthday = new Date(addrBook._contacts[i].birthday);
            }
            if (addrBook._contacts[i].anniversaries &&
                tizen1_utils.isValidArray(addrBook._contacts[i].anniversaries)) {
                for (j = 0; j < addrBook._contacts[i].anniversaries.length; j++) {
                    // Skip checking "date" exist or not due to it is mandatory 
                    addrBook._contacts[i].anniversaries[j].date = new Date(addrBook._contacts[i].anniversaries[j].date);
                }
            }
        }
        array.push(new AddressBook(addrBook.id, addrBook.name, addrBook.readOnly, addrBook._contacts));
    });

    /* add default addressbook if database is empty */
    if (array.length === 0) {
        array = [new AddressBook(Math.uuid(undefined, 16), "Phone address book", false, {}), 
                 new AddressBook(Math.uuid(undefined, 16), "SIM address book", false, {})];
    }

    return array;
}

function _save() {
    db.saveObject(_KEY, _addressBooks);
}

_self = function () {
    var contact = {
        getAddressBooks: function (successCB, errorCB) {
            function _getAddressBooks() {
                if (_addressBooks.length === 0) {
                    _addressBooks = _get();
                }
                successCB(_addressBooks);
            }
            tizen1_utils.validateTypeMismatch(successCB, errorCB, "getAddressBooks", _getAddressBooks);
        },

        getDefaultAddressBook: function () {
            if (_addressBooks.length === 0) {
                _addressBooks = _get();
            }
            return _addressBooks[0];
        },

        getAddressBook: function (id) {
            var i;
            if (typeof id !== "string") {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }
            if (_addressBooks.length === 0) {
                _addressBooks = _get();
            }
            for (i = 0; i < _addressBooks.length; i++) {
                if (_addressBooks[i].id === id) {
                    return _addressBooks[i];
                }
            }

            /* Cannot found */
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);
        },

        handleSubFeatures: function (subFeatures) {
            var i, subFeature;
            for (subFeature in subFeatures) {
                if (_security[subFeature].length === 0) {
                    _security.all = true;
                    return;
                }
                _security.all = false;
                for (i = 0; i < _security[subFeature].length; i++) {
                    _security[_security[subFeature][i]] = true;
                }
            }
        }
    };

    return contact;
};

module.exports = _self;
