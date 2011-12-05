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
    db = require('ripple/db'),
    constants = require('ripple/constants'),
    exception = require('ripple/exception'),
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    wac2_utils = require('ripple/platform/wac/2.0/wac2_utils'),
    DeviceApiError = require('ripple/platform/wac/2.0/deviceapierror'),
    PendingOperation = require('ripple/platform/wac/2.0/pendingoperation'),
    PendingObject = require('ripple/platform/wac/2.0/pendingObject'),
    TypeCoerce = require('ripple/platform/wac/2.0/typecoerce'),
    Filter = require('ripple/platform/wac/2.0/contactfilter'),
    AddressBook,
    ContactProperties,
    Contact,
    Address,
    ContactAddress,
    PhoneNumber,
    EmailAddress,
    ContactFilter,
    _KEY = "wac2-pim-contact",
    _PENDING_TIME = 600,
    _addressBooks = [],
    _contacts = {},
    _security = {
        "http://wacapps.net/api/pim.contact": [],
        "http://wacapps.net/api/pim.contact.read": ["findContacts"],
        "http://wacapps.net/api/pim.contact.write": ["addContact", "updateContact", "deleteContact"]
    },
    _self;

function _errorOccurred(onError, code) {
    if (!onError)
        return;

    setTimeout(function () {
        onError(new DeviceApiError(code));
    }, 1);
}

function _pendingOperate(operate, scope) {
    var i, argumentVector = [];

    for (i = 0; i < arguments.length - 2; i++)
        argumentVector[i] = arguments[i + 2];

    return function () {
        var pendingObj, pendingOperation;

        pendingObj = new PendingObject();
        pendingObj.pendingID = window.setTimeout(function () {
            pendingObj.setCancelFlag(false);
            operate.apply(scope, argumentVector);
        }, _PENDING_TIME);

        pendingOperation = new PendingOperation(pendingObj);

        return pendingOperation;
    };
}

function _defaultContacts() {
    var id1 = Math.uuid(null, 16),
        id2 = Math.uuid(null, 16),
        id3 = Math.uuid(null, 16),
        id4 = Math.uuid(null, 16),
        contacts = {};

    contacts.PHONE_ADDRESS_BOOK = {
        type: _self().PHONE_ADDRESS_BOOK,
        items: [{
            id: id1,
            firstName: "Leonardo",
            lastName: "Gates",
            nicknames: ["Leo"],
            phoneticName: "",
            addresses: [{streetAddress: "Gran Via, 32", postalCode: "50013", city: "Zaragoza", country: "ES"}],
            photoURI: "",
            phoneNumbers: [],
            emails: ["leo@underground.com"]
        }, {
            id: id2,
            firstName: "Jordan",
            lastName: "",
            nicknames: [""],
            phoneticName: "",
            addresses: [],
            photoURI: "",
            phoneNumbers: [],
            emails: ["jordan@underground.com"]
        }]
    };

    contacts.SIM_ADDRESS_BOOK = {
        type: _self().SIM_ADDRESS_BOOK,
        items: [{
            id: id3,
            firstName: "Raphael",
            lastName: "",
            nicknames: [""],
            phoneticName: "",
            addresses: [],
            photoURI: "",
            phoneNumbers: [],
            emails: ["raph@underground.com"]
        }]
    };

    contacts.DEVICE_ADDRESS_BOOK = {
        type: _self().DEVICE_ADDRESS_BOOK,
        items: [{
            id: id4,
            firstName: "Michelangelo",
            lastName: "",
            nicknames: [""],
            phoneticName: "",
            addresses: [],
            photoURI: "",
            phoneNumbers: [],
            emails: ["mike@underground.com"]
        }]
    };

    return contacts;
}

function _get() {
    _contacts = db.retrieveObject(_KEY) || _defaultContacts();
}

function _save() {
    db.saveObject(_KEY, _contacts);
}

function _initAddressBooks() {
    _get();
    utils.forEach(_contacts, function (contactObj, name) {
        _addressBooks.push(new AddressBook(contactObj.type, name));
    });
}

