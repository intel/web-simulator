/*
 *  Copyright 2014 Intel Corporation.
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

var dbinit = require('ripple/platform/ivi/3.0/dbinit'),
    ivi_utils = require('ripple/platform/ivi/3.0/ivi_utils'),
    t = require('ripple/platform/ivi/3.0/typecast'),
    errorcode = require('ripple/platform/ivi/3.0/errorcode'),
    WebAPIError = require('ripple/platform/ivi/3.0/WebAPIError'),
    WebAPIException = require('ripple/platform/ivi/3.0/WebAPIException'),
    MediaFactory,
    MediaObject,
    MediaContainer,
    MediaItem,
    MediaVideo,
    MediaAudio,
    MediaImage,
    MediaServer,
    _security = {
        "http://tizen.org/privilege/mediaserver": []
    },
    _data = {
        root: "",
        mediaServer: {}
    },
    _self;

function _initialize() {
    var db = dbinit.MediaServer,
        server = db.server,
        containers = db.containers,
        items = db.items,
        i;

    for (i = 0; i < containers.length; i++) {
        if (containers[i].Path === "/") {
            server.root = new MediaContainer(containers[i]);
            break;
        }
    }

    _data.root = _setRoot();

    for (i = 0; i < items.length; i++) {
        items[i].URLs = [_data.root + items[i].Path];
        items[i].ThumbnailURIs = _data.root + items[i].Path;
    }

    _data.mediaServer.server = server;
    _data.mediaServer.containers = containers;
    _data.mediaServer.items = items;
    _data.mediaServer.onserverfound = null;

    _data.mediaServer.__defineGetter__("onserverfound", function () {
        return onserverfound;
    });
    
    _data.mediaServer.__defineSetter__("onserverfound", function (val) {
        try {
            onserverfound = t.Callback(val, "?");
        } catch (e) {
        }
    });
}

function _setRoot() {
    return location.pathname.replace("ripple.html", "resources/media");
}

function _formatSortMode(sortMode) {
    var order, attributeName,
        attributes = ["Type", "Path", "DisplayName", "URLs", "ThumbnailURIs",
                "MIMEType", "Rating", "Size", "Duration", "Album", "Genre",
                "Artists", "Width", "Height", "SampleRate"];

    order = sortMode.match(/[+|-]/g);
    if (order.length > 1) {
        return null;
    }

    attributeName = sortMode.match(/[A-Za-z]+/)[0];
    if (attributes.indexOf(attributeName) === -1) {
        return null;
    }

    return {
        order: (order[0] === "-") ? "DESC" : "ASC",
        attributeName: attributeName
    };
}

function _replacedQuoteSpace(filter) {
    var match = filter.match(/\"([a-z0-9A-Z]+)(\s+)([a-z0-9A-Z]+)\"/g);

    for (var i = 0; match && i < match.length; i++) {
        filter = filter.replace(match[i], match[i].replace(/\s+/g, "__"));
    }

    return filter.replace(/\"/g, "");
}

function _goFiltering(filter, items) {
    var str = _replacedQuoteSpace(filter),
        keyArray, tempArray, tempItems = [], results = [],
        cells = [], conditions = [], property, condition, value, i, p;

    keyArray = str.split(/\s+/);

    if ((keyArray.length + 1) % 4 !== 0) {
        return null;
    }

    while (keyArray.length > 0) {
        property = keyArray.shift();
        condition = keyArray.shift();
        value = keyArray.shift().replace("__", "");
        tempArray = [property, condition, value];

        if ((keyArray.indexOf("and") === 0) ||
                (keyArray.indexOf("or") === 0)) {
            conditions.push(keyArray.shift());
        }

        switch (condition) {
        case "contains":
            for (i = 0; i < items.length; i++) {
                if (items[i][property].indexOf(value) > -1) {
                    tempItems.push(items[i].Path);
                }
            }
            break;

        case "doesNotContain":
            for (i = 0; i < items.length; i++) {
                if (items[i][property].indexOf(value) === -1) {
                    tempItems.push(items[i].Path);
                }
            }
            break;

        case "exists":
            for (i = 0; i < items.length; i++) {
                if ((tempArray[2] === "true") ||
                    (tempArray[2] === true)) {
                    if (items[i][tempArray[0]]) {
                        tempItems.push(items[i].Path);
                    }
                } else if ((tempArray[2] === "false") ||
                    (tempArray[2] === false)) {
                    if (!items[i][tempArray[0]]) {
                        tempItems.push(items[i].Path);
                    }
                }
            }
            break;

        case "=":
            for (i = 0; i < items.length; i++) {
                if (items[i][property] === value) {
                    tempItems.push(items[i].Path);
                }
            }
            break;

        case "!=":
            for (i = 0; i < items.length; i++) {
                if (items[i][property] !== value) {
                    tempItems.push(items[i].Path);
                }
            }
            break;

        case "<":
            for (i = 0; i < items.length; i++) {
                if (items[i][property] < value) {
                    tempItems.push(items[i].Path);
                }
            }
            break;

        case "<=":
            for (i = 0; i < items.length; i++) {
                if (items[i][property] <= value) {
                    tempItems.push(items[i].Path);
                }
            }
            break;

        case ">":
            for (i = 0; i < items.length; i++) {
                if (items[i][property] > value) {
                    tempItems.push(items[i].Path);
                }
            }
            break;

        case ">=":
            for (i = 0; i < items.length; i++) {
                if (items[i][property] >= value) {
                    tempItems.push(items[i].Path);
                }
            }
            break;

        default:
            return null;
        }

        cells.push(ivi_utils.copy(tempItems));
        tempArray.length = 0;
        tempItems.length = 0;
    }

    while (true) {
        p = conditions.indexOf("and");
        if (p === -1)
            break;
        for (i = 0; i < cells[p + 1].length; i++) {
            if (cells[p].indexOf(cells[p + 1][i]) > -1) {
                results.push(cells[p + 1][i]);
            }
        }

        conditions.shift();
        cells.shift();
        cells.splice(0, 1, ivi_utils.copy(results));
        results.length = 0;
    }

    while (true) {
        p = conditions.indexOf("or");
        if (p === -1)
            break;
        results = [].concat(cells[p]);
        for (i = 0; i < cells[p + 1].length; i++) {
            if (cells[p].indexOf(cells[p + 1][i]) === -1) {
                results.push(cells[p + 1][i]);
            }
        }

        conditions.shift();
        cells.shift();
        cells.splice(0, 1, ivi_utils.copy(results));
        results.length = 0;
    }

    return cells[0];
}

function _filter(searchFilter, items) {
    var pp = [], index = 0, lpIndex, rpIndex, temp, i, results = [];

    searchFilter = searchFilter.trim();
    if (searchFilter === "*") {
        return items;
    }

    lpIndex = searchFilter.indexOf("(", index);
    if (lpIndex > -1) {
        pp.push(lpIndex);
        index = lpIndex;

        while (++index < searchFilter.length) {
            lpIndex = searchFilter.indexOf("(", index);
            rpIndex = searchFilter.indexOf(")", index);
            if ((lpIndex < rpIndex) && (lpIndex > -1)) {
                pp.push(lpIndex);
                index = lpIndex + 1;
            } else if ((lpIndex < rpIndex) && (lpIndex === -1)) {
                lpIndex = pp.pop();
                index = rpIndex + 1;
                temp = searchFilter.substring(lpIndex + 1, rpIndex);
                results = results.concat(_goFiltering(temp, items));
                break;
            } else if (lpIndex > rpIndex) {
                lpIndex = pp.pop();
                index = rpIndex + 1;
                temp = searchFilter.substring(lpIndex + 1, rpIndex);
                results = results.concat(_goFiltering(temp, items));
            } else {
                break;
            }
        }
    } else {
        temp = searchFilter;
        results = _goFiltering(temp, items);
    }

    if (results === null) return null;
    if (results.length === 0) return [];

    for (i = 0; i < items.length; i++) {
        if (results.indexOf(items[i].Path) === -1) {
            items.splice(i, 1);
            i--;
        }
    }

    return items;
}

_self = function () {
    var mediaserver;

    function scanNetwork(successCallback, errorCallback) {
        t.MediaServerManager("scanNetwork", arguments);

        window.setTimeout(function () {
            if (!_data.mediaServer.server) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN));
                }
                return;
            }

            if (mediaserver.onserverfound == null) {
                return;
            }

            mediaserver.onserverfound(new MediaServer(_data.mediaServer.server));
        }, 1);
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    mediaserver = {
        scanNetwork: scanNetwork,
        handleSubFeatures: handleSubFeatures
    };

    return mediaserver;
};

MediaServer = function (obj) {
    var mediaServer = {};

    mediaServer.id = obj.id || "";
    mediaServer.friendlyName = obj.friendlyName || "";
    mediaServer.manufacturer = obj.manufacturer || "";
    mediaServer.manufacturerURL = obj.manufacturerURL || "";
    mediaServer.modelDescription = obj.modelDescription || "";
    mediaServer.modelName = obj.modelName || "";
    mediaServer.modelNumber = obj.modelNumber || "";
    mediaServer.serialNumber = obj.serialNumber || "";
    mediaServer.UDN = obj.UDN || "";
    mediaServer.presentationURL = obj.presentationURL || "";
    mediaServer.iconURL = obj.iconURL || "";
    mediaServer.deviceType = obj.deviceType || "";
    mediaServer.root = obj.root || null;
    mediaServer.canCreateContainer = obj.canCreateContainer || false;
    mediaServer.canUpload = obj.canUpload || false;
    mediaServer.searchAttrs = obj.searchAttrs || [];
    mediaServer.sortAttrs = obj.sortAttrs || [];

    this.__defineGetter__("id", function () {
        return mediaServer.id;
    });

    this.__defineGetter__("friendlyName", function () {
        return mediaServer.friendlyName;
    });

    this.__defineGetter__("manufacturer", function () {
        return mediaServer.manufacturer;
    });

    this.__defineGetter__("manufacturerURL", function () {
        return mediaServer.manufacturerURL;
    });

    this.__defineGetter__("modelDescription", function () {
        return mediaServer.modelDescription;
    });

    this.__defineGetter__("modelName", function () {
        return mediaServer.modelName;
    });

    this.__defineGetter__("modelNumber", function () {
        return mediaServer.modelNumber;
    });

    this.__defineGetter__("serialNumber", function () {
        return mediaServer.serialNumber;
    });

    this.__defineGetter__("UDN", function () {
        return mediaServer.UDN;
    });

    this.__defineGetter__("presentationURL", function () {
        return mediaServer.presentationURL;
    });

    this.__defineGetter__("iconURL", function () {
        return mediaServer.iconURL;
    });

    this.__defineGetter__("deviceType", function () {
        return mediaServer.deviceType;
    });

    this.__defineGetter__("root", function () {
        return mediaServer.root;
    });

    this.__defineGetter__("canCreateContainer", function () {
        return mediaServer.canCreateContainer;
    });

    this.__defineGetter__("canUpload", function () {
        return mediaServer.canUpload;
    });

    this.__defineGetter__("searchAttrs", function () {
        return mediaServer.searchAttrs;
    });

    this.__defineGetter__("sortAttrs", function () {
        return mediaServer.sortAttrs;
    });

    this.upload = function (path) {
        if (!this.canUpload) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.MediaServer("upload", arguments);

        // upload
    };

    this.createFolder = function (title) {
        if (!this.canCreateContainer) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.MediaServer("createFolder", arguments);

        // createFolder
    };

    this.cancel = function () {
        // cancel
    };

    this.browse = function (containerId, sortMode, count, offset,
            successCallback, errorCallback) {
        t.MediaServer("browse", arguments);

        window.setTimeout(function () {
            var i, j, results, container = "", mediaFiles = [],
                paths = _data.mediaServer.containers,
                medias = _data.mediaServer.items,
                sort = _formatSortMode(sortMode);

            if (!containerId) {
                if (errorCallback)
                    errorCallback(new WebAPIError(errorcode.UNKNOWN));
                return;
            }

            for (i = 0; i < paths.length; i++) {
                if (paths[i].id === containerId) {
                    container = paths[i].Path;
                    continue;
                }

                if ((paths[i].Path.indexOf(containerId) === 0) &&
                        (paths[i].Path !== containerId)) {
                    mediaFiles.push(new MediaFactory(paths[i].Type,
                        paths[i]));
                }
            }

            if (!container) {
                if (errorCallback)
                    errorCallback(new WebAPIError(errorcode.UNKNOWN));
                return;
            }

            for (i = 0; i < paths.length; i++) {
                if ((paths[i].Path.indexOf(container) === 0) &&
                        (paths[i].Path !== container)) {
                    mediaFiles.push(new MediaFactory(paths[i].Type,
                        paths[i]));
                }
            }

            for (j = 0; j < medias.length; j++) {
                if (medias[j].Path.indexOf(container) === 0) {
                    mediaFiles.push(new MediaFactory(medias[j].Type,
                            medias[j]));
                }
            }

            results = ivi_utils.query(mediaFiles, false, sort, count, offset);
            successCallback(results);
        }, 1);
    };

    this.find = function (containerId, searchFilter, sortMode, count,
            offset, successCallback, errorCallback) {
        t.MediaServer("find", arguments);

        window.setTimeout(function () {
            var i, j, results, container = "", mediaFiles = [],
                paths = _data.mediaServer.containers,
                medias = _data.mediaServer.items,
                sort = _formatSortMode(sortMode);

            if (!containerId) {
                if (errorCallback)
                    errorCallback(new WebAPIError(errorcode.UNKNOWN));
                return;
            }

            for (i = 0; i < paths.length; i++) {
                if (paths[i].id === containerId) {
                    container = paths[i].Path;
                    continue;
                }

                if ((paths[i].Path.indexOf(containerId) === 0) &&
                        (paths[i].Path !== containerId)) {
                    mediaFiles.push(new MediaFactory(paths[i].Type,
                            paths[i]));
                }
            }

            if (!container) {
                if (errorCallback)
                    errorCallback(new WebAPIError(errorcode.UNKNOWN));
                return;
            }

            for (i = 0; i < paths.length; i++) {
                if ((paths[i].Path.indexOf(container) === 0) &&
                        (paths[i].Path !== container)) {
                    mediaFiles.push(new MediaFactory(paths[i].Type,
                            paths[i]));
                }
            }

            for (j = 0; j < medias.length; j++) {
                if (medias[j].Path.indexOf(container) === 0) {
                    mediaFiles.push(new MediaFactory(medias[j].Type,
                            medias[j]));
                }
            }

            mediaFiles = _filter(searchFilter, mediaFiles);
            if (mediaFiles === null) {
                if (errorCallback)
                    errorCallback(new WebAPIError(errorcode.UNKNOWN));
                return;
            }

            results = ivi_utils.query(_filter(searchFilter, mediaFiles), false,
                    sort, count, offset);
            successCallback(results);
        }, 1);
    };
};

MediaFactory = function (type, property) {
    var MediaType;

    switch (type) {
        case "image":
            MediaType = MediaImage;
            break;
        case "video":
            MediaType = MediaVideo;
            break;
        case "music":
        case "audio":
            MediaType = MediaAudio;
            break;
        case "container":
            MediaType = MediaObject;
            break;
    }

    return new MediaType(property);
};

MediaObject = function (property) {
    var mediaObject = {};

    mediaObject.id = property.id || "";
    mediaObject.Path = property.Path || "";
    mediaObject.DisplayName = property.DisplayName || "";
    mediaObject.Type = property.Type || "";

    this.__defineGetter__("Path", function () {
        return mediaObject.Path;
    });

    this.__defineGetter__("DisplayName", function () {
        return mediaObject.DisplayName;
    });

    this.__defineGetter__("Type", function () {
        return mediaObject.Type;
    });

    this.__defineGetter__("id", function () {
        return mediaObject.id;
    });
};

MediaContainer = function (property) {
    var mediaContainer = {};

    MediaObject.call(this, property);

    mediaContainer.childCount = property.childCount || 0;
    mediaContainer.canCreateContainer = property.canCreateContainer || false;
    mediaContainer.canDelete = property.canDelete || false;
    mediaContainer.canUpload = property.canUpload || false;
    mediaContainer.canRename = property.canRename || false;

    this.__defineGetter__("childCount", function () {
        return mediaContainer.childCount;
    });

    this.__defineGetter__("canCreateContainer", function () {
        return mediaContainer.canCreateContainer;
    });

    this.__defineGetter__("canDelete", function () {
        return mediaContainer.canDelete;
    });

    this.__defineGetter__("canUpload", function () {
        return mediaContainer.canUpload;
    });

    this.__defineGetter__("canRename", function () {
        return mediaContainer.canRename;
    });

    this.upload = function (title, path) {
        if (!this.canUpload) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.MediaContainer("upload", arguments);

        // upload
    };

    this.createFolder = function (title) {
        if (!this.canCreateContainer) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.MediaContainer("createFolder", arguments);

        // createFolder
    };
};

MediaItem = function (property) {
    var mediaItem = {};

    MediaObject.call(this, property);

    mediaItem.MIMEType = property.MIMEType || "";
    mediaItem.URLs = property.URLs || [];
    mediaItem.Size = property.Size || 0;

    this.__defineGetter__("MIMEType", function () {
        return mediaItem.MIMEType;
    });

    this.__defineGetter__("URLs", function () {
        return mediaItem.URLs;
    });

    this.__defineGetter__("Size", function () {
        return mediaItem.Size;
    });
};

MediaVideo = function (property) {
    var mediaVideo = {};

    MediaItem.call(this, property);

    mediaVideo.Album = property.Album || "";
    mediaVideo.Artist = property.Artist || [];
    mediaVideo.Duration = property.Duration || 0;
    mediaVideo.Width = property.Width || 0;
    mediaVideo.Height = property.Height || 0;

    this.__defineGetter__("Album", function () {
        return mediaVideo.Album;
    });

    this.__defineGetter__("Artist", function () {
        return mediaVideo.Artist;
    });

    this.__defineGetter__("Duration", function () {
        return mediaVideo.Duration;
    });

    this.__defineGetter__("Width", function () {
        return mediaVideo.Width;
    });

    this.__defineGetter__("Height", function () {
        return mediaVideo.Height;
    });
};

MediaAudio = function (property) {
    var mediaAudio = {};

    MediaItem.call(this, property);

    mediaAudio.Album = property.Album || "";
    mediaAudio.Artist = property.Artist || [];
    mediaAudio.Genre = property.Genre || [];
    mediaAudio.SampleRate = property.SampleRate || 0;
    mediaAudio.Duration = property.Duration || 0;

    this.__defineGetter__("Album", function () {
        return mediaAudio.Album;
    });

    this.__defineGetter__("Artist", function () {
        return mediaAudio.Artist;
    });

    this.__defineGetter__("Genre", function () {
        return mediaAudio.Genre;
    });

    this.__defineGetter__("SampleRate", function () {
        return mediaAudio.SampleRate;
    });

    this.__defineGetter__("Duration", function () {
        return mediaAudio.Duration;
    });
};

MediaImage = function (property) {
    var mediaImage = {};

    MediaItem.call(this, property);

    mediaImage.Width = property.Width || 0;
    mediaImage.Height = property.Height || 0;

    this.__defineGetter__("Width", function () {
        return mediaImage.Width;
    });

    this.__defineGetter__("Height", function () {
        return mediaImage.Height;
    });
};

_initialize();

module.exports = _self;
