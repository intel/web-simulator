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

describe("tizen_1.0_contact", function () {
    var db = require('ripple/db'),
    platform = require('ripple/platform'),
    ContactManager = require('ripple/platform/tizen/1.0/contact'),
    ContactName = require('ripple/platform/tizen/1.0/ContactName'),
    Contact = require('ripple/platform/tizen/1.0/Contact'),
    ContEmail = require('ripple/platform/tizen/1.0/ContactEmailAddress'),
    ContPhone = require('ripple/platform/tizen/1.0/ContactPhoneNumber'),
    contact = new ContactManager(),
    andreea = new Contact({name: new ContactName({firstName: 'Andreea', lastName: 'Sandu', nicknames: ['deea']}), emails: [new ContEmail('andreea.m.sandu@intel.com')], phoneNumbers: [new ContPhone('752665183')]});

    beforeEach(function () {
        spyOn(db, "retrieveObject");
        spyOn(db, "saveObject");
        spyOn(platform, "current").andReturn(require('ripple/platform/tizen/1.0/spec'));
    });
	
/*
   **** Test no 1
   *getAddressBooks - if successCB has wrong type, throw TYPE_MISMATCH_ERROR
   ****
*/
    it("getAddressBooks - if successCB has wrong type, throw TYPE_MISMATCH_ERROR", function () {
        try {
            contact.getAddressBooks(1);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });

/*
   **** Test no 2
   *getAddressBooks - if errorCB has wrong type, throw TYPE_MISMATCH_ERROR
   ****
*/	
    it("getAddressBooks - if errorCB has wrong type, throw TYPE_MISMATCH_ERROR", function () {
        var successCB = function (addressBooks) {
        };
        try {
            contact.getAddressBooks(successCB, 1);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });

/*
   **** Test no 3
   *getAddressBooks - the successCallback must be invoked with the phone address book
   ****
*/	
    it("getAddressBooks - the successCallback must be invoked with the phone address book", function () {
        var successCB = function (addressBooks) {
            var result = (addressBooks.length > 0);
            expect(result).toBeTruthy();
        },
        errorCB = function (error) {
            console.log(error.message);
        };
        runs(function () {
            contact.getAddressBooks(successCB, errorCB);
        });
    });	

/*
   **** Test no 4
   *getDefaultAddressBook - returns addressbook or undefined
   ****
*/
    it("getDefaultAddressBook - returns addressbook or undefined", function () {
        var successCB = function (addressBooks) {
            var DAB = contact.getDefaultAddressBook();
            if (addressBooks.length > 0)
                expect(typeof DAB).toEqual("object");
            else
                expect(DAB).not.toBeDefined();				
        },
        errorCB = function (error) {
            console.log(error.message);
        };
        runs(function () {
            contact.getAddressBooks(successCB, errorCB);
        });
        waits(100);
    });	
	
/*
   **** Test no 5
   *getAddressBook - throws TYPE_MISMATCH_ERROR if parameter is not compatible with the expected type
   ****
*/
    it("getAddressBook - throws TYPE_MISMATCH_ERROR if parameter is not compatible with the expected type", function () {
        try {
            contact.getAddressBook(123);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });

/*
   **** Test no 6
   *getAddressBook - throws NOT_FOUND_ERROR if id is not found
   ****
*/
    it("getAddressBook - throws NOT_FOUND_ERROR if id is not found", function () {
        try {
            contact.getAddressBook("unexistingID");
        } catch (e) {
            expect(e.name).toEqual("NOT_FOUND_ERROR");
        }
    });
	
/*
   **** Test no 7
   *getAddressBook - returns the address book with the given identifier 
   ****
*/	
    it("getAddressBook - returns the address book with the given identifier", function () {
        var successCB = function (addressBooks) {
            var DAB = contact.getDefaultAddressBook(), AB;
            if (addressBooks.length > 0) {
                AB = contact.getAddressBook(DAB.id);
                expect(AB).toBeDefined();
            }
            else
                expect(DAB).not.toBeDefined();				
        },
        errorCB = function (error) {
            console.log(error.message);
        };
        runs(function () {
            contact.getAddressBooks(successCB, errorCB);
        });
        waits(100);
    });

/*
   **** Test no 8
   *get contact - throws NOT_FOUND_ERROR if id is not found
   ****
*/
    it("get contact - throws NOT_FOUND_ERROR if id is not found", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            DAB.get("unexistingID");
        } catch (e) {
            expect(e.name).toEqual("NOT_FOUND_ERROR");
        }
    });
	
/*
   **** Test no 9
   *get contact - throws TYPE_MISMATCH_ERROR if id is not the right type
   ****
*/
    it("get contact - throws TYPE_MISMATCH_ERROR if id is not the right type", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            DAB.get(23445);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });
	
/*
   **** Test no 10
   *get contact - returns contact with given ID
   ****
*/
    it("get contact - returns contact with given ID", function () {
        var DAB  = contact.getDefaultAddressBook(), cont_andreea;
        DAB.add(andreea);
        runs(function () {
            cont_andreea = DAB.get(andreea.id);
            expect(cont_andreea.name.firstName).toEqual('Andreea');
            expect(cont_andreea.name.lastName).toEqual('Sandu');
        });
    });
	
/*
   **** Test no 11
   *add contact - throws TYPE_MISMATCH_ERROR if parameter is not the right type
   ****
*/
    it("add contact - throws TYPE_MISMATCH_ERROR if parameter is not the right type", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            DAB.add(23445);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });
	
/*
   **** Test no 12
   *add contact - throws INVALID_VALUES_ERROR if contact has ID
   ****
*/
    it("add contact - throws INVALID_VALUES_ERROR if contact has ID", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            DAB.add(andreea);
        } catch (e) {
            expect(e.name).toEqual("INVALID_VALUES_ERROR");
        }
    });

