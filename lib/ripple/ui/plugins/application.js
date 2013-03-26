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
        programs : {}
    },
    _cleanInputs,
    _apps;

function _get() {
    _apps = {
        "http://tizen.org/viewer": {
            id: "http://tizen.org/viewer",
            name: "Tizen viewer",
            iconPath: "001.png",
            version: "1.9",
            show: true,
            categories: [],
            installDate: new Date(),
            size: 5120,
            operation: "http://tizen.org/appcontrol/operation/view",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/view",
                mime: "image/*",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: []
        },
        "http://tizen.org/player": {
            id: "http://tizen.org/player",
            name: "Tizen player",
            iconPath: "002.png",
            version: "2.0",
            show: true,
            categories: [],
            installDate: new Date(),
            size: 2048,
            operation: "http://tizen.org/appcontrol/operation/play",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/play",
                mime: "video/*",
                category: "",
                data: ""
            },
            type: "AUTHOR_SIGNER",
            value: []
        },
        "http://tizen.org/dialer": {
            id: "http://tizen.org/dialer",
            name: "Tizen dialer",
            iconPath: "002.png",
            version: "2.1",
            show: true,
            categories: [],
            installDate: new Date(),
            size: 2048,
            operation: "http://tizen.org/appcontrol/operation/dial",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/dial",
                mime: "application/xml",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: []
        },
        "http://tizen.org/sender": {
            id: "http://tizen.org/sender",
            name: "Tizen sender",
            iconPath: "005.png",
            version: "2.2",
            show: true,
            categories: [],
            installDate: new Date(),
            size: 2048,
            operation: "http://tizen.org/appcontrol/operation/send_text",
            appControl: {
                uri: "http://tizen.org/appcontrol/uri/send_text",
                mime: "text/plain",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: []
        }
    };
    _data.programs = db.retrieveObject(_data.DB_APPLICATION_KEY) || _apps;
    _save();
}

function _save() {
    db.saveObject(_data.DB_APPLICATION_KEY, _data.programs);
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

function _loadPrograms() {
    var installed = document.getElementById("application-installed"), node;
    installed.innerHTML = "";

    utils.forEach(_data.programs, function (program) {
        node = utils.createElement("option", {
            "innerText": program.name,
            "value": program.id
        });
        installed.appendChild(node);
    });
    _cleanInputs();
}

function _displayInfo(text) {
    var html = "<b>" + text + "</b>";
    document.getElementById("application-error").innerHTML = html;
}

function _programChanged(status, id) {
    event.trigger("ApplicationLoad", []);
    event.trigger("programChanged", [status, id]);
}

function _install() {
    var operation, uri, mime, id, name, iconPath, version, show; 

    operation = document.getElementById("application-operation").value;
    uri       = document.getElementById("application-uri").value;
    mime      = document.getElementById("application-mime").value;
    id        = document.getElementById("application-id").value;
    name      = document.getElementById("application-name").value;
    iconPath  = document.getElementById("application-iconPath").value;
    version   = document.getElementById("application-version").value;
    show      = document.getElementsByName("application-show")[0].checked;

    if (_data.programs[id]) {
        return;
    }
    _data.programs[id] = {
        id: id,
        name: name,
        iconPath: iconPath,
        version: version,
        show: show,
        categories: [],
        installDate: new Date(),
        size: 2048,
        operation: operation,
        appControl: {
            uri: uri,
            mime: mime,
            category: "",
            data: ""
        },
        type: "AUTHOR_SIGNER",
        value: []
    };
    _save();
    _programChanged("installed", id);
    _loadPrograms();
}

function _update() {
    var id, name, version, show, iconPath, operation, uri, mime;

    id       = document.getElementById("application-id").value;
    name     = document.getElementById("application-name").value;
    iconPath = document.getElementById("application-iconPath").value;
    version  = document.getElementById("application-version").value;
    show     = document.getElementsByName("application-show")[0].checked;
    operation = document.getElementById("application-operation").value;
    uri       = document.getElementById("application-uri").value;
    mime      = document.getElementById("application-mime").value;

    if (!_data.programs[id]) {
        return;
    }
    _data.programs[id] = {
        id: id,
        name: name,
        iconPath: iconPath,
        version: version,
        show: show,
        categories: [],
        installDate: new Date(),
        size: 2048,
        operation: operation,
        appControl: {
            uri: uri,
            mime: mime,
            category: "",
            data: ""
        },
        type: "AUTHOR_SIGNER",
        value: []
    };
    _save();
    _programChanged("updated", id);
    _loadPrograms();
}

function _uninstall() {
    var id = null;
    id = document.getElementById("application-id").value;
    if (id) {
        if (_data.programs[id]) {
            delete _data.programs[id];
            _save();
            _programChanged("uninstalled", id);
            _loadPrograms();
        }
    }
}

function _showAppDetail(id) {
    var program;
    program = _data.programs[id];
    jQuery("#application-id").val(program.id);
    jQuery("#application-name").val(program.name);
    jQuery("#application-iconPath").val(program.iconPath);
    jQuery("#application-version").val(program.version);
    if (program.show) {
        document.getElementsByName("application-show")[0].checked = true;
        document.getElementsByName("application-show")[1].checked = false;
    } else {
        document.getElementsByName("application-show")[0].checked = false;
        document.getElementsByName("application-show")[1].checked = true;
    }
    jQuery("#application-operation").val(program.operation);
    jQuery("#application-uri").val(program.appControl.uri);
    jQuery("#application-mime").val(program.appControl.mime);
}

function _changeAppData() {
    var id = jQuery("#application-installed").val();
    _showAppDetail(id);
}

event.on("appServiceReplied", function () {
    _displayInfo("The application has been launched successfully");
});

module.exports = {
    initialize: function () {
        _get();
        _loadPrograms();
        jQuery("#application-install").unbind("click").bind("click", _install);
        jQuery("#application-update").unbind("click").bind("click", _update);
        jQuery("#application-uninstall").unbind("click").bind("click", _uninstall);
        jQuery("#application-installed").unbind("click").bind("focus", _changeAppData);
        jQuery("#application-installed").unbind("click").bind("change", _changeAppData);
    }
};
