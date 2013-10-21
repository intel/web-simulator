/*
 *  Copyright 2011 Research In Motion Limited.
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

var ui = require('ripple/ui'),
    event = require('ripple/event'),
    deviceSettings = require('ripple/deviceSettings'),
    db = require('ripple/db'),
    utils = require('ripple/utils'),
    _messageType = {
        sms: "SMS",
        mms: "MMS",
        email: "E-mail"
    },
    _attachments = [],
/*
    _exception = {
        "":                  "Connection Issue",
        "unknown":           "Unknown",
        "network":           "Network",
        "unreachable":       "Unreachable",
        "no-answer":         "No Answer",
        "bad-number":        "Bad Number",
        "number-not-in-use": "Number Not In Use",
        "media":             "Media",
        "no-sim":            "No Sim Card",
        "account-down":      "Account Down",
        "credit-down":       "Credit Down",
        "barred":            "Barred",
        "network-busy":      "Network Busy",
        "network-down":      "Network Down"
    },
*/
    _status = {
        IDLE:       0,
        DIALED:     1,
        INPROGRESS: 2,
    },
    _data = {
        status: _status.IDLE,
//        isInException: false,
        conversationStartTime: null
    },
    _contactNameArr = [],
    _contactNumArr = [],
    _CONTACT_KEY = "tizen1-contact",
    _record = {},
    _conversationSeconds = 0,
    _conversationTimer,
    _msgTimer,
    _audioPlayersStatus = [];

function _showMsg() {
    var messageName = jQuery("#communication-senderName").val(),
        messageContent = jQuery("#communication-messageContent").val(),
        disMsgName = jQuery(".communication-messageContainer tr:first-child td"),
        disMsgContent = jQuery(".communication-messageContainer tr:nth-child(2) td textarea");

    ui.showOverlay("communication-window");

    disMsgName.text(messageName ? messageName : "Unknown name");
    disMsgContent.val(messageContent ? messageContent : "");

    jQuery("#communication-viewport").css("height", jQuery("#viewport-container").css("height"))
                                     .show("slide", {direction: "up"}, "fast");
    jQuery(".communication-callContainer").hide();
    jQuery(".communication-messageContainer").show();
}

function _msgEventInitialize() {
    jQuery("#communication-messageRadioStatus").hide();
    jQuery("#communication-sendMessage").unbind("click").click(function () {
        var messageItem,
            number = jQuery("#communication-senderName").val(),
            text = jQuery("#communication-messageContent").val(),
            type = jQuery("#communication-msgType").val(),
            message = {
                type: type,
                body: text,
                from: number,
                time: new Date(),
                attachments: _attachments
            };

        if (deviceSettings.retrieve("CELLULAR_NETWORK.status") === false &&
            (type === 'sms' || type === 'mms')) {
            jQuery("#communication-messageRadioStatus").html('cellular radio is off<br \>Turn it on from Network Management Panel.');
            jQuery("#communication-messageRadioStatus").show();
            setTimeout(function () {
                jQuery("#communication-messageRadioStatus").hide();
            }, 3000);
            return;
        }
        if (deviceSettings.retrieve("WIFI_NETWORK.status") === false &&
            type === 'email') {
            jQuery("#communication-messageRadioStatus").html('wifi radio is off<br \>Turn it on from Network Management Panel.');
            jQuery("#communication-messageRadioStatus").show();
            setTimeout(function () {
                jQuery("#communication-messageRadioStatus").hide();
            }, 3000);
            return;
        }

        event.trigger("MessageReceived", [message]);
        _attachments = [];
        event.trigger("CommWinShow", [true]);
        _showMsg();

        jQuery(".communication-messageContainer textarea").attr("disabled", "disabled");
        jQuery("#communication-messageOut td:nth-child(3)").text(jQuery("#communication-messageContent").val());
        messageItem = jQuery("#communication-messageOut").html();
        jQuery("#communication-messageDisplay").append(messageItem);

        clearTimeout(_msgTimer);
        _msgTimer = setTimeout(function () {
            if (_data.status === _status.IDLE) {
                ui.hideOverlay("communication-window");
                event.trigger("CommWinShow", [false]);
            } else {
                _showCall();
            }
        }, 5000);
    });

    jQuery("#communication-clearMessage").unbind("click").click(function () {
            jQuery("#communication-messageDisplay").empty();
        });

    event.on("LayoutChanged", function () {
        jQuery("#communication-viewport").css("height", jQuery("#viewport-container").css("height"));

    });
    event.on("OutsideMessageReceived", function (message) {
        var i = 0,
            recipients = [],
            recipientsStatus = {},
            messageItem;

        recipientsStatus.id = message.id;
        recipientsStatus.msg = message.msg;
        for (i in message.to) {
            recipientsStatus[message.to[i]] = true;
            recipients.push(message.to[i]);
        }
        for (i in message.cc) {
            recipientsStatus[message.cc[i]] = true;
            recipients.push(message.cc[i]);
        }
        for (i in message.bcc) {
            recipientsStatus[message.bcc[i]] = true;
            recipients.push(message.bcc[i]);
        }

        event.trigger("MessageSent", [recipientsStatus]);
        jQuery("#communication-messageIn td:nth-child(1)").text(message.body);
        messageItem = jQuery("#communication-messageIn").html();
        jQuery("#communication-messageDisplay").append(messageItem);
    });

    jQuery("#communication-ok").unbind("click").click(function () {
        if (_data.status === _status.IDLE) {
            ui.hideOverlay("communication-window");
            event.trigger("CommWinShow", [false]);
        } else {
            _showCall();
        }
        clearTimeout(_msgTimer);
    });
}

