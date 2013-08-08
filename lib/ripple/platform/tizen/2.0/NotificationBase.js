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

module.exports = function (_title) {
    var id = null,
        type = "STATUS",
        postedTime = null,
        title = _title,
        content,
        _self = this;

    _self.__defineGetter__("id", function () {
        return id;
    });
    _self.__defineGetter__("type", function () {
        return type;
    });
    _self.__defineGetter__("postedTime", function () {
        return postedTime;
    });
    _self.__defineGetter__("title", function () {
        return title;
    });
    _self.__defineSetter__("title", function (_title) {
        title = _title;
    });
    _self.__defineGetter__("content", function () {
        return content;
    });
    _self.__defineSetter__("content", function (_content) {
        content = _content;
    });

    return _self;
};
