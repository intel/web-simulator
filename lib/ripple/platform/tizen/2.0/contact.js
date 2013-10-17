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

var db = require('ripple/db'),
    decorator = require('ripple/platform/tizen/2.0/decorator'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    utils = require('ripple/utils'),
    ContactName = require('ripple/platform/tizen/2.0/ContactName'),
    ContactAddress = require('ripple/platform/tizen/2.0/ContactAddress'),
    ContactPhoneNumber = require('ripple/platform/tizen/2.0/ContactPhoneNumber'),
    ContactEmailAddress = require('ripple/platform/tizen/2.0/ContactEmailAddress'),
    ContactAnniversary = require('ripple/platform/tizen/2.0/ContactAnniversary'),
    ContactOrganization = require('ripple/platform/tizen/2.0/ContactOrganization'),
    ContactWebSite = require('ripple/platform/tizen/2.0/ContactWebSite'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    AddressBook,
    AddressBookData,
    AddressBookStorage,
    Contact,
    ContactData,
    ContactInternal,
    ContactGroup,
    Person,
    PersonBuilder,
    _data = {
        DB_CONTACT_KEY: "tizen1-contact",
        addressBooks:   [],
        contacts:       {},
        persons:        {},
        contactData:    {},
        dbStorage:      {}
    },
    _security = {
        "http://tizen.org/privilege/contact.read": ["getAddressBooks",
                "getUnifiedAddressBook", "getDefaultAddressBook",
                "getAddressBook", "get", "find", "addChangeListener",
                "removeChangeListener", "getGroup", "getGroups", "clone"],
        "http://tizen.org/privilege/contact.write": ["add", "addBatch",
                "update", "updateBatch", "remove", "removeBatch", "addGroup",
                "updateGroup", "removeGroup", "link", "unlink"]
    },
    _self;

function _get() {
    _data.dbStorage = db.retrieveObject(_data.DB_CONTACT_KEY) ||
            {addressBooks: [], persons: {}};
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
                if (newId === null) {
                    delete _data.contacts[idab][idc];
                } else {
                    contact.personId = newId;
                }
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
                if (newId === null) {
                    delete dbAddressBook.contacts[idc];
                } else {
                    contact.personId = newId;
                }
            }
        }
    }

    if (_data.dbStorage.persons[oldId]) {
        delete _data.dbStorage.persons[oldId];
    }
}

