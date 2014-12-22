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
    t = require('ripple/platform/tizen/2.0/typecast'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    _POWER_RESOURCE = constants.POWER_RESOURCE,
    _SCREEN_STATE = constants.POWER_RESOURCE.SCREEN.STATE,
    ScreenState = {"previous" : null, "current" : null},
    _listeners = [],
    _isScreenResourceOccupied = false,
    _originalBrightness,
    _isCPUAwake = false,
    _isScreenOn = true,
    _normalBrightness,
    _minimal_screen_state = null,
    _security = {
        "http://tizen.org/privilege/power": ["request", "setScreenBrightness", "turnScreenOn", "turnScreenOff"]
    },
    _self;

/**initialize**/
function initState() {
    _normalBrightness = deviceSettings.retrieve("DISPLAY.brightness");
    updateResourceState();
}

function getResourceState(value) {
    var state;
    value = Number(value);
    if (value <=  _SCREEN_STATE.SCREEN_OFF.MAX) {
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

_self = function () {
    function request(resource, state) {
        if (!_security.request) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.PowerManager("request", arguments);

        //Check state
        if (!_POWER_RESOURCE[resource].STATE.hasOwnProperty(state)) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        // Exception check: SCREEN_OFF is a state cannot be requested
        if (resource === "SCREEN" && state === "SCREEN_OFF") {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        switch (resource) {
        case "SCREEN" :
            if ((_minimal_screen_state === null) ||
               (_minimal_screen_state === "SCREEN_DIM" && (state === "SCREEN_NORMAL" || state === "SCREEN_BRIGHT")) ||
               (_minimal_screen_state === "SCREEN_NORMAL" && state === "SCREEN_BRIGHT")) {
                _minimal_screen_state = state;
            }
            break;
        case "CPU" :
            _isCPUAwake = true;
            break;
        default:
            break;
        }
    }

    function release(resource) {
        t.PowerManager("release", arguments);

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
        }
    }

    function setScreenStateChangeListener(listener) {
        t.PowerManager("setScreenStateChangeListener", arguments);

        _listeners.push(listener);
    }

    function unsetScreenStateChangeListener() {
        _listeners = [];
    }

    function getScreenBrightness() {
        var brightness = deviceSettings.retrieve("DISPLAY.brightness");
        return brightness;
    }

    function setScreenBrightness(brightness) {
        if (!_security.setScreenBrightness) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.PowerManager("setScreenBrightness", arguments);

        if (brightness < 0 || brightness > 1) {
            throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
        }
        if (!_isScreenResourceOccupied) {
            _originalBrightness = deviceSettings.retrieve("DISPLAY.brightness");
            _isScreenResourceOccupied = true;
        }
        deviceSettings.persist("DISPLAY.brightness", brightness);
        event.trigger("DisplayBrightnessChangedByPower", [brightness]);
        updateResourceState();
        triggerListenerCB(ScreenState);
    }

    function isScreenOn() {
        return _isScreenOn;
    }

    function restoreScreenBrightness() {
        if (_isScreenResourceOccupied) {
            _isScreenResourceOccupied = false;
            deviceSettings.persist("DISPLAY.brightness", _originalBrightness);
            event.trigger("DisplayBrightnessChangedByPower", [_originalBrightness]);
            updateResourceState();
            triggerListenerCB(ScreenState);
        }
    }

    function turnScreenOn() {
        var brightness, value, flag = false;
        if (!_security.turnScreenOn) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        brightness = deviceSettings.retrieve("DISPLAY.brightness");
        switch (_minimal_screen_state) {
        case "SCREEN_DIM":
            if (brightness <= _SCREEN_STATE.SCREEN_OFF.VALUE) {
                if (!_isScreenResourceOccupied) {
                    _originalBrightness = brightness;
                    _isScreenResourceOccupied = true;
                }
                value = _SCREEN_STATE.SCREEN_DIM.VALUE;
                flag = true;
            }
            break;
        case "SCREEN_NORMAL":
            if (brightness < _SCREEN_STATE.SCREEN_NORMAL.MIN) {
                if (!_isScreenResourceOccupied) {
                    _originalBrightness = brightness;
                    _isScreenResourceOccupied = true;
                }
                value = _normalBrightness;
                flag = true;
            }
            break;
        case "SCREEN_BRIGHT":
            if (brightness < _SCREEN_STATE.SCREEN_BRIGHT.MIN) {
                if (!_isScreenResourceOccupied) {
                    _originalBrightness = brightness;
                    _isScreenResourceOccupied = true;
                }
                value = _SCREEN_STATE.SCREEN_BRIGHT.VALUE;
                flag = true;
            }
            break;
        }
        if (flag) {
            deviceSettings.persist("DISPLAY.brightness", value);
            event.trigger("DisplayBrightnessChangedByPower", [value]);
            updateResourceState();
            triggerListenerCB(ScreenState);
        }
        _isScreenOn = true;
    }

    function turnScreenOff() {
        if (!_security.turnScreenOff) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        _isScreenOn = false;
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    var power = {
        request: request,
        release: release,
        setScreenStateChangeListener: setScreenStateChangeListener,
        unsetScreenStateChangeListener: unsetScreenStateChangeListener,
        getScreenBrightness: getScreenBrightness,
        setScreenBrightness: setScreenBrightness,
        isScreenOn: isScreenOn,
        restoreScreenBrightness: restoreScreenBrightness,
        turnScreenOn: turnScreenOn,
        turnScreenOff: turnScreenOff,
        handleSubFeatures : handleSubFeatures
    };

    return power;
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
    _normalBrightness = deviceSettings.retrieve("DISPLAY.brightness");
    updateResourceState();
    triggerListenerCB(ScreenState);
});

module.exports = _self;
