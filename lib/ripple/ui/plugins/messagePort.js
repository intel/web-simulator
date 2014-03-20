/*
 *  Copyright 2014 Intel Corporation.
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
    exception = require('ripple/exception'),
    dbinit = require('ripple/platform/tizen/2.0/dbinit'),
    _messagePortGlobal = {
        localMessagePorts: {}
    },
    _db = null;

function _initMessagePortDatabase() {
    _db = dbinit.MessagePort;

    db.saveObject("tizen-messageport", _db);
}

function _initializeMessagePortPanel() {
    var stop = false;

    _makeRemoteApplicationsHtml();
    _sendingRemoteMessage();

    try {
        jQuery("#messagePort-remote-applications h3").click(function (event) {
            if (stop) {
                event.stopImmediatePropagation();
                event.preventDefault();
                stop = true;
            }
        });
        jQuery("#messagePort-remote-applications").accordion("destroy").accordion({
            header: "> div > h3",
            active: false,
            collapsible: true,
            autoHeight: false
        });
    } catch (e) {
        exception.handle(e, true);
    }
}

function _addLocalMessagePortOptions(messagePortName) {
    var htmlTemplate = '<option value="#messagePortName">#messagePortName</option>',
        option = '', appId, portSelector = [], sendSelector = [];

    for (appId in _db) {
        portSelector.push("#" + appId + "-local-port");
        sendSelector.push("#" + appId + "-send");
    }

    option += htmlTemplate.replace(/#messagePortName/g, messagePortName);

    jQuery(portSelector.join(",")).append(option);
    jQuery(portSelector.join(",")).removeAttr("disabled");
    jQuery(sendSelector.join(",")).removeAttr("disabled");
}

function _makeRemoteApplicationsHtml() {
    var htmlTemplate = jQuery("#messagePort-remote-template").html(),
        portHtmlTemplate = '<h3><span style="font-weight: bold;">#isTrustedIcon</span>&nbsp;#messagePortName</h3>' +
            '<div class="#portContainterAddr" style="border: 1px solid #DCDCDC; height: 10em; overflow: auto; border-radius: 8px;"></div>',
        optionTemplate = '<input id="#RemoteApplicationId-isTrusted" type="checkbox" value="true" #CHECKED disabled>' +
            '<label for="#RemoteApplicationId-isTrusted">Same as current application</label>',
        appId, appName, portName, abbr, isTrusted, html = '', portHtml, tabSelectors = [], certificate, option;

    for (appId in _db) {
        appName = _db[appId].name;
        certificate= _db[appId].certificate;

        portHtml = '';
        for (portName in _db[appId].ports) {
            isTrusted = _db[appId].ports[portName];
            abbr = portName.replace(/\s+/g, "");

            portHtml += portHtmlTemplate.replace(/#messagePortName/g, portName)
                .replace(/#RemoteApplicationId/g, appId)
                .replace(/#isTrustedIcon/g, isTrusted ? "&#9417;" : "&#9711;")
                .replace(/#portContainterAddr/g, abbr);
        }

        tabSelectors.push("#" + appId + "-operations");

        option = optionTemplate.replace(/#RemoteApplicationId/g, appId)
            .replace(/#CHECKED/g, certificate ? "checked" : "");

        html += htmlTemplate.replace(/#RemoteApplicationId/g, appId)
            .replace(/#RemoteApplicationName/g, appName)
            .replace(/#RemoteApplicationPortHtml/g, portHtml)
            .replace(/#RemoteApplicationIsTrusted/g, option)
            .replace(/#80AC27/g, !certificate ? "#FF4500" : "#80AC27");
    }

    jQuery("#messagePort-remote-applications").html(html);

    jQuery(tabSelectors.join(",")).tabs();
}

function _sendingRemoteMessage() {
    var appId, sendSelector = [], clearSelector = [];

    for (appId in _db) {
        sendSelector.push("#" + appId + "-send");
        clearSelector.push("#" + appId + "-clear");
    }

    jQuery(sendSelector.join(",")).bind("click", function () {
        var appId = this.id.replace("-send", ""),
            key = jQuery("#" + appId + "-key").val(),
            value = jQuery("#" + appId + "-value").val(),
            data, remotePort, errorHtml,
            messagePortName = jQuery("#" + appId + "-local-port").val(),
            certificate = _db[appId].certificate;

        data = [{
            key: key,
            value: value
        }];
        remotePort = {
            appId: appId,
            messagePortName: messagePortName,
            isTrusted: false
        };
        jQuery("#" + appId + "-key").val("");
        jQuery("#" + appId + "-value").val("");

        if (!certificate && _messagePortGlobal.localMessagePorts[messagePortName]) {
            errorHtml = 'Access Denied: "' + messagePortName + '" is a trusted port ' +
                'and the target application is signed with the different certification ' +
                'from this application.';
            jQuery("#" + appId + "-access").html(errorHtml);
            jQuery("#" + appId + "-access").show();
            window.setTimeout(function () {
                jQuery("#" + appId + "-access").hide();
            }, 5000);
            return;
        }

        event.trigger("LocalMessagePortReceived", [data, remotePort, false]);
    });

    jQuery(clearSelector.join(",")).bind("click", function () {
        var appId = this.id.replace("-clear", "");

        jQuery("#" + appId + "-key").val("");
        jQuery("#" + appId + "-value").val("");
    });
}

function _showRequestMessagePort(id, messagePortName, isTrusted, isRemote, appId) {
    var htmlTemplate, port, html, remoteKey;

    htmlTemplate = '<h3><span style="font-weight: bold;">#isTrustedIcon</span>&nbsp;#messagePortName</h3>';

    if (isRemote) {
        remoteKey = messagePortName + "&nbsp;(=>" + appId + ")";
        html = htmlTemplate.replace("#messagePortName", remoteKey)
            .replace("#isTrustedIcon", isTrusted ? "&#9417;" : "&#9711;");
    } else {
        remoteKey = messagePortName;
        html = htmlTemplate.replace("#messagePortName", remoteKey)
            .replace("#isTrustedIcon", isTrusted ? "&#9417;" : "&#9711;");
    }

    if (port === undefined) {
        jQuery(id).append(html);

        if (!isRemote) {
            _addLocalMessagePortOptions(remoteKey);
        }
    }
}

/**
 * receive sending message from current application and show content
 * @param remoteMessagePort
 * @param data
 * @param localMessagePort
 * @private
 */
