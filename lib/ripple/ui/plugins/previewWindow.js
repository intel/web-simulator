/*
 *  Copyright 2014 Intel Corporation.
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

var platform = require("ripple/platform"),
    devices = require("ripple/devices"),
    LIMIT_SIZE = 200,
    ROW_COUNT = 3,
    previewSource,
    deviceResolutions,
    oldContainer, oldLeft, oldTop, oldScale,
    previewContainer, prevLeft, prevTop, prevTops,
    rowIndex;

function getAbsoluteURI(base, relative) {
    var stack = base.split("/"),
        parts = relative.split("/"),
        i;

    stack.pop();
    for (i = 0; i < parts.length; i++) {
        if (parts[i] === ".")
            continue;
        if (parts[i] === "..")
            stack.pop();
        else
            stack.push(parts[i]);
    }

    return stack.join("/");
}

function _readPreviewSourceHtml() {
    var resource = document.getElementById("document"),
        links, linkHref,
        images, imgSrc,
        sources, sourceSrc,
        scripts, i, src;

    previewSource = resource.contentDocument.cloneNode(true);
    src = previewSource.documentURI;
    links = previewSource.getElementsByTagName("link");
    images = previewSource.getElementsByTagName("img");
    sources = previewSource.getElementsByTagName("source");
    scripts = previewSource.getElementsByTagName("script");
    for (i = 0; i < links.length; i++) {
        linkHref = links[i].getAttribute("href");
        if (!linkHref)
            continue;
        if (linkHref.indexOf("file://") === 0 ||
                linkHref.indexOf("http://") === 0)
            continue;
        previewSource.getElementsByTagName("link")[i].setAttribute("href",
            getAbsoluteURI(src, linkHref));
    }
    for (i = 0; i < images.length; i++) {
        imgSrc = images[i].getAttribute("src");
        if (!imgSrc)
            continue;
        if (imgSrc.indexOf("file://") === 0 ||
                imgSrc.indexOf("http://") === 0 ||
                imgSrc.indexOf("data:") === 0)
            continue;
        previewSource.getElementsByTagName("img")[i].setAttribute("src",
            getAbsoluteURI(src, imgSrc));
    }
    for (i = 0; i < sources.length; i++) {
        sourceSrc = sources[i].getAttribute("src");
        if (!sourceSrc)
            continue;
        if (sourceSrc.indexOf("file://") === 0 ||
                sourceSrc.indexOf("http://") === 0)
            continue;
        previewSource.getElementsByTagName("source")[i].setAttribute("src",
            getAbsoluteURI(src, sourceSrc));
    }
    while (scripts.length > 0) {
        previewSource.getElementsByTagName("script")[0].remove();
    }
}

function _createPreviewLayout(container, width, height) {
    var frameId = container.id.replace("container", "preview"),
        frame = document.createElement("iframe"),
        frameContent;

    container.appendChild(frame);
    frame.setAttribute("id", frameId);
    //frame.setAttribute("src", previewSource.documentURI);
    frame.setAttribute("src", "");
    $(frame).css("width", width + "px");
    $(frame).css("height", height + "px");

    frameContent = frame.contentDocument;
    frameContent.open();
    frameContent.writeln(previewSource.documentElement.outerHTML);
    frameContent.close();
}

function _showPreviewField(container, width, height, title) {
    var suffix = title.replace(/\s/g, "").replace("(", "").replace(")", ""),
        containerId = "table" + suffix,
        containerField = $("<table></table>"),
        containerLeft = prevLeft,
        containerTop = prevTop,
        containerScale = 1,
        template = '<tr><td>' +
            '<div style="background-color: #dddddd; height: 25px; width: 100%; border: 1px solid #888888;">' +
            '<span style="margin-top:3px; margin-left:20px;">#TITLE</span></div>' +
            '</td></tr><tr><td>' +
            '<div id="container#SUFFIX" style="margin: 0; border: 10px solid #000000;"></div>' +
            '<input type="hidden" id="scale#SUFFIX" value="#SCALE" />' +
            '<input type="hidden" id="left#SUFFIX" value="#LEFT" />' +
            '<input type="hidden" id="top#SUFFIX" value="#TOP" />' +
            '<div class="preview-window-table-layout" style="position: absolute; width: 100%; height: 100%; left: 0; top: 18px; opacity: 0.5;"></div>' +
            '</td></tr>',
        iframeContainer;

    containerScale = (width > LIMIT_SIZE) ? Math.floor((LIMIT_SIZE / width) * 100) / 100 : 1;
    previewContainer.append(containerField);
    containerField.html(template.replace(/#SUFFIX/g, suffix)
        .replace(/#TITLE/g, title)
        .replace(/#SCALE/g, containerScale)
        .replace(/#LEFT/g, containerLeft)
        .replace(/#TOP/g, containerTop));
    containerField.attr("id", containerId);
    containerField.css({
        "left": containerLeft + "px",
        "top": containerTop + "px",
        '-webkit-transform-origin':  '0% 0%',
        '-webkit-transform':  "translate(0px, 0px) rotate(0deg) scale(" + containerScale + ")"
    });

    rowIndex++;
    prevTops.push(containerTop + (height + 30) * containerScale);
    if (rowIndex % ROW_COUNT === 0) {
        prevLeft = 0;
    }
    else {
        prevLeft = containerLeft + LIMIT_SIZE + 20;
    }
    if (rowIndex < ROW_COUNT) {
        prevTop = 0;
    }
    else {
        prevTop = prevTops[rowIndex - ROW_COUNT] + 20;
    }

    iframeContainer = document.getElementById("container" + suffix);
    _createPreviewLayout(iframeContainer, width, height);
}

function _showPreviewLayouts() {
    var deviceName,
        container = document.getElementById("preview-window-container-div");

    for (deviceName in deviceResolutions) {
        _showPreviewField(container, deviceResolutions[deviceName].width,
                deviceResolutions[deviceName].height, deviceName);
    }
}

function _initializeDeviceResolutions() {
    var platforms = platform.getList(),
        platformId,
        platformDevices,
        i;

    deviceResolutions = {};
    for (platformId in platforms) {
        platformDevices = devices.getDevicesForPlatform(platformId);
        for (i = 0; i < platformDevices.length; i++) {
            deviceResolutions[platformDevices[i].name] = {
                width: platformDevices[i].screen.width,
                height: platformDevices[i].screen.height
            };
        }
    }
}

function _bindEventsForPreviewWindow() {
    $("#preview-window-close-btn").unbind("click");
    $("#preview-window-close-btn").bind("click", function (event) {
        //$("#preview-window-popup").css("display", "none");
        $("#preview-window-popup").hide("slide", {direction: "up"}, "slow" ,function () {
            previewContainer.html("");
            $("#overlayBackground").hide();
        });

        event.preventDefault();
    });

    $("#preview-window-container-div table").unbind("click");
    $("#preview-window-container-div table").bind("click", function (event) {
        var containers = $("#preview-window-container-div table"),
            container = $(this),
            containerId = container.attr("id"),
            scaleId = containerId.replace("table", "scale"),
            leftId = containerId.replace("table", "left"),
            topId = containerId.replace("table", "top");

        oldLeft = container.find("#" + leftId).val();
        oldTop = container.find("#" + topId).val();
        oldScale = container.find("#" + scaleId).val();
        oldContainer = containerId;
        containers.find(".preview-window-table-layout").css("background", "");
        container.find(".preview-window-table-layout").css("background", "#000000");

        event.preventDefault();
    });

    $("#preview-window-preview-btn").unbind("click");
    $("#preview-window-preview-btn").bind("click", function (event) {
        var containerId = oldContainer;

        $("#preview-window-container-div table").hide();

        $("#" + containerId).css('left', '0px');
        $("#" + containerId).css('top', '0px');
        $("#" + containerId).find(".preview-window-table-layout").css("background", "");
        $("#" + containerId).css('-webkit-transform-origin', '0% 0%');
        $("#" + containerId).css('-webkit-transform',  "translate(0px, 0px) rotate(0deg) scale(1)");
        $("#" + containerId).show();

        $("#preview-window-preview-btn").hide();
        $("#preview-window-back-btn").show();
        $("#preview-window-scale-range").show();
        $("#preview-window-scale-range").val(100);
        $("#preview-window-popup .preview-window-scale-num").show();
        $("#preview-window-popup .preview-window-scale-num").text("100%");

        event.preventDefault();
    });

    $("#preview-window-scale-range").unbind("change");
    $("#preview-window-scale-range").bind("change", function (event) {
        var containerId = oldContainer,
            nScale = Number($(this).val());

        $("#" + containerId).css('-webkit-transform',  "translate(0px, 0px) rotate(0deg) scale(" + nScale / 100 + ")");
        $("#preview-window-popup .preview-window-scale-num").text(nScale + "%");

        event.preventDefault();
    });

    $("#preview-window-back-btn").unbind("click");
    $("#preview-window-back-btn").bind("click", function (event) {
        var containerId = oldContainer;

        $("#" + containerId).css('left', oldLeft + "px");
        $("#" + containerId).css('top', oldTop + "px");
        $("#" + containerId).css('-webkit-transform-origin', '0% 0%');
        $("#" + containerId).css('-webkit-transform',  "translate(0px, 0px) rotate(0deg) scale(" + oldScale + ")");

        $("#preview-window-container-div table").show();

        $("#preview-window-preview-btn").show();
        $("#preview-window-back-btn").hide();
        $("#preview-window-scale-range").hide();
        $("#preview-window-popup .preview-window-scale-num").hide();

        event.preventDefault();
    });
}

function _showPreviewWindow() {
    var position_x;

    position_x = (($(window).width() - 800) / 2) < 0 ? 0 : ($(window).width() - 800) / 2;
    $("#preview-window-popup").css("top", 80);
    $("#preview-window-popup").css("left", position_x);
    //$("#preview-window-popup").css("display", "block");
    $("#preview-window-popup").show("slide", {direction: "up"}, "slow" ,function () {
        $("#overlayBackground").css("width", $(window).width());
        $("#overlayBackground").css("height", $(window).height());
        $("#overlayBackground").show("fade", "slow");
        _showPreviewLayouts();
        _bindEventsForPreviewWindow();
    });
}

module.exports = {
    initialize : function() {
        previewContainer = $("#preview-window-container-div");
        $("#options-button-preview-window").bind("click", function () {
            previewContainer.html("");
            $("#preview-window-back-btn").hide();
            $("#preview-window-scale-range").hide();
            $("#preview-window-popup .preview-window-scale-num").hide();

            prevLeft = prevTop = 0;
            prevTops = [];

            oldLeft = oldTop = 0;
            oldScale = 1;
            oldContainer = null;

            rowIndex = 0;

            _initializeDeviceResolutions();
            _readPreviewSourceHtml();
            _showPreviewWindow();
        });
    }
};
