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

module.exports = function (prop) {
    var _self;
    _self = {
        name : null,
        department : null,
        office : null,
        title : null,
        role : null,
        logoURI : null,
    };

    if (prop) {
        if (prop.name !== null && prop.name !== undefined) {
            _self.name = String(prop.name);
        }
        if (prop.department !== null && prop.department !== undefined) {
            _self.department = String(prop.department);
        }
        if (prop.office !== null && prop.office !== undefined) {
            _self.office = String(prop.office);
        }
        if (prop.title !== null && prop.title !== undefined) {
            _self.title = String(prop.title);
        }
        if (prop.role !== null && prop.role !== undefined) {
            _self.role = String(prop.role);
        }
        if (prop.logoURI !== null && prop.logoURI !== undefined) {
            _self.logoURI = String(prop.logoURI);
        }
    }

    return _self;
};
