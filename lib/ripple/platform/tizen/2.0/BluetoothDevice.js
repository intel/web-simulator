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

var utils = require('ripple/utils'),
    event = require('ripple/event'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    BluetoothClass = require('ripple/platform/tizen/2.0/BluetoothClass'),
    BluetoothSocket = require('ripple/platform/tizen/2.0/BluetoothSocket');

module.exports = function (prop) {
    var _self,
        _name = prop.name || "",
        _address = prop.address || "",
        _deviceClass = new BluetoothClass(prop.deviceClass, prop.metaData) || {},
        _isBonded = prop.isBonded || false,
        _isTrusted = prop.isTrusted || false,
        _isConnected = prop.isConnected || false,
        _services = prop.services,
        _security = prop.metaData,
        _uuids = [],
        _sockets = {};

    _self = {
        connectToServiceByUUID: function (uuid, successCallback, errorCallback, protocol) {
            if (!_security.all && !_security.connectToServiceByUUID) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            if (typeof uuid !== "string") {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }

            tizen1_utils.validateArgumentType(successCallback, "function",
                    new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

            if (errorCallback) {
                tizen1_utils.validateArgumentType(errorCallback, "function",
                        new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
            }

            if (protocol) {
                if (protocol !== "RFCOMM" && protocol !== "L2CAP") {
                    new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
                }
            }

            if (_uuids.join(",").indexOf(uuid) === -1) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
                return;
            }
            _isConnected = true;
            event.trigger("bt-device-connected-changed", [_address, true]);
            Object.defineProperty(_sockets[uuid], "state", {value: "OPEN", writable: false});
            event.trigger("bt-service-state-changed", [_address, uuid, true]);
            successCallback(_sockets[uuid]);
        }
    };
    
	event.on("bt-device-connected-update", function (addr, isConnected) {
		if (addr === _address) {
			_isConnected = isConnected;
			event.trigger("bt-device-connected-changed", [_address, _isConnected]);
		}
	});

    utils.forEach(_services, function (service) {
		_uuids.push(service.uuid);
        _sockets[service.uuid] = new BluetoothSocket({
            uuid: service.uuid,
            protocol: service.protocol,
            state: "CLOSED",
            peer: _self,
            metaData: _security
        });
    });

    _self.__defineGetter__("name", function () {
        return _name;
    });
    _self.__defineGetter__("address", function () {
        return _address;
    });
    _self.__defineGetter__("deviceClass", function () {
        return _deviceClass;
    });
    _self.__defineGetter__("isBonded", function () {
        return _isBonded;
    });
    _self.__defineGetter__("isTrusted", function () {
        return _isTrusted;
    });
    _self.__defineGetter__("isConnected", function () {
        return _isConnected;
    });
    _self.__defineGetter__("uuids", function () {
        return _uuids;
    });

    return _self;
};
