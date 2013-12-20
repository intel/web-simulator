/*
 *  Copyright 2013 Research In Motion Limited.
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
    exception = require('ripple/exception'),
    vehiclePanelEngine = require('ripple/platform/ivi/3.0/VehiclePanelEngine').VehiclePanelEngine,
    _vehicleGlobalVars = {
        currentAutoStatus: false,
        currentDataIndex: 0,
        timeFlag: null,
        timeInterval: 1000, //ms
        timeCurrent: 0,
        timeHistoryArray: [],
        timeHistoryLimit: 60 * 60,
        registerListeners: {},
        vehicleCache: {},
        history: {},
        notShowProperties: [
            "zone", "time", "source"
        ]
    };

function _interceptString (str, length) {
    return str.length > length ? str.substring(0, length) + "...": str;
}

function _setVehicleConfigurationSel (configuration) {
    var selContainer = jQuery("#vehicle-container #vehicle-configuration-types"),
        html = "", i = 0;

    for (var value in configuration) {
        html += '<option value="' + value + '">' +
            'Car ' + i +
            '</option>';

        i++;
    }

    selContainer.html(html);
}

function _setVehicleConfiguration (configuration, currentType) {
    var container = jQuery("#vehicle-container #vehicle-configuration-show"),
        selContainer = jQuery("#vehicle-container #vehicle-configuration-types"),
        current, property, propertyList, item, unit, html = "", i,
        enums, showValue;

    if (currentType !== selContainer.val()) {
        for (i = 0; i < selContainer[0].options.length; i++) {
            if (selContainer[0].options[i].value === currentType) {
                selContainer[0].selectedIndex = i;
                break;
            }
        }
        if (i >= selContainer[0].options.length ) {
            throw "undefined configuration: " + currentType + ".";
        }
    }

    current = configuration[currentType];
    if (!current) {
        throw "undefined configuration: " + currentType + ".";
    }

    for (property in current) {
        html += '<tr><td colspan="2" class="vehicle-property-header">' + property + '</td></tr>';

        propertyList = current[property];
        for (item in propertyList) {
            showValue = propertyList[item];
            unit = vehiclePanelEngine.getPropertyUnit(property, item);
            enums = vehiclePanelEngine.getPropertyConstant(property, item);
            if (enums) {
                showValue = enums["val" + showValue];
            }

            html += '<tr class="vehicle-property-content">' +
                '<td class="vehicle-property-label"> ' + item + unit + '</td>' +
                '<td class="vehicle-property-value" id="' + property + '-' + item + '-show">' + showValue + '</td>' +
                '<td style="display: none;">' +
                '<input id="' + property + '-' + item + '-set" type="hidden" ' + 'value="' + propertyList[item] + '" />' +
                '</td></tr>';
        }
    }

    container.html(html);
    return;
}

function _setVehicleSupported (properties, supported) {
    var hideContainer = jQuery("#vehicle-container #vehicle-supported-hide"),
        showContainer = jQuery("#vehicle-container #vehicle-supported-show"),
        hideHtml = "", showHtml = "", tempHtml, column = 0, columnNum = 3, className,
        i, property, propertyAbbr;

    for (i = 0; i < properties.length; i++) {
        property = properties[i];
        propertyAbbr = _interceptString(property, 12);

        if (supported.indexOf(property) > -1) {
            className = "vehicle-property-supported";
            hideHtml += '<input type="checkbox" id="' + property + '-supported" value="' + property + '" checked="checked" />';
        }
        else {
            className = "vehicle-property-unsupported";
            hideHtml += '<input type="checkbox" id="' + property + '-supported" value="' + property + '" />';
        }

        tempHtml = '<td id="' + property + '-supported-show" ' + 'class="' + className + '" title="' + property + '">' + propertyAbbr + '</td>';

        if (column % columnNum === 0) {
            showHtml += '<tr>' + tempHtml;
        }
        else if (column % columnNum === (columnNum - 1)){
            showHtml += tempHtml + '</tr>';
        }
        else {
            showHtml += tempHtml;
        }
        column++;
    }

    hideContainer.html(hideHtml);
    showContainer.html(showHtml);
}

function _setVehicleSetting (settings) {
    var settingContainer = jQuery("#vehicle-container #vehicle-setting-show"),
        property, propertyItems, item, html = "", unit, range,
        optionHtml = "", i, optionName, option, options;

    for (property in settings) {
        html += '<tr><td colspan="2" class="vehicle-property-header">' + property + '</td></tr>';

        propertyItems = settings[property];
        for (item in propertyItems) {
            unit = vehiclePanelEngine.getPropertyUnit(property, item);

            if (propertyItems[item].type === "radio" || propertyItems[item].type === "select") {
                optionHtml = "";
                options = propertyItems[item].options;
                for (i = 0; i < options.length; i++) {
                    option = options[i];
                    for (optionName in option) {
                        if (option[optionName].toString() === propertyItems[item].value.toString()) {
                            optionHtml += '<option value="' + option[optionName] + '" selected>' +
                                optionName + '</option>';
                        }
                        else {
                            optionHtml += '<option value="' + option[optionName] + '">' +
                                optionName + '</option>';
                        }
                        break;
                    }
                }
                html += '<tr class="vehicle-property-content">' +
                    '<td class="vehicle-property-label" title="' + item + unit  + '">' + _interceptString(item + unit, 18)  + '</td>' +
                    '<td class="vehicle-property-value">' +
                    '<select id="' + property + '-' + item + '-set">' + optionHtml + '</select>' +
                    '</td></tr>';
            }
            else if (propertyItems[item].type === "range") {
                range = vehiclePanelEngine.getPropertyRange(property, item);

                html += '<tr class="vehicle-property-content">' +
                    '<td class="vehicle-property-label" title="' + item + unit  + '">' + _interceptString(item + unit, 18)  + '</td>' +
                    '<td class="vehicle-property-value">' +
                    '<label id="' + property + '-' + item + '-num">' + propertyItems[item].value + '</label>' +
                    '<input id="' + property + '-' + item + '-set" type="range" value="' + propertyItems[item].value + '"' +
                        ' min="' + range[0] + '" max="' + range[1] + '" step="' + range[2] + '" class="vehicle-property-range" />' +
                    '</td></tr>';
            }
            else if (propertyItems[item].type === "text") {
                html += '<tr class="vehicle-property-content">' +
                    '<td class="vehicle-property-label" title="' + item + unit  + '">' + _interceptString(item + unit, 18)  + '</td>' +
                    '<td class="vehicle-property-value">' +
                    '<input id="' + property + '-' + item + '-set" type="text" value="' + propertyItems[item].value + '" />' +
                    '</td></tr>';
            }
        }
    }

    settingContainer.html(html);
}

function _addArrayValueEnter (property, item, value) {
    var itemValue, html = "", i,
        id = property + '-' + item + "-set";

    itemValue = value.split(",");

    if (jQuery("#" + id + "Array") && jQuery("#" + id + "Array").length === 1) {
        html += '<td colspan="3">';
    }
    else {
        html += '<tr id="'+ id + 'Array" class="vehicle-property-array">' +
            '<td colspan="3">';
    }

    if (itemValue.length === 0) {
        html += '<div class="vehicle-property-arrayItem">' +
            '<button>add</button>' +
            '<input type="text" value="0" />' +
            '<button>del</button>' +
            '</div>';
    }
    else {
        for (i = 0; i < itemValue.length; i++) {
            if (i === itemValue.length - 1) {
                html += '<div class="vehicle-property-arrayItem">' +
                    '<button style="margin-left: -60px;">add</button>' +
                    '<input type="text" value="' + itemValue[i] + '" />' +
                    '<button >del</button>' +
                    '</div>';
            }
            else {
                html += '<div class="vehicle-property-arrayItem">' +
                    '<button style="display: none;">add</button>' +
                    '<input type="text" value="' + itemValue[i] + '" />' +
                    '<button >del</button>' +
                    '</div>';
            }
        }
    }

    if (jQuery("#" + id + "Array") && jQuery("#" + id + "Array").length === 1) {
        html += '</td>';

        jQuery("#" + id + "Array").html(html);
    }
    else {
        html += '</td></tr>';

        html += '<tr id="'+ id + 'OK" class="vehicle-property-array">' +
            '<td colspan="3">';
        html += '<button class="vehicle-property-arrayOk">OK</button>';
        html += '</td></tr>';
    }

    return html;
}

function _setVehicleAutoRunning (autoRunning, isFill) {
    var autoContainer = jQuery("#vehicle-container #vehicle-running-show"),
        timeStamp, html = "", unit,  range, property, propertyItem, value, data,
        showContainer, setContainer, valueField, options, option, optionName, i,
        enums, showValue;

    timeStamp = (new Date()).getTime();
    data = autoRunning["auto" + _vehicleGlobalVars.currentDataIndex];
    if (!data) {
        _vehicleGlobalVars.currentDataIndex = 0;
        data = autoRunning["auto0"];
    }
    _vehicleGlobalVars.timeCurrent = timeStamp;

    if (!isFill) {
        html += '<tr class="vehicle-property-content">' +
            '<td class="vehicle-property-label">Time</td>' +
            '<td class="vehicle-property-value" id="vehicle-time-show">' + timeStamp + '</td></tr>';

        for (property in data) {
            html += '<tr><td colspan="2" class="vehicle-property-header">' + property + '</td></tr>';

            for (propertyItem in data[property]) {
                value = data[property][propertyItem].value;
                unit = vehiclePanelEngine.getPropertyUnit(property, propertyItem);

                if (Object.prototype.toString.call(value) === '[object Array]') {
                    value = value.join(",");
                }

                if (data[property][propertyItem].type === "radio" || data[property][propertyItem].type === "select") {
                    valueField = "";
                    options = data[property][propertyItem].options;
                    for (i = 0; i < options.length; i++) {
                        option = options[i];
                        for (optionName in option) {
                            if (option[optionName].toString() === data[property][propertyItem].value) {
                                valueField += '<option value="' + option[optionName] + '" selected>' +
                                    optionName + '</option>';
                            }
                            else {
                                valueField += '<option value="' + option[optionName] + '">' +
                                    optionName + '</option>';
                            }
                            break;
                        }
                    }

                    valueField = '<select id="' + property + '-' + propertyItem + '-set">' + valueField + '</select>';
                }
                else if (data[property][propertyItem].type === "range") {
                    range = vehiclePanelEngine.getPropertyRange(property, propertyItem);

                    valueField = '<label id="' + property + '-' + propertyItem + '-num">' + value + '</label>' +
                        '<input id="' + property + '-' + propertyItem + '-set" type="range" value="' + value + '"' +
                        ' min="' + range[0] + '" max="' + range[1] + '" step="' + range[2] + '" class="vehicle-property-range" />';
                }
                else if (data[property][propertyItem].type === "text") {
                    valueField = '<input type="text" value="' + value +'" id="' + property + '-' + propertyItem + '-set" disabled />';
                }

                enums = vehiclePanelEngine.getPropertyConstant(property, propertyItem);
                if (enums) {
                    showValue = enums["val" + value];
                }

                html += '<tr class="vehicle-property-content">' +
                    '<td class="vehicle-property-label" title="' + propertyItem + unit  + '">' + _interceptString(propertyItem + unit, 18) + '</td>' +
                    '<td class="vehicle-property-value vehicle-property-value-auto" id="' + property + '-' + propertyItem + '-show">' + showValue + '</td>' +
                    '<td class="vehicle-property-value vehicle-property-value-manual">' +
                    valueField +
                    '</td></tr>';

                if (data[property][propertyItem].type === "text") {
                    html += _addArrayValueEnter(property, propertyItem, value);
                }

                if (_vehicleGlobalVars.registerListeners[property]) {
                    event.trigger("vehicle-subscribe-request", [property, false, 0]);
                }
            }
        }

        autoContainer.html(html);
        _switchAutoManual(false);
    }
    else {
        if (_vehicleGlobalVars.currentAutoStatus) {
            for (property in data) {

                for (propertyItem in data[property]) {
                    value = data[property][propertyItem].value;

                    showContainer = jQuery("#vehicle-container #vehicle-running-show #" + property + '-' + propertyItem + "-show");
                    setContainer = jQuery("#vehicle-container #vehicle-running-show #" + property + '-' + propertyItem + "-set");

                    if (Object.prototype.toString.call(value) === '[object Array]') {
                        value = value.join(",");
                    }

                    if (data[property][propertyItem].type === "text") {
                        _addArrayValueEnter(property, propertyItem, value);
                    }

                    if (showContainer && setContainer) {
                        showContainer.html(value);
                        setContainer.val(value);
                    }
                }
            }
        }
        else {
        }
        jQuery("#vehicle-container #vehicle-running-show #vehicle-time-show").html(timeStamp);
    }

    for (property in _vehicleGlobalVars.registerListeners) {
        event.trigger("vehicle-subscribe-request", [property, false, 0]);
    }

    _saveVehicleData();
    _vehicleGlobalVars.currentDataIndex++;
}

function _formatHistory (historyData, time, zone, source) {
    var format = {}, property, name, item, value;

    for (property in historyData) {
        name = property.split("-")[0];
        item = property.split("-")[1];

        if (!format[name]) {
            format[name] = {};
            format[name].time = time;
            format[name].zone = zone;
            format[name].source = source;
        }

        value = historyData[property];
        if (value.indexOf(",") > -1) {
            value = value.split(",");
        }
        if (value === "true") value = true;
        if (value === "false") value = false;

        format[name][item] = value;
    }

    return format;
}

function _saveVehicleData () {
    var configurationContainer = jQuery("#vehicle-container #vehicle-configuration-show *[id$='-set']"),
        currentConfigContainer = jQuery("#vehicle-container #vehicle-configuration-types"),
        settingContainer = jQuery("#vehicle-container #vehicle-setting-show  *[id$='-set']"),
        autoContainer = jQuery("#vehicle-container #vehicle-running-show  *[id$='-set']"),
        supportedContainer = jQuery("#vehicle-container #vehicle-supported-hide  *[id$='-supported']:checked"),
        supported = [], currentConfig, configuration = [], setting = [], autoRunning = [],
        history = {}, itemKey, format, delTime, time, zone, source;

    supportedContainer.each(function (index, item) {
        supported.push(item.value);
    });

    currentConfig = currentConfigContainer.val().replace("configuration", "");

    configurationContainer.each(function (index, item) {
        itemKey = item.id.replace("-set", "");
        history[itemKey] = item.value;

        configuration.push(item.value);
    });

    settingContainer.each(function (index, item) {
        itemKey = item.id.replace("-set", "");
        history[itemKey] = item.value;

        setting.push(item.value);
    });

    autoContainer.each(function (index, item) {
        var value;

        value = item.value;
        if (item.id.indexOf("TripMeter") > -1) {
            value = item.value.split(",");
        }

        itemKey = item.id.replace("-set", "");
        history[itemKey] = value;

        autoRunning.push(value);
    });

    _vehicleGlobalVars.timeHistoryArray.push(_vehicleGlobalVars.timeCurrent);
    if (_vehicleGlobalVars.timeHistoryArray.length > _vehicleGlobalVars.timeHistoryLimit) {
        delTime = _vehicleGlobalVars.timeHistoryArray.shift();
        delete _vehicleGlobalVars.history[delTime];
    }

    time = _vehicleGlobalVars.timeCurrent;
    source = "";
    zone = 0;

    format = _formatHistory(history, time, zone, source);
    _vehicleGlobalVars.history[_vehicleGlobalVars.timeCurrent] = format;
    event.trigger("vehicle-cache-refresh", [supported, format]);

    vehiclePanelEngine.saveData(supported, currentConfig, configuration, setting, autoRunning);
}

function _switchAutoManual (isAuto) {
    var autoContainer = jQuery("#vehicle-container #vehicle-running-show .vehicle-property-value-auto"),
        manualContainer = jQuery("#vehicle-container #vehicle-running-show .vehicle-property-value-manual"),
        arrayContainer = jQuery("#vehicle-container #vehicle-running-show .vehicle-property-array");

    if (isAuto) {
        autoContainer.show();
        manualContainer.hide();
        arrayContainer.hide();
    }
    else {
        autoContainer.hide();
        manualContainer.show();
        arrayContainer.show();
    }
}

function _addVehicleDomEventListener () {
    var configSelection = jQuery("#vehicle-container #vehicle-configuration-types"),
        supportedSelection = jQuery("#vehicle-container #vehicle-supported-show td"),
        autoSelection = jQuery("#vehicle-container #vehicle-running-auto"),
        arraySelection = jQuery("#vehicle-container .vehicle-property-array"),
        arrayOKSelection = jQuery("#vehicle-container .vehicle-property-arrayOk"),
        rangeSelection = jQuery("#vehicle-container input[type='range']");

    arraySelection.delegate("button", "click", function () {
        var els = jQuery(this), appHtml;

        appHtml = '<div class="vehicle-property-arrayItem">' +
            '<button style="margin-left: -60px;">add</button>' +
            '<input type="text" value="0" />' +
            '<button >del</button>' +
            '</div>';

        if (els.html() === "add") {
            jQuery(appHtml).insertAfter(els.parent());
            els.hide();
        }
        else if (els.html() === "del") {
            if (els.parent().prev().length === 0 && els.parent().next().length === 0)
                return;
            els.parent().prev().find("button")[0].style.marginLeft = "-60px";
            els.parent().prev().find("button")[0].style.display = "";
            els.parent().remove();
        }
    });

    arrayOKSelection.click("click", function () {
        var els = jQuery(this), inputEls, i, trEls,
            setElsId, value = [];

        trEls = els.parent().parent();
        setElsId = trEls.attr("id").replace("OK", "");

        inputEls = trEls.prev().find("input");
        for (i = 0; i < inputEls.length; i++)  {
            value.push(inputEls[i].value);
        }

        jQuery("#vehicle-container #" + setElsId).val(value.join(","));
    });

    rangeSelection.bind("change", function () {
        var domJQuery = jQuery(this);

        domJQuery.prev().html(domJQuery.val());
    });

    configSelection.bind("change", function () {
        var configuration, current,
            domJQuery = jQuery(this);

        configuration = _vehicleGlobalVars.vehicleCache.configurationData;
        current = domJQuery.val();
        _setVehicleConfiguration(configuration, current);
    });

    //add vehicle supported click event
    supportedSelection.bind("click", function () {
        var domJQuery = jQuery(this), vehicleChecked,
            propertiesSelector = "#vehicle-container #vehicle-supported-hide",
            content, supportedId, inputJQuery;

        content = domJQuery.html();
        supportedId = content + "-supported";
        inputJQuery = jQuery(propertiesSelector + " #" + supportedId);
        if (domJQuery.hasClass("vehicle-property-unsupported")) {
            inputJQuery.attr("checked", "checked");
            domJQuery.removeClass("vehicle-property-unsupported");
            domJQuery.addClass("vehicle-property-supported");
        }
        else {
            inputJQuery.removeAttr("checked");
            domJQuery.removeClass("vehicle-property-supported");
            domJQuery.addClass("vehicle-property-unsupported");
        }

        vehicleChecked = jQuery("#vehicle-container #vehicle-supported-hide input:checked");
        _vehicleGlobalVars.vehicleCache.supported.length = 0;
        vehicleChecked.each(function (index, els) {
            _vehicleGlobalVars.vehicleCache.supported.push(els.value);
        });
    });

    //add vehicle auto click event
    autoSelection.bind("click", function () {
        if (_vehicleGlobalVars.currentAutoStatus) {
            _vehicleGlobalVars.currentAutoStatus = false;
            jQuery("#vehicle-container #vehicle-configuration-noOperation").hide();
            jQuery("#vehicle-container #vehicle-supported-noOperation").hide();
        }
        else {
            _vehicleGlobalVars.currentAutoStatus = true;
            jQuery("#vehicle-container #vehicle-configuration-noOperation").show();
            jQuery("#vehicle-container #vehicle-supported-noOperation").show();
        }
        _switchAutoManual(_vehicleGlobalVars.currentAutoStatus);

        _vehicleGlobalVars.timeFlag = setInterval(function () {
            _setVehicleAutoRunning(_vehicleGlobalVars.vehicleCache.autoRunningData, true);
        }, _vehicleGlobalVars.timeInterval);
    });
}

function _addVehicleEventListener () {
    event.once("vehicle-cache-request", function (data) {
        data.supported = _vehicleGlobalVars.vehicleCache.supported;
        data.data = _vehicleGlobalVars.history[_vehicleGlobalVars.timeCurrent];
    });

    event.on("vehicle-subscribe-request", function (property, isRegister, zone) {
        if (isRegister) {
            _vehicleGlobalVars.registerListeners[property] = true;
            return;
        }

        var value, status, time, history,
            propertyObj = {};

        if (_vehicleGlobalVars.vehicleCache.supported.indexOf(property) === -1) {
            propertyObj.val = null;
            propertyObj.supported = false;
            propertyObj.type = property;
        }
        else {
            history = _vehicleGlobalVars.history;
            time = _vehicleGlobalVars.timeCurrent;

            value = history[time][property];
            value.time = time;
            status = true;

            propertyObj.val = value;
            propertyObj.supported = status;
            propertyObj.type = property;
        }

        event.trigger("vehicle-subscribe-response", [propertyObj]);
    });

    event.on("vehicle-set-request", function (property, value) {
        var status = true, enums, showValue;

        for (var item in value) {
            var enterID = property + "-" + item + "-set";
            var showID = property + "-" + item + "-show";
            var enterContainer = jQuery("#vehicle-container #" + enterID);
            var showContainer = jQuery("#vehicle-container #" + showID);

            if (Object.prototype.toString.call(value[item]) === '[object Array]') {
                enterContainer.val(value[item].join(","));
            }
            else {
                enterContainer.val(value[item].toString());
            }
            if (showContainer) {
                enums = vehiclePanelEngine.getPropertyConstant(property, item);
                showValue = value[item];
                if (enums) {
                    showValue = enums["val" + value[item]];
                }
                showContainer.html(showValue);
            }
        }

        event.trigger("vehicle-set-response", [status]);
    });

    event.on("vehicle-history-request", function (property, zone, startTime, endTime) {
        var history, historyResponse = [], obj, status, time;

        history = _vehicleGlobalVars.history;

        for (time in history) {
            if (time >= startTime && time <= endTime &&
                history[time].hasOwnProperty(property)) {
                obj = history[time][property];
                obj.time = time;
                historyResponse.push(obj);
            }
        }
        status = true;

        event.trigger("vehicle-history-response", [historyResponse, status]);
    });
}

function _initializeVehiclePanel () {
    try {
        var stop = false,
            configuration, current, properties, supported, settings,
            autoRunning;

        _vehicleGlobalVars.timeHistoryArray = [];

        configuration = vehiclePanelEngine.getConfiguration();
        current = vehiclePanelEngine.getCurrentConfiguration();
        _setVehicleConfigurationSel(configuration);
        _vehicleGlobalVars.vehicleCache.configurationData = configuration;
        _vehicleGlobalVars.vehicleCache.currentConfiguration = current;
        _setVehicleConfiguration(configuration, current);

        properties = vehiclePanelEngine.getProperties();
        supported = vehiclePanelEngine.getSupported();
        _vehicleGlobalVars.vehicleCache.properties = properties;
        _vehicleGlobalVars.vehicleCache.supported = supported;
        _setVehicleSupported(properties, supported);

        settings = vehiclePanelEngine.getSettings();
        _vehicleGlobalVars.vehicleCache.settingData = settings;
        _setVehicleSetting(settings);

        autoRunning = vehiclePanelEngine.getAutoRunning();
        _vehicleGlobalVars.vehicleCache.autoRunningData = autoRunning;
        _setVehicleAutoRunning(autoRunning, false);
        _vehicleGlobalVars.currentDataIndex = 0;

        _vehicleGlobalVars.timeFlag = setInterval(function () {
            _setVehicleAutoRunning(_vehicleGlobalVars.vehicleCache.autoRunningData, true);
        }, _vehicleGlobalVars.timeInterval);

        _addVehicleDomEventListener();

        _addVehicleEventListener();

        jQuery("#vehicle-properties h3").click(function (event) {
            if (stop) {
                event.stopImmediatePropagation();
                event.preventDefault();
                stop = false;
            }
        });
        jQuery("#vehicle-properties").accordion("destroy").accordion({
            header: "> div > h3",
            autoHeight: false
        });
    } catch (e) {
        exception.handle(e, true);
    }
}

module.exports = {
    panel: {
        domId: "vehicle-container",
        collapsed: true,
        pane: "right",
        titleName: "Vehicle Information",
        display: true
    },
    initialize: function () {
        _initializeVehiclePanel();
    }
};
