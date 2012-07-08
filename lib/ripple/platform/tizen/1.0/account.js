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

var db = require('ripple/db'),
    utils = require('ripple/utils'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    _data = {
        DB_ACCOUNT_KEY : "tizen1-db-accounts",
        accountServiceProviders : [],
        accountServiceTypes : [],
        accountServiceClasses : [],
        accounts : [],
        listeners : {}
    },
    _self;

function _isValid(filter, enable) {
    if (filter &&
        ((typeof filter !== "object") ||
        (filter.serviceTypeId !== undefined) && (typeof filter.serviceTypeId !== "string") ||
        (filter.providerId !== undefined) && (typeof filter.providerId !== "string") ||
        (filter.tags !== undefined) && (!filter.tags instanceof Array)))
        return false;

    if ((enable !== undefined) && (enable !== null) && (typeof enable !== "boolean"))
        return false;

    return true;
}

function _checkServiceClass(serviceClass, filter) {
    var retCheck = true, count = 0, i, j;

    if ((filter.serviceTypeId !== undefined) && (filter.serviceTypeId !== serviceClass.serviceTypeId)) {
        retCheck = false;
    } else if ((filter.providerId !== undefined) && (filter.providerId !== serviceClass.providerId)) {
        retCheck = false;
    } else if ((filter.tags !== undefined) && (filter.tags.length !== 0)) {
        if (serviceClass.tags === undefined || serviceClass.tags.length === 0) {
            retCheck = false;
        } else {
            for (i in filter.tags) {
                for (j in serviceClass.tags) {
                    if (filter.tags[i] === serviceClass.tags[j]) {
                        count++;
                        break;
                    }
                }
            }
            if (count !== filter.tags.length) {
                retCheck = false;
            }
        }
    }
    return retCheck;
}

function _sortNumber(a, b) {
    return b - a;
}

_self = {
    getAccountById : function (id) {
        var account = null, count;

        if (typeof id !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        for (count in _data.accounts) {
            if (_data.accounts[count].id === id) {
                account = utils.copy(_data.accounts[count]);
                break;
            }
        }
        return account;
    },

    getServiceById : function (id) {
        var accountService = null, count;

        if (typeof id !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        for (count in _data.accountServiceClasses) {
            if (_data.accountServiceClasses[count].id === id) {
                accountService = utils.copy(_data.accountServiceClasses[count]);
                break;
            }
        }
        return accountService;
    },

    getServiceClassByName : function (name) {
        var accountServiceClass = null, count;

        if (typeof name !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        for (count in _data.accountServiceClasses) {
            if ((_data.accountServiceClasses[count].id === undefined) &&
                (_data.accountServiceClasses[count].serviceName === name)) {
                accountServiceClass = utils.copy(_data.accountServiceClasses[count]);
                break;
            }
        }
        return accountServiceClass;
    },

    getServiceTypeById : function (id) {
        var accountServiceType = null, count;

        if (typeof id !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        for (count in _data.accountServiceTypes) {
            if (_data.accountServiceTypes[count].id === id) {
                accountServiceType = utils.copy(_data.accountServiceTypes[count]);
                break;
            }
        }
        return accountServiceType;
    },

    getProviderById : function (id) {
        var accountServiceProvider = null, count;

        if (typeof id !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        for (count in _data.accountServiceProviders) {
            if (_data.accountServiceProviders[count].id === id) {
                accountServiceProvider = utils.copy(_data.accountServiceProviders[count]);
                break;
            }
        }
        return accountServiceProvider;
    },

    findAccounts : function (filter, enabled) {
        var result = [], count, i;

        if (!_isValid(filter, enabled))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!filter) {
            if (enabled === undefined || enabled === null) {
                result = _data.accounts;
            } else {
                for (count in _data.accounts) {
                    if (_data.accounts[count].enabled === enabled) {
                        result.push(utils.copy(_data.accounts[count]));
                    }
                }
            }
        } else {
            for (count in _data.accounts) {
                if (_data.accounts[count].services === undefined || _data.accounts[count].services.length === 0) {
                    continue;
                }
                for (i in _data.accounts[count].services) {
                    if (_checkServiceClass(_data.accounts[count].services[i], filter) &&
                        (enabled === undefined || _data.accounts[count].enabled === enabled)) {
                        result.push(utils.copy(_data.accounts[count]));
                        break;
                    }
                }
            }
        }

        return result;
    },

    findServices : function (filter, enabled) {
        var result = [], count;

        if (!_isValid(filter, enabled))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!filter) {
            if (enabled === undefined || enabled === null) {
                for (count in _data.accountServiceClasses) {
                    if (_data.accountServiceClasses[count].id !== undefined) {
                        result.push(_data.accountServiceClasses[count]);
                    }
                }
            } else {
                for (count in _data.accountServiceClasses) {
                    if ((_data.accountServiceClasses[count].enabled === enabled) &&
                        (_data.accountServiceClasses[count].id !== undefined)) {
                        result.push(_data.accountServiceClasses[count]);
                    }
                }
            }
        } else {
            for (count in _data.accountServiceClasses) {
                if (_data.accountServiceClasses[count].id !== undefined) {
                    if (_checkServiceClass(_data.accountServiceClasses[count], filter) &&
                        (enabled === undefined || enabled === null || _data.accountServiceClasses[count].enabled === enabled) &&
                        (_data.accountServiceClasses[count].id !== undefined)) {
                        result.push(_data.accountServiceClasses[count]);
                    }
                }
            }
        }
        if (result.length === 0)
            result = null;

        return result;
    },

    findProviders : function (serviceTypeId) {
        var providerList = null, providerIds = [], count, i, j;

        if (serviceTypeId && (typeof serviceTypeId !== "string"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!serviceTypeId) {
            providerList = _data.accountServiceProviders;
        } else {
            for (count in _data.accountServiceClasses) {
                if ((_data.accountServiceClasses[count].serviceTypeId === serviceTypeId) &&
                    (_data.accountServiceClasses[count].id === undefined)) {
                    providerIds.push(_data.accountServiceClasses[count].providerId);
                }
            }
            if (providerIds.length !== 0) {
                providerList = [];
                for (i in _data.accountServiceProviders) {
                    for (j in providerIds) {
                        if (_data.accountServiceProviders[i].id === providerIds[j]) {
                            providerList.push(_data.accountServiceProviders[i]);
                        }
                    }
                }
            }
        }
        return providerList;
    },

    findServiceTypes : function (prefix) {
        var serviceTypeList = null, count;

        if (prefix && (typeof prefix !== "string"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (_data.accountServiceTypes.length !== 0) {
            if (!prefix) {
                serviceTypeList = _data.accountServiceTypes;
            } else {
                serviceTypeList = [];
                for (count in _data.accountServiceTypes) {
                    if (_data.accountServiceTypes[count].displayName.indexOf(prefix) !== -1) {
                        serviceTypeList.push(_data.accountServiceTypes[count]);
                    }
                }
            }
        }
        return serviceTypeList;
    },

    findServiceClasses : function (filter) {
        var serviceClasses = [], count;

        if (!_isValid(filter, undefined))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (_data.accountServiceClasses.length !== 0) {
            if (!filter) {
                for (count in _data.accountServiceClasses) {
                    if (_data.accountServiceClasses[count].id === undefined) {
                        serviceClasses.push(_data.accountServiceClasses[count]);
                    }
                }
            } else {
                for (count in _data.accountServiceClasses) {
                    if (_checkServiceClass(_data.accountServiceClasses[count], filter) &&
                        (_data.accountServiceClasses[count].id === undefined)) {
                        serviceClasses.push(_data.accountServiceClasses[count]);
                    }
                }
            }
        }
        if (serviceClasses.length === 0)
            serviceClasses = null;

        return serviceClasses;
    },

    addAccount : function (account) {
        var count, att;

        for (count in _data.accounts) {
            if (_data.accounts[count].id === account.id)
                return;
        }
        _data.accounts.push(utils.copy(account));
        db.saveObject(_data.DB_ACCOUNT_KEY, _data.accounts);
        for (att in _data.listeners) {
            _data.listeners[att].onAccountAdded(account);
        }
    },

    deleteAccount : function (accountId) {
        var deleteList = [], count, subscript, i, att;

        if (typeof accountId !== "string")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        for (count in _data.accounts) {
            if (_data.accounts[count].id === accountId) {
                _data.accounts.splice(count, 1);
                if (_data.accountServiceClasses.length !== 0) {
                    for (subscript in _data.accountServiceClasses) {
                        if (_data.accountServiceClasses[subscript].accountId === accountId) {
                            deleteList.push(i);
                        }
                    }
                    if (deleteList.length !== 0) {
                        deleteList.sort(_sortNumber);
                        for (i = deleteList.length - 1; i >= 0; i--) {
                            _data.accountServiceClasses.splice(i, 1);
                        }
                    }
                }
                db.saveObject(_data.DB_ACCOUNT_KEY, _data.accounts);
                for (att in _data.listeners) {
                    _data.listeners[att].onAccountRemoved(accountId);
                }
                return;
            }
        }
        throw new WebAPIError(errorcode.NOT_FOUND_ERR);
    },

    addAccountListener : function (observer, errorCallback) {
        var handle;

        if (typeof observer !== "object")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (observer.onAccountUpdated)
            tizen1_utils.validateArgumentType(observer.onAccountUpdated, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (observer.onAccountAdded)
            tizen1_utils.validateArgumentType(observer.onAccountAdded, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (observer.onAccountRemoved)
            tizen1_utils.validateArgumentType(observer.onAccountRemoved, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (errorCallback && (typeof errorCallback !== "function"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        do {
            handle = Math.uuid(10, 10);
        } while (handle.toString().indexOf('0') === 0);
        _data.listeners[handle] = observer;

        return handle;
    },

    removeAccountListener : function (handle) {
        if (typeof handle !== "number")
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!_data.listeners[handle])
            throw new WebAPIError(errorcode.NOT_FOUND_ERR);

        delete _data.listeners[handle];
    },

    registerServiceType : function (serviceTypeDeclaration, successCallback, errorCallback) {
        var count;

        if ((typeof successCallback !== "function") || (typeof errorCallback !== "function"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if ((typeof serviceTypeDeclaration.id !== "string") ||
            (typeof serviceTypeDeclaration.displayName !== "string") ||
            (typeof serviceTypeDeclaration.icon !== "string") ||
            (!serviceTypeDeclaration.tags instanceof Array))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        for (count in _data.accountServiceTypes) {
            if (_data.accountServiceTypes[count].id === serviceTypeDeclaration.id) {
                errorCallback();
                return;
            }
        }

        _data.accountServiceTypes.push(serviceTypeDeclaration);
        successCallback(serviceTypeDeclaration);
    },

    registerServiceProvider : function (providerDeclaration, successCallback, errorCallback) {
        var count;

        if ((typeof successCallback !== "function") || (typeof errorCallback !== "function"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if ((typeof providerDeclaration.id !== "string") ||
            ((providerDeclaration.displayName !== undefined) && (typeof providerDeclaration.displayName !== "string")) ||
            ((providerDeclaration.icon !== undefined) && (typeof providerDeclaration.icon !== "string")))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        for (count in _data.accountServiceProviders) {
            if (providerDeclaration.id === _data.accountServiceProviders[count].id) {
                errorCallback();
                return;
            }
        }

        _data.accountServiceProviders.push(providerDeclaration);
        successCallback(providerDeclaration);
    },

    registerServiceClass : function (serviceDeclaration, successCallback, errorCallback) {
        var count;

        if ((typeof successCallback !== "function") || (typeof errorCallback !== "function"))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if ((typeof serviceDeclaration.serviceName !== "string") ||
            (typeof serviceDeclaration.serviceTypeId !== "string") ||
            (typeof serviceDeclaration.providerId !== "string") ||
            (typeof serviceDeclaration.enabled !== "boolean") ||
            (typeof serviceDeclaration.settings !== "string") ||
            (typeof serviceDeclaration.displayName !== "string") ||
            (typeof serviceDeclaration.icon !== "string") ||
            (!serviceDeclaration.tags instanceof Array))
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        for (count in _data.accountServiceClasses) {
            if ((_data.accountServiceClasses[count].serviceTypeId === serviceDeclaration.serviceTypeId) &&
                (_data.accountServiceClasses[count].providerId === serviceDeclaration.providerId) &&
                (serviceDeclaration.id === undefined)) {
                errorCallback();
                return;
            }
        }
        _data.accountServiceClasses.push(serviceDeclaration);
        if ((_data.accounts.length !== 0) && (serviceDeclaration.accountId !== undefined)) {
            for (count in _data.accounts) {
                if (_data.accounts[count].id === serviceDeclaration.accountId) {
                    _data.accounts[count].services.push(serviceDeclaration);
                }
            }
        }
        successCallback(serviceDeclaration);
    }
};

function _initialize() {
    var provider = {
        id : "com.google",
        displayName : "google",
        icon : "path/google/pic.png"
    },
    type = {
        id : "tizen.tel",
        displayName : "tel",
        icon : "path/type.png",
        tags : ["call.voice", "call.video", "call.emergency", "call.gsm", "call.cdma", "call.pstn"]
    },
    serviceClass = {
        serviceName : "com.google.gtalk",
        displayName : "gtalk",
        icon : "path/google/talk.png",
        serviceTypeId : "tizen.tel",
        providerId : "com.google",
        enabled : true,
        tags : [],
        settings : {}
    };

    _data.accounts = db.retrieveObject(_data.DB_ACCOUNT_KEY) || [];
    _data.accountServiceClasses.push(serviceClass);
    _data.accountServiceProviders.push(provider);
    _data.accountServiceTypes.push(type);
}

_initialize();

module.exports = _self;
