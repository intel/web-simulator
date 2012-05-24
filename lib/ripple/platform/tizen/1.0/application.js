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

var utils = require('ripple/utils'),
    event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    applicationService = require('ripple/platform/tizen/1.0/ApplicationService'),
    _security = {
        "http://tizen.org/api/application": [],
        "http://tizen.org/api/application.launch": ["launch", "launchService"],
        "http://tizen.org/api/application.kill": ["kill"],
        "http://tizen.org/api/application.read": [""],
        all: true
    },
    _data = {
        applications : null,
        applicationContexts : [],
        activeApp : null,
        listeners : {}
    },
    _self;

/* applications
 * [{appId: "org.tizen.apps.alarm", appInfo: {}, appServices: []}]
 */

/* applicationContexts
 * [{id: Math.uuid(null, 16), appId: "org.tizen.apps.alarm", parent: null, children: [], service: {}}]
 */

function _initialize() {
    event.trigger("appsInit", [_data]);
}

_initialize();

_self = function () {
    // private
    function getHandle() {
        var handle;
        do {
            handle = Math.uuid(10, 10);
        } while (handle.toString().indexOf('0') === 0);
        return handle;
    }

    function sortNumber(a, b) {
        return b - a;
    }

    function getChildren(id) {
        var i, j, k, temp, children = [], index = [];

        for (i in _data.applicationContexts) {
            if (_data.applicationContexts[i].appId === id) {
                children = _data.applicationContexts[i].children;
                index.push(i);
                break;
            }
        }
        do {
            temp = [];
            for (j in children) {
                for (k in _data.applicationContexts) {
                    if (_data.applicationContexts[k].appId === children[j]) {
                        index.push(k);
                        temp = temp.concat(_data.applicationContexts[k].children);
                    }
                }
            }
            children = temp;
        } while (children.length !== 0);

        return index;
    }

    function clearChildren(id, index) {
        var i, j, k, temp;

        for (i in _data.applicationContexts) {
            if ((i !== index) && (_data.applicationContexts[i].children.length !== 0)) {
                temp = [];
                for (j in _data.applicationContexts[i].children) {
                    if (_data.applicationContexts[i].children[j] === id) {
                        temp.push(j);
                    }
                }
                if (temp.length !== 0) {
                    temp.sort(sortNumber);
                    for (k in temp) {
                        _data.applicationContexts[i].children.splice(temp[k], 1);
                    }
                }
            }
        }
    }

    function closeApp(id, successCallback, errorCallback) {
        var i, children = getChildren(id);

        children.sort(sortNumber);

        for (i in children) {
            _data.applicationContexts.splice(children[i], 1);
        }
        if (successCallback) {
            successCallback();
        }
    }

    // public
    function launch(id, successCallback, errorCallback, argument) {
        var i, j, context, isRunning = false;

        if (!_security.all && !_security.launch)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof id !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        for (i in _data.applications) {
            if (_data.applications[i].appId === id) {
                for (j in _data.applicationContexts) {
                    if (_data.applicationContexts[j].appId === id) {
                        isRunning = true;
                        context = _data.applicationContexts[j];
                        break;
                    }
                }
                if (!isRunning) {
                    context = {id : Math.uuid(null, 16), appId : id, parent : "", children : [], service : {}};
                    _data.applicationContexts.push(context);
                }
                _data.activeApp = context;
                if (successCallback) {
                    successCallback();
                }
                return;
            }
        }
        if (errorCallback) {
            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
        }
    }

    function kill(contextId, successCallback, errorCallback) {
        var i, j, appId;

        if (!_security.all && !_security.kill)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (typeof contextId !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        for (i in _data.applicationContexts) {
            if (_data.applicationContexts[i].id === contextId) {
                appId = _data.applicationContexts[i].appId;
                j = i;
            }
        }
        if (!appId) {
            if (errorCallback)
                errorCallback();
            return;
        }
        closeApp(appId, successCallback, errorCallback);
    }

    function exit() {
        if (!_data.activeApp)
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        closeApp(_data.activeApp.appId, null, null);
        if (_data.applicationContexts.length > 0) {
            _data.activeApp = _data.applicationContexts[_data.applicationContexts.length - 1];
        } else {
            _data.activeApp = null;
        }
    }

    function hide() {
        var i;

        if (!_data.activeApp)
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        if (_data.applicationContexts.length === 1) {
            _data.activeApp = null;
            return;
        }
        for (i in _data.applicationContexts) {
            if (_data.applicationContexts[i].appId === _data.activeApp.appId) {
                if (_data.applicationContexts.length > 0) {
                    _data.activeApp = _data.applicationContexts[_data.applicationContexts.length - 1];
                } else {
                    _data.activeApp = null;
                }
                break;
            }
        }
    }

    function launchService(service, id, successCallback, errorCallback, replyCB) {
        var i, j, k, isRunning = false, appContext, activeApp;

        if (!_security.all && !_security.launch)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if ((typeof service !== "object") ||
            (typeof service.operation !== "string") ||
            (service.uri && (typeof service.uri !== "string")) ||
            (service.mime && (typeof service.mime !== "string")) ||
            (!service.data instanceof Array) ||
            (typeof service.replyResult !== "function") ||
            (typeof service.replyFailure !== "function"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (id && (typeof id !== "string"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (replyCB && ((typeof replyCB !== "object") ||
            (replyCB.onsuccess && (typeof replyCB.onsuccess !== "function")) ||
            (replyCB.fail && (typeof replyCB.fail !== "function"))))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (id) {
            for (i in _data.applications) {
                if (_data.applications[i].appId === id) {
                    for (j in _data.applicationContexts) {
                        if (_data.applicationContexts[j].appId === _data.activeApp.appId) {
                            _data.applicationContexts[j].children.push(id);
                            clearChildren(id, j);
                        }
                        if (_data.applicationContexts[j].appId === id) {
                            _data.applicationContexts[j].service = service;
                            _data.applicationContexts[j].parent = _data.activeApp.appId;
                            activeApp = _data.applicationContexts[j];
                            isRunning = true;
                        }
                    }
                    if (isRunning) {
                        _data.activeApp = activeApp;
                        return;
                    }
                    appContext = {id : Math.uuid(null, 16), appId : id, parent : _data.activeApp.appId, children : [], service : service};
                    _data.applicationContexts.push(appContext);
                    _data.activeApp = appContext;
                    service.replyResult(service.data);
                    if (successCallback) {
                        successCallback();
                    }
                    if (replyCB) {
                        replyCB.onsuccess(service.data);
                    }
                    return;
                }
            }
        } else {
            for (i in _data.applications) {
                for (j in _data.applications[i].appServices) {
                    if (service.operation === _data.applications[i].appServices[j].operation) {
                        for (k in _data.applicationContexts) {
                            if (_data.applicationContexts[k].appId === _data.activeApp.appId) {
                                _data.applicationContexts[k].children.push(_data.applications[i].appId);
                                clearChildren(id, k);
                            }
                            if (_data.applicationContexts[k].appId === _data.applications[i].appId) {
                                activeApp = _data.applicationContexts[k];
                                _data.applicationContexts[k].service = service;
                                _data.applicationContexts[k].parent = _data.activeApp.appId;
                                isRunning = true;
                            }
                        }
                        if (isRunning) {
                            _data.activeApp = activeApp;
                            return;
                        }
                        appContext = {id : Math.uuid(null, 16), appId : _data.applications[i].appId, parent : _data.activeApp.id, children : [], service : service};
                        _data.applicationContexts.push(appContext);
                        _data.activeApp = appContext;
                        service.replyResult(service.data);
                        if (successCallback) {
                            successCallback();
                        }
                        if (replyCB) {
                            replyCB.onsuccess(service.data);
                        }
                        return;
                    }
                }
            }
        }
        if (replyCB) {
            replyCB.onfail();
        }
        if (errorCallback) {
            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
        }
    }

    function getAppService() {
        if (!_data.activeApp)
            throw new WebAPIError(errorcode.UNKNOWN_ERR);

        return _data.activeApp.service;
    }

    function getAppsContext(successCallback, errorCallback) {
        var i, context, appsContext = [];

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        for (i in _data.applicationContexts) {
            context = {id : _data.applicationContexts[i].id, appId : _data.applicationContexts[i].appId};
            appsContext.push(context);
        }
        successCallback(appsContext);
    }

    function getAppContext(id) {
        var i, contextId, appContext;

        if (id && (typeof id !== "string"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        contextId = id || _data.activeApp.appId;
        for (i in _data.applicationContexts) {
            if (_data.applicationContexts[i].id === contextId) {
                appContext = {
                    id : _data.applicationContexts[i].id,
                    appId : _data.applicationContexts[i].appId
                };
                break;
            }
        }

        if (!appContext)
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        return appContext;
    }

    function getAppsInfo(successCallback, errorCallback) {
        var i, appsInfo = [];

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        for (i in _data.applications) {
            appsInfo.push(_data.applications[i].appInfo);
        }
        successCallback(appsInfo);
    }

    function getAppInfo(id) {
        var i, appId, appInfo;

        if (typeof id !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        appId = id || _data.activeApp.appId;

        for (i in _data.applications) {
            if (_data.applications[i].appId === appId) {
                appInfo = _data.applications[i].appInfo;
                break;
            }
        }

        if (!appInfo)
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        return appInfo;
    }

    function addAppInfoEventListener(eventCallback, errorCallback) {
        var handle;

        if (!eventCallback ||
            (errorCallback && (typeof errorCallback !== "function")) ||
            (eventCallback && (typeof eventCallback !== "object")) ||
            (eventCallback.oninstalled && (typeof eventCallback.oninstalled !== "function")) ||
            (eventCallback.onupdated && (typeof eventCallback.onupdated !== "function")) ||
            (eventCallback.onuninstalled && (typeof eventCallback.onuninstalled !== "function")))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        handle = getHandle();
        _data.listeners[handle] = eventCallback;

        return handle;
    }

    function removeAppInfoEventListener(listenerID) {
        if (typeof listenerID !== "number")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!_data.listeners[listenerID])
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        delete _data.listeners[listenerID];
    }

    function handleSubFeatures(subFeatures) {
        for (var subFeature in subFeatures) {
            if (_security[subFeature].length === 0) {
                _security.all = true;
                return;
            }
            _security.all = false;
            utils.forEach(_security[subFeature], function (method) {
                _security[method] = true;
            });
        }
    }

    var application = {
        launch : launch,
        kill : kill,
        exit : exit,
        hide : hide,
        launchService : launchService,
        getAppService : getAppService,
        getAppsContext : getAppsContext,
        getAppContext : getAppContext,
        getAppsInfo : getAppsInfo,
        getAppInfo : getAppInfo,
        addAppInfoEventListener : addAppInfoEventListener,
        removeAppInfoEventListener : removeAppInfoEventListener,
        handleSubFeatures : handleSubFeatures
    };

    return application;
};

event.on("programChanged", function (status, param) {
    var callback, id;

    switch (status) {
    case "installed":
    case "updated":
    case "uninstalled":
        callback = "on" + status;
        break;

    default:
        return;
    }

    for (id in _data.listeners) {
        _data.listeners[id][callback](param);
    }
});

module.exports = _self;
