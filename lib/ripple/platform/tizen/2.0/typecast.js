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
    _self = {};

function _cast(pattern, obj, isDuplicate) {
    var tc, tcFunc;

    if (pattern === null)
        return;

    tc = new TypeCoerce(pattern);
    tcFunc = isDuplicate ? tc.copy : tc.cast;

    if ((obj = tcFunc(obj)) === null) {
        throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
    }

    return obj;
}

function _castType(pattern) {
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
     *    "[]"    Array
     *    "+"     Deep copy
     *
     * Return
     *    Casted or duplicated object.
     */

    return function (obj, aux) {
        var type, isNullable, isDuplicate;

        aux = aux ? String(aux) : "";
        type = (aux.indexOf("[]") !== -1) ? [pattern] : pattern;
        isNullable = (aux.indexOf("?") !== -1);
        isDuplicate = (aux.indexOf("+") !== -1);

        if ((obj === null) || (obj === undefined)) {
            if (!isNullable) {
                throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
            }
            return obj;
        }

        return _cast(type, obj, isDuplicate);
    };
}

function _castConstructor(name) {
    var constructors, hook, vtc, isOverloaded, castConstructor;

    /*
     * Type cast for constructor. The function name is the exact name of the
     * object type.
     *
     * argv
     *    arguments. The keyword 'arguments' will always be passed in.
     */

    function castUnique(argv) {
        _cast(constructors, argv, false);
    }

    /*
     * Type cast for overloaded constructors. The function name is the exact
     * name of the object type.
     *
     * argv
     *    arguments. The keyword 'arguments' will always be passed in.
     *
     * scope
     *    'this' of the original constructor.
     *
     * voc
     *    Array of overloaded constructors callback
     */

    function castOverload(argv, scope, voc) {
        var iOverload;

        if (!vtc) {
            vtc = [];
            constructors.forEach(function (c) {
                vtc.push((c === null) ? null : new TypeCoerce(c));
            });
        }

        vtc.some(function (tc, index) {
            if (tc && (tc.cast(argv) === null))
                return false;

            iOverload = index;
            return true;
        });

        if (iOverload === undefined) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR);
        }

        return (voc && voc[iOverload].apply(scope, argv));
    }

    constructors = typedef.constructor[name];

    if (name in _self) {
        hook = _self[name];
    }

    isOverloaded = (Object.prototype.toString.call(constructors) ===
            "[object Array]");
    castConstructor = isOverloaded ? castOverload : castUnique;

    return function (argv, scope) {
        if (Object.prototype.toString.call(argv) !== "[object Arguments]") {
            return (hook && hook.apply(this, arguments));
        }

        if (!(scope instanceof argv.callee)) {
            throw new WebAPIException(errorcode.TYPE_MISMATCH_ERR, null, "TypeError");
        }

        castConstructor.apply(this, arguments);
    };
}

function _castInterface(name) {
    var interface, hook;

    interface = typedef.interface[name];

    if (name in _self) {
        hook = _self[name];
    }

    /*
     * Type cast for each known method of interface. The function name is the
     * exact name of the corresponding interface.
     *
     * method
     *    String of method name
     *
     * argv
     *    arguments. The keyword 'arguments' will always be passed in.
     *
     * isDuplicate
     *    A boolean value to indicate whether arguments will be copied or not.
     */

    return function (method, argv, isDuplicate) {
        if ((typeof method !== "string") || (typeof argv !== "object")) {
            return (hook && hook.apply(this, arguments));
        }

        _cast(interface[method], argv, isDuplicate);
    };
}

(function () {
    var i;

    for (i in typedef) {
        _self[i] = _castType(typedef[i]);
    }

    for (i in typedef.constructor) {
        _self[i] = _castConstructor(i);
        typedef[i]._constructor = i;
    }

    for (i in typedef.interface) {
        _self[i] = _castInterface(i);
    }
}());

module.exports = _self;
