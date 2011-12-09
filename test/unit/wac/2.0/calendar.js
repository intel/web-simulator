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


describe("wac_2.0_calendar", function () {
    var Calendar = require('ripple/platform/wac/2.0/calendar'),
        wac2_utils = require('ripple/platform/wac/2.0/wac2_utils'),
        db = require('ripple/db'),
        cal = [], calendars = new Calendar(),
        _WAIT_TIME = 6, _LONG_WAIT_TIME = 11,
        _predefinedEvent = {description: "descriptioN",
                           summary: "summarY",
                           startTime: new Date(2012, 5, 15),
                           duration: 12,
                           location: "locatioN",
                           categories: ["personaL", "businesS"],
                           recurrence: calendars.DAILY_RECURRENCE,
                           expires: new Date(2012, 5, 18),
                           interval: 1,
                           status: calendars.TENTATIVE_STATUS,
                           alarmType: calendars.SILENT_ALARM,
                           alarmTrigger: -10},
        _checkPredefined = function (e) {
            var dateString, 
                startDateString = new Date(2012, 5, 15).toDateString(),

            expireString = new Date(2012, 5, 18).toDateString();
            expect(e.description).toEqual("descriptioN");
            expect(e.summary).toEqual("summarY");
            expect(wac2_utils.isValidDate(e.startTime)).toEqual(true);
            dateString = e.startTime.toDateString();
            expect(dateString).toEqual(startDateString);
            expect(e.duration).toEqual(12);
            expect(e.location).toEqual("locatioN");
            expect(e.recurrence).toEqual(calendars.DAILY_RECURRENCE);
            expect(e.expires.toDateString()).toEqual(expireString);
            expect(e.interval).toEqual(1);
            expect(e.status).toEqual(calendars.TENTATIVE_STATUS);
            expect(e.alarmTrigger).toEqual(-10);
            expect(e.alarmType).toEqual(calendars.SILENT_ALARM);
        };

    beforeEach(function () {
        spyOn(db, "retrieveObject");
        spyOn(db, "saveObject");
    });

    it("getCalendars should return an array of calendars", function () {
        var getCalendarOK = function (c) {
            cal = c;
            expect(cal.length).toEqual(2);
            expect(cal[0].name).toMatch("sim cal");
            expect(cal[1].name).toMatch("dev cal");
        };
        calendars.getCalendars(getCalendarOK, null);
        waits(_WAIT_TIME);
    });

    it("createEvent: test default value", function () {
        var e, dateString, todayString = new Date().toDateString();
        e = cal[0].createEvent();
        expect(e.description).toEqual("");
        expect(e.summary).toEqual("");
        expect(wac2_utils.isValidDate(e.startTime)).toEqual(true);
        dateString = e.startTime.toDateString();
        expect(dateString).toEqual(todayString);
        expect(e.duration).toEqual(0);
        expect(e.location).toEqual("");
        expect(e.recurrence).toEqual(calendars.NO_RECURRENCE);
        expect(e.expires).toEqual(null);
        expect(e.interval).toEqual(null);
        expect(e.status).toEqual(calendars.CONFIRMED_STATUS);
        expect(e.alarmTrigger).toEqual(0);
        expect(e.alarmType).toEqual(calendars.NO_ALARM);
    });

    it("createEvent: with a predefined value", function () {
        var e;
        e = cal[0].createEvent(_predefinedEvent);
        _checkPredefined(e);
    });

    it("add/find/delete Event: with a predefined value", function () {
        var pendingOP, eventID,
        onDeleteSuccess = jasmine.createSpy(),
        notCalledSpy = jasmine.createSpy(),
        onError = jasmine.createSpy(),

        onAddSuccess = function (event) {
            _checkPredefined(event);
            expect(onError).wasNotCalled();
            eventID = event.id;
        },
        onFindSuccess = function (event) {
            expect(event.length).toBe(1);
            expect(event[0].id).toBe(eventID);
            _checkPredefined(event[0]);
            expect(onError).wasNotCalled();
        },
        notFoundCallback = function (error) {
            expect(error.code).toEqual(error.NOT_FOUND_ERR);
        };


        pendingOP = cal[0].addEvent(onAddSuccess, onError, _predefinedEvent);
        waits(_WAIT_TIME);
        runs(function () {
            pendingOP = cal[0].findEvents(onFindSuccess, onError);
        });
        waits(_LONG_WAIT_TIME);
        runs(function () {
            pendingOP = cal[0].findEvents(onFindSuccess, onError, {id: eventID});
        });
        waits(_LONG_WAIT_TIME);
        runs(function () {
            pendingOP = cal[0].findEvents(onFindSuccess, onError, {initialStartDate: new Date(2012, 5, 15)});
        });
        waits(_LONG_WAIT_TIME);
        runs(function () {
            pendingOP = cal[0].findEvents(onFindSuccess, onError, {endStartDate: new Date(2012, 5, 15)});
        });
        waits(_LONG_WAIT_TIME);
        runs(function () {
            pendingOP = cal[0].findEvents(onFindSuccess, onError, {category: "personaL"});
        });
        waits(_LONG_WAIT_TIME);
        runs(function () {
            pendingOP = cal[0].findEvents(onFindSuccess, onError, {status: [calendars.TENTATIVE_STATUS]});
        });
        waits(_LONG_WAIT_TIME);
        runs(function () {
            pendingOP = cal[0].findEvents(onFindSuccess, onError, {id: eventID, description: "descrip%"});
        });
        waits(_LONG_WAIT_TIME);
        runs(function () {
            pendingOP = cal[0].deleteEvent(onDeleteSuccess, onError, eventID);
        });
        waits(_WAIT_TIME);
        runs(function () {
            expect(onDeleteSuccess).toHaveBeenCalled();
            expect(onError).wasNotCalled();
        });
        runs(function () {
            pendingOP = cal[0].deleteEvent(notCalledSpy, notFoundCallback, eventID);
        });
        waits(_WAIT_TIME);
        runs(function () {
            expect(notCalledSpy).wasNotCalled();
        });
    });

});
