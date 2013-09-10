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
    t.ContactGroup(arguments, this);

    this.__defineGetter__("id", function () {
        return null;
    });

    this.__defineGetter__("addressBookId", function () {
        return null;
    });

    this.__defineGetter__("readOnly", function () {
        return false;
    });

    this.name        = name;
    this.ringtoneURI = ringtoneURI || null;
    this.photoURI    = photoURI || null;
};

module.exports = ContactGroup;