function _msgInitialize() {
    _msgEventInitialize();

    utils.forEach(_messageType, function (msgTypeText, msgType) {
        var typeNode = utils.createElement("option", {
                "innerText": msgTypeText,
                "value": msgType
            });

        jQuery("#communication-msgType").append(typeNode);
    });
}

function pauseAllAudioPlayer() {
    var audios = $("#document").contents().find("audio"),
        index;
    for (var index = 0; index < audios.length; index++) {
        if (audios[index].paused) {
            _audioPlayersStatus[index] = 0;
        }
        else {
            _audioPlayersStatus[index] = 1;
            audios[index].pause();
        }
    }
}

function playAllAudioPlayer() {
    var audios = $("#document").contents().find("audio"),
        index;
    for (var index = 0; index < audios.length; index++) {
        if (_audioPlayersStatus[index] === 1) {
            audios[index].play();
        }
    }
    _audioPlayersStatus = [];
}

function _showCall() {
    var callName = jQuery("#communication-callerName").val(),
        callNum = jQuery("#communication-callNum").val(),
        disCallName = jQuery(".communication-callContainer tr:first-child td"),
        disCallNum = jQuery(".communication-callContainer tr:nth-child(2) td");

    ui.showOverlay("communication-window");
    event.trigger("CommWinShow", [true]);

    disCallName.text(callName ? callName : "Unknown Name");
    disCallNum.text(callNum ? callNum : "Unknown Number");

    jQuery("#communication-viewport").css("height", jQuery("#viewport-container").css("height"))
                                     .show("slide", {direction: "up"}, "fast");
    jQuery(".communication-callContainer").show();
    jQuery(".communication-messageContainer").hide();
    pauseAllAudioPlayer();
}

function _initRecord() {
    var callerName = jQuery("#communication-callerName").val(),
        callerNum = jQuery("#communication-callNum").val(),
        displayName = callerName ? callerName : "Unknown",
        displayNum = callerNum ? callerNum : "Unknown";

    _record = {};
    _record.type = "TEL";
    if ($("#is-videoCall").prop("checked") === true) {
        _record.features = ["CALL", "VIDEOCALL"];
    } else {
        _record.features = ["CALL", "VOICECALL"];
    }
    _record.remoteParties = [{
        remoteParty: displayNum,
        personId: displayName,
    }];
    _record.startTime = new Date();
}

function _endCall(callEndReason) {
    _record.duration = _data.conversationStartTime ? _conversationSeconds : 0;

    _data.conversationStartTime = null;

    switch (callEndReason) {
    case 'rejected':
        _record.direction = "REJECTED";
        break;
    case 'remote':
        _record.direction = "RECEIVED";
        break;
    case 'local':
        _record.direction = "MISSEDNEW";
        break; 
    }

    event.trigger("CallRecorded", [_record]);
    event.trigger("CallInProgress", [false]);

    _data.status = _status.IDLE;
    _record = {};

    _conversationSeconds = 0;
    window.clearInterval(_conversationTimer);
    ui.hideOverlay("communication-window");
    event.trigger("CommWinShow", [false]);
    playAllAudioPlayer();
}

