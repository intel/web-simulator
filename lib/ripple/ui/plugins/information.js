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
var constants = require('ripple/constants'),
    devices = require('ripple/devices'),
    event = require('ripple/event'),
    platform = require('ripple/platform'),
    utils = require('ripple/utils'),
    app = require('ripple/app'),
    tooltip = require('ripple/ui/plugins/tooltip'),
    db = require('ripple/db');

function _updateInformationView() {
    var infoPane = document.getElementById(constants.COMMON.INFO_SECTION),
        infoList = [],
        device = devices.getCurrentDevice(),
        tempString = "",
        widgetInfo = app.getInfo(),
        _systemSettings = db.retrieveObject("tizen2-systemsetting") || {"HOME_SCREEN": "", "LOCK_SCREEN": "", "INCOMING_CALL": "", "NOTIFICATION_EMAIL": ""};

    //TODO: refactor this stuff to grab info from API, do this in a loop rather then hardcoded. Better DOM injection approach. This is legacy code

    infoList.push('<section id=\"information-banner\" style=\"display:none\"><img id=\"information-banner-icon\" width=\"16px\" height=\"16px\"/> <span id=\"information-banner-count\"></span></section>');

    if (widgetInfo.icon) {
        infoList.push('<section style="position: absolute; left: 260px;"  class="information-widgeticon"><img class="ui-corner-all" width="64" src="' + utils.appLocation() + widgetInfo.icon + '" alt="widget icon"/></section>');
    }
    if (widgetInfo.name) {
        infoList.push("<section><div id=\"systemSummaryAppNameContainer\" style=\"width:240px; height:20px; overflow:hidden; white-space: nowrap; text-overflow: ellipsis;\" ><label class=\"ui-text-label\">App Name: </label><span class=\"text-is-selectable\">" + widgetInfo.name + "</span></div></section>");
        //Update Title
        document.title = "Web Simulator - " + widgetInfo.name;
    }

    infoList.push('<table class="tf_panel-table" style="border-spacing: 0px;">');

//    infoList.push("<tr><td><label class=\"ui-text-label\">Platform: </label></td><td>" + platform.current().name + "</td></tr>");
   
    if (widgetInfo.version) {
        infoList.push('<section class="information-widgetversion"><label class=\"ui-text-label\">Version: </label><span class="text-is-selectable">' + widgetInfo.version + '</span></section>');
    }
    infoList.push("<section><label class=\"ui-text-label\">Platform: </label><span class=\"text-is-selectable\">" + platform.current().name + "</span></section>");
    infoList.push("<section><label class=\"ui-text-label\">Device: </label><span class=\"text-is-selectable\">" + device.name + "</span></section>");
    infoList.push("<section><label class=\"ui-text-label\">OS: </label><span class=\"text-is-selectable\">" + device.osName + " " + device.osVersion + "</span></section>");
    infoList.push("<section><label class=\"ui-text-label\">Manufacturer: </label><span class=\"text-is-selectable\">" + device.manufacturer + "</span></section>");
    infoList.push("<section><label class=\"ui-text-label\">Screen: </label><span class=\"text-is-selectable\">" + device.screen.width + "x" + device.screen.height + "</span></section>");

    if (device.screen.height !== device.viewPort.portrait.height) {
        infoList.push("<section><label class=\"ui-text-label\">Viewport: </label><span class=\"text-is-selectable\">" + device.viewPort.portrait.width + "x" + device.viewPort.portrait.height + "</span></section>");
    }

    infoList.push("<section><label class=\"ui-text-label\">Density: </label><span class=\"text-is-selectable\">" + device.ppi + " PPI</span></section>");
    infoList.push("<section><label class=\"ui-text-label\" style=\"float:left; padding-top: 0px; \">User Agent: </label>" +
                    "<div class=\"text-is-selectable\" style=\"padding-left: 80px\">" + device.userAgent + "</div></section>");

    if (device.notes) {
        utils.forEach(device.notes, function (note) {
            tempString += "<li class=\"text-is-selectable\">" + note + "</li>";
        });
        infoList.push("<section><div style=\"clear:both;\"></div><label class=\"ui-text-label\">Notes: </label><ul>" + tempString + "</ul></section>");
    }

    infoList.push("<section><div style=\"clear:both;\"></div><div id=\"systemSummaryHomeScreenContainer\" style=\"width:320px; height:20px; overflow:hidden; white-space: nowrap; text-overflow: ellipsis;\" ><label class=\"ui-text-label\">Home Screen Image: </label><span>" + _systemSettings["HOME_SCREEN"] + "</span></div></section>");
    infoList.push("<section><div style=\"clear:both;\"></div><div id=\"systemSummaryLockScreenContainer\" style=\"width:320px; height:20px; overflow:hidden; white-space: nowrap; text-overflow: ellipsis;\" ><label class=\"ui-text-label\">Lock Screen Image: </label><span>" + _systemSettings["LOCK_SCREEN"] + "</span></div></section>");
    infoList.push("<section><div style=\"clear:both;\"></div><div id=\"systemSummaryInComingCallContainer\" style=\"width:320px; height:20px; overflow:hidden; white-space: nowrap; text-overflow: ellipsis;\" ><label class=\"ui-text-label\">Incoming Call Number: </label><span>" + _systemSettings["INCOMING_CALL"] + "</span></div></section>");
    infoList.push("<section><div style=\"clear:both;\"></div><div id=\"systemSummaryNotiEMailContainer\" style=\"width:320px; height:20px; overflow:hidden; white-space: nowrap; text-overflow: ellipsis;\" ><label class=\"ui-text-label\">Notification Email: </label><span>" + _systemSettings["NOTIFICATION_EMAIL"] + "</span></div></section>");
    infoPane.innerHTML = infoList.join("");

    // Make tooltip if it needed
    if ((jQuery("#systemSummaryAppNameContainer").children("label").width() + jQuery("#systemSummaryAppNameContainer").children("span").width()) > 240) {
        tooltip.create("#systemSummaryAppNameContainer", jQuery("#systemSummaryAppNameContainer").children("span").text());
    }
    if ((jQuery("#systemSummaryHomeScreenContainer").children("label").width() + jQuery("#systemSummaryHomeScreenContainer").children("span").width()) > 320) {
        tooltip.create("#systemSummaryHomeScreenContainer", jQuery("#systemSummaryHomeScreenContainer").children("span").text());
    }
    if ((jQuery("#systemSummaryLockScreenContainer").children("label").width() + jQuery("#systemSummaryLockScreenContainer").children("span").width()) > 320) {
        tooltip.create("#systemSummaryLockScreenContainer", jQuery("#systemSummaryLockScreenContainer").children("span").text());
    }
    if ((jQuery("#systemSummaryInComingCallContainer").children("label").width() + jQuery("#systemSummaryInComingCallContainer").children("span").width()) > 320) {
        tooltip.create("#systemSummaryInComingCallContainer", jQuery("#systemSummaryInComingCallContainer").children("span").text());
    }
    if ((jQuery("#systemSummaryNotiEMailContainer").children("label").width() + jQuery("#systemSummaryNotiEMailContainer").children("span").width()) > 320) {
        tooltip.create("#systemSummaryNotiEMailContainer", jQuery("#systemSummaryNotiEMailContainer").children("span").text());
    }
}

