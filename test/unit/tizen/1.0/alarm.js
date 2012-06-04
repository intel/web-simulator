/*
 * Copyright 2011 Intel Corporation.
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

describe("tizen_1.0_alarm", function () {
    var db = require('ripple/db'),
    platform = require('ripple/platform'),
    Alarm = require('ripple/platform/tizen/1.0/alarm'),
    AlarmAbsolute = require('ripple/platform/tizen/1.0/AlarmAbsolute'),
    AlarmRelative = require('ripple/platform/tizen/1.0/AlarmRelative'),
    alarm = new Alarm(),
    _byDayValue = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
    yesterday, today = new Date(), current, tomorrow;

    beforeEach(function () {
        spyOn(db, "retrieveObject");
        spyOn(db, "saveObject");
        spyOn(platform, "current").andReturn(require('ripple/platform/tizen/1.0/spec'));
        yesterday = new Date(today);
        tomorrow = new Date(today);
        current = new Date(today);
        yesterday.setDate(today.getDate() - 1); /*yesterday*/
        tomorrow.setDate(today.getDate() + 1);  /*tomorrow*/
    });/*need db first*/

/*
   **** Test no 1
   *Add an alarm to the storage
   ****
*/
    it("adds an alarm to the storage", function () {
        var date = new Date(current.getTime() + 3600000),
        alarm_a = new AlarmRelative(1 * alarm.PERIOD_MINUTE), 
        alarm_b = new AlarmRelative(1 * alarm.PERIOD_MINUTE, 1 * alarm.PERIOD_MINUTE),
        alarm_c = new AlarmAbsolute(date),
        alarm_d = new AlarmAbsolute(date, 2 * alarm.PERIOD_MINUTE);
        alarm.add(alarm_a, "alarm_a");
        alarm.add(alarm_b, "alarm_b");
        alarm.add(alarm_c, "alarm_c");
        alarm.add(alarm_d, "alarm_d");
	
        runs(function () {
            var alarms = alarm.getAll(), length = alarms.length;
            expect(alarms[length - 4].id).toEqual(alarm_a.id);
            expect(alarms[length - 3].id).toEqual(alarm_b.id);
            expect(alarms[length - 2].id).toEqual(alarm_c.id);
            expect(alarms[length - 1].id).toEqual(alarm_d.id);
            expect(alarms[length - 1].period).toEqual(2 * alarm.PERIOD_MINUTE);
        });
    });

/*
   **** Test no 2
   *add alarm - TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type
   ****
*/
    it("add alarm - TYPE_MISMATCH_ERROR if alarm parameter is not compatible with the expected type", function () {
        try {
            alarm.add("bla", "alarmclock");
        } catch (e) {
            expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
        }
    });

/*
   **** Test no 3
   *add alarm - TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type - 2
   ****
*/
    it("add alarm - TYPE_MISMATCH_ERROR if applicationid parameter is not compatible with the expected type", function () {
        var alarm_a = new AlarmRelative(1 * alarm.PERIOD_MINUTE);
        try {
            alarm.add(alarm_a, 123);
        } catch (e) {
            expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
        }
    });

/*
   **** Test no 4
   *add alarm - TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type - 3
   ****
*/
    it("add alarm - TYPE_MISMATCH_ERROR if arguments parameter is not compatible with the expected type", function () {
        var alarm_a = new AlarmRelative(1 * alarm.PERIOD_MINUTE);
        try {
            alarm.add(alarm_a, "alarmclock", 123);
        } catch (e) {
            expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
        }
    });

/*
   **** Test no 5
   *Remove an alarm from the storage
   ****
*/
    it("remove an alarm from the storage", function () {
        var alarms = [], length,
        alarm_a = new AlarmRelative(1 * alarm.PERIOD_MINUTE);
        alarm.add(alarm_a, "alarmclock");

        runs(function () {
            alarms = alarm.getAll();
            length = alarms.length;
            expect(alarms[length - 1].id).toEqual(alarm_a.id);
            alarm.remove(alarm_a.id);
            alarms = alarm.getAll();
            length = alarms.length;
            if (alarms.length > 0)
                expect(alarms[length - 1].id).not.toEqual(alarm_a.id);
        });
    });

/*
   **** Test no 6
   *Remove alarm - NOT_FOUND_ERROR name if this alarm identifier cannot be found in the storage
   ****
*/
    it("remove alarm - NOT_FOUND_ERROR name if this alarm identifier cannot be found in the storage", function () {
        try {
            alarm.remove("unexisting_id");
        } catch (e) {
            expect(e.code).toEqual(e.NOT_FOUND_ERR);
        }
    });

