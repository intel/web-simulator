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
    app = require('ripple/app');

function _updateInformationView() {
    var infoPane = document.getElementById(constants.COMMON.INFO_SECTION),
        infoList = [],
        device = devices.getCurrentDevice(),
        tempString = "",
        widgetInfo = app.getInfo();

    //TODO: refactor this stuff to grab info from API, do this in a loop rather then hardcoded. Better DOM injection approach. This is legacy code

    infoList.push('<section id=\"information-banner\" style=\"display:none\"><img id=\"information-banner-icon\" width=\"16px\" height=\"16px\"/> <span id=\"information-banner-count\"></span></section>');
	
	if (widgetInfo.icon) {
        infoList.push('<section style="position: absolute; left: 260px;"  class="information-widgeticon"><img class="ui-corner-all" width="64" src="' + utils.appLocation() + widgetInfo.icon + '" alt="widget icon"/></section>');
    }
    if (widgetInfo.name) {
        infoList.push('<section class="information-widgetname">' + widgetInfo.name + '</section>');
    }
	
	infoList.push('<table class="tf_panel-table" style="border-spacing: 0px;">');

   
    if (widgetInfo.version) {
        infoList.push('<tr><td><label class=\"ui-text-label\">Version:</label></td><td>' + widgetInfo.version + '</td></tr>');
    }
    infoList.push("<tr><td><label class=\"ui-text-label\">Platform: </label></td><td>" + platform.current().name + "</td></tr>");
    infoList.push("<tr><td><label class=\"ui-text-label\">Device: </label></td><td>" + device.name + "</td></tr>");
    infoList.push("<tr><td><label class=\"ui-text-label\">OS: </label></td><td>" + device.osName + " " + device.osVersion + "</td></tr>");
    infoList.push("<tr><td><label class=\"ui-text-label\">Manufacturer: </label></td><td>" + device.manufacturer + "</td></tr>");
    infoList.push("<tr><td><label class=\"ui-text-label\">Screen: </label></td><td>" + device.screen.width + "x" + device.screen.height + "</td></tr>");

    if (device.screen.height !== device.viewPort.portrait.height) {
        infoList.push("<tr><td><label class=\"ui-text-label\">Viewport: </label></td><td>" + device.viewPort.portrait.width + "x" + device.viewPort.portrait.height + "</td></tr>");
    }

    infoList.push("<tr><td><label class=\"ui-text-label\">Density: </label></td><td>" + device.ppi + " PPI</td></tr>");
    infoList.push("<tr><td><label class=\"ui-text-label\">Browser(s): </label></td><td>" + device.browser.join(", ") + "</td></tr>");
    infoList.push("<tr><td><label class=\"ui-text-label\" style=\"float:left; padding-top: 0px; \">User Agent: </label></td><td>" +
                    device.userAgent + "</td></tr>");

	infoList.push('</table>');

    if (device.notes) {
        utils.forEach(device.notes, function (note) {
            tempString += "<li>" + note + "</li>";
        });
        infoList.push("<section><div style=\"clear:both;\"></div><label class=\"ui-text-label\">Notes: </label><ul>" + tempString + "</ul></section>");
    }

    infoPane.innerHTML = infoList.join("");
}

function _updateBanner(icon, count) {
    var bannerSection = document.getElementById("information-banner"),
        iconImg  = document.getElementById("information-banner-icon"),
        countSpan = document.getElementById("information-banner-count");

    if (icon && (count === undefined || count > 0)) {
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
        pane: "left"
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

        _updateInformationView();
    }
};
