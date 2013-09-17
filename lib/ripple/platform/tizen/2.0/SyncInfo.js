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
    SyncInfo,
    _accounts = {},
    _counter = 0;

SyncInfo = function () {
    var voc, syncInfo = {}, index;

    function save() {
        _accounts[index] = {
            id:       syncInfo.id,
            password: syncInfo.password
        };
        db.saveObject("save-syncinfo", _accounts);
    }

    function construct(url, id, password, mode) {
        syncInfo.url      = url;
        syncInfo.id       = id;
        syncInfo.password = password;
        syncInfo.mode     = mode;
        syncInfo.type     = null;
        syncInfo.interval = null;

        this.__defineGetter__("url", function () {
            return syncInfo.url;
        });
        this.__defineSetter__("url", function (url) {
            try {
                syncInfo.url = t.DOMString(url);
            } catch (e) {
            }
        });

        this.__defineGetter__("id", function () {
            return null;
        });
        this.__defineSetter__("id", function (id) {
            try {
                syncInfo.id = t.DOMString(id);
                save();
            } catch (e) {
            }
        });

        this.__defineGetter__("password", function () {
            return null;
        });
        this.__defineSetter__("password", function (password) {
            try {
                syncInfo.password = t.DOMString(password);
                save();
            } catch (e) {
            }
        });

        this.__defineGetter__("mode", function () {
            return syncInfo.mode;
        });
        this.__defineSetter__("mode", function (mode) {
            try {
                syncInfo.mode = t.SyncMode(mode);
            } catch (e) {
            }
        });

        this.__defineGetter__("type", function () {
            return syncInfo.type;
        });
        this.__defineSetter__("type", function (type) {
            if (mode !== "MANUAL") {
                return;
            }
            try {
                syncInfo.type = t.SyncType(type);
            } catch (e) {
            }
        });

        this.__defineGetter__("interval", function () {
            return syncInfo.interval;
        });
        this.__defineSetter__("interval", function (interval) {
            if (mode !== "PERIODIC") {
                return;
            }
            try {
                syncInfo.interval = t.SyncInterval(interval);
            } catch (e) {
            }
        });
    }

    voc = [
        function (url, id, password, mode, type) {
            construct.apply(this, arguments);

            if (mode === "MANUAL") {
                syncInfo.type = type;
            }
        },
        function (url, id, password, mode, interval) {
            construct.apply(this, arguments);

            if (mode === "PERIODIC") {
                syncInfo.interval = interval;
            }
        },
        function (url, id, password, mode) {
            construct.apply(this, arguments);
        }
    ];

    t.SyncInfo(arguments, this, voc);

    index = _counter++;
    Object.defineProperty(this, "__syncInfoID__", {
        "configurable": false,
        "enumerable":   false,
        "get": (function (_id_) {
            return function () { return _id_; };
        })(index)
    });
    save();
};

module.exports = SyncInfo;
