/*
 *  Copyright 2012 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use _self file except in compliance with the License.
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

var utils = require('ripple/utils'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError');

module.exports = function (prop) {
    var _self,
        _uuid = prop.uuid,
        _protocol = prop.protocol,
        state = prop.state,
        _peer = prop.peer,
        _security = prop.metaData,
        _buf = [];

    _self = {
        onmessage : null,
        onclose : null,
        onerror : null,
        writeData : function (data) {
            if (!_security.all && !_security.writeData) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }
            if (!tizen1_utils.isValidArray(data)) {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }
            if (this.state === "CLOSED") {
                return;
            }

            event.trigger("bt-service-write-msg", [_peer.address, _uuid, data]);
            return data.length;
        },
        readData : function () {
            var data;
            if (!_security.all && !_security.readData) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }
            if (this.state === "CLOSED") {
                return;
            }

            data = utils.copy(_buf);
            _buf = [];
            return data;
        },
        close : function () {
            if (!_security.all && !_security.close) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            Object.defineProperty(this, "state", {value: "CLOSED", writable: false});
            event.trigger("bt-service-state-changed", [_peer.address, _uuid, false]);
            event.trigger("bt-device-connected-update", [_peer.address, false]);

            if (this.onclose) {
                this.onclose();
            }
        }
    };

    event.on("bt-service-state-update", function (addr, state) {
        var stateStr = "CLOSED";
        if (addr === _peer.address) {
            if (state) {
                stateStr = "OPEN";
            }
            Object.defineProperty(this, "state", {value: stateStr, writable: false});
            event.trigger("bt-service-state-changed", [_peer.address, _uuid, state]);
            event.trigger("bt-device-connected-update", [_peer.address, state]);
        }
    });

    event.on("bt-service-rawdata-received", function (addr, uuid, msg) {
        var i;
        if (addr === _peer.address && uuid === _uuid) {
            _buf = [];
            for (i = 0; i < msg.length; i++) {
                _buf.push(msg.charCodeAt(i));
            }
            if (_self.onmessage) {
                _self.onmessage();
            }
        }
    });

    _self.__defineGetter__("uuid", function () {
        return _uuid;
    });
    _self.__defineGetter__("protocol", function () {
        return _protocol;
    });
    _self.__defineGetter__("state", function () {
        return state;
    });
    _self.__defineGetter__("peer", function () {
        return _peer;
    });

    return _self;
};
