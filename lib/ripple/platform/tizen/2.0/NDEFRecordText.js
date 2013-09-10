/*
 *  Copyright 2013 Intel Corporation
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

var t = require('ripple/platform/tizen/2.0/typecast'),
    NDEFRecordInternal = require('ripple/platform/tizen/2.0/NDEFRecordInternal'),
    NDEFRecordText;

NDEFRecordText = function (text, languageCode, encoding) {
    var payload = [], i;

    t.NDEFRecordText(arguments, this);

    encoding = encoding || "UTF8";

    // Store languageCode in payload
    payload.push(languageCode.length);
    for (i = 0; i < languageCode.length; i++) {
        payload.push(languageCode.charCodeAt(i));
    }

    // Store text in payload
    for (i = 0; i < text.length; i++) {
        payload.push(text.charCodeAt(i));
    }

    NDEFRecordInternal.call(this, tizen.nfc.NFC_RECORD_TNF_WELL_KNOWN,
            ["T".charCodeAt(0)], payload, []);

    this.__defineGetter__("text", function () {
        return text;
    });

    this.__defineGetter__("languageCode", function () {
        return languageCode;
    });

    this.__defineGetter__("encoding", function () {
        return encoding;
    });
};

module.exports = NDEFRecordText;
