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
    NDEFRecordMedia;

NDEFRecordMedia = function (mimeType, data) {
    var i, type = [], payload;

    t.NDEFRecordMedia(arguments, this);

    for (i = 0; i < mimeType.length; i++) {
        type[i] = mimeType.charCodeAt(i);
    }
    payload = t.byte(data, "[]");

    // Normally, we can use prototype to inherit a class, for example:
    //     NDEFRecordMedia.prototype = new NDEFRecord(2, [...], [...], [...]);
    // But the test case thinks that all the inherited property should be
    // the object's own property. So, we can only change the "this" point
    // of NDEFRecord constructor here.
    NDEFRecordInternal.call(this, tizen.nfc.NFC_RECORD_TNF_MIME_MEDIA, type,
            payload, []);

    this.__defineGetter__("mimeType", function () {
        return mimeType;
    });
};

module.exports = NDEFRecordMedia;
