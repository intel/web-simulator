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

var t = require('ripple/platform/tizen/2.0/typecast'),
    ContactOrganization;

ContactOrganization = function (orgInitDict) {
    var i;

    t.ContactOrganization(arguments, this);

    this.name       = null;
    this.department = null;
    this.title      = null;
    this.role       = null;
    this.logoURI    = null;

    if (orgInitDict) {
        for (i in orgInitDict) {
            this[i] = orgInitDict[i];
        }
    }
};

module.exports = ContactOrganization;
