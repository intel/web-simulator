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
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    PendingObject = require('ripple/platform/tizen/1.0/pendingObject'),
    PendingOperation = require('ripple/platform/tizen/1.0/pendingoperation'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    BluetoothClass,
    BluetoothClassDeviceMajor,
    BluetoothClassDeviceMinor,
    BluetoothClassDeviceService,
    BluetoothServiceHandler,
    BluetoothDevice,
    BluetoothSocket,
    BluetoothAdapter,
    _data = {
        DB_BLUETOOTH_KEY : "tizen1-db-bluetooth_adapter",
        DB_BLUETOOTH_LOC_SERVICES_KEY : "tizen1-db-bluetooth_loc_services",
        DB_BLUETOOTH_HISTORY_DEVICES_KEY : "tizen1-db-bluetooth_history_devices",
        SERVICE_UUID : "5bce9431-6c75-32ab-afe0-2ec108a30860",
        DEFAULT_VISIBLE_TIME : 180000,
        DISCOVER_TIME : 20000,
        DISCOVER_INTERVAL : 2000,
        BOND_INTERVAL : 2000,
        bluetoothClassDeviceMajor : {},
        bluetoothClassDeviceMinor : {},
        bluetoothClassDeviceService : {},
        regCallback : null,
        bondDevice : {},
        adapter : {},
        historyDevs : [],
        locServices : [],
        serviceName : "",
        remote : {
            pairedDevice : {},
            sentData : "",
            devices : [],
            bondStatus : "",
            isAway : false
        }
    },
    _security = {
        "http://tizen.org/api/bluetooth": [],
        "http://tizen.org/api/bluetooth.admin": ["setName", "setPowered", "setVisible"],
        "http://tizen.org/api/bluetooth.gap": ["discoverDevices", "stopDiscovery", "getKnownDevices", "getDevice", "createBonding", "destroyBonding"],
        "http://tizen.org/api/bluetooth.spp": ["registerRFCOMMServiceByUUID", "connectToServiceByUUID", "unregister", "writeData", "readData", "close"],
        all: true
    },
    _self;

function _defaultAdapter() {
    var adapter = {
        name : "TU722",
        address : "00:00:00:00:00:00",
        powered : false,
        visible : false
    };
    return adapter;
}

// Get the local adapter
function _get() {
    return db.retrieveObject(_data.DB_BLUETOOTH_KEY) || _defaultAdapter();
}

// Save the information of the local adapter
function _save(name, address, powered, visible) {
    var adapterDev = {
        name : name,
        address : address,
        powered : powered,
        visible : visible
    };
    db.saveObject(_data.DB_BLUETOOTH_KEY, adapterDev);
}

// Initialize the local adapter and the remote device, the remote service
function _initialize() {
    var adapterDev;

    event.trigger("deviceInit", [_data.remote]);

    _data.bluetoothClassDeviceMajor = new BluetoothClassDeviceMajor();
    _data.bluetoothClassDeviceMinor = new BluetoothClassDeviceMinor();
    _data.bluetoothClassDeviceService = new BluetoothClassDeviceService();

    _data.locServices = db.retrieveObject(_data.DB_BLUETOOTH_LOC_SERVICES_KEY) || [];
    _data.historyDevs = db.retrieveObject(_data.DB_BLUETOOTH_HISTORY_DEVICES_KEY) || [];

    adapterDev = _get();
    _data.adapter = new BluetoothAdapter(adapterDev.name, adapterDev.address, adapterDev.powered, adapterDev.visible);
}

function _getDevice(device) {
    var bc, bd;
    bc = new BluetoothClass(device.deviceClass.major, device.deviceClass.minor, device.deviceClass.services);
    bd = new BluetoothDevice(device.name, device.address, bc, device.isBonded, device.isTrusted, device.isConnected, device.uuids);
    return bd;
}

// Validate the callback type
function _validateCallbackType(onSuccess, onError) {
    if (onSuccess &&
        (typeof onSuccess !== "function") &&
        (typeof onSuccess !== "object")) {
        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
    }
    if (onError) {
        tizen1_utils.validateArgumentType(onError, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }
    if (onSuccess.onstarted) {
        tizen1_utils.validateArgumentType(onSuccess.onstarted, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }
    if (onSuccess.ondevicefound) {
        tizen1_utils.validateArgumentType(onSuccess.ondevicefound, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }
    if (onSuccess.ondevicedisappeared) {
        tizen1_utils.validateArgumentType(onSuccess.ondevicedisappeared, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }
    if (onSuccess.onfinished) {
        tizen1_utils.validateArgumentType(onSuccess.onfinished, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }
}

function _stringToBytes(str) {
    var ch, st, re = [], i;

    for (i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i);
        st = [];
        do {
            st.push(ch & 0xFF);
            ch = ch >> 8;
        } while (ch);
        re = re.concat(st.reverse());
    }

    return re;
}

// Define the BluetoothAdapter
BluetoothAdapter = function (devName, devAddress, devPowered, devVisible) {
    var adapter,
        isStopFound = false,
        _devName = devName,
        _devAddress = devAddress,
        _devPowered = devPowered,
        _devVisible = devVisible;

    // Set the adapter name
    function setName(name, successCallback, errorCallback) {
        if (!_security.all && !_security.setName)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (typeof name !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!_devPowered || name === "") {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        _devName = name;
        _save(_devName, _devAddress, _devPowered, _devVisible);
        successCallback();
    }

    // Set the adapter power
    function setPowered(state, successCallback, errorCallback) {
        if (!_security.all && !_security.setPowered)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (typeof state !== "boolean")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        _devPowered = state;
        _save(_devName, _devAddress, _devPowered, _devVisible);
        successCallback();
    }

    // Set the adapter visible or invisible
    function setVisible(mode, successCallback, errorCallback, timeout) {
        var time;

        if (!_security.all && !_security.setVisible)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (typeof mode !== "boolean" || (timeout && (typeof timeout !== "number")))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }

        _devVisible = mode;
        time = timeout || _data.DEFAULT_VISIBLE_TIME;
        _save(_devName, _devAddress, _devPowered, _devVisible);
        if (mode && (time !== 0)) {
            // Set timeout operate
            setTimeout(function () {
                _devVisible = false;
                _save(_devName, _devAddress, _devPowered, _devVisible);
            }, time);
        }
        successCallback();
    }

    // Discover the information of the found devices
    function discoverDevices(successCallback, errorCallback) {
        var interval, remoteDev, count, num = 0, isExisted,
            remoteAddress = _data.remote.pairedDevice.address;

        if (!_security.all && !_security.discoverDevices)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        _validateCallbackType(successCallback, errorCallback);

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        // Clear the data other than the pairing
        for (count in _data.historyDevs) {
            if (!_data.historyDevs[count].isBonded) {
                _data.historyDevs.splice(count, 1);
            }
        }
        successCallback.onstarted();
        isStopFound = false;
        // Discover process
        interval = setInterval(function () {
            if (isStopFound || num === _data.remote.devices.length) {
                clearInterval(interval);
                return;
            }
            if (_data.remote.isAway && remoteAddress) {
                successCallback.ondevicedisappeared(_data.remote.pairedDevice.address);
                remoteAddress = null;
            }
            remoteDev = _data.remote.devices[num];
            successCallback.ondevicefound(remoteDev);
            isExisted = false;
            for (var i in _data.historyDevs) {
                if (_data.historyDevs[i].address === remoteDev.address) {
                    isExisted = true;
                    break;
                }
            }
            if (!isExisted) {
                _data.historyDevs.push(remoteDev);
            }
            db.saveObject(_data.DB_BLUETOOTH_HISTORY_DEVICES_KEY, _data.historyDevs);
            num++;
        }, _data.DISCOVER_INTERVAL);
        setTimeout(function () {
            successCallback.onfinished(_data.historyDevs);
            clearInterval(interval);
        }, _data.DISCOVER_TIME);
    }

    // Stop discovering the information of the found devices
    function stopDiscovery(successCallback, errorCallback) {
        if (!_security.all && !_security.stopDiscovery)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        isStopFound = true;
        successCallback();
    }

    // Get known devices which are connected
    function getKnownDevices(successCallback, errorCallback) {
        var knownDevs = _data.historyDevs;

        if (!_security.all && !_security.getKnownDevices)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        _validateCallbackType(successCallback, errorCallback);

        if (!_devPowered || !knownDevs) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        successCallback(knownDevs);
    }

    // Get the information of the device
    function getDevice(address, successCallback, errorCallback) {
        var _address = [];

        if (!_security.all && !_security.getDevice)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof address !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        _validateCallbackType(successCallback, errorCallback);

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        utils.forEach(_data.historyDevs, function (item, index) {
            if (item.address === address) {
                successCallback(item);
            }
        });
    }

    // Bonding the local device and remote device
    function createBonding(address, successCallback, errorCallback) {
        var pendingObj, index, intervalKey, adapterDev, pendingOperation, item;

        if (!_security.all && !_security.createBonding)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof address !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        _validateCallbackType(successCallback, errorCallback);

        if (!_devPowered || _data.historyDevs === undefined) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        _data.remote.bondStatus = "";
        utils.forEach(_data.historyDevs, function (item, index) {
            if (item.address === address) {
                adapterDev = _get();
                pendingObj = new PendingObject();
                pendingObj.pendingID = setTimeout(function () {
                    pendingObj.setCancelFlag(false);
                    if (!item.isBonded) {
                        event.trigger("bondingCreated", [adapterDev.name]);
                        intervalKey = setInterval(function () {
                            if (_data.remote.bondStatus) {
                                clearInterval(intervalKey);
                            }
                            if (_data.remote.bondStatus === "bonding") {
                                event.trigger("bondingSucceeded", []);
                                _data.historyDevs[index].isBonded = true;
                                db.saveObject(_data.DB_BLUETOOTH_HISTORY_DEVICES_KEY, _data.historyDevs);
                                _data.bondDevice = _getDevice(_data.historyDevs[index]);
                                successCallback(_data.bondDevice);
                            } else if (_data.remote.bondStatus === "noBonding") {
                                errorCallback();
                            }
                        }, _data.BOND_INTERVAL);
                    }
                }, 1);
                pendingOperation = new PendingOperation(pendingObj);
            }
        });
        return pendingOperation;
    }

    // Destroy bonding from the local device and remote device
    function destroyBonding(address, successCallback, errorCallback) {
        var index;

        if (!_security.all && !_security.destroyBonding)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof address !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_devPowered || _data.historyDevs === undefined) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        for (index in _data.historyDevs) {
            if (_data.historyDevs[index].address === address) {
                if (_data.historyDevs[index].isBonded) {
                    _data.historyDevs[index].isBonded = false;
                }
            }
        }
        db.saveObject(_data.DB_BLUETOOTH_HISTORY_DEVICES_KEY, _data.historyDevs);
        _data.bondDevice = {};
        event.trigger("bondingDestroyed", []);
        successCallback();
    }

    // Register service by UUID
    function registerRFCOMMServiceByUUID(uuid, name, successCallback, errorCallback, securityLevel) {
        var locService, count, isExisted = false;

        if (!_security.all && !_security.registerRFCOMMServiceByUUID)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof name !== "string" || typeof uuid !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        _validateCallbackType(successCallback, errorCallback);

        if (typeof name !== "string" || typeof uuid !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!_devPowered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }

        locService = {serviceInfo: {uuid: uuid, name: name}};
        for (count in _data.locServices) {
            if (_data.locServices[count].name === locService.name) {
                isExisted = true;
                break;
            }
        }
        if (!isExisted) {
            _data.locServices.push(locService);
        }
        db.saveObject(_data.DB_BLUETOOTH_LOC_SERVICES_KEY, _data.locServices);
        _data.regCallback = successCallback;
        _data.serviceName = name;
    }

    event.on("remoteDevAway", function (isAway) {
        _data.remote.isAway = true;
    });

    event.on("remoteDevBonded", function (status) { // AcceptConnect
        _data.remote.bondStatus = status;
    });

    event.on("remoteDevDetached", function (address) {
        destroyBonding(address, function () {}, function () {});
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

event.on("remoteDataArrived", function (remoteData) {
    var index, bluetoothSocket, bluetoothServiceHandler;

    _data.remote.sentData = remoteData;
    if (!_data.regCallback || _data.remote.bondStatus !== "bonding") {
        return;
    }

    for (index in _data.locServices) {
        if (_data.locServices[index].serviceInfo.name === _data.serviceName) {
            bluetoothSocket = new BluetoothSocket(_data.SERVICE_UUID, "RFCOMM", "OPEN", _data.bondDevice);
            bluetoothServiceHandler = new BluetoothServiceHandler(_data.locServices[index].serviceInfo.uuid, _data.locServices[index].serviceInfo.name, true);
            _data.regCallback(bluetoothServiceHandler);
            break;
        }
    }

    if (bluetoothServiceHandler.onconnect === null)
        return;

    if (typeof bluetoothServiceHandler.onconnect !== "function")
        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

    bluetoothServiceHandler.onconnect(bluetoothSocket);

    if (bluetoothSocket.onmessage === null)
        return;

    if (typeof bluetoothSocket.onmessage !== "function")
        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

    bluetoothSocket.onmessage();
});

// The BluetoothDevice object
BluetoothDevice = function (name, address, deviceClass, isBonded, isTrusted, isConnected, uuids) {
    var bluetoothSocket, socketInfo,
        _name = tizen1_utils.copyString(name),
        _address = tizen1_utils.copyString(address),
        _deviceClass = tizen1_utils.copyString(deviceClass),
        _isBonded = isBonded,
        _isTrusted = isTrusted,
        _isConnected = isConnected,
        _uuids = tizen1_utils.copyString(uuids),
        bluetoothDevice;

    bluetoothDevice = {
        connectToServiceByUUID : function (uuid, successCallback, errorCallback) {
            if (!_security.all && !_security.connectToServiceByUUID)
                throw new WebAPIError(errorcode.SECURITY_ERR);

            if (typeof uuid !== "string")
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

            _validateCallbackType(successCallback, errorCallback);

            if (uuids.join(",").indexOf(uuid) === -1) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }

            socketInfo = {
                uuid : uuid,
                protocol : "RFCOMM",
                state : "OPEN",
                peer : _data.bondDevice
            };
            bluetoothSocket = new BluetoothSocket(socketInfo.uuid, socketInfo.protocol, socketInfo.state, socketInfo.peer);
            successCallback(bluetoothSocket);
        }
    };

    bluetoothDevice.__defineGetter__("name", function () {
        return _name;
    });
    bluetoothDevice.__defineGetter__("address", function () {
        return _address;
    });
    bluetoothDevice.__defineGetter__("deviceClass", function () {
        return _deviceClass;
    });
    bluetoothDevice.__defineGetter__("isBonded", function () {
        return _isBonded;
    });
    bluetoothDevice.__defineGetter__("isTrusted", function () {
        return _isTrusted;
    });
    bluetoothDevice.__defineGetter__("isConnected", function () {
        return _isConnected;
    });
    bluetoothDevice.__defineGetter__("uuids", function () {
        return _uuids;
    });

    return bluetoothDevice;
};

// The BluetoothSocket object
BluetoothSocket = function (uuid, protocol, state, peer) {
    var bluetoothSocket, msg, readData,
        _uuid = tizen1_utils.copyString(uuid),
        _protocol = tizen1_utils.copyString(protocol),
        _state = tizen1_utils.copyString(state),
        _peer = tizen1_utils.copy(peer);

    bluetoothSocket = {
        onmessage : null,
        onclose : null,
        onerror : null,
        writeData : function (data) {
            if (!_security.all && !_security.writeData)
                throw new WebAPIError(errorcode.SECURITY_ERR);

            if (_state === "CLOSED")
                return;

            if (tizen1_utils.isValidArray(data))
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

            if (_data.remote.bondStatus === "bonding") {
                event.trigger("dataArrived", [data]);
            }
            return data.length;
        },
        readData : function () {
            if (!_security.all && !_security.readData)
                throw new WebAPIError(errorcode.SECURITY_ERR);

            if (_state === "CLOSED")
                return;

            if (_data.remote.sentData && (_data.remote.bondStatus === "bonding")) {
                readData = _stringToBytes(_data.remote.sentData);
            } else {
                readData = "";
            }
            return readData;
        },
        close : function () {
            if (!_security.all && !_security.close)
                throw new WebAPIError(errorcode.SECURITY_ERR);

            _state = "CLOSED";
        }
    };
    bluetoothSocket.__defineGetter__("uuid", function () {
        return _uuid;
    });
    bluetoothSocket.__defineGetter__("protocol", function () {
        return _protocol;
    });
    bluetoothSocket.__defineGetter__("state", function () {
        return _state;
    });
    bluetoothSocket.__defineGetter__("peer", function () {
        return _peer;
    });
    return bluetoothSocket;
};

// The BluetoothClass object
BluetoothClass = function (major, minor, services) {
    var bluetoothClass, isClassDeviceService,
        _major = tizen1_utils.copyString(major),
        _minor = tizen1_utils.copyString(minor),
        _services = tizen1_utils.copy(services);

    bluetoothClass = {
        hasService : function (service) {
            var serviceOn = false, index;

            if (typeof service !== "string")
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

            if (services.join(",").indexOf(service) !== -1) {
                serviceOn = true;
            }
            return serviceOn;
        }
    };
    bluetoothClass.__defineGetter__("major", function () {
        return _major;
    });
    bluetoothClass.__defineGetter__("minor", function () {
        return _minor;
    });
    bluetoothClass.__defineGetter__("services", function () {
        return _services;
    });
    return bluetoothClass;
};

// The BluetoothServiceHandler object
BluetoothServiceHandler = function (uuid, name, isConnected) {
    var _uuid = tizen1_utils.copyString(uuid),
        _name = tizen1_utils.copyString(name),
        _isConnected = isConnected,
        bluetoothServiceHandler;

    bluetoothServiceHandler = {
        onconnect : null,
        unregister : function (successCallback, errorCallback) {
            if (!_security.all && !_security.unregister)
                throw new WebAPIError(errorcode.SECURITY_ERR);

            tizen1_utils.validateCallbackType(successCallback, errorCallback);

            if (_data.locServices === undefined) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            for (var index in _data.locServices) {
                if (_data.locServices[index].serviceInfo.name === _name) {
                    delete _data.locServices[index];
                }
            }
            db.saveObject(_data.DB_BLUETOOTH_LOC_SERVICES_KEY, _data.locServices);
            _data.regCallback = null;
            successCallback();
        }
    };
    bluetoothServiceHandler.__defineGetter__("uuid", function () {
        return _uuid;
    });
    bluetoothServiceHandler.__defineGetter__("name", function () {
        return _name;
    });
    bluetoothServiceHandler.__defineGetter__("isConnected", function () {
        return _isConnected;
    });
    return bluetoothServiceHandler;
};

// The BluetoothClassDeviceMajor object
BluetoothClassDeviceMajor = function () {
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

// The BluetoothClassDeviceMinor object
BluetoothClassDeviceMinor = function () {
    this.__defineGetter__("COMPUTER_UNCATEGORIZED", function () {
        return 0x00;
    });
    this.__defineGetter__("COMPUTER_DESKTOP", function () {
        return 0x01;
    });
    this.__defineGetter__("COMPUTER_SERVER", function () {
        return 0x02;
    });
    this.__defineGetter__("COMPUTER_LAPTOP", function () {
        return 0x03;
    });
    this.__defineGetter__("COMPUTER_HANDHELD_PC_OR_PDA", function () {
        return 0x04;
    });
    this.__defineGetter__("COMPUTER_PALM_PC_OR_PDA", function () {
        return 0x05;
    });
    this.__defineGetter__("COMPUTER_WEARABLE", function () {
        return 0x06;
    });

    this.__defineGetter__("PHONE_UNCATEGORIZED", function () {
        return 0x00;
    });
    this.__defineGetter__("PHONE_CELLULAR", function () {
        return 0x01;
    });
    this.__defineGetter__("PHONE_CORDLESS", function () {
        return 0x02;
    });
    this.__defineGetter__("PHONE_SMARTPHONE", function () {
        return 0x03;
    });
    this.__defineGetter__("PHONE_MODEM_OR_GATEWAY", function () {
        return 0x04;
    });
    this.__defineGetter__("PHONE_ISDN", function () {
        return 0x05;
    });

    this.__defineGetter__("AV_UNRECOGNIZED", function () {
        return 0x00;
    });
    this.__defineGetter__("AV_WEARABLE_HEADSET", function () {
        return 0x01;
    });
    this.__defineGetter__("AV_HANDSFREE", function () {
        return 0x02;
    });
    this.__defineGetter__("AV_MICROPHONE", function () {
        return 0x04;
    });
    this.__defineGetter__("AV_LOUDSPEAKER", function () {
        return 0x05;
    });
    this.__defineGetter__("AV_HEADPHONES", function () {
        return 0x06;
    });
    this.__defineGetter__("AV_PORTABLE_AUDIO", function () {
        return 0x07;
    });
    this.__defineGetter__("AV_CAR_AUDIO", function () {
        return 0x08;
    });
    this.__defineGetter__("AV_SETTOP_BOX", function () {
        return 0x09;
    });
    this.__defineGetter__("AV_HIFI", function () {
        return 0x0a;
    });
    this.__defineGetter__("AV_VCR", function () {
        return 0x0b;
    });
    this.__defineGetter__("AV_VIDEO_CAMERA", function () {
        return 0x0c;
    });
    this.__defineGetter__("AV_CAMCORDER", function () {
        return 0x0d;
    });
    this.__defineGetter__("AV_MONITOR", function () {
        return 0x0e;
    });
    this.__defineGetter__("AV_DISPLAY_AND_LOUDSPEAKER", function () {
        return 0x0f;
    });
    this.__defineGetter__("AV_VIDEO_CONFERENCING", function () {
        return 0x10;
    });
    this.__defineGetter__("AV_GAMING_TOY", function () {
        return 0x12;
    });

    this.__defineGetter__("PERIPHERAL_UNCATEGORIZED", function () {
        return 0;
    });
    this.__defineGetter__("PERIPHERAL_KEYBOARD", function () {
        return 0x10;
    });
    this.__defineGetter__("PERIPHERAL_POINTING_DEVICE", function () {
        return 0x20;
    });
    this.__defineGetter__("PERIPHERAL_KEYBOARD_AND_POINTING_DEVICE", function () {
        return 0x30;
    });
    this.__defineGetter__("PERIPHERAL_JOYSTICK", function () {
        return 0x01;
    });
    this.__defineGetter__("PERIPHERAL_GAMEPAD", function () {
        return 0x02;
    });
    this.__defineGetter__("PERIPHERAL_REMOTE_CONTROL", function () {
        return 0x03;
    });
    this.__defineGetter__("PERIPHERAL_SENSING_DEVICE", function () {
        return 0x04;
    });
    this.__defineGetter__("PERIPHERAL_DEGITIZER_TABLET", function () {
        return 0x05;
    });
    this.__defineGetter__("PERIPHERAL_CARD_READER", function () {
        return 0x06;
    });
    this.__defineGetter__("PERIPHERAL_DIGITAL_PEN", function () {
        return 0x07;
    });
    this.__defineGetter__("PERIPHERAL_HANDHELD_SCANNER", function () {
        return 0x08;
    });
    this.__defineGetter__("PERIPHERAL_HANDHELD_INPUT_DEVICE", function () {
        return 0x09;
    });

    this.__defineGetter__("IMAGING_UNCATEGORIZED", function () {
        return 0x00;
    });
    this.__defineGetter__("IMAGING_DISPLAY", function () {
        return 0x04;
    });
    this.__defineGetter__("IMAGING_CAMERA", function () {
        return 0x08;
    });
    this.__defineGetter__("IMAGING_SCANNER", function () {
        return 0x10;
    });
    this.__defineGetter__("IMAGING_PRINTER", function () {
        return 0x20;
    });

    this.__defineGetter__("WEARABLE_WRITST_WATCH", function () {
        return 0x01;
    });
    this.__defineGetter__("WEARABLE_PAGER", function () {
        return 0x02;
    });
    this.__defineGetter__("WEARABLE_JACKET", function () {
        return 0x03;
    });
    this.__defineGetter__("WEARABLE_HELMET", function () {
        return 0x04;
    });
    this.__defineGetter__("WEARABLE_GLASSES", function () {
        return 0x05;
    });

    this.__defineGetter__("TOY_ROBOT", function () {
        return 0x01;
    });
    this.__defineGetter__("TOY_VEHICLE", function () {
        return 0x02;
    });
    this.__defineGetter__("TOY_DOLL", function () {
        return 0x03;
    });
    this.__defineGetter__("TOY_CONTROLLER", function () {
        return 0x04;
    });
    this.__defineGetter__("TOY_GAME", function () {
        return 0x05;
    });

    this.__defineGetter__("HEALTH_UNDEFINED", function () {
        return 0x00;
    });
    this.__defineGetter__("HEALTH_BLOOD_PRESSURE_MONITOR", function () {
        return 0x01;
    });
    this.__defineGetter__("HEALTH_THERMOMETER", function () {
        return 0x02;
    });
    this.__defineGetter__("HEALTH_WEIGHING_SCALE", function () {
        return 0x03;
    });
    this.__defineGetter__("HEALTH_GLUCOSE_METER", function () {
        return 0x04;
    });
    this.__defineGetter__("HEALTH_PULSE_OXIMETER", function () {
        return 0x05;
    });
    this.__defineGetter__("HEALTH_PULSE_RATE_MONITOR", function () {
        return 0x06;
    });
    this.__defineGetter__("HEALTH_DATA_DISPLAY", function () {
        return 0x07;
    });
    this.__defineGetter__("HEALTH_STEP_COUNTER", function () {
        return 0x08;
    });
    this.__defineGetter__("HEALTH_BODY_COMPOSITION_ANALYZER", function () {
        return 0x09;
    });
    this.__defineGetter__("HEALTH_PEAK_FLOW_MONITOR", function () {
        return 0x0a;
    });
    this.__defineGetter__("HEALTH_MEDICATION_MONITOR", function () {
        return 0x0b;
    });
    this.__defineGetter__("HEALTH_KNEE_PROSTHESIS", function () {
        return 0x0c;
    });
    this.__defineGetter__("HEALTH_ANKLE_PROSTHESIS", function () {
        return 0x0d;
    });
};

// The BluetoothClassDeviceService object
BluetoothClassDeviceService = function () {
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

_initialize();

_self = function () {
    function getDefaultAdapter() {
        if (arguments.length > 0)
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);

        if (!_data.adapter)
            throw new WebAPIError(errorcode.UNKNOWN_ERR);

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

    bluetooth.__defineGetter__("DeviceMajor", function () {
        return _data.bluetoothClassDeviceMajor;
    });
    bluetooth.__defineGetter__("DeviceMinor", function () {
        return _data.bluetoothClassDeviceMinor;
    });
    bluetooth.__defineGetter__("DeviceService", function () {
        return _data.bluetoothClassDeviceService;
    });

    return bluetooth;
};

module.exports = _self;
