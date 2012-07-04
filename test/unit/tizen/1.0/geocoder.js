/*
Unit test for Geocoder module
Author: Andreea Sandu
Email: andreea.m.sandu@intel.com
*/

describe("tizen_1.0_geocoder", function () {
    var errorcode = require('ripple/platform/tizen/1.0/CommonError'),
    db = require('ripple/db'),
    platform = require('ripple/platform'),
    geocoder = require('ripple/platform/tizen/1.0/geocoder');
    beforeEach(function () {
        spyOn(db, "retrieveObject");
        spyOn(db, "saveObject");
        spyOn(platform, "current").andReturn(require('ripple/platform/tizen/1.0/spec'));
    });

	
/*
   **** Test no 1
   *getDefaultProvider gets the default GeocoderProvider
   ****
*/	
    it("getDefaultProvider gets the default GeocoderProvider", function () {
        var provider = null;
        runs(function () {
            provider = geocoder.getDefaultProvider();
            expect(typeof provider).toEqual("object");
        });
    });

/*
   **** Test no 2
   *getDefaultProvider throws exception if parameter is not void
   ****
*/
    it("getDefaultProvider throws exception if parameter is not void", function () {
        var provider = null;
        try {
            provider = geocoder.getDefaultProvider(1);
        } catch (e) {
            expect(e.code).toEqual(errorcode.INVALID_ARGUMENT_ERROR);
        }
    });
	
/*
   **** Test no 3
   *getProviders gets an array of GeocoderProviders available 
   ****
*/	
    it("getProviders gets an array of GeocoderProviders available", function () {
        var providers = null;
        runs(function () {
            providers = geocoder.getProviders();
            expect(typeof providers[0]).toEqual("object");
        });
    });
	
/*
   **** Test no 4
   *getProviders throws exception if parameter is not void
   ****
*/
    it("getDefaultProvider throws exception if parameter is not void", function () {
        var providers = null;
        try {
            providers = geocoder.getProviders(1);
        } catch (e) {
            expect(e.code).toEqual(errorcode.INVALID_ARGUMENT_ERROR);
        }
    });
	
/*
   **** Test no 5
   *geocode transforms address to coordinates 
   ****
*/
    it("geocode transforms address to coordinates", function () {
        var successCB = function (result) {
            expect(result[0].latitude).toEqual(45.543479);
            expect(result[0].longitude).toEqual(-122.9621601);
        },
        address = '2111 NE 25th St, Hillsboro, OR, 97124';
        runs(function () {
            geocoder.getDefaultProvider().geocode(address, successCB);
        });
    });
	
/*
   **** Test no 6
   *geocode throws exception if input parameter is not compatible with the expected type
   ****
*/
    it("geocode throws exception if input parameter is not compatible with the expected type", function () {
        var address = '2111 NE 25th St, Hillsboro, OR, 97124';
        try {
            geocoder.getDefaultProvider().geocode(address, 1);
        } catch (e) {
            expect(e.code).toEqual(errorcode.TYPE_MISMATCH_ERROR);
        }  
    });
	
/*
   **** Test no 7
   *geocode throws exception if input parameter is not compatible with the expected type - 2
   ****
*/ 
    it("geocode throws exception if input parameter is not compatible with the expected type - 2", function () {
        var successCB = function (result) {
            expect(result[0].latitude).toEqual(45.54);
            expect(result[0].longitude).toEqual(-122.96);
        },
        address = '2111 NE 25th St, Hillsboro, OR, 97124';
        try {
            geocoder.getDefaultProvider().geocode(address, successCB, 1);
        } catch (e) {
            expect(e.code).toEqual(errorcode.TYPE_MISMATCH_ERROR);
        }
    });
	
/*
   **** Test no 8
   *geocode throws exception if input parameter is not compatible with the expected type - 3
   ****
*/
    it("geocode throws exception if input parameter is not compatible with the expected type - 3", function () {
        var successCB = function (result) {
            expect(result[0].latitude).toEqual(45.54);
            expect(result[0].longitude).toEqual(-122.96);
        },
        bad = function () {
        };
        try {
            geocoder.getDefaultProvider().geocode(bad, successCB);
        } catch (e) {
            expect(e.code).toEqual(errorcode.TYPE_MISMATCH_ERROR);
        }
    });
	
/*
   **** Test no 9
   *reverseGeocode transforms coordinates to address
   ****
*/
    it("reverseGeocode transforms coordinates to address", function () {
        var successCB = function (result) {
            expect(result[0].city).toEqual("London");
            expect(result[0].country).toEqual("UK");
        },
        coordinates = {latitude: 51.510452, longitude: -0.119820},
        options = {resultType: 'STRUCTURED'};
        runs(function () {
            geocoder.getDefaultProvider().reverseGeocode(coordinates, successCB, null, options);
        });
    });
	
/*
   **** Test no 10
   *reverseGeocode throws exception if input parameter is not compatible with the expected type - 1
   ****
*/
    it("reverseGeocode throws exception if input parameter is not compatible with the expected type - 1", function () {
        var successCB = function (result) {
            expect(result[0].address.city).toEqual("Bucharest");
            expect(result[0].address.country).toEqual("Romania");
        },
        coordinates = {latitude: 44.423193, longitude: 26.120947},
        options = {resultType: 'STRUCTURED'};
        try {
            geocoder.getDefaultProvider().reverseGeocode(coordinates, successCB, 1, options);
        } catch (e) {
            expect(e.code).toEqual(errorcode.TYPE_MISMATCH_ERROR);
        }
    });
	
/*
   **** Test no 11
   *reverseGeocode throws exception if input parameter is not compatible with the expected type - 2
   ****
*/
    it("reverseGeocode throws exception if input parameter is not compatible with the expected type - 2", function () {
        var coordinates = {latitude: 44.423193, longitude: 26.120947},
        options = {resultType: 'STRUCTURED'};
        try {
            geocoder.getDefaultProvider().reverseGeocode(coordinates, 1, null, options);
        } catch (e) {
            expect(e.code).toEqual(errorcode.TYPE_MISMATCH_ERROR);
        }
    });
	
/*
   **** Test no 12
   *reverseGeocode throws exception if input parameter is not compatible with the expected type - 3
   ****
*/
    it("reverseGeocode throws exception if input parameter is not compatible with the expected type - 3", function () {
        var successCB = function (result) {
            expect(result[0].address.city).toEqual("Bucharest");
            expect(result[0].address.country).toEqual("Romania");
        },
        options = {resultType: 'STRUCTURED'};
        try {
            geocoder.getDefaultProvider().reverseGeocode("string", successCB, null, options);
        } catch (e) {
            expect(e.code).toEqual(errorcode.TYPE_MISMATCH_ERROR);
        }
    });

});
