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
// TODO: could use a bit of refactoring sugar
var db = require('ripple/db'),
    constants = require('ripple/constants'),
    _LEFT_PANEL_COLLAPSE = ".left-panel-collapse",
    _RIGHT_PANEL_COLLAPSE = ".right-panel-collapse",
    _LEFT_PANEL = ".left",
    _MIDDLE_PANEL = ".middle",
    _RIGHT_PANEL = ".right",
    _SAVE_KEY = "panel-collapsed",
    _leftEngaged, _rightEngaged, _store;


$(function () { 
    $(window).resize(function () {
        var windowHeight = $(window).height();
        jQuery(".PanelCollapseBar").css("top", windowHeight - 56);
        jQuery("#left_div").css("height", $(window).height() - 21);
        if (_store["left"] === true) {
            jQuery("#middle_div").css("width", $(window).width());
        } else {
            jQuery("#middle_div").css("width", $(window).width() - 344);
        }
    });
});


function _persist() {
    db.saveObject(_SAVE_KEY, _store);
}

function _updateLayout() {
    var node = document.querySelector("#device-container"),
        leftPanelClosed = document.querySelector(_LEFT_PANEL).style.opacity === "0.1",
        rightPanelClosed = document.querySelector(_RIGHT_PANEL).style.opacity === "0.1";

    if (leftPanelClosed && rightPanelClosed) {
        node.style.margin = "0 auto 0 auto";
    } else if (rightPanelClosed) {
        jQuery(node).animate({
            "marginRight": "3%"
        });
    } else if (leftPanelClosed) {
        jQuery(node).animate({
            "marginLeft": "3%"
        });
    } else {
        node.style.margin = "0 auto 0 auto";
    }
}


function updateZoomingValues(value, origin) {
    var scaleFactor = value / 100, scaleString;
    scaleString = "scale(" + scaleFactor + ")";
    jQuery('#device-container').css('-webkit-transform', scaleString);
    if (origin === "center") {
        jQuery('#device-container').css('-webkit-transform-origin', 'center top');
    } else {
        jQuery('#device-container').css('-webkit-transform-origin', 'left top');
    }
}


function _process(collapseNode, panelNode, side, callback) {
    var jNode = collapseNode.children("span"),
        jPanelNode = jQuery(panelNode),
        properties = {},
        collapseProperties = {},
        options = {
            duration: 600,
            complete: callback
        },
        oldIcon, newIcon,
        zoomingValue =  db.retrieve(constants.ENCAPSULATOR.ZOOMING);

    if (_store[side] === true) {
        _store[side] = false;
        
        if (side === "left") {
            jQuery('#left_div').show("fast");
            collapseNode.removeClass("PanelCollapseBarCollapsed");
            collapseNode.addClass("PanelCollapseBar");
            collapseNode.children().remove();
            collapseNode.append('<img src="images/sideCollapseIconLeftSide.png" style="margin-left:330px; margin-top: 6px;"/>');
            collapseNode.css("top", $(window).height() - 56);
            collapseNode.css("left", 0);
            jQuery("#middle_div").css("width", $(window).width() - 344);
            jQuery("#middle_div").css("left", 347);
            jQuery("#device-container").css("margin-left", "42px");
            updateZoomingValues(zoomingValue, "left");
        }
        
        oldIcon = (side === "left" ? "ui-icon-arrowthick-1-e" : "ui-icon-arrowthick-1-w");
        newIcon = (side === "left" ? "ui-icon-arrowthick-1-w" : "ui-icon-arrowthick-1-e");

        properties[side] = "0px";
        collapseProperties[side] = "345px";
        properties.opacity = "1";
    } else {
        _store[side] = true;
        
        if (side === "left") {
            collapseNode.removeClass("PanelCollapseBar");
            collapseNode.addClass("PanelCollapseBarCollapsed");
            collapseNode.children().remove();
            collapseNode.append('<img src="images/sideCollapseIconRightSide.png" style="position: absolute; margin-left:5px; margin-top:48%;"/>');
            collapseNode.css("top", 10);
            collapseNode.css("left", 0);
            collapseNode.css("margin-left", 0);
            jQuery('#left_div').hide("slow");
            jQuery("#middle_div").css("width", $(window).width() - 20);
            jQuery("#middle_div").css("left", 20);
            jQuery("#device-container").css("margin-left", "42px");
            updateZoomingValues(zoomingValue, "left");
        }
        
        oldIcon = (side === "left" ? "ui-icon-arrowthick-1-w" : "ui-icon-arrowthick-1-e");
        newIcon = (side === "left" ? "ui-icon-arrowthick-1-e" : "ui-icon-arrowthick-1-w");

        properties[side] = "-340px";
        collapseProperties[side] = "5px";
        properties.opacity = "0.1";
    }

    jNode.removeClass(oldIcon).addClass(newIcon);

    jPanelNode.animate(properties, options);
    //collapseNode.animate(collapseProperties, 600);

    _persist();
}

