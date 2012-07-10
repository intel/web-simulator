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

var SimpleCoordinates = require('ripple/platform/tizen/1.0/SimpleCoordinates'),
    GeoRectBounds = require('ripple/platform/tizen/1.0/GeoRectBounds');

module.exports = function (position, viewport, wkt) {
    var _self, _position = null, _viewport = null, _wkt = "";

    if (position) {
        _position = new SimpleCoordinates(position.latitude, position.longitude);
    }

    if (viewport) {
        _viewport = new GeoRectBounds(viewport.southWest, viewport.northEast);
    }

    if (wkt) {
        _wkt = String(wkt);
    }

    _self = {
        position : _position,
        viewport: _viewport,
        wkt: _wkt
    };

    return _self;
};
