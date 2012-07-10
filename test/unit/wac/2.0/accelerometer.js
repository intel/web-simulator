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

/* 
   **** Test no 1
   * Tests to see if the TYPE_MISMATCH_ERR exception is thrown when success callback is not a function
   ****
*/
    it("getCurrentAcceleration raises an exception when success callback is not a function", function () {
        var error = jasmine.createSpy();
        try {
            accel.getCurrentAcceleration(1, error); // instead of a function, getCurrentAcceleration gets an integer as successCallback parameter
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

/* 
   **** Test no 2
   * Tests to see if the TYPE_MISMATCH_ERR exception is thrown when error callback is not a function
   ****
*/
    it("getCurrentAcceleration raises an exception when error callback is not a function", function () {
        var success = jasmine.createSpy();
        try {
            accel.getCurrentAcceleration(success, 1); // instead of a function, getCurrentAcceleration gets an integer as errorCallback parameter
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

/* 
   **** Test no 3
   * Tests to see if the INVALID_VALUE_ERR exception is thrown when success callback is null
   ****
*/
    it("getCurrentAcceleration calls the error callback when success callback is null", function () {
        var error = function (e) {
            expect(e.code).toEqual(e.INVALID_VALUES_ERR);
        };
        accel.getCurrentAcceleration(null, error); // instead of a function, getCurrentAcceleration gets null as successCallback parameter
        waits(1);
    });

/* 
   **** Test no 4
   * Tests to see if getCurrentAcceleration throwns exception SYNCHRONOUSLY
   ****
*/
    it("getCurrentAcceleration raises an expection SYNCHRONOUSLY", function () {
        var error = jasmine.createSpy(),
        over = false;
        try {
            accel.getCurrentAcceleration(1, error);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
                over = true;
            });
        }
        runs(function () {
            expect(over).toBeTruthy(); 
        });
    });

/* 
   **** Test no 5
   * Tests to see if getCurrentAcceleration behaves as it should when all the parameters are valid and if the success callback receives an Accelerator object
   ****
*/
    it("getCurrentAcceleration calls the success callback", function () {
        var failure = jasmine.createSpy();
        accel.getCurrentAcceleration(function (acceleration) {
            expect(acceleration.xAxis).toBeDefined();
            expect(acceleration.yAxis).toBeDefined();
            expect(acceleration.zAxis).toBeDefined();
        }, failure);
        waits(10);
        runs(function () {
            expect(failure).not.toHaveBeenCalled();// no error should appear
        });
    });

/* 
   **** Test no 6
   * Tests to see if getCurrentAcceleration silently fail if errorCallback is null (success calback is null)
   ****
*/
    it("getCurrentAcceleration silently fail if error callback is not a valid function and an error occurs (success callback is null)", function () {
        var noExcp = 0;
        try {
            accel.getCurrentAcceleration(null, null); // instead of a function, getCurrentAcceleration gets null as errorCallback parameter
        } catch (e) {
            runs(function () {
                noExcp++; // number of exceptions thrown increases
            });
        }
        runs(function () {
            expect(noExcp).toEqual(0); // number of execeptions thrown should be 0
        });
    });

/* 
   **** Test no 7
   * Tests to see if the exception TYPE_MISMATCH_ERR is thrown when success callback is not a function
   ****
*/
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

/* 
   **** Test no 8
   * Tests to see if the exception TYPE_MISMATCH_ERR is thrown when error callback is not a function
   ****
*/
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

/* 
   **** Test no 9
   * Tests to see if the exception INVALID_VALUES_ERR is thrown when success callback is null
   ****
*/
    it("watchAcceleration calls the error callback when success callback is null", function () {
        var error = function (e) {
            expect(e.code).toEqual(e.INVALID_VALUES_ERR);
        };
        accel.watchAcceleration(null, error);
        waits(1);
    });

/* 
   **** Test no 10
   * Tests to see if watchAcceleration throwns exception SYNCHRONOUSLY
   ****
*/
    it("watchAcceleration raises an expection SYNCHRONOUSLY", function () {
        var error = jasmine.createSpy(),
        over = false;
        try {
            accel.watchAcceleration(1, error);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
                over = true;
            });
        }
        runs(function () {
            expect(over).toBeTruthy(); // after a 1/2 of second, the over variable is tested to be truthy
        });
    });

/* 
   **** Test no 11
   * Tests to see if watchAcceleration silently fail if errorCallback is null (success calback is null)
   ****
*/
    it("watchAcceleration silently fail if error callback is not a valid function and an error occurs (success callback is null)", function () {
        var noExcp = 0;
        try {
            accel.watchAcceleration(null, null); // instead of a function, getCurrentAcceleration gets null as errorCallback parameter
        } catch (e) {
            runs(function () {
                noExcp++; // number of exceptions thrown increases
            });
        }
        runs(function () {
            expect(noExcp).toEqual(0); // number of execeptions thrown should be 0
        });
    });

/* 
   **** Test no 12
   * Test watchAcceleration for success on a given interval. After the first succesful retrieval of the acceleration values,
   * the watch operation continues its execution, monitoring the device acceleration values and invoking the appropriate callback
   * every time the acceleration changes. The watch operation MUST continue until the clearWatch() method is called with the
   * corresponding subscription identifier.
   ****
*/
    it("watchAcceleration calls the callback on a given interval", function () {
        var success = jasmine.createSpy("success"),
            failure = jasmine.createSpy("failure"),
            options = {minNotificationInterval: 10},// the interval is set for 10 miliseconds
            watchId = 0;
        watchId = accel.watchAcceleration(success, failure, options);// the watch is run with no option (default interval)
        waits(35);
        runs(function () {
            accel.clearWatch(watchId);
            expect(success.callCount).toEqual(3);// in 35 miliseconds the success callback is called 3 times
            expect(failure).not.toHaveBeenCalled(); //no error should appear
        });
    });

/* 
   **** Test no 13
   * Test watchAcceleration for success on the default interval. After the first succesful retrieval of the acceleration values,
   * the watch operation continues its execution, monitoring the device acceleration values and invoking the appropriate callback
   * every time the acceleration changes. The watch operation MUST continue until the clearWatch() method is called with the
   * corresponding subscription identifier.
   ****
*/
    it("watchAcceleration calls the callback on the default interval", function () {
        var success = jasmine.createSpy("success"),
            failure = jasmine.createSpy("failure"),
            watchId = 0;
        watchId =  accel.watchAcceleration(success, failure);// the watch is run with no option (default interval)
        waits(350);
        runs(function () {
            accel.clearWatch(watchId);
            expect(success.callCount).toEqual(3);// in 350 miliseconds the success callback is called 3 times (as the default interval is 100 miliseconds
            expect(failure).not.toHaveBeenCalled(); //no error should appear
        });
    });

/* 
   **** Test no 14
   * If the options parameter is passed and contains a valid value in the minNotificationInterval attribute, the implementation
   * MUST NOT invoke the successCallback unless a length of time at least equal to the minNotificationInterval parameter has occurred
   ****
*/
    it("watchAcceleration calls the callback on a given interval", function () {
        var success = jasmine.createSpy("success"),
            failure = jasmine.createSpy("failure"),
            options = {minNotificationInterval: 200},// the min interval is set for 200 miliseconds
            watchId = 0;
        watchId = accel.watchAcceleration(success, failure, options);
        waits(100); //wait for 100 miliseconds
        runs(function () {
            accel.clearWatch(watchId);
            expect(success).not.toHaveBeenCalled(); // after 100 milisecond no success callback should be called
            expect(failure).not.toHaveBeenCalled(); // no error should appear
        });
    });

/* 
   **** Test no 15
   * If the options parameter does not contain a valid value or it is undefined or null, the implementation MUST ignore its content and
   * proceed without minNotificationInterval
   ****
*/
    it("watchAcceleration ignores invalid minNotificationInterval (string)", function () {
        var success = jasmine.createSpy("success"),
            failure = jasmine.createSpy("failure"),
            options = {minNotificationInterval: "a"},// the minNotificationInterval should be a log variable, but it's initialized as a string
            watchId = 0;
        watchId = accel.watchAcceleration(success, failure, options);
        waits(350);
        runs(function () {
            accel.clearWatch(watchId);
            expect(success.callCount).toEqual(3); // the watch runs with success callback for 3 times
            expect(failure).not.toHaveBeenCalled(); // no error should appear
        });
    });

/* 
   **** Test no 16
   * Test if the watchAcceleration returns a valid watchId
   ****
*/
    it("watchAcceleration returns watchId", function () {
        var success = jasmine.createSpy("success"),
            failure = jasmine.createSpy("failure"),
            watchId = accel.watchAcceleration(success, failure);
        waits(190);
        runs(function () {
            expect(watchId).toBeDefined(); //the watchId should be defined
            accel.clearWatch(watchId);
        });
    });

/* 
   **** Test no 17
   * Tests to see if watchAcceleration behaves as it should when all the parameters are valid: the success callback receives an Accelerator object
   ****
*/
    it("watchAcceleration calls the success callback (called with error callback)", function () {
        var failure = jasmine.createSpy(),
            success = function (acceleration) {//the three parameters of the object returned should be defined
                expect(acceleration.xAxis).toBeDefined();
                expect(acceleration.yAxis).toBeDefined();
                expect(acceleration.zAxis).toBeDefined();
            },
            watchId = 0;
        runs(function () { 
            watchId = accel.watchAcceleration(success, failure);
        });
        waits(110);
        runs(function () {
            accel.clearWatch(watchId);
        });
        runs(function () {
            expect(failure).not.toHaveBeenCalled();//no error should appear
        });
    });

/* 
   **** Test no 18
   * Tests to see if clearWatch stops the watchAcceleration when invoked correctly
   ****
*/
    it("clearWatch stops the watchAcceleration when invoke correctly", function () {
        var success = jasmine.createSpy(),
            failure = jasmine.createSpy(),
            options = {minNotificationInterval: 10},
            watchId = 0;
        watchId = accel.watchAcceleration(success, failure, options);
        runs(function () {
            setTimeout(function () { //sets a delay got clearWatch of 29 miliseconds
                accel.clearWatch(watchId);
                expect(success.callCount).toEqual(2);//checks the call count for success callback to be 2
                expect(failure).not.toHaveBeenCalled();//no error appeared
            }, 25);
        });
        waits(35);
        runs(function () {
            expect(success.callCount).toEqual(2); 
        });
    });

/* 
   **** Test no 19
   * Tests to see if clearWatch doesn't stop the watchAccelerator when invoke with invalid parameter
   ****
*/
    it("watchAcceleration continues if clearWatch is used with invalid value", function () {
        var success = jasmine.createSpy(),
            failure = jasmine.createSpy(),
            options = {minNotificationInterval: 10},
            watchId = 0;
        watchId = accel.watchAcceleration(success, failure, options);
        waits(25);
        runs(function () {
            accel.clearWatch(null); //in the middle of the 'watching', clearWatch is called with an invalid parameter
        });
        waits(10);
        runs(function () {
            accel.clearWatch(watchId);
            expect(success.callCount).toEqual(3); //watch stops only when the valid Id is called
            expect(failure).not.toHaveBeenCalled();// no error appeared
        });
    });
});
