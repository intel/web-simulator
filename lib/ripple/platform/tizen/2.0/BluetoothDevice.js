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

var utils = require('ripple/utils'),
    event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    BluetoothClass = require('ripple/platform/tizen/2.0/BluetoothClass'),
    BluetoothSocket = require('ripple/platform/tizen/2.0/BluetoothSocket'),
    BluetoothDevice,
    _security;

BluetoothDevice = function (prop) {
    var bluetoothDevice = {}, sockets = {}, self;

    bluetoothDevice.name        = prop.name || "";
    bluetoothDevice.address     = prop.address || "";
    bluetoothDevice.deviceClass = new BluetoothClass(prop.deviceClass,
            prop.metaData) || {};
    bluetoothDevice.isBonded    = prop.isBonded || false;
    bluetoothDevice.isTrusted   = prop.isTrusted || false;
    bluetoothDevice.isConnected = prop.isConnected || false;
    bluetoothDevice.services    = prop.services;
    bluetoothDevice.uuids       = [];

    _security = prop.metaData;
    self = this;

    event.on("bt-device-connected-update", function (addr, isConnected) {
        if (addr === bluetoothDevice.address) {
            bluetoothDevice.isConnected = isConnected;
            event.trigger("bt-device-connected-changed",
                    [bluetoothDevice.address, bluetoothDevice.isConnected]);
        }
    });

    utils.forEach(bluetoothDevice.services, function (service) {
        bluetoothDevice.uuids.push(service.uuid);
        sockets[service.uuid] = new BluetoothSocket({
            uuid: service.uuid,
            protocol: service.protocol,
            state: "CLOSED",
            peer: self,
            metaData: _security
        });
    });

    this.__defineGetter__("name", function () {
        return bluetoothDevice.name;
    });

    this.__defineGetter__("address", function () {
        return bluetoothDevice.address;
    });

    this.__defineGetter__("deviceClass", function () {
        return bluetoothDevice.deviceClass;
    });

    this.__defineGetter__("isBonded", function () {
        return bluetoothDevice.isBonded;
    });

    this.__defineGetter__("isTrusted", function () {
        return bluetoothDevice.isTrusted;
    });

    this.__defineGetter__("isConnected", function () {
        return bluetoothDevice.isConnected;
    });

    this.__defineGetter__("uuids", function () {
        return bluetoothDevice.uuids;
    });

    this.connectToServiceByUUID = function (uuid, successCallback,
            errorCallback) {
        if (!_security.all && !_security.connectToServiceByUUID) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothDevice("connectToServiceByUUID", arguments);

        window.setTimeout(function () {
            if (bluetoothDevice.uuids.join(",").indexOf(uuid) === -1) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
                return;
            }

            bluetoothDevice.isConnected = true;
            event.trigger("bt-device-connected-changed", [bluetoothDevice.address,
                    true]);
            sockets[uuid].__defineGetter__("state", function () {
                return "OPEN";
            });
            event.trigger("bt-service-state-changed", [bluetoothDevice.address,
                    uuid, true]);

            successCallback(sockets[uuid]);
        }, 1);
    };
};

module.exports = BluetoothDevice;
