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
var _bound,
    _console = require('ripple/console'),
    utils = require('ripple/utils'),
    ui = require('ripple/ui'),
    db = require('ripple/db'),
    _CURRENT_URL = "current-url",
    resizer = require('ripple/resizer'),
    platform = require('ripple/platform');

var _srcChangedObserver = new WebKitMutationObserver(function (mutations) {
            utils.forEach(mutations, function (mutation) {
                _bindObjectsToFrame(mutation.target);
            });
        });

function _observeIframeAdded(doc) {
    doc._iframeAddedObserver.observe(doc, {childList: true, subtree: true});
}

function _bindObjects(win, doc) {
    if (!win.tinyHippos) {
        require('ripple/emulatorBridge').link(win, doc);
        /// require('ripple/platform/tizen/2.0/touchEvent').mask(win, doc);
        require('ripple/touchEventEmulator').mask(win, doc);
        require('ripple/hwKeyEmulator').init(win, doc);
        require('ripple/documentEventListener').mask(win, doc);
        require('ripple/deviceMotionEmulator').init(win, doc);
        require('ripple/resizer').init(win, doc);
        win.addEventListener("DOMContentLoaded", function () {
            var iframes =  $(this.document).find("iframe");
            // Observe iframe added event so that we can bind objects to newly added iframes
            if (!this.document._iframeAddedObserver) {
                this.document._iframeAddedObserver = new WebKitMutationObserver(function (mutations) {
                    utils.forEach(mutations, function (mutation) {
                        for (var i in mutation.addedNodes) {
                            var node = mutation.addedNodes[i];
                            if (node.tagName && (node.tagName.toUpperCase() === "IFRAME")) {
                                _bindObjectsToFrame(node);
                            }
                        }
                    });
                });
                _observeIframeAdded(this.document);
            }
            iframes.each(function () {
                _bindObjectsToFrame(this);
            });

        });
        win.frameElement._bound = true;
    }
}

function _beforeLoad() {
    this._bound = false;
    _bindObjects(this.contentWindow, this.contentDocument);
    this._intervalId = window.setInterval(function () {
        if (this._bound) {
            window.clearInterval(this._intervalId);
        } else {
            _bindObjects(this.contentWindow, this.contentDocument);
        }
    }.bind(this), 1);
}

function _bindObjectsToFrame(frame) {
    _srcChangedObserver.observe(frame, {attributes: true, attributeFilter: ["src"]});
    frame.addEventListener("beforeload", _beforeLoad);
    // beforeload event of an iframe will not be triggered unless we detach and
    // then attach the iframe to the dom tree
    var parentNode = frame.parentNode;
    var nextNode = frame.nextNode;
    if (parentNode) {
        // Disable iframe added observer to avoid infinite loop of binding objects
        if (frame.ownerDocument && frame.ownerDocument._iframeAddedObserver) {
            frame.ownerDocument._iframeAddedObserver.disconnect();
        }
        parentNode.removeChild(frame);
        if (nextNode)
            nextNode.insertBefore(frame);
        else
            parentNode.appendChild(frame);

        if (frame.ownerDocument && frame.ownerDocument._iframeAddedObserver) {
            _observeIframeAdded(frame.ownerDocument);
        }
    }
}

function _createFrame(src) {
    var frame = document.createElement("iframe");
    frame.setAttribute("id", "document");
    frame.src = src;

    if (ui.registered("omnibar")) {
        _bindObjectsToFrame(frame);
    }

    return frame;
}

function _cleanBody() {
    require('ripple/utils').forEach(document.body.children, function (child) {
        if (child && child.id && !child.id.match(/ui|tooltip|bus/)) {
            document.body.removeChild(child);
        }

        document.body.removeAttribute("style");
        document.body.removeAttribute("id");
        document.body.removeAttribute("class");
    });
}

function reload() {
    window.tinyHipposReload = true;
    location.reload();
}

