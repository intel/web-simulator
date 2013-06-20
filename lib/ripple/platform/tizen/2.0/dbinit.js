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

    _data.dbBuilder.register("FileSystem", FileSystem);
    _data.dbBuilder.register("Content", Content, "dbcontent.xml");
}

DBBuilder = function () {
    var self;

    // private
    function formatString(str) {
        return str.replace(/^\s+|[\t\n\r\v]+|\s+$/g, '').replace(/\s+/g, ' ');
    }

    function getAttributeValue(attr, type) {
        var i, value;

        if (("childNodes" in attr) && (typeof type !== 'object')) {
            value = [];

            for (i in attr.childNodes) {
                value.push(getAttributeValue(attr.childNodes[i], type));
            }

            return value;
        }

        switch (type) {
        case "Date":
            value = new Date(formatString(attr.textContent));
            break;

        case "DOMString":
            value = formatString(attr.textContent);
            break;

        case "Number":
            value = Number(formatString(attr.textContent));
            break;

        default:
            if (("childNodes" in attr) && (typeof type === 'object')) {
                value = {};

                for (i in attr.childNodes) {
                    value[attr.childNodes[i].nodeName] = getAttributeValue(
                        attr.childNodes[i], type[attr.childNodes[i].nodeName]);
                }
            }
            break;
        }

        return value;
    }

    // public
    function register(type, Module, xmlFile) {
        _data[type] = new Module();
        _self[type] = _data[type].initdb(xmlFile);
    }

    function build(obj, pattern) {
        var i, type, self = {};

        for (i in obj.childNodes) {
            type = pattern[obj.childNodes[i].nodeName];

            if (type && obj.childNodes[i]) {
                self[obj.childNodes[i].nodeName] = getAttributeValue(
                    obj.childNodes[i], type);
            }
        }

        return self;
    }

    function parseXml(obj) {
        var i, res = {};

        res.nodeName = obj.nodeName;

        if (obj.childElementCount === 0) {
            res.textContent = obj.textContent;
        } else {
            res.childNodes = [];

            for (i in obj.childNodes) {
                if (obj.childNodes[i].attributes) {
                    res.childNodes.push(parseXml(obj.childNodes[i]));
                }
            }
        }

        return res;
    }

    self = {
        register: register,
        build:    build,
        parseXml: parseXml
    }

    return self;
};

/*
 * FileSystem
 */

FileSystem = function () {
    var self;

    // private
    function createPath(path) {
        var parts = path.replace(/^\//, '').split("/"),
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

        return null;
    }

    function createFile(uri) {
        var directoryURI;

        directoryURI = uri.slice(0, uri.lastIndexOf('/') + 1);
        dbfs.stat(directoryURI, function () {}, function () {
            createPath(directoryURI);
        });

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
    var self, Content, ImageContent, VideoContent, AudioContent,
        DirectoryContent, ContentFactory;

    VideoContent = {
        editableAttributes: "DOMString",
        id:                 "DOMString",
        name:               "DOMString",
        type:               "DOMString",
        mimeType:           "DOMString",
        title:              "DOMString",
        contentURI:         "DOMString",
        thumbnailURIs:      "DOMString",
        releaseDate:        "Date",
        modifiedDate:       "Date",
        size:               "Number",
        description:        "DOMString",
        rating:             "Number",

        geolocation:        {latitude: "Number", longtitude: "Number"},
        album:              "DOMString",
        artists:            "DOMString",
        duration:           "Number",
        width:              "Number",
        height:             "Number"
    };

    AudioContent = {
        editableAttributes: "DOMString",
        id:                 "DOMString",
        name:               "DOMString",
        type:               "DOMString",
        mimeType:           "DOMString",
        title:              "DOMString",
        contentURI:         "DOMString",
        thumbnailURIs:      "DOMString",
        releaseDate:        "Date",
        modifiedDate:       "Date",
        size:               "Number",
        description:        "DOMString",
        rating:             "Number",

        album:              "DOMString",
        genres:             "DOMString",
        artists:            "DOMString",
        composers:          "DOMString",
        lyrics:             {
            type:           "DOMString",
            timestamps:     "DOMString",
            texts:          "DOMString"
        },
        copyright:          "DOMString",
        bitrate:            "Number",
        trackNumber:        "Number",
        duration:           "Number"
    };

    ImageContent = {
        editableAttributes: "DOMString",
        id:                 "DOMString",
        name:               "DOMString",
        type:               "DOMString",
        mimeType:           "DOMString",
        title:              "DOMString",
        contentURI:         "DOMString",
        thumbnailURIs:      "DOMString",
        releaseDate:        "Date",
        modifiedDate:       "Date",
        size:               "Number",
        description:        "DOMString",
        rating:             "Number",

        geolocation:        {latitude: "Number",longtitude: "Number"},
        width:              "Number",
        height:             "Number",
        orientation:        "DOMString"
    };

    DirectoryContent = {
        id:                 "DOMString",
        directoryURI:       "DOMString",
        title:              "DOMString",
        storageType:        "DOMString",
        modifiedDate:       "Date"
    };

    ContentFactory = function (type) {
        var pattern;

        switch (type) {
        case "video":
            pattern = VideoContent;
            break;

        case "audio":
            pattern = AudioContent;
            break;

        case "image":
            pattern = ImageContent;
            break;

        case "directory":
            pattern = DirectoryContent;
            break;
        }

        return pattern;
    }

    // public
    function initdb(dbFileName) {
        var i, db, results, contentNodes, directoryNodes, xmlHttp;

        db = {
            contents:    [],
            directories: []
        };

        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", utils.appLocation() + dbFileName, false);
        xmlHttp.send();

        if (!xmlHttp.responseXML) {
            return db;
        }

        results = _data.dbBuilder.parseXml(xmlHttp.responseXML.documentElement);
        results.childNodes[0].childNodes.forEach(function (node) {
            db.contents.push(_data.dbBuilder.build(node,
                new ContentFactory(node.nodeName)));
        });
        results.childNodes[1].childNodes.forEach(function (node) {
            db.directories.push(_data.dbBuilder.build(node,
                new ContentFactory(node.nodeName)));
        });

        for (i in db.contents) {
            _data.FileSystem.createFile(db.contents[i].contentURI);
        }

        return db;
    }

    self = {
        initdb: initdb
    };

    return self;
};

_initialize();

module.exports = _self;
