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
    PendingObject = require('ripple/platform/tizen/2.0/pendingObject'),
    PendingOperation = require('ripple/platform/tizen/2.0/pendingoperation'),
    MediaSource,
    _data = {
        DB_MEDIACONTENT_KEY: "tizen1-db-mediacontent",
        mediaSource: null,
        folders: [],
        items: []
    },
    _self;

function _defaultMediaContent() {
    var video1 = {
        id: Math.uuid(null, 16),
        editableAttibutes: ["title", "description", "rating", "playedTime", "artists", "album"],
        title: "olympic",
        type: "VIDEO",
        mimeType: "video/x-msvideo",
        duration: 1245,
        width: 480,
        height: 240,
        itemURI : "videos/olympic.avi",
        rating: 4,
        playedTime: 1230,
        description: "Olympic Games",
        createdDate: new Date(),
        artists: ["olympic"],
        album: "olympic"
    },
    video2 = {
        id: Math.uuid(null, 16),
        editableAttibutes: ["title", "description", "rating", "playCount"],
        title: "galaxy",
        type: "VIDEO",
        duration: 156,
        width: 220,
        height: 180,
        itemURI : "videos/galaxy.rmvb",
        description: "Universe Spectacle",
        rating: 5,
        playCount: 2,
        createdDate: new Date(),
        modifiedDate: new Date()
    },
    image1 = {
        id: Math.uuid(null, 16),
        editableAttibutes: ["title", "orientation", "description", "rating"],
        title: "greatwall",
        type: "IMAGE",
        width: 480,
        height: 240,
        size: 1024,
        description: "GREATEWALL",
        itemURI: "images/greatwall.jpg",
        createdDate: new Date(),
        rating: 1,
        orientation: "NORMAL"
    },
    image2 = {
        id: Math.uuid(null, 16),
        editableAttibutes: ["title", "orientation", "description", "rating"],
        title: "seagull",
        type: "IMAGE",
        width: 480,
        height: 240,
        itemURI: "images/seagull.gif",
        createdDate: new Date(),
        description: "SEAGULL",
        rating: 2,
        orientation: "ROTATE_180"
    },
    audio1 = {
        id: Math.uuid(null, 16),
        editableAttibutes: ["title", "album", "genres", "artists", "composers"],
        title: "rock",
        type: "AUDIO",
        itemURI: "music/rock.mp3",
        createdDate: new Date(),
        album: "rock",
        genres: ["R&B"],
        artists: ["eminem"],
        composers: ["eminem"],
        copyright: "Copyright Rocky",
        bitrate: 128
    },
    audio2 = {
        id: Math.uuid(null, 16),
        editableAttibutes: ["title", "album", "genres", "artists", "composers"],
        title: "jazz",
        type: "AUDIO",
        itemURI: "music/jazz.acc",
        createdDate: new Date(),
        album: "jazz",
        genres: ["jazz"],
        artists: ["jackson"],
        composers: ["johnson"],
        copyright: "Copyright Rocky",
        bitrate: 128
    },
    videoFolder = {
        id: Math.uuid(null, 16),
        folderURI: "videos/",
        title: "videos",
        storageType: "INTERNAL",
        modifiedDate: new Date(),
    },
    audioFolder = {
        id: Math.uuid(null, 16),
        folderURI: "music/",
        title: "music",
        storageType: "EXTERNAL",
        modifiedDate: new Date(),
    },
    imageFolder = {
        id: Math.uuid(null, 16),
        folderURI: "images/",
        title: "images",
        storageType: "EXTERNAL",
        modifiedDate: new Date(),
    },
    mc = {
        folders: [videoFolder, audioFolder, imageFolder],
        items: [video1, video2, image1, image2, audio1, audio2]
    };

    db.saveObject(_data.DB_MEDIACONTENT_KEY, mc);

    return mc;
}

function _initialize() {
    var mc = db.retrieveObject(_data.DB_MEDIACONTENT_KEY) || _defaultMediaContent();

    _data.mediaSource = new MediaSource();
    _data.items       = mc.items;
    _data.folders     = mc.folders;
}

_self = {
    getLocalMediaSource: function () {
        return _data.mediaSource;
    }
};

MediaSource = function () {
    // private
    function find(successCallback, errorCallback, src, filter, sortMode, count, offset) {
        var items;

        if (src.length === 0) {
            if (errorCallback) {
                setTimeout(function () {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }, 1);
            }
            return;
        }

        items = tizen1_utils.query(src, filter, sortMode, count, offset);
        successCallback(utils.copy(items));
    }

    function update(items, successCallback, errorCallback) {
        var i, j, mc, count = 0, isFound = false, matched = [];

        if (tizen1_utils.isValidArray(items)) {
            for (i in items) {
                for (j in _data.items) {
                    if (items[i].id === _data.items[j].id) {
                        ++count;
                        matched.push(j);
                        break;
                    }
                }
            }

            if (count === items.length) {
                for (i in matched) {
                    _data.items[matched[i]] = utils.copy(items[i]);
                }
                isFound = true;
            }
        } else {
            for (i in _data.items) {
                if (_data.items[i].id === items.id) {
                    _data.items[i] = utils.copy(items);
                    isFound = true;
                    break;
                }
            }
        }

        if (isFound) {
            mc = {folders: _data.folders, items: _data.items};
            db.saveObject(_data.DB_MEDIACONTENT_KEY, mc);
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
    function updateItem(item) {
        update(item);
    }

    function updateItemsBatch(items, successCallback, errorCallback) {
        function _updateItemsBatch() {
            var pendingObj;

            pendingObj = new PendingObject();
            pendingObj.pendingID = setTimeout(function () {
                pendingObj.setCancelFlag(false);
                update(items, successCallback, errorCallback);
            }, 1);

            return new PendingOperation(pendingObj);
        }
        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "mediacontent:updateItemsBatch", _updateItemsBatch);
    }

    function getFolders(successCallback, errorCallback) {
        function _getFolders() {
            if (_data.folders.length === 0) {
                if (errorCallback) {
                    setTimeout(function () {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                    }, 1);
                }
                return;
            }

            successCallback(_data.folders);
        }
        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "mediacontent:getFolders", _getFolders);
    }

    function findItems(successCallback, errorCallback, filter, sortMode, count, offset) {
        function _findItems() {
            find(successCallback, errorCallback, _data.items, filter, sortMode, count, offset);
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "mediacontent:findItems", _findItems);
    }

    function browseFolder(id, successCallback, errorCallback, filter, sortMode, count, offset) {
        function _browseFolder() {
            var src = [], i, folderURI, parentURI;
            if (_data.folders.length === 0) {
                if (errorCallback) {
                    setTimeout(function () {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                    }, 1);
                }
                return;
            }

            for (i in _data.folders) {
                if (_data.folders[i].id === id) {
                    folderURI = _data.folders[i].folderURI;
                    break;
                }
                if (!folderURI) {
                    if (errorCallback) {
                        setTimeout(function () {
                            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                        }, 1);
                    }
                    return;
                }
            }

            for (i in _data.items) {
                parentURI = _data.items[i].itemURI;
                parentURI = parentURI.slice(0, parentURI.lastIndexOf('/'));
                if (parentURI === folderURI) {
                    src.push(_data.items[i]);
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

            find(successCallback, errorCallback, src, filter, sortMode, count, offset);
        }
        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "mediacontent:browseFolder", _browseFolder);
    }

    this.updateItem       = updateItem;
    this.updateItemsBatch = updateItemsBatch;
    this.getFolders       = getFolders;
    this.findItems        = findItems;
    this.browseFolder     = browseFolder;
};

_initialize();

module.exports = _self;
