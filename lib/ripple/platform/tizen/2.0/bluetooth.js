/*
 *  Copyright 2012 Intel Corporation
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
    db = require('ripple/db'),
    event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    BluetoothDevice = require('ripple/platform/tizen/2.0/BluetoothDevice'),
    BluetoothClassDeviceMajor = require('ripple/platform/tizen/2.0/BluetoothClassDeviceMajor'),
    BluetoothClassDeviceMinor = require('ripple/platform/tizen/2.0/BluetoothClassDeviceMinor'),
    BluetoothClassDeviceService = require('ripple/platform/tizen/2.0/BluetoothClassDeviceService'),
    BluetoothServiceHandler = require('ripple/platform/tizen/2.0/BluetoothServiceHandler'),
    BluetoothAdapter,
    _data = {
        DB_BLUETOOTH_KEY : "tizen1-db-bluetooth_adapter-name",
        DEFAULT_ADAPTER_NAME: "Tizen BT Adapter",
        DEFAULT_ADAPTER_ADDRESS: "12:34:56:78:90:AB",
        availableDevsChanging : false,
        DEFAULT_VISIBLE_TIME : 180000,
        DISCOVER_TIME : 10000,
        DISCOVER_INTERVAL : 1000,
        bluetoothClassDeviceMajor : {},
        bluetoothClassDeviceMinor : {},
        bluetoothClassDeviceService : {},
        adapter : {},
        historyDevs : {},
        availableDevs : {},
        localServices : {},
    },
    _security = {
        "http://tizen.org/privilege/bluetooth.admin": ["setName", "setPowered", "setVisible"],
        "http://tizen.org/privilege/bluetooth.gap": ["getDefaultAdapter", "discoverDevices", "stopDiscovery", "getKnownDevices", "getDevice", "createBonding", "destroyBonding", "hasService"],
        "http://tizen.org/privilege/bluetooth.spp": ["registerRFCOMMServiceByUUID", "connectToServiceByUUID", "writeData", "readData", "close", "unregister"],
        all: true
    },
    _self;

function _initialize() {
    var adapterName;

    _data.bluetoothClassDeviceMajor = new BluetoothClassDeviceMajor();
    _data.bluetoothClassDeviceMinor = new BluetoothClassDeviceMinor();
    _data.bluetoothClassDeviceService = new BluetoothClassDeviceService();
    adapterName = db.retrieveObject(_data.DB_BLUETOOTH_KEY) || _data.DEFAULT_ADAPTER_NAME;
    _data.adapter = new BluetoothAdapter(adapterName, _data.DEFAULT_ADAPTER_ADDRESS);
}

function _validateDiscoverDevicesType(onSuccess, onError) {
    if (typeof onSuccess !== "object") {
        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
    }
    if (onError) {
        tizen1_utils.validateArgumentType(onError, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }
    tizen1_utils.validateArgumentType(onSuccess.onstarted, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    tizen1_utils.validateArgumentType(onSuccess.ondevicefound, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    tizen1_utils.validateArgumentType(onSuccess.ondevicedisappeared, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    tizen1_utils.validateArgumentType(onSuccess.onfinished, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
}

BluetoothAdapter = function (devName, devAddress) {
    var adapter,
        timeoutVar,
        _devName = devName,
        _devAddress = devAddress,
        _devPowered = false,
        _devVisible = false,
        _isDiscovering = false,
        discoverInterval;

    // private
    function _updatePowerStatus(status) {
        if (_devPowered === status) {
            return;
        }
        if (!status) {
            _updateVisibleStatus(false);
            utils.forEach(_data.historyDevs, function (dev) {
                event.trigger("bt-service-state-update", [dev.address, false]);
                Object.defineProperty(dev, "isBonded", {value: false, writable: false});
                event.trigger("bt-device-bonded-changed", [dev.address, false]);
                jQuery("#service-transfer-textarea-" + dev.address.replace(/:/g, "")).val("");
                jQuery("#service-receive-textarea-" + dev.address.replace(/:/g, "")).html("");
            });
        }
        _devPowered = status;
        event.trigger("bt-adapter-power-changed", [_devPowered]);
    }

    function _updateVisibleStatus(status, time) {
        if (!_devPowered)
            return;
        _devVisible = status;
        event.trigger("bt-adapter-visible-changed", [_devVisible]);
        if (_devVisible) {
            if (time > 0) {
                timeoutVar = setTimeout(function () {
                    _devVisible = false;
                    event.trigger("bt-adapter-visible-changed", [_devVisible]);
                }, time);
            }
        } else {
            clearTimeout(timeoutVar);
        }
    }

    // public
    function setName(name, successCallback, errorCallback) {
        if (!_security.all && !_security.setName) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (typeof name !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
            }
            return;
        }

        _devName = name;
        db.saveObject(_data.DB_BLUETOOTH_KEY, _devName);
        event.trigger("bt-adapter-name-changed", [_devName]);
        if (successCallback) {
            successCallback();
        }
    }

    function setPowered(state, successCallback, errorCallback) {
        if (!_security.all && !_security.setPowered) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (typeof state !== "boolean") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        _updatePowerStatus(state);
        if (successCallback) {
            successCallback();
        }
    }

    function setVisible(mode, successCallback, errorCallback, timeout) {
        var time;

        if (!_security.all && !_security.setVisible) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (typeof mode !== "boolean") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
            }
            return;
        }

        if (typeof timeout === "number") {
            if (timeout < 0) {
                time = _data.DEFAULT_VISIBLE_TIME;
            } else {
                time = timeout * 1000;
            }
        } else {
            time = _data.DEFAULT_VISIBLE_TIME;
        }
        _updateVisibleStatus(mode, time);
        if (successCallback) {
            successCallback();
        }
    }

    function discoverDevices(successCallback, errorCallback) {
        var interval;

        if (!_security.all && !_security.discoverDevices) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        _validateDiscoverDevicesType(successCallback, errorCallback);

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
            }
            return;
        }

        // already discovering
        if (_isDiscovering) {
            return;
        }
        _isDiscovering = true;
        _data.historyDevs = {};

        successCallback.onstarted();
        _data.availableDevsChanging = false;
        utils.forEach(_data.availableDevs, function (item) {
            _data.historyDevs[item.address] = item;
            successCallback.ondevicefound(utils.copy(item));
        });

        discoverInterval = setTimeout(function () {
            var devs = [];
            clearInterval(interval);
            utils.forEach(_data.historyDevs, function (item) {
                devs.push(utils.copy(item));
            });
            successCallback.onfinished(devs);
            _isDiscovering = false;
        }, _data.DISCOVER_TIME);

        interval = setInterval(function () {
            var removeList = [], i;
            if (!_isDiscovering) {
                clearInterval(interval);
                return;
            }

            if (_data.availableDevsChanging === true) {
                _data.availableDevsChanging = false;
                utils.forEach(_data.historyDevs, function (item) {
                    if (!_data.availableDevs[item.address]) {
                        removeList.push(item.address);
                    }
                });
                for (i in removeList) {
                    successCallback.ondevicedisappeared(removeList[i]);
                    delete _data.historyDevs[removeList[i]];
                }
                utils.forEach(_data.availableDevs, function (item) {
                    if (!_data.historyDevs[item.address]) {
                        _data.historyDevs[item.address] = item;
                        successCallback.ondevicefound(utils.copy(item));
                    }
                });
            }
        }, _data.DISCOVER_INTERVAL);
    }

    function stopDiscovery(successCallback, errorCallback) {
        if (!_security.all && !_security.stopDiscovery) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
            }
            return;
        }

        if (_isDiscovering) {
            clearTimeout(discoverInterval);
        }
        _isDiscovering = false;
        if (successCallback) {
            successCallback();
        }
    }

    function getKnownDevices(successCallback, errorCallback) {
        var devs = [];

        if (!_security.all && !_security.getKnownDevices) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback) {
            tizen1_utils.validateArgumentType(errorCallback, "function",
                    new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
            }
            return;
        }
        utils.forEach(_data.historyDevs, function (item) {
            devs.push(utils.copy(item));
        });
        successCallback(devs);
    }

    function getDevice(address, successCallback, errorCallback) {
        if (!_security.all && !_security.getDevice) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (typeof address !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback) {
            tizen1_utils.validateArgumentType(errorCallback, "function",
                    new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
            }
            return;
        }

        if (_data.historyDevs[address]) {
            successCallback(utils.copy(_data.historyDevs[address]));
        } else {
            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
        }
    }

    function createBonding(address, successCallback, errorCallback) {
        if (!_security.all && !_security.createBonding) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (typeof address !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback) {
            tizen1_utils.validateArgumentType(errorCallback, "function",
                    new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
            }
            return;
        }

        if (_data.historyDevs[address]) {
            Object.defineProperty(_data.historyDevs[address], "isBonded", {value: true, writable: false});
            event.trigger("bt-device-bonded-changed", [address, true]);
            successCallback(utils.copy(_data.historyDevs[address]));
        } else if (errorCallback) {
            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
        }
    }

    function destroyBonding(address, successCallback, errorCallback) {
        if (!_security.all && !_security.destroyBonding) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (typeof address !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
            }
            return;
        }

        if (_data.historyDevs[address]) {
            event.trigger("bt-service-state-update", [address, false]);
            Object.defineProperty(_data.historyDevs[address], "isBonded", {value: false, writable: false});
            event.trigger("bt-device-bonded-changed", [address, false]);
            if (successCallback) {
                successCallback();
            }
        } else if (errorCallback) {
            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
        }
    }

    function registerRFCOMMServiceByUUID(uuid, name, successCallback, errorCallback, securityLevel) {
        if (!_security.all && !_security.registerRFCOMMServiceByUUID) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (typeof name !== "string" || typeof uuid !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback) {
            tizen1_utils.validateArgumentType(errorCallback, "function",
                    new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (securityLevel) {
            if (securityLevel !== "LOW" && securityLevel !== "MEDIUM" && securityLevel !== "HIGH") {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }
        }

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
            }
            return;
        }

        _data.localServices[uuid] = new BluetoothServiceHandler({uuid: uuid, name: name, isConnected: false, metaData: _security});
        successCallback(_data.localServices[uuid]);
    }

    event.on("bt-simulated-devices-changed", function () {
        var devs = db.retrieveObject("bt-simulated-devices");
        utils.forEach(_data.availableDevs, function (item) {
            if (!devs[item.address]) {
                delete _data.availableDevs[item.address];
            }
        });
        utils.forEach(devs, function (item) {
            if (!_data.availableDevs[item.address]) {

                _data.availableDevs[item.address] = new BluetoothDevice({
                    name: item.name,
                    address: item.address,
                    deviceClass: item.deviceClass,
                    isBonded: false,
                    isTrusted: item.isTrusted,
                    isConnected: false,
                    services: item.services,
                    metaData: _security
                });
            }
        });
        _data.availableDevsChanging = true;
    });

    event.on("bt-unregister-service", function (uuid, successCallback, errorCallback) {
        if (!_data.localServices[uuid]) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        delete _data.localServices[uuid];
        if (successCallback) {
            successCallback();
        }
    });

    adapter = {
        setName : setName,
        setPowered : setPowered,
        setVisible : setVisible,
        discoverDevices : discoverDevices,
        stopDiscovery : stopDiscovery,
        getKnownDevices : getKnownDevices,
        getDevice : getDevice,
        createBonding : createBonding,
        destroyBonding : destroyBonding,
        registerRFCOMMServiceByUUID : registerRFCOMMServiceByUUID
    };

    adapter.__defineGetter__("name", function () {
        return _devName;
    });
    adapter.__defineGetter__("address", function () {
        return _devAddress;
    });
    adapter.__defineGetter__("powered", function () {
        return _devPowered;
    });
    adapter.__defineGetter__("visible", function () {
        return _devVisible;
    });

    return adapter;
};

_initialize();

_self = function () {
    function getDefaultAdapter() {
        if (!_security.all && !_security.getDefaultAdapter) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (arguments.length > 0) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.adapter) {
            throw new WebAPIError(errorcode.UNKNOWN_ERR);
        }

        return _data.adapter;
    }

    function handleSubFeatures(subFeatures) {
        for (var subFeature in subFeatures) {
            if (_security[subFeature].length === 0) {
                _security.all = true;
                return;
            }
            _security.all = false;
            utils.forEach(_security[subFeature], function (method) {
                _security[method] = true;
            });
        }
    }

    var bluetooth = {
        getDefaultAdapter : getDefaultAdapter,
        handleSubFeatures : handleSubFeatures
    };

    bluetooth.__defineGetter__("deviceMajor", function () {
        return _data.bluetoothClassDeviceMajor;
    });
    bluetooth.__defineGetter__("deviceMinor", function () {
        return _data.bluetoothClassDeviceMinor;
    });
    bluetooth.__defineGetter__("deviceService", function () {
        return _data.bluetoothClassDeviceService;
    });

    return bluetooth;
};

module.exports = _self;
