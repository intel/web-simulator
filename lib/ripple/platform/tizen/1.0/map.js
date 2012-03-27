/*
 *  Copyright 2012 Intel Corporation
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

var lbs = require('ripple/platform/tizen/1.0/lbs'),
    mapProviders = [],
    MapStyle,
    MapProvider,
    _self;

function _initialize() {
    // EPSG:3857 is a Spherical Mercator projection coordinate system popularized by web services such as Google and later OpenStreetMap
    // mapStyles are from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    var projection = "EPSG:3857",
        mapStyle1 = new MapStyle("Mapnik", "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png"),
        mapStyle2 = new MapStyle("Cycle", "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png");

    mapProviders = [new MapProvider({name: "OpenStreetMap", connectivity: "ONLINE"}, projection, [mapStyle1, mapStyle2])];
}

_self = {
    getDefaultProvider: function () {
        return mapProviders[0];
    },
    getProviders: function () {
        return mapProviders;
    }
};

MapStyle = function (name, url) {
    return {
        name: name,
        url: url
    };
};

MapProvider = function (prop, projection, mapStyles) {
    var mapProvider = new lbs.LocationServiceProvider(prop);

    mapProvider.__defineGetter__("projection", function () {
        return projection;
    });

    mapProvider.__defineGetter__("mapStyles", function () {
        return mapStyles;
    });

    return mapProvider;
};

_initialize();

module.exports = _self;
