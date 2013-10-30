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
        dataIndex: 0
    };

function _initializeVehicleSupported() {
    try {
        db.saveObject("bt-simulated-vehicle", vehicledb);

        _initializeVehicleDomEvent();
        _initializeVehicleEvent();
    } catch (e) {
        exception.handle(e, true);
    }
}

function _runVehicleInfo () {
    var time, property, propertyItem, tableString = '', i = 0,
        btVehicleDB = db.retrieveObject("bt-simulated-vehicle");

    _vehicleGlobal.dataIndex = _vehicleGlobal.dataIndex % btVehicleDB.dataCount;

    for (time in btVehicleDB.data) {
        if (i != _vehicleGlobal.dataIndex) {
            i++;
            continue;
        }
        tableString += '<tr><td>Time</td><td>' + time + '</td></tr>';

        _vehicleGlobal.dataIndex++;
        break;
    }

    for (property in btVehicleDB.data[time]) {
        if (btVehicleDB.supported.indexOf(property) == -1) continue;

        for (propertyItem in btVehicleDB.data[time][property]) {
            if (propertyItem == property) {
                tableString += '<tr><td>' + propertyItem + '</td><td>'
                    + btVehicleDB.data[time][property][propertyItem] + '</td></tr>';
            }
            else {
                tableString += '<tr><td>' + property + '->' + propertyItem + '</td><td>'
                    + btVehicleDB.data[time][property][propertyItem] + '</td></tr>';
            }
        }
    }

    jQuery("#vehicle-container table.vehicle-info").html(tableString);
}

function _initializeVehicleDomEvent () {
    var t;

    jQuery("#vehicle-container table.vehicle-check tr").bind("click", function () {
        var els = jQuery(this).find("input"),
            vehicleChecked,
            btVehicleDB;

        if (els.attr("checked")) {
            els.removeAttr("checked");
        }
        else {
            els.attr("checked", "checked");
        }

        vehicleChecked = jQuery("#vehicle-container input:checked");
        btVehicleDB = db.retrieveObject("bt-simulated-vehicle");

        btVehicleDB.supported.length = 0;
        vehicleChecked.each(function (index, els) {
            btVehicleDB.supported.push(els.value);
        });

        db.saveObject("bt-simulated-vehicle", btVehicleDB);
    });

    jQuery("#vehicle-container table.vehicle-check tr").bind("mouseover", function () {
        jQuery(this).attr("style","background-color:#D3D3D3;cursor:pointer;");
    });

    jQuery("#vehicle-container table.vehicle-check tr").bind("mouseout", function () {
        jQuery(this).removeAttr("style");
    });

    jQuery("#vehicle-container #vehicle-run").bind("click", function () {
        this.innerHTML = (this.innerHTML == "Run") ? "Stop" : "Run";

        if (this.innerHTML == "Stop") {
            jQuery("#vehicle-container table.vehicle-info").html('');
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
    event.on("vehicle-supported-properties-request", function () {
        var btVehicleDB = db.retrieveObject("bt-simulated-vehicle");

        event.trigger("vehicle-supported-properties-message", [{supported: btVehicleDB.supported}]);
    });

    event.on("vehicle-history-property-request", function (property, startTime, endTime) {
        var supported, data, value, values = [], status, time,
            btVehicleDB = db.retrieveObject("bt-simulated-vehicle"),
            timeNumber, startTimeNumber, endTimeNumber;

        supported = btVehicleDB.supported;
        data = btVehicleDB.data;

        if (supported.indexOf(property) > -1) {
            for (time in data) {
                timeNumber = (new Date(time)).getTime();
                startTimeNumber = startTime.getTime();
                endTimeNumber = endTime.getTime();
                if (timeNumber >= startTimeNumber && timeNumber <= endTimeNumber
                    && data[time].hasOwnProperty(property)) {
                    value = data[time][property];
                    value.timestamp = time;
                    values.push(value);
                }
            }
            status = true;
        }
        else {
            status = false;
        }

        event.trigger("vehicle-history-property-message", [values, status]);
    });
    event.on("vehicle-get-property-request", function (property) {
        var supported, data, value, status, time,
            btVehicleDB = db.retrieveObject("bt-simulated-vehicle");

        supported = btVehicleDB.supported;
        data = btVehicleDB.data;

        if (supported.indexOf(property) > -1) {
            for (time in data) {
                value = data[time][property];
                value.timestamp = time;
                break;
            }
            status = true;
        }
        else {
            status = false;
        }

        event.trigger("vehicle-get-property-message", [value, status]);
    });
    event.on("vehicle-set-property-request", function (property, value) {
        var supported, data, status, time,
            btVehicleDB = db.retrieveObject("bt-simulated-vehicle");

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

        event.trigger("vehicle-set-property-message", [status]);
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
