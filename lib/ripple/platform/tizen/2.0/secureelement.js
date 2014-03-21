/*
 *  Copyright 2014 Intel Corporation.
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
    event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    Reader,
    ReaderInternal,
    Session,
    SessionInternal,
    Channel,
    _data = {
        APDU_COMMANDS:        null,
        DB_SECUREELEMENT_KEY: "tizen-secureelement",
        readers:              [],
        listeners:            {},
        nListener:            0,
        internal:             [],
        dbStorage:            null
    },
    _security = {
        "http://tizen.org/privilege/secureelement": ["getReaders",
                "registerSEListener", "unregisterSEListener", "shutdown",
                "getName", "openSession", "closeSessions", "openBasicChannel",
                "openLogicalChannel", "getATR", "close", "closeChannels",
                "transmit"]
    },
    _self;

function _get() {
    _data.dbStorage = db.retrieveObject(_data.DB_SECUREELEMENT_KEY) || [];
}

function _save() {
    db.saveObject(_data.DB_SECUREELEMENT_KEY, _data.dbStorage);
}

function _getCurrentAppId() {
    return tizen.application.getCurrentApplication().appInfo.id;
}

function _initialize() {
    /*
     *  INS   RESPONSE         COMMAND
     */

    _data.APDU_COMMANDS = {
        0xb0: [0x90, 0x00], // READ BINARY *
        0xd0: [0x90, 0x00], // WRITE BINARY
        0xd6: [0x90, 0x00], // UPDATE BINARY
        0x0e: [0x90, 0x00], // ERASE BINARY
        0xb2: [0x90, 0x00], // READ RECORD *
        0xd2: [0x90, 0x00], // WRITE RECORD
        0xe2: [0x90, 0x00], // APPEND RECORD
        0xdc: [0x90, 0x00], // UPDATE RECORD
        0xca: [0x90, 0x00], // GET DATA *
        0xda: [0x90, 0x00], // PUT DATA
        0xa4: [0x69, 0x00], // SELECT FILE *
        0x20: [0x90, 0x00], // VERIFY
        0x88: [0x90, 0x00], // INTERNAL AUTHENTICATE *
        0x82: [0x90, 0x00], // EXTERNAL AUTHENTICATE
        0x84: [0x90, 0x00], // GET CHALLENGE *
        0x70: [0x69, 0x00], // MANAGE CHANNEL *
        0xc0: [0x90, 0x00], // GET RESPONSE *
        0xc2: [0x90, 0x00]  // ENVELOPE *
    };

    _get();

    _data.dbStorage.forEach(function (dbReader) {
        var reader;

        reader = new ReaderInternal(dbReader);
        _data.internal.push(reader);
        _data.readers.push(new Reader(reader));
    });

    event.on("ReaderChanged", function (name, isPresent) {
        _data.internal.some(function (reader, index) {
            var i;

            if (reader.name !== name)
                return false;

            reader.isPresent = isPresent;
            _data.dbStorage[index].isPresent = isPresent;

            if (isPresent) {
                for (i in _data.listeners) {
                    _data.listeners[i].onSEReady(_data.readers[index]);
                }
            } else {
                _data.readers[index].closeSessions();
                for (i in _data.listeners) {
                    _data.listeners[i].onSENotReady(_data.readers[index]);
                }
            }

            return true;
        });

        _save();
    });
}

_self = function () {
    var secureelement;

    // public
    function getReaders(successCallback, errorCallback) {
        if (!_security.getReaders) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.SEService("getReaders", arguments);

        window.setTimeout(function () {
            if (_data.readers.length === 0) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            successCallback(_data.readers);
        }, 1);
    }

    function registerSEListener(listener) {
        var id;

        if (!_security.registerSEListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.SEService("registerSEListener", arguments);

        id = ++_data.nListener;
        _data.listeners[id] = listener;

        return id;
    }

    function unregisterSEListener(id) {
        if (!_security.unregisterSEListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.SEService("unregisterSEListener", arguments);

        if (!_data.listeners[id])
            return;

        delete _data.listeners[id];
    }

    function shutdown() {
        if (!_security.shutdown) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.SEService("shutdown", arguments);

        _data.readers.forEach(function (reader) {
            reader.closeSessions();
        });
        _data.internal.forEach(function (reader) {
            reader.isPresent = false;
        });

        event.trigger("ReadersClosed");

        window.setTimeout(function () {
            _data.readers.forEach(function (reader) {
                for (var i in _data.listeners) {
                    _data.listeners[i].onSENotReady(reader);
                }
            });
        }, 1);
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    secureelement = {
        getReaders:           getReaders,
        registerSEListener:   registerSEListener,
        unregisterSEListener: unregisterSEListener,
        shutdown:             shutdown,
        handleSubFeatures:    handleSubFeatures
    };

    return secureelement;
};

Reader = function (reader) {
    // public
    function getName() {
        if (!_security.getName) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Reader("getName", arguments);

        return reader.name;
    }

    function openSession(successCallback, errorCallback) {
        if (!_security.openSession) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Reader("openSession", arguments);

        window.setTimeout(function () {
            var session;

            if (!reader.isPresent) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_STATE_ERR));
                }
                return;
            }

            session = new SessionInternal();
            reader.sessions.push(session);

            successCallback(session.external);
        }, 1);
    }

    function closeSessions() {
        if (!_security.closeSessions) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Reader("closeSessions", arguments);

        if (!reader.isPresent)
            return;

        if (reader.sessions.length === 0)
            return;

        reader.sessions.forEach(function (session) {
            session.external.close();
        });

        reader.sessions = [];
    }

    this.__defineGetter__("isPresent", function () {
        return reader.isPresent;
    });

    reader.sessions    = [];

    this.getName       = getName;
    this.openSession   = openSession;
    this.closeSessions = closeSessions;
};