/*
   **** Test no 7
   *Remove alarm - TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type - use a function
   ****
*/
    it("remove alarm - TYPE_MISMATCH_ERROR if input parameter is not compatible with the expected type", function () {
        var err = function () {};
        try {
            alarm.remove(err);
        } catch (e) {
            expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
        }
    });

/*
   **** Test no 8
   *Get alarm - Returns the alarm with the given identifier.
   ****
*/
    it("Get an alarm from the storage", function () {
        var alarm_a = new AlarmRelative(1 * alarm.PERIOD_MINUTE);
        alarm.add(alarm_a, "alarmclock");

        runs(function () {
            var alarm_b = alarm.get(alarm_a.id);
            expect(alarm_b.id).toEqual(alarm_a.id);
        });
    });

/*
   **** Test no 9
   *Get alarm - NOT_FOUND_ERROR name if this alarm identifier cannot be found in the storage
   ****
*/
    it("Get alarm - NOT_FOUND_ERROR name if this alarm identifier cannot be found in the storage", function () {
        try {
            alarm.get("unexisting_id");
        } catch (e) {
            expect(e.code).toEqual(e.NOT_FOUND_ERR);
        }
    });

/*
   **** Test no 10
   *Get alarm - TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type - use a function
   ****
*/
    it("get alarm - TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type", function () {
        var err = function () {};
        try {
            alarm.get(err);
        } catch (e) {
            expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
        }
    });

/*
   **** Test no 11
   *Alarms that have already been triggered are removed automatically from the storage
   ****
*/
    it("alarms that have already been triggered are removed automatically from the storage----1,AlarmRelative,expired", function () {
        var alarm_a = new AlarmRelative(0.1 * alarm.PERIOD_MINUTE), alarms, length;
        alarm.add(alarm_a, "alarmclock");
        waits(6000);
        
        runs(function () {
            alarms = alarm.getAll();
            length = alarms.length;
            if (alarms.length > 0)
                expect(alarms[length - 1].id).not.toEqual(alarm_a.id);
        });
    });

/*
   **** Test no 12
   *Alarms that have already been triggered are removed automatically from the storage
   ****
*/
    it("alarms that have already been triggered are removed automatically from the storage----2,AlarmAbsolute,expired", function () {
        var current = new Date(), 
        alarm_a = new AlarmAbsolute(current), alarms, length;
        
        alarm.add(alarm_a, "alarmclock");

        runs(function () {
            alarms = alarm.getAll();
            length = alarms.length;
            if (alarms.length > 0)
                expect(alarms[length - 1].id).not.toEqual(alarm_a.id);
        });
    });

/*
   **** Test no 13
   *Alarms that have already been triggered are removed automatically from the storage
   ****
*/
    it("alarms that have already been triggered are removed automatically from the storage----3,AlarmAbsolute,not expired", function () {
        var current = new Date(), alarm_a = new AlarmAbsolute(current, ["SU", "MO"]), alarms, length;
        alarm.add(alarm_a, "alarmclock");
        /*wait for it to trigger*/
        runs(function () {
            alarms = alarm.getAll();
            length = alarms.length;
            if (alarms.length > 0)
                expect(alarms[length - 1].id).toEqual(alarm_a.id);
        });
    });

/*
   **** Test no 14
   *removeAll :Removes all the alarms added by the application
   ****
*/
    it("removeAll :Removes all the alarms added by the application.", function () {
        var alarm_a = new AlarmRelative(1 * alarm.PERIOD_MINUTE, 3 * alarm.PERIOD_MINUTE), alarms, length;
        alarm.add(alarm_a, "alarmclock");
        runs(function () {
            alarm.removeAll();
            alarms = alarm.getAll();
            length = alarms.length;
            expect(length).toEqual(0);
        });
    });

/*
   **** Test no 15
   *getRemainingSeconds returns the duration in seconds before the next alarm trigger.----1.before first trigger time
   ****
*/
    it("getRemainingSeconds returns the duration in seconds before the next alarm trigger", function () {
        var alarm_a = new AlarmRelative(1 * alarm.PERIOD_MINUTE, 3 * alarm.PERIOD_MINUTE), real, expected;
        alarm.add(alarm_a, "alarmclock");
        expected = 0.9 * alarm.PERIOD_MINUTE;
        waits(6000);

        runs(function () {
            real = alarm_a.getRemainingSeconds();
            expect(real).toEqual(expected);
        });
    });

