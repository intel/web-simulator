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

module.exports = function (opt) {
    var folder = {}, _id = opt.id, _parentId = null, _serviceId = opt.serviceId,
        _contentType = opt.contentType, _name = opt.id, _path = opt.path,
        _type = opt.type, _synchronizable = opt.synchronizable;

    folder.name = _name;
    folder.synchronizable = _synchronizable;
    
    folder.__defineGetter__("id", function () {
        return _id;
    });
    folder.__defineGetter__("parentId", function () {
        return _parentId;
    });
    folder.__defineGetter__("serviceId", function () {
        return _serviceId;
    });
    folder.__defineGetter__("contentType", function () {
        return _contentType;
    });
    folder.__defineGetter__("path", function () {
        return _path;
    });
    folder.__defineGetter__("type", function () {
        return _type;
    });
    return folder;
};
