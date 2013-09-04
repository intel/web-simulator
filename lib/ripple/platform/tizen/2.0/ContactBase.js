/*
 *  Copyright 2013 Intel Corporation.
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

var decorator = require('ripple/platform/tizen/2.0/decorator'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    ContactName = require('ripple/platform/tizen/2.0/ContactName'),
    ContactAddress = require('ripple/platform/tizen/2.0/ContactAddress'),
    ContactPhoneNumber = require('ripple/platform/tizen/2.0/ContactPhoneNumber'),
    ContactEmailAddress = require('ripple/platform/tizen/2.0/ContactEmailAddress'),
    ContactAnniversary = require('ripple/platform/tizen/2.0/ContactAnniversary'),
    ContactOrganization = require('ripple/platform/tizen/2.0/ContactOrganization'),
    ContactWebSite = require('ripple/platform/tizen/2.0/ContactWebSite'),
    Contact;

Contact = function () {
    var voc;

    // private
    function construct() {
        this.name          = null;
        this.addresses     = [];
        this.photoURI      = null;
        this.phoneNumbers  = [];
        this.emails        = [];
        this.birthday      = null;
        this.anniversaries = [];
        this.organizations = [];
        this.notes         = [];
        this.urls          = [];
        this.ringtoneURI   = null;
        this.groupIds      = [];
    }

    // Constructor
    function Contact_ContactInit(contactInitDict) {
        var i, attr, arr;

        construct.apply(this);

        for (attr in contactInitDict) {
            switch (attr) {
            case "name":
                this[attr] = new ContactName(contactInitDict[attr]);
                break;

            case "addresses":
                arr = contactInitDict[attr];
                if (arr) {
                    for (i in arr) {
                        this[attr][i] = new ContactAddress(arr[i]);
                    }
                }
                break;

            case "phoneNumbers":
                arr = contactInitDict[attr];
                if (arr) {
                    for (i in arr) {
                        this[attr][i] = new ContactPhoneNumber(arr[i].number,
                                arr[i].types || null, arr[i].isDefault || null);
                    }
                }
                break;

            case "emails":
                arr = contactInitDict[attr];
                if (arr) {
                    for (i in arr) {
                        this[attr][i] = new ContactEmailAddress(arr[i].email,
                                arr[i].types || null, arr[i].isDefault || null);
                    }
                }
                break;

            case "birthday":
                this[attr] = new Date(contactInitDict[attr]);
                break;

            case "anniversaries":
                arr = contactInitDict[attr];
                if (arr) {
                    for (i in arr) {
                        this[attr][i] = new ContactAnniversary(arr[i].date,
                                arr[i].label || null);
                    }
                }
                break;

            case "organizations":
                arr = contactInitDict[attr];
                if (arr) {
                    for (i in arr) {
                        this[attr][i] = new ContactOrganization(arr[i]);
                    }
                }
                break;

            case "notes":
            case "groupIds":
                arr = contactInitDict[attr];
                if (arr) {
                    for (i in arr) {
                        this[attr][i] = arr[i];
                    }
                }
                break;

            case "urls":
                arr = contactInitDict[attr];
                if (arr) {
                    for (i in arr) {
                        this[attr][i] = new ContactWebSite(arr[i].url,
                                arr[i].type || null);
                    }
                }
                break;

            default:
                this[attr] = contactInitDict[attr];
                break;
            }
        }

        decorator.Contact(this);
    }

    function Contact_DOMString(stringRepresentation) {
    }

    voc = [Contact_ContactInit, Contact_DOMString];
    t.Contact(arguments, voc, this);
};

module.exports = Contact;
