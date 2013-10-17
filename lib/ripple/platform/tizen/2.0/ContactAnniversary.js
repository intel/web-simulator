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
    ContactAnniversary;

ContactAnniversary = function (date, label) {
    var contactAnniversary = {};

    t.ContactAnniversary(arguments, this);

    contactAnniversary.date  = date;
    contactAnniversary.label = label || null;

    this.__defineGetter__("date", function () {
        return contactAnniversary.date;
    });
    this.__defineSetter__("date", function (val) {
        try {
            contactAnniversary.date = t.Date(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("label", function () {
        return contactAnniversary.label;
    });
    this.__defineSetter__("label", function (val) {
        try {
            contactAnniversary.label = t.DOMString(val, "?");
        } catch (e) {
        }
    });
};

module.exports = ContactAnniversary;
