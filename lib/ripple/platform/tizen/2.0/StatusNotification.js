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

var NotificationBase = require('ripple/platform/tizen/2.0/NotificationBase'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    _self;

function _checkServiceProperties(service) {
    if (typeof service !== "object") {
        return false;
    }

    if (typeof service.operation !== "string") {
        return false;
    }

    if (service.uri && typeof service.uri !== "string") {
        return false;
    }

    if (service.mime && typeof service.mime !== "string") {
        return false;
    }

    if (service.data && !tizen1_utils.isValidArray(service.data)) {
        return false;
    }

    if (typeof service.replyResult !== "function") {
        return false;
    }

    if (typeof service.replyFailure !== "function") {
        return false;
    }

    return true;
}

function _checkDictProperties(dict) {
    if (dict) {
        if (typeof dict !== "object") {
            return false;
        }

        if (dict.content && typeof dict.content !== "string") {
            return false;
        }

        if (dict.iconPath && typeof dict.iconPath !== "string") {
            return false;
        }

        if (dict.soundPath && typeof dict.soundPath !== "string") {
            return false;
        }

        if (dict.vibration && typeof dict.vibration !== "boolean") {
            return false;
        }

        if (dict.service && !_checkServiceProperties(dict.service)) {
            return false;
        }

        if (dict.progressValue && typeof dict.progressValue !== "number") {
            return false;
        }
    }
    return true;
}

_self = function (_statusType, title, notificationInitDict) {
    var statusType,
        notification;

    if (typeof _statusType !== "string" || !(_statusType === "SIMPLE" || _statusType === "ONGOING" || _statusType === "PROGRESS") ||
        typeof title !== "string" ||
        !_checkDictProperties(notificationInitDict)) {
        throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }

    if (notificationInitDict && _statusType === "PROGRESS" && notificationInitDict.progressValue &&
        (notificationInitDict.progressValue < 1 || notificationInitDict.progressValue > 100)) {
        throw (new WebAPIError(errorcode.INVALID_VALUES_ERR));
    }

    statusType = _statusType;
    notification = new NotificationBase(title);
    notification.__defineGetter__("statusType", function () {
        return statusType;
    });

    if (notificationInitDict) {
        notification.content = notificationInitDict.content ? notificationInitDict.content : undefined;
        notification.iconPath = notificationInitDict.iconPath ? notificationInitDict.iconPath : undefined;
        notification.soundPath = notificationInitDict.soundPath ? notificationInitDict.soundPath : undefined;
        notification.vibration = notificationInitDict.vibration !== undefined ? notificationInitDict.vibration : undefined;
        notification.service = notificationInitDict.service ? notificationInitDict.service : undefined;
        notification.progressValue = (statusType === "PROGRESS" && notificationInitDict.progressValue) ? notificationInitDict.progressValue : undefined;
    }

    return notification;
};

module.exports = _self;