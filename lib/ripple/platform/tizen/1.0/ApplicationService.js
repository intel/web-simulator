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

var event = require('ripple/event'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    ApplicationServiceData = require('ripple/platform/tizen/1.0/ApplicationServiceData');

module.exports = function (operation, uri, mime, data) {
    var _self, i;

    _self = {
        operation: "",
        url: "",
        mime: "",
        data: [],
        replyResult: function (data) {
            event.trigger("appServiceReplied", "Result: " + data);
        },
        replyFailure: function () {
            event.trigger("appServiceReplied", "Failure");
        }
    };

    _self.operation = String(operation);
    if (uri) {
        _self.uri = String(uri);
    }
    if (mime) {
        _self.mime = String(mime);
    }
    if (tizen1_utils.isValidArray(data)) {
        for (i in data) {
            _self.data.push(new ApplicationServiceData(data[i].key, data[i].value));
        }
    }

    return _self;
};
