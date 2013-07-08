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

var errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    ContactName = require('ripple/platform/tizen/2.0/ContactName'),
    ContactOrganization = require('ripple/platform/tizen/2.0/ContactOrganization'),
    ContactWebSite = require('ripple/platform/tizen/2.0/ContactWebSite'),
    ContactAnniversary = require('ripple/platform/tizen/2.0/ContactAnniversary'),
    ContactAddress = require('ripple/platform/tizen/2.0/ContactAddress'),
    ContactPhoneNumber = require('ripple/platform/tizen/2.0/ContactPhoneNumber'),
    ContactEmailAddress = require('ripple/platform/tizen/2.0/ContactEmailAddress');

module.exports = function (prop, _security) {
    var _self;

    // constructor
    function init_ContactInitDict(contactInitDict) {
        var i;

        if (contactInitDict.name) {
            _self.name = new ContactName(contactInitDict.name);
        }
        if (tizen1_utils.isValidArray(contactInitDict.addresses)) {
            for (i in contactInitDict.addresses) {
                _self.addresses.push(new ContactAddress(contactInitDict.addresses[i]));
            }
        }
        if (contactInitDict.photoURI) {
            _self.photoURI = String(contactInitDict.photoURI);
        }
        if (tizen1_utils.isValidArray(contactInitDict.phoneNumbers)) {
            _self.phoneNumbers = [];
            for (i in contactInitDict.phoneNumbers) {
                _self.phoneNumbers.push(new ContactPhoneNumber(
                            contactInitDict.phoneNumbers[i].number, contactInitDict.phoneNumbers[i].types));
            }
        }
        if (tizen1_utils.isValidArray(contactInitDict.emails)) {
            _self.emails = [];
            for (i in contactInitDict.emails) {
                _self.emails.push(new ContactEmailAddress(
                            contactInitDict.emails[i].email, contactInitDict.emails[i].types));
            }
        }
        if (tizen1_utils.isValidDate(contactInitDict.birthday)) {
            _self.birthday = new Date(contactInitDict.birthday);
        }
        if (tizen1_utils.isValidArray(contactInitDict.anniversaries)) {
            _self.anniversaries = [];
            for (i in contactInitDict.anniversaries) {
                _self.anniversaries.push(new ContactAnniversary(
                            contactInitDict.anniversaries[i].date, contactInitDict.anniversaries[i].label));
            }
        }
        if (tizen1_utils.isValidArray(contactInitDict.organizations)) {
            for (i in contactInitDict.organizations) {
                _self.organizations.push(new ContactOrganization(
                            contactInitDict.organizations[i]));
            }
        }
        if (tizen1_utils.isValidArray(contactInitDict.notes)) {
            for (i in contactInitDict.notes) {
                _self.notes.push(String(contactInitDict.notes[i]));
            }
        }
        if (tizen1_utils.isValidArray(contactInitDict.urls)) {
            for (i in contactInitDict.urls) {
                _self.urls.push(new ContactWebSite(
                            contactInitDict.urls[i].url, contactInitDict.urls[i].type));
            }
        }
        if (contactInitDict.ringtoneURI) {
            _self.ringtoneURI = String(contactInitDict.ringtoneURI);
        }
        if (tizen1_utils.isValidArray(contactInitDict.groupIds)) {
            for (i in contactInitDict.groupIds) {
                _self.groupIds.push(String(contactInitDict.groupIds[i]));
            }
        }
    }

    function init_stringRepresentation(stringRepresentation) {
        //TODO: parse stringRepresentation
    }

    // public
    function convertToString(format) {
        //TODO: convert content accord to Vcard protocal
        if (format !== 'VCARD_30') {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        return "";
    }

    function clone(obj) {
        var copy = obj.constructor(), attr;

        if (!_security.clone) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        for (attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = obj[attr];
        }
        /* remove these two attribute */
        copy.id = null;
        copy.lastUpdated = null;
        return copy;
    }

    _self = {
        name:            null,
        addresses:       [],
        photoURI:        null,
        phoneNumbers:    [],
        emails:          [],
        birthday:        null,
        anniversaries:   [],
        organizations:   [],
        notes:           [],
        urls:            [],
        ringtoneURI:     null,
        groupIds:        [],
        convertToString: convertToString,
        clone: function () {
            return clone(this);
        }
    };

    _self.__defineGetter__("id", function () {
        return null;
    });

    _self.__defineGetter__("personId", function () {
        return null;
    });

    _self.__defineGetter__("addressBookId", function () {
        return null;
    });

    _self.__defineGetter__("lastUpdated", function () {
        return null;
    });

    _self.__defineGetter__("isFavorite", function () {
        return false;
    });

    if (typeof prop === "string") {
        init_stringRepresentation(String(prop));
    } else if (prop) {
        init_ContactInitDict(prop);
    }

    return _self;
};
