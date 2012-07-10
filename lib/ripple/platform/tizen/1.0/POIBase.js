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

var tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    POIGeometry = require('ripple/platform/tizen/1.0/POIGeometry'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError');


module.exports = function (prop) {
    var _self, i, copy, attr;
    _self = {
        name : null,
        categories : [],
        address : null,
        phoneNumbers : [],
        geometry : null,
        urls : [],
        rating : null,
        tags : null,
        toGeoJSON : function () {
            throw new WebAPIError(errorcode.NOT_SUPPORTED_ERR);
        }
    };

    _self.__defineGetter__("id", function () {
        return null;
    });

    _self.__defineGetter__("providerName", function () {
        return null;
    });

    if (prop) {
        if (prop.name) {
            _self.name = String(prop.name);
        }
        if (tizen1_utils.isValidArray(prop.categories)) {
            _self.categories = [];
            for (i in prop.categories) {
                _self.categories.push(String(prop.categories[i]));
            }
        }
        if (prop.address) {
            if (typeof prop.address === "string") {
                _self.address = String(prop.address);
            } else if (Object.prototype.toString.call(prop.address) === "[object Object]") {
                copy = prop.address.constructor();
                for (attr in prop.address) {
                    if (prop.address.hasOwnProperty(attr)) {
                        copy[attr] = prop.address[attr];
                    }
                }
                _self.address = copy;
            }
        }
        if (tizen1_utils.isValidArray(prop.phoneNumbers)) {
            _self.phoneNumbers = [];
            for (i in prop.phoneNumbers) {
                _self.phoneNumbers.push(String(prop.phoneNumbers[i]));
            }
        }
        if (prop.geometry) {
            _self.geometry = new POIGeometry(prop.geometry.position, prop.geometry.viewport, prop.geometry.wkt);
        }
        if (tizen1_utils.isValidArray(prop.urls)) {
            _self.urls = [];
            for (i in prop.urls) {
                _self.urls.push(String(prop.urls[i]));
            }
        }
        if (typeof prop.rating === "number") {
            _self.rating = prop.rating;
        }
        if (Object.prototype.toString.call(prop.tags) === "[object Object]") {
            copy = prop.tags.constructor();
            for (attr in prop.tags) {
                if (prop.tags.hasOwnProperty(attr)) {
                    copy[attr] = prop.tags[attr];
                }
            }
            _self.tags = copy;
        }
    }

    return _self;
};