Session = function (channels) {
    var session = {};

    // private
    function openChannel(isBasic, aid, successCallback, errorCallback) {
        window.setTimeout(function () {
            var channel, peers, appId;

            if (session.isClosed) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_STATE_ERR));
                }
                return;
            }

            if ((aid.length < 5) || (aid.length > 16)) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(
                            errorcode.INVALID_VALUES_ERR));
                }
                return;
            }

            if (isBasic) {
                appId = _getCurrentAppId();

                if (session.locker !== null) {
                    if (session.locker === appId) {
                        channel = channels.basic[0];
                        successCallback(channel);
                    } else if (errorCallback) {
                        errorCallback(new WebAPIError(errorcode.SECURITY_ERR));
                    }
                    return;
                }

                session.locker = appId;
                peers = channels.basic;
            } else {
                peers = channels.logical;
            }

            channel = new Channel(isBasic, aid);
            peers.push(channel);

            successCallback(channel);
        }, 1);
    }

    function closeChannel(channels) {
        channels.forEach(function (channel) {
            channel.close();
        });
    }

    // public
    function openBasicChannel(aid, successCallback, errorCallback) {
        if (!_security.openBasicChannel) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Session("openBasicChannel", arguments);

        openChannel(true, aid, successCallback, errorCallback);
    }

    function openLogicalChannel(aid, successCallback, errorCallback) {
        if (!_security.openLogicalChannel) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Session("openLogicalChannel", arguments);

        openChannel(false, aid, successCallback, errorCallback);
    }

    function getATR() {
        /*
         * +--+--+---+---+---+---+---+---+---+--------------------+---+
         * |TS|T0|TA1|TB1|TC1|TD1|TD2|TA3|TB3|    History Bytes   |TCK|
         * |3B|F7|13 |00 |00 |81 |31 |FE |45 |54 49 5A 45 4E 33 30|A0 |
         * ------------------------------------------------------------
         *  T0                Y1 = 0xF(TA1, TB1, TC1, TD1), k = 7
         *  TD1               Y2 = 0x8(TD2), T = 1
         *  TD2               Y3 = 0x3(TA3, TB3), T = 1
         *  History Bytes     T1 ~ Tk = 'TIZEN30'
         *  Tck               XOR T0 ~ Tk
         * +----------------------------------------------------------+
         */

        var atr = [0x3B, 0xF7, 0x13, 0x00, 0x00, 0x81, 0x31, 0xFE, 0x45, 0x54,
                   0x49, 0x5A, 0x45, 0x4E, 0x33, 0x30, 0xA0];

        if (!_security.getATR) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (session.isClosed) {
            throw new WebAPIException(errorcode.UNKNOWN_ERR);
        }

        t.Session("getATR", arguments);

        return atr.slice(0);
    }

    function close() {
        if (!_security.close) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Session("close", arguments);

        if (session.isClosed)
            return;

        closeChannels();
        session.isClosed = true;
    }

    function closeChannels() {
        var type;

        if (!_security.closeChannels) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Session("closeChannels", arguments);

        if (session.isClosed)
            return;

        if ((channels.basic.length === 0) && (channels.logical.length === 0))
            return;

        for (type in channels) {
            closeChannel(channels[type]);
            channels[type] = [];
        }
        session.locker = null;
    }

    session.isClosed = false;
    session.locker   = null;
    channels.basic   = [];
    channels.logical = [];

    this.__defineGetter__("isClosed", function () {
        return session.isClosed;
    });

    this.openBasicChannel   = openBasicChannel;
    this.openLogicalChannel = openLogicalChannel;
    this.getATR             = getATR;
    this.close              = close;
    this.closeChannels      = closeChannels;
};

Channel = function (isBasic, aid) {
    var channel = {};

    // private
    function getResponse(command) {
        var response;

        if (!command[1])
            return [0x67, 0x00];

        response = _data.APDU_COMMANDS[command[1]];
        if (!response)
            return [0x6d, 0x00];

        return response;
    }

    function isTransmitted(response) {
        return ((response[0] === 0x90) && (response[1] === 0x00));
    }

    // public
    function close() {
        if (!_security.close) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Channel("close", arguments);

        if (channel.isClosed)
            return;

        channel.isClosed = true;
    }

    function transmit(command, successCallback, errorCallback) {
        if (!_security.transmit) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.Channel("transmit", arguments);

        window.setTimeout(function () {
            var response;

            if (channel.isClosed) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.INVALID_STATE_ERR));
                }
                return;
            }

            response = getResponse(command);
            if (!isTransmitted((response))) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.SECURITY_ERR));
                }
                return;
            }

            event.trigger("SETransmitted", [aid, command]);

            successCallback(response);
        }, 1);
    }

    channel.isBasicChannel = !!isBasic;
    channel.isClosed       = false;

    this.__defineGetter__("isBasicChannel", function () {
        return channel.isBasicChannel;
    });

    this.close    = close;
    this.transmit = transmit;
};

ReaderInternal = function (reader) {
    this.name      = reader.name;
    this.isPresent = reader.isPresent;
};

SessionInternal = function () {
    this.channels = {};
    this.external = new Session(this.channels);
};

_initialize();

module.exports = _self;
