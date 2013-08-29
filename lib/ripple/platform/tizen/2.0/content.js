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
    dbfs = require('ripple/platform/tizen/2.0/dbfs'),
    dbinit = require('ripple/platform/tizen/2.0/dbinit'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    Content,
    ContentDirectory,
    ContentFactory,
    ContentStorage,
    AudioContent,
    ImageContent,
    VideoContent,
    ContentInternal,
    ContentDirectoryInternal,
    AudioContentInternal,
    ImageContentInternal,
    VideoContentInternal,
    AudioContentLyrics,
    _data = {
        DB_CONTENT_KEY: "tizen1-db-content",
        content:        {},
        listener:       null,
        dbStorage:      null
    },
    _security = {
        "http://tizen.org/privilege/content.read": ["find",
            "setChangeListener", "unsetChangeListener"],
        "http://tizen.org/privilege/content.write": ["update", "updateBatch",
            "scanFile"]
    },
    _self;

function _get() {
    _data.dbStorage = db.retrieveObject(_data.DB_CONTENT_KEY) || dbinit.Content;
}

function _save() {
    db.saveObject(_data.DB_CONTENT_KEY, _data.dbStorage);
}

function _initialize() {
    _get();

    if (!_data.dbStorage)
        return;

    utils.forEach(_data.dbStorage, function (content) {
        _data.content[content.directoryURI] = new ContentStorage(content);
    });

    _data.dbStorage = _data.content;
    _save();
}

_self = function () {
    var content;

    // private
    function getType(file) {
        var extName, type;

        extName = file.substr(file.lastIndexOf(".") + 1).toLowerCase();

        switch (extName) {
        case "bmp":
        case "gif":
        case "jpeg":
        case "jpg":
        case "png":
            type = "IMAGE";
            break;

        case "avi":
        case "mpeg":
        case "mpg":
        case "wmv":
        case "mp4":
            type = "VIDEO";
            break;

        case "wav":
        case "mp3":
            type = "AUDIO";
            break;

        default:
            type = "OTHER";
            break;
        }

        return type;
    }

    function getMimeType(file) {
        var mimeTypeTab = {
            IMAGE: "image/x-msimage",
            VIDEO: "video/x-msvideo",
            AUDIO: "audio/x-msaudio",
            OTHER: "other/unknown"
        };

        return mimeTypeTab[getType(file)];
    }

    function getTitle(file) {
        var title;

        title = file.substr(0, file.lastIndexOf("."));
        title = title.charAt(0).toUpperCase() + title.substr(1).toLowerCase();

        return title;
    }

    function getDirectoryURI(contentURI) {
        return contentURI.slice(0, contentURI.lastIndexOf("/") + 1)
                .replace(/file:\/\//, "");
    }

    function extractProperties(entry) {
        var contentInitDict = {};

        contentInitDict.editableAttributes = ["name", "title", "description",
                "rating"];
        contentInitDict.name               = entry.name;
        contentInitDict.type               = getType(entry.name);
        contentInitDict.mimeType           = getMimeType(entry.name);
        contentInitDict.title              = getTitle(entry.name);
        contentInitDict.contentURI         = entry.fullPath ?
                "file://" + entry.fullPath : entry.fullPath;
        contentInitDict.thumbnailURIs      = [entry.fullPath];
        contentInitDict.releaseDate        = entry.lastModifiedDate;
        contentInitDict.modifiedDate       = entry.lastModifiedDate;
        contentInitDict.size               = 1048576;

        return contentInitDict;
    }

    function updateContents(contents, successCallback, errorCallback) {
        var i, isFound = false, dir, matched = [];

        for (i in contents) {
            dir = getDirectoryURI(contents[i].contentURI);

            isFound = ((dir in _data.content) && (contents[i].contentURI in
                    _data.content[dir].contents));

            if (!isFound)
                break;

            matched.push(dir);
        }

        if (!isFound) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }

        for (i in matched) {
            _data.content[matched[i]].contents[contents[i].contentURI] =
                    new ContentFactory(contents[i], true);
        }

        _save();

        if (successCallback) {
            successCallback();
        }

        if (_data.listener !== null) {
            for (i in matched) {
                _data.listener.oncontentupdated(new ContentFactory(_data
                        .content[matched[i]].contents[contents[i].contentURI],
                        false));
            }
        }
    }

    // public
    function update(content) {
        if (!_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContentManager("update", arguments);

        updateContents([content]);
    }

    function updateBatch(contents, successCallback, errorCallback) {
        if (!_security.updateBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContentManager("updateBatch", arguments);

        window.setTimeout(function () {
            updateContents(contents, successCallback, errorCallback);
        }, 1);
    }

    function getDirectories(successCallback, errorCallback) {
        t.ContentManager("getDirectories", arguments);

        window.setTimeout(function () {
            var i, directories = [];

            for (i in _data.content) {
                directories.push(new ContentDirectory(_data.content[i]));
            }

            if (directories.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
                return;
            }

            successCallback(directories);
        }, 1);
    }

    function find(successCallback, errorCallback, directoryId, filter, sortMode,
            count, offset) {
        if (!_security.find) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContentManager("find", arguments);

        window.setTimeout(function () {
            var i, dir, contents = [], results = [], matchedDir;

            if (!directoryId) {
                for (dir in _data.content) {
                    for (i in _data.content[dir].contents) {
                        contents.push(_data.content[dir].contents[i]);
                    }
                }
            } else {
                for (dir in _data.content) {
                    if (_data.content[dir].id === directoryId) {
                        matchedDir = dir;
                        break;
                    }
                }

                if (!matchedDir) {
                    if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                    }
                    return;
                }

                for (i in _data.content[matchedDir].contents) {
                    contents.push(_data.content[matchedDir].contents[i]);
                }
            }

            if (contents.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }

            contents = tizen1_utils.query(contents, filter, sortMode, count,
                    offset);

            contents.forEach(function (content) {
                results.push(new ContentFactory(content, false));
            });

            successCallback(results);
        }, 1);
    }

    function scanFile(contentURI, successCallback, errorCallback) {
        var dir, isFound;

        function onStatSuccess(entry) {
            var contentInitDict, content;

            if (isFound) {
                content = new ContentFactory(_data.content[dir]
                        .contents[contentURI], true);
            } else {
                contentInitDict = extractProperties(entry);
                content = new ContentFactory(contentInitDict, true);
                _data.content[dir].contents[contentURI] = content;
            }

            _save();

            if (successCallback) {
                successCallback(contentURI);
            }

            if (_data.listener !== null) {
                if (isFound) {
                    _data.listener.oncontentupdated(
                            new ContentFactory(content, false));
                } else {
                    _data.listener.oncontentadded(
                            new ContentFactory(content, false));
                }
            }
        }

        function onStatError() {
            if (isFound) {
                delete _data.content[dir].contents[contentURI];
                _save();

                if (successCallback) {
                    successCallback(contentURI);
                }

                if (_data.listener !== null) {
                    _data.listener.oncontentremoved(_data.content[dir]
                            .contents[contentURI].id);
                }
            } else if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
        }

        if (!_security.scanFile) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContentManager("scanFile", arguments);

        window.setTimeout(function () {
            dir = getDirectoryURI(contentURI);

            isFound = ((dir in _data.content) &&
                    (contentURI in _data.content[dir].contents));

            dbfs.stat(contentURI.replace(/file:\/\//, ""), onStatSuccess,
                    onStatError);
        }, 1);
    }

    function setChangeListener(changeCallback) {
        if (!_security.setChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.ContentManager("setChangeListener", arguments);

        _data.listener = changeCallback;
    }

    function unsetChangeListener() {
        if (!_security.unsetChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        _data.listener = null;
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    content = {
        update:              update,
        updateBatch:         updateBatch,
        getDirectories:      getDirectories,
        find:                find,
        scanFile:            scanFile,
        setChangeListener:   setChangeListener,
        unsetChangeListener: unsetChangeListener,
        handleSubFeatures:   handleSubFeatures
    };

    return content;
};

ContentDirectoryInternal = function (contentDirectoryInitDict) {
    this.id           = contentDirectoryInitDict.id || null;
    this.directoryURI = contentDirectoryInitDict.directoryURI || null;
    this.title        = contentDirectoryInitDict.title || "";
    this.storageType  = contentDirectoryInitDict.storageType || "INTERNAL";
    this.modifiedDate = contentDirectoryInitDict.modifiedDate ?
            new Date(contentDirectoryInitDict.modifiedDate) : null;
};

ContentDirectory = function (contentDirectoryInitDict) {
    var id, directoryURI, title, storageType, modifiedDate;

    id           = contentDirectoryInitDict.id || null;
    directoryURI = contentDirectoryInitDict.directoryURI || null;
    title        = contentDirectoryInitDict.title || "";
    storageType  = contentDirectoryInitDict.storageType || "INTERNAL";
    modifiedDate = contentDirectoryInitDict.modifiedDate ?
            new Date(contentDirectoryInitDict.modifiedDate) : null;

    this.__defineGetter__("id", function () {
        return id;
    });

    this.__defineGetter__("directoryURI", function () {
        return directoryURI;
    });

    this.__defineGetter__("title", function () {
        return title;
    });

    this.__defineGetter__("storageType", function () {
        return storageType;
    });

    this.__defineGetter__("modifiedDate", function () {
        return modifiedDate;
    });
};

ContentInternal = function (contentInitDict) {
    this.editableAttributes = contentInitDict.editableAttributes || [];
    this.id                 = contentInitDict.id || Math.uuid(null, 16);
    this.type               = contentInitDict.type || "IMAGE";
    this.mimeType           = contentInitDict.mimeType || "";
    this.title              = contentInitDict.title || "";
    this.contentURI         = contentInitDict.contentURI || "";
    this.thumbnailURIs      = contentInitDict.thumbnailURIs || null;
    this.releaseDate        = contentInitDict.releaseDate ?
            new Date(contentInitDict.releaseDate) : null;
    this.modifiedDate       = contentInitDict.modifiedDate ?
            new Date(contentInitDict.modifiedDate) : null;
    this.size               = contentInitDict.size || 0;
    this.name               = contentInitDict.name || "";
    this.description        = contentInitDict.description || null;
    this.rating             = contentInitDict.rating || 0;
};

Content = function (contentInitDict) {
    var editableAttributes, id, type, mimeType, title, contentURI,
        thumbnailURIs, releaseDate, modifiedDate, size;

    editableAttributes = contentInitDict.editableAttributes || [];
    id                 = contentInitDict.id || Math.uuid(null, 16);
    type               = contentInitDict.type || "IMAGE";
    mimeType           = contentInitDict.mimeType || "";
    title              = contentInitDict.title || "";
    contentURI         = contentInitDict.contentURI || "";
    thumbnailURIs      = contentInitDict.thumbnailURIs || null;
    releaseDate        = contentInitDict.releaseDate ?
            new Date(contentInitDict.releaseDate) : null;
    modifiedDate       = contentInitDict.modifiedDate ?
            new Date(contentInitDict.modifiedDate) : null;
    size               = contentInitDict.size || 0;
    this.name          = contentInitDict.name || "";
    this.description   = contentInitDict.description || null;
    this.rating        = contentInitDict.rating || 0;

    this.__defineGetter__("editableAttributes", function () {
        return editableAttributes;
    });

    this.__defineGetter__("id", function () {
        return id;
    });

    this.__defineGetter__("type", function () {
        return type;
    });

    this.__defineGetter__("mimeType", function () {
        return mimeType;
    });

    this.__defineGetter__("title", function () {
        return title;
    });

    this.__defineGetter__("contentURI", function () {
        return contentURI;
    });

    this.__defineGetter__("thumbnailURIs", function () {
        return thumbnailURIs;
    });

    this.__defineGetter__("releaseDate", function () {
        return releaseDate;
    });

    this.__defineGetter__("modifiedDate", function () {
        return modifiedDate;
    });

    this.__defineGetter__("size", function () {
        return size;
    });
};

VideoContentInternal = function (videoContentInitDict) {
    ContentInternal.call(this, videoContentInitDict);

    this.geolocation = videoContentInitDict.geolocation || null;
    this.album       = videoContentInitDict.album || null;
    this.artists     = videoContentInitDict.artists || null;
    this.duration    = videoContentInitDict.duration || 0;
    this.width       = videoContentInitDict.width || 0;
    this.height      = videoContentInitDict.height || 0;
};

VideoContent = function (videoContentInitDict) {
    var album, artists, duration, width, height;

    Content.call(this, videoContentInitDict);

    album            = videoContentInitDict.album || null;
    artists          = videoContentInitDict.artists || null;
    duration         = videoContentInitDict.duration || 0;
    width            = videoContentInitDict.width || 0;
    height           = videoContentInitDict.height || 0;
    this.geolocation = videoContentInitDict.geolocation || null;

    this.__defineGetter__("album", function () {
        return album;
    });

    this.__defineGetter__("artists", function () {
        return artists;
    });

    this.__defineGetter__("duration", function () {
        return duration;
    });

    this.__defineGetter__("width", function () {
        return width;
    });

    this.__defineGetter__("height", function () {
        return height;
    });
};

AudioContentInternal = function (audioContentInitDict) {
    ContentInternal.call(this, audioContentInitDict);

    this.album       = audioContentInitDict.album || null;
    this.genres      = audioContentInitDict.genres || null;
    this.artists     = audioContentInitDict.artists || null;
    this.composers   = audioContentInitDict.composers || null;
    this.lyrics      = audioContentInitDict.lyrics || null;
    this.copyright   = audioContentInitDict.copyright || null;
    this.bitrate     = audioContentInitDict.bitrate || 0;
    this.trackNumber = audioContentInitDict.trackNumber || null;
    this.duration    = audioContentInitDict.duration || 0;
};

AudioContentLyrics = function (lyrics) {
    var type, texts, timestamps;

    type  = lyrics.type;
    texts = lyrics.texts;
    if (lyrics.type === "UNSYNCHRONIZED")
        timestamps = lyrics.timestamps;

    this.__defineGetter__("type", function () {
        return type;
    });

    this.__defineGetter__("texts", function () {
        return texts;
    });

    if (timestamps) {
        this.__defineGetter__("timestamps", function () {
            return timestamps;
        });
    }
};

AudioContent = function (audioContentInitDict) {
    var album, genres, artists, composers, lyrics, copyright, bitrate,
        trackNumber, duration;

    Content.call(this, audioContentInitDict);

    album       = audioContentInitDict.album || null;
    genres      = audioContentInitDict.genres || null;
    artists     = audioContentInitDict.artists || null;
    composers   = audioContentInitDict.composers || null;
    lyrics      = audioContentInitDict.lyrics ?
            new AudioContentLyrics(audioContentInitDict.lyrics) : null;
    copyright   = audioContentInitDict.copyright || null;
    bitrate     = audioContentInitDict.bitrate || 0;
    trackNumber = audioContentInitDict.trackNumber || null;
    duration    = audioContentInitDict.duration || 0;

    this.__defineGetter__("album", function () {
        return album;
    });

    this.__defineGetter__("genres", function () {
        return genres;
    });

    this.__defineGetter__("artists", function () {
        return artists;
    });

    this.__defineGetter__("composers", function () {
        return composers;
    });

    this.__defineGetter__("lyrics", function () {
        return lyrics;
    });

    this.__defineGetter__("copyright", function () {
        return copyright;
    });

    this.__defineGetter__("bitrate", function () {
        return bitrate;
    });

    this.__defineGetter__("trackNumber", function () {
        return trackNumber;
    });

    this.__defineGetter__("duration", function () {
        return duration;
    });
};

ImageContentInternal = function (imageContentInitDict) {
    ContentInternal.call(this, imageContentInitDict);

    this.geolocation = imageContentInitDict.geolocation || null;
    this.width       = imageContentInitDict.width || 0;
    this.height      = imageContentInitDict.height || 0;
    this.orientation = imageContentInitDict.orientation || "NORMAL";
};

ImageContent = function (imageContentInitDict) {
    var width, height;

    Content.call(this, imageContentInitDict);

    width            = imageContentInitDict.width || 0;
    height           = imageContentInitDict.height || 0;
    this.geolocation = imageContentInitDict.geolocation || null;
    this.orientation = imageContentInitDict.orientation || "NORMAL";

    this.__defineGetter__("width", function () {
        return width;
    });

    this.__defineGetter__("height", function () {
        return height;
    });
};

ContentFactory = function (contentInitDict, isInternal) {
    var ContentType;

    switch (contentInitDict.type) {
    case "IMAGE":
        ContentType = isInternal ? ImageContentInternal : ImageContent;
        break;

    case "VIDEO":
        ContentType = isInternal ? VideoContentInternal : VideoContent;
        break;

    case "AUDIO":
        ContentType = isInternal ? AudioContentInternal : AudioContent;
        break;

    default:
        ContentType = isInternal ? ContentInternal : Content;
        break;
    }

    return new ContentType(contentInitDict);
};

ContentStorage = function (content) {
    var i;

    ContentDirectoryInternal.call(this, content);
    this.contents = {};

    for (i in content.contents) {
        this.contents[i] = new ContentFactory(content.contents[i], true);
    }
};

_initialize();

module.exports = _self;
