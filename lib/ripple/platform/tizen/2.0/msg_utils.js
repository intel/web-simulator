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


var db = require('ripple/db'),
    utils = require('ripple/utils'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    MessageBody = require('ripple/platform/tizen/2.0/MessageBody'),
    _TIZEN_MESSAGE_DB_KEY = "tizen_db_messages",
    MessageElement = function (_type, _id) {
        return {
            type: _type,
            id: _id,
            msg: {},
            conv: {}
        };
    },

    _conversationCount = function (msg, cid, rst) {
        var old_time = new Date(0), t;

        utils.forEach(msg.msg, function (o) {
            if (o.priv.conversationId === cid &&
                o.priv.messageStatus !== "DRAFT") {
                rst.cnt += 1;
                t = new Date(o.priv.timestamp);
                if (t > old_time) {
                    rst.lastid = o.priv.id;
                    old_time = t;
                }
                if (o.isRead === false) {
                    rst.unread++;
                }
            }
        });
    },

    _updateConversation = function (msg, cid) {
        var privConv = {}, lastm, rst = {};

        rst.cnt = 0;
        rst.unread = 0;
        rst.lastid = "";
        _conversationCount(msg, cid, rst);
        if (rst.cnt === 0) {
            if (msg.conv[cid] !== undefined) {
                delete msg.conv[cid];
            }
            return;
        }
        lastm = msg.msg[rst.lastid];

        privConv.id = cid;
        privConv.type = msg.type;
        privConv.timestamp = new Date(lastm.priv.timestamp);
        privConv.messageCount = rst.cnt;
        privConv.unreadMessages = rst.unread;
        privConv.preview = lastm.body.plainBody;
        privConv.subject = lastm.subject;
        privConv.isRead = lastm.isRead;
        privConv.from = lastm.priv.from;
        privConv.to = lastm.to.slice(0);
        privConv.cc = lastm.cc.slice(0);
        privConv.bcc = lastm.bcc.slice(0);
        privConv.lastMessageId = rst.lastid;
        msg.conv[cid] = privConv;
    };

module.exports = {
    conversationCount: _conversationCount,
    setMsg: function (m, newm) {
        if ((m.to === null) || (m.to === undefined)) {
            newm.to = [];
        } else {
            if (tizen1_utils.isValidArray(m.to)) {
                newm.to = m.to.slice(0);
            } else {
                return false;
            }
        }

        if ((m.cc === null) || (m.cc === undefined)) {
            newm.cc = [];
        } else {
            if (tizen1_utils.isValidArray(m.cc)) {
                newm.cc = m.cc.slice(0);
            } else {
                return false;
            }
        }

        if ((m.bcc === null) || (m.bcc === undefined)) {
            newm.bcc = [];
        } else {
            if (tizen1_utils.isValidArray(m.bcc)) {
                newm.bcc = m.bcc.slice(0);
            } else {
                return false;
            }
        }

        if ((m.body === null) || (m.body === undefined)) {
            if (m.htmlBody === null || m.htmlBody === undefined) {
                m.htmlBody = "";
            }
            if (m.plainBody === null || m.plainBody === undefined) {
                m.plainBody = "";
            }
            if (typeof m.plainBody !== 'string' || typeof m.htmlBody !== 'string') {
                return false;
            }
            m.body = new MessageBody(null, true, m.plainBody, m.htmlBody, []);
        } else {
            if (typeof m.body.plainBody !== 'string' || typeof m.body.htmlBody !== 'string') {
                return false;
            }
            m.body = new MessageBody(null, true, m.body.plainBody, m.body.htmlBody, []);
        }
        newm.body = utils.copy(m.body);

        if (typeof m.isRead === 'boolean') {
            newm.isRead = m.isRead;
        } else {
            newm.isRead = false;
        }

        if (typeof m.isHighPriority === 'boolean') {
            newm.isHighPriority = m.isHighPriority;
        } else {
            newm.isHighPriority = false;
        }

        if ((m.subject === null) || (m.subject === undefined)) {
            newm.subject = "";
        } else {
            newm.subject = String(m.subject);
        }

        if ((m.inResponseTo === null) || (m.inResponseTo === undefined)) {
            newm.inResponseTo = null;
        } else {
            newm.inResponseTo = String(m.inResponseTo);
        }

        if ((m.attachments === null) || (m.attachments === undefined)) {
            newm.attachments = [];
        } else {
            newm.attachments = utils.copy(m.attachments);
        }
        return true;
    },

    loadMsg: function (type, id) {
        var i, ret, msg = db.retrieveObject(_TIZEN_MESSAGE_DB_KEY) || null;
        if (msg === null) {
            ret = new MessageElement(type, id);
        } else {
            for (i = 0; i < msg.length; i++) {
                if (msg[i].type === type && msg[i].id === id) {
                    ret = msg[i];
                    break;
                }
            }
            if (ret === undefined) {
                ret = new MessageElement(type, id);
            } else {
                /* after getting Date out of DB, Date will become
                   a string, so need to recast it back to Date */
                for (i in ret.msg) {
                    ret.msg[i].priv.timestamp = new Date(ret.msg[i].priv.timestamp);
                }
            }
        }
        return ret;
    },

    delMsg: function (m) { // m is a PrivMessage
        var i, _msg = db.retrieveObject(_TIZEN_MESSAGE_DB_KEY) || [];
        if (_msg.length === 0) {
            return;
        } else {
            for (i = 0; i < _msg.length; i++) {
                if (_msg[i].type === m.priv.type && _msg[i].id === m.priv.serviceId) {
                    delete _msg[i].msg[m.priv.id];
                    if (m.priv.messageStatus !== "DRAFT") {
                        _updateConversation(_msg[i], m.priv.conversationId);
                    }
                    db.saveObject(_TIZEN_MESSAGE_DB_KEY, _msg);
                    return;
                }
            }
        }
    },

    saveMsg: function (m) { // m is a PrivMessage
        var i, new_msg, _msg = db.retrieveObject(_TIZEN_MESSAGE_DB_KEY) || [];
        if (_msg.length === 0) {
            _msg = new MessageElement(m.priv.type, m.priv.serviceId);
            _msg.msg[m.priv.id] = m;
            if (m.priv.messageStatus !== "DRAFT") {
                _updateConversation(_msg, m.priv.conversationId);
            }
            db.saveObject(_TIZEN_MESSAGE_DB_KEY, [_msg]);
        } else {
            for (i = 0; i < _msg.length; i++) {
                if (_msg[i].type === m.priv.type && _msg[i].id === m.priv.serviceId) {
                    _msg[i].msg[m.priv.id] = m;
                    if (m.priv.messageStatus !== "DRAFT") {
                        _updateConversation(_msg[i], m.priv.conversationId);
                    }
                    db.saveObject(_TIZEN_MESSAGE_DB_KEY, _msg);
                    break;
                }
            }
            if (i === _msg.length) {
                new_msg = new MessageElement(m.priv.type, m.priv.serviceId);
                new_msg.msg[m.priv.id] = m;
                if (m.priv.messageStatus !== "DRAFT") {
                    _updateConversation(new_msg, m.priv.conversationId);
                }
                _msg.push(new_msg);
                db.saveObject(_TIZEN_MESSAGE_DB_KEY, _msg);
            }
        }
    },

    loadConv: function (type, id) {
        var i, ret;
        ret = this.loadMsg(type, id).conv;
        for (i in ret) {
            ret[i].timestamp = new Date(ret[i].timestamp);
        }
        return ret;
    }
};
