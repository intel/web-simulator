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

module.exports = function (providerId, accountInit) {
    var _self,
        _id = Math.uuid(null, 16),
        _providerId = String(providerId);

    _self = {
        displayName : null,
        icon : null,
        enabled : true,
        credentialId : null,
        services : [],
        settings : null
    };

    _self.__defineGetter__("id", function () {
        return _id;
    });

    _self.__defineGetter__("providerId", function () {
        return _providerId;
    });

    if (accountInit) {
        _self.displayName = String(accountInit.displayName);
        _self.icon        = String(accountInit.iconPath);
    }

    return _self;
};
