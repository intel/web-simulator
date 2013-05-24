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
    _self = {};

_self.Content = {
    contents: [{
        editableAttributes: ["name", "description", "rating", "geolocation"],
        id:                 Math.uuid(null, 16),
        name:               "webapi-tizen-content-test_video.mp4",
        type:               "VIDEO",
        mimeType:           "video/x-msvideo",
        title:              "webapi-tizen-content-test_video",
        contentURI:         "/opt/usr/media/webapi-tizen-content-tests/webapi-tizen-content-test_video.mp4",
        thumbnailURIs:      ["desktop/webapi-tizen-content-test_video.lnk"],
        releaseDate:        new Date(),
        modifiedDate:       new Date(),
        size:               92225,
        description:        null,
        rating:             0,

        geolocation:        null,
        album:              null,
        artists:            null,
        duration:           5005,
        width:              80,
        height:             128
    }, {
        editableAttributes: ["name", "description", "rating", "geolocation"],
        id:                 Math.uuid(null, 16),
        name:               "red-green.avi",
        type:               "VIDEO",
        mimeType:           "video/x-msvideo",
        title:              "red-green",
        contentURI:         "/opt/usr/media/Videos/red-green.avi",
        thumbnailURIs:      ["desktop/galaxy.lnk"],
        releaseDate:        new Date(),
        modifiedDate:       new Date(),
        size:               5096078,
        description:        "Universe View",
        rating:             5,

        geolocation:        null,
        album:              "galaxy",
        artists:            ["David"],
        duration:           123000,
        width:              220,
        height:             180
    }, {
        editableAttributes: ["name", "description", "rating", "geolocation"],
        id:                 Math.uuid(null, 16),
        name:               "galaxy.rmvb",
        type:               "VIDEO",
        mimeType:           "video/x-msvideo",
        title:              "Galaxy",
        contentURI:         "/opt/storage/sdcard/Videos/galaxy.rmvb",
        thumbnailURIs:      ["desktop/galaxy.lnk"],
        releaseDate:        new Date(),
        modifiedDate:       new Date(),
        size:               5096078,
        description:        "Universe View",
        rating:             9,

        geolocation:        null,
        album:              "galaxy",
        artists:            ["David"],
        duration:           156000,
        width:              220,
        height:             180
    }, {
        editableAttributes: ["name", "description", "rating"],
        id:                 Math.uuid(null, 16),
        name:               "webapi-tizen-content-test_audio.mp3",
        type:               "AUDIO",
        mimeType:           "audio/x-msaudio",
        title:              "Over the horizon",
        contentURI:         "/opt/usr/media/webapi-tizen-content-tests/webapi-tizen-content-test_audio.mp3",
        thumbnailURIs:      ["desktop/webapi-tizen-content-test_audio.lnk"],
        releaseDate:        new Date(),
        modifiedDate:       new Date(),
        size:               2703047,
        description:        "Samsung",
        rating:             0,

        album:              "Samsung",
        genres:             "New Age",
        artists:            ["Samsung"],
        composers:          null,
        lyrics:             null,
        copyright:          "Samsung",
        bitrate:            131072,
        trackNumber:        null,
        duration:           156000,
    }, {
        editableAttributes: ["name", "description", "rating"],
        id:                 Math.uuid(null, 16),
        name:               "titanic.mp3",
        type:               "AUDIO",
        mimeType:           "audio/x-msaudio",
        title:              "My Heart Will Go On",
        contentURI:         "/opt/usr/media/Sounds/titanic.mp3",
        thumbnailURIs:      ["desktop/titanic.lnk"],
        releaseDate:        new Date(),
        modifiedDate:       new Date(),
        size:               5662312,
        description:        "Creative mp3",
        rating:             3,

        album:              "Oscar",
        genres:             ["pop music"],
        artists:            ["Celine Dion"],
        composers:          ["James Horner"],
        lyrics:             {
            type:           "UNSYNCHRONIZED",
            texts:          ["Once more you open the door. And you're here in my heart. And my heart will go on and on."]
        },
        copyright:          "J&J Studio",
        bitrate:            138240,
        trackNumber:        1,
        duration:           352000
    }, {
        editableAttributes: ["name", "description", "rating"],
        id:                 Math.uuid(null, 16),
        name:               "rock.mp3",
        type:               "AUDIO",
        mimeType:           "audio/x-msaudio",
        title:              "Rock",
        contentURI:         "/opt/storage/sdcard/Sounds/rock.mp3",
        thumbnailURIs:      ["desktop/rock.lnk"],
        releaseDate:        new Date(),
        modifiedDate:       new Date(),
        size:               3670016,
        description:        "Pop Song",
        rating:             4,

        album:              "rock",
        genres:             ["Rock & Roll"],
        artists:            ["Emile"],
        composers:          ["Emile"],
        lyrics:             null,
        copyright:          "Rocky Dream Works",
        bitrate:            128000,
        trackNumber:        2,
        duration:           230000
    }, {
        editableAttributes: ["name", "description", "rating", "geolocaion", "orientation"],
        id:                 Math.uuid(null, 16),
        name:               "seagull.gif",
        type:               "IMAGE",
        mimeType:           "image/gif",
        title:              "Seagull",
        contentURI:         "/opt/usr/media/Images/seagull.gif",
        thumbnailURIs:      ["desktop/seagull.lnk"],
        releaseDate:        new Date(),
        modifiedDate:       new Date(),
        size:               391168,
        description:        "Natural Animation",
        rating:             1,

        geolocaion:         null,
        width:              800,
        height:             600,
        orientation:        "FLIP_HORIZONTAL"
    }, {
        editableAttributes: ["name", "description", "rating", "geolocaion", "orientation"],
        id:                 Math.uuid(null, 16),
        name:               "webapi-tizen-content-test_image.png",
        type:               "IMAGE",
        mimeType:           "image/png",
        title:              "webapi-tizen-content-test_image",
        contentURI:         "/opt/usr/media/webapi-tizen-content-tests/webapi-tizen-content-test_image.png",
        thumbnailURIs:      ["desktop/webapi-tizen-content-test_image.lnk"],
        releaseDate:        new Date(),
        modifiedDate:       new Date(),
        size:               116454,
        description:        null,
        rating:             0,

        geolocaion:         null,
        width:              320,
        height:             240,
        orientation:        null
    }],
    directories: [{
        id:           Math.uuid(null, 16),
        directoryURI: "/opt/usr/media/Images/",
        title:        "Images",
        storageType:  "INTERNAL",
        modifiedDate: new Date()
    }, {
        id:           Math.uuid(null, 16),
        directoryURI: "/opt/usr/media/Sounds/",
        title:        "Sounds",
        storageType:  "INTERNAL",
        modifiedDate: new Date()
    }, {
        id:           Math.uuid(null, 16),
        directoryURI: "/opt/usr/media/Videos/",
        title:        "Videos",
        storageType:  "INTERNAL",
        modifiedDate: new Date()
    }, {
        id:           Math.uuid(null, 16),
        directoryURI: "/opt/usr/media/webapi-tizen-content-tests/",
        title:        "Test",
        storageType:  "INTERNAL",
        modifiedDate: new Date()
    }, {
        id:           Math.uuid(null, 16),
        directoryURI: "/opt/storage/sdcard/Sounds/",
        title:        "External Sounds",
        storageType:  "EXTERNAL",
        modifiedDate: new Date()
    }, {
        id:           Math.uuid(null, 16),
        directoryURI: "/opt/storage/sdcard/Videos/",
        title:        "External Videos",
        storageType:  "EXTERNAL",
        modifiedDate: new Date()
    }]
};

function _initFileSystem() {
    var i;

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

    function createFile(uri) {
        var directoryURI;

        directoryURI = uri.slice(0, uri.lastIndexOf('/') + 1);
        dbfs.stat(directoryURI, function () {}, function () {
            createPath(directoryURI);
        });

        dbfs.touch(uri, function () {});
    }

    // Initialize dbfs
    filesystem.resolve("images", function () {});
    filesystem.resolve("videos", function () {});
    filesystem.resolve("music", function () {});

    // For Content
    for (i in _self.Content.contents) {
        createFile(_self.Content.contents[i].contentURI);
    }
}

_initFileSystem();

module.exports = _self;
