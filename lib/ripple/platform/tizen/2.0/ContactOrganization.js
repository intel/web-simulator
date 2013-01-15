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

module.exports = function (orgInitDict) {
    var _self;

    _self = {
        name:       null,
        department: null,
        title:      null,
        role:       null,
        logoURI:    null
    };

    if (orgInitDict) {
        if (orgInitDict.name !== null && orgInitDict.name !== undefined) {
            _self.name = String(orgInitDict.name);
        }
        if (orgInitDict.department !== null && orgInitDict.department !== undefined) {
            _self.department = String(orgInitDict.department);
        }
        if (orgInitDict.title !== null && orgInitDict.title !== undefined) {
            _self.title = String(orgInitDict.title);
        }
        if (orgInitDict.role !== null && orgInitDict.role !== undefined) {
            _self.role = String(orgInitDict.role);
        }
        if (orgInitDict.logoURI !== null && orgInitDict.logoURI !== undefined) {
            _self.logoURI = String(orgInitDict.logoURI);
        }
    }

    return _self;
};
