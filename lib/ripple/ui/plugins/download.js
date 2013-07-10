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

var db = require('ripple/db'),
    event = require('ripple/event'),
    utils = require('ripple/utils'),
    _data = {
        DB_DOWNLOAD_KEY : "tizen1-db-download",
        resources : []
    },
    _cleanInputs, intervalId,
    _downloads;

function _get() {
    _downloads = [
        {id: "0001", url : "http://tizen.org/small_file.zip", size : "5", speed : "1.0", estimatedTime : "5", MIMEType : "application/zip"},
        {id: "0002", url : "http://tizen.org/big_file.zip", size : "20", speed : "1.0", estimatedTime : "20", MIMEType : "application/zip"},
        {id: "0003", url : "http://download.tizen.org/tct/2_1/webapi-tizen-download-test-image-hq.png", size : "3937596", speed : "1968798", estimatedTime : "2", MIMEType : "image/png"},
        {id: "0004", url : "http://download.tizen.org/tct/2_1/webapi-tizen-download-test-image-lq.png", size : "589", speed : "589", estimatedTime : "1", MIMEType : "image/png"}
    ];
    _data.resources = db.retrieveObject(_data.DB_DOWNLOAD_KEY) || _downloads;
    if (db.retrieveObject(_data.DB_DOWNLOAD_KEY) && db.retrieveObject(_data.DB_DOWNLOAD_KEY).length === 0) {
        _data.resources = _downloads;
    } else {
        _data.resources = db.retrieveObject(_data.DB_DOWNLOAD_KEY) || _downloads;
    }
    _save();
}

function _save() {
    db.saveObject(_data.DB_DOWNLOAD_KEY, _data.resources);
    event.trigger('downloadResourceChanged');
}

function checkURL(url) {
    var rg = new RegExp("((^http)|(^https)|(^ftp)):\/\/()+");
    return rg.test(url);
}

function loadResources() {
    var installed = document.getElementById("download-resource"), node, i;
    installed.innerHTML = "";
    for (i in _data.resources) {
        node = utils.createElement("option", {
            "innerText": _data.resources[i].url,
            "value": _data.resources[i].id
        });
        installed.appendChild(node);
    }
    _cleanInputs();
}

function _displayInfo(text) {
    var info = document.getElementById("download-error");
    info.innerHTML = text;
    if (intervalId) {
        clearTimeout(intervalId);
    }
    intervalId = setTimeout(clearDisplayInfo, 5000);
}

function clearDisplayInfo() {
    document.getElementById('download-error').innerHTML = '';
}

function _cleanInputs() {
    document.getElementById("download-url").value = "";
    document.getElementById("download-size").value = "";
    document.getElementById("download-speed").value = "";
    document.getElementById("download-time").innerText = "0";
    document.getElementById("download-MIMEType").value = "";
}

function checkProperties(optionType, url, size, speed, time, MIMEType) {
    var back = true;
    if (url === "" || size === "" ||  speed === "" || time === "" || MIMEType === "") {
        _displayInfo(optionType + " failed, empty input.");
        back = false;
    }
    if (!checkURL(url)) {
        _displayInfo(optionType + " failed, 'URL' is invalid.");
        back = false;
    }
    if (size <= 0 ||  speed <= 0) {
        _displayInfo(optionType + " failed, invalid input.");
        back = false;
    }
    return back;
}

function showUpdateNotification() {
    var url     = document.getElementById("download-url").value,
        size    = document.getElementById("download-size").value,
        speed   = document.getElementById("download-speed").value,
        MIMEType = document.getElementById("download-MIMEType").value,
        isValid = true;
    if (url === "" || size === "" ||  speed === "" || MIMEType === "" || !checkURL(url) || size <= 0 ||  speed <= 0) {
        isValid = false;
    }
    if (isValid) {
        _displayInfo("Resource changed, please Add or Update the content.");
    }
}

function _adding() {
    var id, time, url, size, speed, MIMEType, object, i, isValid;
    url     = document.getElementById("download-url").value;
    size    = document.getElementById("download-size").value;
    speed   = document.getElementById("download-speed").value;
    MIMEType = document.getElementById("download-MIMEType").value;
    time    = size / speed;
    id      = Math.uuid(null, 16);

    isValid = checkProperties("Add", url, size, speed, time, MIMEType);
    if (!isValid)
        return;
    if (_data.resources.length !== 0) {
        for (i in _data.resources) {
            if (url === _data.resources[i].url) {
                _displayInfo("Add failed, the download resource is already available.");
                return;
            }
        }
    }
    document.getElementById("download-time").innerText = Math.round(time * 100) / 100;
    object = {'id': id, 'url': url, 'size': size, 'speed': speed, 'estimatedTime': time, MIMEType: MIMEType};
    _data.resources.push(object);
    _save();
    loadResources();
}