/*
   **** Test no 13
   *add contact - Contact object will have its identifier (id attribute) set when the function returns
   ****
*/
    it("add contact - Contact object will have its identifier (id attribute) set when the function returns", function () {
        var DAB  = contact.getDefaultAddressBook(),
        mama = new Contact({name: new ContactName({firstName: 'Maria', lastName: 'Sandu'})});
        expect(mama.id).toEqual(null);
        runs(function () {
            DAB.add(mama);
            expect(mama.id).not.toEqual(null);
        });
    });

/*
   **** Test no 14
   *add batch - throws TYPE_MISMATCH_ERROR if list parameter is not the expected type
   ****
*/
    it("add batch - throws TYPE_MISMATCH_ERROR if list parameter is not the expected type", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            DAB.addBatch(123);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });
	
/*
   **** Test no 15
   *add batch - throws TYPE_MISMATCH_ERROR if successCB parameter is not the expected type
   ****
*/
    it("add batch - throws TYPE_MISMATCH_ERROR if successCB parameter is not the expected type", function () {
        var DAB  = contact.getDefaultAddressBook(),
        lulu = new Contact({name: new ContactName({firstName: 'Lulu', lastName: 'X'})}),
        george = new Contact({name: new ContactName({firstName: 'George', lastName: 'Smith'})});

        try {
            DAB.addBatch([lulu, george], 1);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });
	
/*
   **** Test no 16
   *add batch - throws TYPE_MISMATCH_ERROR if errorCB parameter is not the expected type
   ****
*/
    it("add batch - throws TYPE_MISMATCH_ERROR if errorCB parameter is not the expected type", function () {
        var DAB  = contact.getDefaultAddressBook(),
        c1 = new Contact({name: new ContactName({firstName: 'John', lastName: 'J'})}),
        c2 = new Contact({name: new ContactName({firstName: 'Jane', lastName: 'R'})}),
        successCB = function (contacts) {
            console.log('This is not printed');
        };

        try {
            DAB.addBatch([c1, c2], successCB, 1);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });

/*
   **** Test no 17
   *add batch - throws INVALID_VALUES_ERROR if an input contact object has a non-null identifier
   ****
*/
    it("add batch - throws INVALID_VALUES_ERROR if an input contact object has a non-null identifier", function () {
        var DAB  = contact.getDefaultAddressBook(),
        c1 = new Contact({name: new ContactName({firstName: 'John', lastName: 'J'})});

        try {
            DAB.addBatch([andreea, c1]);
        } catch (e) {
            expect(e.name).toEqual("INVALID_VALUES_ERROR");
        }
    });
	
/*
   **** Test no 18
   *add batch - invokes errorCB with INVALID_VALUES_ERROR if contact has invalid info
   ****
*/
    xit("add batch - invokes errorCB with INVALID_VALUES_ERROR if contact has invalid info", function () {
        var DAB  = contact.getDefaultAddressBook(),
        fun = jasmine.createSpy(),
        c1 = new Contact({name: new ContactName({firstName: 'John', lastName: null})}),
        c2 = new Contact({name: new ContactName({firstName: 'Jane', lastName: fun})}),
        successCB = function (contacts) {
            console.log('This is not printed');
        },
        errorCB = function (e) {
            expect(e.name).toEqual("INVALID_VALUES_ERROR");
            console.log(e.name);
        };
        runs(function () {
            DAB.addBatch([c1, c2], successCB, errorCB); 
        });
    });
	
/*
   **** Test no 19
   *add batch - If all the contacts are successfully added to the address book, the success callback will be invoked, passing the list of Contact objects that were added
   ****
*/
    it("add batch - If all the contacts are successfully added to the address book, the success callback will be invoked, passing the list of Contact objects that were added", function () {
        var DAB  = contact.getDefaultAddressBook(),
        c1 = new Contact({name: new ContactName({firstName: 'John', lastName: "X"})}),
        c2 = new Contact({name: new ContactName({firstName: 'Jane', lastName: "Y"})}),
        successCB = function (contacts) {
            expect(contacts[contacts.length - 1].name.firstName).toEqual('Jane');
            expect(contacts[contacts.length - 2].name.firstName).toEqual('John');
        },
        errorCB = function (e) {
            console.log(e.message);
        };
        runs(function () {
            DAB.addBatch([c1, c2], successCB, errorCB); 
        });
    });

/*
   **** Test no 20
   *update - If parameter is not the right type, TYPE_MISMATCH_ERROR is thrown
   ****
*/
    it("update - If parameter is not the right type, TYPE_MISMATCH_ERROR is thrown", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            DAB.update("string,notcontact");
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });
	
/*
   **** Test no 21
   *update - If parameter contains invalid data, TYPE_MISMATCH_ERROR is thrown
   ****
*/
    xit("update - If parameter contains invalid data, TYPE_MISMATCH_ERROR is thrown", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            andreea.name.firstName = jasmine.createSpy();
            DAB.update(andreea);
        } catch (e) {
            console.log(e.name);
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });
	
