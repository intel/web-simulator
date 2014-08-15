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

var app = require('ripple/app'),
    event = require('ripple/event'),
    utils = require('ripple/utils'),
    t = require('ripple/platform/wearable/2.0/typecast'),
    errorcode = require('ripple/platform/wearable/2.0/errorcode'),
    WebAPIException = require('ripple/platform/wearable/2.0/WebAPIException'),
    WebAPIError = require('ripple/platform/wearable/2.0/WebAPIError'),
    SAAgent,
    SAAuthenticationToken,
    SAPeerAccessory,
    SAPeerAgent,
    SASocket,
    SAFileTransfer,
    _security = {
        "http://developer.samsung.com/privilege/accessoryprotocol": [
            "requestSAAgent", "setDeviceStatusListener"
        ]
    },
    _data = {
        SA_PEER_AGENT: [{
            peerAccessory: {
                deviceAddress: "78:2b:cb:85:2d:c5",
                deviceName: "Samsung Galaxy S5(U.S. Cellular),",
                productId: "Galaxy S5",
                transportType: "TRANSPORT_USB",
                vendorId: "0x163C"
            },
            appName: "GearSampleProvider",
            maxAllowedDataSize: 1024,
            peerId: "85ed28a031aaf284097edf09ffec3f21",
            profileVersion: "2.0"
        }],
        DEFAULT_RECEIVE_PATH: "/tmp/",
        profiles: null,
        saAgents: [],
        peerAgents: [],
        deviceStatusListener: null,
        saFileTransfer: {},
        agents: null,
        isAttached: "ATTACHED"
    },
    _self;

