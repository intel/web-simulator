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

var utils = require('ripple/utils'),
    exception = require('ripple/exception'),
    dbfs = require('ripple/platform/tizen/2.0/dbfs'),
    filesystem = require('ripple/platform/tizen/2.0/filesystem'),
    DBBuilder,
    Content,
    FileSystem,
    _data = {
        dbBuilder: null
    },
    _self = {};

function _initialize() {
    _data.dbBuilder = new DBBuilder();

    _data.dbBuilder.register("FileSystem", "", FileSystem);
    _data.dbBuilder.register("Content", "dbcontent.xml", Content);
    _data.dbBuilder.register("Package", "dbpackage.xml");
    _data.dbBuilder.register("Application", "dbapplication.xml");

    _data.FileSystem.initdb();
}

DBBuilder = function () {
    var self;

    // private
    function formatString(str) {
        return str.replace(/^\s+|[\t\n\r\v]+|\s+$/g, "").replace(/\s+/g, " ");
    }

    function getType(node) {
        var type, reNum, reDate;

        if (node.childNodes) {
            return (node.childNodes[0].nodeName === "i") ? "Array" : "Object";
        }

        // Special case
        if (node.nodeName === "version") {
            return "DOMString";
        }

        reNum = /^(-?\d+)(\.\d+)?$/;
        reDate = /^(\d{4})\-(\d{2})\-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/;

        if (reNum.test(node.textContent)) {
            type = "Number";
        } else if (reDate.test(node.textContent)) {
            type = "Date";
        } else if (node.textContent === "true" || node.textContent === "false") {
            type = "Boolean";
        } else {
            type = "DOMString";
        }

        return type;
    }

    function build(node) {
        var i, value;

        switch (getType(node)) {
        case "Boolean":
            value = (formatString(node.textContent) === "true");
            break;

        case "Date":
            value = new Date(formatString(node.textContent));
            break;

        case "Number":
            value = Number(formatString(node.textContent));
            break;

        case "Object":
            value = {};
            for (i in node.childNodes) {
                value[node.childNodes[i].nodeName] = build(node.childNodes[i]);
            }
            break;

        case "Array":
            value = [];
            for (i in node.childNodes) {
                value.push(build(node.childNodes[i]));
            }
            break;

        default:  // "DOMString"
            value = formatString(node.textContent);
            break;
        }

        return value;
    }

    function parse(obj) {
        var i, res = {};

        res.nodeName = ("name" in obj.attributes) ?
                obj.attributes["name"].value : obj.nodeName;

        if (obj.childElementCount === 0) {
            res.textContent = obj.textContent;
        } else {
            res.childNodes = [];

            for (i in obj.childNodes) {
                if (obj.childNodes[i].attributes) {
                    res.childNodes.push(parse(obj.childNodes[i]));
                }
            }
        }

        return res;
    }

    // public
    function register(type, dbXml, Extension) {
        _data[type] = Extension ? new Extension() : {};

        if (!dbXml)
            return;

        _self.__defineGetter__(type, function () {
            var fnInit;

            if (!_data[type].db) {
                fnInit = _data[type].initdb || initdb;
                _data[type].db = fnInit(dbXml);
            }

            return _data[type].db;
        });
    }

    function initdb(dbXml) {
        var db = {}, xmlHttp, res;

        try {
            xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", "dbsamples/" + dbXml, false);
            xmlHttp.send();
        } catch (e) {
            exception.handle(e);
        }

        if (!xmlHttp.responseXML) {
            return null;
        }

        res = parse(xmlHttp.responseXML.documentElement);
        res.childNodes.forEach(function (node) {
            db[node.nodeName] = build(node);
        });

        return db;
    }

    self = {
        register: register,
        initdb:   initdb
    };

    return self;
};

/*
 * FileSystem
 */

FileSystem = function () {
    var self;

    // private
    function createPath(path) {
        var parts = path.replace(/^\//, "").split("/"),
            workflow = jWorkflow.order();

        parts.forEach(function (part, index) {
            var dir = "/" + utils.copy(parts).splice(0, index + 1).join("/");

            workflow.andThen(function (prev, baton) {
                baton.take();
                dbfs.mkdir(dir, baton.pass, baton.pass);
            });
        });

        workflow.start();
    }

    // public
    function initdb() {
        filesystem.resolve("images", function () {});
        filesystem.resolve("videos", function () {});
        filesystem.resolve("music", function () {});
    }

    function createFile(uri) {
        var directoryURI;

        directoryURI = uri.slice(0, uri.lastIndexOf("/") + 1)
                .replace(/file:\/\//, "");

        dbfs.stat(directoryURI, function () {}, function () {
            createPath(directoryURI);
        });

        uri = uri.replace(/file:\/\//, "");
        dbfs.touch(uri, function () {});
    }

    self = {
        initdb: initdb,
        createFile: createFile
    };

    return self;
};

/*
 * Content
 */

Content = function () {
    var self, ContentStorage;

    ContentStorage = function (contents, directories) {
        var i, parentURI;

        for (i in directories) {
            directories[i].contents = {};
            this[directories[i].directoryURI] = directories[i];
        }

        for (i in contents) {
            parentURI = contents[i].contentURI.slice(0,
                    contents[i].contentURI.lastIndexOf("/") + 1)
                    .replace(/file:\/\//, "");

            if (parentURI in this) {
                this[parentURI].contents[contents[i].contentURI] = contents[i];
            }
        }
    };

    // public
    function initdb(dbXml) {
        var i, db;

        db = _data.dbBuilder.initdb(dbXml);

        if (!db)
            return null;

        for (i in db.contents) {
            _data.FileSystem.createFile(db.contents[i].contentURI);
        }

        return new ContentStorage(db.contents, db.directories);
    }

    self = {
        initdb: initdb
    };

    return self;
};

_initialize();

module.exports = _self;
