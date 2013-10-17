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
    ContactName;

ContactName = function (nameInitDict) {
    var contactName = {}, attr;

    t.ContactName(arguments, this);

    contactName.prefix            = null;
    contactName.suffix            = null;
    contactName.firstName         = null;
    contactName.middleName        = null;
    contactName.lastName          = null;
    contactName.nicknames         = [];
    contactName.phoneticFirstName = null;
    contactName.phoneticLastName  = null;

    this.__defineGetter__("prefix", function () {
        return contactName.prefix;
    });
    this.__defineSetter__("prefix", function (val) {
        try {
            contactName.prefix = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("suffix", function () {
        return contactName.suffix;
    });
    this.__defineSetter__("suffix", function (val) {
        try {
            contactName.suffix = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("firstName", function () {
        return contactName.firstName;
    });
    this.__defineSetter__("firstName", function (val) {
        try {
            contactName.firstName = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("middleName", function () {
        return contactName.middleName;
    });
    this.__defineSetter__("middleName", function (val) {
        try {
            contactName.middleName = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("lastName", function () {
        return contactName.lastName;
    });
    this.__defineSetter__("lastName", function (val) {
        try {
            contactName.lastName = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("nicknames", function () {
        return contactName.nicknames;
    });
    this.__defineSetter__("nicknames", function (val) {
        try {
            contactName.nicknames = t.DOMString(val, "[]");
        } catch (e) {
        }
    });

    this.__defineGetter__("phoneticFirstName", function () {
        return contactName.phoneticFirstName;
    });
    this.__defineSetter__("phoneticFirstName", function (val) {
        try {
            contactName.phoneticFirstName = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("phoneticLastName", function () {
        return contactName.phoneticLastName;
    });
    this.__defineSetter__("phoneticLastName", function (val) {
        try {
            contactName.phoneticLastName = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("displayName", function () {
        return null;
    });

    if (nameInitDict) {
        for (attr in nameInitDict) {
            contactName[attr] = nameInitDict[attr];
        }
    }
};

module.exports = ContactName;
