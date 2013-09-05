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

var t = require('ripple/platform/tizen/2.0/typecast'),
    ApplicationControlData = require('ripple/platform/tizen/2.0/ApplicationControlData');

var ApplicationControl = function (operation, uri, mime, category, data) {
    var i, _data = [];

    t.ApplicationControl(arguments, this);
 
    this.operation = operation;
    this.uri       = uri || null;
    this.mime      = mime || null;
    this.category  = category || null;

    if (data) {
        for (i in data) {
            _data[i] = new ApplicationControlData(data[i].key,
                    data[i].value);
        }
    }

    this.__defineGetter__("data", function () {
        return _data;
    });

    this.__defineSetter__("data", function (data) {
        var i;

        data = data || [];
        data = t.ApplicationControlData(data, "[]");

        for (i in data) {
            _data[i] = new ApplicationControlData(data[i].key,
                    data[i].value);
        }
    });
};

module.exports = ApplicationControl;
