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
var utils = require('ripple/utils'),
    event = require('ripple/event'),
    db = require('ripple/db'),
    exception = require('ripple/exception'),
    vehiclePanelEngine = require('ripple/platform/ivi/3.0/VehiclePanelEngine').VehiclePanelEngine,
    vehicledb = require('ripple/platform/ivi/3.0/spec/vehicledb'),
    _vehicleGlobal = {
        dataIndex: 0,
        subscribes: {},
        time: null,
        noShow: ["time", "zone", "source"],
        properties: vehicledb.properties,
        status: "stop",
        oldManual: 0
    },
    _t,
    _vehicleGlobalVars = {
        currentAutoStatus: false,
        currentDataIndex: 0,
        timeFlag: null,
        timeInterval: 1000, //ms
        timeCurrent: 0,
        timePrevious: 0,
        timeStart: 0,
        timeHistoryLimit: 60 * 60 * 1000, //ms
        registerListeners: {},
        vehicleCache: {},
        history: {}
    };

function _interceptString (str, length) {
    return str.length > length ? str.substring(0, length) + "...": str;
}

function _setVehicleConfiguration (configuration, currentType) {
    var container = jQuery("#vehicle-container #vehicle-configuration-show"),
        selContainer = jQuery("#vehicle-container #vehicle-configuration-types"),
        current, property, propertyList, item, unit, html = "", i,
        enums, showValue;

    if (currentType !== selContainer.val()) {
        for (i = 0; i < selContainer[0].options.length; i++) {
            if (selContainer[0].options[i].value == currentType) {
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
                '<td class="vehicle-property-value">' +
                showValue +
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

        tempHtml = '<td id="' + property + '-supported-show" ' + 'class="' + className + '" title="' + property + '">' + propertyAbbr + '</td>'

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
        property, propertyItems, item, html = "", unit,
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
                        if (option[optionName] == propertyItems[item].value) {
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
                    '<td class="vehicle-property-label">' + item + unit  + '</td>' +
                    '<td class="vehicle-property-value">' +
                    '<select id="' + property + '-' + item + '-set">' + optionHtml + '</select>' +
                    '</td></tr>';
            }
            else if (propertyItems[item].type === "text") {
                html += '<tr class="vehicle-property-content">' +
                    '<td class="vehicle-property-label">' + item + unit  + '</td>' +
                    '<td class="vehicle-property-value">' +
                    '<input id="' + property + '-' + item + '-set" type="text" value="' + propertyItems[item].value + '" />' +
                    '</td></tr>';
            }
        }
    }

    settingContainer.html(html);
}

function _setVehicleAutoRunning (autoRunning, isFill) {
    var autoContainer = jQuery("#vehicle-container #vehicle-running-show"),
        timeStamp, html = "", unit,  property, propertyItem, value, data,
        showContainer, setContainer;

    timeStamp = (new Date()).getTime();
    data = autoRunning["auto" + _vehicleGlobalVars.currentDataIndex];
    if (!data) {
        _vehicleGlobalVars.currentDataIndex = 0;
        data = autoRunning["auto0"];
    }
    _vehicleGlobalVars.timeCurrent = timeStamp;
    _vehicleGlobalVars.history[timeStamp] = {};

    if (!isFill) {
        _vehicleGlobalVars.timeStart = timeStamp;

        html += '<tr class="vehicle-property-content">' +
            '<td class="vehicle-property-label">Time</td>' +
            '<td class="vehicle-property-value" id="vehicle-time-show">' + timeStamp + '</td></tr>';

        for (property in data) {
            html += '<tr><td colspan="2" class="vehicle-property-header">' + property + '</td></tr>';

            _vehicleGlobalVars.history[timeStamp][property] = {};
            for (propertyItem in data[property]) {
                value = data[property][propertyItem].value;
                unit = vehiclePanelEngine.getPropertyUnit(property, propertyItem);

                if (typeof value === "object") {
                    value = value.join(",");
                }

                html += '<tr class="vehicle-property-content">' +
                    '<td class="vehicle-property-label">' + propertyItem + unit + '</td>' +
                    '<td class="vehicle-property-value vehicle-property-value-auto" id="' + property + '-' + propertyItem + '-show">' + value + '</td>' +
                    '<td class="vehicle-property-value vehicle-property-value-manual">' +
                    '<input type="text" value="' + value +'" id="' + property + '-' + propertyItem + '-set" />' +
                    '</td></tr>';

                _vehicleGlobalVars.history[timeStamp][property][propertyItem] = value;

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
                _vehicleGlobalVars.history[timeStamp][property] = {};

                for (propertyItem in data[property]) {
                    value = data[property][propertyItem].value;

                    showContainer = jQuery("#vehicle-container #vehicle-running-show #" + property + '-' + propertyItem + "-show");
                    setContainer = jQuery("#vehicle-container #vehicle-running-show #" + property + '-' + propertyItem + "-set");

                    if (typeof value === "object") {
                        value = value.join(",");
                    }

                    if (showContainer && setContainer) {
                        showContainer.html(value);
                        setContainer.val(value);

                        _vehicleGlobalVars.history[timeStamp][property][propertyItem] = value;
                    }
                }
            }
        }
        else {
            _vehicleGlobalVars.history[timeStamp] = utils.copy(_vehicleGlobalVars.history[_vehicleGlobalVars.timePrevious]);
        }
        jQuery("#vehicle-container #vehicle-running-show #vehicle-time-show").html(timeStamp);
    }

    for (property in _vehicleGlobalVars.registerListeners) {
        event.trigger("vehicle-subscribe-request", [property, false, 0]);
    }

    _vehicleGlobalVars.timePrevious = timeStamp;
    _saveVehicleData();

    _vehicleGlobalVars.currentDataIndex++;
}

function _formatHistory (historyData) {
    var format = {}, property, name, item;

    for (property in historyData) {
        name = property.split("-")[0];
        item = property.split("-")[1];

        if (!format[name]) {
            format[name] = {};
        }

        format[name][item] = historyData[property];
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
        history = {}, itemKey;

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
        itemKey = item.id.replace("-set", "");
        history[itemKey] = item.value;

        autoRunning.push(item.value);
    });

    if (_vehicleGlobalVars.timeCurrent - _vehicleGlobalVars.timeStart > _vehicleGlobalVars.timeHistoryLimit) {
        delete _vehicleGlobalVars.history[_vehicleGlobalVars.timeStart];
        _vehicleGlobalVars.timeStart += _vehicleGlobalVars.timeInterval;
    }
    _vehicleGlobalVars.history[_vehicleGlobalVars.timeCurrent] = _formatHistory(history);

    vehiclePanelEngine.saveData(supported, currentConfig, setting);
}

