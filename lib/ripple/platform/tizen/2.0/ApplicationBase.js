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
var event = require('ripple/event'),
    ApplicationControl = require('ripple/platform/tizen/2.0/ApplicationControl'),
    RequestedApplicationControl = require('ripple/platform/tizen/2.0/RequestedApplicationControl');

module.exports = function (appInfo, contextId, metaData) {
    var _self, request = null, _metaData = metaData;

    _self = {
        appInfo : appInfo,
        contextId : contextId,
        exit : function () {
            event.trigger("tizen-application-exit", [contextId]);
        },
        hide : function () {
            event.trigger("tizen-application-hide", [contextId]);
        },
        getRequestedAppControl : function () {
            request = new RequestedApplicationControl(
                                new ApplicationControl(
                                    _metaData.operation,
                                    _metaData.appControl.uri,
                                    _metaData.appControl.mime,
                                    _metaData.appControl.category,
                                    _metaData.appControl.data));
            return request;
        }
    };

    _self.__defineGetter__("appInfo", function () {
        return appInfo;
    });
    _self.__defineGetter__("contextId", function () {
        return contextId;
    });

    return _self;
};
