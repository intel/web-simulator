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

var db = require('ripple/db'),
    utils = require('ripple/utils'),
    event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    StatusNotification = require('ripple/platform/tizen/2.0/StatusNotification'),
    _notificationStack,
    _security = {
        "http://tizen.org/privilege/notification": ["post", "update", "remove",
            "removeAll"]
    },
    _self;

_self = function () {
    function post(notification) {
        var posted = {};

        if (!_security.post) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NotificationManager("post", arguments);

        if (notification.id !== undefined) {
            return;
        }
        posted.id = Math.uuid(null, 16);

        notification.__defineGetter__("id", function () {
            return posted.id;
        });

        if (!_notificationStack[notification.id]) {
            posted.postedTime = new Date();

            notification.__defineGetter__("postedTime", function () {
                return posted.postedTime;
            });

            _notificationStack[notification.id] = t.Notification(notification,
                    "+");
            db.saveObject("posted-notifications", _notificationStack);
            event.trigger("refreshNotificationUI", [], true);
        }
    }

    function update(notification) {
        if (!_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NotificationManager("update", arguments);

        if (!_notificationStack[notification.id]) {
            throw new WebAPIException(errorcode.UNKNOWN_ERR);
        }
        _notificationStack[notification.id] = t.Notification(notification,
                "+");
        db.saveObject("posted-notifications", _notificationStack);
        event.trigger("refreshNotificationUI", [], true);
    }

    function remove(id) {
        if (!_security.remove) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NotificationManager("remove", arguments);

        if (!_notificationStack[id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        delete _notificationStack[id];
        db.saveObject("posted-notifications", _notificationStack);
        event.trigger('refreshNotificationUI', [], true);
    }

    function removeAll() {
        if (!_security.removeAll) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        _notificationStack = {};
        db.saveObject("posted-notifications", _notificationStack);
        event.trigger('refreshNotificationUI', [], true);
    }

    function get(id) {
        var n, notification;

        t.NotificationManager("get", arguments);

        if (!_notificationStack[id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        n = _notificationStack[id];
        notification = new StatusNotification(n.statusType, n.title, n);

        notification.__defineGetter__("id", function () {
            return n.id;
        });

        notification.__defineGetter__("postedTime", function () {
            return n.postedTime;
        });

        return notification;
    }

    function getAll() {
        var notifications = [];

        utils.forEach(_notificationStack, function (n) {
            var notification;

            notification = new StatusNotification(n.statusType, n.title, n);

            notification.__defineGetter__("id", function () {
                return n.id;
            });

            notification.__defineGetter__("postedTime", function () {
                return n.postedTime;
            });

            notifications.push(notification);
        });

        return notifications;
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    var notification = {
        post:              post,
        update:            update,
        remove:            remove,
        removeAll:         removeAll,
        get:               get,
        getAll:            getAll,
        handleSubFeatures: handleSubFeatures
    };

    return notification;
};

function _initilize() {
    _notificationStack = db.retrieveObject("posted-notifications") || {};

    utils.forEach(_notificationStack, function (n) {
        n.postedTime = new Date(n.postedTime);
    });

    event.on("refreshNotificationStack", function () {
        _notificationStack = db.retrieveObject("posted-notifications");
    });
}

_initilize();

module.exports = _self;
