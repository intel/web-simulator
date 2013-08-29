/*
 *  Copyright 2012 Intel Corporation.
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

var event = require('ripple/event'),
    utils = require('ripple/utils'),
    db = require('ripple/db'),
    dbinit = require('ripple/platform/tizen/2.0/dbinit'),
    DB_APPLICATION_KEY = "tizen1-db-application",
    _data = {
        appList: {},
        installedAppList: {}
    },
    _appInstalledTemplate,
    _apps,
    _installedAppList;

function _get() {
    _data = db.retrieveObject(DB_APPLICATION_KEY);
    if (_data === undefined) {
        _data = {
            appList: _apps,
            installedAppList: _installedAppList
        };
    }
}

function _save() {
    db.saveObject(DB_APPLICATION_KEY, _data);
}

function _loadInstalledAppList() {
    var html = "";
    jQuery("#application-installed-box").empty();
    utils.forEach(_data.installedAppList, function (item) {
        html += _appInstalledTemplate.replace(/#Name/g, item.name)
            .replace(/#ID/g, item.id)
            .replace(/#IconPath/, item.iconPath)
            .replace(/#Version/, item.version)
            .replace(/#Show/, item.show)
            .replace(/#Categories/, item.categories.join("<br>"))
            .replace(/#InstallDate/, item.installDate)
            .replace(/#Size/, item.size)
            .replace(/#PackageID/, item.packageId)
            .replace(/#SharedURI/, item.sharedURI)
            .replace(/#Operation/, item.operation)
            .replace(/#URI/, item.appControl.uri)
            .replace(/#MIME/, item.appControl.mime)
            .replace(/#category/, item.appControl.category)
            .replace(/#Data/, item.appControl.data);
    });
    jQuery("#application-installed-box").accordion("destroy");
    jQuery("#application-installed-box").html(html).accordion({
        active: false,
        collapsible: true,
        autoHeight: false
    });
}

function _displayInfo(text) {
    var html = "<b>" + text + "</b>";
    document.getElementById("application-error").innerHTML = html;
}

function _programChanged(status, id) {
    event.trigger("programChanged", [status, id]);
}

function updateApp(id, updateFlag) {
    var item = _data.appList[id];
    if (!item) {
        return;
    }
    _data.installedAppList[id] = {
        id: item.id,
        name: item.name,
        iconPath: item.iconPath,
        version: item.version,
        show: item.show,
        categories: item.categories,
        installDate: new Date(),
        size: item.size,
        packageId: item.packageId,
        sharedURI: item.sharedURI,
        operation: item.operation,
        appControl: {
            uri: item.appControl.uri,
            mime: item.appControl.mime,
            category: item.appControl.category,
            data: item.appControl.data
        },
        type: item.type,
        value: item.value
    };
    _save();
    if (updateFlag) {
        _programChanged("updated", id);
    } else {
        _programChanged("installed", id);
    }
    _loadInstalledAppList();
}

function removeApp(id) {
    delete _data.installedAppList[id];
    _save();
    _programChanged("uninstalled", id);
    _loadInstalledAppList();
}

event.on("install-current-app", function (item) {
    _data.installedAppList[item.id] = {
        id: item.id,
        name: item.name,
        iconPath: item.iconPath,
        version: item.version,
        show: item.show,
        categories: item.categories,
        installDate: item.installDate,
        size: item.size,
        packageId: item.packageId,
        sharedURI: item.sharedURI,
        operation: item.operation,
        appControl: {
            uri: item.appControl.uri,
            mime: item.appControl.mime,
            category: item.appControl.category,
            data: item.appControl.data
        },
        type: item.type,
        value: item.value
    };
    _loadInstalledAppList();
});

event.on("appServiceReplied", function () {
    _displayInfo("The application has been launched successfully");
});

event.on("install-apps", function (ids) {
    utils.forEach(ids, function (id) {
        updateApp(id, false);
    });
});

event.on("update-apps", function (ids) {
    utils.forEach(ids, function (id) {
        updateApp(id, true);
    });
});

event.on("remove-apps", function (ids) {
    utils.forEach(ids, function (id) {
        removeApp(id);
    });
});

module.exports = {
    initialize: function () {
        _apps = dbinit.Application.apps;
        _installedAppList = dbinit.Application.installedAppList;
        _appInstalledTemplate = jQuery("#application-installed-template").html();
        _get();
        _save();
        _loadInstalledAppList();
    }
};
