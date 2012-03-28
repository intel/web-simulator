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
    "Power": {
        "level": {
            "name": "Battery Remaining %",
            "control": {
                "type": "select",
                "value": 100
            },
            "options": (function () {
                var i, optionList = {};

                for (i = 0; i <= 100; i += 10) {
                    optionList[i] = i;
                }

                return optionList;
            }()),
            "event": "PowerLevelChanged",
            "callback": function (setting) {
                event.trigger("PowerLevelChanged", [setting]);
            }
        },
        "isCharging": {
            "name": "Battery Is Charging",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "event": "PowerBeingChargedChanged",
            "callback": function (setting) {
                event.trigger("PowerBeingChargedChanged", [setting]);
            }
        },
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
                "type": "text",
                "value": "INTERNAL",
                "readonly": "readonly"
            },
        }
    },
    "Display": {
        "resolutionWidth": {
            "name": "Resolution Width",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        }, 
        "resolutionHeight": {
            "name": "Resolution Height",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        },     
        "dotsPerInchWidth": {
            "name": "DPI-X",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        },     
        "dotsPerInchHeight": {
            "name": "DPI-Y",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        },                 
        "physicalWidth": {
            "name": "Physical Width",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        },
        "physicalHeight": {
            "name": "Physical Height",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
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
                "type": "text",
                "value": "352099001761482",
                "readonly": "readonly"
            }
        }, 
        "model": {
            "name": "GT-TIZEN",
            "control": {
                "type": "text",
                "value": "",
                "readonly": "readonly"
            }
        }, 
        "version": {
            "name": "Version",
            "control": {
                "type": "text",
                "value": "TIZEN_emul_20111229_1",
                "readonly": "readonly"
            }
        }, 
        "vendor": {
            "name": "Vendor.",
            "control": {
                "type": "text",
                "value": "",
                "readonly": "readonly"
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
                "value": "",
                "readonly": "readonly"
            }
        }, 
        "ipAddress": {
            "name": "IP Address",
            "control": {
                "type": "text",
                "value": "",
                "readonly": "readonly"
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
                "value": "",
                "readonly": "readonly"
            }
        },
        "ipAddress": {
            "name": "IP Address",
            "control": {
                "type": "text",
                "value": "10.0.2.16",
                "readonly": "readonly"
            }
        },         
        "mcc": {
            "name": "mcc",
            "control": {
                "type": "text",
                "value": "460",
                "readonly": "readonly"
            }
        }, 
        "mnc": {
            "name": "mnc",
            "control": {
                "type": "text",
                "value": "0",
                "readonly": "readonly"
            }
        }, 
        "cellid": {
            "name": "cellid",
            "control": {
                "type": "text",
                "value": "0",
                "readonly": "readonly"
            }
        }, 
        "lac": {
            "name": "lac",
            "control": {
                "type": "text",
                "value": "0",
                "readonly": "readonly"
            }
        }, 
        "serviceType": {
            "name": "serviceType",
            "control": {
                "type": "text",
                "value": "",
                "readonly": "readonly"
            }
        }, 
        "isInRoaming": {
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

