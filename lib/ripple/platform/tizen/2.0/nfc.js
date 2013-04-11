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
    utils = require('ripple/utils'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    NDEFRecord = require('ripple/platform/tizen/2.0/NDEFRecord'),
    NDEFMessage = require('ripple/platform/tizen/2.0/NDEFMessage'),
    _NFC_TAG = "tizen1.0-nfc-tag",
    _NFC_PEER = "tizen1.0-nfc-peer",
    _NFC_OUTPUT_MESSAGE = "tizen1.0-nfc-output-message",
    NFCAdapter, NFCTag, NFCPeer,
    tag,
    peer,
    isPeerConnected = false,
    _data = {
        INTERVAL : 1000,
        listener : {
            onCardEmulationChanged : null,
            onTagDetected : null,
            onPeerDetected : null,
            onNDEFReceived : null
        },
        pairedNFC : null,
        nfcAdapter : {},
        nfcCardEmulation : {},
        nfcTags : [],
        nfcTag: {},
        nfcPeer : {},
        isNear : false,     // Identify the device is whether near
        isDetectTag : false, // Identify NFC tag is detected
        connectedState : false
    },
    _security = {
        "http://tizen.org/privilege/nfc.admin": ["setPowered"],
        "http://tizen.org/privilege/nfc.common": ["getDefaultAdapter", "getCachedMessage", "toByte"],
        "http://tizen.org/privilege/nfc.p2p": ["setPeerListener", "unsetPeerListener", "setReceiveNDEFListener", "unsetReceiveNDEFListener", "sendNDEF"],
        "http://tizen.org/privilege/nfc.tag": ["setTagListener", "unsetTagListener", "readNDEF", "writeNDEF", "transceive"],
        all: true
    },
    _self;

//validate the type match
function _validateCallbackType(onSuccess) {
    if (onSuccess &&
        typeof onSuccess !== "function" &&
        typeof onSuccess !== "object") {
        throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
    }
    tizen1_utils.validateArgumentType(onSuccess.onattach, "function",
        new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
    tizen1_utils.validateArgumentType(onSuccess.ondetach, "function",
        new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
}

_self = function () {
    function getDefaultAdapter() {
        if (!_security.all && !_security.getDefaultAdapter) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        if (arguments.length > 0) {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!_data.nfcAdapter) {
            throw new WebAPIError(errorcode.UNKNOWN_ERR);
        }

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
        polling = false, // Identify the device is polled
        seType = "NONE"; // Identify card emulation type
        
    event.trigger("nfc-power-changed", [powered]);
    event.on("nfc-power-setting", function (status) {
        _updatePowerStatus(status);   
    });
    event.on("nfc-attach-setting", function (type, isAttached) {
        var isDetectTag;
        isDetectTag = type === "Tag" ? true : false;
        _updateIsNear(isDetectTag, isAttached);
    });
    event.on("nfc-tag-send", function (status) {
        if (status) {
            tag = db.retrieveObject(_NFC_TAG);
            if (tag.isSupportedNDEF) {
                _data.nfcTag = new NFCTag(tag.type, tag.isSupportedNDEF, tag.ndefSize, null, true, tag.ndefs);
            } else {
                _data.nfcTag = new NFCTag(tag.type, tag.isSupportedNDEF, tag.ndefSize, null, true, tag.rawData);
            }
            if (_data.listener.onTagDetected) {
                _data.listener.onTagDetected.onattach(_data.nfcTag);
            }
        } else {
            tag = {};
            if (_data.listener.onTagDetected) {
                _data.listener.onTagDetected.ondetach();
            }
        }
    });
    event.on("nfc-peer-send", function (status) {
        if (status) {
            _data.nfcPeer = new NFCPeer(true);
            if (_data.listener.onPeerDetected) {
                _data.listener.onPeerDetected.onattach(_data.nfcPeer);
            }
            isPeerConnected = true;
        } else {
            if (_data.listener.onPeerDetected) {
                _data.listener.onPeerDetected.ondetach();
            }
            isPeerConnected = false;
        }
    });
    event.on("nfc-peer-sending-ndef", function () {
        var _records = [], rec, _ndef;
        if (isPeerConnected) {
            peer = db.retrieveObject(_NFC_PEER);
            for(i in peer.ndef.records) {
                rec = peer.ndef.records[i];
                _records.push(new NDEFRecord(rec.tnf, rec.type, rec.payload, rec.id));
            }
            _ndef = new NDEFMessage(_records);
            if (_data.listener.onNDEFReceived) {
                _data.listener.onNDEFReceived(_ndef);
            }
        }
    });

    // private
    function _updatePowerStatus(status) {
        if (powered === status) {
            return;
        }
        if (!status) {
            _updateIsNear(_data.isDetectTag, false);
            _data.listener.onTagDetected = null;
            _data.listener.onPeerDetected = null;
            _data.listener.onNDEFReceived = null;
            _data.listener.onCardEmulationChanged = null;
        }
        powered = status;
        _updatePollingStatus(status);

        event.trigger("nfc-power-changed", [powered]);
    }
    function _updatePollingStatus(status) {
        if (!powered)
            return;
        if (polling === status) {
            return;
        }
        polling = status;
        event.trigger("nfc-polling-changed", [polling]);
        if (polling) {
            interval = setInterval(poll, _data.INTERVAL);
        } else {
            clearInterval(interval);
        }
    }
    function _updateIsNear(isDetectTag, isAttached) {
        _data.isDetectTag = isDetectTag;
        _data.isNear = isAttached;
        if (!_data.isNear) {
            _data.connectedState = false;
            event.trigger("nfc-connectedState-changed", [false]);
        }
    }
    function poll() {
        if (!_data.isNear) {
            return;
        }
        if (!_data.connectedState) {
            _data.connectedState = true;
            event.trigger("nfc-connectedState-changed", [true]);

        }
    }

    // public
    // Turns NFC adapter on or off.
    function setPowered(state, successCallback, errorCallback) {
        if (!_security.all && !_security.setPowered) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateArgumentType(state, "boolean",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        _updatePowerStatus(state);
        if (successCallback) {
            successCallback();
        }
    }

    function setCardEmulation(_seType, successCallback, errorCallback) {
        var originalType;
        if (!_security.all && !_security.setCardEmulation) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        switch (_seType) {
        case "NONE":
        case "UICC":
            break;
        default:
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }

        if (!powered) {
            return;
        }

        originalType = seType;
        seType = _seType;

        if (_data.listener.onCardEmulationChanged && originalType !== seType) {
            _data.listener.onCardEmulationChanged(seType);
        }
        if (successCallback) {
            successCallback();
        }
    }

    function setCardEmulationChangeListener(changeCallback) {
        if (!_security.all && !_security.setCardEmulationChangeListener) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        tizen1_utils.validateArgumentType(changeCallback, "function",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        if (!powered) {
            return;
        }
        _data.listener.onCardEmulationChanged = changeCallback;
    }

    function unsetCardEmulationChangeListener() {
        if (!_security.all && !_security.unsetCardEmulationChangeListener) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        if (!powered || !_data.listener.onCardEmulationChanged) {
            return;
        }

        _data.listener.onCardEmulationChanged = null;
    }

    // Registers a callback function to invoke when NFC tag is detected.
    function setTagListener(detectCallback, tagFilter) {
        if (!_security.all && !_security.setTagListener) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        _validateCallbackType(detectCallback);

        if (tagFilter) {
            tizen1_utils.validateArgumentType(tagFilter, "array",
                new WebAPIError(errorcode.TYPE_MISMATCH_ERR));
        }
        //TODO: tagFilter support
        if (!powered) {
            return;
        }
        _data.listener.onTagDetected = detectCallback;
    }

    // Registers a callback function to be invoked when NFC peer-to-peer target is detected.
    function setPeerListener(detectCallback) {
        if (!_security.all && !_security.setPeerListener) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        _validateCallbackType(detectCallback);

        if (!powered) {
            return;
        }
        _data.listener.onPeerDetected = detectCallback;
    }

    // Unregisters the listener for detecting an NFC tag.
    function unsetTagListener() {
        if (!_security.all && !_security.unsetTagListener) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (!powered || !_data.listener.onTagDetected) {
            return;
        }

        _data.listener.onTagDetected = null;
    }

    // Unregisters the listener for detecting an NFC peer-to-peer target.
    function unsetPeerListener() {
        if (!_security.all && !_security.unsetPeerListener) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        if (!powered || !_data.listener.onPeerDetected) {
            return;
        }

        _data.listener.onPeerDetected = null;
    }

    // Gets NDEF message cached when the tag is detected.
    function getCachedMessage() {
        if (!_security.all && !_security.getCachedMessage) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        return _data.pairedNFC || new NDEFMessage([]);
    }

    nfcAdapter = {
        setPowered : setPowered,
        //setCardEmulation: setCardEmulation,
        //setCardEmulationChangeListener: setCardEmulationChangeListener,
        //unsetCardEmulationChangeListener: unsetCardEmulationChangeListener,
        setTagListener : setTagListener,
        setPeerListener : setPeerListener,
        unsetTagListener : unsetTagListener,
        unsetPeerListener : unsetPeerListener,
        getCachedMessage : getCachedMessage
    };

    nfcAdapter.__defineGetter__("powered", function () {
        return powered;
    });

    nfcAdapter.__defineGetter__("seType", function () {
        return seType;
    });

    return nfcAdapter;
};

NFCTag = function (type, isSupportedNDEF, ndefSize, properties, isConnected, ndefs) {
    var nfcTag, i, j,
        _ndefs,
        rec,
        _records,
        _ndefs_index = 0;
        
    type = type || null;
    isSupportedNDEF = isSupportedNDEF || false;
    ndefSize = ndefSize || 1;
    properties = null;
    isConnected = isConnected || false;

    _ndefs = [];
    for (i in ndefs) {
        _records = [];
        for (j in ndefs[i].records) {
            rec = ndefs[i].records[j];
            _records.push(new NDEFRecord(rec.tnf, rec.type, rec.payload, rec.id));
        }
        _ndefs.push(new NDEFMessage(_records));
    }

    // Reads NDEF data.
    function readNDEF(readCallback, errorCallback) {
        if (!_security.all && !_security.readNDEF) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        function _readNDEF() {
            if (!isConnected || !isSupportedNDEF) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            if (_ndefs_index >= ndefSize) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            } else {
                _data.pairedNFC = _ndefs[_ndefs_index];
                readCallback(_ndefs[_ndefs_index]);
                _ndefs_index++;
            }
        }

        tizen1_utils.validateTypeMismatch(readCallback, errorCallback, "nfc:readNDEF", _readNDEF);
    }

    // Writes NDEF data.
    function writeNDEF(ndefMessage, successCallback, errorCallback) {
        if (!_security.all && !_security.writeNDEF) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        tizen1_utils.validateArgumentType(ndefMessage, "object",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (!isConnected || !isSupportedNDEF) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }
        db.saveObject(_NFC_OUTPUT_MESSAGE, ndefMessage);
        event.trigger("nfc-output-msg", []);
        if (successCallback) {
            successCallback();
        }
    }

    // Access the raw format card.
    function transceive(data, dataCallback, errorCallback) {
        if (!_security.all && !_security.transceive) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        function _transceive() {
            if (!tizen1_utils.isValidArray(data))
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);

            if (!isConnected || isSupportedNDEF) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            db.saveObject(_NFC_OUTPUT_MESSAGE, data);
            event.trigger("nfc-output-msg", []);
            dataCallback(ndefs);
        }

        tizen1_utils.validateTypeMismatch(dataCallback, errorCallback, "nfc:transceive", _transceive);
    }

    // Formats the detected tag that can store NDEF messages.
    function formatNDEF(successCallback, errorCallback, key) {

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

        successCallback();
    }

    nfcTag = {
        readNDEF : readNDEF,
        writeNDEF : writeNDEF,
        transceive : transceive,
        //formatNDEF : formatNDEF
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
        if (!_security.all && !_security.setReceiveNDEFListener) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }
        function _setReceiveNDEFListener() {
            if (!isConnected) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            _data.listener.onNDEFReceived = successCallback;
        }

        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "nfc:setReceiveNDEFListener", _setReceiveNDEFListener);
    }

    // Unregisters the listener for receiving NDEFMessage from NFC peer-to-peer target connected.
    function unsetReceiveNDEFListener() {
        if (!_security.all && !_security.unsetReceiveNDEFListener) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        _data.listener.onNDEFReceived = null;
    }

    // Sends data to NFC peer-to-peer target.
    function sendNDEF(ndefMessage, successCallback, errorCallback) {
        if (!_security.all && !_security.sendNDEF) {
            throw new WebAPIError(errorcode.SECURITY_ERR);
        }

        tizen1_utils.validateCallbackType(successCallback, errorCallback);

        tizen1_utils.validateArgumentType(ndefMessage, "object",
            new WebAPIError(errorcode.TYPE_MISMATCH_ERR));

        if (!isConnected) {
            if (errorCallback) {
                errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
            }
            return;
        }

        db.saveObject(_NFC_OUTPUT_MESSAGE, ndefMessage);
        event.trigger("nfc-output-msg", []);
        if (successCallback) {
            successCallback();
        }
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

function _initialize() {
    _data.nfcAdapter = new NFCAdapter();
}
_initialize();

module.exports = _self;

