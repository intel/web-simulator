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

var speech_Recognition;

function SpeechRecognition () {
    var _listener;

    if ('webkitSpeechRecognition' in window) {
        var recognition = new webkitSpeechRecognition();
    }

    this.startRecognition = function (listener) {
        _listener = listener;

        try {
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onerror = function(event) {
                console.log(event.error);
            };

            recognition.onresult = function(event) {
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        if (event.results[i][0].transcript !== null) {
                            _listener(event.results[i][0].transcript.toLowerCase());
                        }
                    }
                }
            };

            recognition.start();
        } catch (e) {
            console.error('[Speech-E]: Internal error: ' + e.name);
        }
    }

    this.stopRecognition = function () {
        recognition.stop();
    }
};

module.exports = SpeechRecognition;
