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
debugger;
describe("wac_2.0_devicestatus", function () {
    var devicestatus = require('ripple/platform/wac/2.0/devicestatus'),
        errorcode = require('ripple/platform/wac/2.0/errorcode'),
        event = require('ripple/event'),
        platform = require('ripple/platform'),
        db = require('ripple/db');       

    beforeEach(function () {
        spyOn(platform, "current").andReturn(require('ripple/platform/wac/2.0/spec'));
    });

    it("getPropertyValue raises an expection when success callback is not a function", function () {
        var error = jasmine.createSpy("error_callback");
        try {
            devicestatus.getPropertyValue(1, error);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });
        
    it("getComponents raises an expection when prop is missed", function () {
        var error = jasmine.createSpy("error_callback"),
            success = jasmine.createSpy("success_callback");
        try {
            devicestatus.getPropertyValue(success, error);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.INVALID_VALUES_ERR);
            });
        }
    });

    it("getComponents calls the error callback when the aspect in prop is invalid", function () {
        var success = jasmine.createSpy("success_callback"),
            error = function (e) {
                expect(e.code).toEqual(e.NOT_FOUND_ERR);
            },
            options = {
                property: "property", 
                aspect: "NoThisAspect"
            };

        waits(40);
        devicestatus.getPropertyValue(success, error, options);
        waits(40);
    });

    it("getComponents raises an expection when the property of aspect in prop is not found", function () {
        var success = jasmine.createSpy("success_callback"),
            error = function (e) {
                expect(e.code).toEqual(e.NOT_FOUND_ERR);
            },
            options = {
                property: "property", 
                aspect: "Battery"
            };
        
        waits(40);
        devicestatus.getPropertyValue(success, error, options);
        waits(40);
    
    });

    it("watchPropertyChange raises an expection when success callback is not a function", function () {
        var error = jasmine.createSpy();
        try {
            devicestatus.watchPropertyChange(1, error);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

    it("watchPropertyChange raises an expection when error callback is not a function", function () {
        var success = jasmine.createSpy();
        try {
            devicestatus.watchPropertyChange(success, 1);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

    it("watchPropertyChange calls the error callback when prop is missing", function () {
        var success = jasmine.createSpy(),
            error = function (e) {
                expect(e.code).toEqual(e.INVALID_VALUES_ERR);
            };

        waits(40);
        devicestatus.watchPropertyChange(success, error);
        waits(40);
    });

    it("watchPropertyChange calls the callback on the given prop without options", function () {
        var success = jasmine.createSpy("success_callback"),
            error = jasmine.createSpy("error_callback"),
            prop = {
                property: "batteryLevel", 
                aspect: "Battery"
            },
            watchId;

        watchId = devicestatus.watchPropertyChange(success, error, prop);
        waits(50);
        runs(function () {
            devicestatus.clearPropertyChange(watchId);
            expect(error).not.toHaveBeenCalled();
        });
    }); 

    it("watchPropertyChange calls the callback with timerinterval effect", function () {
        var prop = {
                property: "batteryLevel", 
                aspect: "Battery"
            },
            option = {
                maxNotificationInterval: 200
            },
            watchId,
            _value,
            error = jasmine.createSpy("error_callback"),
            success = jasmine.createSpy("success_callback");          

        watchId = devicestatus.watchPropertyChange(success, error, prop, option);
        waits(600);
        runs(function () {
            devicestatus.clearPropertyChange(watchId);
            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
        });
    });   

    it("watchPropertyChange won't call the callback as the interval between events is too short", function () {
        var prop = {
                property: "batteryLevel", 
                aspect: "Battery"
            },
            option = {
                minNotificationInterval: 100
            },
            watchId,
            error = jasmine.createSpy("error_callback"),     
            success = jasmine.createSpy("success_callback");      

        watchId = devicestatus.watchPropertyChange(success, error, prop, option);
        waits(100);
        event.trigger("BatteryLevelChanged", [100]);
        waits(300);
        event.trigger("BatteryLevelChanged", [90]);
        waits(100);
        runs(function () {
            devicestatus.clearPropertyChange(watchId);
            expect(error).not.toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
        });
    });   

    it("watchPropertyChange won't call the callback because of the percent effect", function () {
        var prop = {
                property: "batteryLevel", 
                aspect: "Battery"
            },
            option = {
                minChangePercent: 0.1
            },
            watchId,
            error = jasmine.createSpy("error_callback"),     
            success = jasmine.createSpy("success_callback");      

        watchId = devicestatus.watchPropertyChange(success, error, prop, option);
        waits(100);
        event.trigger("BatteryLevelChanged", [100]);
        waits(200);
        event.trigger("BatteryLevelChanged", [92]);
        waits(200);
        runs(function () {
            devicestatus.clearPropertyChange(watchId);
            expect(error).not.toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
        });
    });   

    it("watchPropertyChange won't care the percent effect as the maxNotificationInterval is set", function () {
        var prop = {
                property: "batteryLevel", 
                aspect: "Battery"
            },
            option = {
                maxNotificationInterval: 200,
                minChangePercent: 0.1
            },
            watchId,
            error = jasmine.createSpy("error_callback"),     
            success = jasmine.createSpy("success_callback");      

        watchId = devicestatus.watchPropertyChange(success, error, prop, option);
        waits(100);
        event.trigger("BatteryLevelChanged", [100]);
        waits(600);
        event.trigger("BatteryLevelChanged", [50]);
        waits(600);
        runs(function () {
            devicestatus.clearPropertyChange(watchId);
            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
        });
    });   

    it("watchPropertyChange won't care the percent effect as the minNotificationInterval is set", function () {
        var prop = {
                property: "batteryLevel", 
                aspect: "Battery"
            },
            option = {
                minNotificationInterval: 500,
                minChangePercent: 0.1
            },
            watchId,
            error = jasmine.createSpy("error_callback"),    
            success = jasmine.createSpy("success_callback");      

        watchId = devicestatus.watchPropertyChange(success, error, prop, option);
        waits(200);
        event.trigger("BatteryLevelChanged", [100]);
        waits(200);
        event.trigger("BatteryLevelChanged", [80]);
        waits(200);
        runs(function () {
            devicestatus.clearPropertyChange(watchId);
            expect(error).not.toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
        });
    });   
});
