/*
 *  Copyright 2011 Intel Corporation.
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
    utils = require('ripple/utils'),
    StorageTypeTable = {
        "UNKNOWN": "UNKNOWN",
        "INTERNAL": "INTERNAL",
        "MMC": "MMC",
        "USB_HOST": "USB_HOST"
    },
    NetworkTypeTable = {
        "NONE": "NONE",
        "2G": "2G",
        "2.5G": "2.5G",
        "3G": "3G",
        "4G": "4G",
        "WIFI": "WIFI",
        "ETHERNET": "ETHERNET",
        "UNKNOWN": "UNKNOWN"
    };

function deviceStatusEventTrigger(setting) {
    event.trigger("DeviceStatusChanged", [setting]);
}

module.exports = {
    "Config": {
        "vibratingMode": {
            "name": "Vibrator",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "callback": function (setting) {
                event.trigger("VibratingModeChanged", [setting]);
            }
        },
        "lockScreen": {
            "name": "Lock Screen",
            "control": {
                "type": "checkbox",
                "value": false
            },
            "callback": function (setting) {
                event.trigger("LockScreenChanged", [setting]);
            }
        }
    },
    "DEVICE_ORIENTATION": {
        "status": {
            "name": "Status",
            "control": {
                "type": "label",
                "innertext": "PORTRAIT_PRIMARY",
                "value": "PORTRAIT_PRIMARY"
            },
            "event": "LayoutChanged"
        }
    },
    "CPU": {
        "load": {
            "name": "Load",
            "control": {
                "type": "text",
                "value": 0.1
            },
            "event": "CpuLoadChanged",
            "callback": function (setting) {
                event.trigger("CpuLoadChanged", [setting]);
            }
        }
    },
    "STORAGE": {
        "type": {
            "name": "Type",
            "control": {
                "type": "select",
                "value": StorageTypeTable["INTERNAL"]
            },
            "options": (function () {
                var i,
                    optionList = {};
                utils.forEach(StorageTypeTable, function (key, value) {
                    optionList[key] = StorageTypeTable[value];
                });

                return optionList;
            }()),
            "event": "StorageTypeChanged",
            "callback": function (setting) {
                event.trigger("StorageTypeChanged", [setting]);
            }
        },
        "capacity": {
            "name": "Capacity",
            "control": {
                "type": "number",
                "value": 16000000000
            },
            "event": "StorageCapacityChanged",
            "callback": function (setting) {
                event.trigger("StorageCapacityChanged", [setting]);
            }
        },
        "availableCapacity": {
            "name": "AvailableCapacity",
            "control": {
                "type": "number",
                "value": 12000000000
            },
            "event": "StorageAvailableCapacityChanged",
            "callback": function (setting) {
                event.trigger("StorageAvailableCapacityChanged", [setting]);
            }
        },
        "isRemoveable": {
            "name": "IsRemoveable",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "event": "StorageIsRemoveableChanged",
            "callback": function (setting) {
                event.trigger("StorageIsRemoveableChanged", [setting]);
            }
        }
    },
    "BUILD": {
        "model": {
            "name": "Model",
            "control": {
                "type": "label",
                "innertext": "tizen-2.0 build",
                "value": "tizen-2.0 build"
            },
            "event": "BuildInfoChanged",
            "callback": function (setting) {
                event.trigger("BuildInfoChanged", [setting]);
            }
        }
    },
    "DISPLAY": {
        "resolutionWidth": {
            "name": "Resolution Width",
            "control": {
                "type": "label",
                "value": 0
            }
        },
        "resolutionHeight": {
            "name": "Resolution Height",
            "control": {
                "type": "label",
                "value": 0
            }
        },
        "dotsPerInchWidth": {
            "name": "DPI-X",
            "control": {
                "type": "label",
                "value": 0
            }
        },
        "dotsPerInchHeight": {
            "name": "DPI-Y",
            "control": {
                "type": "label",
                "value": 0
            }
        },
        "physicalWidth": {
            "name": "Physical Width",
            "control": {
                "type": "label",
                "value": 0
            }
        },
        "physicalHeight": {
            "name": "Physical Height",
            "control": {
                "type": "label",
                "value": 0
            }
        },
        "brightness": {
            "name": "Brightness",
            "control": {
                "type": "number",
                "value": 0.8,
            },
            "event": "DisplayBrightnessChanged",
            "callback": function (setting) {
                event.trigger("DisplayBrightnessChanged", [setting]);
            }
        }
    },
    "NETWORK": {
        "networkType": {
            "name": "Network Type",
            "control" : {
                "type": "select",
                "value": NetworkTypeTable["NONE"]
            },
            "options": (function () {
                var i,
                    optionList = {};
                utils.forEach(NetworkTypeTable, function (key, value) {
                    optionList[key] = NetworkTypeTable[value];
                });

                return optionList;
            }()),
            "event": "NetworkTypeChanged",
            "callback": function (setting) {
                event.trigger("NetworkTypeChanged", [setting]);
            }
        }
    },
    "WIFI_NETWORK": {
        "status": {
            "name": "Status",
            "control": {
                "type": "checkbox",
                "value": false
            },
            "event": "WiFiNetworkStatusChanged",
            "callback": function (setting) {
                event.trigger("WiFiNetworkStatusChanged", [setting]);
            }
        },
        "ssid": {
            "name": "SSID",
            "control": {
                "type": "text",
                "value": "Tizen WiFi"
            },
            "event": "WiFiNetworkSSIDChanged",
            "callback": function (setting) {
                event.trigger("WiFiNetworkSSIDChanged", [setting]);
            }
        },
        "ipAddress": {
            "name": "IP Address",
            "control": {
                "type": "text",
                "value": "192.168.0.1"
            },
            "event": "WiFiNetworkIpAddressChanged",
            "callback": function (setting) {
                event.trigger("WiFiNetworkIpAddressChanged", [setting]);
            }
        },
        "ipv6Address": {
            "name": "IPv6 Address",
            "control": {
                "type": "text",
                "value": "2001:db8:85a3:0:0:0:70:7334"
            },
            "event": "WiFiNetworkIpv6AddressChanged",
            "callback": function (setting) {
                event.trigger("WiFiNetworkIpv6AddressChanged", [setting]);
            }
        },
        "signalStrength": {
            "name": "Signal Strength",
            "control": {
                "type": "select",
                "value": 0
            },
            "options": (function () {
                var i,
                    optionList = {};

                for (i = 0; i <= 10; i++) {
                    optionList[i] = i;
                }

                return optionList;
            }()),
            "event": "WiFiNetworkSignalStrengthChanged",
            "callback": function (setting) {
                event.trigger("WiFiNetworkSignalStrengthChanged", [setting]);
            }
        }
    },
    "CELLULAR_NETWORK": {
        "status": {
            "name": "Status",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "event": "CellularNetworkStatusChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkStatusChanged", [setting]);
            }
        },
        "apn": {
            "name": "APN",
            "control": {
                "type": "text",
                "value": "Tizen"
            },
            "event": "CellularNetworkapnChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkapnChanged", [setting]);
            }
        },
        "ipAddress": {
            "name": "IP Address",
            "control": {
                "type": "text",
                "value": "10.0.2.16"
            },
            "event": "CellularNetworkipAddressChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkipAddressChanged", [setting]);
            }
        },
        "ipv6Address": {
            "name": "IPv6 Address",
            "control": {
                "type": "text",
                "value": "2001:db8:85a3:0:0:0:70:7334"
            },
            "event": "CellularNetworkIpv6AddressChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkIpv6AddressChanged", [setting]);
            }
        },
        "mcc": {
            "name": "MCC",
            "control": {
                "type": "text",
                "value": "460"
            },
            "event": "CellularNetworkmccChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkmccChanged", [setting]);
            }
        },
        "mnc": {
            "name": "MNC",
            "control": {
                "type": "text",
                "value": "0"
            },
            "event": "CellularNetworkmncChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkmncChanged", [setting]);
            }
        },
        "cellId": {
            "name": "Cell ID",
            "control": {
                "type": "text",
                "value": "0"
            },
            "event": "CellularNetworkcellIdChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkcellIdChanged", [setting]);
            }
        },
        "lac": {
            "name": "LAC",
            "control": {
                "type": "text",
                "value": "0"
            },
            "event": "CellularNetworklacChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworklacChanged", [setting]);
            }
        },
        "serviceType": {
            "name": "Service Type",
            "control": {
                "type": "text",
                "value": "INTERNET"
            },
            "event": "CellularNetworkserviceTypeChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkserviceTypeChanged", [setting]);
            }
        },
        "isRoaming": {
            "name": "Roaming",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "event": "CellularNetworkIsInRoamingChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkIsInRoamingChanged", [setting]);
            }
        }
    },
    "SIM": {
        "operatorName": {
            "name": "Operator Name",
            "control": {
                "type": "text",
                "value": "Tizen"
            },
            "event": "SimOperatorNameChanged",
            "callback": function (setting) {
                event.trigger("SimOperatorNameChanged", [setting]);
            }
        },
        "msisdn": {
            "name": "MSISDN",
            "control": {
                "type": "text",
                "value": "088123456789"
            },
            "event": "SimMsisdnChanged",
            "callback": function (setting) {
                event.trigger("SimMsisdnChanged", [setting]);
            }
        },
        "iccid": {
            "name": "ICCID",
            "control": {
                "type": "text",
                "value": "123000MFSSYYGXXXXXXP"
            },
            "event": "SimIccidChanged",
            "callback": function (setting) {
                event.trigger("SimIccidChanged", [setting]);
            }
        },
        "mcc": {
            "name": "MCC",
            "control": {
                "type": "text",
                "value": "460"
            },
            "event": "SimMccChanged",
            "callback": function (setting) {
                event.trigger("SimMccChanged", [setting]);
            }
        },
        "mnc": {
            "name": "MNC",
            "control": {
                "type": "text",
                "value": "0"
            },
            "event": "SimMncChanged",
            "callback": function (setting) {
                event.trigger("SimMncChanged", [setting]);
            }
        },
        "msin": {
            "name": "MSIN",
            "control": {
                "type": "text",
                "value": "H1 H2 H3 S 12345"
            },
            "event": "SimMsinChanged",
            "callback": function (setting) {
                event.trigger("SimMsinChanged", [setting]);
            }
        },
        "spn": {
            "name": "SPN",
            "control": {
                "type": "text",
                "value": "TizenSPN"
            },
            "event": "SimSpnChanged",
            "callback": function (setting) {
                event.trigger("SimSpnChanged", [setting]);
            }
        }
    }
};

