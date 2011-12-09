/*
 *  Copyright 2011 Intel Corporation.
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
    db = require('ripple/db'),
    exception = require('ripple/exception'),
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    wac2_utils = require('ripple/platform/wac/2.0/wac2_utils'),
    DeviceApiError = require('ripple/platform/wac/2.0/deviceapierror'),
    PendingOperation = require('ripple/platform/wac/2.0/pendingoperation'),
    PendingObject = require('ripple/platform/wac/2.0/pendingObject'),
    TypeCoerce = require('ripple/platform/wac/2.0/typecoerce'),
    Filter = require('ripple/platform/wac/2.0/contactfilter'),
    MessageSendCallback,
    Message,
    MessageFilter,
    Recipients,
    _KEY = "wac2-pim-messaging",
    _PENDING_TIME = 600,
    _messages = {},
    _subscriber = {
        onSMS: {},
        onMMS: {},
        onEmail: {}
    },
    _sentStatus = {},
    _security = {
        "http://wacapps.net/api/messaging": [],
        "http://wacapps.net/api/messaging.send": ["sendMessage"],
        "http://wacapps.net/api/messaging.find": ["findMessages"],
        "http://wacapps.net/api/messaging.subscribe": ["onSMS", "onMMS", "onEmail"],
        "http://wacapps.net/api/messaging.write": ["update"],
        all: true
    },
    _self;

function _get() {
    _messages = db.retrieveObject(_KEY) || {1: [], 2: [], 3: [], 4: []};
    utils.forEach(_messages, function (folder) {
        utils.forEach(folder, function (messageItem) {
            if (messageItem.timestamp)
                messageItem.timestamp = new Date(messageItem.timestamp);
        });
    });
}

function _save() {
    db.saveObject(_KEY, _messages);
}

function _updateDB(message, duplicate) {
    _get();
    _messages[message.folder].push(message);
    if (duplicate)
        _messages[duplicate.folder].push(duplicate);
    _save();
}

function _errorOccurred(onError, code) {
    if (!onError)
        return;

    setTimeout(function () {
        onError(new DeviceApiError(code));
    }, 1);
}

function _pendingOperate(operate, scope) {
    var i, argumentVector = [];

    for (i = 0; i < arguments.length - 2; i++)
        argumentVector[i] = arguments[i + 2];

    return function () {
        var pendingObj, pendingOperation;

        pendingObj = new PendingObject();
        pendingObj.pendingID = window.setTimeout(function () {
            pendingObj.setCancelFlag(false);
            if (operate)
                operate.apply(scope, argumentVector);
        }, _PENDING_TIME);

        pendingOperation = new PendingOperation(pendingObj);

        return pendingOperation;
    };
}

function _onMessage(onMessage, messageHandler) {
    if (!messageHandler)
        exception.raise(exception.types.Argument,
            onMessage + " invalid messageHandler parameter",
            new DeviceApiError(errorcode.INVALID_VALUES_ERR));

    utils.validateArgumentType(messageHandler, "function", null,
        "messageHandler invalid function parameter",
        new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));

    if (!_security.all && !_security[onMessage])
        exception.raise(exception.types.Argument,
            onMessage + " access denied", new DeviceApiError(errorcode.SECURITY_ERR));

    var idSubscribe = (new Date()).getTime() | 0;
    _subscriber[onMessage][idSubscribe] = messageHandler;

    return idSubscribe;
}

function _validateRecipients(message) {
    var i;

    for (i = 0; i < message.to.length;) {
        message.to[i] = message.to[i].replace(/^\s*(\S*)\s*$/, '$1');
        if (message.to[i] === "")
            message.to.splice(i, 1);
        else
            i++;
    }
    for (i = 0; i < message.cc.length;) {
        message.cc[i] = message.cc[i].replace(/^\s*(\S*)\s*$/, '$1');
        if (message.cc[i] === "")
            message.cc.splice(i, 1);
        else
            i++;
    }
    for (i = 0; i < message.bcc.length;) {
        message.bcc[i] = message.bcc[i].replace(/^\s*(\S*)\s*$/, '$1');
        if (message.bcc[i] === "")
            message.bcc.splice(i, 1);
        else
            i++;
    }
    if (message.to.length + message.cc.length + message.bcc.length === 0)
        exception.raise(exception.types.Argument,
            "sendMessage invalid message.to parameter",
            new DeviceApiError(errorcode.INVALID_VALUES_ERR));
}

function _isValid(onSuccess, onError, message) {
    if (onSuccess &&
        typeof onSuccess !== "function" &&
        typeof onSuccess !== "object") {
        exception.raise(exception.types.Argument,
            "sendMessage invalid successCallback parameter",
            new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
    }

    if (onError) {
        utils.validateArgumentType(onError, "function", null,
            "sendMessage invalid errorCallback parameter",
            new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
    }

    if (!onSuccess) {
        _errorOccurred(onError, errorcode.INVALID_VALUES_ERR);
        return false;
    }

    if (message) {
        utils.validateArgumentType(message, "object", null,
            "sendMessage invalid message parameter",
            new DeviceApiError(errorcode.INVALID_VALUES_ERR));
    } else {
        _errorOccurred(onError, errorcode.INVALID_VALUES_ERR);
        return false;
    }

    if (message.type !== _self().TYPE_SMS &&
        message.type !== _self().TYPE_MMS &&
        message.type !== _self().TYPE_EMAIL)
        exception.raise(exception.types.Argument,
            "sendMessage invalid message.type parameter",
            new DeviceApiError(errorcode.INVALID_VALUES_ERR));

    if (!_security.all && !_security.sendMessage) {
        _errorOccurred(onError, errorcode.SECURITY_ERR);
        return false;
    }

    TypeCoerce(Message(0)).cast(message);
    _validateRecipients(message);

    return true;
}

function _getEachSentStatus(onMessageSentSuccess, onMessageSentError, message,
                            sucRecipients, failRecipients, recType) {
    utils.forEach(message[recType], function (recipient) {
        if (_sentStatus[recipient]) {
            sucRecipients[recType].push(recipient);
            if (onMessageSentSuccess) {
                onMessageSentSuccess(recipient);
            }
        } else {
            failRecipients[recType].push(recipient);
            if (onMessageSentError) {
                onMessageSentError(new DeviceApiError(errorcode.UNKNOWN_ERR), recipient);
            }
        }
    });
}

function _getSentStatus(onSuccess, onError, message, onMessageSentSuccess, onMessageSentError) {
    var allSentSuccess,
        sucRecipients = new Recipients(),
        failRecipients = new Recipients(),
        duplicate;

    _getEachSentStatus(onMessageSentSuccess, onMessageSentError,
        message, sucRecipients, failRecipients, "to");

    if (message.type === _self().TYPE_EMAIL) {
        _getEachSentStatus(onMessageSentSuccess, onMessageSentError,
            message, sucRecipients, failRecipients, "cc");
        _getEachSentStatus(onMessageSentSuccess, onMessageSentError,
            message, sucRecipients, failRecipients, "bcc");
    }

    allSentSuccess = (failRecipients.total() === 0);

    if (allSentSuccess) {
        message.folder = _self().FOLDER_SENTBOX;
    } else if (sucRecipients.total() === 0) {
        message.folder = _self().FOLDER_DRAFTS;
    } else {
        duplicate = utils.copy(message);

        message.to = sucRecipients.to;
        message.cc = sucRecipients.cc;
        message.bcc = sucRecipients.bcc;
        message.folder = _self().FOLDER_SENTBOX;

        duplicate.to = failRecipients.to;
        duplicate.cc = failRecipients.cc;
        duplicate.bcc = failRecipients.bcc;
        duplicate.folder = _self().FOLDER_DRAFTS;
    }

    _updateDB(message, duplicate);

    if (allSentSuccess) {
        onSuccess();
    } else if (onError) {
        onError(new DeviceApiError(errorcode.UNKNOWN_ERR));
    }
}

_self = function () {
    var messaging = {
        createMessage: function (type) {
            type = type | 0;

            if (type < _self().TYPE_SMS || type > _self().TYPE_EMAIL)
                exception.raise(exception.types.Argument,
                "type invalid value", new DeviceApiError(errorcode.INVALID_VALUES_ERR));

            var msg = new Message(type);

            return msg;
        },

        sendMessage: function (successCallback, errorCallback, message) {
            var ret;

            function _sendMessage() {
                event.trigger("OutsideMessageReceived", [message]);

                return _pendingOperate(_getSentStatus, undefined,
                    successCallback, errorCallback, message)();
            }

            function _sendEachMessage() {
                utils.forEach(successCallback, function (value, key) {
                    utils.validateArgumentType(value, "function", null,
                        "sendMessage invalid successCallback." + key + " parameter",
                        new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
                });

                event.trigger("OutsideMessageReceived", [message]);

                return _pendingOperate(_getSentStatus, undefined,
                    successCallback.onsuccess, errorCallback, message,
                    successCallback.onmessagesendsuccess, successCallback.onmessagesenderror)();
            }

            if (!_isValid(successCallback, errorCallback, message))
                return null;

            switch (typeof successCallback) {
            case "function":
                ret = _sendMessage();
                break;

            case "object":
                ret = _sendEachMessage();
                break;
            }

            return ret;
        },

        findMessages: function (successCallback, errorCallback, filter) {
            function _findMessages() {
                var message, result = [];

                if (!_security.all && !_security.findMessages)
                    return _errorOccurred(errorCallback, errorcode.SECURITY_ERR);

                utils.forEach(_messages, function (folder) {
                    utils.forEach(folder, function (messageItem) {
                        if ((filter                 === undefined || filter === null) ||
                            (filter.id              === undefined || Filter(filter.id).match(messageItem.id)) &&
                            (filter.type            === undefined || Filter(filter.type).match(messageItem.type)) &&
                            (filter.folder          === undefined || Filter(filter.folder).match(messageItem.folder)) &&
                            (filter.startTimestamp  === undefined || (messageItem.timestamp >= filter.startTimestamp)) &&
                            (filter.endTimestamp    === undefined || (messageItem.timestamp <= filter.endTimestamp)) &&
                            (filter.from            === undefined || Filter(filter.from).match(messageItem.from)) &&
                            (filter.to              === undefined || Filter(filter.to).match(messageItem.to)) &&
                            (filter.cc              === undefined || Filter(filter.cc).match(messageItem.cc)) &&
                            (filter.bcc             === undefined || Filter(filter.bcc).match(messageItem.bcc)) &&
                            (filter.body            === undefined || Filter(filter.body).match(messageItem.body)) &&
                            (filter.isRead          === undefined || (messageItem.isRead === filter.isRead)) &&
                            (filter.messagePriority === undefined || (messageItem.priority === filter.messagePriority)) &&
                            (filter.subject         === undefined || Filter(filter.subject).match(messageItem.subject))) {
                            message = utils.copy(messageItem);
                            result.push(message);
                        }
                    });
                });
                successCallback(result);
            }
            return wac2_utils.validateTypeMismatch(successCallback, errorCallback, "findMessages", _pendingOperate(_findMessages));
        },

        onSMS: function (messageHandler) {
            return _onMessage("onSMS", messageHandler);
        },

        onMMS: function (messageHandler) {
            return _onMessage("onMMS", messageHandler);
        },

        onEmail: function (messageHandler) {
            return _onMessage("onEmail", messageHandler);
        },

        unsubscribe: function (subscriptionHandler) {
            var onMessage, idSubscribe;

            utils.validateArgumentType(subscriptionHandler, "integer",
                null, "subscriptionHandler invalid function parameter",
                new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));

            for (onMessage in _subscriber) {
                for (idSubscribe in _subscriber[onMessage]) {
                    if (idSubscribe == subscriptionHandler) {
                        delete _subscriber[onMessage][idSubscribe];
                        return;
                    }
                }
            }
        },

        handleSubFeatures: function (subFeatures) {
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
    };

    messaging.__defineGetter__("TYPE_SMS", function () {
        return 1;
    });

    messaging.__defineGetter__("TYPE_MMS", function () {
        return 2;
    });

    messaging.__defineGetter__("TYPE_EMAIL", function () {
        return 3;
    });

    messaging.__defineGetter__("FOLDER_INBOX", function () {
        return 1;
    });

    messaging.__defineGetter__("FOLDER_OUTBOX", function () {
        return 2;
    });

    messaging.__defineGetter__("FOLDER_DRAFTS", function () {
        return 3;
    });

    messaging.__defineGetter__("FOLDER_SENTBOX", function () {
        return 4;
    });

    return messaging;
};

MessageSendCallback = {
    onsuccess: function () {},
    onmessagesendsuccess: function (recipient) {},
    onmessagesenderror: function (error, recipient) {}
};

Message = function (type) {
    this.id = Math.uuid(null, 16);
    this.type = type;
    this.folder = 0;
    this.timestamp = new Date();
    this.from = "";
    this.to = [""];
    this.cc = [""];
    this.bcc = [""];
    this.body = "";
    this.isRead = false;
    this.priority = false;
    this.subject = "";
    this.attachments = [""];

    this.update = function (successCallback, errorCallback) {
        function _update() {
            var isFound = false;

            if (!_security.all && !_security.update)
                return _errorOccurred(errorCallback, errorcode.SECURITY_ERR);

            TypeCoerce(new Message(0)).cast(this);
            _get();
            utils.forEach(_messages[this.folder], function (messageItem) {
                if (messageItem.id === this.id) {
                    !this.isRead || (messageItem.isRead = this.isRead);
                    if (this.folder === _self().FOLDER_DRAFTS) {
                        !this.type   || (messageItem.type        = this.type);
                        !this.to          || (messageItem.to          = utils.copy(this.to));
                        !this.cc          || (messageItem.cc          = utils.copy(this.cc));
                        !this.bcc         || (messageItem.bcc         = utils.copy(this.bcc));
                        !this.body        || (messageItem.body        = this.body);
                        !this.priority    || (messageItem.priority    = this.priority);
                        !this.subject     || (messageItem.subject     = this.subject);
                        !this.attachments || (messageItem.attachments = utils.copy(this.attachments));
                    }
                    isFound = true;
                }
            });

            if (isFound) {
                _save();
                successCallback();
            } else {
                _errorOccurred(errorCallback, errorcode.NOT_FOUND_ERR);
            }
        }
        return wac2_utils.validateTypeMismatch(successCallback, errorCallback, "update", _pendingOperate(_update, this));
    };
};

MessageFilter = {
    id: "",
    type: [0],
    folder: [0],
    startTimestamp: new Date(),
    endTimestamp: new Date(),
    from: "",
    to: [""],
    cc: [""],
    bcc: [""],
    body: "",
    isRead: false,
    messagePriority: false,
    subject: ""
};

Recipients = function () {
    this.to  = [];
    this.cc  = [];
    this.bcc = [];

    this.total = function () {
        return (this.to.length + this.cc.length + this.bcc.length);
    };
};

event.on("MessageReceived", function (message) {
    var onMessage;

    switch (message.type) {
    case "sms":
        message.type = _self().TYPE_SMS;
        onMessage = "onSMS";
        break;

    case "mms":
        message.type = _self().TYPE_MMS;
        onMessage = "onMMS";
        break;

    case "email":
        message.type = _self().TYPE_EMAIL;
        onMessage = "onEmail";
        break;

    default:
        break;
    }

    message.folder = _self().FOLDER_INBOX;
    _updateDB(message);
    utils.forEach(_subscriber[onMessage], function (subscriberCallback) {
        subscriberCallback(message);
    });
});

event.on("MessageSent", function (sentStatus) {
    _sentStatus = sentStatus;
});

module.exports = _self;
