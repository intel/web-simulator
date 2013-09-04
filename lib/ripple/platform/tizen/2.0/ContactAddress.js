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
    var i;

    t.ContactAddress(arguments, this);

    this.country               = null;
    this.region                = null;
    this.city                  = null;
    this.streetAddress         = null;
    this.additionalInformation = null;
    this.postalCode            = null;
    this.isDefault             = false;
    this.types                 = ["HOME"];

    if (addressInitDict) {
        for (i in addressInitDict) {
            this[i] = addressInitDict[i];
        }
    }
};

module.exports = ContactAddress;
