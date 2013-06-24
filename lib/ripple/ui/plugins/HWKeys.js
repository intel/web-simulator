/*
 *  Copyright 2012 Intel Corporation
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

var db = require('ripple/db'),
    event = require('ripple/event');


function initHWKey() {
    var left = 0,
        orientation = db.retrieve('deviceOrientation'),
        scaleFactor = db.retrieve('deviceScaleFactor');

    if (orientation === 'portrait') {
        if (db.retrieve("layout") === "portrait") {
            left = 350 + $('#device-layout').width()*scaleFactor;
        } else {
            left = 470 + $('#device-layout').height()*scaleFactor;
        }
    } else {
        if (db.retrieve("layout") === "portrait") {
            left = 490 + $('#device-layout').height()*scaleFactor;
        } else {
            left = 350 + $('#device-layout').width()*scaleFactor;
        }
    }

    $("#hwkeys-panel").css("top", "40px");
    $("#hwkeys-panel").css("left", left+"px");
    $("#hwkeys-panel").draggable({ cursor: 'move', containment: [0, 52, 1480, 800]});

    jQuery("#hwkey-menu-btn").bind("click", function () {
        event.trigger("tizenhwkeyEvent", ["menu"], true);
    });
    jQuery("#hwkey-back-btn").bind("click", function () {
        event.trigger("tizenhwkeyEvent", ["back"], true);
    });
}

module.exports = {
    initialize: function () {
        initHWKey();
    }
};