function _switchAutoManual (isAuto) {
    var autoContainer = jQuery("#vehicle-container #vehicle-running-show .vehicle-property-value-auto"),
        manualContainer = jQuery("#vehicle-container #vehicle-running-show .vehicle-property-value-manual");

    if (isAuto) {
        autoContainer.show();
        manualContainer.hide();
    }
    else {
        autoContainer.hide();
        manualContainer.show();
    }
}

function _addVehicleDomEventListener () {
    var configSelection = jQuery("#vehicle-container #vehicle-configuration-types"),
        supportedSelection = jQuery("#vehicle-container #vehicle-supported-show td"),
        autoSelection = jQuery("#vehicle-container #vehicle-running-auto");

    configSelection.bind("change", function () {
        var configuration, current,
            domJQuery = jQuery(this);

        configuration = _vehicleGlobalVars.vehicleCache.configurationData;
        current = domJQuery.val();
        _setVehicleConfiguration(configuration, current);
    });

    //add vehicle supported click event
    supportedSelection.bind("click", function () {
        var domJQuery = jQuery(this),
            propertiesSelector = "#vehicle-container #vehicle-supported-hide",
            content, supportedId, inputJQuery, inputCheckedJQuery;

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

        //inputCheckedJQuery = jQuery(propertiesSelector + ":checked");
    });

    //add vehicle auto click event
    autoSelection.bind("click", function () {
        if (_vehicleGlobalVars.currentAutoStatus) {
            _vehicleGlobalVars.currentAutoStatus = false;
        }
        else {
            _vehicleGlobalVars.currentAutoStatus = true;
        }
        _switchAutoManual(_vehicleGlobalVars.currentAutoStatus);

        _vehicleGlobalVars.timeFlag = setInterval(function () {
            _setVehicleAutoRunning(_vehicleGlobalVars.vehicleCache.autoRunningData, true);
        }, _vehicleGlobalVars.timeInterval);
    });
}

