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
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    LocalMessagePort,
    RemoteMessagePort,
    MessagePortInternal,
    _data = {
        messagePorts: {},
        nListener: 0
    },
    _self;

function _get() {
    return db.retrieveObject("tizen-messageport");
}

function _registerApplication(appId, certificate) {
    if (_data.messagePorts[appId])
        return;

    _data.messagePorts[appId] = {
        local: {},
        remote: {},
        certificate: certificate
    };
}

function _initialize() {
    var appId, app, port, database = _get();

    for (appId in database) {
        app = database[appId];

        _registerApplication(appId, app.certificate);

        for (port in app.ports) {
            _setMessagePort(appId, port, app.ports[port], false);
            _data.messagePorts[appId].local[port].listeners
                    [++_data.nListener] = _remoteListener(appId, port);
        }
    }

    event.on("LocalMessagePortReceived", function (data, remotePort) {
        var currentAppId = _getCurrentAppId(), appId, messagePortName, isTrusted;

        appId = remotePort.appId;
        messagePortName = remotePort.messagePortName;
        isTrusted = remotePort.isTrusted;

        if (!_getMessagePort(appId, messagePortName, true)) {
            if (!_data.messagePorts[appId].remote[currentAppId]) {
                _data.messagePorts[appId].remote[currentAppId] = {};
            }
            _data.messagePorts[appId].remote[currentAppId][messagePortName] =
                    new MessagePortInternal(currentAppId, appId, messagePortName,
                    true, isTrusted);
        }

        remotePort.appId = currentAppId;
        _dispatchMessage(appId, remotePort, data, null);
    });
}

function _getCurrentAppId() {
    return tizen.application.getCurrentApplication().appInfo.id;
}

function _remoteListener(appId, port) {
    var remotePort = {
        appId: appId,
        messagePortName: port
    };

    return function (data, localMessagePort) {
        event.trigger("RemoteMessagePortSent", [remotePort, data,
                localMessagePort]);
    };
}

function _setMessagePort(appId, messagePortName, isTrusted, isRemote) {
    var messagePort, ports, currentAppId = "";

    if (!isRemote) {
        messagePort = new MessagePortInternal(currentAppId, appId,
                messagePortName, isRemote, isTrusted);
        ports = _data.messagePorts[appId].local;
    } else {
        currentAppId = _getCurrentAppId();
        messagePort = new MessagePortInternal(currentAppId, appId,
            messagePortName, isRemote, isTrusted);

        if (!_data.messagePorts[currentAppId].remote[appId]) {
            _data.messagePorts[currentAppId].remote[appId] = {};
        }
        ports = _data.messagePorts[currentAppId].remote[appId];
    }

    ports[messagePortName] = messagePort;

    return messagePort.external;
}

function _getMessagePort(appId, messagePortName, isRemote) {
    var messagePort, currentAppId = _getCurrentAppId(),
        app = _data.messagePorts[currentAppId];

    messagePort = !isRemote ? app.local[messagePortName] :
            (app.remote[appId] ? app.remote[appId][messagePortName] : null);

    return !messagePort ? null : messagePort.external;
}

function _dispatchMessage(selfId, dest, data, repliedMessagePort) {
    var app, watchId, listener, localPort, messagePort = null,
        messagePortName = dest.messagePortName,
        appId = dest.appId,
        repliedName;

    app = _data.messagePorts[appId];
    localPort = app.local[messagePortName];

    if (repliedMessagePort) {
        repliedName = repliedMessagePort.messagePortName;
        if (_data.messagePorts[appId].remote[selfId] &&
                _data.messagePorts[appId].remote[selfId][repliedName]) {
            messagePort = _data.messagePorts[appId].remote[selfId]
                    [repliedName].external;
        }
    }

    for (watchId in localPort.listeners) {
        listener = localPort.listeners[watchId];
        listener(data, messagePort);
    }
}

