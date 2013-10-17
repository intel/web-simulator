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

var errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    BluetoothClass,
    _security;

BluetoothClass = function (prop, metaData) {
    var bluetoothClass = {};

    _security = metaData;

    bluetoothClass.major    = prop.major || 0;
    bluetoothClass.minor    = prop.minor || 0;
    bluetoothClass.services = prop.services || [];

    this.__defineGetter__("major", function () {
        return bluetoothClass.major;
    });

    this.__defineGetter__("minor", function () {
        return bluetoothClass.minor;
    });

    this.__defineGetter__("services", function () {
        return bluetoothClass.services;
    });

    bluetoothClass.services.forEach(function (service, i) {
        bluetoothClass.services.__defineGetter__(i, function () {
            return service;
        });
    });

    this.hasService = function (service) {
        if (!_security.hasService) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothClass("hasService", arguments);

        return (bluetoothClass.services.join(",").indexOf(service) !== -1);
    };
};

module.exports = BluetoothClass;
