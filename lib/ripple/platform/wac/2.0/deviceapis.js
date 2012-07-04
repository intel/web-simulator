/*
 *  Copyright 2011 Intel Corporation.
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

var platform = require('ripple/platform'),
    app = require('ripple/app'),
    utils = require('ripple/utils'),
    init_done = false,
    _activatedSet = {},
    _activatedFeatures = [],
    _availableSet = {},
    _availableFeatures = [],
    _features = {},
    initFeaturesSet,
    populateFeatures;

populateFeatures = function (objects) {
    utils.forEach(objects, function (obj, key) {
        var objFeatures = {}, rpt, i, j;
        if (obj.feature) {
            objFeatures = obj.feature.split('|');
            utils.forEach(objFeatures, function (feature) {
                var avail = {uri: feature,
                             required: false,
                             param: null};
                _availableSet[feature] = avail;
            });
            if (_features) {
                rpt = objFeatures.length;
                j = 0;
                for (i = 0; i < rpt; i++) {
                    if (!_features[objFeatures[j]]) {
                        objFeatures.splice(j, 1);
                    } else {
                        j++;
                    }
                }
            }
            utils.forEach(objFeatures, function (feature) {
                var avail = {uri: feature,
                             required: true,
                             param: null};
                _activatedSet[feature] = avail;
            });
        }
        if (obj.children) {
            populateFeatures(obj.children);
        }
    });
};

initFeaturesSet = function () {
    _features = utils.copy(app.getInfo().features);
    populateFeatures(platform.current().objects);
    utils.forEach(_activatedSet, function (obj, key) {
            _activatedFeatures.push(obj);
        });
    utils.forEach(_availableSet, function (obj, key) {
            _availableFeatures.push(obj);
        });
    init_done = true;
};

module.exports = {
    listAvailableFeatures: function () {
        if (!init_done)
            initFeaturesSet();
        return _availableFeatures;
    },

    listActivatedFeatures: function () {
        if (!init_done)
            initFeaturesSet();
        return _activatedFeatures;
    }
};

