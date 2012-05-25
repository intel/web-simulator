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
    ndefMessage = {},
    returnNdefMessage = {};

function stringToBytes(str) {
    var re = [], i;
    for (i = 0; i < str.length; i++) {
        re[i] = str.charAt(i);
    }
    return re;
}

function initializeMessage() {
    var record1 = {
        tnf : 0,
        type : [3, 1, 5, 3],
        id : [4, 5, 2, 2],
        payload : []
    }, recordArray = [];
    recordArray.push(record1);

    ndefMessage = {
        recordCount : recordArray.length,
        records : recordArray,
        toByte : function () {
            var result = [], i;
            for (i in this.records) {
                result = result.concat(this.records[i].payload);
            }
            return result;
        }
    };
}

module.exports = {
    panel: {
        domId: "nfc-container",
        collapsed: true,
        pane: "left"
    },
    initialize: function () {
        initializeMessage();
        document.getElementById("nfc-approach").addEventListener("click", function () {
            var nfcPayload = document.getElementById("nfc-text").value,
                devInfo;

            ndefMessage.records[0].payload = stringToBytes(nfcPayload);
            devInfo = {
                ndefMessage : ndefMessage
            };
            event.trigger("NFCDeviceApproached", [devInfo]);
        }, false);

        document.getElementById("nfc-clear").addEventListener("click", function () {
            document.getElementById("received-nfc-box").value = "";
        }, false);

        event.on("PairedNDEFReceived", function (returnNdefMessage) {
            document.getElementById("received-nfc-box").value = returnNdefMessage.toByte();
        });
    }
};
