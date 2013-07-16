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

var errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    NDEFRecord = require('ripple/platform/tizen/2.0/NDEFRecord');

function NDEFRecordText(text, languageCode, encoding) {
    var _self = this,
        _text = text || "",
        _languageCode = languageCode || "",
        _encoding = encoding || "UTF8",
        _payload = [],
        encodingList = ["UTF8", "UTF16"],
        i;

    if (typeof _text !== "string" || typeof _languageCode !== "string" ||
            encodingList.indexOf(_encoding) < 0) {
        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
    }
    //store languageCode in _payload
    _payload.push(_languageCode.length);
    for (i = 0; i < _languageCode.length; i++) {
        _payload.push(_languageCode.charCodeAt(i));
    }

    //store text in _payload
    for (i = 0; i < _text.length; i++) {
        _payload.push(_text.charCodeAt(i));
    }

    // inherit from NDEFRecord
    _self = NDEFRecord.call(_self, 1, ["T".charCodeAt(0)], _payload, []);

    _self.__defineGetter__("text", function () {
        return _text;
    });

    _self.__defineGetter__("languageCode", function () {
        return _languageCode;
    });

    _self.__defineGetter__("encoding", function () {
        return _encoding;
    });

    return _self;
}

module.exports = NDEFRecordText;
