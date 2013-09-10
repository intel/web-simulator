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
    NDEFRecord = require('ripple/platform/tizen/2.0/NDEFRecord'),
    NDEFRecordText = require('ripple/platform/tizen/2.0/NDEFRecordText'),
    NDEFRecordURI = require('ripple/platform/tizen/2.0/NDEFRecordURI'),
    NDEFRecordMedia = require('ripple/platform/tizen/2.0/NDEFRecordMedia'),
    NDEFRecordFactory,
    NDEFMessage;

NDEFRecordFactory = function (ndefRecord) {
    var record;

    if (ndefRecord instanceof NDEFRecordText) {
        record = new NDEFRecordText(ndefRecord.text, ndefRecord.languageCode,
                ndefRecord.encoding || null);
    } else if (ndefRecord instanceof NDEFRecordURI) {
        record = new NDEFRecordURI(ndefRecord.url);
    } else if (ndefRecord instanceof NDEFRecordMedia) {
        record = new NDEFRecordMedia(ndefRecord.mimeType, ndefRecord.payload);
    } else {
        record = new NDEFRecord(ndefRecord.tnf, ndefRecord.type,
                ndefRecord.payload, ndefRecord.id || null);
    }

    return record;
};

NDEFMessage = function () {
    var voc, records = [];

    // private
    function construct() {
        this.__defineGetter__("recordCount", function () {
            return this.records.length;
        });

        this.__defineGetter__("records", function () {
            return records;
        });

        this.__defineSetter__("records", function (val) {
            try {
                t.NDEFRecord(val, "[]");
                records = val;
            } catch (e) {
            }
        });

        this.toByte = function () {
            var result = [], i, j, space = " ".charCodeAt(0);

            for (i in this.records) {
                for (j = 0; j < this.records[i].payload.length; j++) {
                    result.push(this.records[i].payload.charCodeAt(j));
                }
                if (i < this.records.length - 1) {
                    result.push(space);
                }
            }

            return result;
        };
    }

    // constructor
    function NDEFMessage_NDEFRecords(ndefRecords) {
        var i;

        construct.apply(this);

        for (i = 0; i < ndefRecords.length; i++) {
            records[i] = new NDEFRecordFactory(ndefRecords[i]);
        }
    }

    function NDEFMessage_bytes(rawData) {
        //TODO: NDEFMessage doesn't support rawData constructor
        construct.apply(this);
    }

    function NDEFMessage_void() {
        construct.apply(this);
    }

    voc = [NDEFMessage_NDEFRecords, NDEFMessage_bytes, NDEFMessage_void];
    t.NDEFMessage(arguments, this, voc);
};

module.exports = NDEFMessage;
