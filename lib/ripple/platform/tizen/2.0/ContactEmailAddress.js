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
    ContactEmailAddress;

ContactEmailAddress = function (email, types, isDefault) {
    var contactEmailAddress = {};

    t.ContactEmailAddress(arguments, this);

    contactEmailAddress.email     = email;
    contactEmailAddress.isDefault = isDefault || false;
    contactEmailAddress.types     = (types && types[0]) ? types : ["WORK"];

    this.__defineGetter__("email", function () {
        return contactEmailAddress.email;
    });
    this.__defineSetter__("email", function (val) {
        try {
            contactEmailAddress.email = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("isDefault", function () {
        return contactEmailAddress.isDefault;
    });
    this.__defineSetter__("isDefault", function (val) {
        try {
            contactEmailAddress.isDefault = t.boolean(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("types", function () {
        return contactEmailAddress.types;
    });
    this.__defineSetter__("types", function (val) {
        try {
            contactEmailAddress.types = t.DOMString(val, "[]");
        } catch (e) {
        }
    });
};

module.exports = ContactEmailAddress;
