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
    SimpleCoordinates = require('ripple/platform/tizen/2.0/SimpleCoordinates'),
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
    var contentDirectory = {};

    contentDirectory.id           = contentDirectoryInitDict.id || null;
    contentDirectory.directoryURI = contentDirectoryInitDict.directoryURI || null;
    contentDirectory.title        = contentDirectoryInitDict.title || "";
    contentDirectory.storageType  = contentDirectoryInitDict.storageType || "INTERNAL";
    contentDirectory.modifiedDate = contentDirectoryInitDict.modifiedDate ?
            new Date(contentDirectoryInitDict.modifiedDate) : null;

    this.__defineGetter__("id", function () {
        return contentDirectory.id;
    });

    this.__defineGetter__("directoryURI", function () {
        return contentDirectory.directoryURI;
    });

    this.__defineGetter__("title", function () {
        return contentDirectory.title;
    });

    this.__defineGetter__("storageType", function () {
        return contentDirectory.storageType;
    });

    this.__defineGetter__("modifiedDate", function () {
        return contentDirectory.modifiedDate;
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
    var content = {};

    content.editableAttributes = contentInitDict.editableAttributes || [];
    content.id                 = contentInitDict.id || Math.uuid(null, 16);
    content.name               = contentInitDict.name || "";
    content.type               = contentInitDict.type || "IMAGE";
    content.mimeType           = contentInitDict.mimeType || "";
    content.title              = contentInitDict.title || "";
    content.contentURI         = contentInitDict.contentURI || "";
    content.thumbnailURIs      = contentInitDict.thumbnailURIs || null;
    content.releaseDate        = contentInitDict.releaseDate ?
            new Date(contentInitDict.releaseDate) : null;
    content.modifiedDate       = contentInitDict.modifiedDate ?
            new Date(contentInitDict.modifiedDate) : null;
    content.size               = contentInitDict.size || 0;
    content.description        = contentInitDict.description || null;
    content.rating             = contentInitDict.rating || 0;

    this.__defineGetter__("editableAttributes", function () {
        return content.editableAttributes;
    });

    this.__defineGetter__("id", function () {
        return content.id;
    });

    this.__defineGetter__("name", function () {
        return content.name;
    });
    this.__defineSetter__("name", function (val) {
        try {
            content.name = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("type", function () {
        return content.type;
    });

    this.__defineGetter__("mimeType", function () {
        return content.mimeType;
    });

    this.__defineGetter__("title", function () {
        return content.title;
    });

    this.__defineGetter__("contentURI", function () {
        return content.contentURI;
    });

    this.__defineGetter__("thumbnailURIs", function () {
        return content.thumbnailURIs;
    });

    this.__defineGetter__("releaseDate", function () {
        return content.releaseDate;
    });

    this.__defineGetter__("modifiedDate", function () {
        return content.modifiedDate;
    });

    this.__defineGetter__("size", function () {
        return content.size;
    });

    this.__defineGetter__("description", function () {
        return content.description;
    });
    this.__defineSetter__("description", function (val) {
        try {
            content.description = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("rating", function () {
        return content.rating;
    });
    this.__defineSetter__("rating", function (val) {
        try {
            val = t.unsigned_long(val);
            if ((val < 0) || (val > 10))
                return;
            content.rating = val;
        } catch (e) {
        }
    });
};

VideoContentInternal = function (videoContentInitDict) {
    ContentInternal.call(this, videoContentInitDict);

    this.album       = videoContentInitDict.album || null;
    this.artists     = videoContentInitDict.artists || null;
    this.duration    = videoContentInitDict.duration || 0;
    this.width       = videoContentInitDict.width || 0;
    this.height      = videoContentInitDict.height || 0;
    this.geolocation = null;

    if (videoContentInitDict.geolocation) {
        this.geolocation = new SimpleCoordinates(
                videoContentInitDict.geolocation.latitude || null,
                videoContentInitDict.geolocation.longitude || null);
    }
};

VideoContent = function (videoContentInitDict) {
    var videoContent = {};

    Content.call(this, videoContentInitDict);

    videoContent.album       = videoContentInitDict.album || null;
    videoContent.artists     = videoContentInitDict.artists || null;
    videoContent.duration    = videoContentInitDict.duration || 0;
    videoContent.width       = videoContentInitDict.width || 0;
    videoContent.height      = videoContentInitDict.height || 0;
    videoContent.geolocation = null;

    if (videoContentInitDict.geolocation) {
        videoContent.geolocation = new SimpleCoordinates(
                videoContentInitDict.geolocation.latitude,
                videoContentInitDict.geolocation.longitude);
    }

    this.__defineGetter__("geolocation", function () {
        return videoContent.geolocation;
    });
    this.__defineSetter__("geolocation", function (val) {
        try {
            videoContent.geolocation = t.SimpleCoordinates(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("album", function () {
        return videoContent.album;
    });

    this.__defineGetter__("artists", function () {
        return videoContent.artists;
    });

    this.__defineGetter__("duration", function () {
        return videoContent.duration;
    });

    this.__defineGetter__("width", function () {
        return videoContent.width;
    });

    this.__defineGetter__("height", function () {
        return videoContent.height;
    });
};

AudioContentInternal = function (audioContentInitDict) {
    ContentInternal.call(this, audioContentInitDict);

    this.album       = audioContentInitDict.album || null;
    this.genres      = audioContentInitDict.genres || null;
    this.artists     = audioContentInitDict.artists || null;
    this.composers   = audioContentInitDict.composers || null;
    this.lyrics      = audioContentInitDict.lyrics ?
            new AudioContentLyrics(audioContentInitDict.lyrics) : null;
    this.copyright   = audioContentInitDict.copyright || null;
    this.bitrate     = audioContentInitDict.bitrate || 0;
    this.trackNumber = audioContentInitDict.trackNumber || null;
    this.duration    = audioContentInitDict.duration || 0;
};

AudioContentLyrics = function (lyrics) {
    var audioContentLyrics = {};

    audioContentLyrics.type       = lyrics.type;
    audioContentLyrics.texts      = lyrics.texts;
    audioContentLyrics.timestamps = (lyrics.type === "SYNCHRONIZED") ?
            lyrics.timestamps : undefined;

    this.__defineGetter__("type", function () {
        return audioContentLyrics.type;
    });

    this.__defineGetter__("texts", function () {
        return audioContentLyrics.texts;
    });

    this.__defineGetter__("timestamps", function () {
        return audioContentLyrics.timestamps;
    });
};

AudioContent = function (audioContentInitDict) {
    var audioContent = {};

    Content.call(this, audioContentInitDict);

    audioContent.album       = audioContentInitDict.album || null;
    audioContent.genres      = audioContentInitDict.genres || null;
    audioContent.artists     = audioContentInitDict.artists || null;
    audioContent.composers   = audioContentInitDict.composers || null;
    audioContent.lyrics      = audioContentInitDict.lyrics ?
            new AudioContentLyrics(audioContentInitDict.lyrics) : null;
    audioContent.copyright   = audioContentInitDict.copyright || null;
    audioContent.bitrate     = audioContentInitDict.bitrate || 0;
    audioContent.trackNumber = audioContentInitDict.trackNumber || null;
    audioContent.duration    = audioContentInitDict.duration || 0;

    this.__defineGetter__("album", function () {
        return audioContent.album;
    });

    this.__defineGetter__("genres", function () {
        return audioContent.genres;
    });

    this.__defineGetter__("artists", function () {
        return audioContent.artists;
    });

    this.__defineGetter__("composers", function () {
        return audioContent.composers;
    });

    this.__defineGetter__("lyrics", function () {
        return audioContent.lyrics;
    });

    this.__defineGetter__("copyright", function () {
        return audioContent.copyright;
    });

    this.__defineGetter__("bitrate", function () {
        return audioContent.bitrate;
    });

    this.__defineGetter__("trackNumber", function () {
        return audioContent.trackNumber;
    });

    this.__defineGetter__("duration", function () {
        return audioContent.duration;
    });
};

ImageContentInternal = function (imageContentInitDict) {
    ContentInternal.call(this, imageContentInitDict);

    this.geolocation = null;
    this.width       = imageContentInitDict.width || 0;
    this.height      = imageContentInitDict.height || 0;
    this.orientation = imageContentInitDict.orientation || "NORMAL";

    if (imageContentInitDict.geolocation) {
        this.geolocation = new SimpleCoordinates(
                imageContentInitDict.geolocation.latitude,
                imageContentInitDict.geolocation.longitude);
    }
};

ImageContent = function (imageContentInitDict) {
    var imageContent = {};

    Content.call(this, imageContentInitDict);

    imageContent.width       = imageContentInitDict.width || 0;
    imageContent.height      = imageContentInitDict.height || 0;
    imageContent.geolocation = null;
    imageContent.orientation = imageContentInitDict.orientation || "NORMAL";

    if (imageContentInitDict.geolocation) {
        imageContent.geolocation = new SimpleCoordinates(
                imageContentInitDict.geolocation.latitude,
                imageContentInitDict.geolocation.longitude);
    }

    this.__defineGetter__("geolocation", function () {
        return imageContent.geolocation;
    });
    this.__defineSetter__("geolocation", function (val) {
        try {
            imageContent.geolocation = t.SimpleCoordinates(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("width", function () {
        return imageContent.width;
    });

    this.__defineGetter__("height", function () {
        return imageContent.height;
    });

    this.__defineGetter__("orientation", function () {
        return imageContent.orientation;
    });
    this.__defineSetter__("orientation", function (val) {
        try {
            imageContent.orientation = t.ImageContentOrientation(val);
        } catch (e) {
        }
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
