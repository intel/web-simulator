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
        "soundVolume": {
            "name": "Sound Volume",
            "control": {
                "type": "range",
                "value": 100,
                "min": 0,
                "max": 100
            },
            "callback": function (setting) {
                event.trigger("VolumeChanged", [setting]);
            }
        },
        "backlight": {
            "name": "Backlight",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "callback": function (setting) {
                event.trigger("BacklightChanged", [setting]);
            }
        }
    },
    "Battery": {
        "batteryLevel": {
            "name": "Battery Remaining %",
            "control": {
                "type": "select",
                "value": 100
            },
            "options": (function () {
                var i,
                    optionList = {};

                for (i = 0; i <= 100; i += 10) {
                    optionList[i] = i;
                }

                return optionList;
            }()),
            "event": "BatteryLevelChanged",
            "callback": function (setting) {
                event.trigger("BatteryLevelChanged", [setting]);
            }
        },

        "batteryBeingCharged": {
            "name": "Battery Is Charging",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "event": "BatteryBeingChargedChanged",
            "callback": function (setting) {
                event.trigger("BatteryBeingChargedChanged", [setting]);
            }
        },
    },
    "CellularHardware": {
        "status": {
            "name": "status",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "event": "CellularHardwareStatusChanged",
            "callback": function (setting) {
                event.trigger("CellularHardwareStatusChanged", [setting]);
            }
        }
    },
    "CellularNetwork": {
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
        "signalStrength": {
            "name": "Signal Strength",
            "control": {
                "type": "select",
                "value": 100
            },
            "options": (function () {
                var i,
                    optionList = {};

                for (i = 0; i <= 100; i += 10) {
                    optionList[i] = i;
                }

                return optionList;
            }()),
            "event": "CellularNetworkSignalStrengthChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkSignalStrengthChanged", [setting]);
            }
        }, 
        "operatorName": {
            "name": "Operator Name",
            "control": {
                "type": "text",
                "value": "CMCC",
                "readonly": "readonly"
            }
        }
    },
    "Device": {
        "imei": {
            "name": "IMEI",
            "control": {
                "type": "text",
                "value": "860398001689659",
                "readonly": "readonly"
            }
        }, 
        "model": {
            "name": "Model",
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
                "value": "",
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
    "Display": {
        "resolutionHeight": {
            "name": "Resolution Height",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        }, 
        "pixelAspectRatio": {
            "name": "Pixel Aspectratio",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        }, 
        "dpiY": {
            "name": "DPI-Y",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        }, 
        "resolutionWidth": {
            "name": "Resolution Width",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        }, 
        "dpiX": {
            "name": "DPI-X",
            "control": {
                "type": "number",
                "value": 0,
                "readonly": "readonly"
            }
        }, 
        "colorDepth": {
            "name": "Color Depth",
            "control": {
                "type": "number",
                "value": 32,
                "readonly": "readonly"
            }
        }
    },
    "MemoryUnit": {
        "size": {
            "name": "Total Memory",
            "control": {
                "type": "number",
                "value": 262144,
                "readonly": "readonly"
            }
        },
        "removable": {
            "name": "Removable",
            "control": {
                "type": "checkbox",
                "value": true,
                "readonly": "readonly"
            }
        },
        "availableSize": {
            "name": "Available Size",
            "control": {
                "type": "range",
                "value": 16384,
                "min": 0,
                "max": 262144
            },
            "event": "MemoryUnitAvailableSizeChanged",
            "callback": function (setting) {
                event.trigger("MemoryUnitAvailableSizeChanged", [setting]);
            }
        },
    },
    "OperatingSystem": {
        "language": {
            "name": "Language",
            "control": {
                "type": "text",
                "value": "English",
                "readonly": "readonly"
            }
        }, 
        "version": {
            "name": "Version",
            "control": {
                "type": "text",
                "value": "",
                "readonly": "readonly"
            }
        }, 
        "name": {
            "name": "Name",
            "control": {
                "type": "text",
                "value": "",
                "readonly": "readonly"
            }
        }, 
        "vendor": {
            "name": "Vendor",
            "control": {
                "type": "text",
                "value": "",
                "readonly": "readonly"
            }
        }
    },
    "WebRuntime": {
        "wacVersion": {
            "name": "WAC Version",
            "control": {
                "type": "text",
                "value": "2.0",
                "readonly": "readonly"
            }
        }, 
        "supportedImageFormats": {
            "name": "Image Formats",
            "control": {
                "type": "text",
                "value": "gif87, gif89, png, jpeg",
                "readonly": "readonly"
            },
            "event": "WebRuntimeSupportedImageFormatsChanged",
            "callback": function (setting) {
                event.trigger("WebRuntimeSupportedImageFormatsChanged", [setting]);
            }
        }, 
        "version": {
            "name": "Web Runtime Version",
            "control": {
                "type": "text",
                "value": "1.0",
                "readonly": "readonly"
            }
        }, 
        "name": {
            "name": "Web Runtime Name",
            "control": {
                "type": "text",
                "value": "Tizen Web Simulator",
                "readonly": "readonly"
            }
        }, 
        "vendor": {
            "name": "Vendor Name",
            "control": {
                "type": "text",
                "value": "Tizen SDK team",
                "readonly": "readonly"
            }
        }
    },
    "WiFiHardware": {
        "status": {
            "name": "Status",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "event": "WiFiHardwareStatusChanged",
            "callback": function (setting) {
                event.trigger("WiFiHardwareStatusChanged", [setting]);
            }
        }
    },
    "WiFiNetwork": {
        "ssid": {
            "name": "SSID",
            "control": {
                "type": "text",
                "value": "OfficeWLAN"
            },
            "event": "WiFiHardwareSsidChanged",
            "callback": function (setting) {
                event.trigger("WiFiHardwareSsidChanged", [setting]);
            }
        }, 
        "signalStrength": {
            "name": "Signal Strength",
            "control": {
                "type": "select",
                "value": 10
            },
            "options": (function () {
                var i,
                    optionList = {};

                for (i = 0; i <= 10; i++) {
                    optionList[i] = i;
                }

                return optionList;
            }()),
            "event": "WiFiHardwareSignalStrengthChanged",
            "callback": function (setting) {
                event.trigger("WiFiHardwareSignalStrengthChanged", [setting]);
            }
        }, 
        "networkStatus": {
            "name": "Network Status",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "event": "WiFiHardwareNetworkStatusChanged",
            "callback": function (setting) {
                event.trigger("WiFiHardwareNetworkStatusChanged", [setting]);
            }
        }
    }
};

