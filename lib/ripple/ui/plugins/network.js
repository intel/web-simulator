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
    utils = require('ripple/utils'),
    event = require('ripple/event'),
    deviceSettings = require('ripple/deviceSettings'),
    dbinit = require('ripple/platform/tizen/2.0/dbinit'),
    _NFC_TAG = "tizen1.0-nfc-tag",
    _NFC_PEER = "tizen1.0-nfc-peer",
    _NFC_OUTPUT_MESSAGE = "tizen1.0-nfc-output-message",
    _powered = false,
    _isConnected = false,
    _tagNDEF,
    _tagRaw,
    _peerNDEF,
    btNodes,
    _btDeviceTemplate = "",
    _btSimulatedDevs = {},
    _btBluetoothDB;

String.prototype.toCharCode = function () {
    return this.split("").map(function(char) {
        return char.charCodeAt(0);
    });
};

function elementEnableDisableSetting(prop) {
    jQuery("#nfc-attach-msg").text("\xa0");
    jQuery("#nfc-peer-send-msg").text("\xa0");
    if (prop && prop.power !== undefined && prop.power !== null) {
        if (!prop.power) {
            $("#nfc-type").removeAttr("disabled");
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

function _initializeDB() {
    _tagNDEF = {
        type: "GENERIC_TARGET",
        isSupportedNDEF: true,
        ndefSize: 3,
        ndefs: [{
            recordCount: 2,
            records: [{
                tnf: 1,
                type: "TypeA".toCharCode(),
                id: "ID001".toCharCode(),
                payload: "This is 1st payload".toCharCode()
            }, {
                tnf: 1,
                type: "TypeA".toCharCode(),
                id: "ID002".toCharCode(),
                payload: "This is 2nd payload".toCharCode()
            }]
        },
        {
            recordCount: 2,
            records: [{
                tnf: 1,
                type: "TypeA".toCharCode(),
                id: "ID003".toCharCode(),
                payload: "This is 1st payload".toCharCode()
            }, {
                tnf: 1,
                type: "TypeA".toCharCode(),
                id: "ID004".toCharCode(),
                payload: "This is 2nd payload".toCharCode()
            }]
        },
        {
            recordCount: 2,
            records: [{
                tnf: 1,
                type: "TypeA".toCharCode(),
                id: "ID005".toCharCode(),
                payload: "This is 1st payload".toCharCode()
            }, {
                tnf: 1,
                type: "TypeA".toCharCode(),
                id: "ID006".toCharCode(),
                payload: "This is 2nd payload".toCharCode()
            }]
        }]
    };

    _tagRaw = {
        type: "GENERIC_TARGET",
        isSupportedNDEF: false,
        rawData : ""
    };

    _peerNDEF = {
        ndef: {
            recordCount: 2,
            records: [{
                tnf: 1,
                type: "TypeA".toCharCode(),
                id: "ID001".toCharCode(),
                payload: "This is 1st payload".toCharCode()
            }, {
                tnf: 1,
                type: "TypeA".toCharCode(),
                id: "ID002".toCharCode(),
                payload: "This is 2nd payload".toCharCode()
            }]
        }
    };
}

function _initializeElements() {
    jQuery(function () {
        var stop = false,
        wifiRadio = $("#wifi-radio"),
        isSupportNDEF, type;

        // initialize main menus
        wifiRadio.buttonset();

        $("#cellular-radio").buttonset();
        $("#nfc-radio").buttonset();
        $("#bluetooth-radio").buttonset();
        $("#bearer-radio").buttonset();

        $("#wifi-radio1").prop('checked', false);
        $("#wifi-radio2").prop('checked', false);
        if (deviceSettings.retrieve("WIFI_NETWORK.status") === true) {
            $("#wifi-radio1").prop('checked', true);
            $("#wifi-radio1-label").css({'color': '#000000'});
            $("#wifi-radio2-label").css({'color': '#bbbbbb'});
        }
        else {
            $("#wifi-radio2").prop('checked', true);
            $("#wifi-radio1-label").css({'color': '#bbbbbb'});
            $("#wifi-radio2-label").css({'color': '#222222'});
        }
        $("#wifi-radio1").button("refresh");
        $("#wifi-radio2").button("refresh");

        $("#cellular-radio1").prop('checked', false);
        $("#cellular-radio2").prop('checked', false);
        if (deviceSettings.retrieve("CELLULAR_NETWORK.status") === true) {
            $("#cellular-radio1").prop('checked', true);
            $("#cellular-radio1-label").css({'color': '#000000'});
            $("#cellular-radio2-label").css({'color': '#bbbbbb'});
        }
        else {
            $("#cellular-radio2").prop('checked', true);
            $("#cellular-radio1-label").css({'color': '#bbbbbb'});
            $("#cellular-radio2-label").css({'color': '#222222'});
        }

        if (deviceSettings.retrieve("CELLULAR_NETWORK.isFlightMode") === true) {
            $("#cellular-radio1").prop('disabled', true);
            $("#cellular-radio2").prop('disabled', true);
            $("#panel_flight_mode_notice").show();
        }
        else {
            $("#cellular-radio1").prop('disabled', false);
            $("#cellular-radio2").prop('disabled', false);
            $("#panel_flight_mode_notice").hide();
        }

        $("#cellular-radio1").button("refresh");
        $("#cellular-radio2").button("refresh");

        $("#bearer-radio2").prop('checked', true);
        $("#bearer-radio2").button("refresh");

        $("#wifi-radio1").click(function () {
            $("#wifi-radio1-label").css({'color': '#000000'});
            $("#wifi-radio2-label").css({'color': '#bbbbbb'});
            deviceSettings.persist("WIFI_NETWORK.status", true);
            event.trigger("WiFiNetworkStatusChanged", [true]);
        });

        $("#wifi-radio2").click(function () {
            $("#wifi-radio1-label").css({'color': '#bbbbbb'});
            $("#wifi-radio2-label").css({'color': '#222222'});
            deviceSettings.persist("WIFI_NETWORK.status", false);
            event.trigger("WiFiNetworkStatusChanged", [false]);
        });

        $("#cellular-radio1").click(function () {
            $("#cellular-radio1-label").css({'color': '#000000'});
            $("#cellular-radio2-label").css({'color': '#bbbbbb'});
            deviceSettings.persist("CELLULAR_NETWORK.status", true);
            event.trigger("CellularNetworkStatusChanged", [true]);
        });

        $("#cellular-radio2").click(function () {
            $("#cellular-radio1-label").css({'color': '#bbbbbb'});
            $("#cellular-radio2-label").css({'color': '#222222'});
            deviceSettings.persist("CELLULAR_NETWORK.status", false);
            event.trigger("CellularNetworkStatusChanged", [false]);
        });

        $("#nfc-radio1-label").css({'color': '#bbbbbb'});
        $("#nfc-radio2-label").css({'color': '#222222'});

        $("#bluetooth-radio1-label").css({'color': '#bbbbbb'});
        $("#bluetooth-radio2-label").css({'color': '#222222'});

        $("#bearer-radio1-label").css({'color': '#bbbbbb'});
        $("#bearer-radio2-label").css({'color': '#222222'});

        $("#nfc-radio1").click(function () {
            $("#nfc-radio2-label").css({'color': '#bbbbbb'});
            $("#nfc-radio1-label").css({'color': '#222222'});
            $("#nfc-main-container").show();
        });

        $("#nfc-radio2").click(function () {
            $("#nfc-radio1-label").css({'color': '#bbbbbb'});
            $("#nfc-radio2-label").css({'color': '#222222'});
            $("#nfc-main-container").hide();
        });

        $("#bluetooth-radio1").click(function () {
            $("#bluetooth-radio2-label").css({'color': '#bbbbbb'});
            $("#bluetooth-radio1-label").css({'color': '#222222'});
            $("#bluetooth-main-container").show();
        });

        $("#bluetooth-radio2").click(function () {
            $("#bluetooth-radio1-label").css({'color': '#bbbbbb'});
            $("#bluetooth-radio2-label").css({'color': '#222222'});
            $("#bluetooth-main-container").hide();
        });

        $("#bearer-radio1").click(function () {
            $("#bearer-radio2-label").css({'color': '#bbbbbb'});
            $("#bearer-radio1-label").css({'color': '#222222'});
            $("#bearer-main-container").show();
        });

        $("#bearer-radio2").click(function () {
            $("#bearer-radio1-label").css({'color': '#bbbbbb'});
            $("#bearer-radio2-label").css({'color': '#222222'});
            $("#bearer-main-container").hide();
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
        jQuery("#nfc-attach").bind("click", function () {
            var type, isAttached;
            isAttached = jQuery("#nfc-attach").children().text() === "Attach" ? true : false;
            jQuery("#nfc-attach-msg").text("\xa0");

            if (!_powered && isAttached) {
                jQuery("#nfc-attach-msg").text("Power:Off, attach won't work");
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

        // Initialize network bearer selection
        $("#bearer-cellular-radio1").prop('checked', true);
        $("#bearer-unknown-radio2").prop('checked', true);
        $("#bearer-cellular-radio1").button("refresh");
        $("#bearer-unknown-radio2").button("refresh");

        $("#bearer-cellular-radio2").click(function () {
            $("#bearer-cellular button").click();
        });

        $("#bearer-unknown-radio2").click(function () {
            $("#bearer-unknown button").click();
        });
    });
}

function _btRender() {
    var devicesHTML, btHtmlContent = "";

    utils.forEach(_btSimulatedDevs, function (item) {
        var uuidsHTML = "", firstService = null;

        utils.forEach(item.services, function (s, index) {
            if (!firstService) {
                firstService = s;
            }
            uuidsHTML += '<option value="' + index + '">' + s.name + '</option>';
        });

        devicesHTML = _btDeviceTemplate.replace(/#name/g, item.name)
        .replace(/#address/g, item.address)
        .replace(/#class-major/, item.deviceClass.majorName)
        .replace(/#class-minor/, item.deviceClass.minorName)
        .replace(/#class-service/, item.deviceClass.servicesName.join(","))
        .replace(/#bonded/, "No")
        .replace(/#trusted/, item.isTrusted ? "Yes" : "No")
        .replace(/#connected/, "No")
        .replace(/#uuids/, uuidsHTML)
        .replace(/#service-uuid/, firstService.uuid)
        .replace(/#service-protocol/, firstService.protocol)
        .replace(/#service-state/, firstService.state || "CLOSED")
        .replace(/#id/g, item.address.replace(/:/g, ""));

        btHtmlContent += devicesHTML;
    });

    $("#network-bt-box").accordion("destroy");
    $("#network-bt-box").html(btHtmlContent).accordion({
        active : false,
        collapsible : true,
        autoHeight : false
    });
}

function _btRemove(index) {
    delete _btSimulatedDevs[index];
    db.saveObject("bt-simulated-devices", _btSimulatedDevs);
    event.trigger("bt-simulated-devices-changed", []);
    _btRender();
}

function _bearerRelease(type, idBearer, evNetworkDisconnected) {
    if ($("#bearer-row-" + idBearer).length > 0) {
        $("tr[id='bearer-row-" + idBearer + "']").remove();
    }

    event.trigger(evNetworkDisconnected);

    $("#bearer-" + type + " tr:even").css("background-color", "white");
    $("#bearer-" + type + " tr:odd").css("background-color", "whitesmoke");
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
        _initializeDB();
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
            if (state) {
                $("#bluetooth-radio1").click();
            } else {
                $("#bluetooth-radio2").click();
            }
        });
        event.on("bt-adapter-name-changed", function (name) {
            $("#bt-adapter-name").text(name);
        });
        event.on("bt-adapter-power-changed", function (state) {
            if (state) {
                $("#bt-adapter-power").text("On");
            } else {
                $("#bt-adapter-power").text("Off");
            }
        });
        event.on("bt-adapter-visible-changed", function (state) {
            if (state) {
                $("#bt-adapter-visible").text("On");
            } else {
                $("#bt-adapter-visible").text("Off");
            }
        });
        event.on("bt-device-bonded-changed", function (addr, isBonded) {
            var str = "No";
            if (isBonded) {
                str = "Yes";
            }
            jQuery("#bonded-" + addr.replace(/:/g, "")).html(str);
        });
        event.on("bt-device-connected-changed", function (addr, isConnected) {
            var str = "No";
            if (isConnected) {
                str = "Yes";
            }
            jQuery("#connected-" + addr.replace(/:/g, "")).html(str);
        });
        event.on("bt-service-state-changed", function (addr, uuid, state) {
            var str = "CLOSED";
            if (state) {
                str = "OPEN";
            }
            _btSimulatedDevs[addr].services[uuid].state = str;
            jQuery("#service-state-" + addr.replace(/:/g, "")).html(str);
        });
        event.on("bt-service-write-msg", function (addr, uuid, data) {
            var msg = "", uuidNow;
            utils.forEach(data, function (char) {
                msg += String.fromCharCode(char);
            });
            uuidNow = jQuery("#network-bt-uuid-" + addr.replace(/:/g, "")).html();
            if (uuidNow === uuid) {
                jQuery("#service-receive-textarea-" + addr.replace(/:/g, "")).html(msg);
            }
        });

        // Event for network bearer selection module
        event.on("NetworkRequest", function (networkType, domainName) {
            var type = networkType.toLowerCase(), name, idBearer,
                evNetworkOpened       = "NO_" + networkType + "_" + domainName,
                evNetworkDisconnected = "ND_" + networkType + "_" + domainName;

            if (!$("#bearer-" + type + "-radio1").prop("checked")) {
                event.trigger(evNetworkOpened, [false]);
                event.trigger(evNetworkDisconnected);

                return;
            }

            name = domainName.replace(/\./, "");
            idBearer = type + '-' + name;

            if ($("#bearer-row-" + idBearer).length <= 0) {
                $("#bearer-" + type).append("<tr id='bearer-row-" + idBearer + "'>" +
                     "<td>&nbsp<lable class='ui-text-label'>" + domainName + "</label></td>" +
                     "<td><button id='bearer-btn-" + idBearer + "'>X</button>&nbsp&nbsp</td>" +
                     "</tr>");

                $("#bearer-btn-" + idBearer).click(function () {
                    _bearerRelease(type, idBearer, evNetworkDisconnected);
                });

                $("#bearer-" + type + " tr:even").css("background-color", "white");
                $("#bearer-" + type + " tr:odd").css("background-color", "whitesmoke");
            }

            event.trigger(evNetworkOpened, [true]);
        });

        event.on("NetworkRelease", function (networkType, domainName) {
            var type = networkType.toLowerCase(),
                name = domainName.replace(/\./, ""),
                idBearer = type + '-' + name,
                evNetworkDisconnected = "ND_" + networkType + "_" + domainName;

            _bearerRelease(type, idBearer, evNetworkDisconnected);
        });

        // Update UI for Flight Mode changing
        event.on("FlightModeChanged", function (value) {
            if (value === true) {
                $("#cellular-radio1").prop('disabled', true);
                $("#cellular-radio2").prop('disabled', true);
                $("#panel_flight_mode_notice").show();
            }
            else {
                $("#cellular-radio1").prop('disabled', false);
                $("#cellular-radio2").prop('disabled', false);
                $("#panel_flight_mode_notice").hide();
            }

            $("#cellular-radio1").button("refresh");
            $("#cellular-radio2").button("refresh");
        });

        $("#bt-adapter-name").text(db.retrieveObject("tizen1-db-bluetooth_adapter-name") || "Tizen BT Adapter");
        _btDeviceTemplate = $("#network-bt-template").html();
        $("#network-bt-box").empty();
        btNodes = jQuery("#network-bt-device-select");
        btNodes.html("");

        _btBluetoothDB = dbinit.Bluetooth;
        utils.forEach(_btBluetoothDB, function (item, index) {
            btNodes.append(utils.createElement("option", {
                "value": index,
                "innerText": item.name
            }));
        });

        jQuery("#network-bt-nearby-btn").click(function () {
            var index;
            index = jQuery("#network-bt-device-select").val();
            if (_btSimulatedDevs[index]) {
                return;
            }
            _btSimulatedDevs[index] = _dbBluetooth[index];
            db.saveObject("bt-simulated-devices", _btSimulatedDevs);
            event.trigger("bt-simulated-devices-changed", []);
            _btRender();
        });
        $(".network-bt-remove-btn").live("click", function () {
            _btRemove(this.id);
        });
        $(".network-bt-send-btn").live("click", function () {
            var msg = jQuery("#service-transfer-textarea-" + this.id.replace(/:/g, "")).val(),
            uuid = jQuery("#network-bt-uuid-" + this.id.replace(/:/g, "")).html();
            event.trigger("bt-service-rawdata-received", [this.id, uuid, msg]);
        });
        $(".network-bt-service-select").live("change", function () {
            var uuid = this.children[this.selectedIndex].value,
            index = this.id,
            addr,
            service;
            addr = index.replace(/:/g, "");
            service = _btSimulatedDevs[index].services[uuid];
            jQuery("#network-bt-uuid-" + index.replace(/:/g, "")).html(service.uuid);
            jQuery("#network-bt-protocol-" + index.replace(/:/g, "")).html(service.protocol);
            jQuery("#service-state-" + index.replace(/:/g, "")).html(service.state || "CLOSED");
            jQuery("#service-transfer-textarea-" + addr).val("");
            jQuery("#service-receive-textarea-" + addr).html("");
        });

        //Default "Tizen Phone" is nearby
        //_btSimulatedDevs["00:02:60:00:05:63"] = _btBluetoothDB["00:02:60:00:05:63"];
        _btSimulatedDevs = db.retrieveObject("bt-simulated-devices") || {};
        if (Object.keys(_btSimulatedDevs).length === 0) {
            for (var address in _btBluetoothDB) {
                _btSimulatedDevs[address] = _btBluetoothDB[address];
                break;
            }

            db.saveObject("bt-simulated-devices", _btSimulatedDevs);
        }

        _btRender();
    }
};
