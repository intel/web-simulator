/*
 *  Copyright 2011 Intel Corporation.
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

var notifications = require('ripple/notifications'),
    constants = require('ripple/constants'),
    PendingOperation = require('ripple/platform/wac/2.0/pendingoperation'),
    PendingObject = require('ripple/platform/wac/2.0/pendingObject'),
    DeviceApiError = require('ripple/platform/wac/2.0/deviceapierror'),
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    utils = require('ripple/utils'),
    event = require('ripple/event'),
    deviceSettings = require('ripple/deviceSettings'),
    wac2_utils = require('ripple/platform/wac/2.0/wac2_utils'),
    _self,
    NOTIFY_DURATION_LIMIT = 5000;

function pendingOperation(f) {
    var _FAKEWAITTIME = 0,
        pendingObj;
    
    if (_FAKEWAITTIME === 0) {
        f();
        return undefined;
    }
    else {
        pendingObj = new PendingObject();
        pendingObj.pendingID = setTimeout(function () {
            pendingObj.setCancelFlag(false);
            f();
        }, _FAKEWAITTIME);
        return new PendingOperation(pendingObj);
    }
}

function checkDuration(duration) {
    if (duration) {
        duration = duration | 0;  
        if (duration <= 0 || duration > NOTIFY_DURATION_LIMIT) {
            return NOTIFY_DURATION_LIMIT;
        } else {
            return duration;
        }
    } else {
        return NOTIFY_DURATION_LIMIT;
    }
}

function isMute() {
    return deviceSettings.retrieve("Config.soundVolume") <= 0;
}

function isInVibrateMode() {
    return deviceSettings.retrieve("Config.vibratingMode");
}

function isBacklightOn() {
    return deviceSettings.retrieve("Config.backlight");
}

var vibrator = (function () {
    var isVibrating = false,
        terminateAfterPattern = false,
        pattern = null,
        pulseIndex = 0,
        vibrateTimeout = null,
        terminateTimeout = null,
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
        if (terminateTimeout) {
            clearTimeout(terminateTimeout);
            terminateTimeout = null;        
        }
    }  
    
    function stopVibrate() {
        isVibrating = false;
        _clearTimeout();
        node.css({left: 0, top: 0}, MILLILSECONDS_OF_ONE_VIBRATION);
    }
    
    function vibrate() {
        //node.animate(movement[movementIndex], MILLILSECONDS_OF_ONE_VIBRATION);
        node.css(movement[movementIndex]);
        movementIndex = (movementIndex + 1) % 8;
    }
    
    function changePulse() {
        //pattern != null
        var pulse = pattern[pulseIndex];
        if (pulse === '.') vibrate();
        ++pulseIndex;
        if (pulseIndex >= pattern.length) {
            if (terminateAfterPattern) {
                setTimeout(stopVibrate, 1);
                return;
            }
            pulseIndex = 0;
        }
    }
    
    function terminateVibrate() {
        terminateAfterPattern = true;
        terminateTimeout = null;
        if (pattern === null) {
            stopVibrate();        
        }
    }  
  
    function startVibrate(duration, _pattern) {
        if (!isInVibrateMode()) return;
        _clearTimeout();
        terminateAfterPattern = false;
        movementIndex = 0;
        
        if (_pattern) {
            pattern = _pattern;
            pulseIndex = 0;
            vibrateTimeout = setInterval(changePulse, MILLILSECONDS_OF_ONE_VIBRATION);
            if (duration) 
                terminateAfterPattern = false;
            else 
                terminateAfterPattern = true;
        } else {
            pattern = null;
            vibrateTimeout = setInterval(vibrate, MILLILSECONDS_OF_ONE_VIBRATION);
        }
        terminateTimeout = setTimeout(terminateVibrate, checkDuration(duration));        
        isVibrating = true;
    }

    event.on("VibratingModeChanged", function (value) {
        if (value === false) {
            stopVibrate();
        }
    });

    return {
        startVibrate: startVibrate,
        stopVibrate: stopVibrate
    };
}()); //jslint style

var backlight = (function () {
    var timeout = null,
        isNotifying = false,
        node = jQuery("#" + constants.COMMON.VIEWPORT_CONTAINER);
        
    function _clearTimeout() {
        if (timeout) {
            clearTimeout(timeout); 
            timeout = null;
        }
    }
    
    function _switch(on) {
        node.css('opacity', on ? '':'0.4');
    }
    
    function switchOff() {
        if (!isNotifying) return;
        _clearTimeout();
        _switch(false);
        isNotifying = false;
    }
    
    function switchOn(duration) {
        if (isBacklightOn()) return;
        _clearTimeout();
        _switch(true);
        timeout = setTimeout(switchOff, checkDuration(duration));
        isNotifying = true;
    }

    _switch(isBacklightOn());
    event.on("BacklightChanged", function (value) {
        _clearTimeout();
        isNotifying = false;
        _switch(value);
    });

    return {
        switchOn  : switchOn,
        switchOff : switchOff
    };
}()); //jslint style

var beeper = (function () {
    var isBeeping = false,
        timeout = null,
        beepFile = "beep.wav", //TODO: license issues
        errorHandler = null,
        _beeper = utils.createElement("audio", {"id": "notify-beeper"});
        
    document.getElementById("ui").appendChild(_beeper);
    _beeper.setAttribute("src", beepFile);
    _beeper.setAttribute("loop", "true");
    _beeper.load();
    
    function _clearTimeout() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = false;
        }
    }
    
    function raiseError() {
        if (errorHandler) {
            setTimeout(function () {
                errorHandler(new DeviceApiError(errorcode.UNKNOWN_ERR));
            }, 1);
        }
    }
    
    function stopBeep() {
        _clearTimeout();
        if (isBeeping) {
            try {
                _beeper.pause();
            } catch (e) {}
            isBeeping = false;
        }
    }
    
    _beeper.addEventListener('error', function () {
        stopBeep();
        raiseError();
    });
   
    function startBeep(onSuccess, onError, duration) {
        errorHandler = onError;
        try {
            stopBeep();
            _beeper.currentTime = 0;
            _beeper.play();
            isBeeping = true;
            timeout = setTimeout(stopBeep, checkDuration(duration));
            setTimeout(function () {
                onSuccess();
            }, 1);
        }catch (e) {
            raiseError();
        }
    }
    
    event.on("VolumeChanged", function (value) {
        value = value | 0;
        if (value < 0) value = 0;
        else if (value > 100) value = 100;       
        _beeper.volume = value / 100.0;
    });
    
    return {
        startBeep : startBeep,
        stopBeep  : stopBeep
    };
}()); //jslint style

module.exports = _self = {

    startNotify : function (onSuccess, onError, duration) {
        return wac2_utils.validateTypeMismatch(onSuccess, onError, "startNotify", function () {
            if (!isMute()) {
                return pendingOperation(function () {
                    beeper.startBeep(onSuccess, onError, duration);
                });
            } else if (isInVibrateMode()) {
                return _self.startVibrate(onSuccess, onError, duration);
            } else {
                return _self.lightOn(onSuccess, onError, duration);
            }
        });
    },

    stopNotify : function () {
        beeper.stopBeep();
        vibrator.stopVibrate();
        backlight.switchOff();
    },

    startVibrate : function (onSuccess, onError, duration, pattern) {       
        return wac2_utils.validateTypeMismatch(onSuccess, onError, "startVibrate", function () {
            if (pattern) {
                pattern = String(pattern);
                if (!pattern.match(/[\._]{1,10}/)) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }   
            }
            
            if (!isInVibrateMode()) {
                if (onError) {
                    setTimeout(function () {
                        onError(new DeviceApiError(errorcode.UNKNOWN_ERR));
                    }, 1);
                }
                return undefined;          
            }
  
            setTimeout(function () {
                onSuccess();
            }, 1);
            return pendingOperation(function () {
                vibrator.startVibrate(duration, pattern);
            });

        });
    },
    
    stopVibrate : function () {
        vibrator.stopVibrate();
    },

    lightOn : function (onSuccess, onError, duration) {
        return wac2_utils.validateTypeMismatch(onSuccess, onError, "lightOn", function () {
            if (isBacklightOn()) {
                if (onError) {
                    setTimeout(function () {
                        onError(new DeviceApiError(errorcode.UNKNOWN_ERR));
                    }, 1);
                }
                return undefined;               
            }
        
            setTimeout(function () {
                onSuccess();
            }, 1);
            return pendingOperation(function () {
                backlight.switchOn(duration);
            });
        });
    },

    lightOff : function () {
        backlight.switchOff();
    },

    setWallpaper : function (onSuccess, onError, fileName) {
        //TODO: file name, existance, extension checking.
        return wac2_utils.validateTypeMismatch(onSuccess, onError, "setWallpaper", function () {
            return pendingOperation(function () {
                notifications.openNotification("normal", "setWallpaper:" + fileName);
                setTimeout(function () {
                    onSuccess();
                }, 1);
            });
        });
    }
};

