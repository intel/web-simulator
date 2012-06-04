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
    ProviderLocal = require('ripple/platform/tizen/1.0/geoBackend_local'),
    ProviderNominatim = require('ripple/platform/tizen/1.0/geoBackend_nominatim'), // Nominatim geocode service
    _getProviders,
    _providers,
    _self;

function _initialize() {
    _providers = [new ProviderNominatim({name : "Nominatim", connectivity : "ONLINE"})
                  /* ,new ProviderLocal({name : "Tizen Database", connectivity : "OFFLINE"}) */];
}

_initialize();

_self = {
    getDefaultProvider : function () {
        return _providers[0];
    },
    getProviders : function () {
        return _providers;
    }
};

module.exports = _self;
