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

function _init() {
    var db = require('ripple/db'),
        utils = require('ripple/utils'),
        allTZ, dbTZ, node = jQuery("#time-locale-select"),
        timezone = require('ripple/platform/tizen/2.0/timezone_info'),
        event = require('ripple/event'),
        alarms, time;

    function triggerAlarm() {
        time = new Date();
        alarms = db.retrieveObject("tizen1.0-db-alarms");
        if (alarms !== null) {
            utils.forEach(alarms, function (obj) {
                if (obj.id !== undefined) {
                    event.trigger("CheckAlarm", [obj.id]);
                }
            });
        }
    }
    window.setInterval(triggerAlarm, 1000);

    allTZ = timezone.getAllTimezone();
    utils.forEach(allTZ, function (tz) {
        node.append(utils.createElement("option", {
            "value": tz,
            "innerHTML": tz + " - " + timezone.getTimezoneAbbr(tz) + "(" + timezone.getTimezoneDiff(tz) + ")"
        }));
    });
    dbTZ = db.retrieve("tizen-timezone");
    if (timezone.isValidTimezone(dbTZ)) {
        node.val(dbTZ);
    } else {
        db.save("tizen-timezone", node.val());
    }
    node.bind("change", function () {
        db.save("tizen-timezone", node.val());
    });
/* FIXME: Node "trigger-alarm-id" will be removed from Time panel
 *        due to "time" panel will changed to "time zone" panel(PTSDK-875)

    event.on("SendTriggerAppId", function (applicationId) {
        if (timeId !== undefined)
            clearTimeout(timeId);
        triggerNode.empty();
        triggerNode.append(utils.createElement("p", {
            "innerHTML": applicationId + " is triggered"
        }));
        triggerNode.show();
        timeId = setTimeout("jQuery('#trigger-alarm-id').empty();", 10000);// Comments will disappear after 10s
    });
*/
}

module.exports = {
    panel: {
        domId: "time-container",
        collapsed: true,
        pane: "right",
        titleName: "Time",
        display: true
    },
    initialize: _init
};
