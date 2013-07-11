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

var t = require('ripple/platform/tizen/2.0/typecast');

var ApplicationControl = function (operation, uri, mime, category, data) {
    var _data = [];

    this.operation = t.DOMString(operation);
    this.uri = t.DOMString(uri, "?") || null;
    this.mime = t.DOMString(mime, "?");
    this.category = t.DOMString(category, "?");

    if (data) {
        _data = t.ApplicationControlData(data, "[]?");
    }

    this.__defineGetter__("data", function () {
        return _data;
    });

    this.__defineSetter__("data", function (data) {
        data = data || [];
        _data = t.ApplicationControlData(data, "[]");
    });
};

module.exports = ApplicationControl;
