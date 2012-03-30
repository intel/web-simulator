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
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
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
        title: "olympic.avi",
        type: "VIDEO",
        duration: 1245,
        width: 480,
        height: 240,
        fileURI: "videos/olympic.avi",
        createdDate: new Date()
    },
    video2 = {
        id: Math.uuid(null, 16),
        title: "galaxy.rmvb",
        type: "VIDEO",
        duration: 156,
        width: 220,
        height: 180,
        fileURI: "videos/galaxy.rmvb",
        createdDate: new Date()
    },
    image1 = {
        id: Math.uuid(null, 16),
        title: "greatwall.jpg",
        type: "IMAGE",
        width: 480,
        height: 240,
        fileURI: "images/greatwall.jpg",
        createdDate: new Date()
    },
    image2 = {
        id: Math.uuid(null, 16),
        title: "seagull.gif",
        type: "IMAGE",
        width: 480,
        height: 240,
        fileURI: "images/seagull.gif",
        createdDate: new Date()
    },
    audio1 = {
        id: Math.uuid(null, 16),
        title: "rock.mp3",
        type: "AUDIO",
        fileURI: "music/rock.mp3",
        createdDate: new Date()
    },
    audio2 = {
        id: Math.uuid(null, 16),
        title: "jazz.acc",
        type: "AUDIO",
        fileURI: "music/jazz.acc",
        createdDate: new Date()
    },
    videoFolder = {
        id: Math.uuid(null, 16),
        folderURI: "videos",
        title: "videos",
        StorageType: "INTERNAL",
        modifiedDate: new Date(),
        mediaItems: [video1.id, video2.id]
    },
    audioFolder = {
        id: Math.uuid(null, 16),
        folderURI: "music",
        title: "music",
        StorageType: "EXTERNAL",
        modifiedDate: new Date(),
        mediaItems: [audio1.id, audio2.id]
    },
    imageFolder = {
        id: Math.uuid(null, 16),
        folderURI: "images",
        title: "images",
        StorageType: "EXTERNAL",
        modifiedDate: new Date(),
        mediaItems: [image1.id, image2.id]
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

    // public
    function updateItem(item, successCallback, errorCallback) {
        function _updateItem() {
            var i, mc, isFound = false;

            for (i in _data.items) {
                if (_data.items[i].id === item.id) {
                    _data.items.splice(i, 1);
                    _data.items.push(utils.copy(item));
                    mc = {folders: _data.folders, items: _data.items};
                    db.saveObject(_data.DB_MEDIACONTENT_KEY, mc);

                    isFound = true;
                    successCallback();
                    break;
                }
            }

            if (!isFound) {
                if (errorCallback) {
                    setTimeout(function () {
                        errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                    }, 1);
                }
            }
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "mediacontent:updateItem", _updateItem);
    }

    function findFolders(successCallback, errorCallback, filter, sortMode, count, offset) {
        function _findFolders() {
            find(successCallback, errorCallback, _data.folders, filter, sortMode, count, offset);
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "mediacontent:findFolders", _findFolders);
    }

    function findItems(successCallback, errorCallback, filter, sortMode, count, offset) {
        function _findItems() {
            find(successCallback, errorCallback, _data.items, filter, sortMode, count, offset);
        }

        return tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "mediacontent:findItems", _findItems);
    }

    this.updateItem  = updateItem;
    this.findFolders = findFolders;
    this.findItems   = findItems;
};

_initialize();

module.exports = _self;