/*
   **** Test no 16
   *getRemainingSeconds returns the duration in seconds before the next alarm trigger.----2. after first trigger time
   ****
*/
    it("getRemainingSeconds returns the duration in seconds before the next alarm trigger", function () {
        var alarm_a = new AlarmRelative(0.1 * alarm.PERIOD_MINUTE, 3 * alarm.PERIOD_MINUTE), real, expected;
        alarm.add(alarm_a, "alarmclock");
        expected = 3 * alarm.PERIOD_MINUTE;
        waits(6000);
        
        runs(function () {
            real = alarm_a.getRemainingSeconds();
            expect(real).toEqual(expected);
        });
    });

/*
   **** Test no 17
   *getRemainingSeconds returns the duration in seconds before the next alarm trigger.----3. after n triggers 
   ****
*/
    it("getRemainingSeconds returns the duration in seconds before the next alarm trigger", function () {
        var alarm_a = new AlarmRelative(0.1 * alarm.PERIOD_MINUTE, 0.1 * alarm.PERIOD_MINUTE), real, expected;
        alarm.add(alarm_a, "alarmclock");
        expected = 0.1 * alarm.PERIOD_MINUTE;
        waits(12000);

        runs(function () {
            real = alarm_a.getRemainingSeconds();
            expect(real).toEqual(expected);
        });
    });

/*
   **** Test no 18
   *getRemainingSeconds returns the duration in seconds before the next alarm trigger.----4. after first triggers,no repeat
   ****
*/
    it("getRemainingSeconds returns the duration in seconds before the next alarm trigger", function () {
        var alarm_a = new AlarmRelative(0.1 * alarm.PERIOD_MINUTE), real;
        alarm.add(alarm_a, "alarmclock");
        waits(6000);

        runs(function () {
            real = alarm_a.getRemainingSeconds();
            expect(real).toEqual(null);
        });
    });

/*
   **** Test no 19
   *getRemainingSeconds returns the duration in seconds before the next alarm trigger.----4. before first triggers,no repeat
   ****
*/
    it("getRemainingSeconds returns the duration in seconds before the next alarm trigger", function () {
        var alarm_a = new AlarmRelative(0.2 * alarm.PERIOD_MINUTE), real;
        alarm.add(alarm_a, "alarmclock");
        waits(6000);

        runs(function () {
            real = alarm_a.getRemainingSeconds();
            expect(real).toEqual(0.1 * alarm.PERIOD_MINUTE);
        });
    });

/*
   **** Test no 20
   *create an AlarmAbsolute
	new AlarmAbsolute (date);
	new AlarmAbsolute (date, ByDayValue[] daysOfTheWeek);
	new AlarmAbsolute (date, period);
   ****
*/
    it("create an AlarmAbsolute using different constructors", function () {
        var alarm_a = new AlarmAbsolute(today), 
        alarm_b = new AlarmAbsolute(today, alarm.PERIOD_HOUR),
        alarm_c = new AlarmAbsolute(today, ['SA', 'FR']);

        runs(function () {
            expect(alarm_a.period).toEqual(null);
            expect(alarm_a.daysOfTheWeek.length).toEqual(0);
            expect(alarm_b.daysOfTheWeek.length).toEqual(0);
            expect(alarm_b.period).toEqual(alarm.PERIOD_HOUR);
            expect(alarm_c.period).toEqual(alarm.PERIOD_WEEK);
        });
    });

/*
   **** Test no 21
   create an AlarmAbsolute
	new AlarmAbsolute (date, ByDayValue[] daysOfTheWeek); daysOfTheWeek TYPE_MISMATCH_ERROR
	error code TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type for that parameter.
   ****
*/
    xit("new AlarmAbsolute (date, ByDayValue[] daysOfTheWeek); daysOfTheWeek TYPE_MISMATCH_ERROR", function () {
        try {
            new AlarmAbsolute(today, ['1', 'FR']);
        } catch (e) {
            console.log(e.code);
            expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
        }
    });