/*
   **** Test no 22
   *update - updates the contact in the address book
   ****
*/
    it("update - updates the contact in the address book", function () {
        var DAB  = contact.getDefaultAddressBook();
        runs(function () {
            andreea.name.firstName = 'Andreea Minodora';
            DAB.update(andreea);
        });
        runs(function () {
            expect(andreea.name.firstName).toEqual('Andreea Minodora');
        });
    });
	
/*
   **** Test no 23
   *update - NOT_FOUND_ERROR if the identifier does not match
   ****
*/
    xit("update - NOT_FOUND_ERROR if the identifier does not match", function () {
        var DAB  = contact.getDefaultAddressBook(),
        c1 = new Contact({name: new ContactName({firstName: 'John', lastName: "X"})});
        try {
            DAB.update(c1);
        } catch (e) {
            console.log(e.name);
            expect(e.name).toEqual("NOT_FOUND_ERROR");
        }
    });

/*
   **** Test no 24
   *update batch- If contact list is not the right type, TYPE_MISMATCH_ERROR is thrown
   ****
*/
    it("update batch- If contact list is not the right type, TYPE_MISMATCH_ERROR is thrown", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            DAB.updateBatch(123);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });

/*
   **** Test no 25
   *update batch- If successCB is not the right type, TYPE_MISMATCH_ERROR is thrown
   ****
*/
    it("update batch- If successCB is not the right type, TYPE_MISMATCH_ERROR is thrown", function () {
        var DAB  = contact.getDefaultAddressBook(),
        c1 = new Contact({name: new ContactName({firstName: 'John', lastName: "X"})});
        DAB.add(c1);
        c1.name.firstName = 'Mike';
        andreea.name.firstName = 'Mino';
        try {
            DAB.updateBatch([andreea, c1], 1);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });

/*
   **** Test no 26
   *update batch- If errorCB is not the right type, TYPE_MISMATCH_ERROR is thrown
   ****
*/
    it("update batch- If errorCB is not the right type, TYPE_MISMATCH_ERROR is thrown", function () {
        var DAB  = contact.getDefaultAddressBook(),
        successCB = function () {
            console.log('this is not printed');
        },
        c1 = new Contact({name: new ContactName({firstName: 'John', lastName: "X"})});
        DAB.add(c1);
        c1.name.firstName = 'Mike';
        andreea.name.firstName = 'Mino';

        try {
            DAB.updateBatch([andreea, c1], successCB, 1);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });

/*
   **** Test no 27
   *update batch- If contact contains invalid values, errorCB is called with INVALID_VALUES_ERROR
   ****
*/
    xit("update batch- If contact contains invalid values, errorCB is called with INVALID_VALUES_ERROR", function () {
        var DAB  = contact.getDefaultAddressBook(),
        successCB = function () {
            console.log('this is not printed');
        },
        errorCB = function (e) {
            expect(e.name).toEqual("INVALID_VALUES_ERROR");
        },
        c1 = new Contact({name: new ContactName({firstName: 'John', lastName: "X"})});
        c1.name.firstName = 123;
        andreea.name.firstName = 'Mino';
        
        try {
            DAB.updateBatch([andreea, c1], successCB, errorCB);
        } catch (e) {
            console.log('this is not printed');
        }
    });

/*
   **** Test no 28
   *update batch - If one of the ids is not found, errorCB is called with NOT_FOUND_ERROR
   ****
*/
    xit("update batch- If one of the ids is not found, errorCB is called with NOT_FOUND_ERROR", function () {
        var DAB  = contact.getDefaultAddressBook(),
        successCB = function () {
            console.log('this is not printed');
        },
        errorCB = function (e) {
            expect(e.name).toEqual("NOT_FOUND_ERROR");
        },
        c1 = new Contact({name: new ContactName({firstName: 'Gigi', lastName: "X"})}),
        cid;

        DAB.add(c1);
        c1.name.firstName = 'L';
        andreea.name.firstName = 'Mino';
        cid = c1.id;
        DAB.remove(c1);
        try {
            DAB.updateBatch([andreea, c1], successCB, errorCB);
        } catch (e) {
            console.log('this is not printed');
        }
    });

/*
   **** Test no 29
   *remove - NOT_FOUND_ERROR if the identifier does not match any contact in the address book
   ****
*/
    it("remove - NOT_FOUND_ERROR if the identifier does not match any contact in the address book", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            DAB.remove("unexisting_id");
        } catch (e) {
            expect(e.name).toEqual("NOT_FOUND_ERROR");
        }
    });	
/*
   **** Test no 30
   *remove - TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type
   ****
*/
    it("remove - TYPE_MISMATCH_ERROR if any input parameter is not compatible with the expected type", function () {
        var DAB  = contact.getDefaultAddressBook();
        try {
            DAB.remove(101);
        } catch (e) {
            expect(e.name).toEqual("TYPE_MISMATCH_ERROR");
        }
    });
	
/*
   **** Test no 31
   *remove - remove the contact from the address book
   ****
*/
    it("remove - remove the contact from the address book", function () {
        var DAB  = contact.getDefaultAddressBook(),
        c1 = new Contact({name: new ContactName({firstName: 'Test', lastName: "33"})});
        DAB.add(c1);
        try {
            DAB.remove(c1.id);
            waits(300);
            DAB.get(c1.id);
        } catch (e) {
            expect(e.name).toEqual("NOT_FOUND_ERROR");
        }
    });
});
