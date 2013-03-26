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
    t = require('ripple/platform/tizen/2.0/typedef'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    _security = {
        "http://tizen.org/privilege/networkbearerselection":
            ["requestRouteToHost", "releaseRouteToHost"],
        all: true
    },
    _self;

_self = {
    requestRouteToHost: function (networkType, domainName, successCallback, errorCallback) {
        var evNetworkOpened       = "NO_" + networkType + "_" + domainName,
            evNetworkDisconnected = "ND_" + networkType + "_" + domainName;

        if (!_security.all && !_security.requestRouteToHost) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.NetworkType)).match(networkType) ||
            !(new TypeCoerce(t.DOMString)).match(domainName) ||
            !(new TypeCoerce(t.NetworkSuccessCallback)).match(successCallback) ||
            (errorCallback && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
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
    },

    releaseRouteToHost: function (networkType, domainName, successCallback, errorCallback) {
        var evNetworkDisconnected = "ND_" + networkType + "_" + domainName;

        if (!_security.all && !_security.releaseRouteToHost) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (!(new TypeCoerce(t.NetworkType)).match(networkType) ||
            !(new TypeCoerce(t.DOMString)).match(domainName) ||
            !(new TypeCoerce(t.SuccessCallback)).match(successCallback) ||
            (errorCallback && !(new TypeCoerce(t.ErrorCallback)).match(errorCallback))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (!domainName) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
            }
            return;
        }

        event.once(evNetworkDisconnected, successCallback);
        event.trigger("NetworkRelease", [networkType, domainName]);
    }
};

module.exports = _self;
