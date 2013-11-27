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
    NotificationDetailInfo;

NotificationDetailInfo = function (mainText, subText) {
    var notificationDetailInfo = {};

    t.NotificationDetailInfo(arguments, this);

    notificationDetailInfo.mainText = mainText;
    notificationDetailInfo.subText  = subText || null;

    this.__defineGetter__("mainText", function () {
        return notificationDetailInfo.mainText;
    });
    this.__defineSetter__("mainText", function (val) {
        try {
            notificationDetailInfo.mainText = t.DOMString(val);
        } catch (e) {
        }
    });

    this.__defineGetter__("subText", function () {
        return notificationDetailInfo.subText;
    });
    this.__defineSetter__("subText", function (val) {
        try {
            notificationDetailInfo.subText = t.DOMString(val, "?");
        } catch (e) {
        }
    });
};

module.exports = NotificationDetailInfo;
