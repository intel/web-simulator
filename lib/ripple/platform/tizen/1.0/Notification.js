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

/*
 * Parameters
 * iconUrl
 *    URL of the icon to be shown with this notification.
 *    It supports full URL and relative URL from server access;
 *    while only supports full URL beginning with "http://" from local file access.
 * title
 *    Primary text, or title, of the notification.
 * body
 *    Secondary text, or body, of the notification.
 *
 * Attributes
 * onshow
 *    An event listener function corresponding to the event type "show".
 *    It replaced 'ondisplay' attribute of Chrome notifications.
 */

module.exports = function (iconUrl, title, body) {
    var _self = window.webkitNotifications.createNotification(iconUrl, title, body);

    _self.__defineSetter__("onshow", function (onshow) {
        return _self.ondisplay = onshow;
    });

    return _self;
};

