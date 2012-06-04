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
    db = require('ripple/db'),
    _data = {
        DB_APPLICATION_KEY : "tizen1-db-application",
        programs : []
    };

function _get() {
    _data.programs = db.retrieveObject(_data.DB_APPLICATION_KEY) || [];
}

function _save() {
    db.saveObject(_data.DB_APPLICATION_KEY, _data.programs);
}

function _loadPrograms() {
    var i, installHTML = '<fieldset data-role="controlgroup" data-type="vertical"><legend></legend>';

    if (_data.programs.length !== 0) {
        for (i in _data.programs) {
            installHTML += "<legend><input type='radio' name='installs' value='" + _data.programs[i].appId + "' id='" + i + "'/><label for='" + i + "'>" + _data.programs[i].appInfo.name + "</label></legend>";
        }
    }
    installHTML += "</fieldset>";
    document.getElementById("application-installed").innerHTML = installHTML;
    document.getElementById("application-installed").style.display = "";
}

function _displayInfo(text) {
    var html = "<b>" + text + "</b>";
    document.getElementById("application-error").innerHTML = html;
}

function _programChanged(status, param) {
    event.trigger("programChanged", [status, param]);
}

function _install() {
    var operation, uri, mime, id, name, iconPath, version, show, type, i, j, app, service;

    operation = document.getElementById("application-operation").value;
    uri       = document.getElementById("application-uri").value;
    mime      = document.getElementById("application-mime").value;
    id        = document.getElementById("application-id").value;
    name      = document.getElementById("application-name").value;
    iconPath  = document.getElementById("application-iconPath").value;
    version   = document.getElementById("application-version").value;
    show      = document.getElementsByName("application-show")[0].checked;
    type      = document.getElementById("install-type").value;

    switch (type) {
    case "1":
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
            appServices : []
        };
        _data.programs.push(app);
        _save();
        break;

    case "2":
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
        break;

    case "3":
        service = {operation : operation, uri : uri, mime : mime};
        if (_data.programs.length !== 0) {
            for (i in _data.programs) {
                if (id === _data.programs[i].appId) {
                    if (_data.programs[i].appServices.length !== 0) {
                        for (j in _data.programs[i].appServices) {
                            if (service === _data.programs[i].appServices[j]) {
                                return;
                            }
                        }
                    }

                    _data.programs[i].appServices.push(service);
                    app = _data.programs[i];
                    _save();
                }
            }
        }
        break;

    default:
        break;
    }

    _programChanged("installed", app.appInfo);
    _loadPrograms();
}

function _update() {
    var i, id, name, version, show, iconPath,

    length   = _data.programs.length;
    id       = document.getElementById("application-id").value;
    name     = document.getElementById("application-name").value;
    iconPath = document.getElementById("application-iconPath").value;
    version  = document.getElementById("application-version").value;
    show     = document.getElementsByName("application-show")[0].checked;

    if (length === 0)
        return;

    for (i in _data.programs) {
        if (_data.programs[i].appId === id) {
            _data.programs[i].appInfo = {id : id, name : name, iconPath : iconPath, version : version, show : show};
            _save();
            _programChanged("updated", _data.programs[i].appInfo);
            _loadPrograms();
            break;
        }
    }
}

function _uninstall() {
    var appId, i, uninstall,
        installs = document.getElementsByName("installs");

    if (installs.length !== 0) {
        for (i in installs) {
            if (installs[i].checked) {
                uninstall = i;
                break;
            }
        }
    }
    if (uninstall) {
        appId = _data.programs[uninstall].value;
        _data.programs.splice(uninstall, 1);
        _save();
        _programChanged("uninstalled", appId);
        _loadPrograms();
    }
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
    }
};
