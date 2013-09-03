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

var t = require('ripple/platform/tizen/2.0/typedef'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce');

module.exports = function (mainText, subText) {
    var _self = this, _mainText = undefined;

    _self.__defineGetter__("mainText", function () {
        return _mainText;
    });

    _self.__defineSetter__("mainText", function (mainText) {
        if (!(new TypeCoerce(t.DOMString)).match(mainText))
            return;

        _mainText = mainText;
    });

    _self.mainText = mainText;
    _self.subText = subText || undefined;

    return _self;
};
