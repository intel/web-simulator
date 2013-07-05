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

module.exports = function (uri, attendeeInitDict) {
    var _self = this;

    _self.uri = uri;
    if (attendeeInitDict) {
        _self.name         = (attendeeInitDict.name) ? attendeeInitDict.name : "";
        _self.role         = (attendeeInitDict.role) ? attendeeInitDict.role : "";
        _self.status       = (attendeeInitDict.status) ? attendeeInitDict.status : "";
        _self.RSVP         = (attendeeInitDict.RSVP) ? attendeeInitDict.RSVP : "";
        _self.type         = (attendeeInitDict.type) ? attendeeInitDict.type : "";
        _self.group        = (attendeeInitDict.group) ? attendeeInitDict.group : "";
        _self.delegatorURI = (attendeeInitDict.delegatorURI) ? attendeeInitDict.delegatorURI : "";
        _self.delegateURI  = (attendeeInitDict.delegateURI) ? attendeeInitDict.delegateURI : "";
        _self.contactRef   = (attendeeInitDict.contactRef) ? attendeeInitDict.contactRef : "";
    } else {
        _self.name         = "";
        _self.role         = "";
        _self.status       = "";
        _self.RSVP         = "";
        _self.type         = "";
        _self.group        = "";
        _self.delegatorURI = "";
        _self.delegateURI  = "";
        _self.contactRef   = "";
    }

    return _self;
};
