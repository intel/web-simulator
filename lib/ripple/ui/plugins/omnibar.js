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
var emulatorBridge = require('ripple/emulatorBridge'),
    platform = require('ripple/platform'),
    db = require('ripple/db'),
    devices = require('ripple/devices'),
    constants = require('ripple/constants'),
    _event = require('ripple/event'),
    tooltip = require('ripple/ui/plugins/tooltip'),
    histories = [];

function _omnibar() {
    return document.querySelector(".omni-bar input");
}

function _persist(url) {
    db.save("current-url", url);
}

function _persistRoot(url) {
    db.save("root-url", url);
}

function _currentURL() {
    return db.retrieve("current-url") || "about:blank";
}

function _rootURL() {
    return db.retrieve("root-url") || "about:blank";
}

function _reload() {
    _event.trigger("ApplicationLoad", null);
    emulatorBridge.window().location.reload();
}

function _loadApplication() {
    var omnibar = _omnibar(),
            xhr;
    if (omnibar.value.trim() !== "") {
        if (_currentURL().match(/^file:/) && omnibar.value.match(/^file:/)) { // Use ajax to know whether that file exists
            xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.responseText !== '') {
                        _persist(omnibar.value);
                        _persistRoot(omnibar.value);
                        emulatorBridge.window().location.assign(omnibar.value);
                    } else {
                        alert("File doesn't exist!");
                        return;
                    }
                }
            };
            xhr.open('GET', omnibar.value, true);
            xhr.send(null);
        } else {
            omnibar.value = omnibar.value.indexOf("://") < 0 ? "http://" + omnibar.value : omnibar.value;
            _persist(omnibar.value);
            _persistRoot(omnibar.value);
            emulatorBridge.window().location.assign(omnibar.value);
        }
        _addHistory(omnibar.value);
    }
    _event.trigger("ApplicationLoad", null);
}

function _hideHistory() {
    $("#app-launching-history").hide("slide", {direction: "up"}, "fast");
    $("#overlayBackground-transparent").hide();
}

function _makeHistoryItems() {
    histories = db.retrieveObject(constants.LAUNCHING_HISTORY);
    if (histories === undefined) {
        histories = [];
    }
    $("#app-launching-history").empty();
    histories.reverse();
    histories.forEach(function (item) {
        $("#app-launching-history").append('<div class="app-launching-history-item">' + item + '</div>');
    });

    if (histories.length === 0) {
        $("#app-launching-history").append('<div class="app-launching-history-item-empty">History empty</div>');
    }

    $(".app-launching-history-item").unbind('click');
    $(".app-launching-history-item").bind("click", function () {
        $(".omni-bar input").val(histories[$(this).index()]);
        _loadApplication();
        _hideHistory();
    });
}


function _showHistory() {
    _makeHistoryItems();
    $("#app-launching-history").css("width", $(".omni-bar input").width() + 20);
    $("#app-launching-history").show("slide", {direction: "up"}, "fast");
    $(window).bind('resize', function () {
        $("#app-launching-history").css("width", $(".omni-bar input").width() + 20);
        $("#overlayBackground-transparent").css("width", $(window).width());
        $("#overlayBackground-transparent").css("height", $(window).height());
    });

    $("#history-background-overlay").show();
    $("#overlayBackground-transparent").css("width", $(window).width());
    $("#overlayBackground-transparent").css("height", $(window).height());
    $("#overlayBackground-transparent").show();
    $("#overlayBackground-transparent").unbind('click');
    $("#overlayBackground-transparent").bind("click", function () {
        _hideHistory();
    });
}


function _addHistory(uri) {
    var i = 0, thehistories = db.retrieveObject(constants.LAUNCHING_HISTORY);
    if (thehistories !== undefined) {
        for (i; i < thehistories.length; i++) {
            if (uri === thehistories[i]) {
                return;
            }
        }
        if (thehistories.length >= 20) {
            thehistories.reverse();
            thehistories.pop();
            thehistories.reverse();
        }
    } else {
        thehistories = [];
    }
    thehistories.push(uri);
    db.saveObject(constants.LAUNCHING_HISTORY, thehistories);
}

