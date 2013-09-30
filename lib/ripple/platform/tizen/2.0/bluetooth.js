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
    db = require('ripple/db'),
    event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    BluetoothDevice = require('ripple/platform/tizen/2.0/BluetoothDevice'),
    BluetoothClassDeviceMajor = require('ripple/platform/tizen/2.0/BluetoothClassDeviceMajor'),
    BluetoothClassDeviceMinor = require('ripple/platform/tizen/2.0/BluetoothClassDeviceMinor'),
    BluetoothClassDeviceService = require('ripple/platform/tizen/2.0/BluetoothClassDeviceService'),
    BluetoothServiceHandler = require('ripple/platform/tizen/2.0/BluetoothServiceHandler'),
    BluetoothAdapter,
    _data = {
        DB_BLUETOOTH_KEY: "tizen1-db-bluetooth_adapter-name",
        DEFAULT_ADAPTER_NAME: "Tizen BT Adapter",
        DEFAULT_ADAPTER_ADDRESS: "12:34:56:78:90:AB",
        availableDevsChanging: false,
        DEFAULT_VISIBLE_TIME: 180000,
        DISCOVER_TIME: 10000,
        DISCOVER_INTERVAL: 1000,
        bluetoothClassDeviceMajor: {},
        bluetoothClassDeviceMinor: {},
        bluetoothClassDeviceService: {},
        adapter: {},
        historyDevs: {},
        availableDevs: {},
        localServices: {}
    },
    _security = {
        "http://tizen.org/privilege/bluetoothmanager": ["setVisible"],
        "http://tizen.org/privilege/bluetooth.admin": ["setName", "setPowered"],
        "http://tizen.org/privilege/bluetooth.gap": ["getDefaultAdapter",
                "discoverDevices", "stopDiscovery", "getKnownDevices",
                "getDevice", "createBonding", "destroyBonding", "hasService"],
        "http://tizen.org/privilege/bluetooth.spp":
                ["registerRFCOMMServiceByUUID", "connectToServiceByUUID",
                "writeData", "readData", "close", "unregister"]
    },
    _self;

