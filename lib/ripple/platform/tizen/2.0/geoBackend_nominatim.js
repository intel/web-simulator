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

var lbs = require('ripple/platform/tizen/2.0/lbs_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    GeocodeResult = require('ripple/platform/tizen/2.0/GeocodeResult');

function _concatAddrString(addr) {
    var ret = "", i, pieces;
    if (typeof addr === "string") {
        pieces = addr.split(" ");
        for (i = 0; i < pieces.length; i++) {
            ret = ret + pieces[i] + "+";
        }
    } else if (typeof addr === "object") {
        if (addr.premises !== null && addr.premises !== undefined) {
            ret = ret + addr.premises + "+";
        }
        if (addr.streetNumber !== null && addr.streetNumber !== undefined) {
            ret = ret + addr.streetNumber + "+";
        }
        if (addr.street !== null && addr.street !== undefined) {
            ret = ret + addr.street + "+";
        }
        if (addr.city !== null && addr.city !== undefined) {
            ret = ret + addr.city + "+";
        }
        if (addr.county !== null && addr.county !== undefined) {
            ret = ret + addr.county + "+";
        }
        if (addr.region !== null && addr.region !== undefined) {
            ret = ret + addr.region + "+";
        }
        if (addr.postalCode !== null && addr.postalCode !== undefined) {
            ret = ret + addr.postalCode + "+";
        }
        if (addr.country !== null && addr.country !== undefined) {
            ret = ret + addr.country + "+";
        }
    } else {
        return undefined;
    }
    ret = ret.slice(0, -1);
    return ret;
}

module.exports = function (prop) {
    var _self = new lbs.LocationServiceProvider(prop);
    
    _self.geocode = function (address, successCB, errorCB, options) {
        function _geocode() {
            var i, searchStr, coordinates = [], result;

            searchStr = _concatAddrString(address);
            if (searchStr === undefined) {
                throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
            }
            searchStr = "http://nominatim.openstreetmap.org/search?q=" + searchStr + "&format=json&polygon=1&addressdetails=1";

            /* use nominatim online geo service. (http://nominatim.openstreetmap.org) */
            $.getJSON(searchStr, function (data) {
                for (i = 0; i < data.length; i++) {
                    result = new GeocodeResult(parseFloat(data[i].lat), parseFloat(data[i].lon));
                    coordinates.push(result);
                }
                successCB(coordinates);
            }).error(function () {
                if (errorCB) {
                    setTimeout(function () {
                        errorCB(new WebAPIError(errorcode.NETWORK_ERR));
                    }, 1);
                }
            });
        }

        tizen1_utils.validateTypeMismatch(successCB, errorCB, "geocode", _geocode); 
    };

    _self.reverseGeocode = function (coordinates, successCB, errorCB, options) {
        function _reverseGeocode() {
            var searchStr = "";
            if (typeof coordinates !== "object" ||
                typeof coordinates.latitude !== "number" ||
                typeof coordinates.longitude !== "number") {
                throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
            }
            searchStr = "http://nominatim.openstreetmap.org/reverse?format=json&lat=" +
                        coordinates.latitude + "&lon=" + coordinates.longitude + "&zoom=18&addressdetails=1";

            /* use nominatim online geo service. (http://nominatim.openstreetmap.org) */
            $.getJSON(searchStr, function (data) {
                var addr;

                if (options && options.resultType === "STRUCTURED") {
                    addr = new lbs.StructuredAddress({
                        country : data.address.country,
                        region : data.address.state,
                        county : data.address.county,
                        city : data.address.city,
                        street : data.address.road,
                        streetNumber : data.address.streetNumber,
                        postalCode : data.address.postcode
                    });
                } else {
                    addr = data.display_name;
                }
                successCB([addr]);
            }).error(function () {
                if (errorCB) {
                    setTimeout(function () {
                        errorCB(new WebAPIError(errorcode.NETWORK_ERR));
                    }, 1);
                }
            });
        }

        tizen1_utils.validateTypeMismatch(successCB, errorCB, "reverseGeocode", _reverseGeocode);
    };

    return _self;
};

