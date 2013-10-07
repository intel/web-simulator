/*
 *  Copyright 2013 Intel Corporation.
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
    var applicationControl = {}, i;

    t.ApplicationControl(arguments, this);

    applicationControl.operation = operation;
    applicationControl.uri       = uri || null;
    applicationControl.mime      = mime || null;
    applicationControl.category  = category || null;
    applicationControl.data      = [];

    if (data) {
        for (i in data) {
            applicationControl.data[i] = new ApplicationControlData(data[i].key,
                    data[i].value);
        }
    }

    this.__defineGetter__("operation", function () {
        return applicationControl.operation;
    });
    this.__defineSetter__("operation", function (val) {
        try {
            applicationControl.operation = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("uri", function () {
        return applicationControl.uri;
    });
    this.__defineSetter__("uri", function (val) {
        try {
            applicationControl.uri = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("mime", function () {
        return applicationControl.mime;
    });
    this.__defineSetter__("mime", function (val) {
        try {
            applicationControl.mime = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("category", function () {
        return applicationControl.category;
    });
    this.__defineSetter__("category", function (val) {
        try {
            applicationControl.category = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("data", function () {
        return applicationControl.data;
    });
    this.__defineSetter__("data", function (val) {
        var i;

        try {
            t.ApplicationControlData(val, "[]");
            for (i in val) {
                applicationControl.data[i] = new ApplicationControlData(
                        val[i].key, val[i].value);
            }
        } catch (e) {
        }
    });
};

module.exports = ApplicationControl;
