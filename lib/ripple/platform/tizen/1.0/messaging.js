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

var _self, service, i,
    CommonError = require('ripple/platform/tizen/1.0/CommonError'),
    MessagingService = require('ripple/platform/tizen/1.0/MessagingService'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    TIZEN_MESSAGING_SMS = "messaging.sms",
    TIZEN_MESSAGING_MMS = "messaging.mms",
    TIZEN_MESSAGING_EMAIL = "messaging.email",
    _security_check = {send: false, read: false, write: false},
    _sms_service = null,
    _mms_service = null,
    _email_service = null;

_self = function () {
    this.getMessageServices = function (messageServiceType, onSuccess, onError, serviceId) {
        var ret = [];
        switch (messageServiceType) {
        case "messaging.sms":
            if (_sms_service === null) {
                _sms_service = [new MessagingService("Tizen SMS Service 1", "SMS Service Name 1", TIZEN_MESSAGING_SMS, _security_check), new MessagingService("Tizen SMS Service 2", "SMS Service Name 2", TIZEN_MESSAGING_SMS, _security_check)];
            }
            service = _sms_service;
            break;
        case "messaging.mms":
            if (_mms_service === null) {
                _mms_service = [new MessagingService("Tizen MMS Service", "MMS Service Name", TIZEN_MESSAGING_MMS, _security_check)];
            }
            service = _mms_service;
            break;
        case "messaging.email":
            if (_email_service === null) {
                _email_service = [new MessagingService("Tizen Email Service", "Email Service Name", TIZEN_MESSAGING_EMAIL, _security_check)];
            }
            service = _email_service;
            break;
        default:
            throw (new CommonError("INVALID_VALUES_ERROR"));
        }
        if ((serviceId !== null) && (serviceId !== undefined)) {
            for (i = 0; i < service.length; i++) {
                if (service[i].id === serviceId) {
                    ret.push(service[i]);
                }
            }
            setTimeout(function () {
                onSuccess(ret);
            }, 1);
        } else {
            setTimeout(function () {
                onSuccess(service);
            }, 1);
        }
    };
    this.handleSubFeatures = function (subFeatures) {
        if (tizen1_utils.isEmptyObject(subFeatures) ||
            subFeatures["http://tizen.org/api/messaging"]) {
            // all ok
            _security_check.send = true;
            _security_check.read = true;
            _security_check.write = true;
            return;
        }
        if (subFeatures["http://tizen.org/api/messaging.send"]) {
            _security_check.send = true;
        }
        if (subFeatures["http://tizen.org/api/messaging.read"]) {
            _security_check.send = true;
        }
        if (subFeatures["http://tizen.org/api/messaging.write"]) {
            _security_check.send = true;
        }
    };
};

module.exports = _self;
