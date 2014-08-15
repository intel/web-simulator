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

var _t, _c, _i;

/*
 * Primitive type definition
 */

_t = {
    // Basic
    Callback:                       "Callback",
    DOMString:                      "",
    Date:                           new Date(),
    Function:                       function () {},
    TZDate:                         "TZDate",
    any:                            "any",
    boolean:                        false,
    byte:                           "byte",
    double:                         "double",
    float:                          "float",
    long:                           "long",
    octet:                          "octet",
    short:                          "short",
    long_long:                      "long long",
    unsigned_long:                  "unsigned long",
    unsigned_long_long:             "unsigned long long",
    unsigned_short:                 "unsigned short",

    // SAP
    AuthenticationType:             ["AUTHENTICATION_TYPE_NONE",
                                     "AUTHENTICATION_TYPE_CERTIFICATE_X509"],
    TransportType:                  ["TRANSPORT_BLE", "TRANSPORT_BT",
                                     "TRANSPORT_USB", "TRANSPORT_WIFI"]
};

/*
 * Derivative type definition
 */

/*
 * Object attributes
 *     Contruct a prototype of an object. Specify a primitive type for each attribute.
 *
 * _optional
 *     Optional attributes table, which consists of two types of attributes,
 *
 *     nullable
 *         Nullable attributes, marked as '?' in IDL.
 *
 *     undefined
 *         Array type attributes, that not definitely specified to be
 *         initialized as an empty array, i.e., undefined-initialized array.
 *
 * _derived
 *     Derived types, which used in two cases of definition,
 *
 *     Subtype list
 *         An array consists of derived subtypes. It exists in the definition of
 *         a base type.
 *
 *     Union types
 *         An array consists of member types. It exists in the definition of
 *         a union type.
 *
 * _dictionary
 *     Dictionary type, which indicates that the object is a dictionary type.
 */

/*
 * IrLed
 */

_t.SuccessCallback = _t.Function;
_t.ErrorCallback   = _t.Function;

/*
 * SAP
 */

_t.SAAgentSuccessCallback = _t.Function;
_t.SADeviceStatusCallback = _t.Function;
_t.SAAuthenticatePeerAgentSuccessCallback = _t.Function;
_t.SADataReceiveCallback = _t.Function;
_t.SASocketStatusCallback = _t.Function;

_t.ServiceConnectionCallback = {
    onrequest: _t.Callback,
    onconnect: _t.Callback,
    onerror:   _t.Callback
};

_t.SAPeerAgentFindCallback = {
    onpeeragentfound:   _t.Callback,
    onpeeragentupdated: _t.Callback,
    onerror:            _t.Callback
};

_t.SAPeerAccessory = {
    deviceAddress: _t.DOMString,
    deviceName:    _t.DOMString,
    productId:     _t.DOMString,
    transportType: _t.TransportType,
    vendorId:      _t.DOMString
};

_t.SAPeerAgent = {
    peerAccessory:      _t.SAPeerAccessory,
    appName:            _t.DOMString,
    maxAllowedDataSize: _t.long,
    peerId:             _t.DOMString,
    profileVersion:     _t.DOMString
};

_t.SAFileSendCallback = {
    onprogress: _t.Callback,
    oncomplete: _t.Callback,
    onerror:    _t.Callback
};

_t.SAFileReceiveCallback = {
    onreceive:  _t.Callback,
    onprogress: _t.Callback,
    oncomplete: _t.Callback,
    onerror:    _t.Callback
};

/*
 * Constructor list definition
 */

/*
 * Generic constructor
 *     Construct a prototype of constructor. A fake array of arguments type is
 *     specified for constructor.
 *
 * Overloaded constructors
 *     Construct an array of prototype of constructor. Each array element is
 *     specified for one of constructors. The constructor with extra arguments
 *     are recommended to be defined ahead of the one with fewer same arguments
 *     for exact match.
 */

_c = {};

/*
 * Interface prototype definition
 */

_i = {
    // IrLed
    IrLedManager:    {},
    
    // SAP
    SAManager:       {},
    SAAgent:         {},
    SASocket:        {},
    SAFileTransfer:  {}
};

// IrLed
_i.IrLedManager.send = {
    0: _t.DOMString,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        // nullable
        1: true,
        2: true
    }
};

/*
 * SAP
 */

// SAManager
_i.SAManager.requestSAAgent = {
    0: _t.SAAgentSuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        // nullable
        1: true
    }
};

_i.SAManager.setDeviceStatusListener = {
    0: _t.SADeviceStatusCallback
};

// SAAgent
_i.SAAgent.requestServiceConnection = {
    0: _t.SAPeerAgent
};

_i.SAAgent.setServiceConnectionListener = {
    0: _t.ServiceConnectionCallback
};

_i.SAAgent.authenticatePeerAgent = {
    0: _t.SAPeerAgent,
    1: _t.SAAuthenticatePeerAgentSuccessCallback,
};

_i.SAAgent.acceptServiceConnectionRequest = {
    0: _t.SAPeerAgent
};

_i.SAAgent.rejectServiceConnectionRequest = {
    0: _t.SAPeerAgent
};

_i.SAAgent.findPeerAgents = null;

_i.SAAgent.setPeerAgentFindListener = {
    0: _t.SAPeerAgentFindCallback
};

_i.SAAgent.getSAFileTransfer = null;

// SASocket
_i.SASocket.close = null;

_i.SASocket.isConnected = null;

_i.SASocket.sendData = {
    0: _t.long,
    1: _t.DOMString
};

_i.SASocket.sendSecureData = {
    0: _t.long,
    1: _t.DOMString
};

_i.SASocket.setDataReceiveListener = {
    0: _t.SADataReceiveCallback
};

_i.SASocket.setSocketStatusListener = {
    0: _t.SASocketStatusCallback
};

// SAFileTransfer
_i.SAFileTransfer.sendFile = {
    0: _t.SAPeerAgent,
    1: _t.DOMString
};

_i.SAFileTransfer.setFileSendListener = {
    0: _t.SAFileSendCallback
};

_i.SAFileTransfer.setFileReceiveListener = {
    0: _t.SAFileReceiveCallback
};

_i.SAFileTransfer.receiveFile = {
    0: _t.long,
    1: _t.DOMString
};

_i.SAFileTransfer.cancelFile = {
    0: _t.long
};

_i.SAFileTransfer.rejectFile = {
    0: _t.long
};

// Exports
_t.constructor = _c;
_t.interface   = _i;

module.exports = _t;
