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
    ContactAddress;

ContactAddress = function (addressInitDict) {
    var contactAddress = {}, attr, arr, i;

    t.ContactAddress(arguments, this);

    contactAddress.country               = null;
    contactAddress.region                = null;
    contactAddress.city                  = null;
    contactAddress.streetAddress         = null;
    contactAddress.additionalInformation = null;
    contactAddress.postalCode            = null;
    contactAddress.isDefault             = false;
    contactAddress.types                 = ["HOME"];

    this.__defineGetter__("country", function () {
        return contactAddress.country;
    });
    this.__defineSetter__("country", function (val) {
        try {
            contactAddress.country = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("region", function () {
        return contactAddress.region;
    });
    this.__defineSetter__("region", function (val) {
        try {
            contactAddress.region = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("city", function () {
        return contactAddress.city;
    });
    this.__defineSetter__("city", function (val) {
        try {
            contactAddress.city = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("streetAddress", function () {
        return contactAddress.streetAddress;
    });
    this.__defineSetter__("streetAddress", function (val) {
        try {
            contactAddress.streetAddress = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("additionalInformation", function () {
        return contactAddress.additionalInformation;
    });
    this.__defineSetter__("additionalInformation", function (val) {
        try {
            contactAddress.additionalInformation = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("postalCode", function () {
        return contactAddress.postalCode;
    });
    this.__defineSetter__("postalCode", function (val) {
        try {
            contactAddress.postalCode = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("isDefault", function () {
        return contactAddress.isDefault;
    });
    this.__defineSetter__("isDefault", function (val) {
        try {
            contactAddress.isDefault = t.boolean(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("types", function () {
        return contactAddress.types;
    });
    this.__defineSetter__("types", function (val) {
        try {
            contactAddress.types = t.DOMString(val, "[]");
        } catch (e) {
        }
    });

    if (addressInitDict) {
        for (attr in addressInitDict) {
            switch (attr) {
            case "types":
                arr = addressInitDict[attr];
                if (arr) {
                    for (i in arr) {
                        contactAddress[attr][i] = arr[i];
                    }
                }
                break;

            default:
                contactAddress[attr] = addressInitDict[attr];
                break;
            }
        }
    }
};

module.exports = ContactAddress;
