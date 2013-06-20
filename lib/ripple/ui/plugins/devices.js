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
    db = require('ripple/db'),
    resizer = require('ripple/resizer');

function _getTextZooming(zooming) {
    return zooming + '%';
}

module.exports = {
    panel: {
        domId: "devices-container",
        collapsed: true,
        pane: "left",
        titleName: "Orientation and Zooming",
        display: true
    },

    initialize: function () {
        var zooming = document.getElementById(constants.ENCAPSULATOR.ZOOMING);
        function updateZoomingValues() {
            var zoomingText, scaleFactor;

            zoomingText = _getTextZooming(zooming.value);
            jQuery('#screen-zooming-label').html(zoomingText);

            // Zooming device skin
            scaleFactor = zooming.value / 100;
            resizer.scaleDevice(scaleFactor);
        }

        function initializeValues() {
            var zoomingValue =  db.retrieve(constants.ENCAPSULATOR.ZOOMING);

            if (!zoomingValue) {
                zoomingValue = 100;
            }
            jQuery("#" + constants.ENCAPSULATOR.ZOOMING).val(zoomingValue);
            updateZoomingValues();
        }

        jQuery("#" + constants.ENCAPSULATOR.ZOOMING).bind("change", function () {
            updateZoomingValues();
            db.save(constants.ENCAPSULATOR.ZOOMING, zooming.value);
        });

        initializeValues();
    }
};

