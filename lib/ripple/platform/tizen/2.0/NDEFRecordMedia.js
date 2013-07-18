/*
 *  Copyright 2012 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use _self file except in compliance with the License.
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

var NDEFRecord = require('ripple/platform/tizen/2.0/NDEFRecord'),
    utils = require('ripple/utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException');

function NDEFRecordMedia (mimeType, data) {
    var _self = this,
        _mimeType = mimeType || "",
        _payload,
        _type = [], i;

    if (typeof _mimeType !== "string" || !(Array.isArray(data))) {
        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
    }

    _payload = utils.copy(data);

    for (i = 0; i < _mimeType.length; i++) {
        _type[i] = _mimeType.charCodeAt(i);
    }

    // Normally, we can use prototype to inherit a class, for example:
    //     NDEFRecordMedia.prototype = new NDEFRecord(2, [...], [...], [...]);
    // But the test case thinks that all the inherited property should be
    // the object's own property. So, we can only change the "this" point
    // of NDEFRecord constructor here.
    _self = NDEFRecord.call(_self, tizen.nfc.NFC_RECORD_TNF_MIME_MEDIA, _type, _payload, []);

    _self.__defineGetter__("mimeType", function () {
        return _mimeType;
    });

    return _self;
}

module.exports = NDEFRecordMedia;
