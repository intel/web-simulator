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
    t = require('ripple/platform/wearable/2.2/typecast'),
    errorcode = require('ripple/platform/wearable/2.2/errorcode'),
    WebAPIException = require('ripple/platform/wearable/2.2/WebAPIException'),
    WebAPIError = require('ripple/platform/wearable/2.2/WebAPIError'),
    SAAgent,
    _security = {
        "http://developer.samsung.com/privilege/accessoryprotocol": [
            "requestSAAgent", "setDeviceStatusListener"]
    },
    _data = {
        sa: null,
        saAgents: []
    },
    _self;

function _initialize() {
    var i, saAgent,
        data = [{
            id: "/system/gallery",
            role: "PROVIDER",
            name: "smart_view",
            channelIds: [100]
        },{
            id: "/system/messages",
            role: "PROVIDER",
            name: "message_service_provider",
            channelIds: [902]
        }];

    for (i = 0; i < data.length; i++) {
        saAgent = new SAAgent(data[i]);

        _data.saAgents.push(saAgent);
    }
}

_self = function () {
    var sa;

    function requestSAAgent(successCallback, errorCallback) {
        if (!_security.requestSAAgent) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAManager("requestSAAgent", arguments);

        window.setTimeout(function () {
            if (!_data.saAgents && _data.saAgents.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.SERVICE_NOT_AVAILABLE_ERR));
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
        if (!_security.requestServiceConnection) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAAgent("requestServiceConnection", arguments);
    };

    this.setServiceConnectionListener = function (callback) {
        if (!_security.setServiceConnectionListener) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAAgent("setServiceConnectionListener", arguments);
    };

    this.authenticatePeerAgent = function (peerAgent, successCallback, errorCallback) {
        if (!_security.authenticatePeerAgent) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAAgent("authenticatePeerAgent", arguments);
    };

    this.acceptServiceConnectionRequest = function (peerAgent) {
        if (!_security.acceptServiceConnectionRequest) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAAgent("acceptServiceConnectionRequest", arguments);
    };

    this.rejectServiceConnectionRequest = function (peerAgent) {
        if (!_security.rejectServiceConnectionRequest) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAAgent("rejectServiceConnectionRequest", arguments);
    };

    this.findPeerAgents = function () {
        if (!_security.findPeerAgents) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAAgent("findPeerAgents", arguments);
    };

    this.setPeerAgentFindListener = function (callback) {
        if (!_security.setPeerAgentFindListener) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAAgent("setPeerAgentFindListener", arguments);
    };

    this.getSAFileTransfer = function () {
        if (!_security.getSAFileTransfer) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.SAAgent("getSAFileTransfer", arguments);
    };
};

_initialize();

module.exports = _self;
