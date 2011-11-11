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

//describeBrowser("wac_2.0_camera", function () {
describe("wac_2.0_camera", function () {
    var Camera = require('ripple/platform/wac/2.0/camera'),
        platform = require('ripple/platform'),
        camera,

    _featureSetup = function (feature) {
        var f = {},
        cameraFeature = {id: feature};

        f[feature] = cameraFeature;

        camera = new Camera();
        camera.handleSubFeatures(f);
        delete camera.handleSubFeatures;
    };

    beforeEach(function () {
        spyOn(platform, "current").andReturn(require('ripple/platform/wac/2.0/spec'));
    });
    
    it("getCameras should return an array of cameras", function () {
        var getCameraOK = function (cams) {
            expect(cams.length).toEqual(2);
            expect(cams[0].id).toMatch("rear");
            expect(cams[1].id).toMatch("front");
        };
        _featureSetup("http://wacapps.net/api/camera");
        camera.getCameras(getCameraOK, null);
    });

    it("feature camera.show test", function () {
        var cam0,
            success = jasmine.createSpy(),
            getCameraOK = function (cams) {
                var securityError = function (e) {
                    expect(e.code).toEqual(e.SECURITY_ERR);
                },
                    capImgSuccess = function (filename) {
                        expect(filename).toMatch("high-rear_capture.jpg");
                    };
                cam0 = cams[0];
                cam0.captureImage(capImgSuccess, securityError);
                waits(3001);
                cam0.createPreviewNode(success, securityError);
            };
        _featureSetup("http://wacapps.net/api/camera.capture");
        camera.getCameras(getCameraOK, null);
        waits(3001);
    });

});