function _addVehicleEventListener () {
    event.on("vehicle-subscribe-request", function (property, isRegister, zone) {
        if (isRegister) {
            _vehicleGlobalVars.registerListeners[property] = true;
            return;
        }

        var value, status, time, history,
            propertyObj = {};

        history = _vehicleGlobalVars.history;
        time = _vehicleGlobalVars.timeCurrent;

        value = history[time][property];
        value.time = time;
        status = true;

        propertyObj.val = value;
        propertyObj.supported = status;
        propertyObj.type = property;

        event.trigger("vehicle-subscribe-response", [propertyObj]);
    });

    event.on("vehicle-supported-request", function (supported) {
        supported.properties = _vehicleGlobalVars.vehicleCache.supported;

        return supported;
    });

    event.on("vehicle-set-request", function (propertyObj) {
        try {
        for (var item in propertyObj.value) {
            var enterID = propertyObj.type + "-" + item + "-set";
            var enterContainer = jQuery("##vehicle-container #" + enterID);

            enterContainer.val(propertyObj.value[item]);
            event.trigger("vehicle-subscribe-request", [propertyObj.type, false, 0]);
        }
        }
        catch (err) {
            propertyObj.error = true;
        }
    });

    event.on("vehicle-get-request", function (propertyObj) {
        propertyObj.property = _vehicleGlobalVars.history[_vehicleGlobalVars.timeCurrent][propertyObj.type];

        return propertyObj;
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
            autoRunning, autoRunningData;

        configuration = vehiclePanelEngine.getConfiguration();
        current = vehiclePanelEngine.getCurrentConfiguration();
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
        autoRunningData = vehiclePanelEngine.getAutoRunningData();
        _vehicleGlobalVars.vehicleCache.autoRunningData = autoRunning;
        _setVehicleAutoRunning(autoRunning, false);

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

/*function _trimString (str, length) {
    return str.length > length ? str.substring(0, length) + "...": str;
}

function _getPropertyUnit (property) {
    var propertyUnits = {
        "VehicleSpeed-vehicleSpeed": "KPH",
        "EngineSpeed-engineSpeed": "RPM",
        "TripMeter-tripMeters": "[M,...]",
        "CruiseControlStatus-speed": "KPH",
        "Fuel-level": "%",
        "Fuel-instantConsumption": "ML/S",
        "Fuel-instantEconomy": "KM/L",
        "Fuel-averageEconomy": "KM/L",
        "EngineOil-remaining": "%",
        "EngineOil-temperature": "C",
        "EngineOil-pressure": "KPA",
        "ExteriorBrightness-exteriorBrightness": "LUX",
        "Temperature-interior": "C",
        "Temperature-exterior": "C",
        "HVAC-targetTemperature": "C",
        "Sunroof-openness": "%",
        "Sunroof-tilt": "%",
        "ConvertibleRoof-openness": "%",
        "Size-width": "MM",
        "Size-height": "MM",
        "Size-length": "MM",
        "WheelInformation-frontWheelRadius": "MM",
        "WheelInformation-rearWheelRadius": "MM",
        "WheelInformation-wheelTrack": "MM",
        "Odometer-odometer": "KM",
        "Fluid-transmission": "%",
        "Fluid-brake": "%",
        "Fluid-washer": "%",
        "Battery-voltage": "V",
        "Battery-current": "A",
        "TirePressure-leftFront": "KPA",
        "TirePressure-rightFront": "KPA",
        "TirePressure-leftRear": "KPA",
        "TirePressure-rightRear": "KPA",
        "TireTemperature-leftFront": "C",
        "TireTemperature-rightFront": "C",
        "TireTemperature-leftRear": "C",
        "TireTemperature-rightRear": "C",
        "VehicleTopSpeedLimit-vehicleTopSpeedLimit": "KPH"
    };

    return !propertyUnits[property] ? "" : "(" + propertyUnits[property] + ")";
}

function _initializeVehicleSupported() {
    try {
        db.saveObject("ivi-vehicle-db", vehicledb);

        _inializeConfig();
        _initializeSettingRunning();
        _initializeProperties();
        _setSupportedProperties();
        _initializePropertiesSetting();
        _initializeVehicleDomEvent();
        _initializeVehicleEvent();

        _runVehicleInfo();
        jQuery("#vehicle-container .vehicle-property-auto").hide();
        jQuery("#vehicle-container .vehicle-property-manual").show();

        jQuery(function () {
            var stop = false;
            jQuery("#vehicle-supported-properties h3").click(function (event) {
                if (stop) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    stop = false;
                }
            });
            jQuery("#vehicle-supported-properties").accordion("destroy").accordion({
                header: "> div > h3",
                autoHeight: false
            });
        });
    } catch (e) {
        exception.handle(e, true);
    }
}

function _setAutoPropertyValue () {
    var runInputSelector = "#vehicle-container .vehicle-property-manual input";

    //run set
    jQuery(runInputSelector).bind("change", function () {
		var propertyId = this.id, item,
            btVehicleDB = db.retrieveObject("ivi-vehicle-db"),
            property, type, val, data;

        item = propertyId.split("-");
        property = item[0];
        type = item[1];
        val = this.value;

        if (val.indexOf(",") > -1) {
            val = val.split(",");
        }

        if (btVehicleDB.history[btVehicleDB.now]) {
            data = btVehicleDB.history[btVehicleDB.now];
        }
        else {
            data = btVehicleDB.data[btVehicleDB.now];
        }

        btVehicleDB.history[btVehicleDB.now] = utils.copy(data);

        if (btVehicleDB.history[btVehicleDB.now][property] &&
            btVehicleDB.supported.indexOf(property) > -1) {
            btVehicleDB.history[btVehicleDB.now][property][type] = val;

            btVehicleDB.historyCount++;
            saveVehicleData(btVehicleDB);

            event.trigger("vehicle-db-refresh");

            if (_vehicleGlobal.subscribes[property]) {
                event.trigger("vehicle-subscribe-request", [property, false,
                    btVehicleDB.history[btVehicleDB.now][property].zone]);
            }
        }
    });
}

function saveVehicleData (btVehicleDB) {
    var dataKey;

    if (btVehicleDB.historyCount > 2000) {
        for (dataKey in btVehicleDB.history) {
            delete btVehicleDB.history[dataKey];
            break;
        }
    }

    db.saveObject("ivi-vehicle-db", btVehicleDB);
}

function _initializeProperties () {
    var i, inputHtml = "", tdHtml = "", tdNum = 0,
        inputContainer = jQuery("#vehicle-container #vehicle-supported-types"),
        viewContainer = jQuery("#vehicle-container #vehicle-supported-view"),
        properties = db.retrieveObject("ivi-vehicle-db").properties,
        pro, realPro;

    for (i = 0; i < properties.length; i++) {
        realPro = properties[i];
        pro = _trimString(realPro, 12);

        inputHtml += '<input type="checkbox" id="' + realPro +
            '-supported" name="vehicle-supported" value="' + realPro +
            '" />';
        inputContainer.append(inputHtml);

        if (tdNum % 3 === 0) {
            tdHtml += '<tr><td id="' + realPro + '-view" ' +
                'class="vehicle-unsupported" title="' + realPro + '">' +
                pro + '</td>';
        }
        else if (tdNum % 3 === 1){
            tdHtml += '<td id="' + realPro + '-view" ' +
                'class="vehicle-unsupported" title="' + realPro + '">' +
                pro + '</td>';
        }
        else if (tdNum % 3 === 2){
            tdHtml += '<td id="' + realPro + '-view" ' +
                'class="vehicle-unsupported" title="' + realPro + '">' +
                pro + '</td></tr>';
        }
        tdNum++;
    }
    inputContainer.html(inputHtml);
    viewContainer.html(tdHtml);
}

function _setSupportedProperties () {
    var supported = db.retrieveObject("ivi-vehicle-db").supported, i,
        inputSelector = "#vehicle-container div#vehicle-supported-types input",
        viewSelector = "#vehicle-container table#vehicle-supported-view td",
        inputEls, viewEls;

    for (i = 0; i < supported.length; i++) {
        inputEls = jQuery(inputSelector + "#" + supported[i] + "-supported");
        if (inputEls && inputEls.length > 0) {
            inputEls.attr("checked", "checked");
        }

        viewEls = jQuery(viewSelector + "#" + supported[i] + "-view");
        if (viewEls && viewEls.length > 0) {
            viewEls.removeClass("vehicle-unsupported");
            viewEls.addClass("vehicle-supported");
        }
    }
}

function _makeSettingHtml (settingData) {
    var property, propertyItems, item, viewHtml = "", style,
        optionHtml = "", i, optionName, option, options, attr;

    for (property in settingData) {
        viewHtml += '<tr><td colspan="2" class="vehicle-property-setting-title">' +
            property + '</td></tr>';

        propertyItems = settingData[property];
        for (item in propertyItems) {
            if (propertyItems[item].type === "radio") {
                if (propertyItems[item].default == true) {
                    viewHtml += '<tr><td> ' + item + '</td>' +
                        '<td align="right" class="vehicle-property-setting-set">' +
                        '<input id="' + property + '-' + item + '-set" ' +
                        ' value="true" type="checkbox" checked />' +
                        '<label for="' + property + '-' + item + '-set">' +
                        propertyItems[item].options[0] + '</label>' +
                        '</td></tr>';
                }
                else {
                    viewHtml += '<tr><td> ' + item + '</td>' +
                        '<td align="right" class="vehicle-property-setting-set">' +
                        '<input id="' + property + '-' + item + '-set" ' +
                        ' value="true" type="checkbox" /> ' +
                        '<label for="' + property + '-' + item + '-set">' +
                        propertyItems[item].options[0] + '</label>' +
                        ' </td></tr>';
                }
            }
            else if (propertyItems[item].type === "select") {
                optionHtml = "";
                options = propertyItems[item].options;
                for (i = 0; i < options.length; i++) {
                    option = options[i];
                    for (optionName in option) {
                        if (option[optionName] == propertyItems[item].default) {
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
                viewHtml += '<tr><td> ' + item + '</td>' +
                    '<td class="vehicle-property-setting-set">' +
                    '<select id="' + property + '-' + item + '-set">' +
                    optionHtml + '</select></td></tr>';
            }
            else if (propertyItems[item].type === "text") {
                attr = "";
                style = "";
                if (propertyItems[item].default == null) {
                    attr = "disabled";
                    style = "color: red;";
                }
                viewHtml += '<tr><td style="'+ style +'"> ' + item +
                    _getPropertyUnit(property + '-' + item) + '</td>' +
                    '<td class="vehicle-property-setting-set" title="' +
                    propertyItems[item].title + '">' +
                    '<input id="' + property + '-' + item + '-set" type="text" ' +
                    attr + ' value="' + propertyItems[item].default + '" />' +
                    '</td></tr>';
            }
        }
    }

    return viewHtml;
}


function _initializePropertiesSetting () {
    var btVehicleDB = db.retrieveObject("ivi-vehicle-db"),
        enabledSet = btVehicleDB.enabledSet,
        stopSet = btVehicleDB.stopSet,
        settingSelector = "#vehicle-container div#vehicle-properties-setting",
        viewHtml = "";

    viewHtml += '<table class="vehicle-property-setting">';

    viewHtml += _makeSettingHtml(enabledSet);
    viewHtml += _makeSettingHtml(stopSet);
    viewHtml += '</table>';

    jQuery(settingSelector).html(viewHtml);
}

function _runVehicleInfo () {
    var time, property, propertyItem, tableString = '', i = 0, now, newData,
        btVehicleDB = db.retrieveObject("ivi-vehicle-db"), value, data,
        content = jQuery("#vehicle-container table.vehicle-supported-info");

    _vehicleGlobal.dataIndex = _vehicleGlobal.dataIndex % btVehicleDB.dataCount;

    now = (new Date()).getTime();
    tableString += '<tr style="display: none;"><td align="left">Time</td><td align="right">' + now + '</td></tr>';
    _vehicleGlobal.time = now;

    for (time in btVehicleDB.data) {
        if (i !== _vehicleGlobal.dataIndex) {
            i++;
            continue;
        }
        break;
    }

    data = btVehicleDB.data[time];

    for (property in data) {
        if (btVehicleDB.supported.indexOf(property) === -1) continue;

        if (_vehicleGlobal.subscribes[property]) {
            event.trigger("vehicle-subscribe-request", [property, false,
                btVehicleDB.data[time][property].zone]);
        }

        if (btVehicleDB.enabledSet[property]) continue;
        if (btVehicleDB.stopSet[property]) continue;
        if (btVehicleDB.config[btVehicleDB.config.current][property]) continue;

        tableString += '<tr><td colspan="2" class="vehicle-property-title">' +
            property + '</td></tr>';

        for (propertyItem in data[property]) {
            if (_vehicleGlobal.noShow.indexOf(propertyItem) > -1) continue;
            if (/^[A-Z][A-Z_]+[A-Z0-9]$/.test(propertyItem) &&
                propertyItem !== "WMI" &&
                propertyItem !== "VIN") continue;

            value = btVehicleDB.data[time][property][propertyItem];

            tableString += '<tr><td align="left">' + propertyItem + _getPropertyUnit(property + '-' + propertyItem) +
                '</td><td align="right" class="vehicle-property-auto">' + value +
                '</td><td align="right" class="vehicle-property-manual">' +
                '<input style="text-align: right;" type="text" value="' + value +'" id="' + property + '-' + propertyItem + '-set">' +
                '</td></tr>';
        }
    }

    content.html('');
    content.html(tableString);

    _setAutoPropertyValue();

    newData = utils.copy(btVehicleDB.data[time]);
    btVehicleDB.history[now] = newData;
    btVehicleDB.now = now;
    btVehicleDB.historyCount++;
    saveVehicleData(btVehicleDB);

    event.trigger("vehicle-db-refresh");

    _vehicleGlobal.dataIndex++;
}

function _initializeVehicleDomEvent () {
    var viewSelector = "#vehicle-container #vehicle-supported-view td",
        runSelector = "#vehicle-container #vehicle-run",
        carSelector = "#vehicle-container #vehicle-config-cars",
        searchSelector = "#vehicle-container #vehicle-supported-search",
        setSelector1 = "#vehicle-container .vehicle-property-setting-set select",
        setSelector2 = "#vehicle-container .vehicle-property-setting-set input:checkbox",
        setSelector3 = "#vehicle-container .vehicle-property-setting-set input:text",
        setSelector;

    setSelector = setSelector1 + "," + setSelector2 + "," + setSelector3;

    //add vehicle supported click event
    jQuery(viewSelector).bind("click", function () {
        var content = jQuery(this).html(),
            inputPropertyID = content + "-supported",
            element = jQuery(this),
            vehicleChecked,
            btVehicleDB = db.retrieveObject("ivi-vehicle-db"),
            inputSelector = "#vehicle-container #vehicle-supported-types input";

        if (element.hasClass("vehicle-unsupported")) {
            jQuery(inputSelector + "#" + inputPropertyID).attr("checked", "checked");
            element.removeClass("vehicle-unsupported");
            element.addClass("vehicle-supported");
        }
        else {
            jQuery(inputSelector + "#" + inputPropertyID).removeAttr("checked");
            element.removeClass("vehicle-supported");
            element.addClass("vehicle-unsupported");
        }

        vehicleChecked = jQuery(inputSelector + ":checked");
        btVehicleDB.supported.length = 0;
        vehicleChecked.each(function (index, els) {
            btVehicleDB.supported.push(els.value);
        });

        db.saveObject("ivi-vehicle-db", btVehicleDB);
        event.trigger("vehicle-db-refresh");
    });

    //run
    jQuery(runSelector).bind("click", function () {
        var element = jQuery(this),
            noSetSelector = "#vehicle-container .vehicle-noSet";

        if (element.hasClass("vehicle-unsupported")) {
            element.removeClass("vehicle-unsupported");
            element.addClass("vehicle-supported");

            _vehicleGlobal.status = "run";
            jQuery(noSetSelector).show();

            _t = window.setInterval(function () {
                _runVehicleInfo();
                jQuery("#vehicle-container .vehicle-property-auto").show();
                jQuery("#vehicle-container .vehicle-property-manual").hide();
            }, 2000);
        }
        else {
            element.removeClass("vehicle-supported");
            element.addClass("vehicle-unsupported");

            _vehicleGlobal.status = "stop";
            jQuery(noSetSelector).hide();

            window.clearTimeout(_t);
            jQuery("#vehicle-container .vehicle-property-auto").hide();
            jQuery("#vehicle-container .vehicle-property-manual").show();
        }
    });

    //filter
    jQuery(searchSelector).bind("keyup", function () {
        var filterText = this.value.toLowerCase(), realPro, pro,
            filterProperty, tableString = "", index = 0, i,
            vehicleView = jQuery("#vehicle-container table#vehicle-supported-view");

        vehicleView.html("");

        for (i = 0; i < _vehicleGlobal.properties.length; i++) {
            realPro = _vehicleGlobal.properties[i];
            pro = _trimString(realPro, 12);
            filterProperty = realPro.toLowerCase();

            if (filterProperty.indexOf(filterText) > -1) {
                if (index % 3 === 0) {
                    tableString += '<tr><td id="' + realPro + '-view" ' +
                        'class="vehicle-unsupported" title="' + realPro + '">' +
                        pro + '</td>';
                }
                else if (index % 3 === 1){
                    tableString += '<td id="' + realPro + '-view" ' +
                        'class="vehicle-unsupported" title="' + realPro + '">' +
                        pro + '</td>';
                }
                else if (index % 3 === 2){
                    tableString += '<td id="' + realPro + '-view" ' +
                        'class="vehicle-unsupported" title="' + realPro + '">' +
                        pro + '</td></tr>';
                }
                index++;
            }
        }
        vehicleView.html(tableString);

        _setSupportedProperties();
    });

    //set
    jQuery(setSelector).bind("change", function () {
        var propertyId = this.id, item, dic = false, dicAttr,
            btVehicleDB = db.retrieveObject("ivi-vehicle-db"),
            property, type, val, data, time;

        item = propertyId.split("-");
        property = item[0];
        type = item[1];
        val = this.type && this.type === "checkbox" ?
            (this.checked ? true : false) : this.value;

        if (item.length === 4) {
            dicAttr = item[2];
            dic = true;
        }

        for (time in btVehicleDB.data) {
            if (dic) {
                btVehicleDB.data[time][property][type][dicAttr] = val;
            }
            else {
                btVehicleDB.data[time][property][type] = val;
            }
        }

        if (btVehicleDB.history[btVehicleDB.now]) {
            data = btVehicleDB.history[btVehicleDB.now];
        }
        else {
            data = btVehicleDB.data[btVehicleDB.now];
        }
        btVehicleDB.history[btVehicleDB.now] = utils.copy(data);

        if (btVehicleDB.history[btVehicleDB.now][property] &&
            btVehicleDB.supported.indexOf(property) > -1) {
            if (dic) {
                btVehicleDB.history[btVehicleDB.now][property][type][dicAttr] = val;
            }
            else {
                btVehicleDB.history[btVehicleDB.now][property][type] = val;
            }

            btVehicleDB.historyCount++;
            saveVehicleData(btVehicleDB);
            event.trigger("vehicle-db-refresh");

            if (_vehicleGlobal.subscribes[property]) {
                event.trigger("vehicle-subscribe-request", [property, false,
                    btVehicleDB.history[btVehicleDB.now][property].zone]);
            }
        }
    });

    //car config
    jQuery(carSelector).bind("change", function () {
        var btVehicleDB = db.retrieveObject("ivi-vehicle-db"),
            property, propertyItems, item, viewHtml = "", config,
            configView = jQuery("#vehicle-container #vehicle-config-view"),
            propertyObj, time, data;

        config = btVehicleDB.config[this.value];
        btVehicleDB.config.current = this.value;

        for (property in btVehicleDB.config[btVehicleDB.config.current]) {
            propertyObj = btVehicleDB.config[btVehicleDB.config.current][property];

            for (time in btVehicleDB.data) {
                data = btVehicleDB.data[time];
                data[property] = utils.copy(propertyObj);
            }

            btVehicleDB.history[btVehicleDB.now] = utils.copy(btVehicleDB.data[btVehicleDB.now]);
            btVehicleDB.historyCount++;
        }

        saveVehicleData(btVehicleDB);

        for (property in config) {
            viewHtml += '<tr><td colspan="2" class="vehicle-property-setting-title">' +
                property + '</td></tr>';

            if (_vehicleGlobal.subscribes[property]) {
                event.trigger("vehicle-subscribe-request", [property, false,
                    config[property].zone]);
            }

            propertyItems = config[property];
            for (item in propertyItems) {
                viewHtml += '<tr><td> ' + item + _getPropertyUnit(property + '-' + item) + '</td>' +
                    '<td class="vehicle-property-setting-set">' + propertyItems[item] +
                    '<input id="' + property + '-' + item + '-set" type="hidden" ' +
                    'value="' + propertyItems[item] + '" />' +
                    '</td></tr>';
            }
        }

        configView.html(viewHtml);
    });
}

function _inializeConfig () {
    var btVehicleDB = db.retrieveObject("ivi-vehicle-db"),
        property, propertyItems, item, viewHtml = "", config,
        configView = jQuery("#vehicle-container #vehicle-config-view");

    config = btVehicleDB.config[btVehicleDB.config.current];

    for (property in config) {
        viewHtml += '<tr><td colspan="2" class="vehicle-property-setting-title">' +
            property + '</td></tr>';

        propertyItems = config[property];
        for (item in propertyItems) {
            viewHtml += '<tr><td> ' + item + _getPropertyUnit(property + '-' + item) + '</td>' +
                '<td class="vehicle-property-setting-set">' + propertyItems[item] +
                '<input id="' + property + '-' + item + '-set" type="hidden" ' +
                'value="' + propertyItems[item] + '" />' +
                '</td></tr>';
        }
    }

    configView.html(viewHtml);
}

function _initializeSettingRunning () {
    var btVehicleDB = db.retrieveObject("ivi-vehicle-db"),
        property, propertyObj, time, data, item, propertyItemObj,
        dic = false, dicAttr, dicName;

    for (property in btVehicleDB.enabledSet) {
        propertyObj = btVehicleDB.enabledSet[property];
        propertyItemObj = {};

        for (item in propertyObj) {
            if (item.indexOf("-") > -1) {
                dic = true;
                dicName = item.split("-")[0];
                dicAttr = item.split("-")[1];
                if (!propertyItemObj[dicName]) {
                    propertyItemObj[dicName] = {};
                }
                propertyItemObj[dicName][dicAttr] = propertyObj[item].default;
            }
            else {
                propertyItemObj[item] = propertyObj[item].default;
            }
        }

        for (time in btVehicleDB.data) {
            data = btVehicleDB.data[time];
            data[property] = propertyItemObj;
            data.zone = 0;
        }
    }

    for (property in btVehicleDB.stopSet) {
        propertyObj = btVehicleDB.stopSet[property];
        propertyItemObj = {};

        for (item in propertyObj) {
            propertyItemObj[item] = propertyObj[item].default;
        }

        for (time in btVehicleDB.data) {
            data = btVehicleDB.data[time];
            data[property] = propertyItemObj;
            data.zone = 0;
        }
    }

    for (property in btVehicleDB.config[btVehicleDB.config.current]) {
        propertyObj = btVehicleDB.config[btVehicleDB.config.current][property];
        for (time in btVehicleDB.data) {
            data = btVehicleDB.data[time];
            data[property] = utils.copy(propertyObj);
            data.zone = 0;
        }
    }

    db.saveObject("ivi-vehicle-db", btVehicleDB);
}

function _initializeVehicleEvent () {
    event.on("vehicle-history-request", function (property, zone, startTime, endTime) {
        var supported, data, value, values = [], status, time,
            btVehicleDB = db.retrieveObject("ivi-vehicle-db");

        supported = btVehicleDB.supported;
        data = btVehicleDB.history;

        if (supported.indexOf(property) > -1) {
            for (time in data) {
                if (time >= startTime && time <= endTime &&
                    data[time].hasOwnProperty(property)) {
                    value = data[time][property];
                    value.time = time;
                    values.push(value);
                }
            }
            status = true;
        }
        else {
            status = false;
        }

        event.trigger("vehicle-history-response", [values, status]);
    });

    event.on("vehicle-subscribe-request", function (property, isInitial, zone) {
        if (isInitial) {
            _vehicleGlobal.subscribes[property] = true;
            return;
        }

        var supported, value, status, time, history,
            btVehicleDB = db.retrieveObject("ivi-vehicle-db"),
            propertyObj = {};

        supported = btVehicleDB.supported;
        history = btVehicleDB.history;

        if (supported.indexOf(property) > -1) {
            if (!_vehicleGlobal.time) {
                for (time in history) {
                    _vehicleGlobal.time = time;
                    break;
                }
            }

            value = history[_vehicleGlobal.time][property];
            value.time = _vehicleGlobal.time;
            status = true;
        }
        else {
            status = false;
        }

        propertyObj.val = value;
        propertyObj.supported = status;
        propertyObj.type = property;

        event.trigger("vehicle-subscribe-response", [propertyObj]);
    });
}*/

module.exports = {
    panel: {
        domId: "vehicle-container",
        collapsed: true,
        pane: "right",
        titleName: "Vehicle Information",
        display: true
    },
    initialize: function () {
        //_initializeVehicleSupported();
        _initializeVehiclePanel();
    }
};
