/*
 *  Copyright 2012 Intel Corporation
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
    filesystem = require('ripple/platform/tizen/2.0/filesystem'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    ContentDirectory,
    Content,
    VideoContent,
    AudioContent,
    ImageContent,
    ContentFactory,
    _data = {
        DB_CONTENT_KEY: "tizen1-db-content",
        directories:    [],
        contents:       [],
        listener:       null,
        dbStorage:      {}
    },
    _security = {
        "http://tizen.org/privilege/content.read": ["getDirectories", "find",
            "setChangeListener", "unsetChangeListener"],
        "http://tizen.org/privilege/content.write": ["update", "updateBatch",
            "scanFile"],
        all: true
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

    utils.forEach(_data.dbStorage.directories, function (directory) {
        _data.directories.push(new ContentDirectory(directory, true));
    });
    utils.forEach(_data.dbStorage.contents, function (content) {
        _data.contents.push(new ContentFactory(content, true));
    });

    _data.dbStorage.directories = _data.directories;
    _data.dbStorage.contents    = _data.contents;
}

_self = function () {
    var content;

    // private
    function updateContents(contents, successCallback, errorCallback) {
        var i, j, isFound = false, matched = [];

        if (tizen1_utils.isValidArray(contents)) {
            for (i in contents) {
                for (j in _data.contents) {
                    if (contents[i].id === _data.contents[j].id) {
                        matched.push(j);
                        break;
                    }
                }
            }

            if (matched.length === contents.length) {
                for (i in matched) {
                    _data.contents[matched[i]] = new ContentFactory(contents[i]);
                }
                isFound = true;
            }
        } else {
            for (i in _data.contents) {
                if (_data.contents[i].id === contents.id) {
                    _data.contents[i] = new ContentFactory(contents);
                    matched.push(i);
                    isFound = true;
                    break;
                }
            }
        }

        if (isFound) {
            _save();

            if (successCallback) {
                successCallback();
            }
            if (_data.listener !== null) {
                utils.forEach(matched, function (i) {
                    _data.listener.oncontentupdated(new ContentFactory(_data.contents[i]));
                });
            }
        } else if (errorCallback) {
            errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
        }
    }

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

    function extractProperties(entry) {
        var contentInitDict = {};

        contentInitDict.editableAttributes = ["name", "title", "description", "rating"];
        contentInitDict.name               = entry.name;
        contentInitDict.type               = getType(entry.name);
        contentInitDict.mimeType           = getMimeType(entry.name);
        contentInitDict.title              = getTitle(entry.name);
        contentInitDict.contentURI         = entry.fullPath;
        contentInitDict.thumbnailURIs      = [entry.fullPath];
        contentInitDict.releaseDate        = entry.lastModifiedDate;
        contentInitDict.modifiedDate       = entry.lastModifiedDate;
        contentInitDict.size               = 1048576;

        return contentInitDict;
    }

    // public
    function update(content) {
        if (!_security.all && !_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        content = t.Content(content);
        updateContents(content);
    }

    function updateBatch(contents, successCallback, errorCallback) {
        if (!_security.all && !_security.updateBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        contents = t.Content(contents, "[]");
        successCallback = t.SuccessCallback(successCallback, "?");
        errorCallback = t.ErrorCallback(errorCallback, "?");

        window.setTimeout(function () {
            updateContents(contents, successCallback, errorCallback);
        }, 1);
    }

    function getDirectories(successCallback, errorCallback) {
        var result = [];

        if (!_security.all && !_security.getDirectories) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        successCallback = t.ContentDirectoryArraySuccessCallback(successCallback);
        errorCallback = t.ErrorCallback(errorCallback, "?");

        if (_data.directories.length === 0) {
            if (errorCallback) {
                setTimeout(function () {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }, 1);
            }
            return;
        }

        utils.forEach(_data.directories, function (directory) {
            result.push(new ContentDirectory(directory));
        });

        successCallback(result);
    }

    function find(successCallback, errorCallback, directoryId, filter, sortMode, count, offset) {
        var src = [], result = [], i, directoryURI, parentURI, contents;

        if (!_security.all && !_security.find) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        successCallback = t.ContentArraySuccessCallback(successCallback);
        errorCallback   = t.ErrorCallback(errorCallback, "?");
        directoryId     = t.ContentDirectoryId(directoryId, "?");
        filter          = t.AbstractFilter(filter, "?");
        sortMode        = t.SortMode(sortMode, "?");
        count           = t["unsigned long"](count, "?");
        offset          = t["unsigned long"](offset, "?");

        if (!directoryId) {
            src = _data.contents;
        } else {
            if (_data.directories.length === 0) {
                if (errorCallback) {
                    setTimeout(function () {
                        errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                    }, 1);
                }
                return;
            }

            for (i in _data.directories) {
                if (_data.directories[i].id === directoryId) {
                    directoryURI = _data.directories[i].directoryURI;
                    break;
                }
            }

            if (!directoryURI) {
                if (errorCallback) {
                    setTimeout(function () {
                        errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                    }, 1);
                }
                return;
            }

            for (i in _data.contents) {
                parentURI = _data.contents[i].contentURI;
                parentURI = parentURI.slice(0, parentURI.lastIndexOf('/') + 1);
                if (parentURI === directoryURI) {
                    src.push(_data.contents[i]);
                }
            }
        }

        if (src.length === 0) {
            if (errorCallback) {
                setTimeout(function () {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }, 1);
            }
            return;
        }

        contents = tizen1_utils.query(src, filter, sortMode, count, offset);

        utils.forEach(contents, function (content) {
            result.push(new ContentFactory(content));
        });

        successCallback(result);
    }

    function scanFile(contentURI, successCallback, errorCallback) {
        var i, index, isFound = false;

        function onStatSuccess(entry) {
            var contentInitDict, content, directoryURI;

            if (isFound) {
                content = new ContentFactory(_data.contents[index], true);
            } else {
                contentInitDict = extractProperties(entry);
                content = new ContentFactory(contentInitDict, true);
                _data.contents.push(content);
            }
            _save();

            if (successCallback) {
                directoryURI = contentURI.slice(0,
                    contentURI.lastIndexOf('/') + 1);

                successCallback(directoryURI);
            }
            if (_data.listener !== null) {
                if (isFound) {
                    _data.listener.oncontentupdated(new ContentFactory(content));
                } else {
                    _data.listener.oncontentadded(new ContentFactory(content));
                }
            }
        }

        function onStatError() {
            var directoryURI;

            if (isFound) {
                _data.contents.splice(index, 1);
                _save();

                if (successCallback) {
                    directoryURI = contentURI.slice(0,
                        contentURI.lastIndexOf('/') + 1);

                    successCallback(directoryURI);
                }
                if (_data.listener !== null) {
                    _data.listener.oncontentremoved(_data.contents[index].id);
                }
            } else if (errorCallback) {
                window.setTimeout(function () {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }, 1);
            }
        }

        if (!_security.all && !_security.scanFile) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        contentURI = t.DOMString(contentURI);
        successCallback = t.ContentScanSuccessCallback(successCallback, "?");
        errorCallback = t.ErrorCallback(errorCallback, "?");

        for (i in _data.contents) {
            if (_data.contents[i].contentURI === contentURI) {
                isFound = true;
                index = i;
                break;
            }
        }

        dbfs.stat(contentURI, onStatSuccess, onStatError);
    }

    function setChangeListener(changeCallback) {
        if (!_security.all && !_security.setChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        changeCallback = t.ContentChangeCallback(changeCallback);

        _data.listener = changeCallback;
    }

    function unsetChangeListener() {
        if (!_security.all && !_security.unsetChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        _data.listener = null;
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            if (_security[subFeature].length === 0) {
                _security.all = true;
                return;
            }
            _security.all = false;
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

ContentDirectory = function (contentDirectoryInitDict, isInternal) {
    var id, directoryURI, title, storageType, modifiedDate;

    id           = contentDirectoryInitDict.id || null;
    directoryURI = contentDirectoryInitDict.directoryURI || null;
    title        = contentDirectoryInitDict.title || "";
    storageType  = contentDirectoryInitDict.storageType || "INTERNAL";
    modifiedDate = new Date(contentDirectoryInitDict.modifiedDate);

    if (!isInternal) {
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
    } else {
        this.id           = id;
        this.directoryURI = directoryURI;
        this.title        = title;
        this.storageType  = storageType;
        this.modifiedDate = modifiedDate;
    }
};

Content = function (contentInitDict, isInternal) {
    var editableAttributes, id, type, mimeType, title, contentURI,
        thumbnailURIs, releaseDate, modifiedDate, size;

    editableAttributes = contentInitDict.editableAttributes || [];
    id                 = contentInitDict.id || Math.uuid(null, 16);
    type               = contentInitDict.type || "IMAGE";
    mimeType           = contentInitDict.mimeType || "";
    title              = contentInitDict.title || "";
    contentURI         = contentInitDict.contentURI || "";
    thumbnailURIs      = contentInitDict.thumbnailURIs || null;
    releaseDate        = new Date(contentInitDict.releaseDate);
    modifiedDate       = new Date(contentInitDict.modifiedDate);
    size               = contentInitDict.size || null;
    this.name          = contentInitDict.name || "";
    this.description   = contentInitDict.description || "";
    this.rating        = contentInitDict.rating || 0;

    if (!isInternal) {
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
    } else {
        this.editableAttributes = editableAttributes;
        this.id                 = id;
        this.type               = type;
        this.mimeType           = mimeType;
        this.title              = title;
        this.contentURI         = contentURI;
        this.thumbnailURIs      = thumbnailURIs;
        this.releaseDate        = releaseDate;
        this.modifiedDate       = modifiedDate;
        this.size               = size;
    }
};

VideoContent = function (vidioContentInitDict, isInternal) {
    var _self, album, artists, duration, width, height;

    _self = new Content(vidioContentInitDict, isInternal);

    album             = vidioContentInitDict.album || null;
    artists           = vidioContentInitDict.artists || null;
    duration          = vidioContentInitDict.duration || 0;
    width             = vidioContentInitDict.width || 0;
    height            = vidioContentInitDict.height || 0;
    _self.geolocation = vidioContentInitDict.geolocation || null;

    if (!isInternal) {
        _self.__defineGetter__("album", function () {
            return album;
        });

        _self.__defineGetter__("artists", function () {
            return artists;
        });

        _self.__defineGetter__("duration", function () {
            return duration;
        });

        _self.__defineGetter__("width", function () {
            return width;
        });

        _self.__defineGetter__("height", function () {
            return height;
        });
    } else {
        _self.album    = album;
        _self.artists  = artists;
        _self.duration = duration;
        _self.width    = width;
        _self.height   = height;
    }

    return _self;
};

AudioContent = function (audioContentInitDict, isInternal) {
    var _self, album, genres, artists, composers, lyrics, copyright, bitrate,
        trackNumber, duration;

    _self = new Content(audioContentInitDict, isInternal);

    album       = audioContentInitDict.album || null;
    genres      = audioContentInitDict.genres || null;
    artists     = audioContentInitDict.artists || null;
    composers   = audioContentInitDict.composers || null;
    lyrics      = audioContentInitDict.lyrics || null;
    copyright   = audioContentInitDict.copyright || null;
    bitrate     = audioContentInitDict.bitrate || 0;
    trackNumber = audioContentInitDict.trackNumber || 0;
    duration    = audioContentInitDict.duration || 0;

    if (!isInternal) {
        _self.__defineGetter__("album", function () {
            return album;
        });

        _self.__defineGetter__("genres", function () {
            return genres;
        });

        _self.__defineGetter__("artists", function () {
            return artists;
        });

        _self.__defineGetter__("composers", function () {
            return composers;
        });

        _self.__defineGetter__("lyrics", function () {
            return lyrics;
        });

        _self.__defineGetter__("copyright", function () {
            return copyright;
        });

        _self.__defineGetter__("bitrate", function () {
            return bitrate;
        });

        _self.__defineGetter__("trackNumber", function () {
            return trackNumber;
        });

        _self.__defineGetter__("duration", function () {
            return duration;
        });
    } else {
        _self.album       = album;
        _self.genres      = genres;
        _self.artists     = artists;
        _self.composers   = composers;
        _self.lyrics      = lyrics;
        _self.copyright   = copyright;
        _self.bitrate     = bitrate;
        _self.trackNumber = trackNumber;
        _self.duration    = duration;
    }

    return _self;
};

ImageContent = function (imageContentInitDict, isInternal) {
    var _self, width, height;

    _self = new Content(imageContentInitDict, isInternal);

    width             = imageContentInitDict.width || 0;
    height            = imageContentInitDict.height || 0;
    _self.geolocation = imageContentInitDict.geolocation || null;
    _self.orientation = imageContentInitDict.orientation || null;

    if (!isInternal) {
        _self.__defineGetter__("width", function () {
            return width;
        });

        _self.__defineGetter__("height", function () {
            return height;
        });
    } else {
        _self.width  = width;
        _self.height = height;
    }

    return _self;
};

ContentFactory = function (contentInitDict, isInternal) {
    var _self;

    switch (contentInitDict.type) {
    case "IMAGE":
        _self = new ImageContent(contentInitDict, isInternal);
        break;

    case "VIDEO":
        _self = new VideoContent(contentInitDict, isInternal);
        break;

    case "AUDIO":
        _self = new AudioContent(contentInitDict, isInternal);
        break;

    default:
        _self = new Content(contentInitDict, isInternal);
        break;
    }

    return _self;
};

_initialize();

module.exports = _self;
