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
    _counter = 0,
    _accounts = {};

function SyncServiceInfo(enable, serviceType, serverDatabaseUri, id, password) {
    var _id, _password, syncServiceInfo, _internal_id;
    syncServiceInfo = this;

    function save() {
        _accounts[_internal_id] = {id: _id, password: _password};
        db.saveObject("save-syncserviceinfo", _accounts);
    }

    t.SyncServiceType(serviceType);

    if (id) {
        _id = id;
    }

    if (password) {
        _password = password;
    }

    _internal_id = _counter++;

    syncServiceInfo.enable =            enable;
    syncServiceInfo.serviceType =       serviceType;
    syncServiceInfo.serverDatabaseUri = serverDatabaseUri;

    syncServiceInfo.__defineSetter__("id", function (id) {
        _id = id;
        save();
    });

    syncServiceInfo.__defineSetter__("password", function (password) {
        _password = password;
        save();
    });

    syncServiceInfo.__defineGetter__("id", function () {
        return null;
    });

    syncServiceInfo.__defineGetter__("password", function () {
        return null;
    });

    Object.defineProperty(syncServiceInfo, "__syncServiceInfoID__", {
        "configurable": false,
        "enumerable":   false,
        "get": (function (_id_) {
            return function () { return _id_; };
        })(_internal_id)
    });

    save();

    return syncServiceInfo;
}

module.exports = SyncServiceInfo;
