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

module.exports = function (ndefRecords) {
    //TODO: NDEFMessage doesn't support rawData constructor
    var _self,
        _ndefRecords = ndefRecords || [],
        space = " ";

    _self = {
        records : _ndefRecords,
        toByte : function () {
            var result = [], i, j;
            for (i in this.records) {
                for (j = 0; j < this.records[i].payload.length; j++) {
                    result.push(this.records[i].payload.charCodeAt(j));
                }
                if (i < this.records.length - 1) {
                    result.push(space.charCodeAt(0));
                }
            }
            return result;
        }
    };

    _self.__defineGetter__("recordCount", function () {
        return this.records.length;
    });

    return _self;
};
