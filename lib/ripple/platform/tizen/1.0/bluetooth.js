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
        currentSockets: [],
        bondDevice : {},
        adapter : {},
        historyDevs : [],
        locServices : [],
        serviceName : "",
        comingData : null,
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
    return {
        name : "TU722",
        address : "00:00:00:00:00:00",
        powered : false,
        visible : false
    };
}

function _defaultServices() {
    return [new BluetoothServiceHandler(_data.SERVICE_UUID, "chat service", false)];
}

function _defaultRemoteDevices() {
    var _deviceClass = {
        major : 0x02,
        minor : 0x03,
        services : [0x0010, 0x0100]
    };

    return [{
        name : "remoteDevs1",
        address : "11:22:33:44:55:66",
        deviceClass : _deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : false,
        uuids : [_data.SERVICE_UUID, "5bce9431-6c75-32ab-afe0-2ec108a30860"]
    }, {
        name : "remoteDevs2",
        address : "11:27:36:64:55:66",
        deviceClass : _deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : false,
        uuids : [_data.SERVICE_UUID, "7bce4566-6c78-90ab-afer-6af108a36789"]
    }, {
        name : "remoteDevs3",
        address : "12:12:43:47:55:16",
        deviceClass : _deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : false,
        uuids : [_data.SERVICE_UUID, "84ce4566-6c78-9d3b-afer-6af108a36789"]
    }];
}
// Get the local adapter
function _get() {
    return db.retrieveObject(_data.DB_BLUETOOTH_KEY) || _defaultAdapter();
}

// Save the information of the local adapter
function _save(name, address, powered, visible) {
    var adapterDev = {
        name : name,
        address : address
    };
    db.saveObject(_data.DB_BLUETOOTH_KEY, adapterDev);
}

// Initialize the local adapter and the remote device, the remote service
function _initialize() {
    var adapterDev;

    _data.bluetoothClassDeviceMajor = new BluetoothClassDeviceMajor();
    _data.bluetoothClassDeviceMinor = new BluetoothClassDeviceMinor();
    _data.bluetoothClassDeviceService = new BluetoothClassDeviceService();

    _data.locServices = db.retrieveObject(_data.DB_BLUETOOTH_LOC_SERVICES_KEY) || _defaultServices();
    _data.historyDevs = db.retrieveObject(_data.DB_BLUETOOTH_HISTORY_DEVICES_KEY) || _defaultRemoteDevices();

    adapterDev = _get();
    _data.adapter = new BluetoothAdapter(adapterDev.name, adapterDev.address, adapterDev.powered, false);
    
    //info the panel to show the properties of the adapter and details of each history devices
    event.trigger("adapterInfo", [_data.adapter]);
    event.trigger("historyDevices", [_data.historyDevs]);
    event.trigger("historyServices", [_data.locServices]);
}

