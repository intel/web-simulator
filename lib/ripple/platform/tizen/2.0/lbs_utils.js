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

var tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    _self;

function CoordinateProperties(prop) {
    var _self;
    _self = {
        latitude : prop.latitude || 0,
        longitude : prop.longitude || 0,
        altitude : prop.altitude || 0,
        accuracy : prop.accuracy || 0,
        altitudeAccuracy : prop.altitudeAccuracy || 0,
        heading : prop.heading || 0,
        speed : prop.speed || 0
    };
    return _self;
}

function _checkAddressProperties(p, dst) {
    if (p.country !== null && p.country !== undefined)
        dst.country = String(p.country);
    if (p.region !== null && p.region !== undefined)
        dst.region = String(p.region);
    if (p.county !== null && p.county !== undefined)
        dst.county = String(p.county);
    if (p.city !== null && p.city !== undefined)
        dst.city = String(p.city);
    if (p.street !== null && p.street !== undefined)
        dst.street = String(p.street);
    if (p.streetNumber !== null && p.streetNumber !== undefined)
        dst.streetNumber = String(p.streetNumber);
    if (p.premises !== null && p.premises !== undefined)
        dst.premises = String(p.premises);
    if (p.additionalInformation !== null &&
        p.additionalInformation !== undefined)
        dst.additionalInformation = String(p.additionalInformation);
    if (p.postalCode !== null && p.postalCode !== undefined)
        dst.postalCode = String(p.postalCode);
}

function AddressProperties(prop) {
    var _self;
    _self = {
        country : null,
        region : null,
        county : null,
        city : null,
        street : null,
        streetNumber : null,
        premises : null,
        additionalInformation : null,
        postalCode : null
    };
    if (prop) {
        if (_checkAddressProperties(prop, _self) === false)
            return undefined;
    }
    return _self;
}

_self = {
    LocationServiceProvider : function (prop) {
        var _self;
        _self = {
            name : "",
            metaData : Object,
            attribution : "",
            supportedOptions : [],
            setOptions : function (options, successCB, errorCB) {},
            connectivity : "" // "ONLINE" "OFFLINE" "HYBRID"
        };

        if (prop.name !== null && prop.name !== undefined)
            _self.name = String(prop.name);
        if (prop.metaData !== null && prop.metaData !== undefined)
            _self.metaData = prop.metaData;

        if (prop.attribution !== null && prop.attribution !== undefined)
            _self.attribution = String(prop.attribution);

        if (prop.supportedOptions !== null && prop.supportedOptions !== undefined)
            _self.supportedOptions = [prop.supportedOptions];

        if (prop.setOptions !== null && prop.setOptions !== undefined)
            _self.setOptions = prop.setOptions;

        if (prop.connectivity !== null && prop.connectivity !== undefined)
            _self.connectivity = String(prop.connectivity);

        return _self;
    },

    GeoCoordinates : function (prop) {
        var _self = new CoordinateProperties(prop);
        if (tizen1_utils.isEmptyObject(_self)) {
            return undefined;
        }

        return _self;
    },

    StructuredAddress : function (prop) {
        var _self;
        _self = new AddressProperties(prop);
        if (tizen1_utils.isEmptyObject(_self)) {
            return undefined;
        }

        return _self;
    }
};

module.exports = _self;
