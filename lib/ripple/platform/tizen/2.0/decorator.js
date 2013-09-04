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
    ContactDecorator,
    _self;

ContactDecorator = function (contact, overlap) {
    var raw = {};

    // private
    function clone(obj) {
        return function () {
            var Contact = require('ripple/platform/tizen/2.0/ContactBase'),
                duplicate;

            duplicate = new Contact(obj);

            duplicate.__defineGetter__("id", function () {
                return null;
            });

            duplicate.__defineGetter__("addressBookId", function () {
                return null;
            });

            return duplicate;
        };
    }

    // public
    function convertToString(format) {
        t.Contact("convertToString", arguments);

        // TODO: Convert contact according to VCard protocal
        return "";
    }

    raw.id            = overlap ? overlap.id : null;
    raw.personId      = overlap ? overlap.personId : null;
    raw.addressBookId = overlap ? overlap.addressBookId : null;
    raw.lastUpdated   = overlap ? overlap.lastUpdated : null;
    raw.isFavorite    = overlap ? overlap.isFavorite : false;

    contact.__defineGetter__("id", function () {
        return raw.id;
    });

    contact.__defineGetter__("personId", function () {
        return raw.personId;
    });

    contact.__defineGetter__("addressBookId", function () {
        return raw.addressBookId;
    });

    contact.__defineGetter__("lastUpdated", function () {
        return raw.lastUpdated;
    });

    contact.__defineGetter__("isFavorite", function () {
        return raw.isFavorite;
    });

    if (contact.name) {
        contact.name.__defineGetter__("displayName", function () {
            return ((overlap && overlap.name) ? overlap.name.displayName :
                    null);
        });
    }

    contact.convertToString = convertToString;
    contact.clone           = clone(contact);
};

_self = {
    Contact: ContactDecorator
};

module.exports = _self;
