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
var event = require('ripple/event'),
    utils = require('ripple/utils'),
    _type = {
        sms: "SMS",
        mms: "MMS",
        email: "E-mail"
    },
    _filename_suffix = 0,
    _attachments = [];

function _getAttachmentFileName() {
    return "attach" + _filename_suffix + ".txt";
}

module.exports = {
    panel: {
        domId: "messaging-container",
        collapsed: true,
        pane: "left"
    },
    initialize: function () {
        document.getElementById("messaging-send")
            .addEventListener("click", function () {
                var number = document.getElementById("messaging-sms-number").value,
                    text = document.getElementById("messaging-text").value,
                    type = document.getElementById("messaging-type").value,
                    message = {
                        type: type,
                        body: text,
                        from: number,
                        time: new Date(),
                        attachments: _attachments
                    };

                event.trigger("MessageReceived", [message]);
                
                _attachments = [];
                document.getElementById("messaging-attachments").innerHTML = "";
                _filename_suffix = 0;
            }, false);

        document.getElementById("messaging-attach")
            .addEventListener("click", function () {
                var attachedFile, attachedFileCheckbox, attachedFileName;
                if (_filename_suffix > 0)
                    return;
                _attachments.push({filename: _getAttachmentFileName(), content: document.getElementById("messaging-attachment-content").value});

                attachedFile = document.getElementById("messaging-attachments").insertRow(0);
                attachedFileName = attachedFile.insertCell(0);
                attachedFileCheckbox = attachedFile.insertCell(1);
                attachedFileName.innerHTML = _attachments[_filename_suffix].filename;
//                attachedFileCheckbox.innerHTML = '<input type="checkbox" value="' + _filename_suffix + '">';

                document.getElementById("messaging-attachment-content").value = "";
                _filename_suffix++;
            }, false);

        document.getElementById("messaging-detach")
            .addEventListener("click", function () {
                _attachments = [];
                document.getElementById("messaging-attachments").innerHTML = "";
                _filename_suffix = 0;
            }, false);

        event.on("OutsideMessageReceived", function (message) {
            var numRecipients = 0,
                i = 0,
                recipients = [],
                recipientsStatus = {},
                strRecipients = document.getElementById("messaging-recipients").value;

            recipientsStatus.id = message.id;
            recipientsStatus.msg = message.msg;
            if (strRecipients === "") {
                for (i in message.to) {
                    recipientsStatus[message.to[i]] = true;
                }
                for (i in message.cc) {
                    recipientsStatus[message.cc[i]] = true;
                }
                for (i in message.bcc) {
                    recipientsStatus[message.bcc[i]] = true;
                }
                numRecipients = message.to.length + message.cc.length + message.bcc.length;
            }
            else {
                recipients = strRecipients.split(/\s*[;,]\s*/);
                for (i in message.to) {
                    recipientsStatus[message.to[i]] = utils.arrayContains(recipients, message.to[i]);
                    if (recipientsStatus[message.to[i]])
                        ++numRecipients;
                }
                for (i in message.cc) {
                    recipientsStatus[message.cc[i]] = utils.arrayContains(recipients, message.cc[i]);
                    if (recipientsStatus[message.cc[i]])
                        ++numRecipients;
                }
                for (i in message.bcc) {
                    recipientsStatus[message.bcc[i]] = utils.arrayContains(recipients, message.bcc[i]);
                    if (recipientsStatus[message.bcc[i]])
                        ++numRecipients;
                }
            }
            event.trigger("MessageSent", [recipientsStatus]);
            document.getElementById("messaging-received").innerHTML = "" + numRecipients + " recipient(s)" + " delivered";
            document.getElementById("received-message-box").value = message.body;
        });
        
        document.getElementById("messaging-clear")
            .addEventListener("click", function () {
                document.getElementById("received-message-box").value = "";
                document.getElementById("messaging-received").innerHTML = "";
            }, false);
        
        utils.forEach(_type, function (msgTypeText, msgType) {
            var typeNode = utils.createElement("option", {
                    "innerText": msgTypeText,
                    "value": msgType
                });

            document.getElementById("messaging-type").appendChild(typeNode);
        });
    }
};