function _update() {
    var id, time, url, size, speed, MIMEType, i, isExist = false, isValid;

    id    = document.getElementById("download-resource").value;
    url   = document.getElementById("download-url").value;
    size  = document.getElementById("download-size").value;
    speed = document.getElementById("download-speed").value;
    MIMEType = document.getElementById("download-MIMEType").value;
    time  = size / speed;

    if (_data.resources.length === 0) {
        _displayInfo("Update failed, there is no download resource now.");
        return;
    }
    isValid = checkProperties("Update", url, size, speed, time, MIMEType);
    if (!isValid)
        return;
    for (i in _data.resources) {
        if (_data.resources[i].url === url) {
            isExist = true;
            _data.resources[i] = {id: id, url : url, size : size, speed : speed, estimatedTime: time, MIMEType: MIMEType};
            loadResources();
            _save();
            break;
        }
    }
    if (!isExist)
        _displayInfo("Update failed, the download resource doesn't exist.");
}

function _delete() {
    var i, id;
    id = document.getElementById("download-resource").value;
    if (id) {
        for (i in _data.resources) {
            if (_data.resources[i].id === id) {
                _data.resources.splice(i, 1);
                _save();
                loadResources();
            }
        }
    }
}

function _showAppDetail(id) {
    var i;
    for (i in _data.resources) {
        if (id === _data.resources[i].id) {
            document.getElementById("download-time").innerText = Math.round(_data.resources[i].estimatedTime * 100) / 100;
            jQuery("#download-url").val(_data.resources[i].url);
            jQuery("#download-size").val(_data.resources[i].size);
            jQuery("#download-speed").val(_data.resources[i].speed);
            jQuery("#download-MIMEType").val(_data.resources[i].MIMEType);
        }
    }
}

function _changeAppData() {
    var id = jQuery("#download-resource").val();
    _showAppDetail(id);
}
function changeValue() {
    var size  = document.getElementById("download-size").value,
        speed = document.getElementById("download-speed").value;
    if (size > 0 && speed > 0) {
        document.getElementById("download-time").innerText = Math.round(size / speed * 100) / 100;
    } else {
        document.getElementById("download-time").innerText  = "";
    }
}
function checkInputValue(input) {
    if (input.value === "" || input.value <= 0) {
        input.style['border-color'] = 'red';
        _displayInfo("Invalided value.");
    } else {
        if (input.style['border-color']) {
            input.style.removeProperty('border-color');
        }
        changeValue();
        //showUpdateNotification();
    }
}
module.exports = {
    panel: {
        domId: "download-container",
        collapsed: true,
        pane: "left",
        titleName: "Download",
        display: true
    },
    initialize: function () {
        _get();
        loadResources();

        document.getElementById("download-add").addEventListener("click", _adding, false);
        document.getElementById("download-update").addEventListener("click", _update, false);
        document.getElementById("download-delete").addEventListener("click", _delete, false);

        jQuery("#download-resource").bind("focus change", function () {
            var url = document.getElementById("download-url"),
                size = document.getElementById("download-size"),
                speed = document.getElementById("download-speed"),
                MIMEType = document.getElementById("download-MIMEType");
            if (url.style['border-color']) {
                url.style.removeProperty('border-color');
            }
            if (MIMEType.style['border-color']) {
                MIMEType.style.removeProperty('border-color');
            }
            if (size.value > 0 && size.style['border-color']) {
                size.style.removeProperty('border-color');
            }
            if (speed.value > 0 && speed.style['border-color']) {
                speed.style.removeProperty('border-color');
            }
            _changeAppData();
        });
        jQuery("#download-speed").bind("blur", function () {
            changeValue();
        });
        jQuery("#download-size").bind("blur", function () {
            changeValue();
        });
        jQuery("#download-speed").bind("change", function () {
            checkInputValue(this);
        });
        jQuery("#download-size").bind("change", function () {
            checkInputValue(this);
        });
        jQuery("#download-speed").bind("change", function () {
            checkInputValue(this);
        });
        jQuery("#download-url").bind("change", function () {
            if (this.style['border-color']) {
                this.style.removeProperty('border-color');
            }
            if (this.value && checkURL(this.value)) {
                //showUpdateNotification();
            } else  {
                _displayInfo("Invalided URL.");
                this.style['border-color'] = 'red';
            }
        });
    }
};
