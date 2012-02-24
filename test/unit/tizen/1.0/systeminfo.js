describe("tizen_1.0_systeminfo", function () {
    var db = require('ripple/db'),
        platform = require('ripple/platform'),
        systeminfo = require('ripple/platform/tizen/1.0/systeminfo');

    beforeEach(function () {
        spyOn(db, "retrieveObject");
        spyOn(db, "saveObject");
        spyOn(platform, "current").andReturn(require('ripple/platform/tizen/1.0/spec'));
        //spyOn(device, "Power.level.callback").andReturn(80);
    });

    it("isSupported checks if a property is supported by the device", function () {
		var power, blabla;

		runs(function () {
			power = systeminfo.isSupported("Power");
			blabla = systeminfo.isSupported("Blabla");
			expect(power).toEqual(true);
			expect(blabla).toEqual(false);
		});
	});

	it("getPropertyValue retrieves the current state of a given system property", function () {
		var error = jasmine.createSpy("error_callback"),     
            successCB = function (power) {
            expect(power.level).toEqual(100);
		};

		runs(function () {
			systeminfo.getPropertyValue("Power", successCB, error);
		});

		waits(300);

		runs(function () {
			expect(error).not.toHaveBeenCalled();
		});
	});

    it("addPropertyValueChangeListener allows tracking the change of one or several system properties, get the value", function () {
		var successCB = function (power) {
            expect(power.level).toEqual(100);
		},
		errorCB = jasmine.createSpy("error_callback"),  
		watchID = null; 

		runs(function () {
			watchID =  systeminfo.addPropertyValueChangeListener("Power", successCB, errorCB, {highThreshold : 50});
		});

		waits(200);
    
		runs(function () {
			expect(errorCB).not.toHaveBeenCalled();			
		});
	});

    it("If the listenerID argument does not correspond to a valid subscription, the method should return without any further action, remove right", function () {
		var successCB = jasmine.createSpy("success_callback"),  
		errorCB = jasmine.createSpy("error_callback"),  
		watchID = null; 

		runs(function () {
			watchID =  systeminfo.addPropertyValueChangeListener("Power", successCB, errorCB, {highThreshold : 0.2});
		});

		waits(400);
		
		runs(function () {
			expect(errorCB).not.toHaveBeenCalled();
			expect(successCB.callCount).toEqual(1);
		});

		runs(function () {
			systeminfo.removePropertyChangeListener(watchID);
		});

		waits(100);
	});   

    it("If the listenerID argument does not correspond to a valid subscription, the method should return without any further action, remove wrong", function () {
		var successCB = jasmine.createSpy("success_callback"),  
		errorCB = jasmine.createSpy("error_callback"),  
		watchID = null,
        removeResult; 

		runs(function () {
			watchID =  systeminfo.addPropertyValueChangeListener("Power", successCB, errorCB, {highThreshold : 0.2});
		});

		waits(400);
		
		runs(function () {
			expect(errorCB).not.toHaveBeenCalled();
			expect(successCB.callCount).toEqual(1);
		});

		runs(function () {
			removeResult = systeminfo.removePropertyChangeListener("string");
            expect(removeResult).toEqual(null);
		});

		waits(100);
	});   
});
