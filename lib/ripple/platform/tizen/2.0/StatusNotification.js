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

var t = require('ripple/platform/tizen/2.0/typecast'),
    ApplicationControl = require('ripple/platform/tizen/2.0/ApplicationControl'),
    Notification = require('ripple/platform/tizen/2.0/NotificationBase'),
    NotificationDetailInfo = require('ripple/platform/tizen/2.0/NotificationDetailInfo'),
    StatusNotification;

StatusNotification = function (statusType, title, notificationInitDict) {
    var statusNotification = {}, attr, i, info;

    t.StatusNotification(arguments, this);

    Notification.call(this, title, notificationInitDict ?
            notificationInitDict.content : null);

    statusNotification.statusType          = statusType;
    statusNotification.iconPath            = null;
    statusNotification.subIconPath         = null;
    statusNotification.number              = null;
    statusNotification.detailInfo          = [];
    statusNotification.ledColor            = null;
    statusNotification.ledOnPeriod         = 0;
    statusNotification.ledOffPeriod        = 0;
    statusNotification.backgroundImagePath = null;
    statusNotification.thumbnails          = [];
    statusNotification.soundPath           = null;
    statusNotification.vibration           = false;
    statusNotification.appControl          = null;
    statusNotification.appId               = null;
    statusNotification.progressType        = "PERCENTAGE";
    statusNotification.progressValue       = null;

    for (attr in notificationInitDict) {
        switch (attr) {
        case "appControl":
            statusNotification.appControl = new ApplicationControl(
                    notificationInitDict.appControl.operation,
                    notificationInitDict.appControl.uri || null,
                    notificationInitDict.appControl.mime || null,
                    notificationInitDict.appControl.category || null,
                    notificationInitDict.appControl.data || null);
            break;

        case "detailInfo":
            for (i in notificationInitDict.detailInfo) {
                info = notificationInitDict.detailInfo[i];
                info = new NotificationDetailInfo(info.mainText,
                        info.subText);

                statusNotification.detailInfo.push(info);
            }
            break;

        default:
            statusNotification[attr] = notificationInitDict[attr];
            break;
        }
    }

    this.__defineGetter__("statusType", function () {
        return statusNotification.statusType;
    });

    this.__defineGetter__("iconPath", function () {
        return statusNotification.iconPath;
    });
    this.__defineSetter__("iconPath", function (val) {
        try {
            statusNotification.iconPath = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("subIconPath", function () {
        return statusNotification.subIconPath;
    });
    this.__defineSetter__("subIconPath", function (val) {
        try {
            statusNotification.subIconPath = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("number", function () {
        return statusNotification.number;
    });
    this.__defineSetter__("number", function (val) {
        try {
            statusNotification.number = t.long(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("detailInfo", function () {
        return statusNotification.detailInfo;
    });
    this.__defineSetter__("detailInfo", function (val) {
        try {
            statusNotification.detailInfo = t.NotificationDetailInfo(val, "[]?");
        } catch (e) {
        }
    });

    this.__defineGetter__("ledColor", function () {
        return statusNotification.ledColor;
    });
    this.__defineSetter__("ledColor", function (val) {
        try {
            statusNotification.ledColor = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("ledOnPeriod", function () {
        return statusNotification.ledOnPeriod;
    });
    this.__defineSetter__("ledOnPeriod", function (val) {
        try {
            statusNotification.ledOnPeriod = t["unsigned long"](val);
        } catch (e) {
        }
    });

    this.__defineGetter__("ledOffPeriod", function () {
        return statusNotification.ledOffPeriod;
    });
    this.__defineSetter__("ledOffPeriod", function (val) {
        try {
            statusNotification.ledOffPeriod = t["unsigned long"](val);
        } catch (e) {
        }
    });

    this.__defineGetter__("backgroundImagePath", function () {
        return statusNotification.backgroundImagePath;
    });
    this.__defineSetter__("backgroundImagePath", function (val) {
        try {
            statusNotification.backgroundImagePath = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("thumbnails", function () {
        return statusNotification.thumbnails;
    });
    this.__defineSetter__("thumbnails", function (val) {
        try {
            statusNotification.thumbnails = t.DOMString(val, "[]?");
        } catch (e) {
        }
    });

    this.__defineGetter__("soundPath", function () {
        return statusNotification.soundPath;
    });
    this.__defineSetter__("soundPath", function (val) {
        try {
            statusNotification.soundPath = t.DOMString(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("vibration", function () {
        return statusNotification.vibration;
    });
    this.__defineSetter__("vibration", function (val) {
        try {
            statusNotification.vibration = t.boolean(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("appControl", function () {
        return statusNotification.appControl;
    });
    this.__defineSetter__("appControl", function (val) {
        try {
            statusNotification.appControl = t.ApplicationControl(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("appId", function () {
        return statusNotification.appId;
    });
    this.__defineSetter__("appId", function (val) {
        try {
            statusNotification.appId = t.ApplicationId(val, "?");
        } catch (e) {
        }
    });

    this.__defineGetter__("progressType", function () {
        return statusNotification.progressType;
    });
    this.__defineSetter__("progressType", function (val) {
        try {
            statusNotification.progressType = t.NotificationProgressType(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("progressValue", function () {
        return statusNotification.progressValue;
    });
    this.__defineSetter__("progressValue", function (val) {
        try {
            val = t["unsigned long"](val, '?');

            if ((statusNotification.progressType === "PERCENTAGE") &&
                    (val > 100))
                return;

            statusNotification.progressValue = val;
        } catch (e) {
        }
    });
};

module.exports = StatusNotification;
