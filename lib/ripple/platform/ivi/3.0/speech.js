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

var t = require('ripple/platform/ivi/3.0/typecast'),
    _security = {
        "http://tizen.org/privilege/speech": []
    },
    _self;

function _initialize () {
}

_self = function () {
    var speech;

    function vocalizeString (speakString) {
        t.SpeechManager("vocalizeString", arguments);

        meSpeak.speak(speakString);
    }

    function handleSubFeatures (subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    speech = {
        vocalizeString: vocalizeString,
        handleSubFeatures: handleSubFeatures
    };

    return speech;
};

_initialize();

module.exports = _self;
