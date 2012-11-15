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
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    _data = {
        DB_ACCOUNT_KEY : "tizen1-db-accounts",
        accounts : {}
    },
    _self;

function _checkAccount(account) {
    if (typeof account !== "object" ||
        typeof account.id !== "string" ||
        typeof account.appid !== "string" ||
        typeof account.userName !== "string" ||
        typeof account.displayName !== "string" ||
        typeof account.service !== "object") {
        return false;
    }

    return true;
}

function _checkCallback(successCallback, errorCallback) {
    tizen1_utils.validateArgumentType(successCallback, "function",
                                        new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    if (errorCallback) {
        tizen1_utils.validateArgumentType(errorCallback, "function",
                                            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }
}

_self = {
    getAccounts : function () {
        var results = [];
        utils.forEach(_data.accounts, function (account) {
            results.push(utils.copy(account)); 
        });

        return results;
    },

    getAccountById : function (id) {
        var acccount = null;

        if (typeof id !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (_data.accounts[id]) {
            account = utils.copy(_data.accounts[id]);
        }

        return account;
    },

    getAccountByUserName : function (userName) {
        var result = null;

        if (typeof userName !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        utils.forEach(_data.accounts, function (account) {
            if (userName === account.userName) {
                result = utils.copy(account);
            }
        });

        return result;
    },

    getAccountByappId : function (appId) {
        var result = null;

        if (typeof appId !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        utils.forEach(_data.accounts, function (account) {
            if (appId === account.appId) {
                result = utils.copy(account);
            }
        });

        return result;
    },

    getAccountByServiceId : function (serviceId) {
        var result = null;

        if (typeof serviceId !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        utils.forEach(_data.accounts, function (account) {
            if (serviceId === account.service.id) {
                result = utils.copy(account);
            }
        });

        return result;
    },

    getAccountByTag : function (tag) {
        var results = [], i;

        if (typeof tag !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        utils.forEach(_data.accounts, function (account) {
            for (i in account.service.tag) {
                if (tag === account.service.tag[i]) {
                    results.push(utils.copy(account));
                    break;
                }
            }
        });

        return results;
    },

    add : function (account, successCallback, errorCallback) {
        if (!_checkAccount(account)) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        _checkCallback(successCallback, errorCallback);

        if (!_data.accounts[account.id]) {
            _data.accounts[account.id] = utils.copy(account);
        }

        successCallback();
    },

    update : function (account, successCallback, errorCallback) {
        if (!_checkAccount(account)) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        _checkCallback(successCallback, errorCallback);

        if (!_data.accounts[account.id]) {
            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            return;
        }

        _data.accounts[account.id] = utils.copy(account);
        successCallback();
    },

    remove : function (id, successCallback, errorCallback) {
        if (typeof id !== "string") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        _checkCallback(successCallback, errorCallback);

        if (!_data.accounts[id]) {
            errorCallback(new WebAPIError(errorcode.NOT_FOUND_ERR));
            return;
        }

        delete _data.accounts[id];
        successCallback();
    },

    getAccountApplications : function () {
        var results = [];
        /* FIXME: wait for API update */
        return results;
    }
};

function _initialize() {
    _data.accounts = db.retrieveObject(_data.DB_ACCOUNT_KEY) || {};
}

_initialize();

module.exports = _self;
