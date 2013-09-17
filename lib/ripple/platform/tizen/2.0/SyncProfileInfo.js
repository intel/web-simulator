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
    SyncProfileInfo;

SyncProfileInfo = function (profileName, syncInfo, serviceInfo) {
    var syncProfileInfo = {};

    t.SyncProfileInfo(arguments, this);

    syncProfileInfo.profileName = profileName;
    syncProfileInfo.syncInfo    = syncInfo;
    syncProfileInfo.serviceInfo = serviceInfo;

    this.__defineGetter__("profileId", function () {
        return null;
    });

    this.__defineGetter__("profileName", function () {
        return syncProfileInfo.profileName;
    });
    this.__defineSetter__("profileName", function (profileName) {
        try {
            syncProfileInfo.profileName = t.DOMString(profileName);
        } catch (e) {
        }
    });

    this.__defineGetter__("syncInfo", function () {
        return syncProfileInfo.syncInfo;
    });
    this.__defineSetter__("syncInfo", function (syncInfo) {
        try {
            t.SyncInfo(syncInfo);
            syncProfileInfo.syncInfo = syncInfo;
        } catch (e) {
        }
    });

    this.__defineGetter__("serviceInfo", function () {
        return syncProfileInfo.serviceInfo;
    });
    this.__defineSetter__("serviceInfo", function (serviceInfo) {
        try {
            t.SyncServiceInfo(serviceInfo, "[]?");
            syncProfileInfo.serviceInfo = serviceInfo;
        } catch (e) {
        }
    });
};

module.exports = SyncProfileInfo;
