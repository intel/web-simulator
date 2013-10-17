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
    ContactGroup;

ContactGroup = function (name, ringtoneURI, photoURI) {
    var contactGroup = {};

    t.ContactGroup(arguments, this);

    contactGroup.name        = name;
    contactGroup.ringtoneURI = ringtoneURI || null;
    contactGroup.photoURI    = photoURI || null;

    this.__defineGetter__("id", function () {
        return null;
    });

    this.__defineGetter__("addressBookId", function () {
        return null;
    });

    this.__defineGetter__("name", function () {
        return contactGroup.name;
    });
    this.__defineSetter__("name", function (val) {
        try {
            contactGroup.name = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("ringtoneURI", function () {
        return contactGroup.ringtoneURI;
    });
    this.__defineSetter__("ringtoneURI", function (val) {
        try {
            contactGroup.ringtoneURI = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("photoURI", function () {
        return contactGroup.photoURI;
    });
    this.__defineSetter__("photoURI", function (val) {
        try {
            contactGroup.photoURI = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("readOnly", function () {
        return false;
    });
};

module.exports = ContactGroup;
