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

var OpenMapQuestProvider = require('ripple/platform/tizen/1.0/poiBackend_openmapquest'), // opne.MapQuest.xapi service
    _providers,
    _security = {
        "http://tizen.org/api/poi": [],
        "http://tizen.org/api/poi.read": ["find"],
        "http://tizen.org/api/poi.write": ["add", "remove", "update"],
        all: true
    },
    _self;

function _initialize() {
    _providers = [new OpenMapQuestProvider({name : "MapQuest", connectivity : "ONLINE", metaData : _security})];
}

_self = function () {
    var poi;

    poi = {
        getDefaultProvider : function () {
            return _providers[0];
        },
        getProviders : function () {
            return _providers;
        },
        handleSubFeatures: function (subFeatures) {
            var i, subFeature;
            for (subFeature in subFeatures) {
                if (_security[subFeature].length === 0) {
                    _security.all = true;
                    break;
                }
                _security.all = false;
                for (i = 0; i < _security[subFeature].length; i++) {
                    _security[_security[subFeature][i]] = true;
                }
            }
            _initialize();
        }
    };

    return poi;
};

module.exports = _self;
