/*
 *  Copyright 2011 Research In Motion Limited.
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
    _notificationUIStack,
    _notificationTemplate = "";

function _remove(id) {
    delete _notificationUIStack[id];
    db.saveObject("posted-notifications", _notificationUIStack);
    event.trigger("refreshNotificationStack", [], true);
    _render();
}

function _removeAll() {
    _notificationUIStack = {};
    db.saveObject("posted-notifications", _notificationUIStack);
    event.trigger("refreshNotificationStack", [], true);
    $("#notification-box").empty();
    $("#notification-box").append('<div style="color:#666666;">(Empty notification.)</div>');
    $("#remove-all-notifications-btn").hide();
}

function _render() {
    var notificationHTML = "",
        htmlContent = "";

    utils.forEach(_notificationUIStack, function (item) {
        notificationHTML = _notificationTemplate.replace(/#id/g, item.id)
            .replace(/#title/g, item.title)
            .replace(/#content/, item.content ? item.content : "")
            .replace(/#type/, item.type)
            .replace(/#statusType/, item.statusType)
            .replace(/#postedTime/, item.postedTime)
            .replace(/#iconPath/, item.iconPath ? item.iconPath : "")
            .replace(/#subIconPath/, item.subIconPath ? item.subIconPath : "")
            .replace(/#number/, item.number ? item.number : "")
            .replace(/#detailInfo/, item.detailInfo ? item.detailInfo.join() : "")
            .replace(/#backgroundImagePath/, item.backgroundImagePath ? item.backgroundImagePath : "")
            .replace(/#thumbnails/, item.thumbnails ? item.thumbnails.join() : "")
            .replace(/#soundPath/, item.soundPath ? item.soundPath : "")
            .replace(/#vibration/, item.vibration !== undefined ? (item.vibration === true ? "true" : "false") : "")
            .replace(/#appControl/, item.appControl ? item.appControl : "")
            .replace(/#appId/, item.appId ? item.appId : "")
            .replace(/#progressType/g, item.progressType ? item.progressType: "")
            .replace(/#progressValue/, (item.statusType === "PROGRESS" && item.progressType === "PERCENTAGE" && item.progressValue) ? item.progressValue.toString() + "%" : "")
            .replace(/#progressBarValue/, (item.statusType === "PROGRESS" && item.progressType === "PERCENTAGE" && item.progressValue) ? item.progressValue : 0)
            .replace(/#progress2Value/, (item.statusType === "PROGRESS" && item.progressType === "BYTE" && item.progressValue) ? item.progressValue.toString() + " byte(s)" : "")
            .replace(/#displayBar/g, (item.statusType !== "PROGRESS" || item.progressType !== "PERCENTAGE") ? "none" : "")
            .replace(/#display2Bar/g, (item.statusType !== "PROGRESS" || item.progressType !== "BYTE") ? "none" : "");
        htmlContent += notificationHTML;
    });

    $("#notification-box").accordion("destroy");
    $("#notification-box").html(htmlContent).accordion({
        active : false,
        collapsible : true,
        autoHeight : false
    });

    $("#notification-box .progress-bar").each(function (index, item) {
        $(item).width(this.id);
    });
    if (utils.count(_notificationUIStack) !== 0) {
        $("#remove-all-notifications-btn").show();
    } else {
        $("#remove-all-notifications-btn").hide();
    }
    $("." + "remove-notification-btn").bind("click", function () {
        _remove(this.id);
    });
}

module.exports = {
    panel: {
        domId: "notification-container",
        collapsed: true,
        pane: "left",
        titleName: "Notification",
        display: true
    },
    initialize: function () {
        _notificationTemplate = $("#notification-template").html();
        $("#notification-box").empty();
        _notificationUIStack = db.retrieveObject("posted-notifications") || {};
        if (utils.count(_notificationUIStack) === 0) {
            $("#notification-box").append('<div style="color:#666666;">(Empty notification.)</div>');
        }
        else
            _render();
        $("#remove-all-notifications-btn").bind("click", _removeAll);

        event.on("refreshNotificationUI", function () {
            _notificationUIStack = db.retrieveObject("posted-notifications");
            _render();
        });
    }
};
