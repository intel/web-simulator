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
    db = require('ripple/db'),
    exception = require('ripple/exception'),
    vehicledb = require('ripple/platform/ivi/2.2/spec/vehicledb'),
    _vehicleGlobal = {
        dataIndex: 0,
        subscribes: {},
        time: null
    };

function _initializeVehicleSupported() {
    try {
        var supported = vehicledb.supported, i,
            inputSelector = "#vehicle-container div#vehicle-supported-types input",
            viewSelector = "#vehicle-container table#vehicle-supported-view td",
            inputEls, viewEls;

        db.saveObject("bt-simulated-vehicle", vehicledb);

        for (i = 0; i < supported.length; i++) {
            inputEls = jQuery(inputSelector + " #" + supported[i] + "-supported");
            inputEls.attr("checked", "checked");

            viewEls = jQuery(viewSelector + "#" + supported[i] + "-view");
            viewEls.removeClass("vehicle-unsupported");
            viewEls.addClass("vehicle-supported");
        }

        _initializeVehicleDomEvent();
        _initializeVehicleEvent();
    } catch (e) {
        exception.handle(e, true);
    }
}

function _runVehicleInfo () {
    var time, property, propertyItem, tableString = '', i = 0,
        btVehicleDB = db.retrieveObject("bt-simulated-vehicle"),
        content = jQuery("#vehicle-container table.vehicle-supported-info");

    _vehicleGlobal.dataIndex = _vehicleGlobal.dataIndex % btVehicleDB.dataCount;

    for (time in btVehicleDB.data) {
        if (i != _vehicleGlobal.dataIndex) {
            i++;
            continue;
        }

        _vehicleGlobal.time = time;
        tableString += '<tr><td align="left">Time</td><td align="right">' + time + '</td></tr>';
        break;
    }

    for (property in btVehicleDB.data[time]) {
        if (btVehicleDB.supported.indexOf(property) == -1) continue;

        tableString += '<tr><td colspan="2" class="vehicle-property-title">'
            + property + '</td></tr>';

        if (_vehicleGlobal.subscribes[property]) {
            event.trigger("vehicle-subscribe-request", [property]);
        }

        for (propertyItem in btVehicleDB.data[time][property]) {
            tableString += '<tr><td align="left">' + propertyItem + '</td><td align="right">'
                + btVehicleDB.data[time][property][propertyItem]
                + '</td></tr>';
        }
    }

    content.html('');
    content.html(tableString);

    _vehicleGlobal.dataIndex++;
}

function _initializeVehicleDomEvent () {
    var t,
        inputSelector = "#vehicle-container div#vehicle-supported-types input",
        viewSelector = "#vehicle-container table#vehicle-supported-view td";

    jQuery(viewSelector).bind("click", function () {
        var content = jQuery(this).html(),
            inputPropertyID = content + "supported",
            element = jQuery(this),
            vehicleChecked,
            btVehicleDB = db.retrieveObject("bt-simulated-vehicle");

        if (element.hasClass("vehicle-unsupported")) {
            jQuery(inputSelector + "#" + inputPropertyID).attr("checked", "checked");
            element.removeClass("vehicle-unsupported")
            element.addClass("vehicle-supported")
        }
        else {
            jQuery(inputSelector + "#" + inputPropertyID).removeAttr("checked");
            element.removeClass("vehicle-supported")
            element.addClass("vehicle-unsupported")
        }

        vehicleChecked = jQuery(inputSelector + ":checked");
        btVehicleDB.supported.length = 0;
        vehicleChecked.each(function (index, els) {
            btVehicleDB.supported.push(els.value);
        });

        db.saveObject("bt-simulated-vehicle", btVehicleDB);
    });

    jQuery("#vehicle-container #vehicle-run").bind("click", function () {
        this.innerHTML = (this.innerHTML == "Run") ? "Stop" : "Run";

        if (this.innerHTML == "Stop") {
            t = window.setInterval(function () {
                _runVehicleInfo();
            }, 2000);
        }
        else {
            window.clearInterval(t);
        }
    });
}

function _initializeVehicleEvent () {
    event.on("vehicle-supported-properties", function (supported) {
        var btVehicleDB = db.retrieveObject("bt-simulated-vehicle");

        supported.types = btVehicleDB.supported;
    });

    event.once("vehicle-history-request", function (property, zone, startTime, endTime) {
        var supported, data, value, values = [], status, time,
            btVehicleDB = db.retrieveObject("bt-simulated-vehicle");

        supported = btVehicleDB.supported;
        data = btVehicleDB.data;

        if (supported.indexOf(property) > -1) {
            for (time in data) {
                if (time >= startTime
                    && time <= endTime
                    && data[time].hasOwnProperty(property)) {
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

    event.on("vehicle-get-property", function (propertyObj) {
        var supported, data, value, status, time,
            property = propertyObj.attr[0],
            btVehicleDB = db.retrieveObject("bt-simulated-vehicle");

        supported = btVehicleDB.supported;
        data = btVehicleDB.data;

        if (supported.indexOf(property) > -1) {
            for (time in data) {
                value = data[time][property];
                value.time = time;
                break;
            }
            status = true;
        }
        else {
            status = false;
        }

        propertyObj.supported = status;
        propertyObj.val = value;
    });

    event.once("vehicle-set-request", function (property, value) {
        var supported, data, status, time,
            btVehicleDB = db.retrieveObject("bt-simulated-vehicle"),

        supported = btVehicleDB.supported;
        data = btVehicleDB.data;

        if (supported.indexOf(property) > -1) {
            for (time in data) {
                data[time][property] = value;
                break;
            }
            status = true;
        }
        else {
            status = false;
        }

        event.trigger("vehicle-set-response", [status]);
    });

    event.on("vehicle-subscribe-request", function (property) {
        var supported, data, value, status, time,
            btVehicleDB = db.retrieveObject("bt-simulated-vehicle"),
            propertyObj = {};

        supported = btVehicleDB.supported;
        data = btVehicleDB.data;

        if (supported.indexOf(property) > -1) {
            if (!_vehicleGlobal.time) {
                for (time in data) {
                    _vehicleGlobal.time = time;
                    break;
                }
            }
            value = data[_vehicleGlobal.time][property];
            value.time = _vehicleGlobal.time;
            status = true;
        }
        else {
            status = false;
        }

        propertyObj.val = value;
        propertyObj.supported = status;
        propertyObj.type = property;

        _vehicleGlobal.subscribes[property] = true;
        event.trigger("vehicle-subscribe-response", [propertyObj]);
    });
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
        _initializeVehicleSupported();
    }
};
