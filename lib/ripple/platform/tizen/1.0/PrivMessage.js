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

module.exports = function (m, opt) {
    return {
// readonly begin
        priv: {id: opt.id,
               serviceId: opt.serviceId,
               conversationId: opt.conversationId,
               folderId: opt.folderId,
               type: opt.type,
               timestamp: new Date(opt.timestamp),
               from: opt.from,
               hasAttachment: opt.hasAttachment,
               messageStatus: opt.messageStatus
        },
// readonly end
        to: m.to.slice(0),
        cc: m.cc.slice(0),
        bcc: m.bcc.slice(0),
        body: utils.copy(m.body),
        isRead: m.isRead,
        priority: m.priority,
        subject: m.subject,
        inResponseTo: m.inResponseTo,
        attachments: utils.copy(m.attachments)
    };
};
