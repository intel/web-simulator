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

var errorcode = require('ripple/platform/wearable/2.2/errorcode');

var msg = {
        0: "Generic Error",
        1: "Index or size is negative, or greater than the allowed value.",
        2: "Specified range of text does not fit into a DOMString.",
        3: "Node is inserted somewhere it doesn't belong.",
        4: "Node is used in a different document than the one that created it (that doesn't support it).",
        5: "An invalid or illegal character is specified.",
        6: "Data is specified for a Node which does not support data.",
        7: "An attempt is made to modify an object where modifications are not allowed.",
        8: "An attempt is made to reference a Node in a context where it does not exist.",
        9: "The implementation does not support the requested type of object or operation.",
        10: "An attempt is made to add an attribute that is already in use elsewhere.",
        11: "An attempt is made to use an object that is not, or is no longer, usable.",
        12: "An invalid or illegal string is specified.",
        13: "An attempt is made to modify the type of the underlying object.",
        14: "An attempt is made to create or change an object in a way which is incorrect with regard to namespaces.",
        15: "A parameter or an operation is not supported by the underlying object.",
        16: "A call to a method such as insertBefore or removeChild would make the Node invalid with respect to \"partial validity\", this exception would be raised and the operation would not be done.",
        17: "The type of an object is incompatible with the expected type of the parameter associated to the object.",
        18: "An attempt is made to perform an operation or access some data in a way that would be a security risk or a violation of the user agent's security policy.",
        19: "A network error occurs in synchronous requests.",
        20: "The abort error occurs in asynchronous requests by user prompt.",
        21: "The operation could not be completed because the URL does not match.",
        22: "The quota has been exceeded.",
        23: "The operation timed out.",
        24: "The supplied node is incorrect or has an incorrect ancestor for this operation.",
        25: "The object can not be cloned.",
        99: "The content of an object does not include valid values.",
        100: "Error occurred in communication with the underlying implementation that meant the requested method could not complete.",
        111: "Requested service is not available."
    },
    errType = {
        0: "UnknownError",
        1: "IndexSizeError",
        2: "DOMStringSizeError",
        3: "HierarchyRequestError",
        4: "WrongDocumentError",
        5: "InvalidCharacterError",
        6: "NoDataAllowedError",
        7: "NoModificationAllowedError",
        8: "NotFoundError",
        9: "NotSupportedError",
        10: "InuseAttributeError",
        11: "InvalidStateError",
        12: "SyntaxError",
        13: "InvalidModificationError",
        14: "NamespaceError",
        15: "InvalidAccessError",
        16: "ValidationError",
        17: "TypeMismatchError",
        18: "SecurityError",
        19: "NetworkError",
        20: "AbortError",
        21: "URLMismatchError",
        22: "QuotaExceededError",
        23: "TimeoutError",
        24: "InvalidNodeTypeError",
        25: "DataCloneError",
        99: "InvalidValuesError",
        100: "IOError",
        111: "ServiceNotAvailableError"
    };

/*
 support 3 types of error:
 - WebAPIError()
 code = errorcode.UNKNOWN_ERR
 message = errorcode.message[UNKNOWN_ERR]
 - WebAPIError(errorcode."TYPE_MISMATCH_ERR")
 code = 17
 message = errorcode.message[17]
 - WebAPIError(my_own_error_code, "This is my error message.")
 code = my_own_error_code(number)
 message = "This is my error message."
 */

module.exports = function (code, message, name) {
    var _code, _message, _name;

    if (typeof code !== 'number') {
        _code = errorcode.UNKNOWN_ERR;
        _message = msg[_code];
        _name = errType[_code];
    } else {
        _code = code;
        if (typeof message === 'string') {
            _message = message;
        } else {
            _message = msg[_code];
        }
        if (typeof name === 'string') {
            _name = name;
        } else {
            _name = errType[_code];
        }
    }

    this.__defineGetter__("code", function () {
        return _code;
    });
    this.__defineGetter__("message", function () {
        return _message;
    });
    this.__defineGetter__("name", function () {
        return _name;
    });
};
