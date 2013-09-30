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

var event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    BluetoothServiceHandler,
    _security;

BluetoothServiceHandler = function (prop) {
    var bluetoothServiceHandler = {};

    _security = prop.metaData;

    bluetoothServiceHandler.uuid        = prop.uuid || "";
    bluetoothServiceHandler.name        = prop.name || "";
    bluetoothServiceHandler.isConnected = prop.isConnected || false;
    bluetoothServiceHandler.onconnect   = null;

    this.__defineGetter__("uuid", function () {
        return bluetoothServiceHandler.uuid;
    });

    this.__defineGetter__("name", function () {
        return bluetoothServiceHandler.name;
    });

    this.__defineGetter__("isConnected", function () {
        return bluetoothServiceHandler.isConnected;
    });

    this.__defineGetter__("onconnect", function () {
        return bluetoothServiceHandler.onconnect;
    });
    this.__defineSetter__("onconnect", function (val) {
        try {
            bluetoothServiceHandler.onconnect =
                    t.BluetoothSocketSuccessCallback(val, "?");
        } catch (e) {
        }
    });

    this.unregister = function (successCallback, errorCallback) {
        if (!_security.unregister) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothServiceHandler("unregister", arguments);

        event.trigger("bt-unregister-service", [bluetoothServiceHandler.uuid,
                successCallback, errorCallback]);
    };
};

module.exports = BluetoothServiceHandler;
