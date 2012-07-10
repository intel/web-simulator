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

describe("wac2.0_geolocation", function () {
    var geo = require('ripple/geo'),
        geolocation = require('ripple/platform/wac/2.0/geolocation'),
        PositionError = require('ripple/platform/w3c/1.0/PositionError');

    beforeEach(function () {
        geo.delay = 0;
    });

    it("getCurrentPosition calls the error callback when timeout is 0", function () {
        var success = jasmine.createSpy("success_callback"),
            error = function (e) {
                expect(e.code).toEqual(PositionError.TIMEOUT);
            },
            options = {
                enableHighAccuracy: false,
                timeout: 0,
                maximumAge: 10
            };

        geolocation.getCurrentPosition(success, error, options);
        waits(19);
    });

    it("watchPosition calls the error callback when timeout is lesser than delay", function () {
        var success = jasmine.createSpy("success_callback"),
            error = function (e) {
                expect(e.code).toEqual(PositionError.TIMEOUT);
            },
            options = {
                enableHighAccuracy: false,
                timeout: 40,
                maximumAge: 20
            },
            watchId = 0;

        waits(40);
        watchId = geolocation.watchPosition(success, error, options);
        waits(10);

        runs(function () {
            geolocation.clearWatch(watchId);
        });
    });

    it("watchPosition calls the success callback when cached data is available", function () {
        var pos = [],
            i = 0,
            success = function (p) {
                pos[i] = p;
                if (i > 0) {
                    expect(pos[i - 1].coords.latitude).toEqual(pos[i].coords.latitude);
                    expect(pos[i - 1].coords.longitude).toEqual(pos[i].coords.longitude);
                    expect(pos[i - 1].coords.altitude).toEqual(pos[i].coords.altitude);
                    expect(pos[i - 1].coords.altitudeAccuracy).toEqual(pos[i].coords.altitudeAccuracy);
                    expect(pos[i - 1].coords.accuracy).toEqual(pos[i].coords.accuracy);
                    expect(pos[i - 1].coords.heading).toEqual(pos[i].coords.heading);
                    expect(pos[i - 1].coords.speed).toEqual(pos[i].coords.speed);

                    if (i % 2 !== 0)
                        expect(pos[i - 1].timestamp).toEqual(pos[i].timestamp);
                    else
                        expect(pos[i - 1].timestamp).not.toEqual(pos[i].timestamp);
                }
                ++i;
            },
            error = jasmine.createSpy("error_callback"),
            options = {
                enableHighAccuracy: false,
                timeout: 60,
                maximumAge: 20
            },
            watchId = 0;

        waits(60);
        watchId = geolocation.watchPosition(success, error, options);
        waits(120);

        runs(function () {
            geolocation.clearWatch(watchId);
            expect(error).not.toHaveBeenCalled();
        });
    });
});

