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
var _self,
    utils = require('ripple/utils'),
    event = require('ripple/event'),
    Message = require('ripple/platform/tizen/2.0/Message'),
    Conversation = require('ripple/platform/tizen/2.0/Conversation'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    PrivMessage = require('ripple/platform/tizen/2.0/PrivMessage'),
    MessageFolder = require('ripple/platform/tizen/2.0/MessageFolder'),
    msg_utils = require('ripple/platform/tizen/2.0/msg_utils'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    t = require('ripple/platform/tizen/2.0/typedef'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    TIZEN_DEFAULT_MSG_FROM = {"messaging.sms": "13572468",
                              "messaging.mms": "13572468",
                              "messaging.email": "tizen.simulator@tizen.org"};

_self = function (messages, security_check) {
    var message_storage = {},
        _findMessage, _findConversation,
        _processMessageChange, _processConversationChange,
        _folders = {}, folderOpt = {},
        _msgListeners = {},
        _convListeners = {},
        _folderListeners = {},
        _security_check = security_check,
        _messages = messages;

    // init folders
    folderOpt = {id: "INBOX", serviceId: _messages.id, contentType: _messages.type,
                 path: "inbox", type: "INBOX", synchronizable: true};
    _folders.INBOX = new MessageFolder(folderOpt);
    folderOpt = {id: "OUTBOX", serviceId: _messages.id, contentType: _messages.type,
                 path: "outbox", type: "OUTBOX", synchronizable: false};
    _folders.OUTBOX = new MessageFolder(folderOpt);
    folderOpt = {id: "DRAFT", serviceId: _messages.id, contentType: _messages.type,
                 path: "draft", type: "DRAFTS", synchronizable: false};
    _folders.DRAFT = new MessageFolder(folderOpt);
    folderOpt = {id: "SENTBOX", serviceId: _messages.id, contentType: _messages.type,
                 path: "sentbox", type: "SENTBOX", synchronizable: false};
    _folders.SENTBOX = new MessageFolder(folderOpt);

    event.on("MsgRecv", function (msg) {
        // msg sent from panel to module
        if (msg.priv.type !== _messages.type ||
            msg.priv.serviceId !== _messages.id) {
            return;
        }
        // trigger Message add
        _processMessageChange([msg], "add");
        _messages.conv = msg_utils.loadConv(_messages.type, _messages.id);

        if (_messages.conv[msg.priv.conversationId].messageCount === 1) {
            _processConversationChange([_messages.conv[msg.priv.conversationId]], "add");
        } else {
            _processConversationChange([_messages.conv[msg.priv.conversationId]], "update");
        }
    });

    event.on("OutsideMessageReceived", function (msg) {
        // msg sent from module to panel
        if (msg.msg.priv.type !== _messages.type ||
            msg.msg.priv.serviceId !== _messages.id) {
            return;
        }
        // trigger conversation/Message add
        _processMessageChange([msg.msg], "add");
        _messages.conv = msg_utils.loadConv(_messages.type, _messages.id);

        if (_messages.conv[msg.msg.priv.conversationId].messageCount === 1) {
            _processConversationChange([_messages.conv[msg.msg.priv.conversationId]], "add");
        } else {
            _processConversationChange([_messages.conv[msg.msg.priv.conversationId]], "update");
        }
    });

    event.on("MsgSentRst", function (rst) {
        // ACK from panel when module sent a msg to panel
        if (rst.priv.type !== _messages.type ||
            rst.priv.serviceId !== _messages.id) {
            return;
        }
        // trigger conversation/Message Update
        _processMessageChange([rst], "update");
        _messages.conv = msg_utils.loadConv(_messages.type, _messages.id);
        _processConversationChange([_messages.conv[rst.priv.conversationId]], "update");
    });

    _findMessage = function (src, filter) {
        var ret, foo = {};
        switch (filter.attributeName) {
        case "type":
            foo[filter.attributeName] = _messages.type;
            ret = tizen1_utils.matchAttributeFilter([foo],
                      filter.attributeName, filter.matchFlag, filter.matchValue);
            if (ret.length === 0) {
                ret = [];
            } else {
                // make an array
                ret = utils.filter(src, function () { return true; });
            }
            break;
        case "id":
        case "conversationId":
        case "folderId":
        case "from":
        case "messageStatus":
            ret = tizen1_utils.matchAttributeFilter(src,
                      "priv." + filter.attributeName,
                      filter.matchFlag, filter.matchValue);
            break;
        case "hasAttachment":
            if (filter.matchFlag !== "EXACTLY" || typeof filter.matchValue !== "boolean") {
                throw (new WebAPIException(errorcode.INVALID_VALUES_ERR,
                              "Support only matchFlag === 'EXACTLY' and typeof matchValue === 'boolean'"));
            }
            ret = tizen1_utils.matchAttributeBooleanFilter(src,
                      "priv." + filter.attributeName, filter.matchValue);
            break;
        case "to":
        case "cc":
        case "bcc":
            ret = tizen1_utils.matchAttributeArrayFilter(src,
                      filter.attributeName, filter.matchFlag, filter.matchValue);
            break;
        case "body":
            ret = tizen1_utils.matchAttributeFilter(src,
                      filter.attributeName + ".plainBody",
                      filter.matchFlag, filter.matchValue);
            break;
        case "subject":
        case "inResponseTo":
            ret = tizen1_utils.matchAttributeFilter(src, filter.attributeName,
                      filter.matchFlag, filter.matchValue);
            break;
        case "isRead":
        case "isHighPriority":
            if (filter.matchFlag !== "EXACTLY" || typeof filter.matchValue !== "boolean") {
                throw (new WebAPIException(errorcode.INVALID_VALUES_ERR,
                              "Support only matchFlag === 'EXACTLY' and typeof matchValue === 'boolean'"));
            }
            ret = tizen1_utils.matchAttributeBooleanFilter(src,
                      filter.attributeName, filter.matchValue);
            break;
        case "timestamp":
            ret = tizen1_utils.matchAttributeRangeFilter(src,
                      "priv." + filter.attributeName,
                      filter.initialValue, filter.endValue);
            break;

        case "attachments":
            throw (new WebAPIException(errorcode.NOT_SUPPORTED_ERR,
                                  "not support find by " + filter.attributeName));
        default:
            throw (new WebAPIException(errorcode.INVALID_VALUES_ERR,
                                   "invalid attributeName"));
        }
        return ret;
    };

    _processMessageChange = function (messages, type) {
        var i, j, ret = [], tmp,
            operation = {"add": "messagesadded",
                         "remove": "messagesremoved",
                         "update": "messagesupdated"};

        for (i in _msgListeners) {
            ret = [];
            if (_msgListeners[i].filter !== null) {
                tmp = _findMessage(messages, _msgListeners[i].filter);
            } else {
                tmp = messages;
            }
            if (tmp.length !== 0) {
                for (j = 0; j < tmp.length; j++) {
                    ret.push(new Message(tmp[j].priv.type, tmp[j]));
                }
                _msgListeners[i].callback[operation[type]](ret);
            }
        }
    };

    _findConversation = function (src, filter) {
        var ret, foo = {};
        switch (filter.attributeName) {
        case "type":
            foo[filter.attributeName] = _messages.type;
            ret = tizen1_utils.matchAttributeFilter([foo], filter.attributeName, filter.matchFlag, filter.matchValue);
            if (ret.length === 0) {
                ret = [];
            } else {
                // make an array
                ret = utils.filter(_messages.conv, function () { return true; });
            }
            break;
        case "id":
        case "preview":
        case "subject":
        case "from":
        case "lastMessageId":
            ret = tizen1_utils.matchAttributeFilter(src, filter.attributeName, filter.matchFlag, filter.matchValue);
            break;
        case "to":
        case "cc":
        case "bcc":
            ret = tizen1_utils.matchAttributeArrayFilter(src,
                      filter.attributeName, filter.matchFlag, filter.matchValue);
            break;
        case "isRead":
            if (filter.matchFlag !== "EXACTLY" || typeof filter.matchValue !== "boolean") {
                throw (new WebAPIException(errorcode.INVALID_VALUES_ERR,
                              "Support only matchFlag === 'EXACTLY' and typeof matchValue === 'boolean'"));
            }
            ret = tizen1_utils.matchAttributeBooleanFilter(src,
                      filter.attributeName, filter.matchValue);
            break;
        case "timestamp":
        case "messageCount":
        case "unreadMessages":
            ret = tizen1_utils.matchAttributeRangeFilter(src,
                      filter.attributeName,
                      filter.initialValue, filter.endValue);
            break;
        default:
            throw (new WebAPIException(errorcode.INVALID_VALUES_ERR,
                                   "invalid attributeName"));
        }
        return ret;
    };

    _processConversationChange = function (conversations, type) {
        var i, j, ret = [], tmp,
            operation = {"add": "conversationsadded",
                         "remove": "conversationsremoved",
                         "update": "conversationsupdated"};

        for (i in _convListeners) {
            ret = [];
            if (_convListeners[i].filter !== null) {
                tmp = _findConversation(conversations, _convListeners[i].filter);
            } else {
                tmp = conversations;
            }
            if (tmp.length !== 0) {
                for (j = 0; j < tmp.length; j++) {
                    ret.push(new Conversation(tmp[j]));
                }
                _convListeners[i].callback[operation[type]](ret);
            }
        }
    };

    message_storage = {
        addDraftMessage: function (_msg, onSuccess, onError) {
            var m, msg = {}, opt = {};

            if (_security_check.write === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (msg_utils.setMsg(_msg, msg) === false) {
                throw (new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
            }
            if (onSuccess && !(new TypeCoerce(t.SuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (onError && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            opt.id = Math.uuid(8, 16);
            opt.serviceId = _messages.id;
            if ((msg.inResponseTo !== null) &&
                (_messages.msg[msg.inResponseTo] !== undefined)) {
                opt.conversationId = _messages.msg[msg.inResponseTo].conversationId;
            } else {
                opt.conversationId = opt.id;
            }
            opt.folderId = "DRAFTS";
            opt.type = _messages.type;
            opt.timestamp = new Date();
            opt.from = TIZEN_DEFAULT_MSG_FROM[_messages.type];
            if (msg.attachments.length === 0) {
                opt.hasAttachment = false;
            } else {
                opt.hasAttachment = true;
            }
            opt.messageStatus = "DRAFT";

            m = new PrivMessage(msg, opt);
            _messages.msg[m.priv.id] = m;  // local
            msg_utils.saveMsg(_messages.msg[m.priv.id]);  // remote
            // trigger message add
            _processMessageChange([m], "add");
            if (onSuccess) {
                setTimeout(function () {
                    onSuccess(new Message(m.priv.type, m));
                }, 1);
            }
        },

        removeMessages: function (messages, onSuccess, onError) {
            var i, c, na_msg = "", msgToDel = [], convToDel = {}, delConv = [], updateConv = [];

            if (_security_check.write === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (tizen1_utils.isValidArray(messages) === false) {
                throw (new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
            }
            if (messages.length === 0) {
                throw (new WebAPIException(errorcode.INVALID_VALUES_ERR));
            }
            if (onSuccess && !(new TypeCoerce(t.SuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (onError && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }

            _messages.conv = msg_utils.loadConv(_messages.type, _messages.id);
            for (i = 0; i < messages.length; i++) {
                if (_messages.msg[messages[i].id] === undefined) {
                    na_msg += messages[i].id + ", ";
                } else {
                    msgToDel.push(utils.copy(_messages.msg[messages[i].id]));
                }
                if (_messages.conv[messages[i].conversationId] !== undefined) {
                    convToDel[messages[i].conversationId] = _messages.conv[messages[i].conversationId];
                }
            }
            if (na_msg === "") {
                for (i = 0; i < messages.length; i++) {
                    // conversation updated at remote when msg is deleted
                    msg_utils.delMsg(_messages.msg[messages[i].id]); // remote
                    delete _messages.msg[messages[i].id]; // local
                }
                // update conversation
                _messages.conv = msg_utils.loadConv(_messages.type, _messages.id);
                for (c in convToDel) {
                    if (_messages.conv[c] === undefined) {
                        delConv.push(convToDel[c]);
                    } else {
                        updateConv.push(convToDel[c]);
                    }
                }
                if (onSuccess) {
                    setTimeout(function () {
                        onSuccess();
                    }, 1);
                }
                // trigger messages remove
                _processMessageChange(msgToDel, "remove");
                if (delConv.length > 0) {
                    _processConversationChange(delConv, "remove");
                }
                if (updateConv.length > 0) {
                    _processConversationChange(updateConv, "update");
                }
            } else {
                if (onError) {
                    setTimeout(function () {
                        onError(new WebAPIError(errorcode.NOT_FOUND_ERR,
                                na_msg + "not found !!"));
                    }, 1);
                }
            }
        },

        updateMessages: function (messages, onSuccess, onError) {
            var i, m, updateConv = {}, updateMsg = [], tmp,
                na_msg = "", invalid_msg = "";

            if (_security_check.write === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (onSuccess && !(new TypeCoerce(t.SuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (onError && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (tizen1_utils.isValidArray(messages) === false) {
                throw (new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
            }
            if (messages.length === 0) {
                throw (new WebAPIException(errorcode.INVALID_VALUES_ERR));
            }
            // update conversation
            _messages.conv = msg_utils.loadConv(_messages.type, _messages.id);
            for (i = 0; i < messages.length; i++) {
                m = _messages.msg[messages[i].id];
                if (m === undefined) {
                    // msg not found
                    na_msg += messages[i].id + ", ";
                } else {
                    if (m.priv.messageStatus === "DRAFT") {
                        tmp = {};
                        // allow update all writeable attr in draft
                        if (msg_utils.setMsg(messages[i], tmp) === false) {
                            invalid_msg += messages[i].id + ", ";
                        }
                    }
                }
            }
            if (invalid_msg !== "") {
                if (onError) {
                    setTimeout(function () {
                        onError(new WebAPIError(errorcode.INVALID_VALUES_ERR,
                                invalid_msg + "invalid values"));
                    }, 1);
                }
                return;
            }
            if (na_msg !== "") {
                if (onError) {
                    setTimeout(function () {
                        onError(new WebAPIError(errorcode.NOT_FOUND_ERR,
                                na_msg + "not found !!"));
                    }, 1);
                }
                return;
            }

            for (i = 0; i < messages.length; i++) {
                m = _messages.msg[messages[i].id];
                if (m.priv.messageStatus === "DRAFT") {
                    msg_utils.setMsg(messages[i], m);
                    updateMsg.push(m);
                } else {
                    // only allow update isRead in other folders
                    if (typeof messages[i].isRead === 'boolean') {
                        m.isRead = messages[i].isRead;
                        updateMsg.push(m);
                        updateConv[m.priv.conversationId] = _messages.conv[m.priv.conversationId];
                    }
                }
                msg_utils.saveMsg(m);
            }
            if (onSuccess) {
                setTimeout(function () {
                    onSuccess();
                }, 1);
            }

            // trigger Message update
            _processMessageChange(updateMsg, "update");

            _messages.conv = msg_utils.loadConv(_messages.type, _messages.id);
            // trigger conversation update
            _processConversationChange(updateConv, "update");
        },

        findMessages: function (filter, onSuccess, onError, sort, _limit, _offset) {
            var i, tmp, offset, limit, ret = [];

            if (_security_check.read === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (!(new TypeCoerce(t.MessageArraySuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (onError && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (sort && !(new TypeCoerce(t.SortMode)).match(sort)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (_limit && !(new TypeCoerce(t.long)).match(_limit)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (_offset && !(new TypeCoerce(t.long)).match(_offset)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            tmp = _findMessage(_messages.msg, filter);

            if (_offset) {
                offset = _offset;
            } else {
                offset = 0;
            }
            if (_limit) {
                limit = Math.min(_limit + offset, tmp.length);
            } else {
                limit = tmp.length;
            }
            for (i = offset; i < limit; i++) {
                ret.push(new Message(tmp[i].priv.type, tmp[i]));
            }
            setTimeout(function () {
                onSuccess(ret);
            }, 1);
        },

        findConversations: function (filter, onSuccess, onError, sort, _limit, _offset) {
            var i, tmp, offset, limit, ret = [];

            if (_security_check.read === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (!(new TypeCoerce(t.MessageConversationArraySuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (onError && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (sort && !(new TypeCoerce(t.SortMode)).match(sort)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (_limit && !(new TypeCoerce(t.long)).match(_limit)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (_offset && !(new TypeCoerce(t.long)).match(_offset)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            // download conversation
            _messages.conv = msg_utils.loadConv(_messages.type, _messages.id);

            tmp = _findConversation(_messages.conv, filter);

            if (_offset) {
                offset = _offset;
            } else {
                offset = 0;
            }
            if (_limit) {
                limit = Math.min(_limit + offset, tmp.length);
            } else {
                limit = tmp.length;
            }
            for (i = offset; i < limit; i++) {
                ret.push(new Conversation(tmp[i]));
            }
            setTimeout(function () {
                onSuccess(ret);
            }, 1);
        },

        removeConversations: function (conversations, onSuccess, onError) {
            var i, m, na_msg = "", retConv = [], removeMsg = [];

            if (_security_check.write === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (onSuccess && !(new TypeCoerce(t.SuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (onError && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            // download conversation
            _messages.conv = msg_utils.loadConv(_messages.type, _messages.id);

            if (tizen1_utils.isValidArray(conversations) === false) {
                throw (new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
            }
            if (conversations.length === 0) {
                throw (new WebAPIException(errorcode.INVALID_VALUES_ERR));
            }
            if ((onSuccess && typeof onSuccess !== "function") ||
                (onError && typeof onError !== "function")) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }

            for (i = 0; i < conversations.length; i++) {
                if (_messages.conv[conversations[i].id] === undefined) {
                    na_msg += conversations[i].id + ", ";
                } else {
                    retConv.push(_messages.conv[conversations[i].id]);
                    for (m in _messages.msg) {
                        if (_messages.msg[m].priv.conversationId === conversations[i].id) {
                            removeMsg.push(_messages.msg[m]);
                        }
                    }
                }
            }
            if (na_msg === "") {
                for (i = 0; i < removeMsg.length; i++) {
                    // conversation updated at remote
                    msg_utils.delMsg(removeMsg[i]);  // remote
                    delete _messages.msg[removeMsg[i].priv.id]; // local
                }
                // trigger msg(retMsg)/conv(retConv) delete update
                _processMessageChange(removeMsg, "remove");
                _processConversationChange(retConv, "remove");
                if (onSuccess) {
                    setTimeout(function () {
                        onSuccess();
                    }, 1);
                }
            } else {
                if (onError) {
                    setTimeout(function () {
                        onError(new WebAPIError(errorcode.NOT_FOUND_ERR,
                                na_msg + "not found !!"));
                    }, 1);
                }
            }
        },

        findFolders: function (filter, onSuccess, onError) {
            var ret = [], tmp, i;

            if (_security_check.read === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (!(new TypeCoerce(t.MessageFolderArraySuccessCallback)).match(onSuccess)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (onError && !(new TypeCoerce(t.ErrorCallback)).match(onError)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            switch (filter.attributeName) {
            case "id":
            case "serviceId":
            case "contentType":
            case "name":
            case "path":
            case "type":
                tmp = tizen1_utils.matchAttributeFilter(_folders,
                          filter.attributeName, filter.matchFlag,
                          filter.matchValue);
                break;
            case "synchronizable":
                if (filter.matchFlag !== "EXACTLY" ||
                    typeof filter.matchValue !== "boolean") {
                    throw (new WebAPIException(errorcode.INVALID_VALUES_ERR,
                                  "Support only matchFlag === 'EXACTLY' and typeof matchValue === 'boolean'"));
                }
                tmp = tizen1_utils.matchAttributeBooleanFilter(_folders,
                          filter.attributeName, filter.matchValue);
                break;
            case "parentId":
                if (filter.matchValue === null) {
                    tmp = utils.filter(_folders, function (o) { return o.parentId === null; });
                } else {
                    tmp = tizen1_utils.matchAttributeFilter(_folders,
                              filter.attributeName, filter.matchValue);
                }
                break;
            default:
                throw (new WebAPIException(errorcode.INVALID_VALUES_ERR,
                                       "invalid attributeName"));
            }
            for (i = 0; i < tmp.length; i++) {
                ret.push(new MessageFolder(tmp[i]));
            }
            setTimeout(function () {
                onSuccess(ret);
            }, 1);
        },

        addMessagesChangeListener: function (msgCallback, filter) {
            var watchId, msgListener = {};

            if (_security_check.read === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (!(new TypeCoerce(t.MessagesChangeCallback)).match(msgCallback)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (filter && !(new TypeCoerce(t.AbstractFilter)).match(filter)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }

            watchId = Number(Math.uuid(8, 10));
            msgListener.callback = msgCallback;
            msgListener.filter = filter || null;
            _msgListeners[watchId] = msgListener;
            return watchId;
        },

        addConversationsChangeListener: function (convCallback, filter) {
            var watchId, convListener = {};

            if (_security_check.read === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (!(new TypeCoerce(t.MessageConversationsChangeCallback)).match(convCallback)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (filter && !(new TypeCoerce(t.AbstractFilter)).match(filter)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }

            watchId = Number(Math.uuid(8, 10));
            convListener.callback = convCallback;
            convListener.filter = filter || null;
            _convListeners[watchId] = convListener;
            return watchId;
        },

        addFoldersChangeListener: function (callback, filter) {
            var watchId, folderListener = {};

            if (_security_check.read === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (!(new TypeCoerce(t.MessageFoldersChangeCallback)).match(callback)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            if (filter && !(new TypeCoerce(t.AbstractFilter)).match(filter)) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }

            watchId = Number(Math.uuid(8, 10));
            folderListener.callback = callback;
            folderListener.filter = filter || null;
            _folderListeners[watchId] = folderListener;
            return watchId;
        },

        removeChangeListener: function (watchid) {
            if (_security_check.read === false) {
                throw (new WebAPIException(errorcode.SECURITY_ERR));
            }
            if (_msgListeners[watchid] !== undefined) {
                delete _msgListeners[watchid];
                return;
            }
            if (_convListeners[watchid] !== undefined) {
                delete _convListeners[watchid];
                return;
            }
            if (_folderListeners[watchid] !== undefined) {
                delete _folderListeners[watchid];
                return;
            }
        }

    };
    return message_storage;
};

module.exports = _self;