_self = function () {
    var contact = {
        getAddressBooks: function (successCallback, errorCallback) {
            function _getAddressBooks() {
                if (_addressBooks.length === 0) {
                    _initAddressBooks();
                }
                successCallback(_addressBooks);
            }
            return wac2_utils.validateTypeMismatch(successCallback, errorCallback, "getAddressBooks", _getAddressBooks);
        },

        handleSubFeatures: function (subFeatures) {
            for (var subFeature in subFeatures) {
                if (_security[subFeature].length === 0) {
                    _security.all = true;
                    return;
                }
                utils.forEach(_security[subFeature], function (method) {
                    _security[method] = true;
                });
            }
        }
    };

    contact.__defineGetter__("SIM_ADDRESS_BOOK", function () {
        return 0x0000;
    });

    contact.__defineGetter__("DEVICE_ADDRESS_BOOK", function () {
        return 0x000F;
    });

    contact.__defineGetter__("PHONE_ADDRESS_BOOK", function () {
        return 0x00FF;
    });

    return contact;
};

AddressBook = function (type, name) {
    var addressBook,
        contactItems = _contacts[name].items;

    addressBook = {
        createContact: function (contactProperties) {
            var cp, contact = new Contact();

            if ((contactProperties !== undefined) &&
                (contactProperties !== null)) {
                cp = TypeCoerce(ContactProperties).cast(contactProperties);
                !cp.firstName    || (contact.firstName    = utils.copy(cp.firstName));
                !cp.lastName     || (contact.lastName     = utils.copy(cp.lastName));
                !cp.nicknames    || (contact.nicknames    = utils.copy(cp.nicknames));
                !cp.phoneticName || (contact.phoneticName = utils.copy(cp.phoneticName));
                !cp.addresses    || (contact.addresses    = utils.copy(cp.addresses));
                !cp.photoURI     || (contact.photoURI     = utils.copy(cp.photoURI));
                !cp.phoneNumbers || (contact.phoneNumbers = utils.copy(cp.phoneNumbers));
                !cp.emails       || (contact.emails       = utils.copy(cp.emails));
            }

            return contact;
        },

        addContact: function (successCallback, errorCallback, contact) {
            function _addContact() {
                var c;

                if (!contact)
                    exception.raise(exception.types.Argument, "addContact invalid message parameter", new DeviceApiError(errorcode.INVALID_VALUES_ERR));

                if (!_security.all && !_security.addContact)
                    return _errorOccurred(errorCallback, errorcode.SECURITY_ERR);

                c = TypeCoerce(new Contact()).cast(contact);
                contactItems.push(c);
                _save();
                successCallback(c);
            }
            return wac2_utils.validateTypeMismatch(successCallback, errorCallback, "addContact", _pendingOperate(_addContact));
        },

        updateContact: function (successCallback, errorCallback, contact) {
            function _updateContact() {
                var c, isFound = false;

                if (!contact)
                    exception.raise(exception.types.Argument, "updateContact invalid message parameter", new DeviceApiError(errorcode.INVALID_VALUES_ERR));

                if (!_security.all && !_security.updateContact)
                    return _errorOccurred(errorCallback, errorcode.SECURITY_ERR);

                c = TypeCoerce(new Contact()).cast(contact);
                utils.forEach(contactItems, function (contactItem) {
                    if (contactItem.id === c.id) {
                        !c.firstName    || (contactItem.firstName    = utils.copy(c.firstName));
                        !c.lastName     || (contactItem.lastName     = utils.copy(c.lastName));
                        !c.nicknames    || (contactItem.nicknames    = utils.copy(c.nicknames));
                        !c.phoneticName || (contactItem.phoneticName = utils.copy(c.phoneticName));
                        !c.addresses    || (contactItem.addresses    = utils.copy(c.addresses));
                        !c.photoURI     || (contactItem.photoURI     = utils.copy(c.photoURI));
                        !c.phoneNumbers || (contactItem.phoneNumbers = utils.copy(c.phoneNumbers));
                        !c.emails       || (contactItem.emails       = utils.copy(c.emails));

                        _save();
                        isFound = true;
                        successCallback();
                    }
                });

                if (!isFound)
                    _errorOccurred(errorCallback, errorcode.NOT_FOUND_ERR);
            }
            return wac2_utils.validateTypeMismatch(successCallback, errorCallback, "updateContact", _pendingOperate(_updateContact));
        },

        deleteContact: function (successCallback, errorCallback, id) {
            function _deleteContact() {
                var isFound = false;

                if (!_security.all && !_security.deleteContact)
                    return _errorOccurred(errorCallback, errorcode.SECURITY_ERR);

                id = id | 0;
                utils.forEach(contactItems, function (contactItem, index) {
                    if (contactItem.id === id) {
                        contactItems.splice(index, 1);
                        _save();
                        isFound = true;
                        successCallback();
                    }
                });

                if (!isFound)
                    _errorOccurred(errorCallback, errorcode.NOT_FOUND_ERR);
            }
            return wac2_utils.validateTypeMismatch(successCallback, errorCallback, "deleteContact", _pendingOperate(_deleteContact));
        },

        findContacts: function (successCallback, errorCallback, filter) {
            function _findContacts() {
                var contact, result = [];

                if (!_security.all && !_security.findContacts)
                    return _errorOccurred(errorCallback, errorcode.SECURITY_ERR);

                utils.forEach(contactItems, function (contactItem) {
                    if ((filter              === undefined || filter === null) ||
                        (filter.id           === undefined || Filter(filter.id).match(contactItem.id)) &&
                        (filter.firstName    === undefined || Filter(filter.firstName).match(contactItem.firstName)) &&
                        (filter.lastName     === undefined || Filter(filter.lastName).match(contactItem.lastName)) &&
                        (filter.phoneticName === undefined || Filter(filter.phoneticName).match(contactItem.phoneticName)) &&
                        (filter.nickname     === undefined || Filter(filter.nickname).match(contactItem.nicknames)) &&
                        (filter.phoneNumber  === undefined || Filter(filter.phoneNumber).match(contactItem.phoneNumbers)) &&
                        (filter.email        === undefined || Filter(filter.email).match(contactItem.emails)) &&
                        (filter.address      === undefined || Filter(filter.address).match(contactItem.addresses))) {
                        contact = new Contact();

                        contact.firstName    = utils.copy(contactItem.firstName);
                        contact.lastName     = utils.copy(contactItem.lastName);
                        contact.nicknames    = utils.copy(contactItem.nicknames);
                        contact.phoneticName = utils.copy(contactItem.phoneticName);
                        contact.addresses    = utils.copy(contactItem.addresses);
                        contact.photoURI     = utils.copy(contactItem.photoURI);
                        contact.phoneNumbers = utils.copy(contactItem.phoneNumbers);
                        contact.emails       = utils.copy(contactItem.emails);

                        result.push(contact);
                    }
                });
                successCallback(result);
            }
            return wac2_utils.validateTypeMismatch(successCallback, errorCallback, "findContacts", _pendingOperate(_findContacts));
        }
    };

    addressBook.__defineGetter__("type", function () {
        return type;
    });

    addressBook.__defineGetter__("name", function () {
        return name;
    });

    return addressBook;
};

