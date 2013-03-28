/*
 *  Copyright 2013 Intel Corporation.
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
module.exports = function (id, name, iconPath, version, totalSize,
        dataSize, lastModified, author, description, appIds) {
    var packageInformation = {}, _date = new Date(lastModified);

    packageInformation.__defineGetter__("id", function () {
        return id;
    });
    packageInformation.__defineGetter__("name", function () {
        return name;
    });
    packageInformation.__defineGetter__("iconPath", function () {
        return iconPath;
    });
    packageInformation.__defineGetter__("version", function () {
        return version;
    });
    packageInformation.__defineGetter__("totalSize", function () {
        return totalSize;
    });
    packageInformation.__defineGetter__("dataSize", function () {
        return dataSize;
    });
    packageInformation.__defineGetter__("lastModified", function () {
        return _date;
    });
    packageInformation.__defineGetter__("author", function () {
        return author;
    });
    packageInformation.__defineGetter__("description", function () {
        return description;
    });
    packageInformation.__defineGetter__("appIds", function () {
        return appIds;   
    });

    return packageInformation;
};
