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

var t = require('ripple/platform/tizen/2.0/typecast'),
    ContactDecorator,
    _self;

ContactDecorator = function (contact, overlap) {
    var raw = {};

    // private
    function clone(obj) {
        return function () {
            var Contact = require('ripple/platform/tizen/2.0/ContactBase'),
                duplicate;

            duplicate = new Contact(obj);

            duplicate.__defineGetter__("id", function () {
                return null;
            });

            duplicate.__defineGetter__("addressBookId", function () {
                return null;
            });

            return duplicate;
        };
    }

    // public
    function convertToString(format) {
        t.Contact("convertToString", arguments);

        // TODO: Convert contact according to VCard protocal
        return "";
    }

    raw.id            = overlap ? overlap.id : null;
    raw.personId      = overlap ? overlap.personId : null;
    raw.addressBookId = overlap ? overlap.addressBookId : null;
    raw.lastUpdated   = overlap ? overlap.lastUpdated : null;
    raw.isFavorite    = overlap ? overlap.isFavorite : false;
    raw.name          = contact.name;
    raw.addresses     = contact.addresses;
    raw.photoURI      = contact.photoURI;
    raw.phoneNumbers  = contact.phoneNumbers;
    raw.emails        = contact.emails;
    raw.birthday      = contact.birthday;
    raw.anniversaries = contact.anniversaries;
    raw.organizations = contact.organizations;
    raw.notes         = contact.notes;
    raw.urls          = contact.urls;
    raw.ringtoneURI   = contact.ringtoneURI;
    raw.groupIds      = contact.groupIds;

    contact.__defineGetter__("id", function () {
        return raw.id;
    });

    contact.__defineGetter__("personId", function () {
        return raw.personId;
    });

    contact.__defineGetter__("addressBookId", function () {
        return raw.addressBookId;
    });

    contact.__defineGetter__("lastUpdated", function () {
        return raw.lastUpdated;
    });

    contact.__defineGetter__("isFavorite", function () {
        return raw.isFavorite;
    });

    contact.__defineGetter__("name", function () {
        return raw.name;
    });
    contact.__defineSetter__("name", function (val) {
        try {
            raw.name = t.ContactName(val, "?");
        } catch (e) {
        }
    });

    contact.__defineGetter__("addresses", function () {
        return raw.addresses;
    });
    contact.__defineSetter__("addresses", function (val) {
        try {
            raw.addresses = t.ContactAddress(val, "[]");
        } catch (e) {
        }
    });

    contact.__defineGetter__("photoURI", function () {
        return raw.photoURI;
    });
    contact.__defineSetter__("photoURI", function (val) {
        try {
            raw.photoURI = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    contact.__defineGetter__("phoneNumbers", function () {
        return raw.phoneNumbers;
    });
    contact.__defineSetter__("phoneNumbers", function (val) {
        try {
            raw.phoneNumbers = t.ContactPhoneNumber(val, "[]");
        } catch (e) {
        }
    });

    contact.__defineGetter__("emails", function () {
        return raw.emails;
    });
    contact.__defineSetter__("emails", function (val) {
        try {
            raw.emails = t.ContactEmailAddress(val, "[]");
        } catch (e) {
        }
    });

    contact.__defineGetter__("birthday", function () {
        return raw.birthday;
    });
    contact.__defineSetter__("birthday", function (val) {
        try {
            raw.birthday = t.Date(val, "?");
        } catch (e) {
        }
    });

    contact.__defineGetter__("anniversaries", function () {
        return raw.anniversaries;
    });
    contact.__defineSetter__("anniversaries", function (val) {
        try {
            raw.anniversaries = t.ContactAnniversary(val, "[]");
        } catch (e) {
        }
    });

    contact.__defineGetter__("organizations", function () {
        return raw.organizations;
    });
    contact.__defineSetter__("organizations", function (val) {
        try {
            raw.organizations = t.ContactOrganization(val, "[]");
        } catch (e) {
        }
    });

    contact.__defineGetter__("notes", function () {
        return raw.notes;
    });
    contact.__defineSetter__("notes", function (val) {
        try {
            raw.notes = t.DOMString(val, "[]");
        } catch (e) {
        }
    });

    contact.__defineGetter__("urls", function () {
        return raw.urls;
    });
    contact.__defineSetter__("urls", function (val) {
        try {
            raw.urls = t.ContactWebSite(val, "[]");
        } catch (e) {
        }
    });

    contact.__defineGetter__("ringtoneURI", function () {
        return raw.ringtoneURI;
    });
    contact.__defineSetter__("ringtoneURI", function (val) {
        try {
            raw.ringtoneURI = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    contact.__defineGetter__("groupIds", function () {
        return raw.groupIds;
    });
    contact.__defineSetter__("groupIds", function (val) {
        try {
            raw.groupIds = t.ContactGroupId(val, "[]");
        } catch (e) {
        }
    });

    if (contact.name) {
        contact.name.__defineGetter__("displayName", function () {
            return ((overlap && overlap.name) ? overlap.name.displayName :
                    null);
        });
    }

    contact.convertToString = convertToString;
    contact.clone           = clone(contact);
};

_self = {
    Contact: ContactDecorator
};

module.exports = _self;
