/*
 *  Copyright 2014 Intel Corporation
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
    _data = {
        TIMEOUT: 50,
        peerAgent: null,
        agentId: "",
        t: null,
        count: 0
    };

function _disableWearableRequest(val) {
    jQuery("#sap-service-connection-accept")[0].disabled = val;
    jQuery("#sap-service-connection-reject")[0].disabled = val;
}

function _startWearableRequest() {
    _data.t = window.setInterval(function () {
        _data.count++;

        jQuery("#sap-service-connection-request p").fadeOut(100).fadeIn(100);
        
        if (_data.count > _data.TIMEOUT) {
            _stopWearableRequest();
        }
    }, 200);
    _disableWearableRequest("");
}

function _stopWearableRequest() {
    _data.count = 0;
    window.clearInterval(_data.t);
    _disableWearableRequest("disabled");

    if (_data.count > _data.TIMEOUT) {
        event.trigger("wearable-service-connection-response", 
                    [_data.agentId, _data.peerAgent, "PEERAGENT_NO_RESPONSE"]);
    }
}

function _initialize() {
    jQuery("#sap-device-attach").bind("click", function () {
        var type = jQuery("#sap-transport").val(),
            status = jQuery("#sap-device-attach").text();

        if (status === "Attach") {
            status = "ATTACHED";
            jQuery("#sap-device-attach").text("Detach");
        }
        else {
            status = "DETACHED";
            jQuery("#sap-device-attach").text("Attach");
        }
        event.trigger("wearableDeviceStatusChanged", [type, status]);
    });

    jQuery("#sap-service-connection-accept").bind("click", function () {
        if (_data.agentId !== "") {
            jQuery("#sap-service-connection-request p")
                    .html("Accept requesting.");

            event.trigger("wearableServiceConnected", 
                    [_data.agentId, _data.peerAgent, "OK"]);
        }
        _stopWearableRequest();
    });

    jQuery("#sap-service-connection-reject").bind("click", function () {
        var status = jQuery("#sap-service-connection-request input").val();

        if (status !== "") {
            jQuery("#sap-service-connection-request p")
                    .html("Reject requesting.");

            event.trigger("wearableServiceConnected", 
                    [_data.agentId, _data.peerAgent, "PEERAGENT_REJECTED"]);

            _data.peerAgent = null;
            _data.agentId = "";
        }
        _stopWearableRequest();
    });

    jQuery("#sap-android-service-connection-requests").bind("click", function () {
        jQuery("#sap-android-service-connection-request p")
                .html("Request connection: " + _data.peerAgent.appName + ".");

        event.trigger("wearableRemoteServiceRequested", [_data.agentId,
                _data.peerAgent]);
    });

    jQuery("#sap-host-gear-data-send").bind("click", function () {
        var data = jQuery("#sap-host-gear-data-sending").val();

        event.trigger("wearableRemoteSocketDataSent", [_data.peerAgent, 0, data]);
    });

    jQuery("#sap-host-gear-file-send").bind("click", function () {
        var localPath = jQuery("#sap-host-gear-file-sending").val();
        event.trigger("wearableRemoteFileTransfered", [0, localPath]);
    });
}

module.exports = {
    panel: {
        domId: "sap-container",
        collapsed: true,
        pane: "right",
        titleName: "SAP Service",
        display: true
    },
    initialize: function () {
        _initialize();
        _disableWearableRequest("disabled");

        event.on("wearablePeerAgentsSimulated", function (peerAgents) {
            var html = "";

            utils.forEach(peerAgents, function (item) {
                var _appPeerAgentInfo = jQuery("#sap-host-app-info").html();

                html += _appPeerAgentInfo.replace(/#appName/g, item.appName)
                    .replace(/#peerId/g, item.peerId)
                    .replace(/#maxAllowedDataSize/g, item.maxAllowedDataSize)
                    .replace(/#profileVersion/g, item.profileVersion)
                    .replace(/#deviceAddress/g, item.peerAccessory.deviceAddress)
                    .replace(/#deviceName/g, item.peerAccessory.deviceName)
                    .replace(/#productId/g, item.peerAccessory.productId)
                    .replace(/#transportType/g, item.peerAccessory.transportType)
                    .replace(/#vendorId/g, item.peerAccessory.vendorId);
            });

            jQuery("#sap-host-app-info").html(html);
        });

        event.on("wearableServiceRequested", function (agentId, peerAgent) {
            var requestMsg = "Request connection: " + peerAgent.appName + ".";

            if (_data.agentId === agentId && _data.peerAgent) {
                event.trigger("wearable-service-connection-response", 
                            [agentId, peerAgent, "ALREADY_EXIST"]);
                return;
            }

            jQuery("#sap-service-connection-request p").html(requestMsg);

            _data.peerAgent = peerAgent;
            _data.agentId = agentId;
            _startWearableRequest();
        });

        event.on("wearableRemoteServiceConnected", function (status, peerAgent) {
            var requestMsg = "Accept Connecting " + peerAgent.appName;

            if (!status) {
                requestMsg = "Reject connecting " + peerAgent.appName;
            }
            jQuery("#sap-android-service-connection-request p").html(requestMsg);
        });

        event.on("wearableSocketDataSent", function (iSecure, channelId, data) {
            var msg = "[#CHANNELID#ISENCRYPTED]: #DATA";
            msg = msg.replace("#CHANNELID", channelId)
                .replace("#ISENCRYPTED", iSecure ? ", Encrypted" : "")
                .replace("#DATA", data);
            jQuery("#sap-gear-host-data-receiving").html(msg);
        });

        event.on("wearableFileTransfered", function (peerAgent, filePath) {
            jQuery("#sap-gear-host-file-receiving").html(filePath);

            event.trigger("wearableFileTransferCompleted", [0, filePath]);
        });
    }
};