_self = {
    requestLocalMessagePort: function (localMessagePortName) {
        var currentAppId, localMessagePort;

        t.MessagePortManager("requestLocalMessagePort", arguments);

        currentAppId = _getCurrentAppId();
        _registerApplication(currentAppId, true);

        localMessagePort = _getMessagePort(currentAppId,
                localMessagePortName, false);

        if (localMessagePort) {
            if (localMessagePort.isTrusted) {
                throw new WebAPIException(errorcode.UNKNOWN_ERR);
            }
        } else {
            localMessagePort = _setMessagePort(currentAppId,
                    localMessagePortName, false, false);

            event.trigger("LocalMessagePortAdded", [localMessagePortName,
                    false]);
        }

        return localMessagePort;
    },

    requestTrustedLocalMessagePort: function (localMessagePortName) {
        var currentAppId, localMessagePort;

        t.MessagePortManager("requestTrustedLocalMessagePort", arguments);

        currentAppId = _getCurrentAppId();
        _registerApplication(currentAppId, true);

        localMessagePort = _getMessagePort(currentAppId,
                localMessagePortName, false);

        if (localMessagePort) {
            if (!localMessagePort.isTrusted) {
                throw new WebAPIException(errorcode.UNKNOWN_ERR);
            }
        } else {
            localMessagePort = _setMessagePort(currentAppId,
                    localMessagePortName, true, false);

            event.trigger("LocalMessagePortAdded", [localMessagePortName,
                    true]);
        }

        return localMessagePort;
    },

    requestRemoteMessagePort: function (appId, remoteMessagePortName) {
        var remoteMessagePort, app, currentAppId;

        t.MessagePortManager("requestRemoteMessagePort", arguments);

        currentAppId = _getCurrentAppId();
        _registerApplication(currentAppId, true);

        app = _data.messagePorts[appId];

        if (!app || !app.local[remoteMessagePortName]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        if (app.local[remoteMessagePortName].isTrusted) {
            throw new WebAPIException(errorcode.INVALID_ACCESS_ERR);
        }

        remoteMessagePort = _getMessagePort(appId,
                remoteMessagePortName, true);

        if (remoteMessagePort) {
            if (remoteMessagePort.isTrusted) {
                throw new WebAPIException(errorcode.UNKNOWN_ERR);
            }
        } else {
            remoteMessagePort = _setMessagePort(appId,
                    remoteMessagePortName, false, true);

            event.trigger("RemoteMessagePortAdded", [appId,
                    remoteMessagePortName, false]);
        }

        return remoteMessagePort;
    },

    requestTrustedRemoteMessagePort: function (appId, remoteMessagePortName) {
        var remoteMessagePort, app, currentAppId;

        t.MessagePortManager("requestTrustedRemoteMessagePort", arguments);

        currentAppId = _getCurrentAppId();
        _registerApplication(currentAppId, true);

        app = _data.messagePorts[appId];

        if (!app) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        if (!app.certificate) {
            throw new WebAPIException(errorcode.INVALID_ACCESS_ERR);
        }
        if (!app.local[remoteMessagePortName]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        if (!app.local[remoteMessagePortName].isTrusted) {
            throw new WebAPIException(errorcode.INVALID_ACCESS_ERR);
        }

        remoteMessagePort = _getMessagePort(appId,
                remoteMessagePortName, true);

        if (remoteMessagePort) {
            if (!remoteMessagePort.isTrusted) {
                throw new WebAPIException(errorcode.UNKNOWN_ERR);
            }
        } else {
            remoteMessagePort = _setMessagePort(appId,
                    remoteMessagePortName, true, true);

            event.trigger("RemoteMessagePortAdded", [appId,
                    remoteMessagePortName, true]);
        }

        return remoteMessagePort;
    }
};

LocalMessagePort = function (messagePortName, isTrusted, listeners) {
    var messagePort = {};

    messagePort.messagePortName = messagePortName || "";
    messagePort.isTrusted = isTrusted || false;

    this.__defineGetter__("messagePortName", function () {
        return messagePort.messagePortName;
    });

    this.__defineGetter__("isTrusted", function () {
        return messagePort.isTrusted;
    });

    this.addMessagePortListener = function (listener) {
        var watchId;

        t.LocalMessagePort("addMessagePortListener", arguments);

        watchId = ++_data.nListener;
        listeners[watchId] = listener;

        return watchId;
    };

    this.removeMessagePortListener = function (watchId) {
        t.LocalMessagePort("removeMessagePortListener", arguments);

        if (!listeners[watchId]) {
            // throw new WebAPIException(errorcode.NOT_FOUND_ERR);
            return;
        }

        delete listeners[watchId];
    };
};

RemoteMessagePort = function (selfId, appId, messagePortName, isTrusted) {
    var messagePort = {};

    messagePort.appId = appId || "";
    messagePort.messagePortName = messagePortName || "";
    messagePort.isTrusted = isTrusted || false;

    this.__defineGetter__("appId", function () {
        return messagePort.appId;
    });

    this.__defineGetter__("messagePortName", function () {
        return messagePort.messagePortName;
    });

    this.__defineGetter__("isTrusted", function () {
        return messagePort.isTrusted;
    });

    this.sendMessage = function (data, localMessagePort) {
        t.RemoteMessagePort("sendMessage", arguments);

        _dispatchMessage(selfId, messagePort, data, localMessagePort);
    };
};

MessagePortInternal = function (selfId, appId, messagePortName, isRemote,
        isTrusted) {
    this.isTrusted = isTrusted;

    if (isRemote) {
        this.external = new RemoteMessagePort(selfId, appId, messagePortName,
                isTrusted);
    } else {
        this.listeners = {};
        this.external = new LocalMessagePort(messagePortName, isTrusted,
                this.listeners);
    }
};

_initialize();

module.exports = _self;
