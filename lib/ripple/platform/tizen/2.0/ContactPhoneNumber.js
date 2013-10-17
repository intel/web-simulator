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
    ContactPhoneNumber;

ContactPhoneNumber = function (number, types, isDefault) {
    var contactPhoneNumber = {};

    t.ContactPhoneNumber(arguments, this);

    contactPhoneNumber.number    = number;
    contactPhoneNumber.isDefault = isDefault || false;
    contactPhoneNumber.types     = (types && types[0]) ? types : ["VOICE"];

    this.__defineGetter__("number", function () {
        return contactPhoneNumber.number;
    });
    this.__defineSetter__("number", function (val) {
        try {
            contactPhoneNumber.number = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("isDefault", function () {
        return contactPhoneNumber.isDefault;
    });
    this.__defineSetter__("isDefault", function (val) {
        try {
            contactPhoneNumber.isDefault = t.boolean(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("types", function () {
        return contactPhoneNumber.types;
    });
    this.__defineSetter__("types", function (val) {
        try {
            contactPhoneNumber.types = t.DOMString(val, "[]");
        } catch (e) {
        }
    });
};

module.exports = ContactPhoneNumber;
