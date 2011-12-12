/*
 *  Copyright 2011 Intel Corporation.
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
    constants = require('ripple/constants'),
    _console = require('ripple/console'),
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    PendingOperation = require('ripple/platform/wac/2.0/pendingoperation'),
    PendingObject = require('ripple/platform/wac/2.0/pendingObject'),
    DeviceApiError = require('ripple/platform/wac/2.0/deviceapierror'),
    wac2_utils = require('ripple/platform/wac/2.0/wac2_utils');

module.exports = function () {
    var _cameraArray, Camera, _videoStatus = {},
        _captureImage, _startVideoCapture,
        _doCaptureImage, _doStartVideoCapture,
        _doGetPreview, _doGetCameras,
        _stopVideoCapture, _createPreviewNode,
        _FAKEWAITTIME = 5,
        _defaultHighRes = true,
        _defaultImageFilename = "capture.jpg",
        _defaultVideoFilename = "capture.avi",
        _captureImageAllowed = true,
        _startVideoCaptureAllowed = true,
        _stopVideoCaptureAllowed = true,
        _createPreviewNodeAllowed = true;

    _doCaptureImage = function (onSuccess, onError, capFilename, capHighRes, pendingObj) {
        pendingObj.pendingID = setTimeout(function () {
            var dname = "", fname = "";
            //pretend to do sth.
            pendingObj.setCancelFlag(false);  // too late to cancel
            if (capFilename.indexOf("/") !== -1) {
                dname = capFilename.replace(/(.*\/)[^\/]+$/i, "$1");
                fname = capFilename.replace(/.*\/([^\/]*)$/i, "$1");
                //replace extension with jpg
                fname = fname.replace(/\.[^\/\.]+$/i, ".jpg");
            } else {
                dname = "";
                fname = capFilename.replace(/\.[^\/\.]+$/i, ".jpg");
            }
            if (fname === "") {
                fname = _defaultImageFilename;
            }
            if (fname.search(/\.jpg$/) === -1) {
                fname = fname + ".jpg";
            }
            if (capHighRes) {
                onSuccess(dname + "high-" + fname);
            } else {
                onSuccess(dname + "low-" + fname);
            }
        }, _FAKEWAITTIME);
    };

    _captureImage = function (onSuccess, onError, options) {
        var pendingOperation = {}, pendingObj,
            filename = this.id + _defaultImageFilename,
            highRes = _defaultHighRes, opt;

        if (onSuccess) {
            utils.validateArgumentType(onSuccess, "function", null, "captureImage: invalid successCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (onError) {
            utils.validateArgumentType(onError, "function", null, "captureImage: invalid errorCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (options) {
            opt = new Object(options);
            /* NOTE: if desktinationFilename or highRes is not provided by
               user, i.e. undefined or null, a default value is used.
             */
            if (opt.destinationFilename !== null && opt.destinationFilename !== undefined) {
            // TODO: validate filename via Filesystem.resolve()
                filename = String(opt.destinationFilename);
            }
            if (opt.highRes !== null && opt.highRes !== undefined) {
                highRes = Boolean(opt.highRes);
            }
        }
        if (!_captureImageAllowed) {
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.SECURITY_ERR));
                }, 1);
            }
            return undefined;
        }

        if (onSuccess) {
            pendingObj = new PendingObject();
            _doCaptureImage(onSuccess, onError, filename, highRes, pendingObj);
            pendingOperation = new PendingOperation(pendingObj);
            return pendingOperation;
        } else {
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                }, 1);
            }
        }
        return undefined;
    };

    _stopVideoCapture = function () {
        var dname = "", fname = "", capFilename = _videoStatus[this.id].capFilename;
        if (_videoStatus[this.id]) {
            if (capFilename.indexOf("/") !== -1) {
                dname = capFilename.replace(/(.*\/)[^\/]+$/i, "$1");
                fname = capFilename.replace(/.*\/([^\/]*)$/i, "$1");
                //replace extension with avi
                fname = fname.replace(/\.[^\/\.]+$/i, ".avi");
            } else {
                dname = "";
                fname = capFilename.replace(/\.[^\/\.]+$/i, ".avi");
            }
            if (fname === "") {
                fname = _defaultVideoFilename;
            }
            if (fname.search(/\.avi$/) === -1) {
                fname = fname + ".avi";
            }
            if (_videoStatus[this.id].capHighRes) {
                _videoStatus[this.id].capSuccess(dname + "high-" + fname);
            } else {
                _videoStatus[this.id].capSuccess(dname + "low-" + fname);
            }
            delete _videoStatus[this.id];
        }
    };

    _doStartVideoCapture = function (camID, onSuccess, onError, filename, highRes, pendingObj) {
        var videoStatus = {};
        _videoStatus[camID] = videoStatus;
        pendingObj.userCancel = function () {
            delete _videoStatus[camID];
        };
        pendingObj.getCancelFlag = function () {
            return !!_videoStatus[camID];
        };
        pendingObj.pendingID = setTimeout(function () {
            // waiting to be cancelled
            videoStatus = {
                capSuccess: onSuccess,
                capError: onError,
                capFilename: filename,
                capHighRes: highRes
            };
            _videoStatus[camID] = videoStatus;
        }, _FAKEWAITTIME);
    };

    _startVideoCapture = function (onSuccess, onError, options) {
        var pendingOperation = {}, pendingObj,
            filename = this.id + _defaultVideoFilename,
            highRes = _defaultHighRes, opt;

        if (onSuccess) {
            utils.validateArgumentType(onSuccess, "function", null, "startVideoCapture: invalid successCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (onError) {
            utils.validateArgumentType(onError, "function", null, "startVideoCapture: invalid errorCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (options) {
            opt = new Object(options);
            /* NOTE: if desktinationFilename or highRes is not provided by
               user, i.e. undefined or null, a default value is used.
             */
            if (opt.destinationFilename !== null && opt.destinationFilename !== undefined) {
            // TODO: validate filename via Filesystem.resolve()
                filename = String(opt.destinationFilename);
            }
            if (opt.highRes !== null && opt.highRes !== undefined) {
                highRes = Boolean(opt.highRes);
            }
        }
        if (!_captureImageAllowed) {
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.SECURITY_ERR));
                }, 1);
            }
            return undefined;
        }
        if (_videoStatus[this.id]) { 
            // capture already started
            _console.warn("WAC-2.0-startVideoCapture: capture already started");
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.UNKNOWN_ERR));
                }, 1);
            }
            return undefined;
        }

        if (onSuccess) {
            pendingObj = new PendingObject();
            _doStartVideoCapture(this.id, onSuccess, onError, filename, highRes, pendingObj);
            
            pendingOperation = new PendingOperation(pendingObj);
            return pendingOperation;
        } else {
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                }, 1);
            }
        }
        return undefined;
    };

    _doGetPreview = function (camID, onSuccess, onError, pendingObj) {
        var container, demoImg, loc, imageSrc;
        container = document.createElement("div");
        container.setAttribute("id", camID + "-wac-2-0-camera-preview-container");
        demoImg = document.createElement("img");
        demoImg.setAttribute("id", camID + "-wac-2-0-camera-demo-image");
        loc = document.location;
        imageSrc = loc.protocol + "//" + loc.hostname + loc.pathname.replace(/index\.html$/, "") + constants.CAMERA.WINDOW_ANIMATION;
        demoImg.setAttribute("src", imageSrc);
        demoImg.setAttribute("width", "100%");
        container.appendChild(demoImg);
        
        pendingObj.pendingID = setTimeout(function () {
            pendingObj.setCancelFlag(false);  // too late to cancel
            onSuccess(container);
        }, _FAKEWAITTIME);
    };

    _createPreviewNode = function (onSuccess, onError) {
        var pendingOperation, pendingObj = {};
        if (onSuccess) {
            utils.validateArgumentType(onSuccess, "function", null, "createPreviewNode: invalid successCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (onError) {
            utils.validateArgumentType(onError, "function", null, "createPreviewNode: invalid errorCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (!_createPreviewNodeAllowed) {
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.SECURITY_ERR));
                }, 1);
            }
            return undefined;
        }
        if (onSuccess) {
            pendingObj = new PendingObject();
            _doGetPreview(this.id, onSuccess, onError, pendingObj);
            pendingOperation = new PendingOperation(pendingObj);
            return pendingOperation;
        } else {
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                }, 1);
            }
        }
        return undefined;
    };

    Camera = function (cameraID) {
        return {
            id: cameraID,
            captureImage: _captureImage,
            startVideoCapture: _startVideoCapture,
            stopVideoCapture: _stopVideoCapture,
            createPreviewNode: _createPreviewNode
        };
    };

    _cameraArray = [new Camera("rear"), new Camera("front")];

    _doGetCameras = function (onSuccess, onError, pendingObj) {
        pendingObj.pendingID = setTimeout(function () {
            pendingObj.setCancelFlag(false);  // too late to cancel
            if (_cameraArray.length !== 0) {
                onSuccess(utils.copy(_cameraArray));
            } else {
                // no camera
                if (onError) {
                    setTimeout(function () {
                        onError(new DeviceApiError(errorcode.UNKNOWN_ERR));
                    }, 1);
                }
            }
        }, _FAKEWAITTIME);
    };

    this.getCameras = function (onSuccess, onError) {
        var pendingOperation, pendingObj = {};
        if (onSuccess) {
            utils.validateArgumentType(onSuccess, "function", null, "getCameras: invalid successCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (onError) {
            utils.validateArgumentType(onError, "function", null, "getCameras: invalid errorCallback parameter", new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (onSuccess) {
            pendingObj = new PendingObject();
            _doGetCameras(onSuccess, onError, pendingObj);
            pendingOperation = new PendingOperation(pendingObj);
            return pendingOperation;
        } else {
            if (onError) {
                setTimeout(function () {
                    onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                }, 1);
            }
        }
        return undefined;
    };

    this.handleSubFeatures = function (subFeatures) {
        if (wac2_utils.isEmptyObject(subFeatures) ||
            subFeatures["http://wacapps.net/api/camera"] ||
            (subFeatures["http://wacapps.net/api/camera.capture"] &&
            subFeatures["http://wacapps.net/api/camera.show"])) {
            return;
        }
        if (subFeatures["http://wacapps.net/api/camera.show"] &&
           !subFeatures["http://wacapps.net/api/camera.capture"]) {
            _captureImageAllowed = false;
            _startVideoCaptureAllowed = false;
            _stopVideoCaptureAllowed = false;
            return;
        }
        if (subFeatures["http://wacapps.net/api/camera.capture"] &&
           !subFeatures["http://wacapps.net/api/camera.show"]) {
            _createPreviewNodeAllowed = false;
            return;
        }
        _console.warn("WAC-2.0-Camera-handleSubFeatures: something wrong");
    };
};