function _callEventInitialize() {
    jQuery("#communication-cellularStatus").hide();
    jQuery("#communication-callStart").unbind('click').click(
        function () {
            if (deviceSettings.retrieve("CELLULAR_NETWORK.status") === false) {
                jQuery("#communication-cellularStatus").show();
                setTimeout(function () {
                    jQuery("#communication-cellularStatus").hide();
                }, 3000);

                return;
            }
            if (_data.status === _status.IDLE) {
                _data.status = _status.DIALED;
                _initRecord();
                _showCall();
                jQuery("#callSettings tr:last-child td").text("Calling...");
                jQuery("#communication-callStart > span").text("End Call");
                jQuery("#callSettings input").attr("disabled", "disabled");
            } else {
                _endCall("local");

                jQuery("#callSettings tr:last-child td").text("");
                jQuery("#communication-callStart > span").text("Call");
                jQuery(".communication-callContainer tr:nth-child(3)").show();
                jQuery(".communication-callContainer tr:last-child").hide();
                jQuery("#callSettings input").removeAttr("disabled");
            }

        }
    );

    event.on("ApplicationLoad", function () {
        switch (_data.status) {
        case _status.INPROGRESS:
            jQuery("#communication-callStart").click();
            break;
        case _status.DIALED:
            jQuery("#communication-ignore").click();
            break;
        default:
            break;
        }
    });

    jQuery("#communication-ignore").unbind('click').click(function () {
        _endCall("rejected");

        jQuery("#callSettings tr:last-child td").text("");
        jQuery("#communication-callStart > span").text("Call");
        jQuery("#communication-callStart").removeData();
        jQuery("#callSettings input").removeAttr("disabled");
    });

    jQuery("#communication-answer").unbind('click').click(function () {
        _data.conversationStartTime = new Date();
        event.trigger("CallInProgress", [true]);
        _data.status = _status.INPROGRESS;

        _conversationTimer = setInterval(function () {
            var timeObj = new Date(1970, 0, 1),
                timeString;

            timeObj.setSeconds(_conversationSeconds);
            timeString = timeObj.toTimeString().substr(0, 8);
            jQuery("#callSettings tr:last-child td").text(timeString);
            _conversationSeconds = _conversationSeconds + 1;
        }, 1000);

        jQuery(".communication-callContainer tr:nth-child(3)").hide();
        jQuery(".communication-callContainer tr:last-child").show();
    });

    jQuery("#communication-end").unbind('click').click(function () {
        _endCall("remote");

        jQuery("#callSettings tr:last-child td").text("");
        jQuery("#communication-callStart > span").text("Call");
        jQuery("#communication-callStart").removeData();
        jQuery(".communication-callContainer tr:nth-child(3)").show();
        jQuery(".communication-callContainer tr:last-child").hide();
        jQuery("#callSettings input").removeAttr("disabled");
    });
/*
    jQuery("#communication-callEndReason").unbind("change").change(function () {
        if (!jQuery("#communication-callEndReason").val()) {
            _data.isInException = false;
        } else {
            _data.isInException = true;
            if (_data.isInException && (_data.status !== _status.IDLE)) {
                _endCall(jQuery("#communication-callEndReason").val());
            }
        }

        jQuery("#callSettings tr:last-child td").text("");
        jQuery("#communication-callStart > span").text("Call");
        jQuery("#communication-callStart").removeData();
        jQuery(".communication-callContainer tr:nth-child(3)").show();
        jQuery(".communication-callContainer tr:last-child").hide();
        jQuery("#callSettings input").removeAttr("disabled");
    });
*/
}

function _contactInitialize() {
    var data = db.retrieveObject(_CONTACT_KEY),
        displayName = null, number = null, index = 0;

    _contactNameArr = [];
    _contactNumArr = [];

    utils.forEach(data, function (addrBook) {
        utils.forEach(addrBook._contacts, function (contact) {
            if (contact.name && contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                displayName = contact.name.firstName + ' ' + contact.name.lastName;
                number = contact.phoneNumbers[0].number;
                _contactNameArr.push(displayName);
                _contactNumArr[displayName] = number;
                index++;
            }
        });
    });

    jQuery("#communication-callerName").autocomplete({
        source: _contactNameArr,
        select: function (event, ui) {
            jQuery("#communication-callNum").val(_contactNumArr[ui.item.value]);
        }
    });
    jQuery("#communication-senderName").autocomplete({
        source: _contactNameArr
    });
}

