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
    },
    LocaleTable = {
        "eng_USA": "eng_USA",
        "eng_CAN": "eng_CAN",
        "deu_DEU": "deu_DEU",
        "jpn_JPN": "jpn_JPN",
        "zho_CHN": "zho_CHN",
        "UNKNOWN": "UNKNOWN"
    }
    ;

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
                "type": "number",
                "value": 0.1
            },
            "event": "CpuLoadChanged",
            "callback": function (setting) {
                if (setting > 1) setting = 1;
                if (setting < 0) setting = 0;
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
                var optionList = {};
                utils.forEach(StorageTypeTable, function (key, value) {
                    optionList[key] = StorageTypeTable[value];
                });

                return optionList;
            }())
        },
        "capacity": {
            "name": "Capacity",
            "control": {
                "type": "number",
                "value": 16000000000
            }
        },
        "availableCapacity": {
            "name": "AvailableCapacity",
            "control": {
                "type": "number",
                "value": 12000000000
            }
        },
        "isRemovable": {
            "name": "IsRemovable",
            "control": {
                "type": "checkbox",
                "value": true
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
            }
        },
        "manufacturer": {
            "name": "Manufacturer",
            "control": {
                "type": "label",
                "innertext": "Tizen",
                "value": "Tizen"
            }
        }
    },
    "LOCALE": {
        "language": {
            "name": "Language",
            "control": {
                "type": "select",
                "value": LocaleTable["eng_USA"]
            },
            "options": (function () {
                var optionList = {};
                utils.forEach(LocaleTable, function (key, value) {
                    optionList[key] = LocaleTable[value];
                });

                return optionList;
            }())
        },
        "country": {
            "name": "Country",
            "control": {
                "type": "select",
                "value": LocaleTable["eng_USA"]
            },
            "options": (function () {
                var optionList = {};
                utils.forEach(LocaleTable, function (key, value) {
                    optionList[key] = LocaleTable[value];
                });

                return optionList;
            }())
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
                "value": 1
            },
            "event": "DisplayBrightnessChanged",
            "callback": function (setting) {
                if (setting > 1) setting = 1;
                if (setting < 0) setting = 0;
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
                var optionList = {};
                utils.forEach(NetworkTypeTable, function (key, value) {
                    optionList[key] = NetworkTypeTable[value];
                });

                return optionList;
            }())
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
            }
        },
        "ipAddress": {
            "name": "IP Address",
            "control": {
                "type": "text",
                "value": "192.168.0.1"
            }
        },
        "ipv6Address": {
            "name": "IPv6 Address",
            "control": {
                "type": "text",
                "value": "2001:db8:85a3:0:0:0:70:7334"
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
            }())
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
            }
        },
        "ipAddress": {
            "name": "IP Address",
            "control": {
                "type": "text",
                "value": "10.0.2.16"
            }
        },
        "ipv6Address": {
            "name": "IPv6 Address",
            "control": {
                "type": "text",
                "value": "2001:db8:85a3:0:0:0:70:7334"
            }
        },
        "mcc": {
            "name": "MCC",
            "control": {
                "type": "number",
                "value": 460
            }
        },
        "mnc": {
            "name": "MNC",
            "control": {
                "type": "number",
                "value": 0
            }
        },
        "cellId": {
            "name": "Cell ID",
            "control": {
                "type": "number",
                "value": 0
            }
        },
        "lac": {
            "name": "LAC",
            "control": {
                "type": "number",
                "value": 0
            }
        },
        "isRoaming": {
            "name": "Roaming",
            "control": {
                "type": "checkbox",
                "value": true
            }
        },
        "isFlightMode": {
            "name": "Flight Mode",
            "control": {
                "type": "checkbox",
                "value": false
            }
        },
        "imei": {
            "name": "IMEI",
            "control": {
                "type": "text",
                "value": "012417005203000"
            }
        }
    },
    "SIM": {
        "operatorName": {
            "name": "Operator Name",
            "control": {
                "type": "text",
                "value": "Tizen"
            }
        },
        "msisdn": {
            "name": "MSISDN",
            "control": {
                "type": "text",
                "value": "088123456789"
            }
        },
        "iccid": {
            "name": "ICCID",
            "control": {
                "type": "text",
                "value": "123000MFSSYYGXXXXXXP"
            }
        },
        "mcc": {
            "name": "MCC",
            "control": {
                "type": "number",
                "value": 460
            }
        },
        "mnc": {
            "name": "MNC",
            "control": {
                "type": "number",
                "value": 0
            }
        },
        "msin": {
            "name": "MSIN",
            "control": {
                "type": "text",
                "value": "H1 H2 H3 S 12345"
            }
        },
        "spn": {
            "name": "SPN",
            "control": {
                "type": "text",
                "value": "TizenSPN"
            }
        }
    },
    "PERIPHERAL": {
        "isVideoOutputOn": {
            "name": "Video Output",
            "control": {
                "type": "checkbox",
                "value": false
            }
        }
    }
};

