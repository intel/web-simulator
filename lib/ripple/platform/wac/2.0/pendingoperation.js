/*
 *  Copyright 2011 Intel Corporation.
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

module.exports = function (pendingObj) {
    var pending = true;
    this.cancel = function () {
        if (pending === true) {
            if (typeof (pendingObj.getCancelFlag) === "function" && pendingObj.getCancelFlag() === false) {
                pending = false;
                // this clearTimeout is for the case when a 3rd party is invoked to do the task, and it's finished sooner than the intended timeout. therefore, the 3rd party set CancelFlag false, and this cancel is called before timeout
                clearTimeout(pendingObj.pendingID);
                return false;
            }
            if (typeof (pendingObj.userCancel) === "function") {
                pendingObj.userCancel();
            }
            clearTimeout(pendingObj.pendingID);
            pending = false;
            return true;
        } else {
            return false;
        }
    };
};

