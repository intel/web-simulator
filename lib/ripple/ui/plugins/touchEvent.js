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

var event = require('ripple/event'),
    db = require('ripple/db'),
    constants = require('ripple/constants'),
    colors  = ["red", "green", "magenta", "blue", "yellow"],
    Point,
    intervalId,
    moveEvents  = {},
    currentIndex = 0,
    enlargeRatio = 4;

function _exec(operation) {
    var canvas = document.getElementById(constants.TOUCHEVENT.CANVAS),
        cxt = canvas.getContext("2d"),
        altKey = document.getElementById(constants.TOUCHEVENT.ALTKEY),
        metaKey = document.getElementById(constants.TOUCHEVENT.METAKEY),
        ctrlKey = document.getElementById(constants.TOUCHEVENT.CTRLKEY),
        shiftKey = document.getElementById(constants.TOUCHEVENT.SHIFTKEY),
        key, eventType;

    if (operation === "start") {
        altKey.disabled = 'disabled';
        metaKey.disabled = 'disabled';
        ctrlKey.disabled = 'disabled';
        shiftKey.disabled = 'disabled';
        clearInterval(intervalId);
        currentIndex = 0;
        eventType = "touchEvent";
    } else if (operation === "cancel") {
        altKey.disabled = '';
        metaKey.disabled = '';
        ctrlKey.disabled = '';
        shiftKey.disabled = '';
        altKey.checked = false;
        metaKey.checked = false;
        ctrlKey.checked = false;
        shiftKey.checked = false;
        cxt.clearRect(0, 0, canvas.width, canvas.height);
        moveEvents = {};
        eventType = "touchCancel";
    }

    event.trigger(eventType, [{
        data : moveEvents,
        keys : [altKey.checked, metaKey.checked, ctrlKey.checked, shiftKey.checked]
    }]);
}

Point = function (x, y, color, isDragging) {
    var _self = {};

    _self.x = x;
    _self.y = y;
    _self.color = color;
    _self.isDragging = isDragging;

    return _self;
};

module.exports = {
    panel: {
        domId: "touchEvent-container",
        collapsed: true,
        pane: "left"
    },

    initialize: function () {
        var deviceInfo = require('ripple/devices').getCurrentDevice(),
            canvas = document.getElementById(constants.TOUCHEVENT.CANVAS),
            cxt = canvas.getContext("2d"),
            points = [],
            paint = false,
            currentPoint = {};

        function drawPoints() {
            var key, index, points = [], point;

            for (key in moveEvents) {
                points = moveEvents[key];
                cxt.fillStyle = colors[key];

                for (index = 0; index < points.length; index++) {
                    point = points[index];
                    cxt.beginPath();
                    cxt.arc(point.offsetX, point.offsetY, 5, 0, 2 * Math.PI, 1);
                    cxt.fill();
                }
            }
        }

        function endDraw(event) {
            if (paint) {
                paint = false;
                clearInterval(intervalId);
                moveEvents[currentIndex].push(event);
                drawPoints();

                currentIndex++;
                if (currentIndex === 5)
                    currentIndex = 0;
            }
        }

        canvas.addEventListener("mousedown", function (event) {
            moveEvents[currentIndex] = [];
            currentPoint = event;
            moveEvents[currentIndex].push(event);
            paint = true;
            drawPoints();
            intervalId = setInterval(function () {
                moveEvents[currentIndex].push(currentPoint);
            }, 100);
        });

        canvas.addEventListener("mousemove", function (event) {
            if (paint) {
                currentPoint = event;
                drawPoints();
            }
        });

        canvas.addEventListener("mouseup", endDraw);
        canvas.addEventListener("mouseout", endDraw);
        canvas.addEventListener("mouseleave", endDraw);

        document.getElementById(constants.TOUCHEVENT.OPTION).addEventListener("click", function () {
            if (!moveEvents[0])
                return;

            if (this.value === "Touch Start") {
                this.value = "Touch Cancel";
                _exec("start");
            } else if (this.value === "Touch Cancel") {
                this.value = "Touch Start";
                _exec("cancel");
            }
        }, false);

        canvas.width = deviceInfo.screen.width / enlargeRatio;
        canvas.height = deviceInfo.screen.height / enlargeRatio;
    }
};
