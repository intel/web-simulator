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

var errorcode = {
    "UNKNOWN_ERROR": "An unknown error has occurred.",
    "TYPE_MISMATCH_ERROR": "The object type is incompatible with the expected type.",
    "INVALID_VALUES_ERROR": "The content of an object does not contain valid values.",
    "TIMEOUT_ERROR": "The requested method timed out before it could be completed.",
    "IO_ERROR": "An error occurred in communication with the underlying implementation that meant the requested method could not complete.",
    "NOT_SUPPORTED_ERROR": "The requested method is not supported by the current implementation.",
    "PERMISSION_DENIED_ERROR": "Access to the requested information was denied by the implementation or by the user.",
    "NOT_FOUND_ERROR": "The object specified was not found.",
    "SERVICE_NOT_AVAILABLE": "The requested service is not available."
};

/*
  support 3 types of error:
  - CommonError() 
      name = UNKNOWN_ERROR
      message = errorcode[UNKNOWN_ERROR]
  - CommonError("TYPE_MISMATCH_ERROR")
      name = "TYPE_MISMATCH_ERROR"
      message = "TYPE_MISMATCH_ERROR"
  - CommonError("MY_ERROR_NAME", "This is my error message.")
      name = "MY_ERROR_NAME"
      message = "This is my error message."
*/

module.exports = function (name, message) {
    var _name, _message;

    if (name === undefined) {
        _name = "UNKNOWN_ERROR";
        _message = errorcode[_name];
    } else {
        _name = name;
        if (message !== undefined) {
            _message = message;
        } else {
            _message = errorcode[_name];
        }
    }

    this.__defineGetter__("name", function () {
        return _name;
    });
    this.__defineGetter__("message", function () {
        return _message;
    });
};
