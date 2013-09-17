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

var db = require('ripple/db'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    SyncServiceInfo,
    _accounts = {},
    _counter = 0;

SyncServiceInfo = function (enable, serviceType, serverDatabaseUri, id,
        password) {
    var syncServiceInfo = {}, index;

    function save() {
        _accounts[index] = {
            id: syncServiceInfo.id,
            password: syncServiceInfo.password
        };
        db.saveObject("save-syncserviceinfo", _accounts);
    }

    t.SyncServiceInfo(arguments, this);

    syncServiceInfo.enable            = enable;
    syncServiceInfo.serviceType       = serviceType;
    syncServiceInfo.serverDatabaseUri = serverDatabaseUri;
    syncServiceInfo.id                = id || null;
    syncServiceInfo.password          = password || null;

    this.__defineGetter__("enable", function () {
        return syncServiceInfo.enable;
    });
    this.__defineSetter__("enable", function (enable) {
        try {
            syncServiceInfo.enable = t.boolean(enable);
        } catch (e) {
        }
    });

    this.__defineGetter__("serviceType", function () {
        return syncServiceInfo.serviceType;
    });
    this.__defineSetter__("serviceType", function (serviceType) {
        try {
            syncServiceInfo.serviceType = t.SyncServiceType(serviceType);
        } catch (e) {
        }
    });

    this.__defineGetter__("serverDatabaseUri", function () {
        return syncServiceInfo.serverDatabaseUri;
    });
    this.__defineSetter__("serverDatabaseUri", function (serverDatabaseUri) {
        try {
            syncServiceInfo.serverDatabaseUri = t.DOMString(serverDatabaseUri);
        } catch (e) {
        }
    });

    this.__defineGetter__("id", function () {
        return null;
    });
    this.__defineSetter__("id", function (id) {
        try {
            syncServiceInfo.id = t.DOMString(id);
            save();
        } catch (e) {
        }
    });

    this.__defineGetter__("password", function () {
        return null;
    });
    this.__defineSetter__("password", function (password) {
        try {
            syncServiceInfo.password = t.DOMString(password);
            save();
        } catch (e) {
        }
    });

    index = _counter++;
    Object.defineProperty(this, "__syncServiceInfoID__", {
        "configurable": false,
        "enumerable":   false,
        "get": (function (_id_) {
            return function () { return _id_; };
        })(index)
    });
    save();
};

module.exports = SyncServiceInfo;
