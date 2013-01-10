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
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    Contact = require('ripple/platform/tizen/2.0/ContactBase'),
    AddressBook,
    AddressBookData,
    AddressBookStorage,
    ContactPublic,
    ContactData,
    ContactPrivate,
    ContactGroup,
    Person,
    PersonBuilder,
    _data = {
        DB_CONTACT_KEY: "tizen1-contact",
        addressBooks:   [],
        contacts:       {},
        persons:        {},
        dbStorage:      {}
    },
    _security = {
        "http://tizen.org/privilege/contact.read": ["find", "addChangeListener",
                "removeChangeListener", "getGroups"],
        "http://tizen.org/privilege/contact.write": ["add", "addBatch",
                "update", "updateBatch", "remove", "removeBatch", "addGroup",
                "updateGroup", "removeGroup", "link", "unlink"],
        all: true
    },
    _self;

function _get() {
    _data.dbStorage = db.retrieveObject(_data.DB_CONTACT_KEY) || {addressBooks: [], persons: {}};
}

function _save() {
    db.saveObject(_data.DB_CONTACT_KEY, _data.dbStorage);
}

function _serialize(obj) {
    var i, dbObj = {};

    for (i in obj) {
        if (typeof obj[i] !== "function")
            dbObj[i] = utils.copy(obj[i]);
    }

    return dbObj;
}

