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
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    BluetoothSocket,
    _security;

BluetoothSocket = function (prop) {
    var bluetoothSocket = {}, buffer = [];

    _security = prop.metaData;

    bluetoothSocket.uuid      = prop.uuid;
    bluetoothSocket.state     = prop.state;
    bluetoothSocket.peer      = prop.peer;
    bluetoothSocket.onmessage = null;
    bluetoothSocket.onclose   = null;

    this.__defineGetter__("uuid", function () {
        return bluetoothSocket.uuid;
    });

    this.__defineGetter__("state", function () {
        return bluetoothSocket.state;
    });

    this.__defineGetter__("peer", function () {
        return bluetoothSocket.peer;
    });

    this.__defineGetter__("onmessage", function () {
        return bluetoothSocket.onmessage;
    });
    this.__defineSetter__("onmessage", function (val) {
        try {
            bluetoothSocket.onmessage = t.SuccessCallback(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("onclose", function () {
        return bluetoothSocket.onclose;
    });
    this.__defineSetter__("onclose", function (val) {
        try {
            bluetoothSocket.onclose = t.SuccessCallback(val, "?");
        } catch (e) {
        }
    });

    this.writeData = function (data) {
        if (!_security.writeData) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothSocket("writeData", arguments);

        if (bluetoothSocket.state === "CLOSED") {
            return;
        }

        event.trigger("bt-service-write-msg", [bluetoothSocket.peer.address,
                bluetoothSocket.uuid, data]);

        return data.length;
    };

    this.readData = function () {
        var data;

        if (!_security.readData) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (bluetoothSocket.state === "CLOSED") {
            return;
        }

        data = utils.copy(buffer);
        buffer = [];

        return data;
    };

    this.close = function () {
        if (!_security.close) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        bluetoothSocket.__defineGetter__("state", function () {
            return "CLOSED";
        });

        event.trigger("bt-service-state-changed", [bluetoothSocket.peer.address,
                bluetoothSocket.uuid, false]);
        event.trigger("bt-device-connected-update",
                [bluetoothSocket.peer.address, false]);

        if (bluetoothSocket.onclose) {
            bluetoothSocket.onclose();
        }
    };

    event.on("bt-service-state-update", function (addr, state) {
        var stateStr = "CLOSED";

        if (addr !== bluetoothSocket.peer.address) {
            return;
        }
        if (state) {
            stateStr = "OPEN";
        }

        bluetoothSocket.__defineGetter__("state", function () {
            return stateStr;
        });

        event.trigger("bt-service-state-changed",
                [bluetoothSocket.peer.address, bluetoothSocket.uuid,
                state]);
        event.trigger("bt-device-connected-update",
                [bluetoothSocket.peer.address, state]);
    });

    event.on("bt-service-rawdata-received", function (addr, uuid, msg) {
        var i;

        if ((addr !== bluetoothSocket.peer.address) ||
                (uuid !== bluetoothSocket.uuid)) {
            return;
        }
        buffer = [];
        for (i = 0; i < msg.length; i++) {
            buffer.push(msg.charCodeAt(i));
        }
        if (bluetoothSocket.onmessage) {
            bluetoothSocket.onmessage();
        }
    });
};

module.exports = BluetoothSocket;
