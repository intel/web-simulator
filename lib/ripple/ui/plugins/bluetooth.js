/*
 *  Copyright 2012 Intel Corporation
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
    utils = require('ripple/utils'),
    db = require('ripple/db'),
    powerState = false,
    _discoverProcessId = null,
    _remoteDevs = [],
    _serviceList,
    _textToUUID = {},
    DISCOVER_INTERVAL = 2000;

function _setName(name) {
    document.getElementById("name-status").innerHTML = name;
}

function _setPowerState(state) {
    document.getElementById("power-status").innerHTML = (state ? "Power on" : "Power off");
}

function _setVisibleState(state) {
    document.getElementById("visible-status").innerHTML = (state ? "Visible" : "Not visible");
}

function _discoverDevices(flag) {
    var index = 0;
    
    if (!flag) {
        if (_discoverProcessId) {
            clearInterval(_discoverProcessId);
            _discoverProcessId = null;
        }
    } else {
        _discoverProcessId = setInterval(function () {
            var discoveredDevice = utils.copy(_remoteDevs[index]);
    
            event.trigger("deviceDiscovered", [discoveredDevice]); 
            index++;

            if (index === _remoteDevs.length) {
                clearInterval(_discoverProcessId);
                _discoverProcessId = null;
                event.trigger("discoverFinished", [utils.copy(_remoteDevs)]);
                return;
            }
        });
    }
}

function _updateDeviceList(deviceList) {
    var index, deviceIconURI = './images/bluetooth.png', deviceListHTML = '', deviceItem, connectedStatus, bondedStatus;
    if (!deviceList)
        return;

    _remoteDevs = deviceList;
    for (index = 0; index < deviceList.length; index++) {
        deviceItem = deviceList[index];
        bondedStatus = (deviceItem.isBonded ? 'Bonded, ' : 'Not Bonded, ');
        connectedStatus = (deviceItem.isConnected ? 'Connected, ' : 'Not Connected, ');

        deviceListHTML += '<tr><td>' + deviceItem.name.fontcolor("Red") + '</td>' + '<td><img src="' + deviceIconURI + '"></td></tr>';
        deviceListHTML += '<tr><td>' + bondedStatus + connectedStatus + '</td></tr>';
    }
    document.getElementById("historyDevices").innerHTML = deviceListHTML;
}

function _updateServiceList(serviceList) {
    var options, text;

    if (!serviceList)
       return;

    _serviceList = utils.copy(serviceList);
    _serviceList.forEach(function (item) {
        text = '...' + item.uuid.slice(-12); 
        options += '<option>' + text + '</option>';    
        _textToUUID[text] = item.uuid;
    });

    document.getElementById("services-uuid").innerHTML = options;
}

function _serviceSelectionChange() {
    var index = document.getElementById("services-uuid").value;
    //document.getElementById("bluetooth-send").disabled = _serviceList[index].isConnected;
}

module.exports = {
    panel : {
        domId : "bluetooth-container",
        collapsed : true,
        pane: "left",
        titleName: "Bluetooth",
        display: true
    },

    initialize : function () {
        document.getElementById("services-uuid").onchange = _updateServiceList;
        document.getElementById("incoming-message").onclick = function () {
            var currentText = $("#message-content").val(),
                currentId = _textToUUID[$("#services-uuid").val()];
            event.trigger("remoteDataArrived", [{uuid: currentId, text: currentText}]); 
        };
        event.on("adapterInfo", function (adapter) {
            _setName(adapter.name);
            _setPowerState(adapter.powered);
            _setVisibleState(adapter.visible);
        });
        event.on("historyDevices", _updateDeviceList);
        event.on("nameValue", _setName);
        event.on("powerState", _setPowerState);
        event.on("visibleState", _setVisibleState);
        event.on("discoverDevices", _discoverDevices);
        event.on("historyServices", _updateServiceList);
    }
};
