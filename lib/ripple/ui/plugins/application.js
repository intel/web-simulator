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
    _data = {
        DB_APPLICATION_KEY : "tizen1-db-application",
        programs : []
    },
    _cleanInputs;

function _get() {
    _data.programs = db.retrieveObject(_data.DB_APPLICATION_KEY) || [];
}

function _save() {
    db.saveObject(_data.DB_APPLICATION_KEY, _data.programs);
}

function _loadPrograms() {
    var installed = document.getElementById("application-installed"), node, i;
    installed.innerHTML = "";
    for (i in _data.programs) {
        node = utils.createElement("option", {
            "innerText": _data.programs[i].appInfo.name,
            "value": _data.programs[i].appId
        });
        installed.appendChild(node);
    }
    _cleanInputs();
}

function _displayInfo(text) {
    var html = "<b>" + text + "</b>";
    document.getElementById("application-error").innerHTML = html;
}

function _programChanged(status, param) {
    event.trigger("programChanged", [status, param]);
}

function _cleanInputs() {
    document.getElementById("application-operation").value = "";
    document.getElementById("application-uri").value = "";
    document.getElementById("application-mime").value = "";
    document.getElementById("application-id").value = "";
    document.getElementById("application-name").value = "";
    document.getElementById("application-iconPath").value = "";
    document.getElementById("application-version").value = "";
    document.getElementsByName("application-show")[0].checked = false;
    document.getElementsByName("application-show")[1].checked = false;
}

function _install() {
    var operation, uri, mime, id, name, iconPath, version, show, i, app;

    operation = document.getElementById("application-operation").value;
    uri       = document.getElementById("application-uri").value;
    mime      = document.getElementById("application-mime").value;
    id        = document.getElementById("application-id").value;
    name      = document.getElementById("application-name").value;
    iconPath  = document.getElementById("application-iconPath").value;
    version   = document.getElementById("application-version").value;
    show      = document.getElementsByName("application-show")[0].checked;

    if (_data.programs.length !== 0) {
        for (i in _data.programs) {
            if (id === _data.programs[i].appId) {
                return;
            }
        }
    }
    app = {
        appId : id,
        appInfo : {id : id, name : name, iconPath : iconPath, version : version, show : show},
        appServices : [{operation : operation, uri : uri, mime : mime}]
    };
    _data.programs.push(app);
    _save();
    _programChanged("installed", app.appInfo);
    _loadPrograms();
}

function _update() {
    var i, id, name, version, show, iconPath, operation, uri, mime, length;

    length   = _data.programs.length;
    id       = document.getElementById("application-id").value;
    name     = document.getElementById("application-name").value;
    iconPath = document.getElementById("application-iconPath").value;
    version  = document.getElementById("application-version").value;
    show     = document.getElementsByName("application-show")[0].checked;
    operation = document.getElementById("application-operation").value;
    uri       = document.getElementById("application-uri").value;
    mime      = document.getElementById("application-mime").value;

    if (length === 0)
        return;

    for (i in _data.programs) {
        if (_data.programs[i].appId === id) {
            _data.programs[i].appInfo = {id : id, name : name, iconPath : iconPath, version : version, show : show};
            _data.programs[i].appServices = [{operation : operation, uri : uri, mime : mime}];
            _save();
            _programChanged("updated", _data.programs[i].appInfo);
            _loadPrograms();
            break;
        }
    }
}

function _uninstall() {
    var i, id = null;
    id = document.getElementById("application-id").value;
    if (id) {
        for (i in _data.programs) {
            if (_data.programs[i].appId === id) {
                _data.programs.splice(i, 1);
                _save();
                _programChanged("uninstalled", id);
                _loadPrograms();
            }
        }
    }
}

function _showAppDetail(id) {
    var i;
    for (i in _data.programs) {
        if (id === _data.programs[i].appId) {
            jQuery("#application-id").val(_data.programs[i].appInfo.id);
            jQuery("#application-name").val(_data.programs[i].appInfo.name);
            jQuery("#application-iconPath").val(_data.programs[i].appInfo.iconPath);
            jQuery("#application-version").val(_data.programs[i].appInfo.version);
            if (_data.programs[i].appInfo.show) {
                document.getElementsByName("application-show")[0].checked = true;
                document.getElementsByName("application-show")[1].checked = false;
            } else {
                document.getElementsByName("application-show")[0].checked = false;
                document.getElementsByName("application-show")[1].checked = true;
            }
            jQuery("#application-operation").val(_data.programs[i].appServices[0].operation);
            jQuery("#application-uri").val(_data.programs[i].appServices[0].uri);
            jQuery("#application-mime").val(_data.programs[i].appServices[0].mime);
        }
    }
}

function _changeAppData() {
    var id = jQuery("#application-installed").val();
    _showAppDetail(id);
}

event.on("appServiceReplied", function (data) {
    _displayInfo("The application has been launched successfully");
});

event.on("appsInit", function (data) {
    data.applications = _data.programs;
});

module.exports = {
    panel: {
        domId: "application-container",
        collapsed: true,
        pane: "left",
        titleName: "Program Manager",
        display: true
    },
    initialize: function () {
        _get();
        _loadPrograms();

        document.getElementById("application-install").addEventListener("click", _install, false);
        document.getElementById("application-update").addEventListener("click", _update, false);
        document.getElementById("application-uninstall").addEventListener("click", _uninstall, false);
        jQuery("#application-installed").bind("focus", function () {
            _changeAppData();
        });
        jQuery("#application-installed").bind("change", function () {
            _changeAppData();
        });
    }
};
