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

var event = require('ripple/event');

module.exports = {
    panel: {
        domId: "motion-container",
        collapsed: true,
        pane: "right",
        titleName: "Motion Information",
        display: false
    },

    initialize: function () {
        event.on("wearable-motion-pedometer-data", function (data) {
            var key, value, className;
            
            for (key in data) {
                className = "motion-data-" + key;
                value = data[key];
                
                jQuery("#motion-data ." + className).html(value);
            }
        });
    }
};
