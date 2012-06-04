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

var lbs = require('ripple/platform/tizen/1.0/lbs_utils'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    POIGeometry = require('ripple/platform/tizen/1.0/POIGeometry'),
    SimpleCoordinates = require('ripple/platform/tizen/1.0/SimpleCoordinates'),
    _security;

function POIPublic(prop) {
    /* This is created for public use */
    var _self, i, copy, attr,  _id = null, _providerName = null;
    if (prop.id) {
        _id = prop.id;
    }
    if (prop.providerName) {
        _providerName = prop.providerName;
    }
    _self = {
        name : null,
        categories : [],
        address : null,
        phoneNumbers : [],
        geometry : null,
        urls : [],
        rating : null,
        tags : null,
        toGeoJSON : function () {
            throw new WebAPIError(errorcode.NOT_SUPPORTED_ERR);
        }
    };

    _self.__defineGetter__("id", function () {
        return _id;
    });

    _self.__defineGetter__("providerName", function () {
        return _providerName;
    });

    if (prop) {
        if (prop.name) {
            _self.name = String(prop.name);
        }
        if (tizen1_utils.isValidArray(prop.categories)) {
            _self.categories = [];
            for (i in prop.categories) {
                _self.categories.push(String(prop.categories[i]));
            }
        }
        if (prop.address) {
            if (typeof prop.address === "string") {
                _self.address = String(prop.address);
            } else if (Object.prototype.toString.call(prop.address) === "[object Object]") {
                copy = prop.address.constructor();
                for (attr in prop.address) {
                    if (prop.address.hasOwnProperty(attr)) {
                        copy[attr] = prop.address[attr];
                    }
                }
                _self.address = copy;
            }
        }
        if (tizen1_utils.isValidArray(prop.phoneNumbers)) {
            _self.phoneNumbers = [];
            for (i in prop.phoneNumbers) {
                _self.phoneNumbers.push(String(prop.phoneNumbers[i]));
            }
        }
        if (prop.geometry) {
            _self.geometry = new POIGeometry(prop.geometry.position, prop.geometry.viewport, prop.geometry.wkt);
        }
        if (tizen1_utils.isValidArray(prop.urls)) {
            _self.urls = [];
            for (i in prop.urls) {
                _self.urls.push(String(prop.urls[i]));
            }
        }
        if (typeof prop.rating === "number") {
            _self.rating = prop.rating;
        }
        if (Object.prototype.toString.call(prop.tags) === "[object Object]") {
            copy = prop.tags.constructor();
            for (attr in prop.tags) {
                if (prop.tags.hasOwnProperty(attr)) {
                    copy[attr] = prop.tags[attr];
                }
            }
            _self.tags = copy;
        }
    }

    return _self;
}

module.exports = function (prop) {

    var _self = new lbs.LocationServiceProvider(prop);

    if (prop.metaData) {
        _security = prop.metaData;
    }

    _self.__defineGetter__("supportedFilterTypes", function () {
        return [];
    });

    _self.__defineGetter__("supportedPOIFilterAttributes", function () {
        return [];
    });

    _self.__defineGetter__("supportedCategories", function () {
        /* reference: http://wiki.openstreetmap.org/wiki/Map_Features#Amenity */
        return ["bar", "bbq", "biergarten", "cafe", "drinking_water", "fast_food", "food_court", "ice_cream",
                "pub", "restaurant", "college", "kindergarten", "library", "school", "university",
                "bicycle_parking", "bicycle_rental", "bus_station", "car_rental", "car_sharing", "car_wash",
                "ev_charging", "ferry_terminal", "fuel", "grit_bin", "parking", "parking_entrance",
                "parking_space", "taxi", "atm", "bank", "bureau_de_change", "baby_hatch", "clinic",
                "dentist", "doctors", "hospital", "nursing_home", "pharmacy", "social_facility", "veterinary",
                "arts_centre", "cinema", "community_centre", "fountain", "nightclub", "social_centre",
                "stripclub", "studio", "swingerclub", "theatre", "bench", "brothel", "clock", "courthouse",
                "crematorium", "embassy", "fire_station", "grave_yard", "hunting_stand", "marketplace",
                "place_of_worship", "police", "post_box", "post_office", "prison", "public_building",
                "recycling", "sauna", "shelter", "shower", "telephone", "toilets", "townhall", "vending_machine",
                "waste_basket", "waste_disposal", "watering_place"];
    });

    _self.__defineGetter__("capabilities", function () {
        /* The set is empty, indicating that this provider supports only 'find' operations */
        return [];
    });

    _self.find = function (point, successCallback, errorCallback, options) {
        /* This provider only supports searching by "GeoRectBounds" due to MapQuest XAPI limitation */

        function _find() {
            var searchStr, pois = [], isTypeOK = false,
                id, providerName, name, categories = [], geometry;

            if (Object.prototype.toString.call(point) === "[object Object]") {
                if (point.southWest && point.northEast) {
                    if (typeof point.southWest.latitude === "number" &&
                        typeof point.southWest.longitude === "number" &&
                        typeof point.northEast.latitude === "number" &&
                        typeof point.northEast.longitude === "number") {
                        isTypeOK = true;
                    }
                }
            }

            if (!isTypeOK) {
                throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
            }

            searchStr = "http://open.mapquestapi.com/xapi/api/0.6/node";
            if (options && tizen1_utils.isValidArray(options.categories) &&
                options.categories.length > 0 && typeof options.categories[0] === "string") {
                /* xapi support single amenity only */
                searchStr += "[amenity=" + options.categories[0] + "]";
            }
            searchStr += "[bbox=" + point.southWest.longitude + "," + point.southWest.latitude + "," +
                point.northEast.longitude + "," + point.northEast.latitude + "]";

            /* use Open MapQuest online xapi service. (http://open.mapquestapi.com/xapi/) */
            $.ajax({
                type: "GET",
                url: searchStr,
                dataType: "xml",
                timeout: 15000, /* 15 secs timeout */
                success: function (xml) {
                    providerName = $(xml).find("osm").attr("generator");
                    $(xml).find("node").each(function () {
                        var $item = $(this);
                        categories = [];
                        id = $item.attr("id");
                        geometry = new POIGeometry(new SimpleCoordinates($item.attr("lat"), $item.attr("lon")));
                        $item.find("tag").each(function () {
                            if ($(this).attr("k") === "name") {
                                name = $(this).attr("v");
                            } else if ($(this).attr("k") === "amenity") {
                                categories.push($(this).attr("v"));
                            }
                        });
                        pois.push(new POIPublic({id: id, providerName: providerName, name: name,
                                                categories: categories, geometry: geometry}));
                    });
                    successCallback(pois);
                },
                error: function (obj, msg) {
                    if (errorCallback) {
                        if (msg === "timeout") {
                            setTimeout(function () {
                                errorCallback(new WebAPIError(errorcode.TIMEOUT_ERR));
                            }, 1);
                        } else {
                            setTimeout(function () {
                                errorCallback(new WebAPIError(errorcode.NETWORK_ERR));
                            }, 1);
                        }
                    }
                }
            });
        }

        if (!_security.all && !_security.find) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "find", _find);
    };

    _self.update = function (poi, successCallback, errorCallback) {
        if (!_security.all && !_security.update) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        throw new WebAPIError(errorcode.NOT_SUPPORTED_ERR);
    };

    _self.add = function (poi, successCallback, errorCallback) {
        if (!_security.all && !_security.add) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        throw new WebAPIError(errorcode.NOT_SUPPORTED_ERR);
    };

    _self.remove = function (poi, successCallback, errorCallback) {
        if (!_security.all && !_security.remove) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        throw new WebAPIError(errorcode.NOT_SUPPORTED_ERR);
    };

    return _self;
};
