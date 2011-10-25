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

describe("wac_2.0_accelerometer", function () {
    var accel = require('ripple/platform/wac/2.0/accelerometer');

    it("getCurrentAcceleration raises an expection when success callback is not a function", function () {
        var error = jasmine.createSpy();
        try {
            accel.getCurrentAcceleration(1, error);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

    it("getCurrentAcceleration raises an expection when error callback is not a function", function () {
        var success = jasmine.createSpy();
        try {
            accel.getCurrentAcceleration(success, 1);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

    it("getCurrentAcceleration calls the error callback when success callback is null", function () {
        var error = function(e) {
            expect(e.code).toEqual(e.INVALID_VALUES_ERR);
        };
        accel.getCurrentAcceleration(null, error);
        waits(1);
    });

    it("getCurrentAcceleration calls the success callback", function () {
        var success = jasmine.createSpy();
        accel.getCurrentAcceleration(success, jasmine.createSpy());
        waits(1);
        runs(function () {
            expect(success.callCount).toEqual(1);
        });
    });

    it("watchAcceleration raises an expection when success callback is not a function", function () {
        var error = jasmine.createSpy();
        try {
            accel.watchAcceleration(1, error);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

    it("watchAcceleration raises an expection when error callback is not a function", function () {
        var success = jasmine.createSpy();
        try {
            accel.watchAcceleration(success, 1);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

    it("watchAcceleration calls the error callback when success callback is null", function () {
        var error = function(e) {
            expect(e.code).toEqual(e.INVALID_VALUES_ERR);
        };
        accel.watchAcceleration(null, error);
        waits(1);
    });

    it("watchAcceleration calls the callback on the given interval", function () {
        var success = jasmine.createSpy("success"),
            failure = jasmine.createSpy("failure"),
            options = {minNotificationInterval: 10},
            watchId = accel.watchAcceleration(success, failure, options);

        waits(39);

        runs(function () {
            accel.clearWatch(watchId);
            expect(success.callCount).toEqual(3);
            expect(failure).not.toHaveBeenCalled();
        });
    });

    it("watchAcceleration calls the callback on the default interval", function () {
        var success = jasmine.createSpy("success"),
            failure = jasmine.createSpy("failure"),
            watchId = accel.watchAcceleration(success, failure);

        waits(390);

        runs(function () {
            accel.clearWatch(watchId);
            expect(success.callCount).toEqual(3);
            expect(failure).not.toHaveBeenCalled();
        });
    });
});
