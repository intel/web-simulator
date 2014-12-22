/*
 *  Copyright 2014 Intel Corporation
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
module.exports = function (pro) {
    var zn = {};

    pro = pro ? pro : {};
    zn.value = pro.value || [];
    zn.driver = pro.driver || {};

    this.__defineGetter__("value", function () {
        return zn.value;
    });

    this.__defineSetter__("value", function (val) {
        try {
            zn.value = t.DOMString(val, "[]");
        }
        catch (err) {
        }
    });

    this.__defineGetter__("driver", function () {
        return zn.driver;
    });

    this.contains = function (zone) {
        var i;

        for (i = 0; i < zone.value.length; i++) {
            if (this.value.indexOf(zone.value[i]) > -1) {
                return true;
            }
        }
        return false;
    };

    this.equals = function (zone) {
        var i;

        if (zone.value.length !== this.value.length) {
            return false;
        }

        for (i = 0; i < zone.value.length; i++) {
            if (this.value.indexOf(zone.value[i]) === -1) {
                return false;
            }
        }
        return true;
    };
};
