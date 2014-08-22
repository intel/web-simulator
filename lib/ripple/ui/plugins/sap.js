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
        TIMEOUT: 100,
        peerAgent: null,
        remotePeerAgent: null,
        agentId: "",
        remoteAgentId: "",
        t: null,
        count: 0
    };

function _disableWearableRequest(val) {
    if (val !== "") {
        jQuery("#sap-service-connection-accept, #sap-service-connection-reject").attr("disabled", val);
    }
    else {
        jQuery("#sap-service-connection-accept, #sap-service-connection-reject").removeAttr("disabled", val);
    }
}

function _loadWearablePanel() {
    _disableWearableRequest("disabled");
    jQuery("#sap-host-gear-sending").attr("disabled", "disabled");
    jQuery("#sap-android-service-connection-requests").removeAttr("disabled");
}

function _startWearableRequest() {
    _data.t = window.setInterval(function () {
        _data.count++;

        jQuery("#sap-service-connection-request p.messaging").fadeOut(100).fadeIn(100);
        
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
    jQuery("#sap-sending-receiving").tabs();

    jQuery("#sap-device-detach").bind("click", function () {
        var type = jQuery("#sap-transport").val();

            jQuery("#sap-device-detach").attr("disabled", "disabled");
            jQuery("#sap-host-app").hide();
            _loadWearablePanel();

        event.trigger("wearableDeviceDetached", [type, "DETACHED"]);
    });

    jQuery("#sap-service-connection-accept").bind("click", function () {
        if (_data.agentId !== "") {
            jQuery("#sap-service-connection-request p.messaging")
                    .html("Accept requesting.");

            event.trigger("wearableServiceConnected", 
                    [_data.agentId, _data.peerAgent, "OK"]);
        }
        _stopWearableRequest();
        jQuery("#sap-host-gear-sending").removeAttr("disabled");
        jQuery("#sap-android-service-connection-requests").attr("disabled", "disabled");
    });

    jQuery("#sap-service-connection-reject").bind("click", function () {
        var status = jQuery("#sap-service-connection-request input").val();

        if (status !== "") {
            jQuery("#sap-service-connection-request p.messaging")
                    .html("Reject requesting.");

            event.trigger("wearableServiceConnected", 
                    [_data.agentId, _data.peerAgent, "PEERAGENT_REJECTED"]);

            _data.peerAgent = null;
            _data.agentId = "";
        }
        _stopWearableRequest();
    });

    jQuery("#sap-android-service-connection-requests").bind("click", function () {
        jQuery("#sap-android-service-connection-request p.messaging")
                .html("Request connection: " + _data.remotePeerAgent.appName + ".");

        event.trigger("wearableRemoteServiceRequested", [_data.remoteAgentId,
                _data.remotePeerAgent]);
    });

    jQuery("#sap-host-gear-sending").bind("click", function () {
        var data = jQuery("#sap-host-gear-data-sending").val(),
            localPath = jQuery("#sap-host-gear-file-sending").val(),
            checked = jQuery("input[name='sap-send']:checked");

        if (checked.val() === "1")
            event.trigger("wearableRemoteSocketDataSent", [_data.peerAgent, 0, data.trim()]);
        if (checked.val() === "2")
            event.trigger("wearableRemoteFileTransfered", [0, localPath.trim()]);
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
        _loadWearablePanel();

        event.on("wearableSAAgentsValid", function (ids) {
            _data.remoteAgentId = ids[0];
        });

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

                _data.remotePeerAgent = item;
            });

            jQuery("#sap-host-app-info").html(html);
        });

        event.on("wearableDeviceAttached", function () {
            jQuery("#sap-host-app").show();
            jQuery("#sap-device-detach").removeAttr("disabled");
        });

        event.on("wearableServiceRequested", function (agentId, peerAgent) {
            var requestMsg = "Request connection: " + peerAgent.appName + ".";

            if (_data.agentId === agentId && _data.peerAgent) {
                event.trigger("wearable-service-connection-response", 
                            [agentId, peerAgent, "ALREADY_EXIST"]);
                return;
            }

            jQuery("#sap-service-connection-request p.messaging").html(requestMsg);

            _data.peerAgent = peerAgent;
            _data.agentId = agentId;
            _startWearableRequest();
        });

        event.on("wearableRemoteServiceConnected", function (status, peerAgent) {
            var requestMsg = "Accept Connecting " + peerAgent.appName;

            if (!status) {
                requestMsg = "Reject connecting " + peerAgent.appName;
            }
            else {
                _disableWearableRequest("disabled");
                jQuery("#sap-host-gear-sending").removeAttr("disabled");
                jQuery("#sap-android-service-connection-requests").attr("disabled", "disabled");
            }
            jQuery("#sap-android-service-connection-request p.messaging").html(requestMsg);
        });

        event.on("wearableSocketDataSent", function (iSecure, channelId, data) {
            var msg = "[#CHANNELID#ISENCRYPTED]: #DATA";
            msg = msg.replace("#CHANNELID", channelId)
                .replace("#ISENCRYPTED", iSecure ? ", Encrypted" : "")
                .replace("#DATA", data);
            jQuery("#sap-gear-host-data-receiving").html(msg);
        });

        event.on("wearableSocketClosed", function () {
            _data.agentId = "";
            _loadWearablePanel();
            jQuery("#sap-service-connection-request p.messaging").html("Connection closed.");
        });

        event.on("wearableFileTransfered", function (peerAgent, filePath) {
            jQuery("#sap-gear-host-file-receiving").html(filePath);

            event.trigger("wearableFileTransferCompleted", [0, filePath]);
        });
    }
};
