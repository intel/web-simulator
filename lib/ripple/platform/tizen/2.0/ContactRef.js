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
    ContactRef;

ContactRef = function (addressBookId, contactId) {
    var contactRef = {};

    t.ContactRef(arguments, this);

    contactRef.addressBookId = addressBookId;
    contactRef.contactId     = contactId;

    this.__defineGetter__("addressBookId", function () {
        return contactRef.addressBookId;
    });
    this.__defineSetter__("addressBookId", function (val) {
        try {
            contactRef.addressBookId = t.AddressBookId(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("contactId", function () {
        return contactRef.contactId;
    });
    this.__defineSetter__("contactId", function (val) {
        try {
            contactRef.contactId = t.ContactId(val);
        } catch (e) {
        }
    });
};

module.exports = ContactRef;
