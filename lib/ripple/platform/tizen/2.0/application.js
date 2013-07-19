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
    db = require('ripple/db'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    Application = require('ripple/platform/tizen/2.0/ApplicationBase'),
    ApplicationInformation = require('ripple/platform/tizen/2.0/ApplicationInformation'),
    ApplicationContext = require('ripple/platform/tizen/2.0/ApplicationContext'),
    ApplicationCertificate = require('ripple/platform/tizen/2.0/ApplicationCertificate'),
    _DB_APPLICATION_KEY = "tizen1-db-application",
    PSEUDO_PACKAGE_ID = "pseudopack00",
    PSEUDO_APP_ID = "pseudoapp00",
    _security = {
        "http://tizen.org/privilege/application.launch": ["launch", "launchAppControl"],
        "http://tizen.org/privilege/appmanager.kill": ["kill"],
        "http://tizen.org/privilege/appmanager.certificate": ["getAppCerts"]
    },
    _data = {
        applications : {},
        applicationContexts : {},
        activeApp : null,
        listeners : {}
    },
    _appDialogTemplate = jQuery("#app-dialog-template").html(),
    _appDialogTemplate_short = jQuery("#app-dialog2-template").html(),
    _appDialogTemplate_exit_hide = jQuery("#app-dialog3-template").html(),
    _self;

function _setupCurrentApp() {
    var info, contextId, packageId, appId;
    info = app.getInfo();
    packageId = info.tizenPackageId || PSEUDO_PACKAGE_ID;
    appId = info.tizenAppId  || PSEUDO_APP_ID;
    contextId = Math.uuid(null, 16);
    _data.applications[appId] = {
        id: appId,
        name: info.name,
        iconPath: info.icon,
        version: info.version,
        show: true,
        categories: [],
        installDate: new Date(),
        size: 1024,
        packageId: packageId,
        sharedURI: "/usr/local/share/",
        operation: "",
        appControl: {
            uri: "",
            mime: "",
            category: "",
            data: ""
        },
        type: "AUTHOR_ROOT",
        value: ""
    };
    event.trigger("install-current-app", [_data.applications[appId]]);
    _data.applicationContexts[contextId] = {id: contextId, appId: appId};
    _data.activeApp = _data.applicationContexts[contextId];
}

function _translate(apps) {
    // translate string to Date after retrieving from DB,
    // it is a temporary sulusion
    var i;
    for (i in apps) {
        if (typeof apps[i].installDate === 'string') {
            apps[i].installDate = new Date(apps[i].installDate);
        }
    }
    return apps;
}

function _initialize() {
    _data = {
        applications : {},
        applicationContexts : {},
        activeApp : null,
        listeners : {}
    };
    _data.applications = _translate(db.retrieveObject(_DB_APPLICATION_KEY).installedAppList);
    _setupCurrentApp();
    $("#app-dialog").dialog({
        resizable: false,
        draggable: false,
        modal: true,
        autoOpen: false,
        position: 'center',
        minWidth: '500',
        minHeight: '262',
        open: function () { $(".ui-dialog-titlebar-close", $(this).parent()).hide(); }
    });
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
        var application, innerApp;
        /* activeApp update (by WidgetInformationUpdate event) sometime will late after user calling getCurrentApplication()
           for example: load other application by omnibar */
        if (app.getInfo().id !== _data.activeApp.appId) {
            _data.applications = db.retrieveObject(_DB_APPLICATION_KEY).installedAppList;
            utils.forEach(_data.applications, function(item) {
                item.installDate = new Date(item.installDate);
            });
            _setupCurrentApp();
        }
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
                    innerApp.size,
                    innerApp.packageId),
                _data.activeApp.id, innerApp);
        return application;
    }

    function kill(contextId, successCallback, errorCallback) {
        if (!_security.kill) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (typeof contextId !== "string") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_data.applicationContexts[contextId]) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
            return;
        }

        if (_data.activeApp && _data.activeApp.id === contextId) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.INVALID_VALUES_ERR));
            }
            return;
        }

        delete _data.applicationContexts[contextId];
        if (successCallback) {
            successCallback();
        }
    }

    function launch(id, successCallback, errorCallback) {
        var htmlContent;

        if (!_security.launch) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (typeof id !== "string") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!_data.applications[id]) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            }
            return;
        }
        htmlContent = _appDialogTemplate_short.replace(/#application-name/, _data.applications[id].name)
            .replace(/#application-id/, id);
        jQuery("#app-dialog-box").html(htmlContent);
        $("#app-dialog").dialog("open");

        if (successCallback) {
            successCallback();
        }
    }

    function launchAppControl(appControl, id, successCallback, errorCallback, replyCallback) {
        var isFound, appId, htmlContent;

        if (!_security.launchAppControl) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if ((typeof appControl !== "object") ||
            (typeof appControl.operation !== "string") ||
            (appControl.uri && (typeof appControl.uri !== "string")) ||
            (appControl.mime && (typeof appControl.mime !== "string")) ||
            (appControl.category && (typeof appControl.category !== "string")) ||
            (!appControl.data instanceof Array)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (id && (typeof id !== "string")) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (replyCallback && ((typeof replyCallback !== "object") ||
            (replyCallback.onsuccess && (typeof replyCallback.onsuccess !== "function")) ||
            (replyCallback.onfailure && (typeof replyCallback.onfailure !== "function")))) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (id) {
            if (!_data.applications[id]) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
                return;
            }
            htmlContent = _appDialogTemplate.replace(/#application-name/, _data.applications[appId].name)
                .replace(/#appControl-operation/, _data.applications[appId].operation)
                .replace(/#appControl-uri/, _data.applications[appId].appControl.uri)
                .replace(/#appControl-mime/, _data.applications[appId].appControl.mime)
                .replace(/#appControl-category/, _data.applications[appId].appControl.category)
                .replace(/#appControl-data/, JSON.stringify(_data.applications[appId].appControl.data));
            jQuery("#app-dialog-box").html(htmlContent);
            $("#app-dialog").dialog("open");

            _data.activeApp.replyCallback = replyCallback;

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
                htmlContent = _appDialogTemplate.replace(/#application-name/, _data.applications[appId].name)
                    .replace(/#appControl-operation/, _data.applications[appId].operation)
                    .replace(/#appControl-uri/, _data.applications[appId].appControl.uri)
                    .replace(/#appControl-mime/, _data.applications[appId].appControl.mime)
                    .replace(/#appControl-category/, _data.applications[appId].appControl.category)
                    .replace(/#appControl-data/, JSON.stringify(_data.applications[appId].appControl.data));
                jQuery("#app-dialog-box").html(htmlContent);
                $("#app-dialog").dialog("open");

                _data.activeApp.replyCallback = replyCallback;

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

        if ((typeof appControl !== "object") ||
            (typeof appControl.operation !== "string") ||
            (appControl.uri && (typeof appControl.uri !== "string")) ||
            (appControl.mime && (typeof appControl.mime !== "string")) ||
            (appControl.category && (typeof appControl.category !== "string")) ||
            (!appControl.data instanceof Array)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIException(errorcode.TYPE_MISMATCH_ERR));

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
                        application.size,
                        application.packageId));
            }
        });
        setTimeout(successCallback(informationArray, appControl), 1);
    }

    function getAppsContext(successCallback, errorCallback) {
        var array = [];

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIException(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback) {
            tizen1_utils.validateArgumentType(errorCallback, "function",
                    new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
        }

        utils.forEach(_data.applicationContexts, function (context) {
            array.push(new ApplicationContext(context.id, context.appId));
        });

        setTimeout(successCallback(array), 1);
    }

    function getAppContext(contextId) {
        var  appContext;

        if (contextId === null || contextId === undefined) {
            appContext = new ApplicationContext(_data.activeApp.id, _data.activeApp.appId);
            return (appContext);
        }
        if (contextId && (typeof contextId !== "string")) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }
        if (_data.applicationContexts[contextId]) {
            appContext = new ApplicationContext(contextId, _data.applicationContexts[contextId].appId);
            return (appContext);
        }
        throw new WebAPIException(errorcode.NOT_FOUND_ERR);
    }

    function getAppsInfo(successCallback, errorCallback) {
        var appsInfo = [];

        tizen1_utils.validateArgumentType(successCallback, "function",
                new WebAPIException(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback) {
            tizen1_utils.validateArgumentType(errorCallback, "function",
                    new WebAPIException(errorcode.TYPE_MISMATCH_ERR));
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
                    application.size,
                    application.packageId));
        });
        setTimeout(successCallback(appsInfo), 1);
    }

    function getAppInfo(id) {
        var appId, appInfo, theApp;

        if (arguments.length === 0) {
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
                    theApp.size,
                    theApp.packageId);
            return appInfo;
        }

        if (id && (typeof id !== "string")) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.applications[id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
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
                    theApp.size,
                    theApp.packageId);
        return appInfo;
    }

    function getAppCerts(id) {
        var certs = [];

        if (!_security.getAppCerts) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }
        if (arguments.length === 0) {
            id = _data.activeApp.appId;
            certs.push(new ApplicationCertificate(_data.applications[id].type, _data.applications[id].value));
            return certs;
        }

        if (id && typeof id !== "string") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.applications[id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        certs.push(new ApplicationCertificate(_data.applications[id].type, _data.applications[id].value));
        return certs;
    }

    function getAppSharedURI(id) {
        var appId;

        if (id === null || id === undefined) {
            appId = _data.activeApp.appId;
            return _data.applications[appId].sharedURI;
        }

        if (id && (typeof id !== "string")) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.applications[id]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        return _data.applications[id].sharedURI;
    }

    function addAppInfoEventListener(eventCallback) {
        var handle;

        if (!eventCallback ||
            (typeof eventCallback.oninstalled !== "function") ||
            (typeof eventCallback.onupdated !== "function") ||
            (typeof eventCallback.onuninstalled !== "function")) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        handle = getHandle();
        _data.listeners[handle] = eventCallback;

        return handle;
    }

    function removeAppInfoEventListener(listenerID) {
        if (typeof listenerID !== "number") {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.listeners[listenerID]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        delete _data.listeners[listenerID];
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
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
        getAppSharedURI: getAppSharedURI,
        addAppInfoEventListener : addAppInfoEventListener,
        removeAppInfoEventListener : removeAppInfoEventListener,
        handleSubFeatures : handleSubFeatures
    };

    return application;
};

event.on("tizen-application-exit", function () {
    var htmlContent;
    htmlContent = _appDialogTemplate_exit_hide.replace(/#application-name/, _data.applications[_data.activeApp.appId].name)
        .replace(/#application-id/, _data.applications[_data.activeApp.appId].id)
        .replace(/#application-operation/g, "exit")
        .replace(/#application-verb/, "launch")
        .replace(/#next-command/, "Launch")
        .replace(/#application-btn/, "app-dialog-reload-btn");
    jQuery("#app-dialog-box").html(htmlContent);
    $("#app-dialog").dialog("open");
});

event.on("tizen-application-hide", function () {
    var htmlContent;
    htmlContent = _appDialogTemplate_exit_hide.replace(/#application-name/, _data.applications[_data.activeApp.appId].name)
        .replace(/#application-id/, _data.applications[_data.activeApp.appId].id)
        .replace(/#application-operation/g, "hide")
        .replace(/#application-verb/, "show")
        .replace(/#next-command/, "Show")
        .replace(/#application-btn/, "app-dialog-return-btn");
    jQuery("#app-dialog-box").html(htmlContent);
    $("#app-dialog").dialog("open");
});

event.on("programChanged", function (status, id) {
    var callback, data, innerApp;
    _data.applications = db.retrieveObject(_DB_APPLICATION_KEY).installedAppList;
    utils.forEach(_data.applications, function(item) {
        item.installDate = new Date(item.installDate);
    });
    _setupCurrentApp();
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
                        innerApp.size,
                        innerApp.packageId);
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

jQuery("#app-dialog-return-btn").live("click", function () {
    $("#app-dialog").dialog("close");
});

jQuery("#app-dialog-reload-btn").live("click", function () {
    $("#app-dialog").dialog("close");
    window.tinyHipposReload = true;
    location.reload();
});

jQuery("#app-dialog-generate-reply").live("click", function () {
    var type, data, ret = [];
    type = jQuery('input:radio[name="app-dialog-reply-type"]:checked').val();
    data = jQuery("#app-dialog-reply-json").val();
    $("#app-dialog").dialog("close");
    if (_data.activeApp.replyCallback) {
        switch (type) {
        case "replyResult":
            if (_data.activeApp.replyCallback.onsuccess) {
                if (data === "") {
                    _data.activeApp.replyCallback.onsuccess();
                } else {
                    try {
                        ret = JSON.parse(data);
                        _data.activeApp.replyCallback.onsuccess(ret);
                    } catch (e) {
                        console.log("replyResult: JSON parsing error: " + e.message);
                        _data.activeApp.replyCallback.onsuccess();
                    }
                }
            }
            break;
        case "replyFailure":
            if (_data.activeApp.replyCallback.onfailure) {
                _data.activeApp.replyCallback.onfailure();
            }
            break;
        }
    }
});

event.on("ApplicationLoad", function () {
    _initialize();
});

module.exports = _self;
