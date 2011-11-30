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

debugger;
describe("wac_2.0_contact", function () {
    var Contact = require('ripple/platform/wac/2.0/contact'),
        db = require('ripple/db'),
        contact,
        addressbook,
        c1;

    beforeEach(function () {
        spyOn(db, "retrieveObject");
        spyOn(db, "saveObject");
    });

    it("contact: getAddressBooks invalid success callback raises an exception", function () {
        var error = jasmine.createSpy();
        try {
            contact = new Contact();
            contact.handleSubFeatures({"http://wacapps.net/api/pim.contact":{id:"http://wacapps.net/api/pim.contact"}});
            contact.getAddressBooks(1, error);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
        waits(1);
    });

    it("addressbook: createContact undefined contactProperties creates an empty contact", function () {
        var success = function (addressbooks) {
            addressbook = addressbooks[0];
            c1 = addressbook.createContact();
            expect(c1.firstName).toEqual("");
            expect(c1.lastName).toEqual("");
            expect(c1.nicknames).toEqual([""]);
            expect(c1.phoneticName).toEqual("");
            expect(c1.addresses[0].types).toEqual([""]);
            expect(c1.addresses[0].country).toEqual("");
            expect(c1.addresses[0].region).toEqual("");
            expect(c1.addresses[0].county).toEqual("");
            expect(c1.addresses[0].city).toEqual("");
            expect(c1.addresses[0].streetAddress).toEqual("");
            expect(c1.addresses[0].additionalInformation).toEqual("");
            expect(c1.addresses[0].postalCode).toEqual("");
            expect(c1.photoURI).toEqual("");
            expect(c1.phoneNumbers[0].number).toEqual("");
            expect(c1.phoneNumbers[0].types).toEqual([""]);
            expect(c1.emails[0].email).toEqual("");
            expect(c1.emails[0].types).toEqual([""]);
        };
        contact.getAddressBooks(success);
        waits(1);
    });

    it("addressbook: addContact successfully add a contact to an address book", function () {
        var success = function (c) {
            expect(c.firstName).toEqual("Alan");
        };
        runs(function () {
            try {
                c1.firstName = "Alan";
                addressbook.addContact(success, null, c1);
            } catch (e) {
            }
        });
    });

    it("addressbook: updateContact successfully update a contact to an address book", function () {
        var success = function () {
            expect(c1.firstName).toEqual("Jack");
        };
        waits(650);
        runs(function () {
            try {
                c1.firstName = "Jack";
                addressbook.updateContact(success, null, c1);
            } catch (e) {
            }
        });
    });

    it("addressbook: findContacts successfully find a contact in an address book", function () {
        var success = function (contacts) {
            expect(c1.firstName).toEqual(contacts[0].firstName);
        };
        waits(650);
        runs(function () {
            try {
                addressbook.findContacts(success, null, {firstName: "%Jack%"});
            } catch (e) {
            }
        });
    });

    it("addressbook: deleteContact successfully delete a contact in an address book", function () {
        var success = jasmine.createSpy("success_callback");
        waits(650);
        runs(function () {
            try {
                addressbook.deleteContact(success, null, c1.id);
            } catch (e) {
            }
        });
        waits(650);
        runs(function () {
            expect(success).toHaveBeenCalled();
        });
    });
});

