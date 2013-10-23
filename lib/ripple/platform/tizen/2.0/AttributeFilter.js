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
    AttributeFilter;

AttributeFilter = function (attributeName, matchFlag, matchValue) {
    var attributeFilter = {};

    t.AttributeFilter(arguments, this);

    attributeFilter.attributeName = attributeName;
    attributeFilter.matchFlag     = matchFlag || "EXACTLY";
    attributeFilter.matchValue    = (matchFlag === "EXISTS") ? null :
            matchValue || null;

    this.__defineGetter__("attributeName", function () {
        return attributeFilter.attributeName;
    });
    this.__defineSetter__("attributeName", function (val) {
        try {
            attributeFilter.attributeName = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("matchFlag", function () {
        return attributeFilter.matchFlag;
    });
    this.__defineSetter__("matchFlag", function (val) {
        try {
            attributeFilter.matchFlag = t.FilterMatchFlag(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("matchValue", function () {
        return attributeFilter.matchValue;
    });
    this.__defineSetter__("matchValue", function (val) {
        try {
            if (attributeFilter.matchFlag === "EXISTS") {
                return;
            }
            attributeFilter.matchValue = t.any(val);
        } catch (e) {
        }
    });
};

module.exports = AttributeFilter;
