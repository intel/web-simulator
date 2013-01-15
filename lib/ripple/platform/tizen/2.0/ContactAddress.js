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

module.exports = function (addressInitDict) {
    var _self, type, i;
 
    _self = {
        country:               undefined,
        region:                undefined,
        city:                  undefined,
        streetAddress:         undefined,
        additionalInformation: undefined,
        postalCode:            undefined,
        isDefault:             false,
        types:                 undefined
    };

    if (addressInitDict) {
        if (addressInitDict.country !== null && addressInitDict.country !== undefined) {
            _self.country = String(addressInitDict.country);
        }
        if (addressInitDict.region !== null && addressInitDict.region !== undefined) {
            _self.region = String(addressInitDict.region);
        }
        if (addressInitDict.city !== null && addressInitDict.city !== undefined) {
            _self.city = String(addressInitDict.city);
        }
        if (addressInitDict.streetAddress !== null && addressInitDict.streetAddress !== undefined) {
            _self.streetAddress = String(addressInitDict.streetAddress);
        }
        if (addressInitDict.additionalInformation !== null && addressInitDict.additionalInformation !== undefined) {
            _self.additionalInformation = String(addressInitDict.additionalInformation);
        }
        if (addressInitDict.postalCode !== null && addressInitDict.postalCode !== undefined) {
            _self.postalCode = String(addressInitDict.postalCode);
        }
        if (typeof addressInitDict.isDefault === "boolean") {
            _self.isDefault = addressInitDict.isDefault;
        }
        if (tizen1_utils.isValidArray(addressInitDict.types)) {
            _self.types = [];

            for (i in addressInitDict.types) {
                type = String(addressInitDict.types[i]).toUpperCase();
                _self.types.push(type);
            }
        }
    }

    return _self;
};