function _validateCallbackType(onSuccess, onError, callback) {
    if (onSuccess) {
        tizen1_utils.validateArgumentType(onSuccess, "function",
            new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
    }
    if (onError) {
        tizen1_utils.validateArgumentType(onError, "function",
            new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
    }

    return callback && callback();
}

function _checkPersonProperties(obj) {
    if (Object.prototype.toString.call(obj) !== "[object Object]") {
        return false;
    }
    if (typeof obj.id !== "string") {
        return false;
    }
    if (typeof obj.displayName !== "string") {
        return false;
    }
    if (typeof obj.contactCount !== "number") {
        return false;
    }
    if (typeof obj.hasPhoneNumber !== "boolean") {
        return false;
    }
    if (typeof obj.hasEmail !== "boolean") {
        return false;
    }
    if (typeof obj.isFavorite !== "boolean") {
        return false;
    }
    if (obj.photoURI && (typeof obj.photoURI !== "string")) {
        return false;
    }
    if (obj.ringtoneURI && (typeof obj.ringtoneURI !== "string")) {
        return false;
    }
    if (typeof obj.displayContactId !== "string") {
        return false;
    }

    return true;
}

function _checkContactNameProperties(obj) {
    if (Object.prototype.toString.call(obj) !== "[object Object]") {
        return false;
    }
    if (obj.prefix && (typeof obj.prefix !== "string")) {
        return false;
    }
    if (obj.suffix && (typeof obj.suffix !== "string")) {
        return false;
    }
    if (obj.firstName && (typeof obj.firstName !== "string")) {
        return false;
    }
    if (obj.middleName && (typeof obj.middleName !== "string")) {
        return false;
    }
    if (obj.lastName && (typeof obj.lastName !== "string")) {
        return false;
    }
    if (!tizen1_utils.isValidArray(obj.nicknames)) {
        return false;
    }
    if (obj.phoneticFirstName && (typeof obj.phoneticFirstName !== "string")) {
        return false;
    }
    if (obj.phoneticLastName && (typeof obj.phoneticLastName !== "string")) {
        return false;
    }
    if (obj.displayName && (typeof obj.displayName !== "string")) {
        return false;
    }

    return true;
}

function _checkContactProperties(obj) {
    if (Object.prototype.toString.call(obj) !== "[object Object]") {
        return false;
    }
    if (obj.id && (typeof obj.id !== "string")) {
        return false;
    }
    if (obj.personId && (typeof obj.personId !== "string")) {
        return false;
    }
    if (obj.addressBookId && (typeof obj.addressBookId !== "string")) {
        return false;
    }
    if (obj.lastUpdated && !tizen1_utils.isValidDate(obj.lastUpdated)) {
        return false;
    }
    if (typeof obj.isFavorite !== "boolean") {
        return false;
    }
    if (obj.name && !_checkContactNameProperties(obj.name)) {
        return false;
    }
    if (!tizen1_utils.isValidArray(obj.addresses)) {
        return false;
    }
    if (obj.photoURI && (typeof obj.photoURI !== "string")) {
        return false;
    }
    if ((obj.phoneNumbers !== undefined) && !tizen1_utils.isValidArray(obj.phoneNumbers)) {
        return false;
    }
    if ((obj.emails !== undefined) && !tizen1_utils.isValidArray(obj.emails)) {
        return false;
    }
    if (obj.birthday && !tizen1_utils.isValidDate(obj.birthday)) {
        return false;
    }
    if ((obj.anniversaries !== undefined) && !tizen1_utils.isValidArray(obj.anniversaries)) {
        return false;
    }
    if ((obj.organizations !== undefined) && !tizen1_utils.isValidArray(obj.organizations)) {
        return false;
    }
    if ((obj.notes !== undefined) && !tizen1_utils.isValidArray(obj.notes)) {
        return false;
    }
    if (!tizen1_utils.isValidArray(obj.urls)) {
        return false;
    }
    if (obj.ringtoneURI && (typeof obj.ringtoneURI !== "string")) {
        return false;
    }
    if (!tizen1_utils.isValidArray(obj.groupIds)) {
        return false;
    }

    return true;
}

function _checkGroupProperties(obj) {
    if (Object.prototype.toString.call(obj) !== "[object Object]") {
        return false;
    }
    if (obj.id && (typeof obj.id !== "string")) {
        return false;
    }
    if (obj.addressBookId && (typeof obj.addressBookId !== "string")) {
        return false;
    }
    if (typeof obj.name !== "string") {
        return false;
    }
    if (obj.ringtoneURI && (typeof obj.ringtoneURI !== "string")) {
        return false;
    }
    if (obj.photoURI && (typeof obj.photoURI !== "string")) {
        return false;
    }
    if (typeof obj.readOnly !== "boolean") {
        return false;
    }

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
        if ((filter.initialValue !== null && filter.initialValue !== undefined) ||
            (filter.endValue !== null && filter.endValue !== undefined)) {
            ret = 3; // AttributeRangeFilter
        }
        return ret;
    }
}

function _checkSortMode(sortMode) {
    if (Object.prototype.toString.call(sortMode) !== "[object Object]") {
        return false;
    }
    if (typeof sortMode.attributeName !== "string") {
        return false;
    }
    if ((sortMode.order !== "ASC") && (sortMode.order !== "DESC")) {
        return false;
    }
    return true;
}

function _sort(objects, sortMode) {
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

    objects.sort(function (a, b) {
        return (sortMode.order === "ASC") ?
            (getValue(a, sortMode.attributeName) < getValue(b, sortMode.attributeName) ? -1 : 1):
            (getValue(a, sortMode.attributeName) > getValue(b, sortMode.attributeName) ? -1 : 1);
    });

    return objects;
}

function _replacePerson(oldId, newId) {
    var contact, dbAddressBook, idab, idc, i;

    for (idab in _data.contacts) {
        for (idc in _data.contacts[idab]) {
            contact = _data.contacts[idab][idc];
            if (contact.personId === oldId) {
                contact.personId = newId;
            }
        }
    }

    if (_data.persons[oldId]) {
        delete _data.persons[oldId];
    }

    for (i in _data.dbStorage.addressBooks) {
        dbAddressBook = _data.dbStorage.addressBooks[i];
        for (idc in dbAddressBook.contacts) {
            contact = dbAddressBook.contacts[idc];
            if (contact.personId === oldId) {
                contact.personId = newId;
            }
        }
    }

    if (_data.dbStorage.persons[oldId]) {
        delete _data.dbStorage.persons[oldId];
    }
}

_self = function () {
    var contact,
        privateData = new ContactData();

    // private
    function loadAddressBooks() {
        var i;

        _get();

        if (_data.dbStorage.addressBooks.length === 0) {
            // Initialize default address books if database is empty
            _data.dbStorage.addressBooks = [
                new AddressBookStorage(Math.uuid(null, 16), "Phone address book", false, {}, []),
                new AddressBookStorage(Math.uuid(null, 16), "SIM address book", false, {}, [])
            ];
        }

        utils.forEach(_data.dbStorage.addressBooks, function (addressBook) {
            _data.addressBooks.push(new AddressBook(addressBook.id, addressBook.name,
                addressBook.readOnly, addressBook.contacts, addressBook.groups));
        });

        for (i in _data.dbStorage.persons) {
            _data.persons[i] = new Person(_data.dbStorage.persons[i]);
        }
    }

    // public
    // Address Book Methods
    function getAddressBooks(successCallback, errorCallback) {
        function _getAddressBooks() {
            if (_data.addressBooks.length === 0) {
                loadAddressBooks();
            }
            successCallback(_data.addressBooks);
        }
        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "getAddressBooks", _getAddressBooks);
    }

    function getDefaultAddressBook() {
        if (_data.addressBooks.length === 0) {
            loadAddressBooks();
        }
        return _data.addressBooks[0];
    }

    function getAddressBook(addressBookId) {
        var i;

        if (typeof addressBookId !== "string") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (_data.addressBooks.length === 0) {
            loadAddressBooks();
        }
        for (i in _data.addressBooks) {
            if (_data.addressBooks[i].id === addressBookId) {
                return _data.addressBooks[i];
            }
        }

        /* Cannot found */
        throw new WebAPIException(errorcode.NOT_FOUND_ERR);
    }

    // Person Methods
    function get(personId) {
        if (typeof personId !== "string") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (_data.persons[personId] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        return new Person(_data.persons[personId]);
    }

    function update(person) {
        var updated;

        if (!_security.all && !_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!_checkPersonProperties(person)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!person.id || !_data.persons[person.id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        updated = new Person(person);

        _data.persons[updated.id] = updated;
        _data.dbStorage.persons[updated.id] = _serialize(updated);
        _save();

        utils.forEach(privateData.listeners, function (listener) {
            listener.onpersonsupdated([new Person(updated)]);
        });
    }

    function updateBatch(persons, successCallback, errorCallback) {
        function _updateBatch() {
            var i;

            if (!_security.all && !_security.updateBatch) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }
            if (!tizen1_utils.isValidArray(persons) ||
                (persons.length === 0)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            for (i in persons) {
                if (!_checkPersonProperties(persons[i])) {
                    throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                }
            }
            window.setTimeout(function () {
                var i, updated;

                for (i in persons) {
                    if (!persons[i].id || !_data.persons[persons[i].id]) {
                        if (errorCallback) {
                            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                        }
                        return;
                    }
                }
                for (i in persons) {
                    updated = new Person(persons[i]);

                    _data.persons[updated.id] = updated;
                    _data.dbStorage.persons[updated.id] = _serialize(updated);
                }
                _save();
                if (successCallback) {
                    successCallback();
                }

                utils.forEach(privateData.listeners, function (listener) {
                    var i, watched = [];

                    for (i in persons) {
                        watched.push(new Person(_data.persons[persons[i].id]));
                    }
                    listener.onpersonsupdated(watched);
                });
            }, 1);
        }
        _validateCallbackType(successCallback, errorCallback, _updateBatch);
    }

    function remove(personId) {
        if (!_security.all && !_security.remove) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (typeof personId !== "string" || !personId) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!_data.persons[personId]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        _replacePerson(personId, null);
        _save();

        utils.forEach(privateData.listeners, function (listener) {
            listener.onpersonsremoved([personId]);
        });
    }

    function removeBatch(personIds, successCallback, errorCallback) {
        function _removeBatch() {
            var i;

            if (!_security.all && !_security.removeBatch) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }
            if (!tizen1_utils.isValidArray(personIds) || (personIds.length === 0)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            for (i in personIds) {
                if (typeof personIds[i] !== "string" || !personIds[i]) {
                    throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                }
            }

            window.setTimeout(function () {
                var i;

                for (i in personIds) {
                    if (!_data.persons[personIds[i]]) {
                        if (errorCallback) {
                            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                        }
                        return;
                    }
                }
                for (i in personIds) {
                    _replacePerson(personIds[i], null);
                }
                _save();
                if (successCallback) {
                    successCallback();
                }

                utils.forEach(privateData.listeners, function (listener) {
                    listener.onpersonsremoved(personIds);
                });
            }, 1);
        }
        _validateCallbackType(successCallback, errorCallback, _removeBatch);
    }

    function find(successCallback, errorCallback, filter, sortMode) {
        function _find() {
            var i, matched = [], result = [];

            if (!_security.all && !_security.find) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }

            if (filter) {
                switch (_filterType(filter)) {
                case 0:
                    throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);

                case 1:
                    //TODO:
                    //"compositeFilter doesn't support"
                    throw new WebAPIException(errorcode.NOT_SUPPORTED_ERR);

                case 2:
                case 3:
                    break;
                }
            }

            if (sortMode && !_checkSortMode(sortMode)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }

            if (filter === null || filter === undefined) {
                utils.forEach(_data.persons, function (person) {
                    matched.push(person);
                });
            } else {
                switch (filter.attributeName) {
                case "id":
                case "displayName":
                case "photoURI":
                case "ringtoneURI":
                case "displayContactId":
                    matched = tizen1_utils.matchAttributeFilter(_data.persons,
                            filter.attributeName, filter.matchFlag, filter.matchValue);
                    break;

                case "contactCount":
                    if (filter.matchFlag !== "EXACTLY" || typeof filter.matchValue !== "number") {
                        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                    }
                    matched = tizen1_utils.matchAttributeFilter(_data.persons,
                            filter.attributeName, filter.matchFlag, filter.matchValue);
                    break;

                case "hasPhoneNumber":
                case "hasEmail":
                case "isFavorite":
                    if (filter.matchFlag !== "EXACTLY" || typeof filter.matchValue !== "boolean") {
                        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                    }
                    matched = tizen1_utils.matchAttributeBooleanFilter(_data.persons,
                            filter.attributeName, filter.matchValue);
                    break;

                default:
                    break;
                }
            }

            if (sortMode) {
                _sort(matched, sortMode);
            }

            for (i in matched) {
                result.push(new Person(matched[i]));
            }
            successCallback(result);
        }
        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "find", _find);
    }

    function addChangeListener(successCallback) {
        var id;

        if (!_security.all && !_security.addChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if ((Object.prototype.toString.call(successCallback) !== "[object Object]") ||
            (typeof successCallback.onpersonsadded !== "function" ||
             typeof successCallback.onpersonsupdated !== "function" ||
             typeof successCallback.onpersonsremoved !== "function")) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        id = ++privateData.nListener;
        privateData.listeners[id] = successCallback;

        return id;
    }

    function removeChangeListener(watchId) {
        if (!_security.all && !_security.removeChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (typeof watchId !== "number") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (watchId === 0) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (privateData.listeners[watchId] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        delete privateData.listeners[watchId];
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;
        for (subFeature in subFeatures) {
            if (_security[subFeature].length === 0) {
                _security.all = true;
                return;
            }
            _security.all = false;
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    contact = {
        getAddressBooks:       getAddressBooks,
        getDefaultAddressBook: getDefaultAddressBook,
        getAddressBook:        getAddressBook,

        get:                   get,
        update:                update,
        updateBatch:           updateBatch,
        remove:                remove,
        removeBatch:           removeBatch,
        find:                  find,
        addChangeListener:     addChangeListener,
        removeChangeListener:  removeChangeListener,
        handleSubFeatures:     handleSubFeatures
    };

    return contact;
};

AddressBook = function (id, name, readOnly, dbContacts, dbGroups) {
    var addressBook,
        privateData = new AddressBookData(dbContacts, dbGroups);

    // public
    function get(id) {
        if (typeof id !== "string") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!privateData.contacts[id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        return new ContactPublic(privateData.contacts[id]);
    }

    function add(contact) {
        var added, person;

        if (!_security.all && !_security.add) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (addressBook.readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!_checkContactProperties(contact)) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }

        added = new ContactPrivate(contact, true);
        privateData.contacts[added.id] = added;

        person = new PersonBuilder(added);
        _data.persons[person.id] = person;

        added.personId = person.id;
        added.addressBookId = id;

        dbContacts[added.id] = _serialize(added);
        _data.dbStorage.persons[person.id] = _serialize(_data.persons[person.id]);
        _save();

        contact.id            = added.id;
        contact.personId      = added.personId;
        contact.addressBookId = added.addressBookId;
        contact.lastUpdated   = added.lastUpdated;

        utils.forEach(privateData.listeners, function (listener) {
            listener.oncontactsadded([new ContactPublic(added)]);
        });
    }

    function addBatch(contacts, successCallback, errorCallback) {
        function _addBatch() {
            var i;

            if (!_security.all && !_security.addBatch) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }
            if (addressBook.readOnly) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }
            if (!tizen1_utils.isValidArray(contacts)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (contacts.length === 0) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            for (i in contacts) {
                if (!_checkPersonProperties(contacts[i])) {
                    throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                }
            }
            window.setTimeout(function () {
                var i, added, person;

                for (i in contacts) {
                    added = new ContactPrivate(contacts[i], true);
                    privateData.contacts[added.id] = added;

                    person = new PersonBuilder(added);
                    _data.persons[person.id] = person;

                    added.personId = person.id;
                    added.addressBookId = id;

                    dbContacts[added.id] = _serialize(added);
                    _data.dbStorage.persons[person.id] = _serialize(_data.persons[person.id]);

                    contacts[i] = new ContactPublic(added);
                }
                _save();
                if (successCallback) {
                    successCallback(contacts);
                }

                utils.forEach(privateData.listeners, function (listener) {
                    var i, watched = [];

                    for (i in contacts) {
                        watched.push(new ContactPublic(contacts[i]));
                    }
                    listener.oncontactsadded(watched);
                });
            }, 1);
        }

        _validateCallbackType(successCallback, errorCallback, _addBatch);
    }

    function update(contact) {
        var updated;

        if (!_security.all && !_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (addressBook.readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!_checkContactProperties(contact)) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (!contact.id || !privateData.contacts[contact.id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        updated = new ContactPrivate(contact, false);

        privateData.contacts[updated.id] = updated;
        dbContacts[updated.id] = _serialize(updated);
        _save();

        utils.forEach(privateData.listeners, function (listener) {
            listener.oncontactsupdated([new ContactPublic(updated)]);
        });
    }

    function updateBatch(contacts, successCallback, errorCallback) {
        function _updateBatch() {
            var i;

            if (!_security.all && !_security.updateBatch) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }
            if (addressBook.readOnly) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }
            if (!tizen1_utils.isValidArray(contacts) || (contacts.length === 0)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            for (i in contacts) {
                if (!_checkPersonProperties(contacts[i])) {
                    throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                }
            }
            window.setTimeout(function () {
                var i, updated;

                for (i in contacts) {
                    if (!contacts[i].id || !privateData.contacts[contacts[i].id]) {
                        if (errorCallback) {
                            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                        }
                        return;
                    }
                }
                for (i in contacts) {
                    updated = new ContactPrivate(contacts[i], false);

                    privateData.contacts[updated.id] = updated;
                    dbContacts[updated.id] = _serialize(updated);
                }
                _save();
                if (successCallback) {
                    successCallback();
                }

                utils.forEach(privateData.listeners, function (listener) {
                    var i, watched = [];

                    for (i in contacts) {
                        watched.push(new ContactPublic(
                            privateData.contacts[contacts[i].id]));
                    }
                    listener.oncontactsupdated(watched);
                });
            }, 1);
        }

        _validateCallbackType(successCallback, errorCallback, _updateBatch);
    }

    function remove(id) {
        if (!_security.all && !_security.remove) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (addressBook.readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (typeof id !== "string" || !id) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!privateData.contacts[id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        delete privateData.contacts[id];
        if (dbContacts[id]) {
            delete dbContacts[id];
        }
        _save();

        utils.forEach(privateData.listeners, function (listener) {
            listener.oncontactsremoved([id]);
        });
    }

    function removeBatch(ids, successCallback, errorCallback) {
        function _removeBatch() {
            var i;

            if (!_security.all && !_security.removeBatch) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }
            if (addressBook.readOnly) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }
            if (!tizen1_utils.isValidArray(ids)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (ids.length === 0) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            for (i in ids) {
                if (typeof ids[i] !== "string" || !ids[i]) {
                    throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                }
            }

            window.setTimeout(function () {
                var i;

                for (i in ids) {
                    if (!privateData.contacts[ids[i]]) {
                        if (errorCallback) {
                            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                        }
                        return;
                    }
                }
                for (i in ids) {
                    delete privateData.contacts[ids[i]];
                    if (dbContacts[ids[i]]) {
                        delete dbContacts[ids[i]];
                    }
                }
                _save();
                if (successCallback) {
                    successCallback();
                }

                utils.forEach(privateData.listeners, function (listener) {
                    listener.oncontactsremoved(ids);
                });
            }, 1);
        }

        _validateCallbackType(successCallback, errorCallback, _removeBatch);
    }

    function find(successCallback, errorCallback, filter, sortMode) {
        function _find() {
            var result = [], result2 = [], begin, end, i,
                atr, _re, errFlag = false, _rangeMatch, low, high, matched,
                _existMatch, _arrayMatch;

            if (!_security.all && !_security.find) {
                throw new WebAPIException(errorcode.SECURITY_ERR);
            }

            if (filter) {
                switch (_filterType(filter)) {
                case 0:
                    throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                case 1:
                    //TODO:
                    //"compositeFilter doesn't support"
                    throw new WebAPIException(errorcode.NOT_SUPPORTED_ERR);
                case 2:
                case 3:
                    break;
                }
            }

            /* return all contacts if no filter argument */
            if (filter === null || filter === undefined) {
                utils.forEach(privateData.contacts, function (contact) {
                    result.push(new ContactPublic(contact));
                });
                successCallback(result);
                return;
            }

            /* check composition of filter.attributeName */
            switch (filter.attributeName) {
            case "id" :
            case "personId" :
            case "addressBookId" :
            case "name.prefix" :
            case "name.suffix" :
            case "name.firstName" :
            case "name.middleName" :
            case "name.lastName" :
            case "name.phoneticFirstName" :
            case "name.phoneticLastName" :
            case "name.displayName" :
            case "account.accountServiceId" :
            case "account.contactURI" :
            case "photoURI" :
            case "ringtoneURI" :
                result = tizen1_utils.matchAttributeFilter(privateData.contacts,
                        filter.attributeName, filter.matchFlag, filter.matchValue);
                break;
            case "name.nicknames" :
            case "notes" :
            case "groupIds" :
                result = tizen1_utils.matchAttributeArrayFilter(privateData.contacts,
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
            case "organizations.name" :
            case "organizations.department" :
            case "organizations.title" :
            case "organizations.role" :
            case "organizations.logoURI" :
            case "urls.url" :
            case "urls.type" :
                atr = filter.attributeName.split(".");
                _existMatch = function (obj) {
                    return (obj[atr[0]] !== undefined);
                };

                if (filter.matchValue === undefined || filter.matchFlag === "EXISTS") {
                    result = utils.filter(privateData.contacts, _existMatch);
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

                _arrayMatch = function (obj) {
                    return (obj[atr[0]].some(function (o) {
                        if (typeof o[atr[1]] !== "string") {
                            return false;
                        } else {
                            return (o[atr[1]].search(_re) !== -1);
                        }
                    }));
                };

                result = utils.filter(privateData.contacts, _arrayMatch);
                break;
            case "addresses.types" :
            case "phoneNumbers.types" :
            case "emails.types" :
                atr = filter.attributeName.split(".");
                _existMatch = function (obj) {
                    return (obj[atr[0]].some(function (o) {
                        return (o[atr[1]] !== undefined);
                    }));
                };

                if (filter.matchValue === undefined || filter.matchFlag === "EXISTS") {
                    result = utils.filter(privateData.contacts, _existMatch);
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

                _arrayMatch = function (obj) {
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

                result = utils.filter(privateData.contacts, _arrayMatch);
                break;
            case "anniversaries.date" :
                low = filter.initialValue;
                high = filter.endValue;
                atr = filter.attributeName.split(".");

                if (low !== undefined && low !== null) {
                    if (!tizen1_utils.isValidDate(low)) {
                        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                    }
                }
                if (high !== undefined && high !== null) {
                    if (!tizen1_utils.isValidDate(high)) {
                        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                    }
                }

                _rangeMatch = function (obj) {
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

                result = utils.filter(privateData.contacts, _rangeMatch);
                break;
            case "addresses.isDefault" :
            case "phoneNumbers.isDefault" :
            case "emails.isDefault" :
                break;
            case "isFavorite" :
                if (filter.matchFlag !== "EXACTLY" || typeof filter.matchValue !== "boolean") {
                    throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                } else {
                    result = tizen1_utils.matchAttributeBooleanFilter(privateData.contacts,
                            filter.attributeName, filter.matchValue);
                }
                break;
            case "birthday" :
                begin = filter.initialValue;
                end = filter.endValue;

                if (begin !== null && begin !== undefined) {
                    if (!tizen1_utils.isValidDate(begin)) {
                        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                    }
                }

                if (end !== null && end !== undefined) {
                    if (!tizen1_utils.isValidDate(end)) {
                        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
                    }
                }

                result = tizen1_utils.matchAttributeRangeFilter(privateData.contacts,
                        filter.attributeName, begin, end);
                break;
            default:
                throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
            }
            for (i in result) {
                result2.push(new ContactPublic(result[i]));
            }
            successCallback(result2);
        }

        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "find", _find);
    }

    function addChangeListener(successCallback, errorCallback) {
        var id;

        if (!_security.all && !_security.addChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if ((Object.prototype.toString.call(successCallback) !== "[object Object]") ||
            (typeof successCallback.oncontactsadded !== "function" ||
             typeof successCallback.oncontactsupdated !== "function" ||
             typeof successCallback.oncontactsremoved !== "function")) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (errorCallback) {
            if (typeof errorCallback !== "function") {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
        }

        id = ++privateData.nListener;
        privateData.listeners[id] = successCallback;

        return id;
    }

    function removeChangeListener(watchId) {
        if (!_security.all && !_security.removeChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (typeof watchId !== "number") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (watchId === 0) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (privateData.listeners[watchId] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        delete privateData.listeners[watchId];
    }

    function getGroup(groupId) {
        var i;

        if (typeof groupId !== "string") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        for (i in privateData.groups) {
            if (privateData.groups[i].id === groupId)
                break;
        }
        if (privateData.groups[i] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        return new ContactGroup(privateData.groups[i]);
    }

    function addGroup(group) {
        if (!_security.all && !_security.addGroup) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (Object.prototype.toString.call(group) !== "[object Object]") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!_checkGroupProperties(group)) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }

        group.id = Math.uuid(null, 16);
        group.addressBookId = id;

        privateData.groups.push(utils.copy(group));
        _save();
    }

    function updateGroup(group) {
        var i;

        if (!_security.all && !_security.updateGroup) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (Object.prototype.toString.call(group) !== "[object Object]") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        for (i in privateData.groups) {
            if (privateData.groups[i].id === group.id)
                break;
        }
        if (privateData.groups[i].id === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        if (privateData.groups[i].readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!_checkGroupProperties(group)) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        privateData.groups[i] = utils.copy(group);
        _save();
    }

    function removeGroup(groupId) {
        var i;

        if (!_security.all && !_security.removeGroup) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (typeof groupId !== "string") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        for (i in privateData.groups) {
            if (privateData.groups[i].id === groupId)
                break;
        }
        if (privateData.groups[i].id === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        if (privateData.groups[i].readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        privateData.groups.splice(i);
        _save();
    }

    function getGroups() {
        var groups = [], i;

        if (!_security.all && !_security.getGroups) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        for (i in privateData.groups) {
            groups.push(new ContactGroup(privateData.groups[i]));
        }
        return groups;
    }

    privateData.load();
    // Make private contacts accessible for Person methods
    _data.contacts[id] = privateData.contacts;

    addressBook = {
        get:                  get,
        add:                  add,
        addBatch:             addBatch,
        update:               update,
        updateBatch:          updateBatch,
        remove:               remove,
        removeBatch:          removeBatch,
        find:                 find,
        addChangeListener:    addChangeListener,
        removeChangeListener: removeChangeListener,

        getGroup:             getGroup,
        addGroup:             addGroup,
        updateGroup:          updateGroup,
        removeGroup:          removeGroup,
        getGroups:            getGroups
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
};

AddressBookData = function (contacts, groups) {
    var addressBookData;

    // private
    function loadContacts() {
        for (var i in contacts) {
            addressBookData.contacts[i] = new ContactPrivate(contacts[i], false);
        }
    }

    function loadGroups() {
        addressBookData.groups = groups;
    }

    // public
    function load() {
        loadContacts();
        loadGroups();
    }

    addressBookData = {
        contacts:  {},
        groups:    [],
        listeners: {},
        nListener: 0,
        load:      load
    };

    return addressBookData;
};

AddressBookStorage = function (id, name, readOnly, contacts, groups) {
    this.id       = id;
    this.name     = name;
    this.readOnly = readOnly;
    this.contacts = contacts;
    this.groups   = groups;
};

ContactData = function () {
    this.listeners = {};
    this.nListener = 0;
};

ContactPublic = function (prop) {
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
    _self.__defineGetter__("personId", function () {
        return prop.personId;
    });
    _self.__defineGetter__("addressBookId", function () {
        return prop.addressBookId;
    });
    _self.__defineGetter__("lastUpdated", function () {
        return prop.lastUpdated;
    });
    _self.__defineGetter__("isFavorite", function () {
        return prop.isFavorite;
    });

    return _self;
};

ContactPrivate = function (prop, newID) {
    var _self;

    _self = new Contact(prop);

    if (newID) {
        _self.id            = Math.uuid(null, 16);
        _self.lastUpdated   = new Date();
    } else {
        _self.id            = prop.id;
        _self.personId      = prop.personId;
        _self.addressBookId = prop.addressBookId;
        _self.lastUpdated   = new Date(prop.lastUpdated);
    }

    return _self;
};

ContactGroup = function (groupInitDict) {
    var id, addressBookId, readOnly;

    this.__defineGetter__("id", function () {
        return id;
    });

    this.__defineGetter__("addressBookId", function () {
        return addressBookId;
    });

    this.__defineGetter__("readOnly", function () {
        return readOnly;
    });

    id               = groupInitDict.id || null;
    addressBookId    = groupInitDict.addressBookId || null;
    readOnly         = groupInitDict.readOnly || false;

    this.name        = groupInitDict.name || "";
    this.ringtoneURI = groupInitDict.ringtoneURI || null;
    this.photoURI    = groupInitDict.photoURI || null;
};

Person = function (personInitDict) {
    var id, displayName, hasPhoneNumber, hasEmail;

    this.__defineGetter__("id", function () {
        return id;
    });

    this.__defineGetter__("displayName", function () {
        return displayName;
    });

    this.__defineGetter__("contactCount", function () {
        var idab, idc, contactCount = 0;

        for (idab in _data.contacts) {
            for (idc in _data.contacts[idab]) {
                if (_data.contacts[idab][idc].personId === id) {
                    ++contactCount;
                }
            }
        }

        return contactCount;
    });

    this.__defineGetter__("hasPhoneNumber", function () {
        return hasPhoneNumber;
    });

    this.__defineGetter__("hasEmail", function () {
        return hasEmail;
    });

    id                    = personInitDict.id || Math.uuid(null, 16);
    displayName           = personInitDict.displayName || "";
    hasPhoneNumber        = personInitDict.hasPhoneNumber;
    hasEmail              = personInitDict.hasEmail;

    this.isFavorite       = personInitDict.isFavorite || false;
    this.photoURI         = personInitDict.photoURI || null;
    this.ringtoneURI      = personInitDict.ringtoneURI || null;
    this.displayContactId = personInitDict.displayContactId;

    this.link = function (personId) {
        if (!_security.all && !_security.link) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (typeof personId !== "string" || !personId) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!_data.persons[personId]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        _replacePerson(personId, id);
        _save();
    };

    this.unlink = function (contactId) {
        var idab, contact, separated, i, dbAddressBook;

        if (!_security.all && !_security.unlink) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (typeof contactId !== "string" || !contactId) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        for (idab in _data.contacts) {
            if (_data.contacts[idab][contactId] !== undefined) {
                contact = _data.contacts[idab][contactId];
                break;
            }
        }

        if (!contact) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        if (contact.personId !== id) {
            throw new WebAPIException(errorcode.UNKNOWN_ERR);
        }

        separated = new PersonBuilder(contact);
        _data.persons[separated.id] = separated;
        contact.personId = separated.id;

        _data.dbStorage.persons[separated.id] = _serialize(separated);
        for (i in _data.dbStorage.addressBooks) {
            dbAddressBook = _data.dbStorage.addressBooks[i];
            if (dbAddressBook.id === idab) {
                dbAddressBook.contacts[contact.id].personId = separated.id;
                break;
            }
        }
        _save();

        return separated;
    };
};

PersonBuilder = function (contact) {
    var person, personInitDict = {};

    personInitDict.displayName      = contact.name.displayName;
    personInitDict.hasPhoneNumber   = (contact.phoneNumbers.length !== 0);
    personInitDict.hasEmail         = (contact.emails.length !== 0);
    personInitDict.displayContactId = contact.id;

    person = new Person(personInitDict);

    return person;
};

module.exports = _self;
