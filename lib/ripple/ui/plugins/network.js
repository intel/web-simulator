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

var db = require('ripple/db'),
    event = require('ripple/event'),
    deviceSettings = require('ripple/deviceSettings'),
    _NFC_TAG = "tizen1.0-nfc-tag",
    _NFC_PEER = "tizen1.0-nfc-peer",
    _NFC_OUTPUT_MESSAGE = "tizen1.0-nfc-output-message",
    _powered = false,
    _polling = false,
    _isConnected = false,
    _tagNDEF = {
        type: "GENERIC_TARGET",
        isSupportedNDEF: true,
        ndefSize: 2,
        ndefs: [{
            recordCount: 2,
            records: [{
                tnf: 1,
                type: "TypeA",
                id: "ID001",
                payload: "This is 1st payload"
            }, {
                tnf: 1,
                type: "TypeA",
                id: "ID002",
                payload: "This is 2nd payload"
            }]
        },
            {
            recordCount: 2,
            records: [{
                tnf: 1,
                type: "TypeA",
                id: "ID001",
                payload: "This is 1st payload"
            }, {
                tnf: 1,
                type: "TypeA",
                id: "ID002",
                payload: "This is 2nd payload"
            }]
        }]
    },
    _tagRaw = {
        type: "GENERIC_TARGET",
        isSupportedNDEF: false,
        rawData : ""
    },
    _peerNDEF = {
        ndef: {
            recordCount: 2,
            records: [{
                tnf: 1,
                type: "TypeA",
                id: "ID001",
                payload: "This is 1st payload"
            }, {
                tnf: 1,
                type: "TypeA",
                id: "ID002",
                payload: "This is 2nd payload"
            }]
        }
    },
    // Only the default devices supplied for bluetooth simulation,
    // for UI part, only uuid, bond status and connection status are usefull,
    // so here we keep this default device list.
    // Make sure that these devices are the same with API part.
    _deviceList = [{
        isBonded : false,
        isConnected : false,
        address : "11:22:33:44:55:66"
    }, {
        isBonded : false,
        isConnected : false,
        address : "11:27:36:64:55:66"
    }, {
        isBonded : false,
        isConnected : false,
        address : "12:12:43:47:55:16"
    }];

function elementEnableDisableSetting(prop) {
    jQuery("#nfc-attach-msg").text("\xa0");
    jQuery("#nfc-peer-send-msg").text("\xa0");
    if (prop && prop.power !== undefined && prop.power !== null) {
        if (prop.power) {
            $("#nfc-polling").removeAttr("disabled");
            $("#nfc-main-container").show();
        } else {
            $("#nfc-polling").attr("disabled", "disabled");
            $("#nfc-type").removeAttr("disabled");
            $("#nfc-main-container").hide();
        }
    }
    if (prop && prop.connectedState !== undefined && prop.connectedState !== null) {
        if (prop.connectedState) {
            $("#nfc-type").attr("disabled", "disabled");
            $("#nfc-tag-type-text").text($("#nfc-tag-type option:selected").text());
            $("#nfc-tag-type").hide();
            $("#nfc-tag-type-text").show();
            $("#nfc-tag-NDEF-support-text").text($("#nfc-tag-NDEF-support option:selected").text());
            $("#nfc-tag-NDEF-support").hide();
            $("#nfc-tag-NDEF-support-text").show();
            $("#nfc-raw-data").attr("disabled", "disabled");
        } else {
            $("#nfc-type").removeAttr("disabled");
            $("#nfc-tag-type").show();
            $("#nfc-tag-type-text").hide();
            $("#nfc-tag-NDEF-support").show();
            $("#nfc-tag-NDEF-support-text").hide();
            $("#nfc-raw-data").removeAttr("disabled");
        }
    }
}