function _initialize() {
    var adapterName, devs;

    _data.bluetoothClassDeviceMajor = new BluetoothClassDeviceMajor();
    _data.bluetoothClassDeviceMinor = new BluetoothClassDeviceMinor();
    _data.bluetoothClassDeviceService = new BluetoothClassDeviceService();
    adapterName = db.retrieveObject(_data.DB_BLUETOOTH_KEY) ||
            _data.DEFAULT_ADAPTER_NAME;
    _data.adapter = new BluetoothAdapter(adapterName,
            _data.DEFAULT_ADAPTER_ADDRESS);

    // get defalt nearby devices
    devs = db.retrieveObject("bt-simulated-devices");
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
    function updateVisibleStatus(status, time) {
        if (!_devPowered)
            return;

        _devVisible = status;
        event.trigger("bt-adapter-visible-changed", [_devVisible]);
        if (_devVisible) {
            if (time > 0) {
                timeoutVar = window.setTimeout(function () {
                    _devVisible = false;
                    event.trigger("bt-adapter-visible-changed", [_devVisible]);
                }, time);
            }
        } else {
            window.clearTimeout(timeoutVar);
        }
    }

    function updatePowerStatus(status) {
        if (_devPowered === status) {
            return;
        }
        if (!status) {
            updateVisibleStatus(false);
            utils.forEach(_data.historyDevs, function (dev) {
                event.trigger("bt-service-state-update", [dev.address, false]);
                dev.__defineGetter__("isBonded", function () {
                    return false;
                });
                event.trigger("bt-device-bonded-changed", [dev.address, false]);
                jQuery("#service-transfer-textarea-" + dev.address.replace(/:/g, "")).val("");
                jQuery("#service-receive-textarea-" + dev.address.replace(/:/g, "")).html("");
            });
        }
        _devPowered = status;
        event.trigger("bt-adapter-power-changed", [_devPowered]);
    }

    // public
    function setName(name, successCallback, errorCallback) {
        if (!_security.setName) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("setName", arguments);

        window.setTimeout(function () {
            if (!_devPowered) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
                }
                return;
            }

            _devName = name;
            db.saveObject(_data.DB_BLUETOOTH_KEY, _devName);
            event.trigger("bt-adapter-name-changed", [_devName]);
            if (successCallback) {
                successCallback();
            }
        }, 1);
    }

    function setPowered(state, successCallback, errorCallback) {
        if (!_security.setPowered) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("setPowered", arguments);

        window.setTimeout(function () {
            updatePowerStatus(state);
            if (successCallback) {
                successCallback();
            }
        }, 1);
    }

    function setVisible(mode, successCallback, errorCallback, timeout) {
        if (!_security.setVisible) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("setVisible", arguments);

        window.setTimeout(function () {
            var time;

            if (!_devPowered) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
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
            updateVisibleStatus(mode, time);

            if (successCallback) {
                successCallback();
            }
        }, 1);
    }

    function discoverDevices(successCallback, errorCallback) {
        if (!_security.discoverDevices) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("discoverDevices", arguments);

        window.setTimeout(function () {
            var interval;

            if (!_devPowered) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
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
                successCallback.ondevicefound(item);
            });

            discoverInterval = window.setTimeout(function () {
                var devs = [];

                window.clearInterval(interval);
                utils.forEach(_data.historyDevs, function (item) {
                    devs.push(item);
                });
                successCallback.onfinished(devs);
                _isDiscovering = false;
            }, _data.DISCOVER_TIME);

            interval = window.setInterval(function () {
                var removeList = [], i;

                if (!_isDiscovering) {
                    window.clearInterval(interval);
                    return;
                }

                if (_data.availableDevsChanging) {
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
                            successCallback.ondevicefound(item);
                        }
                    });
                }
            }, _data.DISCOVER_INTERVAL);
        }, 1);
    }

    function stopDiscovery(successCallback, errorCallback) {
        if (!_security.stopDiscovery) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("stopDiscovery", arguments);

        window.setTimeout(function () {
            if (!_devPowered) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
                }
                return;
            }

            if (_isDiscovering) {
                window.clearTimeout(discoverInterval);
            }
            _isDiscovering = false;
            if (successCallback) {
                successCallback();
            }
        }, 1);
    }

    function getKnownDevices(successCallback, errorCallback) {
        if (!_security.getKnownDevices) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("getKnownDevices", arguments);

        window.setTimeout(function () {
            var devs = [];

            if (!_devPowered) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
                }
                return;
            }
            utils.forEach(_data.historyDevs, function (item) {
                devs.push(new BluetoothDevice({
                    name: item.name,
                    address: item.address,
                    deviceClass: item.deviceClass,
                    isBonded: false,
                    isTrusted: item.isTrusted,
                    isConnected: false,
                    services: item.services,
                    metaData: _security
                }));
            });
            successCallback(devs);
        }, 1);
    }

    function getDevice(address, successCallback, errorCallback) {
        if (!_security.getDevice) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("getDevice", arguments);

        window.setTimeout(function () {
            if (!_devPowered) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
                }
                return;
            }

            if (!_data.historyDevs[address]) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
                return;
            }

            successCallback(_data.historyDevs[address]);
        }, 1);
    }

    function createBonding(address, successCallback, errorCallback) {
        if (!_security.createBonding) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("createBonding", arguments);

        window.setTimeout(function () {
            if (!_devPowered) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
                }
                return;
            }

            if (!_data.historyDevs[address]) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
                return;
            }

            _data.historyDevs[address].__defineGetter__("isBonded", function () {
                return true;
            });
            event.trigger("bt-device-bonded-changed", [address, true]);
            successCallback(_data.historyDevs[address]);
        }, 1);
    }

    function destroyBonding(address, successCallback, errorCallback) {
        if (!_security.destroyBonding) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("destroyBonding", arguments);

        window.setTimeout(function () {
            if (!_devPowered) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
                }
                return;
            }

            if (!_data.historyDevs[address]) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
                return;
            }

            event.trigger("bt-service-state-update", [address, false]);
            _data.historyDevs[address].__defineGetter__("isBonded", function () {
                return false;
            });
            event.trigger("bt-device-bonded-changed", [address, false]);
            if (successCallback) {
                successCallback();
            }
        }, 1);
    }

    function registerRFCOMMServiceByUUID(uuid, name, successCallback,
            errorCallback, securityLevel) {
        if (!_security.registerRFCOMMServiceByUUID) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.BluetoothAdapter("registerRFCOMMServiceByUUID", arguments);

        window.setTimeout(function () {
            if (!_devPowered) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
                }
                return;
            }

            _data.localServices[uuid] = new BluetoothServiceHandler({
                uuid: uuid,
                name: name,
                isConnected: false,
                metaData: _security
            });
            successCallback(_data.localServices[uuid]);
        }, 1);
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

    event.on("bt-power-setting", function (status) {
        updatePowerStatus(status);
    });

    adapter = {
        setName:                     setName,
        setPowered:                  setPowered,
        setVisible:                  setVisible,
        discoverDevices:             discoverDevices,
        stopDiscovery:               stopDiscovery,
        getKnownDevices:             getKnownDevices,
        getDevice:                   getDevice,
        createBonding:               createBonding,
        destroyBonding:              destroyBonding,
        registerRFCOMMServiceByUUID: registerRFCOMMServiceByUUID
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

_self = function () {
    var bluetooth;

    function getDefaultAdapter() {
        if (!_security.getDefaultAdapter) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (!_data.adapter) {
            throw new WebAPIException(errorcode.UNKNOWN_ERR);
        }

        return _data.adapter;
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    bluetooth = {
        getDefaultAdapter: getDefaultAdapter,
        handleSubFeatures: handleSubFeatures
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

_initialize();

module.exports = _self;