function _callInitialize() {
    _callEventInitialize();

    _contactInitialize();
/*
    utils.forEach(_exception, function (value, key) {
        var typeNode = utils.createElement("option", {
                "innerText": value,
                "value": key
            });

        jQuery("#communication-callEndReason").append(typeNode);
    });
*/
}

function _pushEventInitialize() {
    function register(appService) {
        appService.registrationId = Math.uuid(null, 16);

        window.setTimeout(function () {
            var appLabel;

            if ($("#communication-push-" + appService.appId).length !== 0) {
                $("#" + appService.appId).click();
                $("#communication-push-status-" + appService.appId).html("||");
                $("#communication-push-status-" + appService.appId).css("color", "#ff0000");

                return;
            }

            if (!$("#communication-push-app > tbody").html()) {
                $("#communication-push-header").show();
                $("#communication-push-submit").removeAttr("disabled");
            }

            appLabel = appService.appControl.uri || appService.appId;

            $("#communication-push-app").append(
                "<tr id='communication-push-" + appService.appId + "'>" +
                "<td style='width: 90%'><input type='radio' name='communication-push-list' id='" +
                appService.appId + "' style='margin: 5px' checked='checked' />" +
                "<label for='" + appService.appId + "'>" + appLabel + "</label></td>" +
                "<td id='communication-push-status-" + appService.appId + "'>||</td>" +
                "</tr>");

            $("label[for='" + appService.appId + "']").css({
                "display": "inline-block",
                "width": "220px",
                "white-space": "nowrap",
                "overflow": "hidden",
                "text-overflow": "ellipsis"
            });

            $("#communication-push-status-" + appService.appId).css({
                "width": "10%",
                "color": "#ff0000",
                "text-align": "center",
                "font-weight": "bold",
                "font-size": "14px"
            });

            $("#communication-push-app tr:even").css("background-color", "white");
            $("#communication-push-app tr:odd").css("background-color", "whitesmoke");
        }, 1);
    }

    function unregister(appId) {
        if ($("#communication-push-" + appId).length === 0)
            return;

        $("tr[id='communication-push-" + appId + "']").remove();

        if (!$("#communication-push-app > tbody").html()) {
            $("#communication-push-header").hide();
            $("#communication-push-submit").attr("disabled", "disabled");

            return;
        }

        if ($("input[name='communication-push-list']:checked").length === 0) {
            $("#communication-push-app input:first").click();
        }

        $("#communication-push-app tr:even").css("background-color", "white");
        $("#communication-push-app tr:odd").css("background-color", "whitesmoke");
    }

    function connect(appId) {
        $("#communication-push-status-" + appId).html("<=>");
        $("#communication-push-status-" + appId).css("color", "#32cd32");
    }

    function disconnect(appId) {
        $("#communication-push-status-" + appId).html("||");
        $("#communication-push-status-" + appId).css("color", "#ff0000");
    }

    event.on("PushRequest", function (command, cmdData) {
        switch (command) {
        case "REGISTER":
            register(cmdData);
            break;

        case "UNREGISTER":
            unregister(cmdData);
            break;

        case "CONNECT":
            connect(cmdData);
            break;

        case "DISCONNECT":
            disconnect(cmdData);
            break;
        }
    });
}

function _pushElementInitialize() {
    $("#communication-push-submit").attr("disabled", "disabled");
    $("#communication-push-submit").unbind('click').click(function () {
        var appId, pushMessage;

        appId = $("#communication-push-app :checked").attr("id");
        if (!appId)
            return;

        pushMessage = {
            appData:      $("#communication-push-data").val(),
            alertMessage: $("#communication-push-msg").val(),
            date:         new Date()
        };

        if (!pushMessage.appData || !pushMessage.alertMessage)
            return;

        event.trigger("PushNotified", [appId, pushMessage]);
    });

    $("#communication-push-clear").unbind('click').click(function () {
        $("#communication-push-msg").val("");
        $("#communication-push-data").val("");
    });
}

function _pushInitialize() {
    _pushEventInitialize();
    _pushElementInitialize();
}

module.exports = {
    panel: {
        domId: "communication-container",
        collapsed: true,
        pane: "left",
        titleName: "Communications",
        display: true
    },
    initialize: function () {
        jQuery("#communication-select").tabs();
        _callInitialize();
        _msgInitialize();
        _pushInitialize();
    }
};
