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
    _exception = {
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
    _status = {
        IDLE:       0,
        DIALED:     1,
        PLACED:     2,
        INPROGRESS: 3,
    },
    _statusInfo = [
        "Waiting...;Waiting",                                   // IDLE
        "Calling... ;Incomming call from simulator",               // DIALED
        "Incomming call from ;Calling simulator",                // PLACED
        "In conversation with ;In conversation with simulator"   // INPROGRESS
    ],
    _data = {
        status: _status.IDLE,
        isInException: false,
        isAutoAccept: false,
        autoAcceptTimerId: null,
        conversationStartTime: null
    },
    _contactMap = {
        "861012345678": "Guest"
    },
    _CONTACT_KEY = "tizen1-contact",
    _RECORDING_KEY = "tizen1-call-recording",
    _RECORDING_PATH = "music/",
    _record = {},
    _conversationSeconds = 0,
    _conversationTimer,
    _callingEffectTimer;

function _initContacts() {
    var data = db.retrieveObject(_CONTACT_KEY),
        contactsSelect = document.getElementById("call-local-phone-number"),
        displayName = null, number = null, index = 0, i;
        
    contactsSelect.innerHTML = "";

    utils.forEach(data, function (addrBook) {
        utils.forEach(addrBook._contacts, function (contact) {
            if (contact.name && contact.name && contact.phoneNumbers &&
                contact.phoneNumbers.length > 0) {
                displayName = contact.name.firstName + ' ' + contact.name.lastName;
                number = contact.phoneNumbers[0].number;
                _contactMap[number] = displayName;

                contactsSelect.appendChild(utils.createElement("option", {
                    "innerText": displayName + ':' + number,
                    "value": index
                }));
                index++;
            }
        });
    });

    if (displayName === null && number === null) {
        for (i in _contactMap) {
            displayName = _contactMap[i];
            number = i;
            contactsSelect.appendChild(utils.createElement("option", {
                "innerText": displayName + ':' + number,
                "value": index
            }));
        }
    }
}

function _initEventWatchers() {
    event.on("DialerLaunched", function (remoteParty) {
        var localContact = document.getElementById("call-local-phone-number");

        if (_data.status !== _status.IDLE) {
            return;
        }

        localContact.appendChild(utils.createElement("option", {
            "innerText": remoteParty.displayName,
            "value": remoteParty.remoteParty,
            "selected": "selected"
        }));
        _localCall();
    });
}

function _initExceptionTypes() {
    utils.forEach(_exception, function (value, key) {
        document.getElementById("call-exception-type").appendChild(utils.createElement("option", {
            "innerText": value,
            "value": key
        }));
    });
}

function _initRecord() {
    var localPartString = jQuery("#call-local-phone-number option:selected").text() || "",
        localPartStringList = localPartString.split(":"),
        displayName;

    if (localPartStringList.length > 1) {
        displayName = localPartStringList[0];
    }
    else {
        displayName = localPartString;
    }

    _record = {};
    _record.serviceId = (new Date()).getTime() || 0;
    _record.callParticipants = [{
        id: localPartString + ':' + displayName,
        displayName: displayName,
        contactRef: null
    }];
    _record.forwardedFrom = null;
    _record.startTime = new Date();
    _record.recording = [];
}


function updateConvTime() {
    var timeObj = new Date(1970, 0, 1),
    timeString;

    timeObj.setSeconds(_conversationSeconds);
    timeString = timeObj.toTimeString().substr(0, 8);
    jQuery("#ConvTimeString").text(timeString);
    jQuery("#ConvTimeString2").text(timeString);
    _conversationSeconds = _conversationSeconds + 1;
}


function CallingEffect() {
    var color = jQuery("#callingString").css('color');
    if (color === "rgb(255, 255, 255)") {
        jQuery("#callingString").css('color', "black");
        jQuery("#callingString2").css('color', "black");
    }
    else {
        jQuery("#callingString").css('color', "white");
        jQuery("#callingString2").css('color', "white");
    }
}


function _transferStatus() {
    var statusStringList = _statusInfo[_data.status].split(";"),
        localPartString = jQuery("#call-local-phone-number option:selected").text() || "",
        localPartStringList = localPartString.split(":"),
        localNumber = localPartStringList[0],
        localName = _contactMap[localNumber] || localNumber;
    jQuery("#status-text").show();
    jQuery("#remote-status-text").show();
    jQuery("#call-status").show();
    jQuery("#remote-call-status").show();
    jQuery("#remotePartyName").html(localName);
    jQuery("#call-local-call").show();
    window.clearInterval(_callingEffectTimer);

    switch (_data.status) {
    case _status.DIALED:      // local call
        jQuery("#call-remote-text").html("Accept");
        jQuery("#end-remote-text").html("Reject");
        jQuery("#call-status").html("<span style='font-size: 22px;'>" + localName + "</span><br>" + 
                        "<span id='callingString' style='font-size: 14px;'>&nbsp;" + statusStringList[0] + 
                        "</span><br><br><br><button id='call-local-end-d' class='ui-corner-all' style='padding:2px;" +
                        " border-width:1px; background-color:red; color:white; font-size:14px; font-weight:bold; width:100%;'>End call</button>");
        jQuery("#call-local-end-d").bind("click", _localEnd);
        jQuery("#remote-call-status").html("<span style='font-size: 20px;'>Simulator Bot</span><br>" + 
                        "<span id='callingString2' style='font-size: 12px;'>&nbsp;Incoming call...</span>" +
                        "<br><br><br><button id='call-remote-decline-d' class='ui-corner-all' style='padding:2px;" +
                        " border-width:1px; background-color:red; color:white; font-size:14px; font-weight:bold; width:49%;'>Decline</button>&nbsp;&nbsp;" +
                        "<button id='call-remote-answer-d' class='ui-corner-all' style='padding:2px; border-width:1px; background-color:green; color:white; font-size:14px; font-weight:bold; width:49%;'>Answer</button>");
        jQuery("#call-remote-answer-d").bind("click", _remoteCall);
        jQuery("#call-remote-decline-d").bind("click", _remoteEnd);
        _callingEffectTimer = window.setInterval(CallingEffect, 800);
        break;
    case _status.PLACED:      // Remote Call
        jQuery("#call-local-text").html("Accept");
        jQuery("#end-local-text").html("Reject");
        jQuery("#call-status").html(statusStringList[0] + localName);
        jQuery("#remote-call-status").html(statusStringList[1]);
        jQuery("#remote-call-status").html("<span style='font-size: 22px;'>Simulator Bot</span><br>" + 
                        "<span id='callingString' style='font-size: 14px;'>&nbsp;Calling..." + 
                        "</span><br><br><br><button id='call-remote-end-d' class='ui-corner-all' style='padding:2px;" +
                        " border-width:1px; background-color:red; color:white; font-size:14px; font-weight:bold; width:100%;'>End call</button>");
        jQuery("#call-remote-end-d").bind("click", _remoteEnd);
        jQuery("#call-status").html("<span style='font-size: 22px;'>" + localName + "</span><br>" + 
                        "<span id='callingString2' style='font-size: 14px;'>&nbsp;Incoming call...</span>" +
                        "<br><br><br><button id='call-local-decline-d' class='ui-corner-all' style='padding:2px;" +
                        " border-width:1px; background-color:red; color:white; font-size:14px; font-weight:bold; width:49%;'>Decline</button>&nbsp;&nbsp;" +
                        "<button id='call-local-answer-d' class='ui-corner-all' style='padding:2px; border-width:1px;" +
                        " background-color:green; color:white; font-size:14px; font-weight:bold; width:49%;'>Answer</button>");
        jQuery("#call-local-answer-d").bind("click", _localCall);
        jQuery("#call-local-decline-d").bind("click", _localEnd);
        _callingEffectTimer = window.setInterval(CallingEffect, 800);
        break;
    case _status.INPROGRESS:
        jQuery("#call-status").html("<span style='font-size: 22px;'>" + localName + "</span><br>" + 
                        "<span id='ConvTimeString' style='font-size: 14px;'>" + "00:00:00" + 
                        "</span><br><br><br><button id='call-local-end-d-c' class='ui-corner-all' style='padding:2px;" +
                        " border-width:1px; background-color:red; color:white; font-size:14px; font-weight:bold; width:100%;'>End call</button>");
        jQuery("#remote-call-status").html("<span style='font-size: 22px;'>Simulator Robot</span><br>" + 
                        "<span id='ConvTimeString2' style='font-size: 14px;'>" + "00:00:00" + 
                        "</span><br><br><br><button id='call-remote-end-d-c' class='ui-corner-all' style='padding:2px;" +
                        " border-width:1px; background-color:red; color:white; font-size:14px; font-weight:bold; width:100%;'>End call</button>");
        jQuery("#call-local-end-d-c").bind("click", _localEnd);
        jQuery("#call-remote-end-d-c").bind("click", _remoteEnd);
        _conversationTimer = window.setInterval(updateConvTime, 1000);
        jQuery("#call-remote-text").html("Call");
        jQuery("#end-remote-text").html("End");
        jQuery("#call-local-text").html("Call");
        jQuery("#end-local-text").html("End");
        break;
    default:
        jQuery("#call-status").html(statusStringList[0]);
        jQuery("#call-status").html("default");
        jQuery("#remote-call-status").html(statusStringList[1]);
        jQuery("#remote-call-status").html("default");
        jQuery("#call-remote-text").html("Call");
        jQuery("#end-remote-text").html("End");
        jQuery("#call-local-text").html("Call");
        jQuery("#end-local-text").html("End");
        return;
    }
}

function _startCall() {
    _data.conversationStartTime = new Date();
    event.trigger("CallInProgress", [true]);
    _data.status = _status.INPROGRESS;
    //_transferStatus();
}

function _endCall(callEndReason) {
    if (_data.autoAcceptTimerId) {
        var path = _RECORDING_PATH + _record.serviceId + ".mp3";

        _record.recording.push(path);
        db.saveObject(_RECORDING_KEY, path);

        clearTimeout(_data.autoAcceptTimerId);
        _data.autoAcceptTimerId = null;
    }

    _record.duration = _data.conversationStartTime ? ((new Date()) - _data.conversationStartTime) : 0;
    _data.conversationStartTime = null;
    
    _record.endReason = callEndReason;

    if (_data.status === _status.PLACED) {
        _record.direction = "missed-new";
    }

    event.trigger("CallRecorded", [_record]);
    event.trigger("CallInProgress", [false]);

    _data.status = _status.IDLE;
    _transferStatus();
    _record = {};

    _conversationSeconds = 0;
    window.clearInterval(_conversationTimer);
    jQuery("#call-status").hide();
    jQuery("#remote-call-status").hide();

    jQuery("#status-text").hide();
    jQuery("#remote-status-text").hide();
}

function _localCall() {
    if (_data.isInException) {
        return;
    }

    switch (_data.status) {
    case _status.IDLE:    //local call
        _data.status = _status.DIALED;
        _initRecord();
        _record.direction = "dialed";
        break;
    case _status.PLACED:
        _data.status = _status.INPROGRESS;
        _record.direction = "received";
        if (_data.autoAcceptTimerId) {
            clearTimeout(_data.autoAcceptTimerId);
            _data.autoAcceptTimerId = null;
        }
        _startCall();
        break;
    default:
        return;
    }

    _transferStatus();

    if (_data.isInException) {
        _endCall(document.getElementById("call-exception-type").value);
    }
}

function _localEnd() {
    switch (_data.status) {
    case _status.DIALED:     // Local Cancel
    case _status.INPROGRESS: // Local End
        _endCall("local");
        break;
    case _status.PLACED:
        _record.direction = "missed-new";
        _endCall("local");
        break;
    default:
        return;
    }
}

function _remoteCall() {
    if (_data.isInException) {
        return;
    }

    switch (_data.status) {
    case _status.IDLE:      // Remote Call
        _data.status = _status.PLACED; 
        _initRecord();
        if (_data.isAutoAccept) {
            _data.autoAcceptTimerId = setTimeout(_localCall, 2000);
        }
        break;
    case _status.DIALED:    // Remote Answer
        _startCall();
        break;
    default:
        return;
    }

    _transferStatus();

    if (_data.isInException) {
        _endCall(document.getElementById("call-exception-type").value);
    }
}

function _remoteEnd() {
    switch (_data.status) {
    case _status.DIALED:     // Remote Reject
        _endCall("rejected");
        break;
    case _status.INPROGRESS: // Remote End
        _endCall("remote");
        break;
    case _status.PLACED:    // Remote Cancel
        _record.direction = "missed-new";
        _endCall("remote");
        break;
    default:
        return;
    }
}

function _leaveMessage() {
    if (!this.checked && _data.autoAcceptTimerId) {
        clearTimeout(_data.autoAcceptTimerId);
        _data.autoAcceptTimerId = null;
    }
    _data.isAutoAccept = this.checked;
}

function _exceptionStatus() {
    _data.isInException = this.checked;
    if (_data.isInException && (_data.status !== _status.IDLE)) {
        if (_data.status === _status.RECEIVED) {   // Remote Cancel
            _record.direction = "missed-new";
            _record.duration = 0;
        }
        _endCall(document.getElementById("call-exception-type").value);
    }
}


function _updateRemotePartyName() {
    jQuery("#remotePartyName").text(jQuery("#call-local-phone-number option:selected").text());
}


module.exports = {
    panel: {
        domId: "call-container",
        collapsed: true,
        pane: "left"
    },
    initialize: function () {
        jQuery("#call-local-call").bind("click", _localCall);
        jQuery("#call-local-end").bind("click", _localEnd);
        jQuery("#call-remote-call").bind("click", _remoteCall);
        jQuery("#call-remote-end").bind("click", _remoteEnd);
        jQuery("#recording-status").bind("click", _leaveMessage);
        jQuery("#call-exception-status").bind("click", _exceptionStatus);
        jQuery("#call-exception-type").bind("click", null);

        _initEventWatchers();
        _initContacts();
        jQuery("#remotePartyName").text(jQuery("#call-local-phone-number option:selected").text());
        jQuery("#call-local-phone-number").bind("change", _updateRemotePartyName);
        _initExceptionTypes();
    }
};