function _getDevice(device) {
    var bc, bd;
    bc = new BluetoothClass(device.deviceClass.major, device.deviceClass.minor, device.deviceClass.services);
    bd = new BluetoothDevice(device.name, device.address, bc, device.isBonded, device.isTrusted, device.isConnected, device.uuids);
    return bd;
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
    var adapter, _devName = devName, _devAddress = devAddress, _devPowered = devPowered,
        _devVisible = devVisible;

    // Set the adapter name
    function setName(name, successCallback, errorCallback) {
        if (!_security.all && !_security.setName)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (typeof name !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!_devPowered || name === "") {
            if (errorCallback)
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));

            return;
        }

        _devName = name;
        event.trigger("nameValue", [_devName]);
        _save(_devName, _devAddress);
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
        event.trigger("powerState", [_devPowered]);
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
            if (errorCallback)
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));

            return;
        }

        _devVisible = mode;
        event.trigger("visibleState", [_devVisible]);
        time = timeout || _data.DEFAULT_VISIBLE_TIME;
        if (mode && (time !== 0)) {
            // Set timeout operate
            setTimeout(function () {
                _devVisible = false;
                event.trigger("visibleState", [false]);
            }, time);
        }
        successCallback();
    }

    // Discover the information of the found devices
    function discoverDevices(successCallback, errorCallback) {
        var deviceList = [];

        if (!_security.all && !_security.discoverDevices)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (successCallback === undefined || successCallback === null)
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        utils.forEach(successCallback, function (callbackItem) {
            if (callbackItem === undefined || callbackItem === null)
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

            tizen1_utils.validateArgumentType(callbackItem, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        });

        if (!_devPowered) {
            if (errorCallback)
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));

            return;
        }
        
        event.trigger("discoverDevices", [true]);
        successCallback.onstarted();

        // Discover process
        event.on("deviceDiscovered", function (device) {
            var deviceFound = _getDevice(utils.copy(device)), isInHistory = false;

            successCallback.ondevicefound(deviceFound);
            deviceList.push(deviceFound);
            isInHistory = _data.historyDevs.some(function (device) {
                return device.address === deviceFound.address;
            });
            if (!isInHistory) {
                _data.historyDevs.push(deviceFound);
                event.trigger("historyDevices", [_data.historyDevs]);
                db.saveObject(_data.DB_BLUETOOTH_HISTORY_DEVICES_KEY, _data.historyDevs);
            }
        });
        event.once("discoverFinished", function (devices) {
            successCallback.onfinished(deviceList); 
            event.clear("deviceDiscovered");
        });
    }

    // Stop discovering the information of the found devices
    function stopDiscovery(successCallback, errorCallback) {
        if (!_security.all && !_security.stopDiscovery)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_devPowered) {
            if (errorCallback)
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));

            return;
        }
        //isStopFound = true;
        event.trigger("discoverDevices", [false]);
        event.clear("deviceDiscovered");
        successCallback();
    }

    // Get known devices which are connected
    function getKnownDevices(successCallback, errorCallback) {
        var knownDevs = utils.copy(_data.historyDevs);

        if (!_security.all && !_security.getKnownDevices)
            throw new WebAPIError(errorcode.SECURITY_ERR);
        
        tizen1_utils.validateTypeMismatch(successCallback, errorCallback);

        if (!_devPowered || !knownDevs) {
            if (errorCallback)
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));

            return;
        }
        successCallback(knownDevs);
    }

    // Get the information of the device
    function getDevice(address, successCallback, errorCallback) {
        var isFound = false; 

        if (!_security.all && !_security.getDevice)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof address !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        tizen1_utils.validateTypeMismatch(successCallback, errorCallback);

        if (!_devPowered) {
            if (errorCallback)
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));

            return;
        }

        isFound = _data.historyDevs.some(function (item) {
            if (item.address === address) {
                successCallback(utils.copy(item));
                return true;
            }
        });
        
        if (!isFound && errorCallback)
            errorCallback(errorcode.NotFoundError);
    }

    // Bonding the local device and remote device
    function createBonding(address, successCallback, errorCallback) {
        var isFound = false;

        if (!_security.all && !_security.createBonding)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof address !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        tizen1_utils.validateTypeMismatch(successCallback, errorCallback);

        if (!_devPowered || _data.historyDevs === undefined) {
            if (errorCallback)
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));

            return;
        }

        isFound = _data.historyDevs.some(function (item) {
            if (item.address === address) {
                item.isBonded = true;
                successCallback(utils.copy(item));
                db.saveObject(_data.DB_BLUETOOTH_HISTORY_DEVICES_KEY, _data.historyDevs);
                event.trigger("historyDevices", [utils.copy(_data.historyDevs)]);
                return true;
            }
        });

        if (!isFound && errorCallback)
            errorCallback(errorcode.NotFoundError);
    }

    // Destroy bonding from the local device and remote device
    function destroyBonding(address, successCallback, errorCallback) {
        var isFound = false;

        if (!_security.all && !_security.destroyBonding)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof address !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_devPowered || _data.historyDevs === undefined) {
            if (errorCallback)
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));

            return;
        }

        isFound = _data.historyDevs.some(function (item) {
            if (item.address === address) {
                item.isBonded = false;
                event.trigger("historyDevices", [utils.copy(_data.historyDevs)]);
                db.saveObject(_data.DB_BLUETOOTH_HISTORY_DEVICES_KEY, _data.historyDevs);
                successCallback();
                return true;
            }
        });

        if (!isFound && errorCallback)
            errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
    }

    // Register service by UUID
    function registerRFCOMMServiceByUUID(uuid, name, successCallback, errorCallback, securityLevel) {
        var locService, isExisted = false;

        if (!_security.all && !_security.registerRFCOMMServiceByUUID)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof name !== "string" || typeof uuid !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        locService = new BluetoothServiceHandler(uuid, name, false);
        _data.locServices.push(locService);
        event.trigger("historyServices", [_data.locServices]);

        db.saveObject(_data.DB_BLUETOOTH_LOC_SERVICES_KEY, _data.locServices);
        successCallback(locService);
    }

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

event.on("remoteDataArrived", function (comingData) {
    _data.comingData = comingData.text;
    if (!_data.regCallback || _data.remote.bondStatus !== "bonding")
        return;

    _data.currentSockets.some(function (item) {
        if (item.uuid === comingData.uuid) {
            item.onmessage();
            return true;
        }
    });
});

// The BluetoothDevice object
BluetoothDevice = function (name, address, deviceClass, isBonded, isTrusted, isConnected, uuids) {
    var bluetoothSocket, socketInfo, _name = name, _address = address, _deviceClass = deviceClass,
        _isBonded = isBonded, _isTrusted = isTrusted, _isConnected = isConnected, _uuids = uuids,
        bluetoothDevice;

    bluetoothDevice = {
        connectToServiceByUUID : function (uuid, successCallback, errorCallback) {
            if (!_security.all && !_security.connectToServiceByUUID)
                throw new WebAPIError(errorcode.SECURITY_ERR);

            if (typeof uuid !== "string")
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

            tizen1_utils.validateTypeMismatch(successCallback, errorCallback);

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
            _data.currentSockets.push(bluetoothSocket);
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
    var bluetoothSocket, readData, _uuid = uuid, _protocol = protocol,
        _state = state, _peer = tizen1_utils.copy(peer);

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
                event.trigger("dataSent", [data]);
            }
            return data.length;
        },
        readData : function () {
            if (!_security.all && !_security.readData)
                throw new WebAPIError(errorcode.SECURITY_ERR);

            if (_state === "CLOSED")
                return;

            if (_data.comingData)
                readData = _stringToBytes(_data.comingData);
            else
                readData = "";
            
            return readData;
        },
        close : function () {
            if (!_security.all && !_security.close)
                throw new WebAPIError(errorcode.SECURITY_ERR);

            _data.currentSockets.some(function (item, index) {
                if (item.uuid === _uuid) {
                    _data.currentSockets.splice(index, 1);
                    return true;
                }
            });
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
    var bluetoothClass, _major = major, _minor = minor,
        _services = tizen1_utils.copy(services);

    bluetoothClass = {
        hasService : function (service) {
            var serviceOn = false;

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
    var _uuid = uuid, _name = name, _isConnected = isConnected,
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
            _data.locServices.some(function (item, index) {
                if (item.uuid === _uuid) {
                    _data.locServices.splice(index, 1);
                    return true;
                }
            });

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
