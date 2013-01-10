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
    app = require('ripple/app'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    Application = require('ripple/platform/tizen/2.0/ApplicationBase'),
    ApplicationInformation = require('ripple/platform/tizen/2.0/ApplicationInformation'),
    ApplicationContext = require('ripple/platform/tizen/2.0/ApplicationContext'),
    ApplicationCertificate = require('ripple/platform/tizen/2.0/ApplicationCertificate'),
    _security = {
        "http://tizen.org/privilege/application.launch": ["launch", "launchAppControl"],
        "http://tizen.org/privilege/application.kill": ["kill"],
        "http://tizen.org/privilege/application.read": ["findAppControl", "getAppsContext", "getAppContext", "getAppsInfo", "getAppInfo", "addAppInfoEventListener", "removeAppInfoEventListener", "getAppCerts"],
        all: true
    },
    _data = {
        applications : {},
        applicationContexts : {},
        activeApp : null,
        listeners : {}
    },
    _self;

function _initialize() {
    event.trigger("appsInit", [_data]);
    /* //Keep the following sample data for debugging
    _data.applications = {
        "http://tizen.org/viewer": {
            id: "http://tizen.org/viewer",
            name: "Tizen image viewer",
            iconPath: "001.png",
            version: "1.9",
            show: true,
            categories: [],
            installDate: new Date(),
            size: 5120,
            operation: "http://tizen.org/appcontrol/operation/view",
            appControl: {
                uri: "",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_ROOT",
            value: []
        },
        "http://tizen.org/player": {
            id: "http://tizen.org/player",
            name: "Tizen media player",
            iconPath: "002.png",
            version: "2.0",
            show: true,
            categories: [],
            installDate: new Date(),
            size: 2048,
            operation: "http://tizen.org/appcontrol/operation/play",
            appControl: {
                uri: "",
                mime: "",
                category: "",
                data: ""
            },
            type: "AUTHOR_SIGNER",
            value: []
        }
    };
    */
}

_initialize();

_self = function () {
    // private
    function getHandle() {
        var handle;
        do {
            handle = Math.uuid(10, 10);
        } while (handle.toString().indexOf('0') === 0);

        return parseInt(handle, 10);
    }

    // public
    function getCurrentApplication() {
        var info, application, innerApp;
        if (_data.activeApp) {
            innerApp = _data.applications[_data.activeApp.appId];
            application = new Application(
                    new ApplicationInformation(
                        innerApp.id,
                        innerApp.name,
                        innerApp.iconPath,
                        innerApp.version,
                        innerApp.show,
                        innerApp.categories,
                        innerApp.installDate,
                        innerApp.size),
                    _data.activeApp.id, innerApp);
        } else {
            info = app.getInfo();
            application = new Application(
                    new ApplicationInformation(info.id, info.name, info.icon, info.version, true, [], new Date(), 1024),
                    Math.uuid(null, 16));
        }
        return application;
    }

    function kill(contextId, successCallback, errorCallback) {
        if (!_security.all && !_security.kill) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (typeof contextId !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_data.applicationContexts[contextId]) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
            return;
        }

        if (_data.activeApp && _data.activeApp.id === contextId) {
            _data.activeApp = null;
        }
        delete _data.applicationContexts[contextId];
        if (successCallback) {
            successCallback();
        }
    }

    function launch(id, successCallback, errorCallback) {
        var contextId;

        if (!_security.all && !_security.launch) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (typeof id !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_data.applications[id]) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
            return;
        }

        contextId = Math.uuid(null, 16);
        utils.forEach(_data.applicationContexts, function (context) {
            if (context.appId === id) {
                contextId = context.id;
            }
        });

        if (!_data.applicationContexts[contextId]) {
            _data.applicationContexts[contextId] = {id: contextId, appId: id};
        }

        _data.activeApp = _data.applicationContexts[contextId];
        if (successCallback) {
            successCallback();
        }
    }

    function launchAppControl(appControl, id, successCallback, errorCallback, replyCallback) {
        var contextId, isFound, appId;

        if (!_security.all && !_security.launchAppControl) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if ((typeof appControl !== "object") ||
            (typeof appControl.operation !== "string") ||
            (appControl.uri && (typeof appControl.uri !== "string")) ||
            (appControl.mime && (typeof appControl.mime !== "string")) ||
            (appControl.category && (typeof appControl.category !== "string")) ||
            (!appControl.data instanceof Array)) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (id && (typeof id !== "string")) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (replyCallback && ((typeof replyCallback !== "object") ||
            (replyCallback.onsuccess && (typeof replyCallback.onsuccess !== "function")) ||
            (replyCallback.onfailure && (typeof replyCallback.onfailure !== "function")))) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (id) {
            if (!_data.applications[id]) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
                return;
            }
            contextId = Math.uuid(null, 16);
            utils.forEach(_data.applicationContexts, function (context) {
                if (context.appId === id) {
                    contextId = context.id;
                }
            });

            if (!_data.applicationContexts[contextId]) {
                _data.applicationContexts[contextId] = {id: contextId, appId: id, replyCallback: replyCallback};
            }

            _data.activeApp = _data.applicationContexts[contextId];
            if (successCallback) {
                successCallback();
            }
        } else {
            isFound = false;
            utils.forEach(_data.applications, function (application) {
                if (application.operation === appControl.operation) {
                    appId = application.id;
                    isFound = true;
                }
            });
            if (isFound) {
                contextId = Math.uuid(null, 16);
                utils.forEach(_data.applicationContexts, function (context) {
                    if (context.appId === appId) {
                        contextId = context.id;
                    }
                });

                if (!_data.applicationContexts[contextId]) {
                    _data.applicationContexts[contextId] = {id: contextId, appId: appId, replyCallback: replyCallback};
                }

                _data.activeApp = _data.applicationContexts[contextId];
                if (successCallback) {
                    successCallback();
                }
            } else {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
            }
        }
    }

    function findAppControl(appControl, successCallback, errorCallback) {
        var informationArray = [];
        if (!_security.all && !_security.findAppControl) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if ((typeof appControl !== "object") ||
            (typeof appControl.operation !== "string") ||
            (appControl.uri && (typeof appControl.uri !== "string")) ||
            (appControl.mime && (typeof appControl.mime !== "string")) ||
            (appControl.category && (typeof appControl.category !== "string")) ||
            (!appControl.data instanceof Array)) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback) {
            tizen1_utils.validateArgumentType(errorCallback, "function",
                    new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }
        utils.forEach(_data.applications, function (application) {
            if (application.operation === appControl.operation) {
                informationArray.push(new ApplicationInformation(
                        application.id,
                        application.name,
                        application.iconPath,
                        application.version,
                        application.show,
                        application.categories,
                        application.installDate,
                        application.size));
            }
        });
        if (informationArray.length === 0) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
        } else {
            successCallback(informationArray, appControl);
        }
    }

    function getAppsContext(successCallback, errorCallback) {
        var array = [];

        if (!_security.all && !_security.getAppsContext) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback) {
            tizen1_utils.validateArgumentType(errorCallback, "function",
                    new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        utils.forEach(_data.applicationContexts, function (context) {
            array.push(new ApplicationContext(context.id, context.appId));
        });

        successCallback(array);
    }

    function getAppContext(id) {
        var  appContext;

        if (!_security.all && !_security.getAppContext) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (id === null) {
            appContext = new ApplicationContext(_data.activeApp.id, _data.activeApp.appId);
            return (appContext);
        }
        if (id && (typeof id !== "string")) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }
        utils.forEach(_data.applicationContexts, function (context) {
            if (context.appId === id) {
                appContext = new ApplicationContext(context.id, context.appId);
                return (appContext);
            }
        });
        throw new WebAPIError(errorcode.NOT_FOUND_ERR);
    }

    function getAppsInfo(successCallback, errorCallback) {
        var appsInfo = [];

        if (!_security.all && !_security.getAppsInfo) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback) {
            tizen1_utils.validateArgumentType(errorCallback, "function",
                    new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        utils.forEach(_data.applications, function (application) {
            appsInfo.push(new ApplicationInformation(
                    application.id,
                    application.name,
                    application.iconPath,
                    application.version,
                    application.show,
                    application.categories,
                    application.installDate,
                    application.size));
        });
        successCallback(appsInfo);
    }

    function getAppInfo(id) {
        var appId, appInfo, theApp;

        if (!_security.all && !_security.getAppInfo) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (id === null) {
            appId = _data.activeApp.appId;
            theApp = _data.applications[appId];

            appInfo = new ApplicationInformation(
                    theApp.id,
                    theApp.name,
                    theApp.iconPath,
                    theApp.version,
                    theApp.show,
                    theApp.categories,
                    theApp.installDate,
                    theApp.size);
            return appInfo;
        }

        if (id && (typeof id !== "string")) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.applications[id]) {
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);
        }

        theApp = _data.applications[id];
        appInfo = new ApplicationInformation(
                    theApp.id,
                    theApp.name,
                    theApp.iconPath,
                    theApp.version,
                    theApp.show,
                    theApp.categories,
                    theApp.installDate,
                    theApp.size);
        return appInfo;
    }

    function getAppCerts(id) {
        var certs = [];

        if (!_security.all && !_security.getAppCerts) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (id === null) {
            id = _data.activeApp.appId;
            certs.push(new ApplicationCertificate(_data.applications[id].type, _data.applications[id].value));
            return certs;
        }

        if (id && typeof id !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.applications[id]) {
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);
        }
        certs.push(new ApplicationCertificate(_data.applications[id].type, _data.applications[id].value));
        return certs;
    }

    function addAppInfoEventListener(eventCallback) {
        var handle;

        if (!_security.all && !_security.addAppInfoEventListener) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (!eventCallback ||
            (typeof eventCallback.oninstalled !== "function") ||
            (typeof eventCallback.onupdated !== "function") ||
            (typeof eventCallback.onuninstalled !== "function")) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        handle = getHandle();
        _data.listeners[handle] = eventCallback;

        return handle;
    }

    function removeAppInfoEventListener(listenerID) {
        if (typeof listenerID !== "number") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.listeners[listenerID]) {
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);
        }

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
        getCurrentApplication : getCurrentApplication,
        kill : kill,
        launch : launch,
        launchAppControl : launchAppControl,
        findAppControl : findAppControl,
        getAppsContext : getAppsContext,
        getAppContext : getAppContext,
        getAppsInfo : getAppsInfo,
        getAppInfo : getAppInfo,
        getAppCerts : getAppCerts,
        addAppInfoEventListener : addAppInfoEventListener,
        removeAppInfoEventListener : removeAppInfoEventListener,
        handleSubFeatures : handleSubFeatures
    };

    return application;
};

event.on("tizen-application-exit", function (contextId) {
    if (_data.applicationContexts[contextId]) {
        delete _data.applicationContexts[contextId];
    }
    _data.activeApp = null;
});

event.on("tizen-application-hide", function () {
    _data.activeApp = null;
});

event.on("programChanged", function (status, id) {
    var callback, data, innerApp;

    switch (status) {
    case "installed":
    case "updated":
        innerApp = _data.applications[id];
        data = new ApplicationInformation(
                        innerApp.id,
                        innerApp.name,
                        innerApp.iconPath,
                        innerApp.version,
                        innerApp.show,
                        innerApp.categories,
                        innerApp.installDate,
                        innerApp.size);
        break;
    case "uninstalled":
        data = id;
        break;

    default:
        return;
    }
    callback = "on" + status;
    utils.forEach(_data.listeners, function (listener) {
        listener[callback](data);
    });
});

module.exports = _self;
