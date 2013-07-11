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

function SyncInfo(url, id, password, mode, arg) {
    var syncInfo, _id, _password, _internal_id;
    syncInfo = this;

    function save() {
        _accounts[_internal_id] = {id: _id, password: _password};
        db.saveObject("save-syncinfo", _accounts);
    }

    _id = id;
    _password = password;
    _internal_id = _counter++;

    t.SyncMode(mode);

    syncInfo.url    = url;
    syncInfo.mode   = mode;

    syncInfo.__defineSetter__("id", function (id) {
        _id = id;
        save();
    });
    syncInfo.__defineGetter__("id", function () {
        return null;
    });
    syncInfo.__defineSetter__("password", function (password) {
        _password = password;
        save();
    });
    syncInfo.__defineGetter__("password", function () {
        return null;
    });

    Object.defineProperty(syncInfo, "__syncInfoID__", {
        "configurable": false,
        "enumerable":   false,
        "get": (function (_id_) {
            return function () { return _id_; };
        })(_internal_id)
    });

    switch (mode) {
    case "MANUAL":
        if (arguments.length >= 5) {
            t.SyncType(arg);
        }
        syncInfo.type = arg;
        break;
    case "PERIODIC":
        t.SyncInterval(arg);
        syncInfo.interval = arg;
        break;
    }
    save();

    return syncInfo;
}

module.exports = SyncInfo;