function _xmlToJson(xml) {
    var obj = {}, i, j, attribute, item, nodeName;

    if (xml.nodeType === 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            for (j = 0; j < xml.attributes.length; j++) {
                attribute = xml.attributes.item(j);
                obj[attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) { // text
        obj = xml.nodeValue.trim();
    }

    // do children
    if (xml.hasChildNodes()) {
        for (i = 0; i < xml.childNodes.length; i++) {
            item = xml.childNodes.item(i);
            nodeName = item.nodeName;

            if (nodeName === "#text")
                continue;

            if (typeof(obj[nodeName]) === "undefined") {
                obj[nodeName] = _xmlToJson(item);
            }
            else {
                if (typeof(obj[nodeName].push) === "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(_xmlToJson(item));
            }
        }
    }

    return obj;
}

function _readServiceProfile() {
    var xmlHttp = new XMLHttpRequest(),
        resourcePath;

    if (!app.getInfo().metadata) {
        return;
    }

    if (app.getInfo().metadata.key === "AccessoryServicesLocation") {
        resourcePath = app.getInfo().metadata.value;
    }
    if (!resourcePath) {
        return;
    }

    xmlHttp.open("GET", utils.appLocation() + resourcePath, false);
    xmlHttp.send();

    if (xmlHttp.responseXML) {
        _data.profiles = _xmlToJson(xmlHttp.responseXML);
    }
}

function _initSAAgent() {
    var application, profiles, i, saAgent;

    if (!_data.profiles || !_data.profiles.resources || 
            !_data.profiles.resources.application) {
        return;
    }
    application = _data.profiles.resources.application;
    profiles = application.serviceProfile;

    if (profiles) {
        _data.agents = {};
        if (profiles instanceof Array) {
            for (i = 0; i < profiles.length; i++) {
                profiles[i].role = profiles[i].role.toUpperCase();
                saAgent = new SAAgent(profiles[i]);

                _data.saAgents.push(saAgent);
                _data.agents[saAgent.id] = saAgent;
            }
        }
        else {
            profiles.role = profiles.role.toUpperCase();
            saAgent = new SAAgent(profiles);
            _data.saAgents.push(saAgent);
            _data.agents[saAgent.id] = saAgent;
        }
    }
}

function _simulatedPeerAgents() {
    var peerAgents = utils.copy(_data.SA_PEER_AGENT),
        peerAgent, peerAccessory,
        i;

    event.trigger("wearablePeerAgentsSimulated-", [_data.SA_PEER_AGENT]);
    for (i = 0; i < peerAgents.length; i++) {
        peerAccessory = new SAPeerAccessory(peerAgents[i].peerAccessory);
        peerAgents[i].peerAccessory = peerAccessory;

        peerAgent = new SAPeerAgent(peerAgents[i]);
        _data.peerAgents.push(peerAgent);
    }
}

function _getRemotePeerAgentToken(peerAgent) {
    return peerAgent.peerId;
}

function _initialize() {
    _readServiceProfile();
    _initSAAgent();
    _simulatedPeerAgents();
}

_self = function () {
    var sa;

    function requestSAAgent(successCallback, errorCallback) {
        if (!_security.requestSAAgent) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAManager("requestSAAgent", arguments);

        window.setTimeout(function () {
            if (!_data.saAgents || _data.saAgents.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.SERVICE_NOT_AVAILABLE_ERR));
                }
                return;
            }

            successCallback(_data.saAgents);
        }, 1);
    }

    function setDeviceStatusListener(callback) {
        if (!_security.setDeviceStatusListener) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAManager("setDeviceStatusListener", arguments);

        _data.deviceStatusListener = callback;
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    sa = {
        requestSAAgent: requestSAAgent,
        setDeviceStatusListener: setDeviceStatusListener,
        handleSubFeatures: handleSubFeatures
    };

    return sa;
};

event.on("wearableDeviceStatusChanged", function (type, status) {
    var agentId, peerId;

    _data.isAttached = status;
    if (_data.deviceStatusListener) {
        _data.deviceStatusListener(type, status);
    }

    for (agentId in _data.agents) {
        for (peerId in _data.agents[agentId].socket) {
            if (_data.agents[agentId].socket[peerId].socketStatus) {
                _data.agents[agentId].socket[peerId].socketStatus(
                        new WebAPIError(errorcode.DEVICE_DETACHED));
            }
        }
        delete _data.agents[agentId].socket;
    }
});

SAAgent = function (attributes) {
    var saAgent = {};

    saAgent.id = attributes.id || "";
    saAgent.name = attributes.name || "";
    saAgent.role = attributes.role || "";
    saAgent.channelIds = attributes.channelIds || [];

    this.__defineGetter__("id", function () {
        return saAgent.id;
    });

    this.__defineGetter__("name", function () {
        return saAgent.name;
    });

    this.__defineGetter__("role", function () {
        return saAgent.role;
    });

    this.__defineGetter__("channelIds", function () {
        return saAgent.channelIds;
    });

    this.requestServiceConnection = function (peerAgent) {
        var agentId = saAgent.id;

        t.SAAgent("requestServiceConnection", arguments);

        if (_data.isAttached === "DETACHED") {
            event.on("wearableServiceConnected", [agentId,
                    peerAgent, "DEVICE_UNREACHABLE"]);
            return;
        }
        event.trigger("wearableServiceRequested", [agentId,
                peerAgent]);
    };

    this.setServiceConnectionListener = function (callback) {
        t.SAAgent("setServiceConnectionListener", arguments);

        _data.agents[saAgent.id].serviceConnection = callback;
    };

    this.authenticatePeerAgent = function (peerAgent, successCallback,
            errorCallback) {
        t.SAAgent("authenticatePeerAgent", arguments);

        window.setTimeout(function () {
            var authToken = _getRemotePeerAgentToken(peerAgent);

            if (!authToken) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.TOKEN_NOT_GENERATED_ERR));
                }
                return;
            }

            successCallback(peerAgent, authToken);
        }, 1);
    };

    this.acceptServiceConnectionRequest = function (peerAgent) {
        t.SAAgent("acceptServiceConnectionRequest", arguments);

        event.trigger("wearableRemoteServiceConnected", [true, peerAgent]);
    };

    this.rejectServiceConnectionRequest = function (peerAgent) {
        t.SAAgent("rejectServiceConnectionRequest", arguments);

        event.trigger("wearableRemoteServiceConnected", [false, peerAgent]);
    };

    this.findPeerAgents = function () {
        var peerAgentFindListener, i;

        t.SAAgent("findPeerAgents", arguments);

        if (!_data.peerAgents)
            return;

        for (i = 0; i < _data.peerAgents.length; i++) {
            peerAgentFindListener = _data.agents[saAgent.id].peerAgentFind;
            if (peerAgentFindListener && 
                    peerAgentFindListener.onpeeragentfound) {
                peerAgentFindListener.onpeeragentfound(_data.peerAgents[i]);
            }
        }
    };

    this.setPeerAgentFindListener = function (callback) {
        t.SAAgent("setPeerAgentFindListener", arguments);

        _data.agents[saAgent.id].peerAgentFind = callback;
    };

    this.getSAFileTransfer = function () {
        t.SAAgent("getSAFileTransfer", arguments);

        return new SAFileTransfer(_data.DEFAULT_RECEIVE_PATH);
    };
};

