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
    _remoteDevice = {},
    _remoteDevs = [],
    _isBonding;

function _getRemoteDevs() {
    var remoteDevs1,
        remoteDevs2,
        remoteDevs3,
        remoteDevs4,
        remoteDevs5,
        remoteDevs6,
        deviceClass = {
            major : 0x02,
            minor : 0x03,
            services : [0x0010, 0x0100]
        };

    _remoteDevice = {
        name : "remoteBluetooth",
        address : "14:22:33:44:95:68",
        deviceClass : deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : true,
        uuids : ["5bce9431-6d25-32ab-afe0-2ecdra30860"]
    };
    remoteDevs1 = {
        name : "remoteDevs1",
        address : "11:22:33:44:55:66",
        deviceClass : deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : true,
        uuids : ["5bce9431-6c75-32ab-afe0-2ec108a30860"]
    };
    remoteDevs2 = {
        name : "remoteDevs2",
        address : "11:27:36:64:55:66",
        deviceClass : deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : true,
        uuids : ["7bce4566-6c78-90ab-afer-6af108a36789"]
    };
    remoteDevs3 = {
        name : "remoteDevs3",
        address : "12:12:43:47:55:16",
        deviceClass : deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : true,
        uuids : ["84ce4566-6c78-9d3b-afer-6af108a36789"]
    };
    remoteDevs4 = {
        name : "remoteDevs4",
        address : "15:82:43:46:35:62",
        deviceClass : deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : true,
        uuids : ["6c7532ab-afe0-2ec1-08a3-08606c7890ab"]
    };
    remoteDevs5 = {
        name : "remoteDevs5",
        address : "32:23:65:25:55:66",
        deviceClass : deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : true,
        uuids : ["94316c75-32ab-afe0-2ec1-08a30860ce45"]
    };
    remoteDevs6 = {
        name : "remoteDevs6",
        address : "54:29:42:21:55:66",
        deviceClass : deviceClass,
        isBonded : false,
        isTrusted : true,
        isConnected : true,
        uuids : ["32abafe0-4566-6c78-90ab-2ec108a30860"]
    };
    _remoteDevs.push(_remoteDevice);
    _remoteDevs.push(remoteDevs1);
    _remoteDevs.push(remoteDevs2);
    _remoteDevs.push(remoteDevs3);
    _remoteDevs.push(remoteDevs4);
    _remoteDevs.push(remoteDevs5);
    _remoteDevs.push(remoteDevs6);
}

event.on("deviceInit", function (remote) {
    remote.pairedDevice = _remoteDevice;
    remote.devices = _remoteDevs;
});

module.exports = {
    panel : {
        domId : "bluetooth-container",
        collapsed : true,
        pane : "left"
    },

    initialize : function () {
        _getRemoteDevs();

        document.getElementById("accept-bonding").addEventListener("click", function () {
            event.trigger("remoteDevBonded", ["bonding"]);
            document.getElementById("operation-bonding").style.display = "none";
        });

        document.getElementById("cancel-bonding").addEventListener("click", function () {
            if (_isBonding) {
                event.trigger("remoteDevDetached", [_remoteDevice.address]);
            } else {
                event.trigger("remoteDevBonded", ["noBonding"]);
            }
            document.getElementById("operation-bonding").style.display = "none";
            _isBonding = false;
        });

        document.getElementById("bluetooth-send").addEventListener("click", function () {
            var remoteText = document.getElementById("bluetooth-text").value;
            event.trigger("remoteDataArrived", [remoteText]);
        });

        document.getElementById("bluetooth-clear").addEventListener("click", function () {
            document.getElementById("received-data").value = "";
        });

        document.getElementById("bluetooth-away").addEventListener("click", function () {
            var isAway = document.getElementById("bluetooth-away").checked;
            event.trigger("remoteDevAway", [isAway]);
        });

        event.on("bondingCreated", function (localDeviceName) {
            var bondingText = "Give access permission for \"" + localDeviceName + "\"?";
            document.getElementById("bluetooth-operation-label").innerHTML = bondingText;
            document.getElementById("operation-bonding").style.display = "block";
        });

        event.on("bondingSucceeded", function (remote) {
            _isBonding = true;
            document.getElementById("bondPrompt").style.display = "block";
        });

        event.on("bondingDestroyed", function (remote) {
            document.getElementById("bondPrompt").style.display = "none";
            document.getElementById("operation-bonding").style.display = "none";
        });

        event.on("dataArrived", function (receivedData) {
            if (document.getElementById("checkboxRFCOMM").checked)
                document.getElementById("received-data").value = receivedData;
        });
    }
};
