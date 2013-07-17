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

module.exports = function (id, name, iconPath, version, show, categories, installDate, size, packageId) {
    var _self = this;

    _self.__defineGetter__("id", function () {
        return id;
    });
    _self.__defineGetter__("name", function () {
        return name;
    });
    _self.__defineGetter__("iconPath", function () {
        return iconPath;
    });
    _self.__defineGetter__("version", function () {
        return version;
    });
    _self.__defineGetter__("show", function () {
        return show;
    });
    _self.__defineGetter__("categories", function () {
        return categories;
    });
    _self.__defineGetter__("installDate", function () {
        return installDate;
    });
    _self.__defineGetter__("size", function () {
        return size;
    });
    _self.__defineGetter__("packageId", function () {
        return packageId;
    });

    return _self;
};
