/*
 *  Copyright 2011 Research In Motion Limited.
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
    event = require('ripple/event'),
    PackageInformation = require('ripple/platform/tizen/2.0/PackageInformation'),
    DB_PACKAGE_KEY = "tizen-db-package",
    _data = {
        packageList: {},
        installedList: {}
    },
    _packages = {
        "/opt/usr/media/test.wgt": {id: "TEST_APP_ID", name: "Test Package", iconPath: "test.png", version: "2.1",
            totalSize: 9216, dataSize: 124, author: "Tizen.org", description: "This is testing package",
            appIds: ["http://tizen.org/viewer", "http://tizen.org/player"]},
        "/opt/usr/media/example.wgt": {id: "EXAMPLE_ID", name: "Example Package", iconPath: "example.png", version: "2.3",
            totalSize: 10240, dataSize: 384, author: "Tizen.org", description: "This is example package",
            appIds: ["http://tizen.org/dummy"]},
        "/opt/usr/media/sample.wgt": {id: "SAMPLE_ID", name: "Sample Package", iconPath: "sample.png", version: "1.9",
            totalSize: 8264, dataSize: 50, author: "Tizen.org", description: "This is sample package",
            appIds: ["http://tizen.org/dialer", "http://tizen.org/sender"]}
    },
    _installedList = {
        "SAMPLE_ID": { id: "SAMPLE_ID", name: "Sample Package", iconPath: "sample.png", version: "1.9",
            totalSize: 8264, dataSize: 50, lastModified: new Date(), author: "Tizen.org", description: "This is sample package",
            appIds: ["http://tizen.org/dialer", "http://tizen.org/sender"]
        }
    },
    _packageListTemplate,
    _packageInstalledTemplate;

function _get() {
    _data = db.retrieveObject(DB_PACKAGE_KEY);
    if (_data === undefined) {
        _data = {
            packageList: _packages,
            installedList: _installedList
        };
        _save();
    }
    utils.forEach(_data.installedList, function (item) {
        item.lastModified = new Date(item.lastModified);
    });

}

function _save() {
    db.saveObject(DB_PACKAGE_KEY, _data);
}

function loadPackageList() {
    var nodes = jQuery("#package-list-select");
    nodes.html("");
    utils.forEach(_data.packageList, function (item, index) {
        nodes.append(utils.createElement("option", {
            "value": index,
            "innerText": item.name
        }));
    });
    renderPackageListBox($("#package-list-select option:selected").val());
}

function loadInstalledList() {
    var html = "";
    jQuery("#package-installed-box").empty();
    utils.forEach(_data.installedList, function (item) {
        html += _packageInstalledTemplate.replace(/#Name/g, item.name)
            .replace(/#ID/g, item.id)
            .replace(/#IconPath/, item.iconPath)
            .replace(/#Version/, item.version)
            .replace(/#TotalSize/, item.totalSize)
            .replace(/#DataSize/, item.dataSize)
            .replace(/#LastModified/, item.lastModified)
            .replace(/#Author/, item.author)
            .replace(/#Description/, item.description)
            .replace(/#APPIDs/, item.appIds.join("<br>"));
    });
    $("#package-installed-box").accordion("destroy");
    $("#package-installed-box").html(html).accordion({
        active : false,
        collapsible : true,
        autoHeight : false
    });
    $("." + "package-remove-btn").bind("click", function () {
        var id = this.id;
        utils.forEach(_data.packageList, function (item) {
            if (item.id === id) {
                event.trigger("remove-apps", [item.appIds]);
            }
        });
        delete _data.installedList[this.id];
        _save();
        loadPackageList();
        loadInstalledList();
        event.trigger("uninstall-package", [this.id]);
    });
}

function renderPackageListBox(path) {
    var item, html;
    jQuery("#package-list-box").empty();
    item = _data.packageList[path];
    html = _packageListTemplate.replace(/#Path/, path)
        .replace(/#ID/, item.id)
        .replace(/#Name/, item.name)
        .replace(/#IconPath/, item.iconPath)
        .replace(/#Version/, item.version)
        .replace(/#TotalSize/, item.totalSize)
        .replace(/#DataSize/, item.dataSize)
        .replace(/#Author/, item.author)
        .replace(/#Description/, item.description)
        .replace(/#APPList/, item.appIds.join("<br>"));
    jQuery("#package-list-box").html(html);
    if (_data.installedList[item.id]) {
        jQuery("#package-update-btn").show();
    } else {
        jQuery("#package-install-btn").show();
    }
}

function addPackage(path, type) {
    var item;
    if (!_data.packageList[path]) {
        return;
    }
    item = _data.packageList[path];
    _data.installedList[item.id] = new PackageInformation(
        item.id, item.name, item.iconPath, item.version,
        item.totalSize, item.dataSize, new Date(),
        item.author, item.description, item.appIds
    );
    if (type === "install") {
        event.trigger("install-apps", [item.appIds]);
    } else {
        event.trigger("update-apps", [item.appIds]);
    }
    _save();
}

module.exports = {
    panel: {
        domId: "package-container",
        collapsed: true,
        pane: "left",
        titleName: "Packages and Applications",
        display: true
    },
    initialize: function () {
        _packageListTemplate = jQuery("#package-list-template").html();
        _packageInstalledTemplate = jQuery("#package-installed-template").html();

        _get();
        loadPackageList();
        loadInstalledList();
        jQuery("#package-list-select").bind("focus change", function () {
            var path = $("#package-list-select option:selected").val();
            renderPackageListBox(path);
        });
        jQuery("#package-install-btn").live("click", function () {
            var path = $("#package-list-select option:selected").val();
            addPackage(path, "install");
            _get();
            loadPackageList();
            loadInstalledList();
            event.trigger("install-packge", [path]);
        });
        jQuery("#package-update-btn").live("click", function () {
            var path = $("#package-list-select option:selected").val();
            addPackage(path, "update");
            loadPackageList();
            loadInstalledList();
            event.trigger("update-package", [path]);
        });
        jQuery("#package-select").tabs();
        event.on("installedList-updated", function () {
            _get();
            loadPackageList();
            loadInstalledList();
        });
    }
};