function _receiveMessage(remoteMessagePort, data, localMessagePort) {
    var htmlTemplate, header, footer, html = '', i, appId, messagePortName, selector,
        remotePort;

    appId = remoteMessagePort.appId;
    messagePortName = remoteMessagePort.messagePortName;

    selector = "#" + appId + "-receiving ." + messagePortName.replace(/\s+/g, "");

    header = '<table class="preferences-table" style="border-bottom: 1px dashed #DCDCDC; width: 100%;">';
    htmlTemplate = '<tr><td><label class="ui-text-label">Key:</label></td><td>#Key</td></tr>' +
        '<tr><td><label class="ui-text-label">Value:</label></td><td>#Value</td></tr>';
    footer = '</table>';

    for (i = 0; i < data.length; i++) {
        html += header +
            htmlTemplate.replace("#Key", data[i].key).replace("#Value", data[i].value) +
            footer;
    }

    jQuery(selector).html(html);

    if (!localMessagePort) return;

    remotePort = {
        appId: appId,
        messagePortName: localMessagePort.messagePortName,
        isTrusted: localMessagePort.isTrusted
    };

    event.trigger("LocalMessagePortReceived", [_db[appId]["reply"], remotePort, true]);
}

//show requested local message port
event.on("LocalMessagePortAdded", function (messagePortName, isTrusted) {
    _showRequestMessagePort("#current-app-local-port", messagePortName, isTrusted, false);
});

//show requested remote message port
event.on("RemoteMessagePortAdded", function (appId, messagePortName, isTrusted) {
    _showRequestMessagePort("#current-app-remote-port", messagePortName, isTrusted, true, appId);
});

//show sending message content
event.on("RemoteMessagePortSent", function (remoteMessagePort, data, localMessagePort) {
    _receiveMessage(remoteMessagePort, data, localMessagePort);
});

module.exports = {
    panel: {
        domId: "messagePort-container",
        collapsed: true,
        pane: "left",
        titleName: "Message Port",
        display: true
    },
    initialize: function () {
        _initMessagePortDatabase();
        _initializeMessagePortPanel();
    }
};
