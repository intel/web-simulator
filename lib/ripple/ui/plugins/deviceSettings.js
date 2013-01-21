/*
 *  Copyright 2011 Research In Motion Limited.
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
    constants = require('ripple/constants'),
    deviceSettings = require('ripple/deviceSettings'),
    utils = require('ripple/utils'),
    exception = require('ripple/exception'),
    platform = require('ripple/platform'),
    db = require('ripple/db'),
    _CONST = {
        "CONTENT_CONTAINER_ID": "devicesettings-content-container",
        "UKNOWN_CONTROL_MESSAGE": "Unknown device control type"
    },
    _contentContainer,
    _network_contentContainer,
    _CONTAINER_ID = _CONST.CONTENT_CONTAINER_ID;

function _retrieveDeviceInfo(key) {
    var layout, rtn, deviceInfo = require('ripple/devices').getCurrentDevice();

    switch (key) {
    case "Device.model":
        return deviceInfo.model;
    case "Device.version":
        return deviceInfo.firmware;
    case "Device.vendor":
        return deviceInfo.manufacturer;
    case "DISPLAY.resolutionHeight":
        return deviceInfo.screen.height;
    case "DISPLAY.resolutionWidth":
        return deviceInfo.screen.width;
    case "DISPLAY.pixelAspectRatio":
        return (deviceInfo.screen.width / deviceInfo.screen.height).toFixed(2);

    case "DISPLAY.physicalWidth":
        return Number((deviceInfo.screen.width / deviceInfo.ppi).toFixed(2));
    case "DISPLAY.physicalHeight":
        return Number((deviceInfo.screen.height / deviceInfo.ppi).toFixed(2));
    case "DISPLAY.dpiY":
    case "DISPLAY.dotsPerInchHeight":
        return deviceInfo.ppi;
    case "DISPLAY.dpiX":
    case "DISPLAY.dotsPerInchWidth":
        return deviceInfo.ppi;
    case "OperatingSystem.version":
        return deviceInfo.osVersion;
    case "OperatingSystem.name":
        return deviceInfo.osName;
    case "OperatingSystem.vendor":
        return deviceInfo.manufacturer;
    case "DEVICE_ORIENTATION.status":
        layout = db.retrieve("layout");
        if (layout === null || layout === undefined) {
            layout = deviceInfo.defaultOrientation || "portrait";
        }
        if (layout === "portrait") {
            return "PORTRAIT_PRIMARY";
        } else {
            return "LANDSCAPE_PRIMARY";
        }
        break;
    case "WIFI_NETWORK.status":
    case "CELLULAR_NETWORK.status":
        rtn = deviceSettings.retrieve(key);
        if (rtn === true) {
            return "ON";
        } else {
            return "OFF";
        }
        break;
    default:
        return deviceSettings.retrieve(key);
    }
}

function _retrieveSettingName(type) {

    switch (type) {
    case "CellularHardware":
        return "Cellular Hardware";
    case "CellularNetwork":
        return "Cellular Network";
    case "MemoryUnit":
        return "Memory Unit";
    case "OperatingSystem":
        return "Operating System";
    case "WebRuntime":
        return "Web Runtime";
    case "WiFiHardware":
        return "WiFi Hardware";
    case "WiFiNetwork":
        return "WiFi Network";
    default:
        return type;
    }
}

function _appendSettingNode(labelNode, inputNode, label) {
    var frag = document.createDocumentFragment(),
        rowNode = frag.appendChild(utils.createElement("tr")),
        tempTdNode;

    rowNode.appendChild(utils.createElement("td"))
           .appendChild(labelNode);

    tempTdNode = rowNode.appendChild(utils.createElement("td"));

    if (label) {
        tempTdNode.appendChild(label);
    }

    tempTdNode.appendChild(inputNode);

    return frag;
}

function _buildDOMNode(setting, settingType, key) {
    var settingsNode, tagName, jNode,
        fullKey = settingType + "." + key,
        savedSetting = _retrieveDeviceInfo(fullKey),
        // TODO: move this into Utils (isSet method)
        currentSetting,
        domNode,
        domNodeLabel = null;

    if (fullKey === "WIFI_NETWORK.status" || fullKey === "CELLULAR_NETWORK.status") {
        if (savedSetting === "ON") {
            savedSetting = true;
        } else {
            savedSetting = false;
        }
    }
    currentSetting = (savedSetting || savedSetting === false || savedSetting === "" || savedSetting === 0) ? savedSetting : setting.control.value;

    switch (setting.control.type) {
    case "text":
    case "number":
    case "range":
    case "checkbox":
        tagName = "input";
        break;
    case "textarea":
        tagName = "textarea";
        break;
    case "select":
        tagName = "select";
        break;
    case "label":
        tagName = "label";
        break;
    default:
        exception.raise(exception.types.Application, _CONST.UKNOWN_CONTROL_MESSAGE);
    }

    settingsNode = utils.createElement(tagName, setting.control.type === "select" ? null : setting.control);
    settingsNode.setAttribute("id", "device-settings-" + settingType + "-" + key);

    // TODO: this should really be part of utils.createControl? add element of type "range" with label?
    if (setting.control.type === "range") {
        domNodeLabel = utils.createElement("label", {
            "class": constants.UI.LEFT_RANGE_LABEL_CLASS
        });
    }

    domNode = _appendSettingNode(utils.createElement("span", {"innerText": setting.name, "class": "configure-window-text-label"}), settingsNode, domNodeLabel);

    jNode = jQuery(settingsNode);
    if (tagName !== "label") {
        jNode.addClass(constants.UI.JQUERY_UI_INPUT_CLASSES);
    }

    switch (setting.control.type) {
    case "checkbox":
        jNode.bind("click", function () {
            var checked = this.checked ? true : false;
            deviceSettings.persist(fullKey, checked);
            if (typeof setting.callback === "function") {
                setting.callback(checked);
            }
        });

        if (currentSetting === true) {
            jNode.attr("checked", "checked");
        }

        break;

    case "text":
    case "textarea":
    case "number":
        jNode.val(currentSetting);
        utils.bindAutoSaveEvent(jNode, function () {
            if (setting.control.type === "number") {
                deviceSettings.persist(fullKey, Number(jNode.val()));
            } else {
                deviceSettings.persist(fullKey, jNode.val());
            }

            if (typeof setting.callback === "function") {
                setting.callback(jNode.val());
            }
        });
        break;

    case "label":
        jNode.text(currentSetting);
        break;

    case "select":
    case "range":
        if (setting.control.type === "select") {
            utils.forEach(setting.options,  function (value, option) {
                jNode.append(utils.createElement("option", {
                    "value": option,
                    "innerText": value
                }));
            });
        }
        else {
            if (domNodeLabel) {
                domNodeLabel.innerText = currentSetting;
            }
        }

        jNode.val(currentSetting)
             .bind("change", function () {
                if (setting.control.type === "range" && domNodeLabel) {
                    domNodeLabel.innerText = jQuery(this).val();
                }
                deviceSettings.persist(fullKey, jQuery(this).val());

                if (typeof setting.callback === "function") {
                    setting.callback(jQuery(this).val(), currentSetting);
                }
            }
        );
    }

    // TODO: Brent, do in DeviceSettings on load instead?
    if (currentSetting !== setting.control.value) {
        deviceSettings.register(fullKey, currentSetting);
    }

    return domNode;
}

// goes through current platforms device settings
// adds nodes to panel and binds respective events
// talks to DeviceSettings for persistence
module.exports = {
    initialize: function () {
        var settings;
        _contentContainer = document.getElementById(_CONTAINER_ID);
        _network_contentContainer = document.getElementById("networksettings-content-container");

        settings = platform.current().device;
        utils.forEach(settings, function (settingSection, settingType) {

            var currentTableNode, currentTableNode2, settingNameNode, settingName = _retrieveSettingName(settingType);

            settingNameNode = utils.createElement("h3", { "innerText": settingName });
            settingNameNode.setAttribute("class", "configure-window-session-title");

            if (settingType === 'BUILD' || settingType === 'DEVICE_ORIENTATION' || settingType === 'Config' || settingType === 'CPU' || settingType === 'STORAGE' || settingType === 'DISPLAY' || settingType === 'Device') {
                _contentContainer.appendChild(settingNameNode);
            }
            else {
                _network_contentContainer.appendChild(settingNameNode);
            }

            currentTableNode = utils.createElement("table", {
                "class": constants.UI.PANEL_TABLE_CLASS
            });
            currentTableNode.setAttribute("class", "configure-window-panel-table");
            _contentContainer.appendChild(currentTableNode);


            currentTableNode2 = utils.createElement("table", {
                "class": constants.UI.PANEL_TABLE_CLASS
            });
            currentTableNode2.setAttribute("class", "configure-window-panel-table");
            _network_contentContainer.appendChild(currentTableNode2);

            utils.forEach(settingSection, function (setting, key) {
                if (settingType === 'BUILD' || settingType === 'DEVICE_ORIENTATION' || settingType === 'Config' || settingType === 'CPU' || settingType === 'STORAGE' || settingType === 'DISPLAY' || settingType === 'Device') {
                    currentTableNode.appendChild(_buildDOMNode(setting, settingType, key));
                }
                else {
                    currentTableNode2.appendChild(_buildDOMNode(setting, settingType, key));
                }

                if (setting.callback) {
                    setting.callback(setting.control.value);
                }
            });
        });
        event.on("DisplayBrightnessChanged", function (value) {
            document.getElementById("device-settings-DISPLAY-brightness").value = value;
        });
        event.on("CpuLoadChangedByPower", function (value) {
            document.getElementById("device-settings-CPU-load").value = value;
        });
        event.on("DisplayBrightnessChangedByPower", function (value) {
            document.getElementById("device-settings-DISPLAY-brightness").value = value;
        });
        event.on("WiFiNetworkStatusChanged", function (value) {
            document.getElementById("device-settings-WIFI_NETWORK-status").checked = value;
        });
        event.on("CellularNetworkStatusChanged", function (value) {
            document.getElementById("device-settings-CELLULAR_NETWORK-status").checked = value;
        });
        event.on("LayoutChanged", function (value) {
            if (value === 'portrait') {
                deviceSettings.register("DEVICE_ORIENTATION.status", "PORTRAIT_PRIMARY");
            } else {
                deviceSettings.register("DEVICE_ORIENTATION.status", "LANDSCAPE_PRIMARY");
            }
        });
    }
};
