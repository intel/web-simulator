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
        RECEIVED:   3,
        INPROGRESS: 4
    },
    _statusInfo = [
        "",          // IDLE
        "",          // DIALED
        "> > > > >", // PLACED, Calling
        "< < < < <", // RECEIVED, Incoming Call
        "< < = > >"  // INPROGRESS, Connected
    ],
    _data = {
        status: 0,
        isInException: false
    },
    _defaultContacts = [
        {
            remoteParty: "13800138000",
            displayName: "Smith",
            contactRef: null
        },
        {
            remoteParty: "10086",
            displayName: "Jones",
            contactRef: null
        },
        {
            remoteParty: "10010",
            displayName: "Johnson",
            contactRef: null
        }
    ],
    _autoRecord = false,
    _CONTACT_KEY = "tizen1-contact",
    _RECORDING_KEY = "tizen1-call-recording",
    _RECORDING_PATH = "home/media/",
    _record = {}; // Keys: callParticipants, forwardedFrom, startTime, duration, endReason, direction

function _initEventWatchers() {
    event.on("DialerLaunched", function () {
        if (_data.status === _status.IDLE) {
            _data.status = _status.DIALED;
        }
    });
}

function _saveRecording(path) {
    db.saveObject(_RECORDING_KEY, path);
}

function _retriveContacts() {
    var data = db.retrieveObject(_CONTACT_KEY), contacts = [],
        displayName, number;

    utils.forEach(data, function (addrBook) {
        utils.forEach(addrBook._contacts, function (contact) {
            if (contact.name && contact.name && contact.phoneNumbers && 
                contact.phoneNumbers.length > 0) {
                displayName = contact.name.firstName + ' ' + contact.name.lastName;
                number = contact.phoneNumbers[0].number;

                contacts.push({
                    remoteParty: number,
                    displayName: displayName,
                    contactRef: null
                });
            }
        });
    });

    return contacts;
}

function _initContacts() {
    var index, contactList = [],
        contactsSelect = document.getElementById("call-local-phone-number"),
        remoteSelect = document.getElementById("call-remote-phone-number");
        
    contactsSelect.innerHTML = "";
    remoteSelect.innerHTML = "";

    contactList = _retriveContacts();
    if (contactList.length <= 0) {
        contactList = utils.copy(_defaultContacts);
    }

    for (index = 0; index < contactList.length; index++) {
        contactsSelect.appendChild(utils.createElement("option", {
            "innerText": contactList[index]["displayName"],
            "value": index
        }));

        remoteSelect.appendChild(utils.createElement("option", {
            "innerText": contactList[index]["displayName"] + ':' + contactList[index]["remoteParty"],
            "value": index
        }));
    }
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
    var remotePartString = jQuery("#call-remote-phone-number option:selected").text(),
        localPartString = jQuery("#call-local-phone-number option:selected").text(),
        displayName, remoteParty, localParty, stringList;

    _record = {};
    _record.serviceId = (new Date()).getTime() || 0;
    _record.callParticipants = null;
    _record.forwardedFrom = null;
    _record.startTime = new Date();
    _record.recording = [];

    stringList = remotePartString.split(":");
    if (stringList.length > 1) {
        displayName = stringList[0];

        remoteParty = {
            remoteParty: stringList[1],
            displayName: displayName,
            contactRef: null
        };

        _record.callParticipants = [];
        _record.callParticipants.push(remoteParty);
    }

    if (localPartString) {
        localParty = {
            remoteParty: "",
            displayName: localPartString,
            contactRef: null
        };

        _record.forwardedFrom = localParty;
    }     
}

function _transferStatus() {
    jQuery("#call-status").show();
    jQuery("#call-status-arrow").html(_statusInfo[_data.status]);

    switch (_data.status) {
    case _status.PLACED:  // local call
        jQuery("#call-remote-text").html("Accept");
        jQuery("#end-remote-text").html("Reject");
        jQuery("#status-text").show();
        break;
    case _status.RECEIVED:      // Remote Call
        jQuery("#call-local-text").html("Accept");
        jQuery("#end-local-text").html("Reject");
        jQuery("#status-text").show();
        break;
    default:
        jQuery("#call-remote-text").html("Call");
        jQuery("#end-remote-text").html("End");
        jQuery("#call-local-text").html("Call");
        jQuery("#end-local-text").html("End");
    }
}

function _startCall() {
    _data.status = _status.INPROGRESS;
    event.trigger("CallInProgress", [true]);
    
    _record.startTime = new Date(); //If the call is started successfully, this start time will be covered
}

function _endCall(callEndReason) {
    _data.status = _status.IDLE;

    if (_record.duration === null || _record.duration === undefined) {
        _record.duration = _record.startTime ? ((new Date()) - _record.startTime) : null;
    }
    _record.endReason = callEndReason;

    if (_autoRecord) {
        var path = _RECORDING_PATH + _record.serviceId + ".mp3";

        _record.recording.push(path);
        _saveRecording(path);
    }

    event.trigger("CallRecorded", [_record]);
    event.trigger("CallInProgress", [false]);
    jQuery("#status-text").hide();
}

function _localCall() {
    if (_data.isInException) {
        if (_data.status === _status.DIALED) {
            _endCall(document.getElementById("call-exception-type").value);
            _record = {};
        }
        return;
    }

    _initRecord();

    switch (_data.status) {
    case _status.IDLE:      // @franky For the next call from local
    case _status.DIALED:    // Local Call
        _data.status = _status.PLACED;
        break;
    case _status.RECEIVED:  // Local Answer
        _startCall();
        break;
    default:
        return;
    }

    _transferStatus();

    _record.direction = "dialed";
}

function _localEnd() {
    if (_data.isInException)
        return;

    switch (_data.status) {
    case _status.PLACED:     // Local Cancel
        _record.direction = "dialed";
        _record.duration = 0;
        _endCall("local");
        break;
    case _status.RECEIVED:   // Local Reject
    case _status.INPROGRESS: // Local End
        _record.direction = "received";
        _endCall("local");
        break;
    default:
        _record.direction = "missed";
        _record.duration = 0;
        return;
    }

    _transferStatus();
}

function _remoteCall() {
    if (_data.isInException)
        return;

    _initRecord();

    switch (_data.status) {
    case _status.IDLE:      // Remote Call
    case _status.DIALED:
        _data.status = _status.RECEIVED;
        break;
    case _status.PLACED:    // Remote Answer
        _startCall();
        break;
    default:
        return;
    }

    _transferStatus();

    if (_data.status === _status.RECEIVED && _autoRecord) {
        setTimeout(_localCall, 1000);
        setTimeout(_localEnd, 4000);
    }
}

function _remoteEnd() {
    if (_data.isInException)
        return;

    switch (_data.status) {
    case _status.PLACED:     // Remote Reject
        _record.direction = "dialed";
        _record.duration = 0;
        _endCall("rejected");
        break;
    case _status.RECEIVED:   // Remote Cancel
        _record.direction = "missed";
        _record.duration = 0;
        _endCall("remote");
        break;
    case _status.INPROGRESS: // Remote End
        _record.direction = "received";
        _endCall("remote");
        break;
    default:
        _record.direction = "missed";
        _record.duration = 0;
        return;
    }

    _transferStatus();
}

function _leaveMessage() {
    _autoRecord = this.checked;
}

function _exceptionStatus() {
    _data.isInException = this.checked;
    if (_data.isInException && (_data.status !== _status.IDLE)) {
        _endCall(document.getElementById("call-exception-type").value);
        _transferStatus();
    }
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
        _initExceptionTypes();
    }
};
