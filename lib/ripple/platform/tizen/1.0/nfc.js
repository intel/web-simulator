/*
 *  Copyright 2012 Intel Corporation
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
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    NFCAdapter,
    NFCTag,
    NFCPeer,
    _data = {
        DB_NDEFRECORD_KEY : "tizen1-db-ndefrecord",
        INTERVAL : 1000,
        listener : {
            onTagDetected : {},
            onPeerDetected : {},
            onNDEFReceived : null
        },
        ndefMessage : {},
        pairedNFC : {},
        nfcAdapter : {},
        nfcTags : [],
        nfcPeer : {},
        isNear : false,     // Identify the device is whether near
        isDetectTag : false // Identify NFC tag is detected
    },
    _security = {
        "http://tizen.org/api/nfc": [],
        "http://tizen.org/api/nfc.tag": ["setTagListener", "unsetTagListener", "getCachedMessage", "readNDEF", "writeNDEF", "transceive", "formatNDEF"],
        "http://tizen.org/api/nfc.p2p": ["setPeerListener", "unsetPeerListener", "setReceiveNDEFListener", "unsetReceiveNDEFListener", "sendNDEF"],
        all: true
    },
    _self;

function _initialize () {
    var record1 = {
        tnf : 0,
        type : [3, 1, 5, 3],
        id : [4, 5, 2, 2],
        payload : ['a', 'b', 'f', 'd']
    },
    record2 = {
        tnf : 1,
        type : [1, 2, 3, 4],
        id : [4, 5, 2, 2],
        payload : ['f', 'h', 'e', 'k']
    },
    record3 = {
        tnf : 2,
        type : [6, 8, 3, 1],
        id : [5, 1, 8, 4],
        payload : ['g', 'c', 'b', 'i']
    },
    recordArray = [];

    recordArray.push(record1);
    recordArray.push(record2);
    recordArray.push(record3);
    recordArray = db.retrieveObject(_data.DB_NDEFRECORD_KEY) || recordArray;

    _data.ndefMessage = {
        recordCount : recordArray.length,
        records : recordArray,
        toByte : function () {
            var result = [], i;
            for (i in this.records) {
                result = result.concat(this.records[i].payload);
            }
            return result;
        }
    };

    _data.nfcAdapter = new NFCAdapter();
}

//validate the type match
function _validateCallbackType(onSuccess, onError) {
    if (onSuccess &&
        typeof onSuccess !== "function" &&
        typeof onSuccess !== "object") {
        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
    }
    if (onError) {
        tizen1_utils.validateArgumentType(onError, "function",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    }
    tizen1_utils.validateArgumentType(onSuccess.onattach, "function",
        new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    tizen1_utils.validateArgumentType(onSuccess.ondetach, "function",
        new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
}

_self = function () {
    function getDefaultAdapter() {
        if (arguments.length > 0)
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

        if (!_data.nfcAdapter)
            throw new WebAPIError(errorcode.UNKNOWN_ERR);

        return _data.nfcAdapter;
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

    var nfc = {
        getDefaultAdapter: getDefaultAdapter,
        handleSubFeatures: handleSubFeatures
    };

    nfc.__defineGetter__("NFC_RECORD_TNF_EMPTY", function () {
        return 0;
    });

    nfc.__defineGetter__("NFC_RECORD_TNF_WELL_KNOWN", function () {
        return 1;
    });

    nfc.__defineGetter__("NFC_RECORD_TNF_MIME_MEDIA", function () {
        return 2;
    });

    nfc.__defineGetter__("NFC_RECORD_TNF_URI", function () {
        return 3;
    });

    nfc.__defineGetter__("NFC_RECORD_TNF_EXTERNAL_RTD", function () {
        return 4;
    });

    nfc.__defineGetter__("NFC_RECORD_TNF_UNKNOWN", function () {
        return 5;
    });

    nfc.__defineGetter__("NFC_RECORD_TNF_UNCHANGED", function () {
        return 6;
    });

    return nfc;
};

NFCAdapter = function () {
    var nfcAdapter,
        interval,
        powered = false, // Identify the device on or off
        polling = false; // Identify the device is polled

    // private
    function poll() {
        var pnm, nm, ndefRecord, remoteNdefRecord, index,
            isPeer = false;  // Identify NFC peer-to-peer target is detected

        if (!_data.isNear)
            return;

        _data.isNear = false;
        if (_data.isDetectTag) {
            for (nm in _data.ndefMessage.records) {
                for (pnm in _data.pairedNFC.records) {
                    ndefRecord = _data.ndefMessage.records[nm];
                    remoteNdefRecord = _data.pairedNFC.records[pnm];
                    if (ndefRecord.tnf === remoteNdefRecord.tnf &&
                        tizen1_utils.validateEqualArrays(ndefRecord.type, remoteNdefRecord.type)) {
                        isPeer = true; // NFC peer-to-peer target is detected.
                    }
                }
            }
            if (_data.listener.onTagDetected && _data.nfcTags) {
                for (index in _data.nfcTags) {
                    _data.listener.onTagDetected.onattach(_data.nfcTags[index]);
                }
            }
        }
        if (isPeer && _data.listener.onPeerDetected) {
            _data.listener.onPeerDetected.onattach(_data.nfcPeer);
        }
    }

    // public
    // Turns NFC adapter on or off.
    function setPowered(state, successCallback, errorCallback) {
        tizen1_utils.validateArgumentType(state, "boolean",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        powered = state;
        if (!powered) {
            clearInterval(interval);
        }
        successCallback(powered);
    }

    // Starts/stops polling for targets.
    function setPolling(state, successCallback, errorCallback) {
        tizen1_utils.validateArgumentType(state, "boolean",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (!powered)
            return;

        polling = state;
        if (polling) {
            interval = setInterval(poll, _data.INTERVAL);
        }
        successCallback(polling);
    }

    // Registers a callback function to invoke when NFC tag is detected.
    function setTagListener(detectCallback, errorCallback, tagFilter) {
        var nfcTag, index;

        if (!_security.all && !_security.setTagListener)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        _validateCallbackType(detectCallback, errorCallback);

        if (tagFilter) {
            tizen1_utils.validateArgumentType(tagFilter, "array",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }
        if (!powered) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        for (index in tagFilter) {
            nfcTag = new NFCTag(tagFilter[index], true, 1, null, true);
            _data.nfcTags.push(nfcTag);
        }
        _data.listener.onTagDetected = detectCallback;
    }

    // Registers a callback function to be invoked when NFC peer-to-peer target is detected.
    function setPeerListener(detectCallback, errorCallback) {
        if (!_security.all && !_security.setPeerListener)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        _validateCallbackType(detectCallback, errorCallback);

        if (!polling) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        _data.nfcPeer = new NFCPeer(true);
        _data.listener.onPeerDetected = detectCallback;
    }

    // Unregisters the listener for detecting an NFC tag.
    function unsetTagListener() {
        if (!_security.all && !_security.unsetTagListener)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (!polling || !_data.listener.onTagDetected)
            return;

        _data.listener.onTagDetected = null;
    }

    // Unregisters the listener for detecting an NFC peer-to-peer target.
    function unsetPeerListener() {
        if (!_security.all && !_security.unsetPeerListener)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (!polling || !_data.listener.onPeerDetected)
            return;

        _data.listener.onPeerDetected = null;
    }

    // Gets NDEF message cached when the tag is detected.
    function getCachedMessage() {
        if (!_security.all && !_security.getCachedMessage)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        return _data.pairedNFC || {
            recordCount : 0,
            records : [],
            toByte : function () {
                var result = [], i;
                for (i in this.records) {
                    result = result.concat(this.records[i].payload);
                }
                return result;
            }
        };
    }

    nfcAdapter = {
        setPowered : setPowered,
        setPolling : setPolling,
        setTagListener : setTagListener,
        setPeerListener : setPeerListener,
        unsetTagListener : unsetTagListener,
        unsetPeerListener : unsetPeerListener,
        getCachedMessage : getCachedMessage
    };

    nfcAdapter.__defineGetter__("powered", function () {
        return powered;
    });

    nfcAdapter.__defineGetter__("polling", function () {
        return polling;
    });

    return nfcAdapter;
};

NFCTag = function (type, isSupportedNDEF, ndefSize, properties, isConnected) {
    var nfcTag,
        formatNDEF = false;

    type = type || null;
    isSupportedNDEF = isSupportedNDEF || false;
    ndefSize = 1;
    properties = null;
    isConnected = isConnected || false;

    // Reads NDEF data.
    function readNDEF(readCallback, errorCallback) {
        function _readNDEF() {
            if (!isConnected || !isSupportedNDEF) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }

            readCallback(_data.ndefMessage);
        }

        if (!_security.all && !_security.readNDEF)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateTypeMismatch(readCallback, errorCallback, "nfc:readNDEF", _readNDEF);
    }

    // Writes NDEF data.
    function writeNDEF(ndefMessage, successCallback, errorCallback) {
        if (!_security.all && !_security.writeNDEF)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        tizen1_utils.validateArgumentType(ndefMessage, "object",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (!isConnected || !isSupportedNDEF) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }

        _data.ndefMessage = ndefMessage;
        db.saveObject(_data.DB_NDEFRECORD_KEY, _data.ndefMessage.records);
        successCallback();
    }

    // Access the raw format card.
    function transceive(data, dataCallback, errorCallback) {
        function _transceive() {
            if (!tizen1_utils.isValidArray(data))
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

            if (!isConnected || !isSupportedNDEF || !formatNDEF) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }

            dataCallback(data);
        }

        if (!_security.all && !_security.transceive)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateTypeMismatch(dataCallback, errorCallback, "nfc:transceive", _transceive);
    }

    // Formats the detected tag that can store NDEF messages.
    function formatNDEF(successCallback, errorCallback, key) {
        if (!_security.all && !_security.formatNDEF)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        if (key) {
            tizen1_utils.validateArgumentType(key, "array",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }

        if (!isConnected || !isSupportedNDEF) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }

        formatNDEF = true;
        successCallback();
    }

    nfcTag = {
        readNDEF : readNDEF,
        writeNDEF : writeNDEF,
        transceive : transceive,
        formatNDEF : formatNDEF
    };

    nfcTag.__defineGetter__("type", function () {
        return type;
    });

    nfcTag.__defineGetter__("isSupportedNDEF", function () {
        return isSupportedNDEF;
    });

    nfcTag.__defineGetter__("ndefSize", function () {
        return ndefSize;
    });

    nfcTag.__defineGetter__("properties", function () {
        return properties;
    });

    nfcTag.__defineGetter__("isConnected", function () {
        return isConnected;
    });

    return nfcTag;
};

NFCPeer = function (isConnected) {
    var nfcPeer;

    isConnected = isConnected || false;

    // Registers a callback function to be invoked when NDEF message is received from NFC peer-to-peer target connected.
    function setReceiveNDEFListener(successCallback, errorCallback) {
        function _setReceiveNDEFListener() {
            if (!isConnected) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            _data.listener.onNDEFReceived = successCallback;
        }

        if (!_security.all && !_security.setReceiveNDEFListener)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "nfc:setReceiveNDEFListener", _setReceiveNDEFListener);
    }

    // Unregisters the listener for receiving NDEFMessage from NFC peer-to-peer target connected.
    function unsetReceiveNDEFListener() {
        if (!_security.all && !_security.unsetReceiveNDEFListener)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        if (!isConnected) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }

        _data.listener.onNDEFReceived = null;
    }

    // Sends data to NFC peer-to-peer target.
    function sendNDEF(ndefMessage, successCallback, errorCallback) {
        if (!_security.all && !_security.sendNDEF)
            throw new WebAPIError(errorcode.SECURITY_ERR);

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        tizen1_utils.validateArgumentType(ndefMessage, "object",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (!isConnected) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }

        event.trigger("PairedNDEFReceived", [ndefMessage]);
        successCallback();
    }

    nfcPeer = {
        setReceiveNDEFListener : setReceiveNDEFListener,
        unsetReceiveNDEFListener : unsetReceiveNDEFListener,
        sendNDEF : sendNDEF
    };

    nfcPeer.__defineGetter__("isConnected", function () {
        return isConnected;
    });

    return nfcPeer;
};

_initialize();

event.on("NFCDeviceApproached", function (devInfo) {
    _data.isNear = true;
    if (devInfo && devInfo.ndefMessage) {
        _data.isDetectTag = true;
        _data.pairedNFC = devInfo.ndefMessage;
        setTimeout(function () {
            if (typeof _data.listener.onNDEFReceived === "function") {
                _data.listener.onNDEFReceived(_data.pairedNFC);
            }
        }, _data.INTERVAL);
    }
});

module.exports = _self;
