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
    SortMode;

SortMode = function (attributeName, order) {
    var sortMode = {};

    t.SortMode(arguments, this);

    this.__defineGetter__("attributeName", function () {
        return sortMode.attributeName;
    });
    this.__defineSetter__("attributeName", function (val) {
        try {
            sortMode.attributeName = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("order", function () {
        return sortMode.order;
    });
    this.__defineSetter__("order", function (val) {
        try {
            sortMode.order = t.SortModeOrder(val);
        } catch (e) {
        }
    });

    sortMode.attributeName = attributeName;
    sortMode.order         = order || "ASC";
};

module.exports = SortMode;
