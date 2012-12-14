/*
 *  Copyright 2012 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use _self file except in compliance with the License.
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

module.exports = function () {
    var _self = {};

    _self.__defineGetter__("LIMITED_DISCOVERABILITY", function () {
        return 0x0001;
    });
    _self.__defineGetter__("POSITIONING", function () {
        return 0x0008;
    });
    _self.__defineGetter__("NETWORKING", function () {
        return 0x0010;
    });
    _self.__defineGetter__("RENDERING", function () {
        return 0x0020;
    });
    _self.__defineGetter__("CAPTURING", function () {
        return 0x0040;
    });
    _self.__defineGetter__("OBJECT_TRANSFER", function () {
        return 0x0080;
    });
    _self.__defineGetter__("AUDIO", function () {
        return 0x0100;
    });
    _self.__defineGetter__("TELEPHONY", function () {
        return 0x0200;
    });
    _self.__defineGetter__("INFORMATION", function () {
        return 0x0400;
    });

    return _self;
};
