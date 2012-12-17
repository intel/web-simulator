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

    _self.__defineGetter__("MISC", function () {
        return 0x00;
    });
    _self.__defineGetter__("COMPUTER", function () {
        return 0x01;
    });
    _self.__defineGetter__("PHONE", function () {
        return 0x02;
    });
    _self.__defineGetter__("NETWORK", function () {
        return 0x03;
    });
    _self.__defineGetter__("AUDIO_VIDEO", function () {
        return 0x04;
    });
    _self.__defineGetter__("PERIPHERAL", function () {
        return 0x05;
    });
    _self.__defineGetter__("IMAGING", function () {
        return 0x06;
    });
    _self.__defineGetter__("WEARABLE", function () {
        return 0x07;
    });
    _self.__defineGetter__("TOY", function () {
        return 0x08;
    });
    _self.__defineGetter__("HEALTH", function () {
        return 0x09;
    });
    _self.__defineGetter__("UNCATEGORIZED", function () {
        return 0x1F;
    });

    return _self;
};
