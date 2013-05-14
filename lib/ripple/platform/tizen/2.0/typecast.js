/*
 *  Copyright 2013 Intel Corporation.
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

var typedef = require('ripple/platform/tizen/2.0/typedef'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    TypeCoerce = require('ripple/platform/tizen/2.0/typecoerce'),
    _self;

function cast(pattern) {
    /*
     * Type cast for each known type. The function name is the exact name of the
     * corresponding type.
     *
     * obj
     *    Variable to be casted
     *
     * aux
     *    Auxiliary descriptor of obj. It can be any one or combination of below
     *    strings, or ignored in most cases.
     *
     *    "?"     Nullable types
     *    "[]"    Arrays
     *
     * arbitrary
     *    A boolean parameter, which indicates that whether obj requires to be
     *    verified. It can be ignored in most cases.
     *
     *    true    Indicates obj may contain invalid values
     *    false   Indicates obj must be verified constrainedly
     *
     * Return
     *    Casted object.
     */

    return function (obj, aux, arbitrary) {
        var tc, isNullable;

        aux = aux ? String(aux) : "";
        tc = new TypeCoerce((aux.indexOf("[]") !== -1) ? [pattern] : pattern);
        isNullable = (aux.indexOf("?") !== -1);

        if ((isNullable && obj) || !isNullable) {
            if ((obj = tc.cast(obj)) === null) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
        }

        if (!arbitrary) {
            if (((isNullable && obj) || !isNullable) && !tc.validate(obj)) {
                throw new WebAPIException(errorcode.INVALID_VALUES_ERR);
            }
        }

        return obj;
    };
}

_self = (function () {
    var typecast = {}, i;

    for (i in typedef) {
        typecast[i] = cast(typedef[i]);
    }

    return typecast;
}());

module.exports = _self;
