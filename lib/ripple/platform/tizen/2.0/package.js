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
var db = require('ripple/db'),
    event = require('ripple/event'),
    utils = require('ripple/utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    PackageInformation = require('ripple/platform/tizen/2.0/PackageInformation'),
    t = require('ripple/platform/tizen/2.0/typedef'),
    _security = {
        "http://tizen.org/privilege/packagemanager.install": ["install", "uninstall"],
        "http://tizen.org/privilege/package.info": ["getPackagesInfo", "getPackageInfo",
                    "setPackageInfoEventListener", "unsetPackageInfoEventListener"],
        all: true
    },
    DB_PACKAGE_KEY = "tizen-db-package",
    _listeners = [],
    _data = {
        packageList: {},
        installedList: {}
    },
    INTERVAL = 1000, // INTERVAL = 1sec
    INSTALL_AMOUNT = 3072, // installation speed amount = 3072 (KB/sec)
    _self;

function _get() {
    _data = db.retrieveObject(DB_PACKAGE_KEY);
    utils.forEach(_data.installedList, function (item) {
        item.lastModified = new Date(item.lastModified);
    });
}

function _save() {
    db.saveObject(DB_PACKAGE_KEY, _data);
}

function _exec(callback, name, id, arg1) {
    switch (name) {
    case "onprogress":
        callback[name](id, arg1);
        break;
    case "oncomplete":
        callback[name](id);
        break;
    default:
        break;
    }
}

_self = function () {
    var _package;
    //public
    function install(path, progressCallback, errorCallback) {
        var intervalId, installedSize = 0, packageSize, updateFlag = false, item, info, progress;
        if (!_security.all && !_security.install) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.DOMString)).match(path) ||
            !(new TypeCoerce(t.PackageProgressCallback)).match(progressCallback) ||
            (errorCallback && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!_data.packageList[path]) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
            return;
        }
        item = _data.packageList[path];
        //check package has been installed or not
        if (_data.installedList[item.id]) {
            updateFlag = true;
        }
        packageSize = item.totalSize;
        intervalId = setInterval(function () {
            if (installedSize >= packageSize) {
                //install complete
                _data.installedList[item.id] = new PackageInformation(
                    item.id, item.name, item.iconPath, item.version,
                    item.totalSize, item.dataSize, new Date(),
                    item.author, item.description, item.appIds
                );
                event.trigger("install-apps", [item.appIds]);
                _save();
                _exec(progressCallback, "oncomplete", item.id);
                clearInterval(intervalId);
                item = _data.installedList[item.id];
                utils.forEach(_listeners, function (listener) {
                    info = new PackageInformation(
                        item.id, item.name, item.iconPath, item.version,
                        item.totalSize, item.dataSize, item.lastModified,
                        item.author, item.description, item.appIds);
                    if (!updateFlag) {
                        listener.oninstalled(info);
                    } else {
                        listener.onupdated(info);
                    }
                });
                event.trigger("installedList-updated");
            } else {
                installedSize += INSTALL_AMOUNT;
                if (installedSize > packageSize) {
                    progress = 100;
                } else {
                    progress = Math.floor(installedSize * 100 / packageSize);
                }
                _exec(progressCallback, "onprogress", item.id, progress);
            }

        }, INTERVAL);
    }

    function uninstall(id, progressCallback, errorCallback) {
        var intervalId, removedSize = 0, packageSize, item, progress;
        if (!_security.all && !_security.uninstall) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.PackageId)).match(id) ||
            !(new TypeCoerce(t.PackageProgressCallback)).match(progressCallback) ||
            (errorCallback && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!_data.installedList[id]) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
            return;
        }
        item = _data.installedList[id];
        packageSize = item.totalSize;
        intervalId = setInterval(function () {
            if (removedSize >= packageSize) {
                //remove complete
                utils.forEach(_data.packageList, function (_package) {
                    if (_package.id === id) {
                        event.trigger("remove-apps", [_package.appIds]);
                    }
                });
                delete _data.installedList[item.id];
                _save();
                _exec(progressCallback, "oncomplete", item.id);
                clearInterval(intervalId);
                item = _data.installedList[item.id];
                utils.forEach(_listeners, function (listener) {
                    listener.onuninstalled(id);
                });
                event.trigger("installedList-updated");
            } else {
                removedSize += INSTALL_AMOUNT * 10;
                if (removedSize > packageSize) {
                    progress = 100;
                } else {
                    progress = Math.floor(removedSize * 100 / packageSize);
                }
                _exec(progressCallback, "onprogress", item.id, progress);
            }
        }, INTERVAL);
    }

    function getPackagesInfo(successCallback, errorCallback) {
        var packageArray = [];
        if (!_security.all && !_security.getPackagesInfo) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.PackageInformationArraySuccessCallback)).match(successCallback) ||
            (errorCallback && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        utils.forEach(_data.installedList, function (item) {
            var i;
            i = new PackageInformation(
                    item.id, item.name, item.iconPath, item.version,
                    item.totalSize, item.dataSize, item.lastModified,
                    item.author, item.description, item.appIds
                );
            packageArray.push(i);
        });
        successCallback(packageArray);
    }

    function getPackageInfo(id) {
        var p, item;
        if (!_security.all && !_security.getPackageInfo) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.PackageId)).match(id)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!_data.installedList[id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        item = _data.installedList[id];
        p = new PackageInformation(
                    item.id, item.name, item.iconPath, item.version,
                    item.totalSize, item.dataSize, item.lastModified,
                    item.author, item.description, item.appIds
                );
        return p;
    }

    function setPackageInfoEventListener(eventCallback) {
        if (!_security.all && !_security.setPackageInfoEventListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.PackageInfomationEventCallback)).match(eventCallback)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        _listeners.push(eventCallback);
    }

    function unsetPackageInfoEventListener() {
        if (!_security.all && !_security.unsetPackageInfoEventListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        _listeners = [];
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

    function updatePackage(path, updateFlag) {
        var item, p, info;
        if (!_data.packageList[path]) {
            return;
        }
        _get();
        p = _data.packageList[path];
        item = _data.installedList[p.id];
        utils.forEach(_listeners, function (listener) {
            info = new PackageInformation(
                item.id, item.name, item.iconPath, item.version,
                item.totalSize, item.dataSize, item.lastModified,
                item.author, item.description, item.appIds);
            if (!updateFlag) {
                listener.oninstalled(info);
            } else {
                listener.onupdated(info);
            }
        });
    }

    event.on("install-packge", function (path) {
        updatePackage(path, false);
    });
    event.on("update-package", function (path) {
        updatePackage(path, true);
    });

    event.on("uninstall-package", function (id) {
        _get();
        utils.forEach(_listeners, function (listener) {
            listener.onuninstalled(id);
        });
    });

    _package = {
        install: install,
        uninstall: uninstall,
        getPackagesInfo: getPackagesInfo,
        getPackageInfo: getPackageInfo,
        setPackageInfoEventListener: setPackageInfoEventListener,
        unsetPackageInfoEventListener: unsetPackageInfoEventListener,
        handleSubFeatures: handleSubFeatures
    };

    return _package;
};

function _initialize() {
    _get();
}

_initialize();

module.exports = _self;

