/*
 *  Copyright 2013 Intel Corporation
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
    NDEFRecord = require('ripple/platform/tizen/2.0/NDEFRecordInternal'),
    NDEFMessage = require('ripple/platform/tizen/2.0/NDEFMessage'),
    NFCAdapter,
    NFCAdapterPrototype,
    NFCTag,
    NFCPeer,
    _data = {
        DB_NFC_TAG: "tizen1.0-nfc-tag",
        DB_NFC_PEER: "tizen1.0-nfc-peer",
        DB_NFC_OUTPUT_MESSAGE: "tizen1.0-nfc-output-message",
        INTERVAL: 1000,
        listener: {
            onCardEmulationChanged: null,
            onTagDetected: null,
            onPeerDetected: null,
            onNDEFReceived: null
        },
        pairedNFC: null,
        nfcAdapter: {},
        nfcCardEmulation: {},
        nfcTags: [],
        nfcTag: {},
        nfcPeer: {},
        isNear: false,      // Identify the device is whether near
        isDetectTag: false, // Identify NFC tag is detected
        isPeerConnected: false,
        connectedState: false
    },
    _security = {
        "http://tizen.org/privilege/nfc.admin": ["setPowered"],
        "http://tizen.org/privilege/nfc.common": ["getDefaultAdapter",
                "setExclusiveMode", "getCachedMessage"],
        "http://tizen.org/privilege/nfc.p2p": ["setPeerListener",
                "unsetPeerListener", "setReceiveNDEFListener",
                "unsetReceiveNDEFListener", "sendNDEF"],
        "http://tizen.org/privilege/nfc.tag": ["setTagListener",
                "unsetTagListener", "readNDEF", "writeNDEF", "transceive"]
    },
    _self;

_self = function () {
    var nfc, _exclusiveMode = false;

    function getDefaultAdapter() {
        if (!_security.getDefaultAdapter) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCManager("getDefaultAdapter", arguments);

        if (!_data.nfcAdapter) {
            throw new WebAPIException(errorcode.UNKNOWN_ERR);
        }

        return _data.nfcAdapter;
    }

    /* API Description:
     *   If it gets priority and it is in foreground, system doesn't
     *   send app controls that are usually sent when detecting NFC Tag
     *   or receiving NDEF Message from the connected NFC peer-to-peer target
     *
     * Implementation detail:
     *   due to simulator only support single running instance and doesn't have
     *   other app controls which be called by design. we just put some system
     *   exclusive mode info on the 'System Summary' panel
     */
    function setExclusiveMode(mode) {
        if (!_security.setExclusiveMode) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCManager("setExclusiveMode", arguments);

        _exclusiveMode = mode;
        jQuery("#NFCExclusiveModeValue").text(_exclusiveMode);
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    nfc = {
        getDefaultAdapter: getDefaultAdapter,
        setExclusiveMode:  setExclusiveMode,
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

NFCAdapterPrototype = function () {
    var nfcAdapterPrototype,
        interval,
        powered = false, // Identify the device on or off
        polling = false; // Identify the device is polled

    event.trigger("nfc-power-changed", [powered]);
    event.on("nfc-power-setting", function (status) {
        updatePowerStatus(status);
    });
    event.on("nfc-attach-setting", function (type, isAttached) {
        var isDetectTag;

        isDetectTag = (type === "Tag");
        updateIsNear(isDetectTag, isAttached);
    });
    event.on("nfc-tag-send", function (status) {
        var tag;

        if (status) {
            tag = db.retrieveObject(_data.DB_NFC_TAG);
            if (tag.isSupportedNDEF) {
                _data.nfcTag = new NFCTag(tag.type, tag.isSupportedNDEF,
                        tag.ndefSize, null, true, tag.ndefs);
            } else {
                _data.nfcTag = new NFCTag(tag.type, tag.isSupportedNDEF,
                        tag.ndefSize, null, true, tag.rawData);
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
            _data.isPeerConnected = true;
        } else {
            if (_data.listener.onPeerDetected) {
                _data.listener.onPeerDetected.ondetach();
            }
            _data.isPeerConnected = false;
        }
    });
    event.on("nfc-peer-sending-ndef", function () {
        var peer, _records = [], rec, _ndef, i;

        if (_data.isPeerConnected) {
            peer = db.retrieveObject(_data.DB_NFC_PEER);
            for (i in peer.ndef.records) {
                rec = peer.ndef.records[i];
                _records.push(new NDEFRecord(rec.tnf, rec.type, rec.payload,
                        rec.id));
            }
            _ndef = new NDEFMessage(_records);
            if (_data.listener.onNDEFReceived) {
                _data.listener.onNDEFReceived(_ndef);
            }
        }
    });

    // private
    function updatePowerStatus(status) {
        if (powered === status) {
            return;
        }
        if (!status) {
            updateIsNear(_data.isDetectTag, false);
            _data.listener.onTagDetected = null;
            _data.listener.onPeerDetected = null;
            _data.listener.onNDEFReceived = null;
            _data.listener.onCardEmulationChanged = null;
        }
        powered = status;
        updatePollingStatus(status);

        event.trigger("nfc-power-changed", [powered]);
    }

    function updatePollingStatus(status) {
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

    function updateIsNear(isDetectTag, isAttached) {
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
        if (!_security.setPowered) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCAdapter("setPowered", arguments);

        window.setTimeout(function () {
            updatePowerStatus(state);
            if (successCallback) {
                successCallback();
            }
        }, 1);
    }

    // Registers a callback function to invoke when NFC tag is detected.
    function setTagListener(detectCallback, tagFilter) {
        if (!_security.setTagListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCAdapter("setTagListener", arguments);

        //TODO: tagFilter support
        if (!powered) {
            return;
        }
        _data.listener.onTagDetected = detectCallback;
    }

    // Registers a callback function to be invoked when NFC peer-to-peer target is detected.
    function setPeerListener(detectCallback) {
        if (!_security.setPeerListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCAdapter("setPeerListener", arguments);

        if (!powered) {
            return;
        }
        _data.listener.onPeerDetected = detectCallback;
    }

    // Unregisters the listener for detecting an NFC tag.
    function unsetTagListener() {
        if (!_security.unsetTagListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (!powered || !_data.listener.onTagDetected) {
            return;
        }

        _data.listener.onTagDetected = null;
    }

    // Unregisters the listener for detecting an NFC peer-to-peer target.
    function unsetPeerListener() {
        if (!_security.unsetPeerListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        if (!powered || !_data.listener.onPeerDetected) {
            return;
        }

        _data.listener.onPeerDetected = null;
    }

    // Gets NDEF message cached when the tag is detected.
    function getCachedMessage() {
        if (!_security.getCachedMessage) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCAdapter("getCachedMessage", arguments);

        return _data.pairedNFC || new NDEFMessage([]);
    }

    nfcAdapterPrototype = {
        setPowered:        setPowered,
        setTagListener:    setTagListener,
        setPeerListener:   setPeerListener,
        unsetTagListener:  unsetTagListener,
        unsetPeerListener: unsetPeerListener,
        getCachedMessage:  getCachedMessage
    };

    nfcAdapterPrototype.__defineGetter__("powered", function () {
        return powered;
    });

    return nfcAdapterPrototype;
};

NFCAdapter = function () {
    this.__defineGetter__("powered", function () {
        return this.__proto__.powered;
    });
};

NFCAdapter.prototype = new NFCAdapterPrototype();

NFCTag = function (type, isSupportedNDEF, ndefSize, properties, isConnected, ndefs) {
    var nfcTag, i, j, _ndefs, rec, _records, _ndefs_index = 0;

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
            _records.push(new NDEFRecord(rec.tnf, rec.type, rec.payload,
                    rec.id));
        }
        _ndefs.push(new NDEFMessage(_records));
    }

    // Reads NDEF data.
    function readNDEF(readCallback, errorCallback) {
        if (!_security.readNDEF) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCTag("readNDEF", arguments);

        window.setTimeout(function () {
            if (!_data.isNeer || !isSupportedNDEF ||
                    (_ndefs_index >= ndefSize)) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            _data.pairedNFC = _ndefs[_ndefs_index];
            readCallback(_ndefs[_ndefs_index]);
            _ndefs_index++;
        }, 1);
    }

    // Writes NDEF data.
    function writeNDEF(ndefMessage, successCallback, errorCallback) {
        if (!_security.writeNDEF) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCTag("writeNDEF", arguments, true);

        window.setTimeout(function () {
            if (!_data.isNear || !isSupportedNDEF) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            db.saveObject(_data.DB_NFC_OUTPUT_MESSAGE, ndefMessage);
            event.trigger("nfc-output-msg", []);
            if (successCallback) {
                successCallback();
            }
        }, 1);
    }

    // Access the raw format card.
    function transceive(data, dataCallback, errorCallback) {
        if (!_security.transceive) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCTag("transceive", arguments, true);

        window.setTimeout(function () {
            if (!_data.isNear || isSupportedNDEF) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }
            db.saveObject(_data.DB_NFC_OUTPUT_MESSAGE, data);
            event.trigger("nfc-output-msg", []);
            dataCallback(ndefs);
        }, 1);
    }

    // Formats the detected tag that can store NDEF messages.
    /*
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
    */

    nfcTag = {
        readNDEF:   readNDEF,
        writeNDEF:  writeNDEF,
        transceive: transceive
        //formatNDEF: formatNDEF
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
        return _data.isNear;
    });

    return nfcTag;
};

NFCPeer = function (isConnected) {
    var nfcPeer;

    isConnected = isConnected || false;

    // Registers a callback function to be invoked when NDEF message is received from NFC peer-to-peer target connected.
    function setReceiveNDEFListener(successCallback) {
        if (!_security.setReceiveNDEFListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCPeer("setReceiveNDEFListener", arguments);

        if (!_data.isPeerConnected) {
            return;
        }
        _data.listener.onNDEFReceived = successCallback;
    }

    // Unregisters the listener for receiving NDEFMessage from NFC peer-to-peer target connected.
    function unsetReceiveNDEFListener() {
        if (!_security.unsetReceiveNDEFListener) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        _data.listener.onNDEFReceived = null;
    }

    // Sends data to NFC peer-to-peer target.
    function sendNDEF(ndefMessage, successCallback, errorCallback) {
        if (!_security.sendNDEF) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.NFCPeer("sendNDEF", arguments, true);

        window.setTimeout(function () {
            if (!_data.isPeerConnected) {
                if (errorCallback) {
                    errorCallback(new WebAPIError(errorcode.UNKNOWN_ERR));
                }
                return;
            }

            db.saveObject(_data.DB_NFC_OUTPUT_MESSAGE, ndefMessage);
            event.trigger("nfc-output-msg", []);
            if (successCallback) {
                successCallback();
            }
        }, 1);
    }

    nfcPeer = {
        setReceiveNDEFListener:   setReceiveNDEFListener,
        unsetReceiveNDEFListener: unsetReceiveNDEFListener,
        sendNDEF:                 sendNDEF
    };

    nfcPeer.__defineGetter__("isConnected", function () {
        return _data.isPeerConnected;
    });

    return nfcPeer;
};

function _initialize() {
    _data.nfcAdapter = new NFCAdapter();
}

_initialize();

module.exports = _self;