module.exports = {
    initialize: function () {
        var rightCollapseNode = jQuery(_RIGHT_PANEL_COLLAPSE),
            leftCollapseNode = jQuery(_LEFT_PANEL_COLLAPSE),
            zoomingValue =  db.retrieve(constants.ENCAPSULATOR.ZOOMING);
            //deviceNode = jQuery(_MIDDLE_PANEL);
           
        _store = db.retrieveObject(_SAVE_KEY) || {
            left: false,
            right: false
        };

        jQuery("#left_div").css("height", $(window).height() - 21);
        jQuery("#middle_div").css("width", $(window).width() - 344);
        
        //deviceNode.draggable({ cursor: 'move'});
    
        if (_store.left === true) {
            jQuery(_LEFT_PANEL).css({
                left: "-340px",
                opacity: "0.1"
            });
            
            leftCollapseNode.removeClass("PanelCollapseBar");
            leftCollapseNode.addClass("PanelCollapseBarCollapsed");
            leftCollapseNode.children().remove();
            leftCollapseNode.append('<img src="images/sideCollapseIconRightSide.png" style="position: absolute; margin-left:5px; margin-top:48%;"/>');
            leftCollapseNode.css("top", 10);
            leftCollapseNode.css("left", 0);
            leftCollapseNode.css("margin-left", 0);
            jQuery('#left_div').hide();
            jQuery("#middle_div").css("width", $(window).width() - 20);
            jQuery("#middle_div").css("left", 20);
            jQuery("#device-container").css("margin-left", "42px");
            updateZoomingValues(zoomingValue, "left");
        } else {
            jQuery('#left_div').show("fast");
            leftCollapseNode.removeClass("PanelCollapseBarCollapsed");
            leftCollapseNode.addClass("PanelCollapseBar");
            leftCollapseNode.children().remove();
            leftCollapseNode.append('<img src="images/sideCollapseIconLeftSide.png" style="margin-left:330px; margin-top: 6px;"/>');
            leftCollapseNode.css("top", $(window).height() - 56);
            leftCollapseNode.css("left", 0);
            jQuery("#device-container").css("margin-left", "42px");
            updateZoomingValues(zoomingValue, "left");
        }   

        if (_store.right === true) {
            jQuery(_RIGHT_PANEL).css({
                right: "-340px",
                opacity: "0.1"
            });

            rightCollapseNode.css({
                right: "5px"
            }).children("span").removeClass("ui-icon-arrowthick-1-e").addClass("ui-icon-arrowthick-1-w");
        }

        leftCollapseNode.bind("click", function () {
            if (!_leftEngaged) {
                _leftEngaged = true;
                _process(leftCollapseNode, _LEFT_PANEL, "left", function () {
                    _leftEngaged = false;
                });
            }
        });

        rightCollapseNode.bind("click", function () {
            if (!_rightEngaged) {
                _rightEngaged = true;
                _process(rightCollapseNode, _RIGHT_PANEL, "right", function () {
                    _rightEngaged = false;
                });
            }
        });
    }
};
