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
    constants = require('ripple/constants'),
    deviceSettings = require('ripple/deviceSettings'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    _POWER_RESOURCE = constants.POWER_RESOURCE,
    _SCREEN_STATE = constants.POWER_RESOURCE.SCREEN.STATE,
    ScreenState = {"previous" : null, "current" : null},
    _listeners = [],
    _isScreenResourceOccupied = false,
    _originalBrightness,
    _isCPUAwake = false,
    _minimal_screen_state = null,
    _self;

/**initialize**/
function initState() {
    updateResourceState();
}

function getResourceState(value) {
    var state;
    value = Number(value);
    if (value ===  _SCREEN_STATE.SCREEN_OFF.MAX) {
        state = _SCREEN_STATE.SCREEN_OFF.NAME;
    } else if (value < _SCREEN_STATE.SCREEN_DIM.MAX) {
        state = _SCREEN_STATE.SCREEN_DIM.NAME;
    } else if (value < _SCREEN_STATE.SCREEN_NORMAL.MAX) {
        state = _SCREEN_STATE.SCREEN_NORMAL.NAME;
    } else {
        state = _SCREEN_STATE.SCREEN_BRIGHT.NAME;
    }
    return state;
}

function updateResourceState() {
    var brightness, actualState;
    brightness = deviceSettings.retrieve("DISPLAY.brightness");
    actualState = getResourceState(brightness);
    ScreenState.previous = ScreenState.current;
    ScreenState.current = actualState;
}

function callListeners(listeners, previousState, changedState) {
    listeners.forEach(function (listener) {
        setTimeout(function () {
            listener(previousState, changedState);
        }, 1);
    });
}

function triggerListenerCB(stateObj) {
    if (stateObj.previous !== stateObj.current) {
        callListeners(_listeners, stateObj.previous, stateObj.current);
    }
}

_self = {
    request: function (resource, state) {
        var brightness, value;
        if (typeof resource !== 'string' || typeof state !== 'string') {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }
        //Check resource
        if (!_POWER_RESOURCE.hasOwnProperty(resource)) {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
        //Check state
        if (!_POWER_RESOURCE[resource].STATE.hasOwnProperty(state)) {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
        // Exception check: SCREEN_OFF is a state cannot be requested
        if (resource === "SCREEN" && state === "SCREEN_OFF") {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
        switch (resource) {
        case "SCREEN" :
            _minimal_screen_state = state;
            brightness = deviceSettings.retrieve("DISPLAY.brightness");
            // brightness will chage automatically if the original value is out of the request range
            if (brightness <= _SCREEN_STATE[_minimal_screen_state].MIN) {
                if (!_isScreenResourceOccupied) {
                    _originalBrightness = brightness;
                    _isScreenResourceOccupied = true;
                }
                if (_minimal_screen_state === "SCREEN_BRIGHT") {
                    value = _SCREEN_STATE.SCREEN_BRIGHT.VALUE;
                } else {
                    value = _SCREEN_STATE.SCREEN_NORMAL.VALUE;
                }
                deviceSettings.persist("DISPLAY.brightness", value);
                event.trigger("DisplayBrightnessChangedByPower", [value]);
                updateResourceState();
                triggerListenerCB(ScreenState);
            }
            break;
        case "CPU" :
            _isCPUAwake = true;
            break;
        default:
            break;
        }
    },

    release: function (resource) {
        switch (resource) {
        case "SCREEN" :
            if (_isScreenResourceOccupied) {
                _isScreenResourceOccupied = false;
                deviceSettings.persist("DISPLAY.brightness", _originalBrightness);
                event.trigger("DisplayBrightnessChangedByPower", [_originalBrightness]);
                updateResourceState();
                triggerListenerCB(ScreenState);
            }
            _minimal_screen_state = null;
            break;
        case "CPU" :
            _isCPUAwake = false;
            break;
        default:
            if (typeof resource === "string") {
                throw (new WebAPIError(errorcode.INVALID_VALUES_ERR));
            } else  {
                throw (new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
            }
        }
    },

    setScreenStateChangeListener: function (listener) {
        tizen1_utils.validateArgumentType(listener, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        _listeners.push(listener);
    },

    unsetScreenStateChangeListener: function () {
        _listeners = [];
    },

    getScreenBrightness: function () {
        var brightness = deviceSettings.retrieve("DISPLAY.brightness");
        return brightness;
    },

    setScreenBrightness: function (brightness) {
        if (typeof brightness !== 'number') {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }
        if (brightness < 0 || brightness > 1) {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
        if (_minimal_screen_state) {
            if (brightness <= _SCREEN_STATE[_minimal_screen_state].MIN) {
                //system doesn't accept the value < minimal screen state
                return;
            }
        }
        if (!_isScreenResourceOccupied) {
            _originalBrightness = deviceSettings.retrieve("DISPLAY.brightness");
            _isScreenResourceOccupied = true;
        }
        deviceSettings.persist("DISPLAY.brightness", brightness);
        event.trigger("DisplayBrightnessChangedByPower", [brightness]);
        updateResourceState();
        triggerListenerCB(ScreenState);
    },

    isScreenOn: function () {
        var brightness = deviceSettings.retrieve("DISPLAY.brightness");
        return brightness !== 0 ? true : false;
    },

    restoreScreenBrightness: function () {
        if (_isScreenResourceOccupied) {
            _isScreenResourceOccupied = false;
            deviceSettings.persist("DISPLAY.brightness", _originalBrightness);
            event.trigger("DisplayBrightnessChangedByPower", [_originalBrightness]);
            updateResourceState();
            triggerListenerCB(ScreenState);
        }
    },

    turnScreenOn: function () {
        var brightness, actualState;
        brightness = deviceSettings.retrieve("DISPLAY.brightness");
        actualState = getResourceState(brightness);
        if (actualState !== "SCREEN_OFF") {
            return;
        }
        if (!_isScreenResourceOccupied) {
            _originalBrightness = deviceSettings.retrieve("DISPLAY.brightness");
            _isScreenResourceOccupied = true;
        }
        if (_minimal_screen_state === "SCREEN_BRIGHT") {
            brightness = _SCREEN_STATE.SCREEN_BRIGHT.VALUE;
        } else {
            brightness = _SCREEN_STATE.SCREEN_NORMAL.VALUE;
        }
        deviceSettings.persist("DISPLAY.brightness", brightness);
        event.trigger("DisplayBrightnessChangedByPower", [brightness]);
        updateResourceState();
        triggerListenerCB(ScreenState);
    },

    turnScreenOff: function () {
        var brightness, actualState;
        brightness = deviceSettings.retrieve("DISPLAY.brightness");
        actualState = getResourceState(brightness);
        if (actualState === "SCREEN_OFF") {
            return;
        }
        if (!_isScreenResourceOccupied) {
            _originalBrightness = deviceSettings.retrieve("DISPLAY.brightness");
            _isScreenResourceOccupied = true;
        }
        if (_minimal_screen_state) {
            return;
        }
        deviceSettings.persist("DISPLAY.brightness", 0);
        event.trigger("DisplayBrightnessChangedByPower", [0]);
        updateResourceState();
        triggerListenerCB(ScreenState);
    }
};

initState();
event.on("CpuLoadChanged", function (value) {
    var load;
    if (_isCPUAwake && Number(value) === 0) {
        load = _POWER_RESOURCE.CPU.STATE.CPU_AWAKE.DEFAULT_VALUE;
        deviceSettings.persist("CPU.load", load);
        event.trigger("CpuLoadChangedByPower", [load]);
    }
});
event.on("DisplayBrightnessChanged", function () {
    updateResourceState();
    triggerListenerCB(ScreenState);
});
///event.on("updatePowerRules", function (object) {
///    updatePowerRules(object.state, object.value);
///});
module.exports = _self;

