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
    DownloadRequest;

DownloadRequest = function (url, destination, fileName, networkType,
        httpHeader) {
    var downloadRequest = {};

    t.DownloadRequest(arguments, this);

    this.__defineGetter__("url", function () {
        return downloadRequest.url;
    });
    this.__defineSetter__("url", function (val) {
        try {
            downloadRequest.url = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("networkType", function () {
        return downloadRequest.networkType;
    });
    this.__defineSetter__("networkType", function (val) {
        try {
            downloadRequest.networkType = t.DownloadNetworkType(val, "?");
        } catch (e) {
        }
    });

    this.destination            = destination || "";
    this.fileName               = fileName || "";
    this.httpHeader             = httpHeader || {};

    downloadRequest.url         = url;
    downloadRequest.networkType = networkType || "ALL";
};

module.exports = DownloadRequest;