function _updateBanner(icon, count) {
    var bannerSection = document.getElementById("information-banner"),
        iconImg  = document.getElementById("information-banner-icon"),
        countSpan = document.getElementById("information-banner-count");

    if (icon && (count === undefined || count !== 0)) {
        count = count || "";
        jQuery("#" + constants.COMMON.INFO_SECTION).show();
        jQuery(bannerSection).fadeToggle(1000);
        jQuery(bannerSection).fadeIn(1000);
    }
    else {
        jQuery(bannerSection).fadeOut(1000);
    }

    iconImg.src = utils.appLocation() + icon;
    if (icon.indexOf("http") === 0) {
        iconImg.src = icon;
    }

    countSpan.innerHTML = count > 99 ? "99+" : count;
}

module.exports = {
    panel: {
        domId: "information-container",
        collapsed: false,
        pane: "left",
        titleName: "System Summary",
        display: true
    },
    initialize: function () {
        event.on("BannerUpdated", function (icon, count) {
            _updateBanner(icon, count);
        });

        event.on("PlatformChangedEvent", function () {
            _updateInformationView();
        });

        event.on("WidgetInformationUpdated", function () {
            _updateInformationView();
        });
        
        event.on("SystemSettingChanged", function () {
            _updateInformationView();
        });

        _updateInformationView();
    }
};
