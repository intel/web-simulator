/*      
 *  Copyright 2012 Intel Corporation.
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

var tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    ContactName = require('ripple/platform/tizen/2.0/ContactName'),
    ContactOrganization = require('ripple/platform/tizen/2.0/ContactOrganization'),
    ContactWebSite = require('ripple/platform/tizen/2.0/ContactWebSite'),
    ContactAnniversary = require('ripple/platform/tizen/2.0/ContactAnniversary'),
    ContactAccount = require('ripple/platform/tizen/2.0/ContactAccount'),
    ContactAddress = require('ripple/platform/tizen/2.0/ContactAddress'),
    ContactPhoneNumber = require('ripple/platform/tizen/2.0/ContactPhoneNumber'),
    ContactEmailAddress = require('ripple/platform/tizen/2.0/ContactEmailAddress');

function _clone(obj) {
    var copy = obj.constructor(), attr;
    for (attr in obj) {
        if (obj.hasOwnProperty(attr))
            copy[attr] = obj[attr];
    }
    /* remove these two attribute */
    copy.id = null;
    copy.lastUpdated = null;
    return copy;
}

module.exports = function (prop) {
    var _self, i;
    _self = {
        id : null,
        lastUpdated : null,
        name : null,
        account : null,
        addresses : [],
        photoURI : null,
        phoneNumbers : undefined,
        emails : undefined,
        birthday : null,
        anniversaries : null,
        organization : null,
        notes : [],
        urls : [],
        isFavorite : false,
        ringtoneURI : null,
        categories : [],
        convertToString : function (format) {
            //TODO
            console.log("convert to VCard String...");
        },
        clone : function () {
            return _clone(this);
        },
    };
    
    if (prop) {
        /* id: (readonly)
        By default, this attribute is set to null.
        This attribute will be generated when adding to the AddressBook */

        /* lastUpdated: (readonly)
        By default, this attribute is set to null.
        This attribute will be generated when adding to the AddressBook */

        if (prop.name) {
            _self.name = new ContactName(prop.name);
        }
        if (prop.account) {
            _self.account = new ContactAccount(prop.account.accountServiceId, prop.account.contactURI);
        }
        if (tizen1_utils.isValidArray(prop.addresses)) {
            for (i = 0; i < prop.addresses.length; i++) {
                _self.addresses.push(new ContactAddress(prop.addresses[i]));
            }
        }
        if (prop.photoURI) {
            _self.photoURI = String(prop.photoURI);
        }
        if (tizen1_utils.isValidArray(prop.phoneNumbers)) {
            _self.phoneNumbers = [];
            for (i = 0; i < prop.phoneNumbers.length; i++) {
                _self.phoneNumbers.push(new ContactPhoneNumber(
                            prop.phoneNumbers[i].number, prop.phoneNumbers[i].types));
            }
        }
        if (tizen1_utils.isValidArray(prop.emails)) {
            _self.emails = [];
            for (i = 0; i < prop.emails.length; i++) {
                _self.emails.push(new ContactEmailAddress(
                            prop.emails[i].email, prop.emails[i].types));
            }
        }
        if (tizen1_utils.isValidDate(prop.birthday)) {
            _self.birthday = new Date(prop.birthday);
        }
        if (tizen1_utils.isValidArray(prop.anniversaries)) {
            _self.anniversaries = [];
            for (i = 0; i < prop.anniversaries.length; i++) {
                _self.anniversaries.push(new ContactAnniversary(
                            prop.anniversaries[i].date, prop.anniversaries[i].label));
            }
        }
        if (prop.organization) {
            _self.organization = new ContactOrganization(prop.organization);
        }
        if (tizen1_utils.isValidArray(prop.notes)) {
            for (i = 0; i < prop.notes.length; i++) {
                _self.notes.push(String(prop.notes[i]));
            }
        }
        if (tizen1_utils.isValidArray(prop.urls)) {
            for (i = 0; i < prop.urls.length; i++) {
                _self.urls.push(new ContactWebSite(
                            prop.urls[i].url, prop.urls[i].type));
            }
        }
        if (typeof prop.isFavorite === "boolean") {
            _self.isFavorite = prop.isFavorite;
        }
        if (prop.ringtoneURI) {
            _self.ringtoneURI = String(prop.ringtoneURI);
        }
        if (tizen1_utils.isValidArray(prop.categories)) {
            for (i = 0; i < prop.categories.length; i++) {
                _self.categories.push(String(prop.categories[i]));
            }
        }
    }
    
    return _self;
};
