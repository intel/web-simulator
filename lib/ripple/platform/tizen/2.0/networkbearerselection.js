/*
 *  Copyright 2013 Intel Corporation.
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
    t = require('ripple/platform/tizen/2.0/typecast'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    _security = {
        "http://tizen.org/privilege/networkbearerselection":
            ["requestRouteToHost", "releaseRouteToHost"]
    },
    _self;

_self = function () {
    var networkBearerSelection;

    function requestRouteToHost(networkType, domainName, successCallback, errorCallback) {
        var evNetworkOpened       = "NO_" + networkType + "_" + domainName,
            evNetworkDisconnected = "ND_" + networkType + "_" + domainName;

        if (!_security.requestRouteToHost) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NetworkBearerSelection("requestRouteToHost", arguments);
        
        if (!domainName) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
            }
            return;
        }

        event.once(evNetworkOpened, function (isOpened) {
            if (!isOpened)
                return;

            successCallback.onsuccess();
        });
        event.once(evNetworkDisconnected, successCallback.ondisconnected);
        event.trigger("NetworkRequest", [networkType, domainName]);
    }

    function releaseRouteToHost(networkType, domainName, successCallback, errorCallback) {
        var evNetworkDisconnected = "ND_" + networkType + "_" + domainName;

        if (!_security.releaseRouteToHost) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NetworkBearerSelection("releaseRouteToHost", arguments);
       
        if (!domainName) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
            }
            return;
        }

        event.once(evNetworkDisconnected, successCallback);
        event.trigger("NetworkRelease", [networkType, domainName]);
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    networkBearerSelection = {
        requestRouteToHost: requestRouteToHost,
        releaseRouteToHost: releaseRouteToHost,
        handleSubFeatures:  handleSubFeatures
    };

    return networkBearerSelection;
};

module.exports = _self;
