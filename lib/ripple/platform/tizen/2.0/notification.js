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

var db = require('ripple/db'),
    utils = require('ripple/utils'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    _notificationStack,
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

function _validateNotification(notification) {
    if (typeof notification !== "object") {
        return false;
    }

    if (typeof notification.id !== "string") {
        return false;
    }

    if (typeof notification.type !== "string" || notification.type !== "STATUS") {
        return false;
    }

    if (typeof notification.statusType !== "string" ||
        !(notification.statusType === "SIMPLE" || notification.statusType === "ONGOING" || notification.statusType === "PROGRESS")) {
        return false;
    }

    if (typeof notification.title !== "string") {
        return false;
    }

    if (notification.content && typeof notification.content !== "string") {
        return false;
    }

    if (notification.iconPath && typeof notification.iconPath !== "string") {
        return false;
    }

    if (notification.soundPath && typeof notification.soundPath !== "string") {
        return false;
    }

    if (notification.vibration && typeof notification.vibration !== "boolean") {
        return false;
    }

    if (notification.service && !_checkServiceProperties(notification.service)) {
        return false;
    }

    if (notification.statusType === "PROGRESS" && notification.progressValue && typeof notification.progressValue !== "number") {
        return false;
    }

    return true;
}

_self = {
    post : function (notification) {
        if (!_validateNotification(notification)) {
            throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (notification.statusType === "PROGRESS" && notification.progressValue &&
            (notification.progressValue < 1 || notification.progressValue > 100)) {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }

        if (!_notificationStack[notification.id]) {
            Object.defineProperty(notification, "postedTime", {value: new Date().toString(), writable: false});
            _notificationStack[notification.id] = utils.copy(notification);
            db.saveObject("posted-notifications", _notificationStack);
            event.trigger("refreshNotificationUI", [], true);
        }
    },
    update : function (notification) {
        if (!_validateNotification(notification)) {
            throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (notification.statusType === "PROGRESS" && notification.progressValue &&
            (notification.progressValue < 1 || notification.progressValue > 100)) {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }

        if (_notificationStack[notification.id]) {
            _notificationStack[notification.id] = utils.copy(notification);
            db.saveObject("posted-notifications", _notificationStack);
            event.trigger("refreshNotificationUI", [], true);
        }

    },
    remove : function (id) {
        if (typeof id !== "string") {
            throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (!_notificationStack[id]) {
            throw (new WebAPIError(errorcode.NOT_FOUND_ERR));
        }

        delete _notificationStack[id];
        db.saveObject("posted-notifications", _notificationStack);
        event.trigger('refreshNotificationUI', [], true);
    },
    removeAll : function () {
        _notificationStack = {};
        db.saveObject("posted-notifications", _notificationStack);
        event.trigger('refreshNotificationUI', [], true);
    },
    get : function (id) {
        if (typeof id !== "string") {
            throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (!_notificationStack[id]) {
            throw (new WebAPIError(errorcode.NOT_FOUND_ERR));
        }

        return utils.copy(_notificationStack[id]);
    },
    getAll : function () {
        var notifications = [];
        utils.forEach(_notificationStack, function (item) {
            notifications.push(utils.copy(item));
        });
        return notifications;
    }
};

function _initilize() {
    _notificationStack = db.retrieveObject("posted-notifications") || {};
    event.on("refreshNotificationStack", function () {
        _notificationStack = db.retrieveObject("posted-notifications");
    });
}

_initilize();

module.exports = _self;