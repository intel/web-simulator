/*
 *  Copyright 2013 Intel Corporation
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

var BluetoothClassDeviceService = function () {
    this.__defineGetter__("LIMITED_DISCOVERABILITY", function () {
        return 0x0001;
    });

    this.__defineGetter__("POSITIONING", function () {
        return 0x0008;
    });

    this.__defineGetter__("NETWORKING", function () {
        return 0x0010;
    });

    this.__defineGetter__("RENDERING", function () {
        return 0x0020;
    });

    this.__defineGetter__("CAPTURING", function () {
        return 0x0040;
    });

    this.__defineGetter__("OBJECT_TRANSFER", function () {
        return 0x0080;
    });

    this.__defineGetter__("AUDIO", function () {
        return 0x0100;
    });

    this.__defineGetter__("TELEPHONY", function () {
        return 0x0200;
    });

    this.__defineGetter__("INFORMATION", function () {
        return 0x0400;
    });
};

module.exports = BluetoothClassDeviceService;
