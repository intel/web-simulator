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
    DB_APPLICATION_KEY = "tizen1-db-application",
    _data = {
        appList : {},
        installedAppList: {}
    },
    _appInstalledTemplate,
    _apps = {
        "http://tizen.org/viewer": {
            id: "http://tizen.org/viewer",
            name: "Tizen viewer",
            iconPath: "001.png",
            version: "1.9",
            show: true,
            categories: ["media"],
            size: 5120,
            packageId: "TEST_APP_ID",
            sharedURI: "/usr/local/share/viewer",
            operation: "http://tizen.org/appcontrol/operation/view",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/view",
                mime: "image/*",
                category: "media",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "http://tizen.org/player": {
            id: "http://tizen.org/player",
            name: "Tizen player",
            iconPath: "002.png",
            version: "2.0",
            show: true,
            categories: ["media"],
            size: 2048,
            packageId: "TEST_APP_ID",
            sharedURI: "/usr/local/share/player",
            operation: "http://tizen.org/appcontrol/operation/play",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/play",
                mime: "video/*",
                category: "media",
                data: ""
            },
            type: "AUTHOR_SIGNER",
            value: ""
        },
        "http://tizen.org/dummy": {
            id: "http://tizen.org/dummy",
            name: "Tizen dummy",
            iconPath: "dummy.png",
            version: "1.7",
            show: true,
            categories: ["media"],
            size: 3094,
            packageId: "EXAMPLE_ID",
            sharedURI: "/usr/local/share/dummy",
            operation: "http://tizen.org/appcontrol/operation/dummy",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/dummy",
                mime: "video/*",
                category: "media",
                data: ""
            },
            type: "AUTHOR_SIGNER",
            value: ""
        },
        "http://tizen.org/dialer": {
            id: "http://tizen.org/dialer",
            name: "Tizen dialer",
            iconPath: "002.png",
            version: "2.1",
            show: true,
            categories: ["dialer"],
            size: 2048,
            packageId: "SAMPLE_ID",
            sharedURI: "/usr/local/share/dialer",
            operation: "http://tizen.org/appcontrol/operation/call",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/call",
                mime: "application/xml",
                category: "dialer",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "http://tizen.org/sender": {
            id: "http://tizen.org/sender",
            name: "Tizen sender",
            iconPath: "005.png",
            version: "2.2",
            show: true,
            categories: ["message"],
            size: 2048,
            packageId: "SAMPLE_ID",
            sharedURI: "/usr/local/share/sender",
            operation: "http://tizen.org/appcontrol/operation/send_text",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/send_text",
                mime: "text/plain",
                category: "message",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "api1pack00.WebAPITizenPackageTests": {
            id: "api1pack00.WebAPITizenPackageTests",
            name: "Tizen test app",
            iconPath: "001.png",
            version: "2.2",
            show: true,
            categories: ["message"],
            size: 2048,
            packageId: "api1pack00",
            sharedURI: "/usr/local/share/apiuri",
            operation: "http://tizen.org/appcontrol/operation/view",
            appControl: {
                uri: "http://www.tizen.org",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "api1appli1.TCTAppControl": {
            id: "api1appli1.TCTAppControl",
            name: "api1appli1 TCTAppControl",
            iconPath: "001.png",
            version: "2.4",
            show: true,
            categories: ["message"],
            size: 2048,
            packageId: "api1pack00",
            sharedURI: "/usr/local/share/apiuri",
            operation: "http://tizen.org/appcontrol/operation/TCTAppControl",
            appControl: {
                uri: "http://www.tizen.org",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "testpack00.autoWebapiTizenPackageTestApplication": {
            id: "testpack00.autoWebapiTizenPackageTestApplication",
            name: "Tizen test app 2",
            iconPath: "002.png",
            version: "3.0",
            show: true,
            categories: ["message"],
            size: 2048,
            packageId: "testpack00",
            sharedURI: "/usr/local/share/apiuri2",
            operation: "http://tizen.org/appcontrol/operation/pick",
            appControl: {
                uri: "http://www.tizen.org",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "testpack01.testLaunch": {
            id: "testpack01.testLaunch",
            name: "Tizen test launch",
            iconPath: "003.png",
            version: "3.0",
            show: true,
            categories: ["message"],
            size: 2048,
            packageId: "testpack01",
            sharedURI: "/usr/local/share/apiuri3",
            operation: "http://tizen.org/appcontrol/operation/tct/launch",
            appControl: {
                uri: "http://www.tizen.org",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        }
    },
    _installedAppList = {
        "http://tizen.org/dialer": {
            id: "http://tizen.org/dialer",
            name: "Tizen dialer",
            iconPath: "002.png",
            version: "2.1",
            show: true,
            categories: ["dialer"],
            installDate: new Date(),
            size: 2048,
            packageId: "SAMPLE_ID",
            sharedURI: "/usr/local/share/dialer",
            operation: "http://tizen.org/appcontrol/operation/call",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/call",
                mime: "application/xml",
                category: "dialer",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "http://tizen.org/sender": {
            id: "http://tizen.org/sender",
            name: "Tizen sender",
            iconPath: "005.png",
            version: "2.2",
            show: true,
            categories: ["message"],
            installDate: new Date(),
            size: 2048,
            packageId: "SAMPLE_ID",
            sharedURI: "/usr/local/share/sender",
            operation: "http://tizen.org/appcontrol/operation/send_text",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/send_text",
                mime: "text/plain",
                category: "message",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "api1pack00.WebAPITizenPackageTests": {
            id: "api1pack00.WebAPITizenPackageTests",
            name: "Tizen test app",
            iconPath: "001.png",
            version: "2.2",
            show: true,
            categories: ["message"],
            installDate: new Date(),
            size: 2048,
            packageId: "api1pack00",
            sharedURI: "/usr/local/share/apiuri",
            operation: "http://tizen.org/appcontrol/operation/view",
            appControl: {
                uri: "http://www.tizen.org",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "api1appli1.TCTAppControl": {
            id: "api1appli1.TCTAppControl",
            name: "api1appli1 TCTAppControl",
            iconPath: "001.png",
            version: "2.4",
            show: true,
            categories: ["message"],
            installDate: new Date(),
            size: 2048,
            packageId: "api1pack00",
            sharedURI: "/usr/local/share/apiuri",
            operation: "http://tizen.org/appcontrol/operation/TCTAppControl",
            appControl: {
                uri: "http://www.tizen.org",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "testpack00.autoWebapiTizenPackageTestApplication": {
            id: "testpack00.autoWebapiTizenPackageTestApplication",
            name: "Tizen test app 2",
            iconPath: "002.png",
            version: "3.0",
            show: true,
            categories: ["message"],
            installDate: new Date(),
            size: 2048,
            packageId: "testpack00",
            sharedURI: "/usr/local/share/apiuri2",
            operation: "http://tizen.org/appcontrol/operation/pick",
            appControl: {
                uri: "http://www.tizen.org",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        },
        "testpack01.testLaunch": {
            id: "testpack01.testLaunch",
            name: "Tizen test launch",
            iconPath: "003.png",
            version: "3.0",
            show: true,
            categories: ["message"],
            installDate: new Date(),
            size: 2048,
            packageId: "testpack01",
            sharedURI: "/usr/local/share/apiuri3",
            operation: "http://tizen.org/appcontrol/operation/tct/launch",
            appControl: {
                uri: "http://www.tizen.org",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: ""
        }
    };

function _get() {
    _data = db.retrieveObject(DB_APPLICATION_KEY);
    if (_data === undefined) {
        _data = {
            appList : _apps,
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
        active : false,
        collapsible : true,
        autoHeight : false
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
        _appInstalledTemplate = jQuery("#application-installed-template").html();
        _get();
        _save();
        _loadInstalledAppList();
    }
};
