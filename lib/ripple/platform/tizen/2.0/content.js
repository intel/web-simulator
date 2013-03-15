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
    filesystem = require('ripple/platform/tizen/2.0/filesystem'),
    t = require('ripple/platform/tizen/2.0/typedef'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
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

function _defaultContent() {
    var video1 = {
        editableAttibutes: ["title", "description", "rating", "geolocation", "album", "artists"],
        id:                Math.uuid(null, 16),
        name:              "olympic.avi",
        type:              "VIDEO",
        mimeType:          "video/x-msvideo",
        title:             "Olympic",
        contentURI:        "/opt/videos/olympic.avi",
        thumbnailURIs:     ["desktop/olympic.lnk"],
        releaseDate:       new Date(),
        modifiedDate:      new Date(),
        size:              12583498,
        description:       "Olympic Games",
        rating:            4,

        geolocation:       null,
        album:             "olympic",
        artists:           ["Daniel"],
        duration:          545,
        width:             480,
        height:            240
    },
    video2 = {
        editableAttibutes: ["title", "description", "rating", "album"],
        id:                Math.uuid(null, 16),
        name:              "galaxy.rmvb",
        type:              "VIDEO",
        mimeType:          "video/x-msvideo",
        title:             "Galaxy",
        contentURI:        "/opt/videos/galaxy.rmvb",
        thumbnailURIs:     ["desktop/galaxy.lnk"],
        releaseDate:       new Date(),
        modifiedDate:      new Date(),
        size:              5096078,
        description:       "Universe View",
        rating:            5,

        geolocation:       null,
        album:             "galaxy",
        artists:           ["David"],
        duration:          156,
        width:             220,
        height:            180
    },
    audio1 = {
        editableAttibutes: ["title", "description", "rating", "album", "genres", "artists", "composers"],
        id:                Math.uuid(null, 16),
        name:              "rock.mp3",
        type:              "AUDIO",
        mimeType:          "audio/x-msaudio",
        title:             "Rock",
        contentURI:        "/opt/music/rock.mp3",
        thumbnailURIs:     ["desktop/rock.lnk"],
        releaseDate:       new Date(),
        modifiedDate:      new Date(),
        size:              3670016,
        description:       "Pop Song",
        rating:            4,

        album:             "rock",
        genres:            ["Rock & Roll"],
        artists:           ["Emile"],
        composers:         ["Emile"],
        lyrics:            null,
        copyright:         "Rocky Dream Works",
        bitrate:           128,
        trackNumber:       2,
        duration:          230
    },
    audio2 = {
        editableAttibutes: ["title", "description", "rating", "album", "artists"],
        id:                Math.uuid(null, 16),
        name:              "jazz.acc",
        type:              "AUDIO",
        mimeType:          "audio/x-msaudio",
        title:             "Jazz",
        contentURI:        "/opt/music/jazz.acc",
        thumbnailURIs:     ["desktop/jazz.lnk"],
        releaseDate:       new Date(),
        modifiedDate:      new Date(),
        size:              5662312,
        description:       "Creative Jazz",
        rating:            3,

        album:             "jazz",
        genres:            ["jazz"],
        artists:           ["Jackson"],
        composers:         ["Johnson"],
        lyrics:            null,
        copyright:         "J&J Studio",
        bitrate:           128,
        trackNumber:       1,
        duration:          352
    },
    image1 = {
        editableAttibutes: ["title", "description", "rating", "geolocation", "orientation"],
        id:                Math.uuid(null, 16),
        name:              "greatwall.jpg",
        type:              "IMAGE",
        mimeType:          "image/jpeg",
        title:             "Great Wall",
        contentURI:        "/opt/images/greatwall.jpg",
        thumbnailURIs:     ["desktop/greatwall.lnk"],
        releaseDate:       new Date(),
        modifiedDate:      new Date(),
        size:              479232,
        description:       "World Spectacle",
        rating:            2,

        geolocaion:        null,
        width:             1024,
        height:            768,
        orientation:       "NORMAL"
    },
    image2 = {
        editableAttibutes: ["title", "rating", "orientation"],
        id:                Math.uuid(null, 16),
        name:              "seagull.gif",
        type:              "IMAGE",
        mimeType:          "image/gif",
        title:             "Seagull",
        contentURI:        "/opt/images/seagull.gif",
        thumbnailURIs:     ["desktop/seagull.lnk"],
        releaseDate:       new Date(),
        modifiedDate:      new Date(),
        size:              391168,
        description:       "Natural Animation",
        rating:            1,

        geolocaion:        null,
        width:             800,
        height:            600,
        orientation:       "FLIP_HORIZONTAL"
    },
    videoDir = {
        id:           Math.uuid(null, 16),
        directoryURI: "/opt/videos/",
        title:        "Videos",
        storageType:  "INTERNAL",
        modifiedDate: new Date()
    },
    audioDir = {
        id:           Math.uuid(null, 16),
        directoryURI: "/opt/music/",
        title:        "Music",
        storageType:  "EXTERNAL",
        modifiedDate: new Date()
    },
    imageDir = {
        id:           Math.uuid(null, 16),
        directoryURI: "/opt/images/",
        title:        "Images",
        storageType:  "EXTERNAL",
        modifiedDate: new Date()
    },
    dbContent = {
        directories: [videoDir, audioDir, imageDir],
        contents:    [video1, video2, audio1, audio2, image1, image2]
    };

    return dbContent;
}

function _get() {
    _data.dbStorage = db.retrieveObject(_data.DB_CONTENT_KEY) || _defaultContent();
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

    // Initialize dbfs
    filesystem.resolve("images", function () {});
    filesystem.resolve("videos", function () {});
    filesystem.resolve("music", function () {});
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
            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
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
        if (!(new TypeCoerce(t.Content)).match(content)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        updateContents(content);
    }

    function updateBatch(contents, successCallback, errorCallback) {
        if (!_security.all && !_security.updateBatch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce([t.Content])).match(contents) ||
            (successCallback && !(new TypeCoerce(t.SuccessCallback)).match(successCallback)) ||
            (errorCallback && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        window.setTimeout(function () {
            updateContents(contents, successCallback, errorCallback);
        }, 1);
    }

    function getDirectories(successCallback, errorCallback) {
        var result = [];

        if (!_security.all && !_security.getDirectories) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.ContentDirectoryArraySuccessCallback)).match(successCallback) ||
            (errorCallback && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (_data.directories.length === 0) {
            if (errorCallback) {
                setTimeout(function () {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
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
        if (!(new TypeCoerce(t.ContentArraySuccessCallback)).match(successCallback) ||
            (errorCallback && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback)) ||
            (directoryId   && !(new TypeCoerce(t.ContentDirectoryId)).match(directoryId)) ||
            (filter        && !(new TypeCoerce(t.AbstractFilter)).match(filter)) ||
            (sortMode      && !(new TypeCoerce(t.SortMode)).match(sortMode)) ||
            (count         && !(new TypeCoerce(t["unsigned long"])).match(count)) ||
            (offset        && !(new TypeCoerce(t["unsigned long"])).match(offset))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!directoryId) {
            src = _data.contents;
        } else {
            if (_data.directories.length === 0) {
                if (errorCallback) {
                    setTimeout(function () {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
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
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
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
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
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
        var i, contentId, isOutdated = false;

        function onStatSuccess(entry) {
            var contentInitDict, content, directoryURI;

            contentInitDict = extractProperties(entry);
            if (isOutdated) {
                contentInitDict.id = contentId;
            }

            content = new ContentFactory(contentInitDict, true);
            _data.contents.push(content);
            _save();

            if (successCallback) {
                directoryURI = contentURI.slice(0,
                    contentURI.lastIndexOf('/') + 1);

                successCallback(directoryURI);
            }
            if (_data.listener !== null) {
                if (isOutdated) {
                    _data.listener.oncontentupdated(new ContentFactory(content));
                } else {
                    _data.listener.oncontentadded(new ContentFactory(content));
                }
            }
        }

        function onStatError() {
            var directoryURI;

            if (isOutdated) {
                _save();

                if (successCallback) {
                    directoryURI = contentURI.slice(0,
                        contentURI.lastIndexOf('/') + 1);

                    successCallback(directoryURI);
                }
                if (_data.listener !== null) {
                    _data.listener.oncontentremoved(contentId);
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
        if (!(new TypeCoerce(t.DOMString)).match(contentURI) ||
            (successCallback && !(new TypeCoerce(t.ContentScanSuccessCallback)).match(successCallback)) ||
            (errorCallback   && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        for (i in _data.contents) {
            if (_data.contents[i].contentURI === contentURI) {
                contentId = _data.contents[i].id;
                _data.contents.splice(i, 1);
                isOutdated = true;
                break;
            }
        }

        dbfs.stat(contentURI, onStatSuccess, onStatError);
    }

    function setChangeListener(changeCallback) {
        if (!_security.all && !_security.setChangeListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.ContentChangeCallback)).match(changeCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

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
    var editableAttributes, id, type, mimeType, contentURI, thumbnailURIs,
        releaseDate, modifiedDate, size;

    editableAttributes = contentInitDict.editableAttributes || [];
    id                 = contentInitDict.id || Math.uuid(null, 16);
    type               = contentInitDict.type || "IMAGE";
    mimeType           = contentInitDict.mimeType || "";
    contentURI         = contentInitDict.contentURI || "";
    thumbnailURIs      = contentInitDict.thumbnailURIs || null;
    releaseDate        = new Date(contentInitDict.releaseDate);
    modifiedDate       = new Date(contentInitDict.modifiedDate);
    size               = contentInitDict.size || null;
    this.name          = contentInitDict.name || "";
    this.title         = contentInitDict.title || "";
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
