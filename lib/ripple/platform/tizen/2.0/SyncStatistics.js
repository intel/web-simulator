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

module.exports = function (syncStatus, serviceType, lastSyncTime,
        serverToClientTotal, serverToClientAdded, serverToClientUpdated, serverToClientRemoved,
        clientToServerTotal, clientToServerAdded, clientToServerUpdated, clientToServerRemoved) {

    var statistics = {};

    statistics.__defineGetter__("syncStatus", function () {
        return syncStatus;
    });

    statistics.__defineGetter__("serviceType", function () {
        return serviceType;
    });

    statistics.__defineGetter__("lastSyncTime", function () {
        return lastSyncTime;
    });

    statistics.__defineGetter__("serverToClientTotal", function () {
        return serverToClientTotal;
    });

    statistics.__defineGetter__("serverToClientAdded", function () {
        return serverToClientAdded;
    });

    statistics.__defineGetter__("serverToClientUpdated", function () {
        return serverToClientUpdated;
    });

    statistics.__defineGetter__("serverToClientRemoved", function () {
        return serverToClientRemoved;
    });

    statistics.__defineGetter__("clientToServerTotal", function () {
        return clientToServerTotal;
    });

    statistics.__defineGetter__("clientToServerAdded", function () {
        return clientToServerAdded;
    });

    statistics.__defineGetter__("clientToServerUpdated", function () {
        return clientToServerUpdated;
    });

    statistics.__defineGetter__("clientToServerRemoved", function () {
        return clientToServerRemoved;
    });

    return statistics;
};

