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
    ContactWebSite;

ContactWebSite = function (url, type) {
    var contactWebSite = {};

    t.ContactWebSite(arguments, this);

    contactWebSite.url  = url;
    contactWebSite.type = type || "HOMEPAGE";

    this.__defineGetter__("url", function () {
        return contactWebSite.url;
    });
    this.__defineSetter__("url", function (val) {
        try {
            contactWebSite.url = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("type", function () {
        return contactWebSite.type;
    });
    this.__defineSetter__("type", function (val) {
        try {
            contactWebSite.type = t.DOMString(val);
        } catch (e) {
        }
    });
};

module.exports = ContactWebSite;