function _initializeElements() {

    jQuery(function () {
        var stop = false,
            wifiRadio = $("#wifi-radio"),
            isSupportNDEF, type;

        // initialize main menus
        wifiRadio.buttonset();
        $("#network-type-radio").buttonset();
        $("#nfc-radio").buttonset();
        $("#bluetooth-radio").buttonset();

        $("#wifi-radio1").click(function () {
            $("#wifi-main-container").show();
            deviceSettings.persist("WifiNetwork.status", "true");
            event.trigger("WiFiNetworkStatusChanged", [true]);
        });

        $("#wifi-radio2").click(function () {
            $("#wifi-main-container").hide();
            deviceSettings.persist("WifiNetwork.status", "false");
            event.trigger("WiFiNetworkStatusChanged", [false]);
        });

        $("#network-type1").click(function () {
            deviceSettings.persist("Network.networkType", "2G");
            event.trigger("NetworkTypeChanged", ["2G"]);
        });

        $("#network-type2").click(function () {
            deviceSettings.persist("Network.networkType", "3G");
            event.trigger("NetworkTypeChanged", ["3G"]);
        });

        $("#network-type3").click(function () {
            deviceSettings.persist("Network.networkType", "4G");
            event.trigger("NetworkTypeChanged", ["4G"]);
        });

        $("#nfc-radio1").click(function () {
            $("#nfc-main-container").show();
        });

        $("#nfc-radio2").click(function () {
            $("#nfc-main-container").hide();
        });

        $("#bluetooth-radio1").click(function () {
            $("#bluetooth-main-container").show();
        });

        $("#bluetooth-radio2").click(function () {
            $("#bluetooth-main-container").hide();
        });

        // initialize nfc
        jQuery("nfc-tag-ndef-container h3").click(function (event) {
            if (stop) {
                event.stopImmediatePropagation();
                event.preventDefault();
                stop = false;
            }
        });
        jQuery("#nfc-tag-ndef-container").accordion("destroy").accordion({
            header: "> div > h3",
            autoHeight: false
        });
        jQuery("nfc-nfcpeer h3").click(function (event) {
            if (stop) {
                event.stopImmediatePropagation();
                event.preventDefault();
                stop = false;
            }
        });
        jQuery("#nfc-nfcpeer").accordion("destroy").accordion({
            header: "> div > h3",
            autoHeight: false
        });
        jQuery("#nfc-tag-NDEF-support").bind("change", function () {
            isSupportNDEF = jQuery("#nfc-tag-NDEF-support").val();
            if (isSupportNDEF === "Yes") {
                jQuery("#nfc-tag-ndef-container").fadeIn();
                jQuery("#nfc-tag-raw-container").hide();
            } else {
                jQuery("#nfc-tag-ndef-container").hide();
                jQuery("#nfc-tag-raw-container").fadeIn();
            }
        });
        jQuery("#nfc-type").bind("change", function () {
            type = jQuery("#nfc-type").val();
            if (type === "Tag") {
                jQuery("#nfc-nfctag").fadeIn();
                jQuery("#nfc-nfcpeer").hide();
            } else {
                jQuery("#nfc-nfctag").hide();
                jQuery("#nfc-nfcpeer").fadeIn();
            }
            elementEnableDisableSetting();
        });
        jQuery("#nfc-power").bind("change", function () {
            var status;
            status = jQuery("#nfc-power").val() === "On" ? true : false;
            if (status)
                jQuery("#nfc").show();
            event.trigger("nfc-power-setting", [status]);
        });
        jQuery("#nfc-polling").bind("change", function () {
            var status;
            status = jQuery("#nfc-polling").val() === "On" ? true : false;
            event.trigger("nfc-polling-setting", [status]);
        });
        jQuery("#nfc-attach").bind("click", function () {
            var type, isAttached;
            isAttached = jQuery("#nfc-attach").children().text() === "Attach" ? true : false;
            jQuery("#nfc-attach-msg").text("\xa0");

            if (!_polling && isAttached) {
                jQuery("#nfc-attach-msg").text("Polling:Off, attach won't work");
                return;
            }
            type = jQuery("#nfc-type").val();
            event.trigger("nfc-attach-setting", [type, isAttached]);
        });
        jQuery("#nfc-peer-send").bind("click", function () {
            jQuery("#nfc-peer-send-msg").text("\xa0");
            if (!_isConnected) {
                jQuery("#nfc-peer-send-msg").text("Disconnected. Send won't work");
                return;
            }
            db.saveObject(_NFC_PEER, _peerNDEF);
            event.trigger("nfc-peer-sending-ndef", []);
        });

        // initialize bluetooth
        jQuery("#bluetooth-incoming-message").click(function () {
            var currentText = $("#bluetooth-message-content").val(),
                currentDeviceAddress = _deviceList[document.getElementById("bluetooth-devices").selectedIndex]["address"];

            event.trigger("bluetoothRemoteDataArrived", [{
                address: currentDeviceAddress,
                text: currentText
            }]);
        });
    });
}

