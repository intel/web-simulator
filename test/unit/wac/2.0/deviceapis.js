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


describeBrowser("wac_2.0_deviceapis", function () {
    var deviceapis = require('ripple/platform/wac/2.0/deviceapis'),
        platform = require('ripple/platform'),
        utils = require('ripple/utils'),
        activeCount = 0,
        availCount = 0,

    _countAvail = function (objects) {
        var count = 0;
        utils.forEach(objects, function (obj, key) {
            if (obj.feature) {
                count += obj.feature.split('|').length;
            }
            if (obj.children) {
                count += _countAvail(obj.children);
            }
        });
        return count;
    },

    _setUserConfigXML = function (filePath) {
        var result, info,
            app = require('ripple/app'),
            widgetConfig = require('ripple/widgetConfig'),
            config = require('ripple/platform/wac/2.0/spec/config'),
            xmlHttp = new XMLHttpRequest();
            
        xmlHttp.open("GET", filePath, false);
        xmlHttp.send();
        result = widgetConfig.validate(xmlHttp.responseXML);

        if (typeof config.extractInfo === "function") {
            info = config.extractInfo(result);
        }
        app.setInfo(info);
        activeCount = utils.count(info.features);
    };

    beforeEach(function () {
        spyOn(platform, "current").andReturn(require('ripple/platform/wac/2.0/spec'));
        _setUserConfigXML("test/assets/config/config_wac_2.0.xml");
    });

    it("listAvailableFeatures should return an array of features", function () {
        var availableFeatures = deviceapis.listAvailableFeatures(),
            spec = require('ripple/platform/wac/2.0/spec');
        availCount = _countAvail(spec.objects);
        expect(typeof availableFeatures).toBe("object");
        expect(availableFeatures[0].uri).toBe("http://www.w3.org/TR/geolocation-API/");
        expect(typeof availableFeatures.length).toBe("number");
        expect(availableFeatures.length).toBe(availCount);

    });

    it("listActivatedFeatures should return an array of features", function () {
        var activatedFeatures = deviceapis.listActivatedFeatures();
        expect(typeof activatedFeatures).toBe("object");
        expect(typeof activatedFeatures.length).toBe("number");
        expect(activatedFeatures.length).toBe(activeCount);
    });
});
