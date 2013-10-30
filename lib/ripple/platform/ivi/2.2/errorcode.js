/*
 *  Copyright 2013 Intel Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"),
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

var _self = {};

_self.__defineGetter__("PERMISSION_DENIED", function () {
    return 1;
});

_self.__defineGetter__("PROPERTY_UNAVAILABLE", function () {
    return 2;
});

_self.__defineGetter__("TIMEOUT", function () {
    return 3;
});

_self.__defineGetter__("UNKNOWN", function () {
    return 10;
});

module.exports = _self;

