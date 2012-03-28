/*
 *  Copyright 2012 Intel Corporation.
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

var constants = require('ripple/constants'),
    sensorSettings = require('ripple/sensorSettings'),
    utils = require('ripple/utils'),
    exception = require('ripple/exception'),
    platform = require('ripple/platform'),
    _CONST = {
        "CONTENT_CONTAINER_ID": "sensorsettings-content-container",
        "UKNOWN_CONTROL_MESSAGE": "Unknown sensor control type"
    },
    _contentContainer,
    _CONTAINER_ID = _CONST.CONTENT_CONTAINER_ID;

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
        savedSetting = sensorSettings.retrieve(fullKey),
        // TODO: move this into Utils (isSet method)
        currentSetting = (savedSetting || savedSetting === false || savedSetting === "" || savedSetting === 0) ? savedSetting : setting.control.value,
        domNode,
        domNodeLabel = null;

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
    default:
        exception.raise(exception.types.Application, _CONST.UKNOWN_CONTROL_MESSAGE);
    }

    settingsNode = utils.createElement(tagName, setting.control.type === "select" ? null : setting.control);

    // TODO: this should really be part of utils.createControl? add element of type "range" with label?
    if (setting.control.type === "range") {
        domNodeLabel = utils.createElement("label", {
            "class": constants.UI.LEFT_RANGE_LABEL_CLASS
        });
    }

    domNode = _appendSettingNode(utils.createElement("span", {"innerText": setting.name, "class": constants.UI.TEXT_LABEL_CLASS}), settingsNode, domNodeLabel);

    jNode = jQuery(settingsNode);
    jNode.addClass(constants.UI.JQUERY_UI_INPUT_CLASSES);

    switch (setting.control.type) {
    case "checkbox":
        jNode.bind("click", function () {
            var checked = this.checked ? true : false;
            sensorSettings.persist(fullKey, checked);
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
            sensorSettings.persist(fullKey, jNode.val());
            if (typeof setting.callback === "function") {
                setting.callback(jNode.val());
            }
        });
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
                sensorSettings.persist(fullKey, jQuery(this).val());

                if (typeof setting.callback === "function") {
                    setting.callback(jQuery(this).val());
                }
            }
        );
    }

    // TODO: Brent, do in DeviceSettings on load instead?
    if (currentSetting !== setting.control.value) {
        sensorSettings.register(fullKey, currentSetting);
    }

    return domNode;
}

// goes through current platforms sensor settings
// adds nodes to panel and binds respective events
// talks to SensorSettings for persistence
module.exports = {
    panel: {
        domId: "sensors-panel-container",
        collapsed: true,
        pane: "right"
    },
    initialize: function () {
        var settings;

        _contentContainer = document.getElementById(_CONTAINER_ID);

        settings = platform.current().sensor;

        utils.forEach(settings, function (settingSection, settingType) {

            var currentTableNode, flag = false;
            
            utils.forEach(settingSection, function (setting, key) {
                if (typeof setting === "object") {
                    flag = true;
                    return;
                }
            });

            if (flag) {
                _contentContainer.appendChild(utils.createElement("h3", { "innerText": settingType }));
            }

            currentTableNode = utils.createElement("table", {
                "class": constants.UI.PANEL_TABLE_CLASS
            });

            _contentContainer.appendChild(currentTableNode);

            utils.forEach(settingSection, function (setting, key) {
                if (typeof setting === "object") {
                    currentTableNode.appendChild(_buildDOMNode(setting, settingType, key));
                }

            });
        });
    }
};
