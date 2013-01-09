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

var event = require('ripple/event');

module.exports = function (appControl) {
    var _self, _appControl = appControl;

    _self = {
        replyResult: function (data) {
            event.trigger("appServiceReplied", "Result: " + data);
        },
        replyFailure: function () {
            event.trigger("appServiceReplied", "Failure");
        }
    };

    _self.__defineGetter__("appControl", function () {
        return _appControl;
    });

    return _self;
};
