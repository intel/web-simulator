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

var errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    _data = {
        userAgent: null
    },
    _security = {
        "http://tizen.org/privilege/websetting": ["removeAllCookies"]
    },
    _self;

function _isInvalidString(str) {
    str = str.trim();

    return (/\t|\n|\r|\v/.test(str)) || (str.length === 0);
}

function _clearAllCookies() {
    var cookies = document.cookie.split(";"),
        i, equalPos, name;

    for (i = 0; i < cookies.length; i++) {
        equalPos = cookies[i].indexOf("=");
        name = (equalPos > -1) ? cookies[i].substr(0, equalPos) : cookies[i];

        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

_self = function () {
    var websetting;

    function setUserAgentString(userAgent, successCallback, errorCallback) {
        t.WebSettingManager("setUserAgentString", arguments, true);

        window.setTimeout(function () {
            if (_isInvalidString(userAgent)) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                }
                return;
            }

            if (_data.userAgent === null) {
                navigator.__defineGetter__("userAgent", function() {
                    return _data.userAgent;
                });
            }

            _data.userAgent = userAgent;

            successCallback();
        }, 1);
    }

    function removeAllCookies(successCallback, errorCallback) {
        if (!_security.removeAllCookies) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.WebSettingManager("removeAllCookies", arguments);

        window.setTimeout(function () {
            _clearAllCookies();
            successCallback();
        }, 1);
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    websetting = {
        setUserAgentString: setUserAgentString,
        removeAllCookies: removeAllCookies,
        handleSubFeatures: handleSubFeatures
    };

    return websetting;
};

module.exports = _self;
