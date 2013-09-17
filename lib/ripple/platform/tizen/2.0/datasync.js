/*
 *  Copyright 2013 Intel Corporation
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

var db = require('ripple/db'),
    utils = require('ripple/utils'),
    ET = require('ripple/platform/tizen/2.0/syncml-js-lib/elementtree'),
    t = require('ripple/platform/tizen/2.0/typecast'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    WebAPIException = require('ripple/platform/tizen/2.0/WebAPIException'),
    SyncInfoMod = require('ripple/platform/tizen/2.0/SyncInfo'),
    SyncServiceInfoMod = require('ripple/platform/tizen/2.0/SyncServiceInfo'),
    SyncProfileInfoMod = require('ripple/platform/tizen/2.0/SyncProfileInfo'),
    SyncStatistics = require('ripple/platform/tizen/2.0/SyncStatistics'),
    _data = {
        DB_DATASYNC_ITEMS: "tizen1-db-datasync-items",
        DB_DATASYNC_COUNTER: "tizen1-db-datasync-counter",
        MAX_PROFILE_NUMBER: 5,
        profile_num: 0,
        profiles: {},
        sync_accounts: {},
        service_accounts: {},
        item_counter: 1000,
        type_table: {
            "TWO_WAY":             1,
            "SLOW":                2,
            "ONE_WAY_FROM_CLIENT": 3,
            "REFRESH_FROM_CLIENT": 4,
            "ONE_WAY_FROM_SERVER": 5,
            "REFRESH_FROM_SERVER": 6
        },
        mode_table: {
            "TWO_WAY":             200,
            "SLOW":                201,
            "ONE_WAY_FROM_CLIENT": 202,
            "REFRESH_FROM_CLIENT": 203,
            "ONE_WAY_FROM_SERVER": 204,
            "REFRESH_FROM_SERVER": 205
        },
        items: {}
    },
    _security = {
        "http://tizen.org/privilege/datasync":
            ["add", "update", "remove", "getMaxProfilesNum", "getProfilesNum",
             "get", "getAll", "startSync", "stopSync", "getLastSyncStatistics"]
    },
    _self,
    syncml = {
        adapter: require('ripple/platform/tizen/2.0/syncml-js-lib/adapter'),
        agent: require('ripple/platform/tizen/2.0/syncml-js-lib/agent'),
        base64: require('ripple/platform/tizen/2.0/syncml-js-lib/base64'),
        codec:  require('ripple/platform/tizen/2.0/syncml-js-lib/codec'),
        common: require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
        constant: require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
        context: require('ripple/platform/tizen/2.0/syncml-js-lib/context'),
        ctype: require('ripple/platform/tizen/2.0/syncml-js-lib/ctype'),
        devinfo: require('ripple/platform/tizen/2.0/syncml-js-lib/devinfo'),
        item: require('ripple/platform/tizen/2.0/syncml-js-lib/item'),
        localadapter: require('ripple/platform/tizen/2.0/syncml-js-lib/localadapter'),
        matcher: require('ripple/platform/tizen/2.0/syncml-js-lib/matcher'),
        protocol: require('ripple/platform/tizen/2.0/syncml-js-lib/protocol'),
        remoteadapter: require('ripple/platform/tizen/2.0/syncml-js-lib/remoteadapter'),
        router: require('ripple/platform/tizen/2.0/syncml-js-lib/router'),
        state: require('ripple/platform/tizen/2.0/syncml-js-lib/state'),
        storage: require('ripple/platform/tizen/2.0/syncml-js-lib/storage'),
        store: require('ripple/platform/tizen/2.0/syncml-js-lib/store'),
        synchronizer: require('ripple/platform/tizen/2.0/syncml-js-lib/synchronizer'),
        useragent: require('ripple/platform/tizen/2.0/syncml-js-lib/useragent')
    },
    TizenAgent;

function _get() {
    _data.item_counter = db.retrieveObject(_data.DB_DATASYNC_COUNTER) || 1000;
    _data.items = db.retrieveObject(_data.DB_DATASYNC_ITEMS) || {};
}

function _save() {
    db.saveObject(_data.DB_DATASYNC_COUNTER, _data.item_counter);
    db.saveObject(_data.DB_DATASYNC_ITEMS, _data.items);
}

TizenAgent = syncml.agent.Agent.extend({
    constructor: function() {
    },
    getContentTypes: function() {
        return [
            new syncml.ctype.ContentTypeInfo('text/x-vcard', '2.1',{preferred: true})
        ];
    },
    dumpsItem: function(item, contentType, version, cb) {
        var cdata = new ET.CdataElement(item.item);
        cb(null, cdata);
    },
    loadsItem: function(data, contentType, version, cb) {
        return cb(null, {item: data._node.textContent});
    },
    getAllItems: function(cb) {
        var items = [];
        utils.forEach(_data.items, function(contact) {
            items.push(contact);
        });
        return cb(null, items);
    },
    addItem: function(item, cb) {
        _data.item_counter++;
        item.id = _data.item_counter.toString();
        _data.items[item.id] = item;
        _save();
        return cb(null, item);
    },
    getItem: function(itemID, cb) {
        return cb(null, _data.items[itemID]);
    },
    replaceItem: function(item, reportChanges, cb) {
        _data.items[item.id] = item;
        _save();
        return cb(null, null);
    },
    deleteItem: function(itemID, cb) {
        delete _data.items[itemID];
        _save();
        return cb(null);
    }
});

function _initialize() {
    _data.agent = new TizenAgent();
    _get();
}

_self = function () {
    var datasync;

    // private
    function createInternalProfile(profile) {
        var _profile, sync_account, service_accounts;

        sync_account = db.retrieveObject("save-syncinfo")[profile.syncInfo.__syncInfoID__];

        _profile = {
            profileName: profile.profileName,
            syncInfo: {
                url:        profile.syncInfo.url,
                id:         sync_account.id,
                password:   sync_account.password,
                mode:       profile.syncInfo.mode
            },
            serviceInfo: []
        };

        switch (_profile.syncInfo.mode) {
        case "MANUAL":
            _profile.syncInfo.type = profile.syncInfo.type || "TWO_WAY";
            break;
        case "PERIODIC":
            //TODO: set 1_HOUR as default value
            _profile.interval = profile.syncInfo.interval || "1_HOUR";
            _profile.syncInfo.type = "TWO_WAY";
            break;
        case "PUSH":
            _profile.syncInfo.type = "TWO_WAY";
            break;
        }

        if (profile.serviceInfo) {
            service_accounts = db.retrieveObject("save-syncserviceinfo");
            utils.forEach(profile.serviceInfo, function (service) {
                _profile.serviceInfo.push({
                    enable:             service.enable,
                    serviceType:        service.serviceType,
                    serverDatabaseUri:  service.serverDatabaseUri,
                    id:                 service_accounts[service.__syncServiceInfoID__].id,
                    password:           service_accounts[service.__syncServiceInfoID__].password
                });
            });
        }

        return _profile;
    }

    function createExternalProfile(profileId) {
        var profile, i, _syncinfo, _serviceinfo, p;

        p = _data.profiles[profileId];

        switch (p.syncInfo.mode) {
        case "MANUAL":
            _syncinfo = new SyncInfoMod(p.syncInfo.url, p.syncInfo.id, p.syncInfo.password, "MANUAL", p.syncInfo.type);
            _syncinfo.interval = null;
            break;
        case "PERIODIC":
            _syncinfo = new SyncInfoMod(p.syncInfo.url, p.syncInfo.id, p.syncInfo.password, "PERIODIC", p.syncInfo.interval);
            break;
        case "PUSH":
            _syncinfo = new SyncInfoMod(p.syncInfo.url, p.syncInfo.id, p.syncInfo.password, "PUSH");
            break;
        }

        if (p.serviceInfo) {
            _serviceinfo = [];
            for (i in p.serviceInfo) {
                var info;
                info = new SyncServiceInfoMod(p.serviceInfo[i].enable,
                        p.serviceInfo[i].serviceType, p.serviceInfo[i].serverDatabaseUri,
                        p.serviceInfo[i].id || null, p.serviceInfo[i].password || null);
                _serviceinfo.push(info);
            }
        }

        profile = new SyncProfileInfoMod(p.profileName, _syncinfo, _serviceinfo);
        Object.defineProperty(profile, "profileId", {value: p.profileId, writable: false});

        return profile;
    }

    // public
    function add(profile) {
        var _profile;

        if (!_security.add) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.DataSynchronizationManager("add", arguments);

        _profile = createInternalProfile(profile);

        if (_data.profile_num > _data.MAX_PROFILE_NUMBER) {
            throw new WebAPIException(errorcode.QUOTA_EXCEEDED_ERR);
        }

        _profile.profileId = Math.uuid(null, 16);
        _data.profiles[_profile.profileId] = _profile;
        _data.profile_num++;

        Object.defineProperty(profile, "profileId", {value: _profile.profileId, writable: false});
    }

    function update(profile) {
        var _profile;

        if (!_security.update) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.DataSynchronizationManager("update", arguments);

        _profile = createInternalProfile(profile);

        if (!profile.profileId || !_data.profiles[profile.profileId]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        _profile.profileId = profile.profileId;
        _data.profiles[_profile.profileId] = _profile;
    }

    function remove(profileId) {
        if (!_security.remove) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.DataSynchronizationManager("remove", arguments);

        if (!_data.profiles[profileId]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        delete _data.profiles[profileId];
        _data.profile_num--;
    }

    function getMaxProfilesNum() {
        if (!_security.getMaxProfilesNum) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        return _data.MAX_PROFILE_NUMBER;
    }

    function getProfilesNum() {
        if (!_security.getProfilesNum) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        return _data.profile_num;
    }

    function get(profileId) {
        var profile;

        if (!_security.get) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.DataSynchronizationManager("get", arguments);

        if (!_data.profiles[profileId]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        profile = createExternalProfile(profileId);

        return profile;
    }

    function getAll() {
        var profiles = [], i;

        if (!_security.getAll) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        for (i in _data.profiles) {
            profiles.push(createExternalProfile(_data.profiles[i].profileId));
        }

        return profiles;
    }

    function startSync(profileId, progressCallback) {
        var _profile, _stores, _routes, sync_peer;

        if (!_security.startSync) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.DataSynchronizationManager("startSync", arguments);

        if (!_data.profiles[profileId]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }
        _data.profiles[profileId].stop_flag = false;

        sync_peer = function(adapter, store, peer, type) {
            adapter.sync(peer, type, function(err, stats) {
                var p, name, hereTotal, peerTotal;
                p = _data.profiles[profileId];
                if (p.stop_flag === true) {
                    p.syncStatistics =[{
                        syncStatus: "STOP",
                        serviceType:            p.serviceInfo[0].serviceType,
                        lastSyncTime:           new Date(),
                        serverToClientTotal:    0,
                        serverToClientAdded:    0,
                        serverToClientUpdated:  0,
                        serverToClientRemoved:  0,
                        clientToServerTotal:    0,
                        clientToServerAdded:    0,
                        clientToServerUpdated:  0,
                        clientToServerRemoved:  0
                    }];
                    p.stop_flag = false;
                    return;
                }
                if (err) {
                    if (progressCallback) {
                        if (progressCallback.onfailed) {
                            progressCallback.onfailed(profileId, new WebAPIError(errorcode.UNKNOWN_ERR));
                        }
                    }
                    p.syncStatistics =[{
                        syncStatus: "FAIL",
                        serviceType:            p.serviceInfo[0].serviceType,
                        lastSyncTime:           new Date(),
                        serverToClientTotal:    0,
                        serverToClientAdded:    0,
                        serverToClientUpdated:  0,
                        serverToClientRemoved:  0,
                        clientToServerTotal:    0,
                        clientToServerAdded:    0,
                        clientToServerUpdated:  0,
                        clientToServerRemoved:  0
                    }];
                    p.stop_flag = false;
                    return;
                }
                name = p.profileName + "-" + p.serviceInfo[0].serviceType;
                hereTotal = stats[name].hereAdd + stats[name].hereDel + stats[name].hereMod;
                peerTotal = stats[name].peerAdd + stats[name].peerDel + stats[name].peerMod;
                p.syncStatistics =[{
                    syncStatus: "SUCCESS",
                    serviceType:            p.serviceInfo[0].serviceType,
                    lastSyncTime:           new Date(),
                    serverToClientTotal:    hereTotal,
                    serverToClientAdded:    stats[name].hereAdd,
                    serverToClientUpdated:  stats[name].hereMod,
                    serverToClientRemoved:  stats[name].hereDel,
                    clientToServerTotal:    peerTotal,
                    clientToServerAdded:    stats[name].peerAdd,
                    clientToServerUpdated:  stats[name].peerMod,
                    clientToServerRemoved:  stats[name].peerDel
                }];
                p.stop_flag = false;

                if (progressCallback) {
                    if (progressCallback.oncompleted) {
                        progressCallback.oncompleted(profileId);
                    }
                }
            });
        };
        _profile = _data.profiles[profileId];
        _profile.context = new syncml.context.Context({prefix: "tizen-"});
        _stores = [];
        _routes = [];
        utils.forEach(_profile.serviceInfo, function(service) {
            var name = _profile.profileName + "-" + service.serviceType;
            _stores.push({
                uri:            name,
                displayName:    name,
                maxGuidSize:    64,
                maxObjSize:     4000000,
                agent:          _data.agent
            });
            _routes.push([name, service.serverDatabaseUri]);
        });
        _profile.context.getEasyClientAdapter({
            displayName: "Tizen syncML adapter",
            devInfo: {
                devID: "tizen-syncml-03",
                devType: syncml.constant.DEVTYPE_WORKSTATION,
                manufacturerName: "Tizen",
                modelName: "tizen.syncml.client",
                hierarchicalSync: false
            },
            stores: _stores,
            peer: {
                url:        _profile.syncInfo.url,
                username:   _profile.syncInfo.id,
                password:   _profile.syncInfo.password
            },
            routes: _routes
        }, function(err, adapter, stores, peer) {
            if (err) {
                console.log("[datasync.syncml] getEasyClientAdapter fail:", err);
                return;
            }
            utils.forEach(stores, function(store) {
                var args = {
                    data:       _data.mode_table[_profile.syncInfo.type],
                    source:     store.uri,
                    target:     _profile.serviceInfo[0].serverDatabaseUri,
                    nextAnchor: syncml.common.ts()
                };
                if (args.data === _data.mode_table["SLOW"]) {
                    args.lastAnchor = null;
                } else if (peer.getStore(args.target)) {
                    args.lastAnchor = peer.getStore(args.target)._getBinding().localAnchor;
                }

                db.saveObject("syncml-alert-args", args);
                db.saveObject("syncml-first-flag", false);
                sync_peer(adapter, store, peer, _data.type_table[_profile.syncInfo.type]);
            });
        });

    }

    function stopSync(profileId) {
        if (!_security.stopSync) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.DataSynchronizationManager("stopSync", arguments);

        if (!_data.profiles[profileId]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        _data.profiles[profileId].stop_flag = true;
    }

    function getLastSyncStatistics(profileId) {
        var s, statistics = [], i;

        if (!_security.getLastSyncStatistics) {
            throw new WebAPIException(errorcode.SECURITY_ERR);
        }

        t.DataSynchronizationManager("getLastSyncStatistics", arguments);

        if (!_data.profiles[profileId]) {
            throw new WebAPIException(errorcode.NOT_FOUND_ERR);
        }

        s = _data.profiles[profileId].syncStatistics;

        for (i in s) {
            statistics.push(
                new SyncStatistics(s[i].syncStatus, s[i].serviceType, s[i].lastSyncTime,
                    s[i].serverToClientTotal, s[i].serverToClientAdded,
                    s[i].serverToClientUpdated, s[i].serverToClientRemoved,
                    s[i].clientToServerTotal, s[i].clientToServerAdded,
                    s[i].clientToServerUpdated, s[i].clientToServerRemoved)
            );
        }

        return statistics;
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    datasync = {
        add:                    add,
        update:                 update,
        remove:                 remove,
        getMaxProfilesNum:      getMaxProfilesNum,
        getProfilesNum:         getProfilesNum,
        get:                    get,
        getAll:                 getAll,
        startSync:              startSync,
        stopSync:               stopSync,
        getLastSyncStatistics:  getLastSyncStatistics,
        handleSubFeatures:      handleSubFeatures
    };

    return datasync;
};

_initialize();

module.exports = _self;