_self = function () {
    var contact;

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
        if (!_security.getAddressBooks) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("getAddressBooks", arguments);

        if (_data.addressBooks.length === 0) {
            loadAddressBooks();
        }
        successCallback(_data.addressBooks);
    }

    function getUnifiedAddressBook() {
        if (!_security.getUnifiedAddressBook) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (_data.addressBooks.length === 0) {
            loadAddressBooks();
        }
        return _data.addressBooks[0];
    }

    function getDefaultAddressBook() {
        if (!_security.getDefaultAddressBook) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (_data.addressBooks.length === 0) {
            loadAddressBooks();
        }
        return _data.addressBooks[0];
    }

    function getAddressBook(addressBookId) {
        var i;

        if (!_security.getAddressBook) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("getAddressBook", arguments);

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
        if (!_security.get) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("get", arguments);

        if (_data.persons[personId] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        return new Person(_data.persons[personId]);
    }

    function update(person) {
        var updated;

        if (!_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("update", arguments);

        if (!person.id) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (_data.persons[person.id] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        updated = new Person(person);

        _data.persons[updated.id] = updated;
        _data.dbStorage.persons[updated.id] = _serialize(updated);
        _save();

        window.setTimeout(function () {
            utils.forEach(_data.contactData.listeners, function (listener) {
                listener.onpersonsupdated([new Person(updated)]);
            });
        }, 1);
    }

    function updateBatch(persons, successCallback, errorCallback) {
        if (!_security.updateBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("updateBatch", arguments, true);

        window.setTimeout(function () {
            var i, updated;

            if (persons.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                }
                return;
            }

            for (i in persons) {
                if (!persons[i].id) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                    }
                    return;
                }
                if (_data.persons[persons[i].id] === undefined) {
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

            utils.forEach(_data.contactData.listeners, function (listener) {
                var i, watched = [];

                for (i in persons) {
                    watched.push(new Person(_data.persons[persons[i].id]));
                }
                listener.onpersonsupdated(watched);
            });
        }, 1);
    }

    function remove(personId) {
        if (!_security.remove) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("remove", arguments);

        if (_data.persons[personId] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        _replacePerson(personId, null);
        _save();

        window.setTimeout(function () {
            utils.forEach(_data.contactData.listeners, function (listener) {
                listener.onpersonsremoved([personId]);
            });
        }, 1);
    }

    function removeBatch(personIds, successCallback, errorCallback) {
        if (!_security.removeBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("removeBatch", arguments, true);

        window.setTimeout(function () {
            var i;

            if (personIds.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                }
                return;
            }

            for (i in personIds) {
                if (!personIds[i]) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                    }
                    return;
                }
                if (_data.persons[personIds[i]] === undefined) {
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

            utils.forEach(_data.contactData.listeners, function (listener) {
                listener.onpersonsremoved(utils.copy(personIds));
            });
        }, 1);
    }

    function find(successCallback, errorCallback, filter, sortMode) {
        if (!_security.find) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("find", arguments, true);

        window.setTimeout(function () {
            var i, matched = [], result = [];

            if (filter) {
                switch (_filterType(filter)) {
                case 0:
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                    }
                    return;

                case 1:
                    //TODO:
                    //"compositeFilter doesn't support"
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.NOT_SUPPORTED_ERR));
                    }
                    return;

                case 2:
                case 3:
                    break;
                }
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
                    if ((filter.matchFlag !== "EXACTLY") ||
                            (typeof filter.matchValue !== "number")) {
                        if (errorCallback) {
                            errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                        }
                        return;
                    }
                    matched = tizen1_utils.matchAttributeFilter(_data.persons,
                            filter.attributeName, filter.matchFlag, filter.matchValue);
                    break;

                case "hasPhoneNumber":
                case "hasEmail":
                case "isFavorite":
                    if ((filter.matchFlag !== "EXACTLY") ||
                            (typeof filter.matchValue !== "boolean")) {
                        if (errorCallback) {
                            errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                        }
                        return;
                    }
                    matched = tizen1_utils.matchAttributeBooleanFilter(_data.persons,
                            filter.attributeName, filter.matchValue);
                    break;

                default:
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                    }
                    return;
                }
            }

            if (sortMode) {
                _sort(matched, sortMode);
            }

            for (i in matched) {
                result.push(new Person(matched[i]));
            }

            successCallback(result);
        }, 1);
    }

    function addChangeListener(successCallback) {
        var id;

        if (!_security.addChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("addChangeListener", arguments);

        id = ++_data.contactData.nListener;
        _data.contactData.listeners[id] = successCallback;

        return id;
    }

    function removeChangeListener(watchId) {
        if (!_security.removeChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContactManager("removeChangeListener", arguments);

        if (_data.contactData.listeners[watchId] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        delete _data.contactData.listeners[watchId];
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    _data.contactData = new ContactData();

    contact = {
        getAddressBooks:       getAddressBooks,
        getUnifiedAddressBook: getUnifiedAddressBook,
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

    // private
    function addNewContact(contact, external) {
        var added, person;

        added = new ContactInternal(contact);
        privateData.contacts[added.id] = added;

        person = new PersonBuilder(added);
        _data.persons[person.id] = person;

        added.personId = person.id;
        added.addressBookId = id;

        dbContacts[added.id] = _serialize(added);
        _data.dbStorage.persons[person.id] = _serialize(_data.persons[person.id]);

        decorator.Contact(external, added);
    }

    // public
    function get(id) {
        if (!_security.get) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("get", arguments);

        if (privateData.contacts[id] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        return new Contact(privateData.contacts[id]);
    }

    function add(contact) {
        var external = contact;

        if (!_security.add) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (addressBook.readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("add", arguments, true);

        addNewContact(contact, external);
        _save();

        window.setTimeout(function () {
            utils.forEach(privateData.listeners, function (listener) {
                listener.oncontactsadded([new Contact(external)]);
            });
            utils.forEach(_data.contactData.listeners, function (listener) {
                listener.onpersonsadded([new Person(_data.persons[external.personId])]);
            });
        }, 1);
    }

    function addBatch(contacts, successCallback, errorCallback) {
        var external = contacts;
        if (!_security.addBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (addressBook.readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("addBatch", arguments, true);

        window.setTimeout(function () {
            var i, personIds = [];

            if (contacts.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                }
                return;
            }

            for (i in contacts) {
                addNewContact(contacts[i], external[i]);
                personIds.push(external[i].personId);
            }
            _save();
            if (successCallback) {
                successCallback(external);
            }

            utils.forEach(privateData.listeners, function (listener) {
                var i, watched = [];

                for (i in contacts) {
                    watched.push(new Contact(external[i]));
                }
                listener.oncontactsadded(watched);
            });
            utils.forEach(_data.contactData.listeners, function (listener) {
                var i, watched = [];

                for (i in personIds) {
                    watched.push(new Person(_data.persons[personIds[i]]));
                }
                listener.onpersonsadded(watched);
            });
        }, 1);
    }

    function update(contact) {
        var updated;

        if (!_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (addressBook.readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("update", arguments);

        if (!contact.id) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (privateData.contacts[contact.id] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        updated = new ContactInternal(contact);

        privateData.contacts[updated.id] = updated;
        dbContacts[updated.id] = _serialize(updated);
        _save();

        window.setTimeout(function () {
            utils.forEach(privateData.listeners, function (listener) {
                listener.oncontactsupdated([new Contact(updated)]);
            });
        }, 1);
    }

    function updateBatch(contacts, successCallback, errorCallback) {
        if (!_security.updateBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (addressBook.readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("updateBatch", arguments, true);

        window.setTimeout(function () {
            var i, updated;

            if (contacts.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                }
                return;
            }

            for (i in contacts) {
                if (!contacts[i].id) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                    }
                    return;
                }
                if (privateData.contacts[contacts[i].id] === undefined) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                    }
                    return;
                }
            }
            for (i in contacts) {
                updated = new ContactInternal(contacts[i]);

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
                    watched.push(new Contact(
                        privateData.contacts[contacts[i].id]));
                }
                listener.oncontactsupdated(watched);
            });
        }, 1);
    }

    function remove(id) {
        if (!_security.remove) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (addressBook.readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("remove", arguments);

        if (privateData.contacts[id] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        delete privateData.contacts[id];
        if (dbContacts[id]) {
            delete dbContacts[id];
        }
        _save();

        window.setTimeout(function () {
            utils.forEach(privateData.listeners, function (listener) {
                listener.oncontactsremoved([id]);
            });
        }, 1);
    }

    function removeBatch(ids, successCallback, errorCallback) {
        if (!_security.removeBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (addressBook.readOnly) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("removeBatch", arguments, true);

        window.setTimeout(function () {
            var i;

            if (ids.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                }
                return;
            }

            for (i in ids) {
                if (!ids[i]) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                    }
                    return;
                }
                if (privateData.contacts[ids[i]] === undefined) {
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
                listener.oncontactsremoved(utils.copy(ids));
            });
        }, 1);
    }

    function find(successCallback, errorCallback, filter, sortMode) {
        if (!_security.find) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("find", arguments, true);

        window.setTimeout(function () {
            var result = [], begin, end, i, atr, _re, errFlag = false,
                _rangeMatch, low, high, matched, _existMatch, _arrayMatch;

            if (filter) {
                switch (_filterType(filter)) {
                case 0:
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                    }
                    return;

                case 1:
                    //TODO:
                    //"compositeFilter doesn't support"
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.NOT_SUPPORTED_ERR));
                    }
                    return;

                case 2:
                case 3:
                    break;
                }
            }

            /* return all contacts if no filter argument */
            if (filter === null || filter === undefined) {
                utils.forEach(privateData.contacts, function (contact) {
                    result.push(new Contact(contact));
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
                matched = tizen1_utils.matchAttributeFilter(privateData.contacts,
                        filter.attributeName, filter.matchFlag, filter.matchValue);
                break;

            case "name.nicknames" :
            case "notes" :
            case "groupIds" :
                matched = tizen1_utils.matchAttributeArrayFilter(privateData.contacts,
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
                    matched = utils.filter(privateData.contacts, _existMatch);
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
                    matched = [];
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

                matched = utils.filter(privateData.contacts, _arrayMatch);
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
                    matched = utils.filter(privateData.contacts, _existMatch);
                    break;
                }

                errFlag = false;

                switch (filter.matchFlag) {
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
                    matched = [];
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

                matched = utils.filter(privateData.contacts, _arrayMatch);
                break;

            case "anniversaries.date" :
                low = filter.initialValue;
                high = filter.endValue;
                atr = filter.attributeName.split(".");

                _rangeMatch = function (obj) {
                    var isMatched = true;
                    if (low !== null && low !== undefined) {
                        if (!tizen1_utils.isValidArray(obj[atr[0]])) {
                            isMatched = false;
                        } else {
                            isMatched = (obj[atr[0]].some(function (o) {
                                return (o[atr[1]] >= low);
                            }));
                        }
                    }
                    if (isMatched && (high !== null && high !== undefined)) {
                        if (!tizen1_utils.isValidArray(obj[atr[0]])) {
                            isMatched = false;
                        } else {
                            isMatched = (obj[atr[0]].some(function (o) {
                                return (o[atr[1]] <= high);
                            }));
                        }
                    }
                    return isMatched;
                };

                matched = utils.filter(privateData.contacts, _rangeMatch);
                break;

            case "addresses.isDefault" :
            case "phoneNumbers.isDefault" :
            case "emails.isDefault" :
                break;

            case "isFavorite" :
                if (filter.matchFlag !== "EXACTLY" || typeof filter.matchValue !== "boolean") {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                    }
                    return;
                } else {
                    matched = tizen1_utils.matchAttributeBooleanFilter(privateData.contacts,
                            filter.attributeName, filter.matchValue);
                }
                break;

            case "birthday" :
                begin = filter.initialValue;
                end = filter.endValue;

                matched = tizen1_utils.matchAttributeRangeFilter(privateData.contacts,
                        filter.attributeName, begin, end);
                break;

            default:
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                }
                return;
            }

            if (sortMode) {
                _sort(matched, sortMode);
            }

            for (i in matched) {
                result.push(new Contact(matched[i]));
            }

            successCallback(result);
        }, 1);
    }

    function addChangeListener(successCallback, errorCallback) {
        var id;

        if (!_security.addChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("addChangeListener", arguments);

        id = ++privateData.nListener;
        privateData.listeners[id] = successCallback;

        return id;
    }

    function removeChangeListener(watchId) {
        if (!_security.removeChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("removeChangeListener", arguments);

        if (privateData.listeners[watchId] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        delete privateData.listeners[watchId];
    }

    function getGroup(groupId) {
        var i;

        if (!_security.getGroup) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("getGroup", arguments);

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
        var external = group;

        if (!_security.addGroup) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("addGroup", arguments, true);

        group.id            = Math.uuid(null, 16);
        group.addressBookId = id;

        external.__defineGetter__("id", function () {
            return group.id;
        });

        external.__defineGetter__("addressBookId", function () {
            return group.addressBookId;
        });

        privateData.groups.push(group);
        _save();
    }

    function updateGroup(group) {
        var i;

        if (!_security.updateGroup) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("updateGroup", arguments);

        if (!group.id) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
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
        privateData.groups[i] = utils.copy(group);
        _save();
    }

    function removeGroup(groupId) {
        var i;

        if (!_security.removeGroup) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.AddressBook("removeGroup", arguments);

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

        privateData.groups.splice(i, 1);
        _save();
    }

    function getGroups() {
        var groups = [], i;

        if (!_security.getGroups) {
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
            addressBookData.contacts[i] = new ContactInternal(contacts[i]);
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

Contact = function (contact) {
    var i, attr, arr;

    this.name          = null;
    this.addresses     = [];
    this.photoURI      = null;
    this.phoneNumbers  = [];
    this.emails        = [];
    this.birthday      = null;
    this.anniversaries = [];
    this.organizations = [];
    this.notes         = [];
    this.urls          = [];
    this.ringtoneURI   = null;
    this.groupIds      = [];

    for (attr in contact) {
        switch (attr) {
        case "name":
            this[attr] = new ContactName(contact[attr]);
            break;

        case "addresses":
            arr = contact[attr];
            if (arr) {
                for (i in arr) {
                    this[attr][i] = new ContactAddress(arr[i]);
                }
            }
            break;

        case "phoneNumbers":
            arr = contact[attr];
            if (arr) {
                for (i in arr) {
                    this[attr][i] = new ContactPhoneNumber(arr[i].number,
                            arr[i].types || null, arr[i].isDefault || null);
                }
            }
            break;

        case "emails":
            arr = contact[attr];
            if (arr) {
                for (i in arr) {
                    this[attr][i] = new ContactEmailAddress(arr[i].email,
                            arr[i].types || null, arr[i].isDefault || null);
                }
            }
            break;

        case "birthday":
            this[attr] = new Date(contact[attr]);
            break;

        case "anniversaries":
            arr = contact[attr];
            if (arr) {
                for (i in arr) {
                    if (!tizen1_utils.isValidDate(arr[i].date)) {
                        arr[i].date = new Date(arr[i].date);
                    }
                    this[attr][i] = new ContactAnniversary(arr[i].date,
                            arr[i].label || null);
                }
            }
            break;

        case "organizations":
            arr = contact[attr];
            if (arr) {
                for (i in arr) {
                    this[attr][i] = new ContactOrganization(arr[i]);
                }
            }
            break;

        case "notes":
        case "groupIds":
            arr = contact[attr];
            if (arr) {
                for (i in arr) {
                    this[attr][i] = arr[i];
                }
            }
            break;

        case "urls":
            arr = contact[attr];
            if (arr) {
                for (i in arr) {
                    this[attr][i] = new ContactWebSite(arr[i].url,
                            arr[i].type || null);
                }
            }
            break;

        default:
            this[attr] = contact[attr];
            break;
        }
    }

    decorator.Contact(this, contact);
    this.__proto__ = tizen.Contact.prototype;
};

ContactInternal = function (contact) {
    var attr;

    for (attr in contact) {
        this[attr] = contact[attr];
    }

    if (!contact.id) {
        this.id = Math.uuid(null, 16);
        this.lastUpdated = new Date();
    } else {
        this.lastUpdated = new Date(contact.lastUpdated);
    }

    if (this.name) {
        this.name.__defineGetter__("displayName", function () {
            var displayName = "";

            if (!this)
                return "";

            if ((this.firstName !== null) &&
                (this.lastName !== null)) {
                displayName = [this.firstName, this.middleName, this.lastName];
                displayName = displayName.join(" ").replace(/ +/g, " ").trim();
            } else if (this.nicknames.length !== 0) {
                this.nicknames.some(function (nickname) {
                    displayName = nickname;
                    return displayName;
                });
            }

            return displayName;
        });
    }
};

ContactData = function () {
    this.listeners = {};
    this.nListener = 0;
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

    this.__proto__ = tizen.ContactGroup.prototype;
};

Person = function (personInitDict) {
    var person = {};

    function hasContactMethod(method) {
        var idab, idc, contact, count = 0;

        for (idab in _data.contacts) {
            for (idc in _data.contacts[idab]) {
                contact = _data.contacts[idab][idc];
                if (contact.personId === person.id) {
                    count += contact[method].length;
                }
            }
        }

        return (count !== 0);
    }

    person.id               = personInitDict.id || Math.uuid(null, 16);
    person.isFavorite       = personInitDict.isFavorite || false;
    person.photoURI         = personInitDict.photoURI || null;
    person.ringtoneURI      = personInitDict.ringtoneURI || null;
    person.displayContactId = personInitDict.displayContactId;

    this.__defineGetter__("id", function () {
        return person.id;
    });

    this.__defineGetter__("displayName", function () {
        var idab, contact, displayName = "";

        for (idab in _data.contacts) {
            contact = _data.contacts[idab][this.displayContactId];

            if (contact !== undefined) {
                if (contact.name && contact.name.displayName) {
                    displayName = contact.name.displayName;
                }
                break;
            }
        }

        return displayName;
    });

    this.__defineGetter__("contactCount", function () {
        var idab, idc, contactCount = 0;

        for (idab in _data.contacts) {
            for (idc in _data.contacts[idab]) {
                if (_data.contacts[idab][idc].personId === person.id) {
                    ++contactCount;
                }
            }
        }

        return contactCount;
    });

    this.__defineGetter__("hasPhoneNumber", function () {
        return hasContactMethod("phoneNumbers");
    });

    this.__defineGetter__("hasEmail", function () {
        return hasContactMethod("emails");
    });

    this.__defineGetter__("isFavorite", function () {
        return person.isFavorite;
    });
    this.__defineSetter__("isFavorite", function (val) {
        try {
            person.isFavorite = t.boolean(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("photoURI", function () {
        return person.photoURI;
    });
    this.__defineSetter__("photoURI", function (val) {
        try {
            person.photoURI = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("ringtoneURI", function () {
        return person.ringtoneURI;
    });
    this.__defineSetter__("ringtoneURI", function (val) {
        try {
            person.ringtoneURI = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("displayContactId", function () {
        return person.displayContactId;
    });
    this.__defineSetter__("displayContactId", function (val) {
        try {
            person.displayContactId = t.ContactId(val);
        } catch (e) {
        }
    });

    this.link = function (personId) {
        if (!_security.link) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Person("link", arguments);

        if (_data.persons[personId] === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        _replacePerson(personId, person.id);
        _save();
    };

    this.unlink = function (contactId) {
        var idab, contact, separated, i, dbAddressBook;

        if (!_security.unlink) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Person("unlink", arguments);

        for (idab in _data.contacts) {
            if (_data.contacts[idab][contactId] !== undefined) {
                contact = _data.contacts[idab][contactId];
                break;
            }
        }

        if (contact === undefined) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        if (contact.personId !== person.id) {
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

    personInitDict.displayContactId = contact.id;
    person = new Person(personInitDict);

    return person;
};

module.exports = _self;
