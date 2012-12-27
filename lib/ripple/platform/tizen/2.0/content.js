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

var utils = require('ripple/utils'),
    db = require('ripple/db'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    _data = {
        DB_CONTENT_KEY: "tizen1-db-content",
        directories: [],
        contents: []
    },
    _security = {
        "http://tizen.org/privilege/content.read": ["getDirectories", "find"],
        "http://tizen.org/privilege/content.write": ["update", "updateBatch"],
        all: true
    },
    _self;

function _defaultContent() {
    var video1 = {
        editableAttibutes: ["title", "description", "rating", "geolocation", "album", "artists"],
        id:                Math.uuid(null, 16),
        type:              "VIDEO",
        mimeType:          "video/x-msvideo",
        title:             "Olympic",
        contentURI:        "videos/olympic.avi",
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
        type:              "VIDEO",
        mimeType:          "video/x-msvideo",
        title:             "Galaxy",
        contentURI:        "videos/galaxy.rmvb",
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
        type:              "AUDIO",
        mimeType:          "audio/x-msaudio",
        title:             "Rock",
        contentURI:        "music/rock.mp3",
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
        type:              "AUDIO",
        mimeType:          "audio/x-msaudio",
        title:             "Jazz",
        contentURI:        "music/jazz.acc",
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
        type:              "IMAGE",
        mimeType:          "image/jpeg",
        title:             "Great Wall",
        contentURI:        "images/greatwall.jpg",
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
        type:              "IMAGE",
        mimeType:          "image/gif",
        title:             "Seagull",
        contentURI:        "images/seagull.gif",
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
        directoryURI: "videos/",
        title:        "Videos",
        storageType:  "INTERNAL",
        modifiedDate: new Date()
    },
    audioDir = {
        id:           Math.uuid(null, 16),
        directoryURI: "music/",
        title:        "Music",
        storageType:  "EXTERNAL",
        modifiedDate: new Date()
    },
    imageDir = {
        id:           Math.uuid(null, 16),
        directoryURI: "images/",
        title:        "Images",
        storageType:  "EXTERNAL",
        modifiedDate: new Date()
    },
    dbContent = {
        directories: [videoDir, audioDir, imageDir],
        contents:    [video1, video2, audio1, audio2, image1, image2]
    };

    db.saveObject(_data.DB_CONTENT_KEY, dbContent);

    return dbContent;
}

function _initialize() {
    var dbContent = db.retrieveObject(_data.DB_CONTENT_KEY) || _defaultContent();

    _data.contents    = dbContent.contents;
    _data.directories = dbContent.directories;
}

_self = function () {
    var content;

    // private
    function updateContents(contents, successCallback, errorCallback) {
        var i, j, dbContent, count = 0, isFound = false, matched = [];

        if (tizen1_utils.isValidArray(contents)) {
            for (i in contents) {
                for (j in _data.contents) {
                    if (contents[i].id === _data.contents[j].id) {
                        ++count;
                        matched.push(j);
                        break;
                    }
                }
            }

            if (count === contents.length) {
                for (i in matched) {
                    _data.contents[matched[i]] = utils.copy(contents[i]);
                }
                isFound = true;
            }
        } else {
            for (i in _data.contents) {
                if (_data.contents[i].id === contents.id) {
                    _data.contents[i] = utils.copy(contents);
                    isFound = true;
                    break;
                }
            }
        }

        if (isFound) {
            dbContent = {directories: _data.directories, contents: _data.contents};
            db.saveObject(_data.DB_CONTENT_KEY, dbContent);
            if (successCallback) {
                successCallback();
            }
        } else if (errorCallback) {
            setTimeout(function () {
                errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            }, 1);
        }
    }

    // public
    function update(content) {
        if (!_security.all && !_security.update)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        updateContents(content);
    }

    function updateBatch(contents, successCallback, errorCallback) {
        if (!_security.all && !_security.updateBatch)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        function _updateBatch() {
            updateContents(contents, successCallback, errorCallback);
        }
        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "content:updateBatch", _updateBatch);
    }

    function getDirectories(successCallback, errorCallback) {
        if (!_security.all && !_security.getDirectories)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        function _getDirectories() {
            if (_data.directories.length === 0) {
                if (errorCallback) {
                    setTimeout(function () {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                    }, 1);
                }
                return;
            }

            successCallback(_data.directories);
        }
        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "content:getDirectories", _getDirectories);
    }

    function find(successCallback, errorCallback, directoryId, filter, sortMode, count, offset) {
        if (!_security.all && !_security.find)
            throw new WebAPIException(errorcode.SECURITY_ERR);

        function _find() {
            var src = [], i, directoryURI, parentURI, contents;

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
            successCallback(utils.copy(contents));
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "content:find", _find);
    }

    function handleSubFeatures(subFeatures) {
        for (var subFeature in subFeatures) {
            if (_security[subFeature].length === 0) {
                _security.all = true;
                return;
            }
            _security.all = false;
            utils.forEach(_security[subFeature], function (method) {
                _security[method] = true;
            });
        }
    }

    content = {
        update:            update,
        updateBatch:       updateBatch,
        getDirectories:    getDirectories,
        find:              find,
        handleSubFeatures: handleSubFeatures
    };

    return content;
};

_initialize();

module.exports = _self;
