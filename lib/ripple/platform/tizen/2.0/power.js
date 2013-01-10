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
var db = require('ripple/db'),
    event = require('ripple/event'),
    constants = require('ripple/constants'),
    deviceSettings = require('ripple/deviceSettings'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    _RULES = constants.POWER_RULES,// Rule Allow: true; Deny false
    _POWER_RESOURCE = constants.POWER_RESOURCE,
    _SCREEN_STATE = constants.POWER_RESOURCE.SCREEN.STATE,
    ScreenState = {"previous" : null, "current" : null},
    _PORWER_RULES_KEY = "tizen1-db-power-role",
    _listeners = [],
    _isScreenResourceOccupied = false,
    _originalBrightness,
    _isCPUAwake = false,
    _self;

/**initialize**/
function initState() {
    var dbRules;
    //Init power rules.
    dbRules = db.retrieveObject(_PORWER_RULES_KEY);
    _RULES =  dbRules && _RULES ? dbRules : _RULES;
    event.trigger("initPowerDB", [_RULES]);
    //Init power state.
    updateResourceState();
}

function updatePowerRules(state, value) {
    _RULES[state] = value;
    db.saveObject(_PORWER_RULES_KEY, _RULES);
}

function getResourceState(value) {
    var state;
    value = Number(value);
    if (value ===  _SCREEN_STATE.SCREEN_OFF.MAX) {
        state = _SCREEN_STATE.SCREEN_OFF.NAME;
    } else if (value <= _SCREEN_STATE.SCREEN_DIM.MAX) {
        state = _SCREEN_STATE.SCREEN_DIM.NAME;
    } else if (value <= _SCREEN_STATE.SCREEN_NORMAL.MAX) {
        state = _SCREEN_STATE.SCREEN_NORMAL.NAME;
    } else {
        state = _SCREEN_STATE.SCREEN_BRIGHT.NAME;
    }
    return state;
}

function updateResourceState() {
    var brightness, actualState;
    brightness = deviceSettings.retrieve("Display.brightness");
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

function findListenerCB(stateObj) {
    if (stateObj.previous !== stateObj.current) {
        callListeners(_listeners, stateObj.previous, stateObj.current);
    }
}

_self = {
    request: function (resource, state) {
        var value;
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
        //Check the state rule
        if (!_RULES[state]) {
            return;
        }
        switch (resource) {
        case "SCREEN" :
            if (!_isScreenResourceOccupied) {
                _originalBrightness = deviceSettings.retrieve("Display.brightness");
                _isScreenResourceOccupied = true;
            }
            value = _SCREEN_STATE[state].VALUE;
            deviceSettings.persist("Display.brightness", value);
            updateResourceState();
            findListenerCB(ScreenState);
            event.trigger("DisplayBrightnessChangedByPower", [value]);
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
                deviceSettings.persist("Display.brightness", _originalBrightness);
                updateResourceState();
                findListenerCB(ScreenState);
                event.trigger("DisplayBrightnessChangedByPower", [_originalBrightness]);
            }
            break;
        case "CPU" :
            _isCPUAwake = false;
            break;
        default:
            throw (new WebAPIError(errorcode.INVALID_VALUES_ERR));
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
        var brightness = deviceSettings.retrieve("Display.brightness");
        return brightness;
    },

    setScreenBrightness: function (brightness) {
        if (typeof brightness !== 'number') {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }
        if (brightness < 0 || brightness > 1) {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
        deviceSettings.persist("Display.brightness", brightness);
        updateResourceState();
        findListenerCB(ScreenState);
        event.trigger("DisplayBrightnessChangedByPower", [brightness]);
    },

    isScreenOn: function () {
        return ScreenState.current !== "SCREEN_OFF" ? true : false;
    },

    restoreScreenBrightness: function () {
        if (_isScreenResourceOccupied) {
            _isScreenResourceOccupied = false;
            deviceSettings.persist("Display.brightness", _originalBrightness);
            updateResourceState();
            findListenerCB(ScreenState);
            event.trigger("DisplayBrightnessChangedByPower", [_originalBrightness]);
        }
    },

    turnScreenOn: function () {
        var brightness, actualState;
        brightness = deviceSettings.retrieve("Display.brightness");
        actualState = getResourceState(brightness);
        if (actualState !== "SCREEN_OFF") {
            return;
        }
        this.request("SCREEN", "SCREEN_NORMAL");
    },

    turnScreenOff: function () {
        var brightness, actualState;
        brightness = deviceSettings.retrieve("Display.brightness");
        actualState = getResourceState(brightness);
        if (actualState === "SCREEN_OFF") {
            return;
        }
        this.request("SCREEN", "SCREEN_OFF");
    }
};

initState();
event.on("CpuLoadChanged", function (value) {
    var load;
    if (_isCPUAwake && Number(value) === 0) {
        load = _POWER_RESOURCE.CPU.STATE.CPU_AWAKE.DEFAULT_VALUE;
        deviceSettings.persist("Cpu.load", load);
        event.trigger("CpuLoadChangedByPower", [load]);
    }
});
event.on("DisplayBrightnessChanged", function () {
    updateResourceState();
    findListenerCB(ScreenState);
});
event.on("updatePowerRules", function (object) {
    updatePowerRules(object.state, object.value);
});
module.exports = _self;