event.on("wearableServiceConnected", function (agentId, peerAgent, 
        status) {
    var serviceConnectionListener, socket;

    serviceConnectionListener = _data.agents[agentId].serviceConnection;
    if (status !== "OK") {
        if (serviceConnectionListener && serviceConnectionListener.onerror) {
            serviceConnectionListener.onerror(new WebAPIError(
                    errorcode[status]));
        }
        return;
    }

    if (serviceConnectionListener && serviceConnectionListener.onconnect) {
        peerAgent.agentId = agentId;
        socket = new SASocket(peerAgent);

        if (!_data.agents[agentId].socket) {
            _data.agents[agentId].socket = {};
        }
        _data.agents[agentId].socket[peerAgent.peerId] = socket;
        _data.agents[agentId].socket[peerAgent.peerId].isConnect = true;
        serviceConnectionListener.onconnect(socket);
    }
});

event.on("wearableRemoteServiceRequested", function (agentId, peerAgent) {
    var serviceConnectionListener;

    serviceConnectionListener = _data.agents[agentId].serviceConnection;
    if (serviceConnectionListener && serviceConnectionListener.onrequest) {
        serviceConnectionListener.onrequest(peerAgent);
    }
});

SAAuthenticationToken = function (attributes) {
    var saAuthenticationToken = {};

    saAuthenticationToken.authenticationType =
            attributes.authenticationType || "";
    saAuthenticationToken.key = attributes.key || "";

    this.__defineGetter__("authenticationType", function () {
        return saAuthenticationToken.authenticationType;
    });

    this.__defineGetter__("key", function () {
        return saAuthenticationToken.key;
    });
};

SAPeerAccessory = function (attributes) {
    var saPeerAccessory = {};

    saPeerAccessory.deviceAddress = attributes.deviceAddress || "";
    saPeerAccessory.deviceName = attributes.deviceName || "";
    saPeerAccessory.productId = attributes.productId || "";
    saPeerAccessory.transportType = attributes.transportType || "";
    saPeerAccessory.vendorId = attributes.vendorId || "";

    this.__defineGetter__("deviceAddress", function () {
        return saPeerAccessory.deviceAddress;
    });

    this.__defineGetter__("deviceName", function () {
        return saPeerAccessory.deviceName;
    });

    this.__defineGetter__("productId", function () {
        return saPeerAccessory.productId;
    });

    this.__defineGetter__("transportType", function () {
        return saPeerAccessory.transportType;
    });

    this.__defineGetter__("vendorId", function () {
        return saPeerAccessory.vendorId;
    });
};

SAPeerAgent = function (attributes) {
    var saPeerAgent = {};

    saPeerAgent.peerAccessory = attributes.peerAccessory || {};
    saPeerAgent.appName = attributes.appName || "";
    saPeerAgent.maxAllowedDataSize = attributes.maxAllowedDataSize || 0;
    saPeerAgent.peerId = attributes.peerId || "";
    saPeerAgent.profileVersion = attributes.profileVersion || "";

    this.__defineGetter__("peerAccessory", function () {
        return saPeerAgent.peerAccessory;
    });

    this.__defineGetter__("appName", function () {
        return saPeerAgent.appName;
    });

    this.__defineGetter__("maxAllowedDataSize", function () {
        return saPeerAgent.maxAllowedDataSize;
    });

    this.__defineGetter__("peerId", function () {
        return saPeerAgent.peerId;
    });

    this.__defineGetter__("profileVersion", function () {
        return saPeerAgent.profileVersion;
    });
};

