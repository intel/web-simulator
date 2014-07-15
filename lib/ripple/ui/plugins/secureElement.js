/*
 *  Copyright 2014 Intel Corporation
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
    _data = {
        DB_SECUREELEMENT_KEY: "tizen-secureelement",
        DEFAULT: [{
            name: "UICC and SIM",
            isPresent: true
        }, {
            name: "Secure SD Card",
            isPresent: true
        }],
        dbStorage: null
    };

function _initializeDB() {
    _data.dbStorage = db.retrieveObject(_data.DB_SECUREELEMENT_KEY) || [];

    if (!_data.dbStorage || _data.dbStorage.length === 0) {
        _data.dbStorage = _data.DEFAULT;
        db.saveObject(_data.DB_SECUREELEMENT_KEY, _data.dbStorage);
    }
}

function _getName(prefix) {
    var name = {
        us: "UICC and SIM",
        sc: "Secure SD Card"
    };

    return name[prefix];
}

function _getPrefix(name) {
    var prefix = {
        "UICC and SIM": "us",
        "Secure SD Card": "sc"
    };

    return prefix[name];
}

function _initializeElements(reader) {
    var name = reader.name,
        prop = reader.isPresent,
        prefix = _getPrefix(name),
        containerId = prefix + "-radio",
        container = $("#" + containerId),
        radioInsert = $("#" + containerId + "1"),
        radioLabelInsert = $("#" + containerId + "1-label"),
        radioEject = $("#" + containerId + "2"),
        radioLabelEject = $("#" + containerId + "2-label");

    container.buttonset();

    radioInsert.prop('checked', prop);
    radioLabelInsert.css({'color': prop ? '#000000' : '#bbbbbb'});
    radioInsert.button("refresh");

    radioEject.prop('checked', !prop);
    radioLabelEject.css({'color': !prop ? '#000000' : '#bbbbbb'});
    radioEject.button("refresh");

    _addElementsListeners(radioInsert, radioEject);
}

function _addElementsListeners(radioInsert, radioEject) {
    radioInsert.click(function () {
        var prefix = /^us-/.test(this.id) ? "us" : "sc",
            name = _getName(prefix),
            containerId = prefix + "-radio",
            radioLabelInsert = $("#" + containerId + "1-label"),
            radioLabelEject = $("#" + containerId + "2-label");

        radioLabelInsert.css({'color': '#000000'});
        radioLabelEject.css({'color': '#bbbbbb'});

        event.trigger("ReaderChanged", [name, true]);
    });

    radioEject.click(function () {
        var prefix = /^us-/.test(this.id) ? "us" : "sc",
            name = _getName(prefix),
            containerId = prefix + "-radio",
            radioLabelInsert = $("#" + containerId + "1-label"),
            radioLabelEject = $("#" + containerId + "2-label");

        radioLabelInsert.css({'color': '#bbbbbb'});
        radioLabelEject.css({'color': '#222222'});

        event.trigger("ReaderChanged", [name, false]);
    });
}

module.exports = {
    panel: {
        domId: "secureElement-container",
        collapsed: true,
        pane: "left",
        titleName: "Secure Element",
        display: true
    },
    initialize: function () {
        var i;

        _initializeDB();

        for (i = 0; _data.dbStorage && i < _data.dbStorage.length; i++) {
            _initializeElements(_data.dbStorage[i]);
        }

        event.on("ReadersClosed", function () {
            var i, reader, prefix, containerId, radioLabelInsert, radioLabelEject,
                radioInsert, radioEject;

            for (i = 0; _data.dbStorage && i < _data.dbStorage.length; i++) {
                reader = _data.dbStorage[i];

                reader.isPresent = false;

                prefix = _getPrefix(reader.name);
                containerId = prefix + "-radio";
                radioLabelInsert = $("#" + containerId + "1-label");
                radioLabelEject = $("#" + containerId + "2-label");
                radioInsert = $("#" + containerId + "1");
                radioEject = $("#" + containerId + "2");

                radioInsert.prop('checked', false);
                radioLabelInsert.css({'color': '#bbbbbb'});
                radioInsert.button("refresh");

                radioEject.prop('checked', true);
                radioLabelEject.css({'color': '#000000'});
                radioEject.button("refresh");
            }
        });
    }
};
