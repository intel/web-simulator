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
            "name": "Cellular Hardware",
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
                "value": "mcc value"
            },
            "event": "CellularNetworkMccChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkMccChanged", [setting]);
            }
        }, 
        "mnc": {
            "name": "mnc",
            "control": {
                "type": "text",
                "value": "mnc value"
            },
            "event": "CellularNetworkMncChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkMncChanged", [setting]);
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
                "value": "operatorName value"
            },
            "event": "CellularNetworkOperatorNameChanged",
            "callback": function (setting) {
                event.trigger("CellularNetworkOperatorNameChanged", [setting]);
            }
        }
    },
    "Device": {
        "imei": {
            "name": "IMEI",
            "control": {
                "type": "text",
                "value": "1000"
            },
            "event": "DeviceIMEIChanged",
            "callback": function (setting) {
                event.trigger("DeviceIMEIChanged", [setting]);
            }
        }, 
        "model": {
            "name": "Model",
            "control": {
                "type": "text",
                "value": "model value"
            },
            "event": "DeviceModelChanged",
            "callback": function (setting) {
                event.trigger("DeviceModelChanged", [setting]);
            }
        }, 
        "version": {
            "name": "Version",
            "control": {
                "type": "text",
                "value": "1.0"
            },
            "event": "DeviceVersionChanged",
            "callback": function (setting) {
                event.trigger("DeviceVersionChanged", [setting]);
            }
        }, 
        "vendor": {
            "name": "Vendor.",
            "control": {
                "type": "text",
                "value": "vendor value"
            },
            "event": "DeviceVendorChanged",
            "callback": function (setting) {
                event.trigger("DeviceVendorChanged", [setting]);
            }
        }
    },
    "Display": {
        "resolutionHeight": {
            "name": "Resolution Height",
            "control": {
                "type": "number",
                "value": 480
            },
            "event": "DisplayResolutionHeightChanged",
            "callback": function (setting) {
                event.trigger("DisplayResolutionHeightChanged", [setting]);
            }
        }, 
        "pixelAspectRatio": {
            "name": "Pixel Aspectratio",
            "control": {
                "type": "number",
                "value": 1.33
            },
            "event": "DisplayPixelAspectRatioChanged",
            "callback": function (setting) {
                event.trigger("DisplayPixelAspectRatioChanged", [setting]);
            }
        }, 
        "dpiY": {
            "name": "DPI-Y",
            "control": {
                "type": "number",
                "value": 72
            },
            "event": "DisplayDpiyChanged",
            "callback": function (setting) {
                event.trigger("DisplayDpiyChanged", [setting]);
            }
        }, 
        "resolutionWidth": {
            "name": "Resolution Width",
            "control": {
                "type": "number",
                "value": 320
            },
            "event": "DisplayResolutionWidthChanged",
            "callback": function (setting) {
                event.trigger("DisplayResolutionWidthChanged", [setting]);
            }
        }, 
        "dpiX": {
            "name": "DPI-X",
            "control": {
                "type": "number",
                "value": 72
            },
            "event": "DisplayDpixChanged",
            "callback": function (setting) {
                event.trigger("DisplayDpixChanged", [setting]);
            }
        }, 
        "colorDepth": {
            "name": "Color Depth",
            "control": {
                "type": "number",
                "value": 32
            },
            "event": "DisplayColorDepthChanged",
            "callback": function (setting) {
                event.trigger("DisplayColorDepthChanged", [setting]);
            }
        }
    },
    "MemoryUnit": {
        "size": {
            "name": "Total Memory",
            "control": {
                "type": "number",
                "value": 262144,
            },
            "event": "MemoryUnitSizeChanged",
            "callback": function (setting) {
                event.trigger("MemoryUnitSizeChanged", [setting]);
            }
        },
        "removable": {
            "name": "Removable",
            "control": {
                "type": "checkbox",
                "value": true
            },
            "event": "MemoryUnitRemovableChanged",
            "callback": function (setting) {
                event.trigger("MemoryUnitRemovableChanged", [setting]);
            }
        },
        "availableSize": {
            "name": "Available Size",
            "control": {
                "type": "number",
                "value": 262144,
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
                "value": "English"
            },
            "event": "OperatingSystemLanguageChanged",
            "callback": function (setting) {
                event.trigger("OperatingSystemLanguageChanged", [setting]);
            }
        }, 
        "version": {
            "name": "Version",
            "control": {
                "type": "text",
                "value": "Operation value"
            },
            "event": "OperatingSystemVersionChanged",
            "callback": function (setting) {
                event.trigger("OperatingSystemVersionChanged", [setting]);
            }
        }, 
        "name": {
            "name": "Name",
            "control": {
                "type": "text",
                "value": "OperatingSystem' name"
            },
            "event": "OperatingSystemNameChanged",
            "callback": function (setting) {
                event.trigger("OperatingSystemNameChanged", [setting]);
            }
        }, 
        "vendor": {
            "name": "Vendor",
            "control": {
                "type": "text",
                "value": "vendor value"
            },
            "event": "OperatingSystemVendorChanged",
            "callback": function (setting) {
                event.trigger("OperatingSystemVendorChanged", [setting]);
            }
        }
    },
    "WebRuntime": {
        "wacVersion": {
            "name": "Web Runtime",
            "control": {
                "type": "text",
                "value": "2.0"
            },
            "event": "WebRuntimeWACVersionChanged",
            "callback": function (setting) {
                event.trigger("WebRuntimeWACVersionChanged", [setting]);
            }
        }, 
        "supportedImageFormats": {
            "name": "Image Formats",
            "control": {
                "type": "text",
                "value": "gif87, gif89, png, jpeg"
            },
            "event": "WebRuntimeSupportedImageFormatsChanged",
            "callback": function (setting) {
                event.trigger("WebRuntimeSupportedImageFormatsChanged", [setting]);
            }
        }, 
        "version": {
            "name": "Version",
            "control": {
                "type": "text",
                "value": "1.0"
            },
            "event": "WebRuntimeVersionChanged",
            "callback": function (setting) {
                event.trigger("WebRuntimeVersionChanged", [setting]);
            }
        }, 
        "name": {
            "name": "Name",
            "control": {
                "type": "text",
                "value": "runtime value"
            },
            "event": "WebRuntimeNameChanged",
            "callback": function (setting) {
                event.trigger("WebRuntimeNameChanged", [setting]);
            }
        }, 
        "vendor": {
            "name": "Vendor",
            "control": {
                "type": "text",
                "value": "vendor value"
            },
            "event": "WebRuntimeVendorChanged",
            "callback": function (setting) {
                event.trigger("WebRuntimeVendorChanged", [setting]);
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
                "value": "2000"
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

