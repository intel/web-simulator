/*
 *  Copyright 2012 Intel Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"),
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
var utils = require('ripple/utils');

module.exports = function (opt) {
    var conv = {}, priv = utils.copy(opt);

    conv.__defineGetter__("id", function () {
        return priv.id;
    });
    conv.__defineGetter__("type", function () {
        return priv.type;
    });
    conv.__defineGetter__("timestamp", function () {
        return priv.timestamp;
    });
    conv.__defineGetter__("messageCount", function () {
        return priv.messageCount;
    });
    conv.__defineGetter__("unreadMessages", function () {
        return priv.unreadMessages;
    });
    conv.__defineGetter__("preview", function () {
        return priv.preview;
    });
    conv.__defineGetter__("subject", function () {
        return priv.subject;
    });
    conv.__defineGetter__("isRead", function () {
        return priv.isRead;
    });
    conv.__defineGetter__("from", function () {
        return priv.from;
    });
    conv.__defineGetter__("to", function () {
        return priv.to;
    });
    conv.__defineGetter__("cc", function () {
        return priv.cc;
    });
    conv.__defineGetter__("bcc", function () {
        return priv.bcc;
    });
    conv.__defineGetter__("lastMessageId", function () {
        return priv.lastMessageId;
    });
    return conv;
};
