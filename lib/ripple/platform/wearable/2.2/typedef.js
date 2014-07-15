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
 * SAP
 */

_t.SAAgentSuccessCallback = _t.Function;
_t.ErrorCallback = _t.Function;
_t.SADeviceStatusCallback = _t.Function;
_t.SAAuthenticatePeerAgentSuccessCallback = _t.Function;

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
    // SAP
    SAManager: {},
    SAAgent:   {}
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
_i.SAManager.requestServiceConnection = {
    0: _t.SAPeerAgent
};

_i.SAManager.setServiceConnectionListener = {
    0: _t.ServiceConnectionCallback
};

_i.SAManager.authenticatePeerAgent = {
    0: _t.SAPeerAgent,
    1: _t.SAAuthenticatePeerAgentSuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        // nullable
        2: true
    }
};

_i.SAManager.acceptServiceConnectionRequest = {
    0: _t.SAPeerAgent
};

_i.SAManager.rejectServiceConnectionRequest = {
    0: _t.SAPeerAgent
};

_i.SAManager.findPeerAgents = null;

_i.SAManager.setPeerAgentFindListener = {
    0: _t.SAPeerAgentFindCallback
};

_i.SAManager.getSAFileTransfer = null;

// Exports
_t.constructor = _c;
_t.interface   = _i;

module.exports = _t;
