// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.context
// auth: griffin <griffin@uberdev.org>
// date: 2012/10/22
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    constant = require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
    storage = require('ripple/platform/tizen/2.0/syncml-js-lib/storage'),
    router = require('ripple/platform/tizen/2.0/syncml-js-lib/router'),
    synchronizer = require('ripple/platform/tizen/2.0/syncml-js-lib/synchronizer'),
    protocol = require('ripple/platform/tizen/2.0/syncml-js-lib/protocol'),
    localadapter = require('ripple/platform/tizen/2.0/syncml-js-lib/localadapter'),
    idxdb = {},
    _self;

// todo: is this the right place to put this?...
//       the reason that i did not put it in the `define` call is
//       because it needs access to `this.indexedDB`...
var idxdb = {};
if ( typeof(window) != 'undefined' && window.indexedDB )
{
    idxdb.indexedDB   = window.indexedDB;
    idxdb.IDBKeyRange = window.IDBKeyRange;
}
else
{
    idxdb.indexedDB   = this.indexedDB;
    idxdb.IDBKeyRange = this.IDBKeyRange;
}

_self = (function () {
    var exports = {};

    //---------------------------------------------------------------------------
    exports.Context = common.Base.extend({

        //-------------------------------------------------------------------------
        constructor: function(options) {
            // options.storage expects the following properties:
            //   - indexedDB
            //   - IDBKeyRange
            options = options || {};
            this.storage      = options.storage || idxdb;
            this.dbname       = ( options.prefix || '' ) + 'syncml-js';
            this.autoCommit   = options.autoCommit == undefined ? true : options.autoCommit;
            this.router       = options.router || new router.SmartRouter();
            this.synchronizer = options.synchronizer || new synchronizer.Synchronizer();
            this.protocol     = options.protocol || new protocol.Protocol();
            this.codec        = options.codec || constant.CODEC_XML;
            this.listener     = options.listener;
            this.ua           = options.ua;
            this.config       = _.defaults({}, options.config, {
                trustDevInfo      : false,
                exposeErrorTrace  : false
            });
            this._db          = null;
            this._dbtxn       = null;
        },

            //-------------------------------------------------------------------------
            getAdapter: function(options, devInfo, cb) {
                options = options || {};
                var self = this;
                if ( this._db == undefined )
                {
                    storage.openDatabase(this, function(err, db) {
                        if ( err ) {
                            return cb(err);
                        }
                        self._db = db;
                        self._db.onerror = function(event) {
                            // todo: remove this?...
                        };
                        self._dbtxn = storage.getTransaction(self._db, null, 'readwrite');
                        self.getAdapter(options, devInfo, cb);
                    });
                }
                else
                {
                    var ret = new localadapter.LocalAdapter(this, options, devInfo);
                    return ret._load(cb);
                }
            },

            //-------------------------------------------------------------------------
            _txn: function() {
                try {
                    // this is a work-around for XPC-based syncml... try to open
                    // a store, if it fails, we need a new transaction.
                    var store = this._dbtxn.objectStore('mapping');
                    return this._dbtxn;
                } catch ( exc ) {
                    this._dbtxn = storage.getTransaction(this._db, null, 'readwrite');
                    return this._dbtxn;
                }
            },

            //-------------------------------------------------------------------------
            getEasyClientAdapter: function(options, cb) {
                try{
                    this._getEasyClientAdapter(options, cb);
                }catch(e){
                    cb(e);
                }
            },

            //-------------------------------------------------------------------------
            _getEasyClientAdapter: function(options, cb) {
                // options should be:= {
                //   // devID,
                //   // displayName,
                //   devInfo: {},
                //   stores: [],
                //   peer: {},
                //   routes: [
                //     [ source, target ],
                //   ]
                // }
                // response: cb(err, adapter, stores, peer);

                var self = this;

                var ret = {
                    adapter: null,
                    stores: [],
                    peer: null
                };

                var setupAdapter = function(cb) {
                    var adapterOptions = _.omit(options, 'devInfo', 'stores', 'peers', 'routes');
                    self.getAdapter(adapterOptions, options.devInfo, function(err, adapter) {
                        if ( err ) {
                            return cb(err);
                        }
                        ret.adapter = adapter;
                        if ( adapter.devInfo ) {
                            return cb();
                        }
                        adapter.setDevInfo(options.devInfo, cb);
                    });
                };

                var setupStores = function(cb) {
                    common.cascade(options.stores, function(storeInfo, cb) {
                        var store = ret.adapter.getStore(storeInfo.uri);
                        if ( store != undefined )
                        {
                            if ( storeInfo.agent ) {
                                store.agent = storeInfo.agent;
                            }
                            ret.stores.push(store);
                            return cb();
                        }
                        ret.adapter.addStore(storeInfo, function(err, store) {
                            if ( err ) {
                                return cb(err);
                            }
                            ret.stores.push(store);
                            return cb();
                        });
                    }, cb);
                };

                var setupPeer = function(cb) {
                    var peer = _.find(ret.adapter.getPeers(), function(p) {
                        return p.url == options.peer.url;
                    });
                    if ( peer )
                    {
                        ret.peer = peer;
                        return cb();
                    }
                    ret.adapter.addPeer(options.peer, function(err, peer) {
                        if ( err ) {
                            return cb(err);
                        }
                        ret.peer = peer;
                        common.cascade(options.routes, function(route, cb) {
                            ret.peer.setRoute(route[0], route[1], cb);
                        }, cb);
                    });
                };
                setupAdapter(function(err) {
                    if ( err ) {
                        return cb(err);
                    }
                    setupStores(function(err) {
                        if ( err ) {
                            return cb(err);
                        }
                        setupPeer(function(err) {
                            if ( err ) {
                                return cb(err);
                            }
                            cb(null, ret.adapter, ret.stores, ret.peer);
                        });
                    });
                });
            },

            //-------------------------------------------------------------------------
            close: function(cb) {
                if ( this._db )
                    this._db.close();
                this._db = null;
                cb(null);
            }

    });

    return exports;

})();

module.exports = _self;