function _post(src) {
    var event = require('ripple/event'),
        frame = _createFrame(src);

    _console.log("Initialization Finished (Make it so.)");

    frame.onload = function () {
        var bootLoader = document.querySelector("#emulator-booting"),
            id,
            iframe = document.getElementById('document'),
            viewportTagFound = false,
            viewportTagContent = {},
            viewportTagStr = "",
            tagProperties = [],
            propertyKey ="",
            propertyValue = "",
            curViewPortWidth = "",
            curViewPortHeight = "",
            layout = db.retrieve("layout") || "portrait",
            preLayout = "";

        if (bootLoader) {
            document.querySelector("#ui").removeChild(bootLoader);
        }

        // Workaround to enforce the content of iframe to rerender when scrolling
        document.getElementById('document').contentWindow.onscroll = function() {
            jQuery("#device-maskmask").show();
            setTimeout(function() {
                jQuery("#device-maskmask").hide();
            }, 50);
        }

        event.trigger("TinyHipposLoaded");
        _cleanBody();
        id = window.setInterval(_cleanBody, 20);

        window.setTimeout(function () {
            window.clearInterval(id);
        }, 1200);

        // Clean data for different app
        if (db.retrieve("current-url") !== db.retrieve("previous-url")) {
            db.remove("viewport_width");
            db.remove("viewport_height");
            db.remove("viewportTag");
            db.remove("prelayout");
        }

        curViewPortWidth = db.retrieve("viewport_width");
        curViewPortHeight = db.retrieve("viewport_height");
        preLayout = db.retrieve("prelayout") || "portrait";
        db.save("previous-url", db.retrieve("current-url"));

        if (iframe.contentDocument.getElementsByName('viewport')[0] !== undefined) {
            viewportTagStr = iframe.contentDocument.getElementsByName('viewport')[0].getAttribute("content");
            viewportTagStr = viewportTagStr.replace(/\s/g, '');
            tagProperties = viewportTagStr.split(",");

            for (var i in tagProperties) {
                propertyKey = tagProperties[i].split("=")[0];
                propertyValue = tagProperties[i].split("=")[1];
                viewportTagContent[propertyKey] = propertyValue;
            }
            viewportTagFound = true;
        }

        // if viewport tag found (width, height)
        if (viewportTagFound && ((viewportTagContent['width'] !== undefined) || (viewportTagContent['height'] !== undefined))) {
            if ((viewportTagContent['width'] !== undefined)) {
                if (curViewPortWidth !== viewportTagContent['width']) {
                    db.saveObject("viewportTag", viewportTagContent);
                    if (layout !== preLayout) {
                        db.save("prelayout", layout);
                        resizer.changeLayoutType(layout);
                        event.trigger("LayoutChanged", [layout], true);
                        frame.contentWindow.location.reload(); // get the updated screenAvailWidth, screenWidth....
                    } else {
                        resizer.changeLayoutType(layout);
                    }
                }
            } else {
                if (curViewPortHeight !== viewportTagContent['height']) {
                    db.saveObject("viewportTag", viewportTagContent);
                    if (layout !== preLayout) {
                        db.save("prelayout", layout);
                        resizer.changeLayoutType(layout);
                        event.trigger("LayoutChanged", [layout], true);
                        frame.contentWindow.location.reload(); // get the updated screenAvailWidth, screenWidth....
                    } else {
                        resizer.changeLayoutType(layout);
                    }
                }
            }
        } else {
            // Set layout to portrait if no viewport tag detected
            resizer.changeLayoutType('portrait');
            event.trigger("LayoutChanged", ['portrait'], true);
        }

        if (ui.registered("omnibar")) {
            //reset the onload function so that when navigating we can destroy
            //the iframe and create a new one so we can reinject the platform by
            //calling post again.
            frame.onload = function () {
                var url = frame.contentWindow.location.href;
                document.getElementById("viewport-container").removeChild(frame);
                event.trigger("FrameHistoryChange", [url]);
                _console.log("-----------------------------------------------------------");
                _console.log("Pay no attention to that man behind the curtain.");
                _console.log("Environment Warning up again (Set main batteries to auto-fire cycle)");
                _post(url);
            };
        }
    };

    // append frame
    document.getElementById("viewport-container").appendChild(frame);

    delete tinyHippos.boot;
}

function _bootstrap() {
    // TODO: figure this out for web and ext
    //_console.log("-----------------------------------------------------------");
    //_console.log("There be dragons above here!");
    _console.log("Web Simulator :: Environment Warming Up (Tea. Earl Gray. Hot.)");

    window.tinyHippos = require('ripple');

    tinyHippos.boot(function () {
        var uri = ui.registered('omnibar') ?
                db.retrieve(_CURRENT_URL) || "about:blank" :
                document.documentURI.replace(/enableripple=[^&]*[&]?/i, "").replace(/[\?&]*$/, "");

        _post(uri);
        delete tinyHippos.boot;
    });
}

module.exports = {
    bootstrap: _bootstrap,
    inject: function (frameWindow, frameDocument) {
        _bindObjects(frameWindow, frameDocument);
    }
};
