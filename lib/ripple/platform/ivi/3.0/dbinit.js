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

var exception = require('ripple/exception'),
    DBBuilder,
    _data = {
        dbBuilder: null
    },
    _self = {};

function _initialize() {
    _data.dbBuilder = new DBBuilder();

    _data.dbBuilder.register("Vehicle", "dbvehicle.json");
}

DBBuilder = function () {
    var self;

    // private
    function formatString(str) {
        return str.replace(/^\s+|[\t\n\r\v]+|\s+$/g, "").replace(/\s+/g, " ");
    }

    // public
    function register(type, dbFile, Extension) {
        _data[type] = Extension ? new Extension() : {};

        if (!dbFile)
            return;

        _self.__defineGetter__(type, function () {
            var fnInit;

            if (!_data[type].db) {
                fnInit = _data[type].initdb || initdb;
                _data[type].db = fnInit(dbFile);
            }

            return _data[type].db;
        });
    }

    function initdb(dbFile) {
        var xmlHttp, res;

        try {
            xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", "dbsamples/" + dbFile, false);
            xmlHttp.send();
        } catch (e) {
            exception.handle(e);
        }

        if (!xmlHttp.responseText) {
            return null;
        }

        res = formatString(xmlHttp.responseText);

        return JSON.parse(res);
    }

    self = {
        register: register,
        initdb:   initdb
    };

    return self;
};

_initialize();

module.exports = _self;
