/*
 *  Copyright 2012 Intel Corporation.
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
    deviceSettings = require('ripple/deviceSettings'),
    constants = require('ripple/constants'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    emulatorBridge = require('ripple/emulatorBridge'),
    curPost,
    _self;

function isVibratorOn() {
    return deviceSettings.retrieve("Config.vibratingMode");
}

var vibrator = (function () {
    var vibratorPattern,
        isVibrating = false,
        runTime = 0,
        vibrateTimeout = null,
        MILLILSECONDS_OF_ONE_VIBRATION = 100,
        node = jQuery("#" + constants.COMMON.DEVICE_CONTAINER),
        movementIndex = 0,
        movement = [{ left: -10 }, { left: 0 }, { left: 10 }, { left: 0 },
                    {top: -10 }, { top: 0 }, {top: 10 }, { top: 0 }];

    function _clearTimeout() {
        if (vibrateTimeout) {
            clearInterval(vibrateTimeout);
            vibrateTimeout = null;        
        }
    }

    function stopVibrate() {
        isVibrating = false;
        _clearTimeout();
        node.css({left: 0, top: 0}, MILLILSECONDS_OF_ONE_VIBRATION);
    }
    
    function vibrate() {
        node.css(movement[movementIndex]);
        movementIndex = (movementIndex + 1) % 8;
    }
    
    function changePulse() {
        if (emulatorBridge.document().hidden) {
            return;
        }

        //run time
        runTime = runTime + MILLILSECONDS_OF_ONE_VIBRATION;
        if (curPost >= vibratorPattern.length) {
            setTimeout(stopVibrate, 1);
        }       
        if (runTime > vibratorPattern[curPost]) {
            curPost = curPost + 1;
            runTime = 0;
        } else {
            if ((curPost % 2) === 0) {
                vibrate();
            }
        }
    } 
  
    function startVibrate(_pattern) {
        if (!isVibratorOn()) 
            return;

        vibratorPattern = _pattern; 
        _clearTimeout();
        movementIndex = 0;      
        if (_pattern) {
            runTime = 0;
            vibrateTimeout = setInterval(changePulse, MILLILSECONDS_OF_ONE_VIBRATION);
        }    
        isVibrating = true;
    }
    
    return {
        isVibrating: isVibrating,
        startVibrate: startVibrate,
        stopVibrate: stopVibrate
    };
}());

_self = {
    vibrate: function () {
        var pattern = arguments[0],
            i; 

        // If vibrator is off, stop the vibration
        event.on("VibratingModeChanged", function (value) {
            if (value === false) {
                vibrator.stopVibrate();
            }
        });
        
        //1. If the hidden attribute [PAGE-VISIBILITY] is set to true, abort these steps.
        if (emulatorBridge.document().hidden) {
            return;
        }

        //2. Let pattern be the value of the first argument.                     
        if (!tizen1_utils.isValidArray(pattern)) {
            pattern |= 0;
        } else {
            for (i = 0; i < pattern.length; i++) {
                pattern[i] |= 0;
            }
        }

        //3. If pattern is 0, or an empty list, cancel the pre-existing instance of the processing vibration patterns algorithm, if any, and abort these steps.    
        if (pattern === 0 || (tizen1_utils.isValidArray(pattern) && pattern.length === 0)) {
            vibrator.stopVibrate();
            return;
        }
        
        //4. If pattern is a list, proceed to the next step. Otherwise run the following substeps:
        //a. Let list be an initially empty list, and add pattern to list.
        //b. Let pattern be list.       
        if (!tizen1_utils.isValidArray(pattern)) {
            pattern = [pattern];
        }

        //5. If any entry of pattern exceeds an implementation-dependent limit, then the user agent may throw a NotSupportedError exception and abort these steps.
              
        //6. If the length of pattern is even, then remove the last entry in pattern. 
        if (pattern.length % 2 === 0) {
            pattern.pop();
        }
        
        //7. Cancel the pre-existing instance of the processing vibration patterns algorithm, if any. 
        if (vibrator.isVibrating) {
            vibrator.stopVibrate();
        }

        curPost = 0;
        vibrator.startVibrate(pattern);
    }
}; 

module.exports = _self;