module.exports = {
    panel: {
        domId: "network-container",
        collapsed: true,
        pane: "left",
        titleName: "Network Management",
        display: true
    },
    initialize: function () {
        _initializeElements();

        // Events for nfc module
        event.on("nfc-power-changed", function (status) {
            _powered = status;
            if (_powered === true) {
                $("#nfc-power").val("On");
            } else {
                $("#nfc-power").val("Off");
            }
            elementEnableDisableSetting({power: status});
        });
        event.on("nfc-polling-changed", function (status) {
            _polling = status;
            if (_polling === true) {
                $("#nfc-polling").val("On");
            } else {
                $("#nfc-polling").val("Off");
            }
            elementEnableDisableSetting();
        });
        event.on("nfc-connectedState-changed", function (state) {
            var i, type, isSupportedNDEF, str, bytes = [];
            _isConnected = state;
            elementEnableDisableSetting({connectedState: state});
            type = jQuery("#nfc-type").val();
            if (state) {
                jQuery("#nfc-attach").children().text("Detach");
                jQuery("#nfc-tag-connection").text("Connected");
                jQuery("#nfc-peer-connection").text("Connected");
                if (type === "Tag") {
                    isSupportedNDEF = jQuery("#nfc-tag-NDEF-support").val() === "Yes" ? true : false;
                    if (isSupportedNDEF) {
                        _tagNDEF.type = jQuery("#nfc-tag-type").val();
                        db.saveObject(_NFC_TAG, _tagNDEF);
                    } else {
                        _tagRaw.type = jQuery("#nfc-tag-type").val();
                        str = jQuery("#nfc-raw-data").val();
                        for (i = 0; i < str.length; i++) {
                            bytes.push(str.charCodeAt(i));
                        }
                        _tagRaw.rawData = bytes;
                        db.saveObject(_NFC_TAG, _tagRaw);
                    }
                    event.trigger("nfc-tag-send", [true]);
                } else {
                    event.trigger("nfc-peer-send", [true]);
                }
            } else {
                jQuery("#nfc-attach").children().text("Attach");
                jQuery("#nfc-tag-connection").text("Disconnected");
                jQuery("#nfc-peer-connection").text("Disconnected");
                jQuery("#nfc-output").text("");
                jQuery("#nfc-output-table").hide();
                if (type === "Tag") {
                    event.trigger("nfc-tag-send", [false]);
                } else {
                    event.trigger("nfc-peer-send", [false]);
                }
            }
        });
        event.on("nfc-output-msg", function () {
            var msg;
            msg = db.retrieve(_NFC_OUTPUT_MESSAGE);
            jQuery("#nfc-output").text(msg);
            jQuery("#nfc-output-table").show();
        });

        // Events for bluetooth module
        event.on("bluetoothPowerState", function (state) {
            if (state)
                $("#bluetooth-radio1").click();
            else
                $("#bluetooth-radio2").click();
        });
        event.on("bluetoothDeviceState", function (stateObj) {
            _deviceList.some(function (item, index) {
                if (item.address === stateObj.address) {
                    if (stateObj.isBonded && stateObj.isConnected)
                        $("#bluetooth-device-" + index + 1).html("Bonded, connected");
                    else if (stateObj.isBonded && !stateObj.isConnected)
                        $("#bluetooth-device-" + index + 1).html("Bonded, not connected");
                    else if (!stateObj.isBonded && !stateObj.isConnected)
                        $("#bluetooth-device-" + index + 1).html("Not bonded, not connected");
                    else
                        throw "Bluetooth device state error!";
                    return true;
                }
            });
        });
    }
};
