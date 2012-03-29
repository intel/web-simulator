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

var db = require('ripple/db'), 
    utils = require('ripple/utils'),
    lbs = require('ripple/platform/tizen/1.0/lbs_utils'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    PendingObject = require('ripple/platform/tizen/1.0/pendingObject'),
    PendingOperation = require('ripple/platform/tizen/1.0/pendingoperation'),
    SimpleCoordinates = require('ripple/platform/tizen/1.0/SimpleCoordinates'),
    GeocodeResult = require('ripple/platform/tizen/1.0/GeocodeResult'),
    _GEO_OBJECTS = "tizen1.0-geocode-objects",
    _get, _save, _geoList_init, GeoEntry,
    _checkAddressType, _transAddressStr,
    _geocodeByString, _findCoordsByString, _geocodeByAddress,
    _reverseGeocodeBySimple, _reverseGeocodeByGeo, _checkCoordsType,
    _self, _geoList = [],
    _PENDING_TIME = 10;

function _get() {
    var geoList = [],
        data = db.retrieveObject(_GEO_OBJECTS);
    
    utils.forEach(data, function (geo) {
        geoList.push(geo);
    });
    return geoList;
}

function _save() {
    db.saveObject(_GEO_OBJECTS, _geoList);
}

function _geoList_init() {
    var entry;
    _geoList = _get();

    /* Put some default data if database is empty */
    if (_geoList.length === 0) {
        entry = new GeoEntry(new lbs.StructuredAddress({
            country : "UK",
            region : "London",
            county : "Lambeth",
            city : "London",
            street : "Westminster Bridge Road",
            streetNumber : "1",
            premises : "Riverside Building",
            additionalInformation : "London Eye",
            postalCode : "SE1 7PB"
        }),
            new lbs.GeoCoordinates({
            latitude : 51.510452,
            longitude : -0.119820,
            altitude : 0,
            accuracy : 0,
            altitudeAccuracy : 0,
            heading : 0,
            speed : 0
        }));
        _geoList.push(entry);
        entry = new GeoEntry(new lbs.StructuredAddress({
            country : "UK",
            city : "London",
            street : "Baker Street",
            streetNumber : "221B",
            postalCode : "NW1 6XE"
        }),
            new lbs.GeoCoordinates({
            latitude : 51.524552,
            longitude : -0.158615,
            altitude : 0,
            accuracy : 0,
            altitudeAccuracy : 0,
            heading : 0,
            speed : 0
        }));
        _geoList.push(entry);
        entry = new GeoEntry(new lbs.StructuredAddress({
            country : "US",
            region : "OR",
            city : "Portland",
            street : "SE Water Ave",
            streetNumber : "1945",
            additionalInformation : "OMSI",
        }),
            new lbs.GeoCoordinates({
            latitude : 45.508490,
            longitude : -122.665953,
            altitude : 0,
            accuracy : 0,
            altitudeAccuracy : 0,
            heading : 0,
            speed : 0
        }));
        _geoList.push(entry);
        entry = new GeoEntry(new lbs.StructuredAddress({
            country : "US",
            region : "OR",
            city : "Portland",
            street : "NW Pittock Drive",
            streetNumber : "3229",
            additionalInformation : "Pittock Mansion",
        }),
            new lbs.GeoCoordinates({
            latitude : 45.531365,
            longitude : -122.716255,
            altitude : 0,
            accuracy : 0,
            altitudeAccuracy : 0,
            heading : 0,
            speed : 0
        }));
        _geoList.push(entry);
        entry = new GeoEntry(new lbs.StructuredAddress({
            region : "OR",
            city : "Hillsboro",
            street : "NE 25th St",
            streetNumber : "2111",
            postalCode : "97124"
        }),
            new lbs.GeoCoordinates({
            latitude : 45.543479,
            longitude : -122.9621601,
            altitude : 0,
            accuracy : 0,
            altitudeAccuracy : 0,
            heading : 0,
            speed : 0
        }));
        _geoList.push(entry);
        _save();
    }
}

function _pendingOperate(operate) {
    var pendingObj, pendingOperation, i, argumentVector = [];

    for (i = 0; i < arguments.length - 1; i++)
        argumentVector[i] = arguments[i + 1];

    pendingObj = new PendingObject();

    pendingObj.pendingID = window.setTimeout(function () {
        pendingObj.setCancelFlag(false);
        operate.apply(this, argumentVector);
    }, _PENDING_TIME);

    pendingOperation = new PendingOperation(pendingObj);

    return pendingOperation;
}

function GeoEntry(addr, coord) {
    var _self;
    _self = {
        address : addr || null,
        coordinate : coord || null
    };
    return _self;
}

function SortMode() {
    var _self;
    _self = {
        attributeName : "",
        order : "ASC"
    };
    return _self;
}

function _transAddressStr(addr) {
    var str = "";
    if (addr.additionalInformation !== null && addr.additionalInformation !== undefined)
        str = str + addr.additionalInformation + ", ";
    if (addr.premises !== null && addr.premises !== undefined)
        str = str + addr.premises + ", ";
    if (addr.streetNumber !== null && addr.streetNumber !== undefined)
        str = str + addr.streetNumber + " ";
    if (addr.street !== null && addr.street !== undefined)
        str = str + addr.street + ", ";
    if (addr.city !== null && addr.city !== undefined)
        str = str + addr.city + ", ";
    if (addr.county !== null && addr.county !== undefined)
        str = str + addr.county + ", ";
    if (addr.region !== null && addr.region !== undefined)
        str = str + addr.region + ", ";
    if (addr.country !== null && addr.country !== undefined)
        str = str + addr.country + ", ";
    if (addr.postalCode !== null && addr.postalCode !== undefined)
        str = str + addr.postalCode;

    if (str.lastIndexOf(", ") === str.length - 2)
        str = str.slice(0, -2);
    return str;
}

function _concatAddress(addr) {
    var str = "";
    if (addr.additionalInformation !== null && addr.additionalInformation !== undefined)
        str = str + addr.additionalInformation + " ";
    if (addr.premises !== null && addr.premises !== undefined)
        str = str + addr.premises + " ";
    if (addr.streetNumber !== null && addr.streetNumber !== undefined)
        str = str + addr.streetNumber + " ";
    if (addr.street !== null && addr.street !== undefined)
        str = str + addr.street + " ";
    if (addr.city !== null && addr.city !== undefined)
        str = str + addr.city + " ";
    if (addr.county !== null && addr.county !== undefined)
        str = str + addr.county + " ";
    if (addr.region !== null && addr.region !== undefined)
        str = str + addr.region + " ";
    if (addr.country !== null && addr.country !== undefined)
        str = str + addr.country + " ";
    if (addr.postalCode !== null && addr.postalCode !== undefined)
        str = str + addr.postalCode;

    return str;
}

function _findCoordsByString(address) {
    var array = [], reg, str, searchAddr, pieces, i;
    if (address.length === 0)
        return array;

    pieces = address.split(",");
    searchAddr = "";
    for (i = 0; i < pieces.length; i++) {
        searchAddr = searchAddr + pieces[i];
    }
    reg = new RegExp(searchAddr, "i");
    
    utils.forEach(_geoList, function (item) {
        str = _concatAddress(item.address);
        if (str.search(reg) !== -1)
            array.push(new GeocodeResult(item.coordinate.latitude, item.coordinate.longitude));
    });

    return array;
}

function _geocodeByString(address, successCB, errorCB, options) {
    var array;
    array = _findCoordsByString(address);
    successCB(array);
}

function _findCoordsByAddress(addr) {
    var array = [], select = false, i;
    for (i = 0; i < _geoList.length; i++) {
        select = false;
        if (addr.country !== null && addr.country !== undefined) {
            if (addr.country === _geoList[i].address.country)
                select = true;
            else
                continue;
        }
        
        if (addr.region !== null && addr.region !== undefined) {
            if (addr.region === _geoList[i].address.region)
                select = true;
            else
                continue;
        }

        if (addr.county !== null && addr.county !== undefined) {
            if (addr.county === _geoList[i].address.county)
                select = true;
            else
                continue;
        }

        if (addr.city !== null && addr.city !== undefined) {
            if (addr.city === _geoList[i].address.city)
                select = true;
            else
                continue;
        }

        if (addr.street !== null && addr.street !== undefined) {
            if (addr.street === _geoList[i].address.street)
                select = true;
            else
                continue;
        }

        if (addr.streetNumber !== null && addr.streetNumber !== undefined) {
            if (addr.streetNumber === _geoList[i].address.streetNumber)
                select = true;
            else
                continue;
        }

        if (addr.premises !== null && addr.premises !== undefined) {
            if (addr.premises === _geoList[i].address.premises)
                select = true;
            else
                continue;
        }

        if (addr.additionalInformation !== null && 
            addr.additionalInformation !== undefined) {
            if (addr.additionalInformation === _geoList[i].address.additionalInformation)
                select = true;
            else
                continue;
        }

        if (addr.postalCode !== null && addr.postalCode !== undefined) {
            if (addr.postalCode === _geoList[i].address.postalCode)
                select = true;
            else
                continue;
        }

        if (select === true) {
            array.push(new GeocodeResult(_geoList[i].coordinate.latitude, _geoList[i].coordinate.longitude));
        }
    }

    return array;
}

function _geocodeByAddress(address, successCB, errorCB, options) {
    var array;
    array = _findCoordsByAddress(address);
    successCB(array);
}

function _checkAddressType(address) {
    var str;
    if (typeof address === "string") {
        str = "string";
    } else if (typeof address === "object") {
        str = "StructuredAddress";
    } else {
        str = "typeMismatch";
    }
    return str;
}

function _checkCoordsType(coord) {
    var str;
    /* SimpleCoordinates is a subset of GeoCoordinates.
       SimpleCoordinates includes latitude, longitude as mandatory fields only.
       GeoCoordinates not only includes latitude, longitude as mandatory fields 
       but also at least includes one more other optional fields */
    if (typeof coord !== "object") {
        str = "typeMismatch";
    } else if (typeof coord.latitude === "number" &&
                typeof coord.longitude === "number") {
        str = "simpleCoordinates";
        if (typeof coord.altitude === "number" ||
            typeof coord.accuracy === "number" ||
            typeof coord.altitudeAccuracy === "number" ||
            typeof coord.heading === "number" ||
            typeof coord.speed === "number") {
            str = "geoCoordinates";
        }
    } else {
        str = "typeMismatch";
    }

    return str;
}

function _findReverseGeocode(coords, options) {
    var array = [], _isStructured = false, i;
    if (options !== null && options !== undefined) {
        if (options.resultType === "STRUCTURED") {
            _isStructured = true;
        }
    }
    for (i = 0; i < _geoList.length; i++) {
        if (_geoList[i].coordinate.latitude === coords.latitude &&
            _geoList[i].coordinate.longitude === coords.longitude) {
            if (coords.altitude) {
                if (_geoList[i].coordinate.altitude !== coords.altitude)
                    continue;
            }
            if (coords.accuracy) {
                if (_geoList[i].coordinate.accuracy !== coords.accuracy)
                    continue;
            }
            if (coords.altitudeAccuracy) {
                if (_geoList[i].coordinate.altitudeAccuracy !== coords.altitudeAccuracy)
                    continue;
            }
            if (coords.heading) {
                if (_geoList[i].coordinate.heading !== coords.heading)
                    continue;
            }
            if (coords.speed) {
                if (_geoList[i].coordinate.speed !== coords.speed)
                    continue;
            }

            if (_isStructured === true) {
                array.push(new lbs.StructuredAddress(_geoList[i].address));
            } else {
                array.push(_transAddressStr(_geoList[i].address));
            }
        }
    }
    return array;
}

function _reverseGeocodeByGeo(coordinates, successCB, errorCB, options) {
    var array, coord;
    coord = new lbs.GeoCoordinates(coordinates);
    array = _findReverseGeocode(coord, options);
    return successCB(array);
}

function _reverseGeocodeBySimple(coordinates, successCB, errorCB, options) {
    var array, coord;
    coord = new lbs.GeoCoordinates({
            latitude : coordinates.latitude,
            longitude : coordinates.longitude
        });
    array = _findReverseGeocode(coord, options);
    return successCB(array);
}

module.exports = function (prop) {
    var _self = new lbs.LocationServiceProvider(prop);
    _geoList_init();
    
    _self.geocode = function (address, successCB, errorCB, options) {
        function _geocode() {
            var ret;
        
            ret = _pendingOperate(function () {
                /* address: its type is AbstractAddress. 
                   It could be StructuredAddress or String */
                if (_checkAddressType(address) === "string") {
                    _geocodeByString(address, successCB, errorCB, options);
                } else if (_checkAddressType(address) === "StructuredAddress") {
                    _geocodeByAddress(address, successCB, errorCB, options);
                } else {
                    throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                }
            });
        }

        tizen1_utils.validateTypeMismatch(successCB, errorCB, "geocode", _geocode); 
    };

    _self.reverseGeocode = function (coordinates, successCB, errorCB, options) {
        function _reverseGeocode() {
            var ret;
            
            ret = _pendingOperate(function () {
                /* coordinates: Its type is AbstractCoordinates.
                   It could be SimpleCoordinates or GeoCoordinates */
                if (_checkCoordsType(coordinates) === "simpleCoordinates") {
                    _reverseGeocodeBySimple(coordinates, successCB, errorCB, options);
                } else if (_checkCoordsType(coordinates) === "geoCoordinates") {
                    _reverseGeocodeByGeo(coordinates, successCB, errorCB, options);
                } else {
                    throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                }
            });
        }

        tizen1_utils.validateTypeMismatch(successCB, errorCB, "reverseGeocode", _reverseGeocode);
    };

    return _self;
};

