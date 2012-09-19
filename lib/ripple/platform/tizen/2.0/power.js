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
    utils = require('ripple/utils'),
    constants = require('ripple/constants'),
    deviceSettings = require('ripple/deviceSettings'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    PowerStateRequest = require('ripple/platform/tizen/2.0/PowerStateRequest'),
    _RULES = constants.POWER_RULES,// Rule Allow: true; Deny false
    _POWER_RESOURCE = constants.POWER_RESOURCE,
    _CPU_STATE = constants.POWER_RESOURCE.CPU.STATE,
    _DISPLAY_STATE = constants.POWER_RESOURCE.DISPLAY.STATE,
    cpuState = {"previous" : null, "current" : null},
    displayState = {"previous" : null, "current" : null},
    _PORWER_RULES_KEY = "tizen1-db-power-role",
    _cpuListener = {
        "LOW" : [],
        "HIGH" : []
    },
    _displayListener = {
        "OFF" : [],
        "DIM" : [],
        "NORMAL" : [],
        "BRIGHT" : []
    },
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

function getResourceState(resource, value) {
    var state;
    value = Number(value);
    switch (resource) {
    case "CPU" :
        if (value <= _CPU_STATE.LOW.MAX) {
            state = _CPU_STATE.LOW.NAME;//LOW
        } else {
            state = _CPU_STATE.HIGH.NAME;
        }
        break;
    case "DISPLAY" :
        if (value ===  _DISPLAY_STATE.OFF.MAX) {
            state = _DISPLAY_STATE.OFF.NAME;
        } else if (value <= _DISPLAY_STATE.DIM.MAX) {
            state = _DISPLAY_STATE.DIM.NAME;
        } else if (value <= _DISPLAY_STATE.NORMAL.MAX) {
            state = _DISPLAY_STATE.NORMAL.NAME;
        } else {
            state = _DISPLAY_STATE.BRIGHT.NAME;
        }
        break;
    default:
        break;
    }
    return state;
}

function updateResourceState() {
    var load, brightness, actualState;
    // Init CPU state
    load = deviceSettings.retrieve("Cpu.load");
    actualState = getResourceState("CPU", load);
    cpuState.previous = cpuState.current;
    cpuState.current = actualState;
    // Init DISPLAY state
    brightness = deviceSettings.retrieve("Display.brightness");
    actualState = getResourceState("DISPLAY", brightness);
    displayState.previous = displayState.current;
    displayState.current = actualState;
}

function callListeners(listeners, resource, actualState, requestState) {
    if (listeners.length === 0) {
        return;
    }
    listeners.forEach(function (listener) {
        setTimeout(function () {
            listener(resource, actualState, requestState);
        }, 1);
    });
}

function findListenerCB(resource, value, stateObj) {
    var i, listeners, actualState = getResourceState(resource, value);
    listeners = (resource === "CPU" ? _cpuListener : _displayListener);
    if (!stateObj.previous) {
        return;
    }
    if (stateObj.previous !== stateObj.current) {
        callListeners(listeners[stateObj.previous], resource, actualState, stateObj.previous);
        callListeners(listeners[stateObj.current], resource, actualState, stateObj.current);
    }
}

function saveListenerCB(resource, state, listener) {
    if (listener) {
        switch (resource) {
        case "CPU" :
            _cpuListener[state].push(listener);
            break;
        case "DISPLAY" :
            _displayListener[state].push(listener);
            break;
        default:
            break;
        }
    }
}

_self = {
    request: function (request, successCB, errorCB, listener) {
        var resource, state, value, actualState;
        //Check all parameters.
        tizen1_utils.validateCallbackType(listener);
        tizen1_utils.validateCallbackType(successCB, errorCB);
        if (!request || !request.resource || !request.minimalState) {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
        resource = request.resource;
        state = request.minimalState;
        //Check resource
        if (!_POWER_RESOURCE.hasOwnProperty(resource)) {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
        //Check state
        if (!_POWER_RESOURCE[resource].STATE.hasOwnProperty(state)) {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
        saveListenerCB(resource, state, listener);
        //Check the state rule
        if (!_RULES[state]) {//Deny
            actualState = resource === "CPU" ? cpuState : displayState;
            if (errorCB) {
                setTimeout(function () {
                    errorCB(new WebAPIError(errorcode.NOT_SUPPORTED_ERR));
                }, 1);
            }
            if (listener) {
                setTimeout(function () {
                    listener(resource, actualState.current, state);
                }, 1);
            }
            return;
        }
        switch (resource) {
        case "CPU" :
            value = _CPU_STATE[state].VALUE;// Update Cpu.load.
            deviceSettings.persist("Cpu.load", value);
            updateResourceState();
            findListenerCB('CPU', value, cpuState);
            event.trigger("CpuLoadChangedByPower", [value]);
            break;
        case "DISPLAY" :
            value = _DISPLAY_STATE[state].VALUE;// Update Display.brightness.
            deviceSettings.persist("Display.brightness", value);
            updateResourceState();
            findListenerCB("DISPLAY", value, displayState);
            event.trigger("DisplayBrightnessChangedByPower", [value]);
            break;
        default:
            break;
        }
        if (successCB) {//SuccessCallback
            setTimeout(function () {
                successCB();
            }, 1);
        }
        
    },

    release: function (resource) {
        switch (resource) {
        case "CPU" :
            _cpuListener.LOW = [];
            _cpuListener.HIGH = [];
            break;
        case "DISPLAY" :
            _displayListener.OFF = [];
            _displayListener.DIM = [];
            _displayListener.NORMAL = [];
            _displayListener.BRIGHT = [];
            break;
        default:
            throw (new WebAPIError(errorcode.INVALID_VALUES_ERR));
        }
    }
};

initState();
event.on("CpuLoadChanged", function (value) {
    updateResourceState();
    findListenerCB('CPU', value, cpuState);
});
event.on("DisplayBrightnessChanged", function (value) {
    updateResourceState();
    findListenerCB("DISPLAY", value, displayState);
});
event.on("updatePowerRules", function (object) {
    updatePowerRules(object.state, object.value);
});
module.exports = _self;

