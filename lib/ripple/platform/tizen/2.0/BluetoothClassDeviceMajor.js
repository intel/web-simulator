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

var BluetoothClassDeviceMajor = function () {
    this.__defineGetter__("MISC", function () {
        return 0x00;
    });

    this.__defineGetter__("COMPUTER", function () {
        return 0x01;
    });

    this.__defineGetter__("PHONE", function () {
        return 0x02;
    });

    this.__defineGetter__("NETWORK", function () {
        return 0x03;
    });

    this.__defineGetter__("AUDIO_VIDEO", function () {
        return 0x04;
    });

    this.__defineGetter__("PERIPHERAL", function () {
        return 0x05;
    });

    this.__defineGetter__("IMAGING", function () {
        return 0x06;
    });

    this.__defineGetter__("WEARABLE", function () {
        return 0x07;
    });

    this.__defineGetter__("TOY", function () {
        return 0x08;
    });

    this.__defineGetter__("HEALTH", function () {
        return 0x09;
    });

    this.__defineGetter__("UNCATEGORIZED", function () {
        return 0x1F;
    });
};

module.exports = BluetoothClassDeviceMajor;
