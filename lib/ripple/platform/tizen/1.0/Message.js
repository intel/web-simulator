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

var utils = require('ripple/utils'),
    msg_utils = require('ripple/platform/tizen/1.0/msg_utils'),
    MessageBody = require('ripple/platform/tizen/1.0/MessageBody'),
    CommonError = require('ripple/platform/tizen/1.0/CommonError');

module.exports = function (type, messageInit) {
    var _id = null, _serviceId = null, _conversationId = null,
        _folderId = null, _type = type, _timestamp = null,
        _from = null, _hasAttachment = false, _messageStatus = null,
        msg = {};

    if (messageInit !== undefined && messageInit !== null) {
        if (msg_utils.setMsg(messageInit, msg) === false) {
            throw (new CommonError("TYPE_MISMATCH_ERROR"));
        }
        if (messageInit.priv !== undefined) {
            /* secret constructor for PrivateMessage */
            _id = messageInit.priv.id;
            _serviceId = messageInit.priv.serviceId;
            _conversationId = messageInit.priv.conversationId;
            _folderId = messageInit.priv.folderId;
            _type = messageInit.priv.type;
            _timestamp = new Date(messageInit.priv.timestamp);
            _from = messageInit.priv.from;
            _hasAttachment = messageInit.priv.hasAttachment;
            _messageStatus = messageInit.priv.messageStatus;
        }
        msg.body = new MessageBody(_id, msg.body.loaded, msg.body.plainBody, msg.body.htmlBody, []);
    }

    msg.__defineGetter__("id", function () {
        return _id;
    });
    msg.__defineGetter__("serviceId", function () {
        return _serviceId;
    });
    msg.__defineGetter__("conversationId", function () {
        return _conversationId;
    });
    msg.__defineGetter__("folderId", function () {
        return _folderId;
    });
    msg.__defineGetter__("type", function () {
        return _type;
    });
    msg.__defineGetter__("timestamp", function () {
        return _timestamp;
    });
    msg.__defineGetter__("from", function () {
        return _from;
    });
    msg.__defineGetter__("hasAttachment", function () {
        return _hasAttachment;
    });
    msg.__defineGetter__("messageStatus", function () {
        return _messageStatus;
    });
    return msg;
};
