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

var tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    ApplicationControlData = require('ripple/platform/tizen/2.0/ApplicationControlData');

module.exports = function (operation, uri, mime, category, appControlData) {
    var i, data = [];

    this.operation = String(operation);
    this.url =  null;
    this.mime = null;
    this.category = null;

    if (uri) {
        this.uri = String(uri);
    }
    if (mime) {
        this.mime = String(mime);
    }
    if (category) {
        this.category = String(category);
    }
    if (appControlData && tizen1_utils.isValidArray(appControlData)) {
        for (i in appControlData) {
            data.push(new ApplicationControlData(appControlData[i].key, appControlData[i].value));
        }
    }

    this.__defineGetter__("data", function () {
        return data;
    });

    this.__defineSetter__("data", function (appControlData) {
        var _data = appControlData || [];
        if (!tizen1_utils.isValidArray(_data)) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }
        data = _data;
    });
};

