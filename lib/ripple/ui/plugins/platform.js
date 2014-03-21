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
    utils = require('ripple/utils'),
    devices = require('ripple/devices'),
    platform = require('ripple/platform'),
    db = require('ripple/db');

function _updatePlatformDeviceSelect(platformID, currentDeviceKey) {
    var devicesSelect = document.getElementById(constants.COMMON.DEVICE_SELECT_ID),
        listOfSortedDevices = devices.getDevicesForPlatform(platformID)
                                        .sort(function (a, b) {
                                            return (a.screen.width * a.screen.height) < (b.screen.width * b.screen.height) ? -1 : ((a.screen.width * a.screen.height) > (b.screen.width * b.screen.height) ? 1 : 0);
                                        });
    db.remove("viewport_width");
    db.remove("viewport_height");
    db.remove("viewportTag");

    devicesSelect.innerHTML = "";
    listOfSortedDevices.forEach(function (dev) {
        var deviceNode = utils.createElement("option", {
            "innerText": dev.name,
            "value": dev.id
        });

        if (currentDeviceKey && deviceNode.value === currentDeviceKey) {
            deviceNode.selected = true;
        }

        devicesSelect.appendChild(deviceNode);
    });

    if (platformID === "ivi") {
        jQuery("#configuration-window-save-btn").hide();
        jQuery("#configuration-window-load-btn").hide();

        jQuery("#item_container :nth-child(2)").hide();
        jQuery("#item_container :nth-child(3)").hide();

        //jQuery("#hwkeys-panel").hide();
    }
    else {
        jQuery("#configuration-window-save-btn").show();
        jQuery("#configuration-window-load-btn").show();

        jQuery("#item_container :nth-child(2)").show();
        jQuery("#item_container :nth-child(3)").show();

        //jQuery("#hwkeys-panel").show();
    }
}

function checkResolutionSize(evt) {
	var query_str, id_str, len;
	query_str = "#resolution-custom-" + evt.data.msg;
	id_str = "custom_" + evt.data.msg;
	len = jQuery(query_str).val();
	if (len >= 200 && len <= 2000) {
		db.save(id_str, len);
	} else {
		jQuery(query_str).val(db.retrieve(id_str));
	}
}

module.exports = {
    initialize: function () {
        var currentPlatform = platform.current().id,
            currentVersion = platform.current().version,
            platformList = platform.getList(),
            platformSelect = document.getElementById(constants.COMMON.PLATFORM_SELECT_ID),
            versionSelect = document.getElementById("version-select"),
            currentDeviceKey = devices.getCurrentDevice().id,
            platformNode, versionNode;

        jQuery("#platform-select").bind("change", function () {
            var newPlatform = jQuery(this).val(),
                newDevice = jQuery("#device-select").val();

            jQuery(versionSelect).children("option").remove();
            utils.forEach(platformList, function (platform) {
                utils.forEach(platform, function (version, versionNumber) {
                    if (newPlatform === version.id) {
                        versionSelect.appendChild(utils.createElement("option", {
                            "innerText": version.text,
                            "value":  versionNumber
                        }));
                    }
                });
            });
            _updatePlatformDeviceSelect(newPlatform, newDevice);

        });

        jQuery("#device-select").bind("focus", function () {
            $('input:radio[name="resolution-type"][value="predefined"]').click();
        });
        jQuery("#resolution-custom-width").bind("focus", function () {
            $('input:radio[name="resolution-type"][value="custom"]').click();
        });
        jQuery("#resolution-custom-height").bind("focus", function () {
            $('input:radio[name="resolution-type"][value="custom"]').click();
        });
        jQuery("#resolution-custom-width").bind("change", {msg: "width"}, checkResolutionSize);
        jQuery("#resolution-custom-height").bind("change", {msg: "height"}, checkResolutionSize);

        utils.forEach(platformList, function (platform, platformKey) {
            platformNode = utils.createElement("option", {
                "innerText": platformKey === "tizen" ? "mobile": platformKey,
                "value":  platformKey
            });

            utils.forEach(platform, function (version, versionNumber) {
                versionNode = utils.createElement("option", {
                    "innerText": version.text,
                    "value":  versionNumber
                });

                if (currentPlatform && version.id === currentPlatform) {
                    versionSelect.appendChild(versionNode);
                    if (currentVersion && currentVersion === versionNumber) {
                        platformNode.selected = true;
                        versionNode.selected = true;
                    }
                }
            });
            platformSelect.appendChild(platformNode);
        });

        _updatePlatformDeviceSelect(currentPlatform, currentDeviceKey);
    }
};
