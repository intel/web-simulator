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

var utils = require('ripple/utils'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    t = require('ripple/platform/tizen/2.0/typedef'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    NotificationBase = require('ripple/platform/tizen/2.0/NotificationBase'),
    NotificationDetailInfo = require('ripple/platform/tizen/2.0/NotificationDetailInfo'),

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

    return true;
}

function _checkNotificationDetailInfo(info) {
    if (typeof info !== "object") {
        return false;
    }

    if (typeof info.mainText !== "string") {
        return false;
    }

    if (info.subText && typeof info.subText !== "string") {
        return false;
    }

    return true;
}

function _checkDictProperties(dict) {
    var flag = false;
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

        if (dict.appControl && !_checkServiceProperties(dict.appControl)) {
            return false;
        }

        if (dict.appId && typeof dict.appId !== "string") {
            return false;
        }

        if (dict.progressType && !(dict.progressType === "PERCENTAGE" || dict.progressType === "BYTE")) {
            return false;
        }

        if (dict.progressValue && typeof dict.progressValue !== "number") {
            return false;
        }

        if (dict.number && typeof dict.number !== "number") {
            return false;
        }

        if (dict.subIconPath && typeof dict.subIconPath !== "string") {
            return false;
        }

        if (dict.detailInfo) {
            if (!tizen1_utils.isValidArray(dict.detailInfo)) {
                return false;
            }
            flag = false;
            utils.forEach(dict.detailInfo, function (info) {
                if (!_checkNotificationDetailInfo(info)) {
                    flag = true;
                }
            });
            if (flag === true) {
                return false;
            }
        }

        if (dict.ledColor && typeof dict.ledColor !== "string") {
            return false;
        }

        if (dict.ledOnPeriod && typeof dict.ledOnPeriod !== "number") {
            return false;
        }

        if (dict.ledOffPeriod && typeof dict.ledOffPeriod !== "number") {
            return false;
        }

        if (dict.backgroundImagePath && typeof dict.backgroundImagePath !== "string") {
            return false;
        }

        if (dict.thumbnails) {
            if (!tizen1_utils.isValidArray(dict.thumbnails)) {
                return false;
            }

            flag = false;
            utils.forEach(dict.thumbnails, function (thumbnail) {
                if (typeof thumbnail !== "string") {
                    flag = true;
                }
            });
            if (flag === true) {
                return false;
            }
        }
    }
    return true;
}

_self = function (_statusType, title, notificationInitDict) {
    var statusType, _progressType, _progressValue, _vibrationG, _ledOnPeriod, _ledOffPeriod, _info,
        notification = this;

    if (typeof _statusType !== "string" || !(_statusType === "SIMPLE" || _statusType === "THUMBNAIL" || _statusType === "ONGOING" || _statusType === "PROGRESS")
        || typeof title !== "string" || !_checkDictProperties(notificationInitDict)) {
        throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }

    if (notificationInitDict && _statusType === "PROGRESS" && "progressValue" in notificationInitDict && notificationInitDict.progressType === "PERCENTAGE" &&
        (notificationInitDict.progressValue < 0 || notificationInitDict.progressValue > 100)) {
        throw (new WebAPIError(errorcode.INVALID_VALUES_ERR));
    }

    statusType = _statusType;
    notification = NotificationBase.call(notification, title);
    notification.__defineGetter__("statusType", function () {
        return statusType;
    });

    notification.__defineGetter__("vibration", function () {
        return _vibration;
    });

    notification.__defineSetter__("vibration", function (vibration) {
        if (!(new TypeCoerce(t.boolean)).match(vibration))
            return;

        _vibration = vibration;
    });

    notification.__defineGetter__("ledOnPeriod", function () {
        return _ledOnPeriod;
    });

    notification.__defineSetter__("ledOnPeriod", function (ledOnPeriod) {
        if (!(new TypeCoerce(t["unsigned long"])).match(ledOnPeriod))
            return;

        _ledOnPeriod = ledOnPeriod;
    });

    notification.__defineGetter__("ledOffPeriod", function () {
        return _ledOffPeriod;
    });

    notification.__defineSetter__("ledOffPeriod", function (ledOffPeriod) {
        if (!(new TypeCoerce(t["unsigned long"])).match(ledOffPeriod))
            return;

        _ledOffPeriod = ledOffPeriod;
    });

    notification.__defineGetter__("progressType", function () {
        return _progressType;
    });

    notification.__defineSetter__("progressType", function (progressType) {
        if (!(new TypeCoerce(t.NotificationProgressType)).match(progressType))
            return;

        _progressType = progressType;
    });

    notification.__defineGetter__("progressValue", function () {
        return _progressValue;
    });

    notification.__defineSetter__("progressValue", function (progressValue) {
        if (!(new TypeCoerce(t["unsigned long"])).match(progressValue))
            return;

        progressValue = (new TypeCoerce(t["unsigned long"])).copy(progressValue);
        if ((_progressType === "PERCENTAGE") && (progressValue > 100))
            return;

        _progressValue = progressValue;
    });

    notification.content = null;
    notification.iconPath = null;
    notification.subIconPath = null;
    notification.number = null;
    notification.detailInfo = [];
    notification.ledColor = null;
    notification.ledOnPeriod = 0;
    notification.ledOffPeriod = 0;
    notification.backgroundImagePath = null;
    notification.thumbnails = [];
    notification.soundPath = null;
    notification.appControl = null;
    notification.appId = null;
    _progressType = "PERCENTAGE";
    _progressValue = null;
    _vibration = false;

    if (notificationInitDict) {
        notification.content = notificationInitDict.content ? notificationInitDict.content : null;
        notification.iconPath = notificationInitDict.iconPath ? notificationInitDict.iconPath : null;
        notification.subIconPath = notificationInitDict.subIconPath ? notificationInitDict.subIconPath : null;
        notification.number = notificationInitDict.number ? notificationInitDict.number: null;
        if (notificationInitDict.detailInfo) {
            utils.forEach(notificationInitDict.detailInfo, function (info) {
                if(info.subText) {
                    _info = new NotificationDetailInfo(info.mainText, info.subText);
                } else {
                    _info = new NotificationDetailInfo(info.mainText, info.subText);
                }
                notification.detailInfo.push(_info);

            });
        }
        notification.ledColor = "ledColor" in notificationInitDict ? notificationInitDict.ledColor : null;
        notification.ledOnPeriod = "ledOnPeriod" in notificationInitDict ? notificationInitDict.ledOnPeriod : 0;
        notification.ledOffPeriod = "ledOffPeriod" in notificationInitDict ? notificationInitDict.ledOffPeriod : 0;
        notification.backgroundImagePath = "backgroundImagePath" in notificationInitDict ? notificationInitDict.backgroundImagePath : null;
        notification.thumbnails = "thumbnails" in notificationInitDict ? notificationInitDict.thumbnails : [];
        notification.soundPath = "soundPath" in notificationInitDict ? notificationInitDict.soundPath : null;
        notification.appControl = "appControl" in notificationInitDict ? notificationInitDict.appControl : null;
        notification.appId = "appId" in notificationInitDict ? notificationInitDict.appId : null;
        _progressType = "progressType" in notificationInitDict ? notificationInitDict.progressType : "PERCENTAGE";
        if("progressValue" in notificationInitDict) {
            _progressValue = (new TypeCoerce(t["unsigned long"])).copy(notificationInitDict.progressValue);
        }
        _vibration = "vibration" in notificationInitDict ? notificationInitDict.vibration : false;
    }
    return notification;
};

module.exports = _self;
