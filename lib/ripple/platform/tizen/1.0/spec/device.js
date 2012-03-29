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
var event = require('ripple/event');

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
                "value": true
            },
            "callback": function (setting) {
                event.trigger("LockScreenChanged", [setting]);
            }
        }
    },    
    "Cpu": {
        "load": {
            "name": "load",
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
    "Storage": {
        "units": {
            "name": "units",
            "control": {
                "type": "label",
                "innertext": "INTERNAL",
                "value": "INTERNAL"
            },
        }
    },
    "Display": {
        "resolutionWidth": {
            "name": "Resolution Width",
            "control": {
                "type": "label",
                "innertext": 0,
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
            "name": "brightness",
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
    "Device": {
        "imei": {
            "name": "IMEI",
            "control": {
                "type": "label",
                "value": "352099001761482"
            }
        }, 
        "model": {
            "name": "GT-TIZEN",
            "control": {
                "type": "label",
                "value": ""
            }
        }, 
        "version": {
            "name": "Version",
            "control": {
                "type": "label",
                "value": "TIZEN_1.0"
            }
        }, 
        "vendor": {
            "name": "Vendor.",
            "control": {
                "type": "label",
                "value": ""
            }
        }
    },    
    "WifiNetwork": {
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
    "CellularNetwork": {
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
            "name": "apn",
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
        "mcc": {
            "name": "mcc",
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
            "name": "mnc",
            "control": {
                "type": "text",
                "value": "0"                
            },
            "event": "CellularNetworkmncChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkmncChanged", [setting]);
            }
        }, 
        "cellid": {
            "name": "cellid",
            "control": {
                "type": "text",
                "value": "0"                
            },
            "event": "CellularNetworkcellidChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkcellidChanged", [setting]);
            }
        }, 
        "lac": {
            "name": "lac",
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
            "name": "serviceType",
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
    }
};