SASocket = function (peerAgent) {
    var saSocket = {};

    saSocket.peerAgent = peerAgent || {};

    this.__defineGetter__("peerAgent", function () {
        return saSocket.peerAgent;
    });

    function sendSocketData(iSecure, channelId, data) {
        event.trigger("wearableSocketDataSent", [iSecure, channelId, data]);
    }

    this.close = function () {
        var agentId = saSocket.peerAgent.agentId,
            peerId = saSocket.peerAgent.peerId;

        if (_data.agents[agentId] &&
                _data.agents[agentId].socket[peerId] &&
                _data.agents[agentId].socket[peerId].isConnect) {
            _data.agents[agentId].socket[peerId].isConnect = false;

            if (_data.agents[agentId].socket[peerId].socketStatus) {
                _data.agents[agentId].socket[peerId].socketStatus(
                        new WebAPIError(errorcode.PEER_DISCONNECTED));
            }
        }
    };

    this.isConnected = function () {
        var agentId = saSocket.peerAgent.agentId,
            peerId = saSocket.peerAgent.peerId;

        if (_data.agents[agentId] &&
                _data.agents[agentId].socket[peerId] &&
                _data.agents[agentId].socket[peerId].isConnect) {
            return true;
        }
        return false;
    };

    this.sendData = function (channelId, data) {
        var maxSize = saSocket.peerAgent.maxAllowedDataSize,
            agentId = saSocket.peerAgent.agentId;

        t.SASocket("sendData", arguments);

        if (!_data.agents[agentId] || !_data.agents[agentId].channelIds &&
                _data.agents[agentId].channelIds.indexOf(channelId) === -1) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (data.length * 8 > maxSize) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        sendSocketData(false, channelId, data);
    };

    this.sendSecureData = function (channelId, data) {
        var maxSize = saSocket.peerAgent.maxAllowedDataSize,
            agentId = saSocket.peerAgent.agentId;

        t.SASocket("sendSecureData", arguments);

        if (!_data.agents[agentId] || !_data.agents[agentId].channelIds &&
                _data.agents[agentId].channelIds.indexOf(channelId) === -1) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (data.length * 8 > maxSize) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        sendSocketData(true, channelId, data);
    };

    this.setDataReceiveListener = function (callback) {
        var agentId = saSocket.peerAgent.agentId,
            peerId = saSocket.peerAgent.peerId;

        t.SASocket("setDataReceiveListener", arguments);

        _data.agents[agentId].socket[peerId].dataReceive = callback;
    };

    this.setSocketStatusListener = function (callback) {
        var agentId = saSocket.peerAgent.agentId,
            peerId = saSocket.peerAgent.peerId;

        t.SASocket("setSocketStatusListener", arguments);

        _data.agents[agentId].socket[peerId].socketStatus = callback;
    };
};

event.on("wearableRemoteSocketDataSent", function (peerAgent, channelId, data) {
    var agentId = peerAgent.agentId,
        peerId = peerAgent.peerId;

    if (_data.agents[agentId] && _data.agents[agentId].socket[peerId] && 
            _data.agents[agentId].socket[peerId].dataReceive) {
        channelId = _data.agents[agentId].channelIds[0];
        _data.agents[agentId].socket[peerId].dataReceive(channelId, data);
    }
});

SAFileTransfer = function (defaultReceivePath) {
    var saFileTransfer = {};

    saFileTransfer.defaultReceivePath = defaultReceivePath || "";

    this.__defineGetter__("defaultReceivePath", function () {
        return saFileTransfer.defaultReceivePath;
    });

    this.sendFile = function (peerAgent, filePath) {
        t.SAFileTransfer("sendFile", arguments);

        event.trigger("wearableFileTransfered", [peerAgent, filePath]);
    };

    this.setFileSendListener = function (callback) {
        t.SAFileTransfer("setFileSendListener", arguments);

        _data.saFileTransfer.fileSendListener = callback;
    };

    this.setFileReceiveListener = function (callback) {
        t.SAFileTransfer("setFileReceiveListener", arguments);

        _data.saFileTransfer.fileReceiveListener = callback;
    };

    this.receiveFile = function (id, localPath) {
        t.SAFileTransfer("receiveFile", arguments);

        if (_data.saFileTransfer.fileReceiveListener) {
            if (_data.saFileTransfer.fileReceiveListener.oncomplete) {
                _data.saFileTransfer.fileReceiveListener.oncomplete(id, localPath);
            }
        }
    };

    this.cancelFile = function (id) {
        t.SAFileTransfer("cancelFile", arguments);

        if (_data.saFileTransfer.fileReceiveListener) {
            if (_data.saFileTransfer.fileReceiveListener.onerror) {
                _data.saFileTransfer.fileReceiveListener.onerror(
                        new WebAPIError(errorcode.PEER_REJECTED), id);
            }
        }
    };

    this.rejectFile = function (id) {
        t.SAFileTransfer("rejectFile", arguments);

        if (_data.saFileTransfer.fileReceiveListener) {
            if (_data.saFileTransfer.fileReceiveListener.onerror) {
                _data.saFileTransfer.fileReceiveListener.onerror(
                        new WebAPIError(errorcode.PEER_REJECTED), id);
            }
        }
    };
};

event.on("wearableFileTransferCompleted", function (id, localPath) {
    if (_data.saFileTransfer.fileSendListener) {
        if (_data.saFileTransfer.fileSendListener.oncomplete) {
            _data.saFileTransfer.fileSendListener.oncomplete(id, localPath);
        }
    }
});

_initialize();

module.exports = _self;
