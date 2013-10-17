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
    ContactOrganization;

ContactOrganization = function (orgInitDict) {
    var contactOrganization = {}, attr;

    t.ContactOrganization(arguments, this);

    contactOrganization.name       = null;
    contactOrganization.department = null;
    contactOrganization.title      = null;
    contactOrganization.role       = null;
    contactOrganization.logoURI    = null;

    this.__defineGetter__("name", function () {
        return contactOrganization.name;
    });
    this.__defineSetter__("name", function (val) {
        try {
            contactOrganization.name = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("department", function () {
        return contactOrganization.department;
    });
    this.__defineSetter__("department", function (val) {
        try {
            contactOrganization.department = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("title", function () {
        return contactOrganization.title;
    });
    this.__defineSetter__("title", function (val) {
        try {
            contactOrganization.title = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("role", function () {
        return contactOrganization.role;
    });
    this.__defineSetter__("role", function (val) {
        try {
            contactOrganization.role = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("logoURI", function () {
        return contactOrganization.logoURI;
    });
    this.__defineSetter__("logoURI", function (val) {
        try {
            contactOrganization.logoURI = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    if (orgInitDict) {
        for (attr in orgInitDict) {
            contactOrganization[attr] = orgInitDict[attr];
        }
    }
};

module.exports = ContactOrganization;