Address = {
    country: "",
    region: "",
    county: "",
    city: "",
    streetAddress: "",
    additionalInformation: "",
    postalCode: ""
};

ContactAddress = function () {
    this.types = [""]; // "WORK", "PREF", "HOME"
};

ContactAddress.prototype = Address;

PhoneNumber = {
    number: "",
    types: [""] // "WORK", "PREF", "HOME", "VOICE", "FAX", "MSG", "CELL",
                // "PAGER", "BBS", "MODEM", "CAR", "ISDN", "VIDEO", "PCS"
};

EmailAddress = {
    email: "",
    types: [""] // "WORK", "PREF", "HOME"
};

ContactProperties = {
    firstName: "",
    lastName: "",
    nicknames: [""],
    phoneticName: "",
    addresses: [new ContactAddress()],
    photoURI: "",
    phoneNumbers: [PhoneNumber],
    emails: [EmailAddress]
};

Contact = function () {
    var id = Math.uuid(null, 16);

    this.__defineGetter__("id", function () {
        return id;
    });
};

Contact.prototype = ContactProperties;

ContactFilter = {
    id: "",
    firstName: "",
    lastName: "",
    phoneticName: "",
    nickname: "",
    phoneNumber: "",
    email: "",
    address: ""
};

module.exports = _self;