_event.on("FrameHistoryChange", function (url) {
    _omnibar().value = url;
    _persist(url);
    _persistRoot(url);
});

function _getUrlParams(url) {
    var params = {};

    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
        params[key] = value;
    });

    return params;
}

module.exports = {
    initialize: function () {
        var omnibar = _omnibar(), loc, tmp,
            url, filename, matching, deviceId,
            xhr, uriParams, platformName, platformVersion;

        jQuery(".logo, .beta, .left, .right, .left-panel-collapse, .right-panel-collapse").css({
            "marginTop": "35px"
        });

        jQuery("#settings-xhr-proxy").parent().parent().hide();

        $(".omni-bar").show();

        uriParams = _getUrlParams(document.documentURI);

        if (uriParams.platform !== undefined) {
            platformName = uriParams.platform.split("-")[0];

            if (platformName === "mobile" || platformName === "tizen") {
                platformName = "tizen";
                platformVersion = "2.0";
            }
            else {
                platformName = "ivi";
                platformVersion = "3.0";
            }

            if (platform.current().id !== platformName) {
				deviceId = devices.getCurrentDevice().id;
				if (deviceId == "CUSTOM") {
					deviceId = "custom";
				}

                platform.changeEnvironment({
                    "name": platformName,
                    "version": platformVersion
                }, deviceId, function () {
                    window.tinyHipposReload = true;
                    location.reload();
                });
            }
        }

        if (uriParams.url !== undefined) {
            url = uriParams.url;
            if (url.match(/^\.[\.]?/) !== null) {
                loc = document.location;
                filename = loc.pathname.replace(/^.*[\\\/]/, '');
                matching = new RegExp(filename, "g");
                tmp = loc.protocol + "//" + loc.hostname + loc.pathname.replace(matching, "") + url;
                url = tmp;
            }
            _persist(url);
            _persistRoot(url);
            require('ripple/widgetConfig').initialize();
            require('ripple/ui/plugins/widgetConfig').initialize();
        }

        omnibar.value = _currentURL();

        omnibar.addEventListener("keydown", function (event) {
            if (event.keyCode === '13' || event.keyCode === 13 || event.keyCode === '0' || event.keyCode === 0) { // enter or return
                if (omnibar.value.trim() !== "") {
                    if (_currentURL().match(/^file:/) && omnibar.value.match(/^file:/)) { // Use ajax to know whether that file exists
                        xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 4) {
                                if (xhr.responseText !== '') {
                                    _persist(omnibar.value);
                                    _persistRoot(omnibar.value);
                                    emulatorBridge.window().location.assign(omnibar.value);
                                } else {
                                    alert("File doesn't exist!");
                                    return;
                                }
                            }
                        };
                        xhr.open('GET', omnibar.value, true);
                        xhr.send(null);
                    } else {
                        //default the protocal if not provided
                        omnibar.value = omnibar.value.indexOf("://") < 0 ? "http://" + omnibar.value : omnibar.value;
                        _persist(omnibar.value);
                        _persistRoot(omnibar.value);
                        emulatorBridge.window().location.assign(omnibar.value);
                    }
                    _event.trigger("ApplicationLoad", null);
                    _addHistory(omnibar.value);
                }
            }
        });

        window.addEventListener("keydown", function (event) {
            var hasMetaOrAltPressed = (event.metaKey || event.ctrlKey),
                key = parseInt(event.keyCode, 10);

            if (key === 82 && hasMetaOrAltPressed) { // cmd/ctrl + r
                event.preventDefault();
                _reload();
            }

            if (key === 116) { // F5
                event.preventDefault();
                _reload();
            }
        });

        document.getElementById("history-reload").addEventListener("click", _reload);
        $("#options-button-history").bind("click", function () {
            _showHistory();
        });
        tooltip.create("#history-reload", "Reload Application");
        tooltip.create("#options-button-history", "History");
        tooltip.create("#options-button-config-window", "Configuration");
        tooltip.create("#options-button-panels", "Panel Settings");
        tooltip.create("#options-button-about", "About");
    },
    currentURL: function () {
        return _currentURL();
    },
    rootURL: function () {
        return _rootURL();
    }
};
