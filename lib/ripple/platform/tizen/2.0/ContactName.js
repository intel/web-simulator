/*
 *  Copyright 2012 Intel Corporation.
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

var tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils');

module.exports = function (nameInitDict) {
    var self, i;

    self = {
        prefix:            null,
        suffix:            null,
        firstName:         null,
        middleName:        null,
        lastName:          null,
        nicknames:         [],
        phoneticFirstName: null,
        phoneticLastName:  null
    };

    if (nameInitDict) {
        if (nameInitDict.prefix !== null && nameInitDict.prefix !== undefined) {
            self.prefix = String(nameInitDict.prefix);
        }
        if (nameInitDict.suffix !== null && nameInitDict.suffix !== undefined) {
            self.suffix = String(nameInitDict.suffix);
        }
        if (nameInitDict.firstName !== null && nameInitDict.firstName !== undefined) {
            self.firstName = String(nameInitDict.firstName);
        }
        if (nameInitDict.middleName !== null && nameInitDict.middleName !== undefined) {
            self.middleName = String(nameInitDict.middleName);
        }
        if (nameInitDict.lastName !== null && nameInitDict.lastName !== undefined) {
            self.lastName = String(nameInitDict.lastName);
        }
        if (tizen1_utils.isValidArray(nameInitDict.nicknames)) {
            for (i in nameInitDict.nicknames) {
                self.nicknames.push(String(nameInitDict.nicknames[i]));
            }
        }
        if (nameInitDict.phoneticFirstName !== null && nameInitDict.phoneticFirstName !== undefined) {
            self.phoneticFirstName = String(nameInitDict.phoneticFirstName);
        }
        if (nameInitDict.phoneticLastName !== null && nameInitDict.phoneticLastName !== undefined) {
            self.phoneticLastName = String(nameInitDict.phoneticLastName);
        }
    }

    self.__defineGetter__("displayName", function () {
        return null;
    });

    return self;
};
