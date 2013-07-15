/*
 *  Copyright 2013 Intel Corporation
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
    utils = require('ripple/utils'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    DataControlConsumerFactory,
    DataControlConsumerObject,
    SQLDataControlConsumer,
    MappedDataControlConsumer,
    SQLData,
    MappedData,
    _data = {
        DB_DATACONTROL_KEY: "tizen1-db-datacontrol",
        IDS_PROVIDER:       ["http://tizen.org/datacontrol/provider/DictionaryDataControlProvider"],
        IDS_DATA:           ["Dictionary"],
        PERSIST_DELAY:      1000,
        SQL:                null,
        MAP:                null,
        dbStorage:          null
    },
    _security = {
        "http://tizen.org/privilege/datacontrol.consumer":
            ["getDataControlConsumer", "insert", "update", "remove", "select",
            "addValue", "removeValue", "getValue", "updateValue"]
    },
    _self;

function _get() {
    _data.dbStorage = db.retrieveObject(_data.DB_DATACONTROL_KEY) || {};
}

function _save() {
    db.saveObject(_data.DB_DATACONTROL_KEY, _data.dbStorage);
}

function _load(type) {
    if (!_data.dbStorage[type])
        return;

    _data[type] = {};

    utils.forEach(_data.dbStorage[type], function (provider, id) {
        var dataId;

        _data[type][id] = {};

        for (dataId in provider) {
            _data[type][id][dataId] = new DataControlConsumerFactory(type,
                    id, dataId, provider[dataId]);
        }
    });
}

function _initialize() {
    _get();

    _load("SQL");
    _load("MAP");
}

_self = function () {
    var datacontrol;

    // private
    function initConsumer(type) {
        var providers;

        _data.dbStorage[type] = {};
        providers = _data.dbStorage[type];

        _data.IDS_PROVIDER.forEach(function (id) {
            providers[id] = {};

            _data.IDS_DATA.forEach(function (dataId) {
                providers[id][dataId] = {};
            });
        });

        _load(type);
    }

    // public
    function getDataControlConsumer(providerId, dataId, type) {
        if (!_security.getDataControlConsumer) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.DataControlManager("getDataControlConsumer", arguments);

        if (_data[type] === null) {
            initConsumer(type);
        }
        if (!_data[type][providerId] || !_data[type][providerId][dataId]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        return _data[type][providerId][dataId];
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    datacontrol = {
        getDataControlConsumer: getDataControlConsumer,
        handleSubFeatures:      handleSubFeatures
    };

    return datacontrol;
};

DataControlConsumerObject = function (type, providerId, dataId) {
    this.__defineGetter__("type", function () {
        return type;
    });

    this.__defineGetter__("providerId", function () {
        return providerId;
    });

    this.__defineGetter__("dataId", function () {
        return dataId;
    });
};

SQLDataControlConsumer = function (providerId, dataId, dc) {
    var self, privateData = new SQLData(dc);

    // public
    function insert(reqId, insertionData, successCallback, errorCallback) {
        if (!_security.insert) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.SQLDataControlConsumer("insert", arguments);

        privateData.insert(insertionData, function (rowId) {
            if (successCallback) {
                successCallback(reqId, rowId);
            }
        }, function (error) {
            if (errorCallback) {
                errorCallback(reqId, error);
            }
        });
    }

    function update(reqId, updateData, where, successCallback, errorCallback) {
        if (!_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.SQLDataControlConsumer("update", arguments);

        privateData.update(updateData, where, function () {
            if (successCallback) {
                successCallback(reqId);
            }
        }, function (error) {
            if (errorCallback) {
                errorCallback(reqId, error);
            }
        });
    }

    function remove(reqId, where, successCallback, errorCallback) {
        if (!_security.remove) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.SQLDataControlConsumer("remove", arguments);

        privateData.remove(where, function () {
            if (successCallback) {
                successCallback(reqId);
            }
        }, function (error) {
            if (errorCallback) {
                errorCallback(reqId, error);
            }
        });
    }

    function select(reqId, columns, where, successCallback, errorCallback, page,
            maxNumberPerPage) {
        if (!_security.select) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.SQLDataControlConsumer("select", arguments);

        privateData.select(columns, where, function (rows) {
            successCallback(rows, reqId);
        }, function (error) {
            if (errorCallback) {
                errorCallback(reqId, error);
            }
        }, page, maxNumberPerPage);
    }

    self = new DataControlConsumerObject("SQL", providerId, dataId);

    self.insert = insert;
    self.update = update;
    self.remove = remove;
    self.select = select;

    return self;
};

MappedDataControlConsumer = function (providerId, dataId, dc) {
    var self, privateData = new MappedData(dc);

    function addValue(reqId, key, value, successCallback, errorCallback) {
        if (!_security.addValue) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.MappedDataControlConsumer("addValue", arguments);

        window.setTimeout(function () {
            if (privateData.insert(key, value)) {
                if (successCallback) {
                    successCallback(reqId);
                }
            } else if (errorCallback) {
                errorCallback(reqId, new WebAPIError(errorcode.UNKNOWN_ERR));
            }
        }, 1);
    }

    function removeValue(reqId, key, value, successCallback, errorCallback) {
        if (!_security.removeValue) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.MappedDataControlConsumer("removeValue", arguments);

        window.setTimeout(function () {
            if (privateData.remove(key, value)) {
                successCallback(reqId);
            } else if (errorCallback) {
                errorCallback(reqId, new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
        }, 1);
    }

    function getValue(reqId, key, successCallback, errorCallback) {
        if (!_security.getValue) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.MappedDataControlConsumer("getValue", arguments);

        window.setTimeout(function () {
            var values;

            values = privateData.search(key);

            if (values !== null) {
                successCallback(values, reqId);
            } else if (errorCallback) {
                errorCallback(reqId, new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
        }, 1);
    }

    function updateValue(reqId, key, oldValue, newValue, successCallback,
            errorCallback) {
        if (!_security.updateValue) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.MappedDataControlConsumer("updateValue", arguments);

        window.setTimeout(function () {
            if (privateData.update(key, oldValue, newValue)) {
                successCallback(reqId);
            } else if (errorCallback) {
                errorCallback(reqId, new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
        }, 1);
    }

    self = new DataControlConsumerObject("MAP", providerId, dataId);

    self.addValue    = addValue;
    self.removeValue = removeValue;
    self.getValue    = getValue;
    self.updateValue = updateValue;

    return self;
};

DataControlConsumerFactory = function (type, providerId, dataId, dc) {
    var self;

    switch (type) {
    case "SQL":
        self = new SQLDataControlConsumer(providerId, dataId, dc);
        break;

    case "MAP":
        self = new MappedDataControlConsumer(providerId, dataId, dc);
        break;
    }

    return self;
};

SQLData = function (dc) {
    var self, data, columnNames, SQLErr2WebAPIErr;

    // private
    function getDBTableName() {
        return "DC_" + Math.uuid(8, 16);
    }

    function getColumnNames(tx, results) {
        columnNames = results.rows.item(0).sql
                .replace(/^[^\(]+\(([^\)]+)\)/g, "$1")
                .replace(/(^|(,) )([^ ,]+)([^,]*|$)/g, "$2$3")
                .split(",");
    }

    function queryColumns(columns) {
        return columns.join("=?,") + "=?";
    }

    function queryValues(n) {
        return (new Array(n)).join("?,") + "?";
    }

    function shedQuotes(values) {
        return values.every(function (value, i, arr) {
            arr[i] = value.replace(/^('|")(.*)\1$/g, "$2");

            return (arr[i] !== value);
        });
    }

    function isNull(p) {
        return ((p === undefined) || (p === null));
    }

    function initialize() {
        SQLErr2WebAPIErr = [
            0,      // 0: UNKNOWN_ERR         0: UNKNOWN_ERR
            100,    // 1: DATABASE_ERR      100: IO_ERR
            100,    // 2: VERSION_ERR       100: IO_ERR
            100,    // 3: TOO_LARGE_ERR     100: IO_ERR
            22,     // 4: QUOTA_ERR          22: QUOTA_EXCEEDED_ERR
            12,     // 5: SYNTAX_ERR         12: SYNTAX_ERR
            100,    // 6: CONSTRAINT_ERR    100: IO_ERR
            23      // 7: TIMEOUT_ERR        23: TIMEOUT_ERR
        ];

        if (!("table" in dc)) {
            dc.table = getDBTableName();
            columnNames = ["id"];
            _save();
        }

        data = openDatabase('tinyHippos', '1.0', 'tiny Hippos persistence',
                2 * 1024 * 1024);

        data.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + dc.table +
                    ' (id unique)');
            tx.executeSql('SELECT sql FROM sqlite_master WHERE type="table" AND name=?',
                    [dc.table], getColumnNames);
        });
    }

    // public
    function insert(rowData, onSuccess, onError) {
        if (rowData.columns.length > rowData.values.length) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (!shedQuotes(rowData.values)) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }

        data.transaction(function (tx) {
            rowData.columns.forEach(function (column) {
                if (columnNames.indexOf(column) !== -1)
                    return;

                tx.executeSql('ALTER TABLE ' + dc.table + ' ADD ' + column +
                        ' TEXT', [], function () {
                            columnNames.push(column);
                        }, function (tx, error) {
                            onError(new WebAPIError(
                                    SQLErr2WebAPIErr[error.code],
                                    error.message));
                        });
            });

            tx.executeSql('INSERT INTO ' + dc.table + ' (' +
                    rowData.columns.join() + ') VALUES (' +
                    queryValues(rowData.values.length) + ')', rowData.values,
                    function (tx, results) {
                        onSuccess(results.insertId);
                    }, function (tx, error) {
                        onError(new WebAPIError(SQLErr2WebAPIErr[error.code],
                                error.message));
                    });
        });
    }

    function update(rowData, where, onSuccess, onError) {
        if (rowData.columns.length > rowData.values.length) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (!shedQuotes(rowData.values)) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }

        data.transaction(function (tx) {
            tx.executeSql('UPDATE ' + dc.table + ' SET ' +
                    queryColumns(rowData.columns) + ' WHERE ' + where,
                    rowData.values, onSuccess, function (tx, error) {
                        onError(new WebAPIError(SQLErr2WebAPIErr[error.code],
                                error.message));
                    });
        });
    }

    function remove(where, onSuccess, onError) {
        data.transaction(function (tx) {
            tx.executeSql('DELETE FROM ' + dc.table + ' WHERE ' + where, [],
                    onSuccess, function (tx, error) {
                        onError(new WebAPIError(SQLErr2WebAPIErr[error.code],
                                error.message));
                    });
        });
    }

    function select(columns, where, onSuccess, onError, page, maxNumberPerPage) {
        if (isNull(page)) {
            page = 1;
        } else {
            if (page <= 0) {
                throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
            }
            page = parseInt(page, 10);
        }

        if (isNull(maxNumberPerPage)) {
            if (page > 1) {
                throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
            }
        } else {
            if (maxNumberPerPage <= 0) {
                throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
            }
            maxNumberPerPage = parseInt(maxNumberPerPage, 10);
        }

        data.transaction(function (tx) {
            tx.executeSql('SELECT ' + columns.join() + ' FROM ' + dc.table +
                    ' WHERE ' + where, [], function (tx, results) {
                        var rows = [], rowStart, rowData, r, c;

                        rowStart = maxNumberPerPage ?
                            (page - 1) * maxNumberPerPage : 0;

                        for (r = rowStart; r < results.rows.length; ++r) {
                            rowData = {
                                columns: columns,
                                values: []
                            };
                            for (c in columns) {
                                rowData.values.push(results.rows
                                    .item(r)[columns[c]]);
                            }
                            rows.push(rowData);

                            if (maxNumberPerPage && (--maxNumberPerPage === 0))
                                break;
                        }

                        onSuccess(rows);
                    }, function (tx, error) {
                        onError(new WebAPIError(SQLErr2WebAPIErr[error.code],
                                error.message));
                    });
        });
    }

    initialize();

    self = {
        insert: insert,
        update: update,
        remove: remove,
        select: select
    };

    return self;
};

MappedData = function (dc) {
    var self, data = {}, ioStamp = 0;

    // private
    function addNode(tree, arr, i) {
        var key, value;

        if (typeof arr[i] === "string") {
            key = arr[i];
            value = 1;
        } else {
            key = arr[i][0];
            value = arr[i][1];
        }
        tree.insert(key, value);
    }

    function bisearch(tree, arr, queue) {
        var start, end, mid;

        if (queue.length === 0)
            return;

        start = queue.shift();
        end = queue.shift();

        if (start > end)
            return;

        mid = start + parseInt((end - start) / 2, 10);
        addNode(tree, arr, mid);
        queue.push(start, mid - 1);
        queue.push(mid + 1, end);
    }

    function build(arr) {
        var tree, mid, lTree = [], rTree = [];

        tree = redblack.tree();
        mid = parseInt(arr.length / 2, 10);
        addNode(tree, arr, mid);

        lTree.push(0, mid - 1);
        rTree.push(mid + 1, arr.length - 1);

        while ((lTree.length > 0) || (rTree.length > 0)) {
            bisearch(tree, arr, lTree);
            bisearch(tree, arr, rTree);
        }

        return tree;
    }

    function initialize() {
        for (var key in dc) {
            data[key] = build(dc[key]);
        }
    }

    function traverse(tree, key) {
        dc[key] = [];
        tree.forEach(function (count, value) {
            dc[key].push((count === 1) ? value : [value, count]);
        });
    }

    function persist() {
        if (ioStamp !== 0) {
            window.clearTimeout(ioStamp);
        }
        ioStamp = window.setTimeout(function () {
            var key;

            for (key in data) {
                traverse(data[key], key);
            }

            _save();

            ioStamp = 0;
        }, _data.PERSIST_DELAY);
    }

    // public
    function insert(key, value) {
        var tree, count;

        if (!(key in data)) {
            data[key] = redblack.tree();
        }

        tree = data[key];

        if (!tree)
            return false;

        count = tree.get(value);
        tree.insert(value, count ? (count + 1) : 1);
        persist();

        return true;
    }

    function remove(key, value) {
        var tree, count;

        if (!(key in data))
            return false;

        tree = data[key];
        count = tree.get(value);
        if (count === null)
            return false;

        tree.delete(value);

        if (tree.root === null) {
            delete data[key];
            if (key in dc) {
                delete dc[key];
            }
        }

        persist();

        return true;
    }

    function search(key) {
        var values = [], tree;

        if (!(key in data))
            return null;

        tree = data[key];
        tree.forEach(function (count, value) {
            while (count--) {
                values.push(value);
            }
        });

        return values;
    }

    function update(key, oldValue, newValue) {
        var tree, count;

        if (!(key in data))
            return false;

        tree = data[key];
        count = tree.get(oldValue);
        if (count === null)
            return false;

        tree.delete(oldValue);
        tree.insert(newValue, count);
        persist();

        return true;
    }

    initialize();

    self = {
        insert: insert,
        remove: remove,
        search: search,
        update: update
    };

    return self;
};

_initialize();

module.exports = _self;