/*
   **** Test no 22
   create an AlarmAbsolute
	new AlarmAbsolute (date, ByDayValue[] daysOfTheWeek); daysOfTheWeek TYPE_MISMATCH_ERROR
	error code TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type for that parameter.
   ****
*/
    xit("new AlarmAbsolute (date, ByDayValue[] daysOfTheWeek); daysOfTheWeek TYPE_MISMATCH_ERROR", function () {
        try {
            new AlarmAbsolute(today, ['', 'FR']);
        } catch (e) {
            runs(function () {
                console.log(e.code);
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

/*
   **** Test no 23
   *getNextScheduledDate(),alarm.period === null,setTriggerDate has passed,return null 
   ****
*/
    it("getNextScheduledDate(),no repeat,period === null,setTriggerDate has passed,return null", function () {
        var alarm_c = new AlarmAbsolute(yesterday), nextTiggerDate, alarmlist;
        nextTiggerDate = alarm_c.getNextScheduledDate();	
        alarmlist = alarm.getAll();

        runs(function () {
            expect(alarmlist[alarmlist.length - 1]).not.toEqual(alarm_c.id);//this alarm is triggered, remove from db
            expect(alarm_c.period).toEqual(null);
            expect(alarm_c.daysOfTheWeek.length).toEqual(0);
            expect(nextTiggerDate).toEqual(null);
        });
    });

/*
   **** Test no 24
   *getNextScheduledDate(),alarm.period === null,setTriggerDate has not passed,so return setTriggerDate 
   ****
*/
    it("getNextScheduledDate(),alarm.period === null,setTriggerDate has not passed,so return alarm.date", function () {
        var alarm_c = new AlarmAbsolute(tomorrow), nextTriggerDate, alarmlist;
        nextTriggerDate = alarm_c.getNextScheduledDate();
        alarm.add(alarm_c, "test");
        alarmlist = alarm.getAll();

        runs(function () {
            expect(alarmlist[alarmlist.length - 1].id).toEqual(alarm_c.id);//this alarm has not been triggered, store in db
            expect(alarm_c.period).toEqual(null);
            expect(alarm_c.daysOfTheWeek.length).toEqual(0);
            expect(nextTriggerDate).toEqual(tomorrow);
        });
    });

/*
   **** Test no 25
   *getNextScheduledDate(),period !== null, return triggerTime
   ****
*/
    it("getNextScheduledDate(),period !== null, setTriggerDate has passed,return triggerTime", function () {
        var alarm_c, nextTriggerDate, triggerDate = today;
        alarm_c = new AlarmAbsolute(today, 2 * alarm.PERIOD_MINUTE);

        runs(function () {
            nextTriggerDate = alarm_c.getNextScheduledDate();
            triggerDate.setTime(triggerDate.getTime() + 120 * 1000);//add 2 minute
            expect(alarm_c.period).toEqual(120);
            expect(alarm_c.daysOfTheWeek.length).toEqual(0);
            expect(nextTriggerDate).toEqual(triggerDate);
        });
    });
/*
   **** Test no 26
   getNextScheduledDate(),period !== null, setTriggerDate has not passed,return alarm.date
   ****
*/
    it("getNextScheduledDate(),period !== null, setTriggerDate has not passed,return alarm.date", function () {
        var alarm_c, nextTriggerDate;
        alarm_c = new AlarmAbsolute(tomorrow, 2 * alarm.PERIOD_MINUTE);
        runs(function () {
            nextTriggerDate = alarm_c.getNextScheduledDate();
            expect(alarm_c.period).toEqual(120);
            expect(alarm_c.daysOfTheWeek.length).toEqual(0);
            expect(nextTriggerDate).toEqual(tomorrow);
        });
    });
/*
   **** Test no 27
   *getNextScheduledDate(),period = alarm.PERIOD_WEEK, return nextTriggerDate(perWeek)
   ****
*/
    it("getNextScheduledDate(),period = alarm.PERIOD_WEEK, return nextTriggerDate(perWeek),today between in daysOfTheWeek,after triggertime,return triggerDate", function () {
        var alarm_c, nextTriggerDate, triggerDate = today, daysOfTheWeek = [];
        //today is include in daysOfTheWeek
        daysOfTheWeek.push(_byDayValue[yesterday.getDay()]); //day-1
        daysOfTheWeek.push(_byDayValue[tomorrow.getDay()]);//day+1
        triggerDate.setDate(tomorrow.getDate());
        alarm_c = new AlarmAbsolute(today, daysOfTheWeek);
        runs(function () {
            nextTriggerDate = alarm_c.getNextScheduledDate();
            expect(alarm_c.period).toEqual(alarm.PERIOD_WEEK);
            expect(alarm_c.daysOfTheWeek.length).toEqual(2);
            expect(alarm_c.date).toEqual(today);
            expect(nextTriggerDate).toEqual(triggerDate);
        });
    });

/*
   **** Test no 28
  getNextScheduledDate(),period = alarm.PERIOD_WEEK, return nextTriggerDate(perWeek),today is triggerDay,before triggertime,return triggerDate
   ****
*/
    it("getNextScheduledDate(),period = alarm.PERIOD_WEEK, return nextTriggerDate(perWeek),today is triggerDay,before triggertime,return triggerDate", function () {
        var alarm_c, nextTriggerDate, triggerDate = today, day = today.getDay(), daysOfTheWeek = [];
        //today in daysOfTheWeek
        daysOfTheWeek.push(_byDayValue[yesterday.getDay()]); //day-1
        daysOfTheWeek.push(_byDayValue[day]);//day+1
        triggerDate.setHours(today.getHours() + 1);
        alarm_c = new AlarmAbsolute(triggerDate, daysOfTheWeek);

        runs(function () {
            nextTriggerDate = alarm_c.getNextScheduledDate();
            expect(alarm_c.period).toEqual(alarm.PERIOD_WEEK);
            expect(alarm_c.daysOfTheWeek.length).toEqual(2);
            expect(alarm_c.date).toEqual(triggerDate);
            expect(nextTriggerDate).toEqual(triggerDate);
        });
    });

/*
   **** Test no 29
   getNextScheduledDate(),period = alarm.PERIOD_WEEK, return nextTriggerDate(perWeek),today is excluded from daysOfTheWeek
   ****
*/
    it("getNextScheduledDate(),period = alarm.PERIOD_WEEK, return nextTriggerDate(perWeek),today is excluded from daysOfTheWeek", function () {
        var alarm_c, nextTriggerDate, triggerDate = today, daysOfTheWeek = [];
        //today is excluded from daysOfTheWeek
        daysOfTheWeek.push(_byDayValue[tomorrow.getDay()]);//day+1
        tomorrow.setDate(tomorrow.getDate() + 1);
        daysOfTheWeek.push(_byDayValue[tomorrow.getDay()]);//day+2
        triggerDate.setDate(triggerDate.getDate() + 1);
        alarm_c = new AlarmAbsolute(today, daysOfTheWeek);

        runs(function () {
            nextTriggerDate = alarm_c.getNextScheduledDate();
            expect(alarm_c.period).toEqual(alarm.PERIOD_WEEK);
            expect(alarm_c.daysOfTheWeek.length).toEqual(2);
            expect(alarm_c.date).toEqual(today);
            expect(nextTriggerDate).toEqual(triggerDate);
        });
    });
/*
   **** Test no 30
   getNextScheduledDate(),period = alarm.PERIOD_WEEK, return nextTriggerDate(perWeek),today is excluded from daysOfTheWeek
   ****
*/
    it("getNextScheduledDate(),period = alarm.PERIOD_WEEK, return nextTriggerDate(perWeek),today is excluded from daysOfTheWeek", function () {
        var alarm_c, nextTriggerDate, triggerDate = today, daysOfTheWeek = [];
        //today is excluded from daysOfTheWeek
        daysOfTheWeek.push(_byDayValue[yesterday.getDay()]);//day-1
        yesterday.setDate(yesterday.getDate() - 1);
        daysOfTheWeek.push(_byDayValue[yesterday.getDay()]);//day-2
        triggerDate.setDate(today.getDate() + 5);
        alarm_c = new AlarmAbsolute(today, daysOfTheWeek);

        runs(function () {
            nextTriggerDate = alarm_c.getNextScheduledDate();
            expect(alarm_c.period).toEqual(alarm.PERIOD_WEEK);
            expect(alarm_c.daysOfTheWeek.length).toEqual(2);
            expect(alarm_c.date).toEqual(today);
            expect(nextTriggerDate).toEqual(triggerDate);
        });
    });

/*
   **** Test no 31
   getNextScheduledDate(),period !== null, setTriggerDate has passed,return triggerTime
   ****
*/
    it("getNextScheduledDate(),period !== null, setTriggerDate has passed,return triggerTime", function () {
        var alarm_c, nextTriggerDate, triggerDate = new Date();
        alarm_c = new AlarmAbsolute(triggerDate, 1 * alarm.PERIOD_MINUTE);
        runs(function () {
            nextTriggerDate = alarm_c.getNextScheduledDate();
            triggerDate.setTime(triggerDate.getTime() + 60 * 1000);//add 1 minute
            expect(alarm_c.period).toEqual(60);
            expect(alarm_c.daysOfTheWeek.length).toEqual(0);
            expect(nextTriggerDate).toEqual(triggerDate);
        });
    });
});
