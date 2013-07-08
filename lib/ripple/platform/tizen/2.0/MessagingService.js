/*
 *  Copyright 2012 Intel Corporation.
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
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    deviceSettings = require('ripple/deviceSettings'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    PrivMessage = require('ripple/platform/tizen/2.0/PrivMessage'),
    MessageStorage = require('ripple/platform/tizen/2.0/MessageStorage'),
    msg_utils = require('ripple/platform/tizen/2.0/msg_utils'),
    t = require('ripple/platform/tizen/2.0/typedef'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    _self,
    TIZEN_DEFAULT_MSG_FROM = {"messaging.sms": "13572468",
                              "messaging.mms": "13572468",
                              "messaging.email": "tizen.simulator@tizen.org"},
    INCOMING_TYPE = {"messaging.sms": "sms",
                     "messaging.mms": "mms",
                     "messaging.email": "email"};

_self = function (id, type, security_check) {
    var msg_service = {},
        pendingOperations = {},
        _msgSending = {},
        _receivedEmails = [],
        _id = id,
        _type = type,
        _security_check = security_check,
        _from = TIZEN_DEFAULT_MSG_FROM[_type],
        _incomingType = INCOMING_TYPE[_type],
        _messages = msg_utils.loadMsg(_type, _id),
        _messageStorage = new MessageStorage(_messages, _security_check);

    event.on("MessageSent", function (rst) {
        var i, rsp_ok = [], rsp_fail = [];
        // rst.msg is the real msg in module
        if (rst.msg.priv.type !== _type ||
            rst.msg.priv.serviceId !== _id) {
            // not my msg
            return;
        }
        if (_msgSending[rst.id] !== undefined) {
            for (i in rst) {
                if ((i !== "id") && (i !== "msg")) {
                    if (rst[i] === true) {
                        rsp_ok.push(i);
                    } else {
                        rsp_fail.push(i);
                    }
                }
            }
            rst.msg.priv.folderId = "SENTBOX";
            if (rsp_fail.length === 0) {
                rst.msg.priv.messageStatus = "SENT";
                _msgSending[rst.id].onsuccess(rsp_ok);
            } else {
                rst.msg.priv.messageStatus = "FAILED";
                _msgSending[rst.id].onerror(rsp_fail);
            }
            msg_utils.saveMsg(rst.msg);  // sync to remote
            event.trigger("MsgSentRst", [rst.msg]);
            delete _msgSending[rst.id];
        }
    });

    event.on("MessageReceived", function (rst) {
        var m, opt = {}, msgInit = {}, msg = {};

        if (rst.type !== _incomingType) {
            // not my msg
            return;
        }
        msgInit.plainBody = rst.body;
        msgInit.to = [_from];
        // TODO: handle attachment
        if (msg_utils.setMsg(msgInit, msg) === false) {
            throw (new WebAPIException(errorcode.TYPE_MISMATCH_ERR, "received message error"));
        }
        opt.id = Math.uuid(8, 16);
        opt.serviceId = _id;
        opt.conversationId = opt.id;
        opt.folderId = "INBOX";
        opt.type = _type;
        opt.timestamp = new Date();
        opt.from = rst.from;
        if (msg.attachments.length === 0) {
            opt.hasAttachment = false;
        } else {
            opt.hasAttachment = true;
        }
        opt.messageStatus = "RECEIVED";
        m = new PrivMessage(msg, opt);
        msg_utils.saveMsg(m);   // save in server
        if (_type !== "messaging.email") {
            _messages.msg[m.priv.id] = m;  // sync to local
            event.trigger("MsgRecv", [m]);
        } else {
            _receivedEmails.push(m);  // don't sync to local yet
        }
    });

    msg_service = {
        sendMessage: function (_msg, onSuccess, onError) {
            var m, msg = {}, opt = {}, shortMsg = {}, rst = {};
            if (_security_check.write === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (_msg === null || _msg === undefined || _msg.id === undefined) {
                throw (new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
            }

            if (msg_utils.setMsg(_msg, msg) === false) {
                throw (new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
            }
            if ((arguments.length > 1) && onSuccess !== null && !(new TypeCoerce(t.SuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if ((arguments.length > 2) && onError !== null && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (deviceSettings.retrieve("CELLULAR_NETWORK.status") === false &&
                (_incomingType === 'sms' || _incomingType === 'mms')) {
                if (onError) {
                    setTimeout(function () {
                        onError(new WebAPIError(errorcode.NETWORK_ERR));
                    }, 1);
                }
                return;
            }
            if (deviceSettings.retrieve("WIFI_NETWORK.status") === false &&
                _incomingType === 'email') {
                if (onError) {
                    setTimeout(function () {
                        onError(new WebAPIError(errorcode.NETWORK_ERR));
                    }, 1);
                }
                return;
            }
            if (typeof _msg.id === 'string') {
                if (_messages.msg[_msg.id] === undefined) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return;
                }
                if (_messages.msg[_msg.id].priv.messageStatus === "DRAFT") {
                    msg_utils.delMsg(_messages.msg[_msg.id]);
                    delete _messages.msg[_msg.id];
                } else {
                    // if msg found in storage, it can only be a draft.
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.UNKNOWN_ERR));
                        }, 1);
                    }
                    return;
                }
            }
            opt.id = Math.uuid(8, 16);
            opt.serviceId = _id;
            if ((msg.inResponseTo !== null) &&
                (_messages.msg[msg.inResponseTo] !== undefined) &&
                (_messages.msg[msg.inResponseTo].priv.messageStatus !== "DRAFT")) {
                opt.conversationId = _messages.msg[msg.inResponseTo].priv.conversationId;
            } else {
                opt.conversationId = opt.id;
            }
            opt.folderId = "OUTBOX";
            opt.type = _type;
            opt.timestamp = new Date();
            opt.from = _from;
            if (msg.attachments.length === 0) {
                opt.hasAttachment = false;
            } else {
                opt.hasAttachment = true;
            }
            opt.messageStatus = "SENDING";

            m = new PrivMessage(msg, opt);
            _messages.msg[m.priv.id] = m;
            msg_utils.saveMsg(m);  // sync to remote
            shortMsg.msg = m;   // pass by ref
            shortMsg.id = m.priv.id;
            shortMsg.body = m.body.plainBody;
            shortMsg.to = m.to.slice(0);
            shortMsg.cc = m.cc.slice(0);
            shortMsg.bcc = m.bcc.slice(0);
            event.trigger("OutsideMessageReceived", [shortMsg]);
            rst.onsuccess = onSuccess;
            rst.onerror = onError;
            _msgSending[m.priv.id] = rst;
        },

        loadMessageBody: function (msg, onSuccess, onError) {
            var pendingID;
            if (_security_check.write === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (_messages.msg[msg.id] === undefined) {
                throw (new WebAPIException(errorcode.NOT_FOUND_ERR));
            }
            if (!(new TypeCoerce(t.MessageBodySuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if ((arguments.length > 2) && onError !== null && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            pendingID = setTimeout(function () {
                if (pendingOperations.hasOwnProperty(pendingID) === false) {
                    // has been cancelled/expired
                    return;
                }
                delete pendingOperations[pendingID];
                onSuccess(_messages.msg[msg.id].body);
            }, 1);
            pendingOperations[pendingID] = onError;
            return pendingID;
        },
        loadMessageAttachment: function (msg, onSuccess, onError) {
            var pendingID;

            if (_security_check.write === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (_messages.msg[msg.id] === undefined) {
                throw (new WebAPIException(errorcode.NOT_FOUND_ERR));
            }
            if (!(new TypeCoerce(t.MessageAttachmentSuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if ((arguments.length > 2) && onError !== null && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            pendingID = setTimeout(function () {
                if (pendingOperations.hasOwnProperty(pendingID) === false) {
                    // has been cancelled/expired
                    return;
                }
                delete pendingOperations[pendingID];
                onSuccess(_messages.msg[msg.id].attachments);
            }, 1);
            pendingOperations[pendingID] = onError;
            return pendingID;
        },
        sync: function (successCallback, errorCallback, limit) {
            var i, m, pendingID;

            if (_security_check.write === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if ((arguments.length > 0) && successCallback !== null && !(new TypeCoerce(t.SuccessCallback)).match(successCallback)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if ((arguments.length > 1) && errorCallback !== null && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if ((arguments.length > 2) && limit !== null && !(new TypeCoerce(t.long)).match(limit)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            pendingID = setTimeout(function () {
                if (pendingOperations.hasOwnProperty(pendingID) === false) {
                    // has been cancelled/expired
                    return;
                }
                delete pendingOperations[pendingID];
                for (i = 0; i < _receivedEmails.length; i++) {
                    m = _receivedEmails[i];
                    _messages.msg[m.priv.id] = m;  // sync to local
                    event.trigger("MsgRecv", [m]);
                }
                _receivedEmails = [];
                if (successCallback) {
                    successCallback();
                }
            }, 1);
            pendingOperations[pendingID] = errorCallback;
            return pendingID;
        },

        syncFolder: function (folder, onSuccess, onError, limit) {
            var i, m, pendingID;

            if (_security_check.write === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (!(new TypeCoerce(t.MessageFolder)).match(folder)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if ((arguments.length > 1) && onSuccess !== null && !(new TypeCoerce(t.SuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if ((arguments.length > 2) && onError !== null && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if ((arguments.length > 3) && limit !== null && !(new TypeCoerce(t.long)).match(limit)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            pendingID = setTimeout(function () {
                if (pendingOperations.hasOwnProperty(pendingID) === false) {
                    // has been cancelled/expired
                    return;
                }
                delete pendingOperations[pendingID];
                if (folder.id === "INBOX") {
                    for (i = 0; i < _receivedEmails.length; i++) {
                        m = _receivedEmails[i];
                        _messages.msg[m.priv.id] = m;  // sync to local
                        event.trigger("MsgRecv", [m]);
                    }
                    _receivedEmails = [];
                }
                onSuccess();
            }, 1);
            pendingOperations[pendingID] = onError;
            return pendingID;
        },

        stopSync: function (pendingID) {
            if (!(new TypeCoerce(t.long)).match(pendingID)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (pendingOperations[pendingID] !== undefined) {
                clearTimeout(pendingID);
                pendingOperations[pendingID](new WebAPIError(errorcode.ABORT_ERR));
            }
            delete pendingOperations[pendingID];
        }
    };
    msg_service.__defineGetter__("type", function () {
        return _type;
    });
    msg_service.__defineGetter__("messageStorage", function () {
        return _messageStorage;
    });
    return msg_service;
};

module.exports = _self;
