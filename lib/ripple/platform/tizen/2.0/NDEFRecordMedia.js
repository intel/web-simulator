/*
 *  Copyright 2012 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use _self file except in compliance with the License.
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

var NDEFRecord = require('ripple/platform/tizen/2.0/NDEFRecord');

module.exports = function (mimeType, data) {
    var _self = {},
        _mimeType = mimeType,
        _data = data;

    _self = new NDEFRecord(2, [], [], []);

    _self.__defineGetter__("mimeType", function () {
        return _mimeType;
    });

    _self.__defineGetter__("data", function () {
        return _data;
    });
    return _self;
};
