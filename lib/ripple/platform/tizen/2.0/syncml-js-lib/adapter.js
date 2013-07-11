// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.adapter
// auth: griffin <griffin@uberdev.org>
// date: 2012/10/22
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    constant = require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
    storemod = require('ripple/platform/tizen/2.0/syncml-js-lib/store');


var _self = (function () {

    var exports = {};

    //---------------------------------------------------------------------------
    exports.Adapter = common.Base.extend({

        // //-------------------------------------------------------------------------
        // constructor: function(context, options, devInfo) {

        //-------------------------------------------------------------------------
        normUri: function(uri) {
            return common.normpath(uri);
        },

        //-------------------------------------------------------------------------
        getStores: function() {
            return _.values(this._stores);
        },

        //-------------------------------------------------------------------------
        getStore: function(uri) {
            return this._stores[this.normUri(uri)];
        },

        //-------------------------------------------------------------------------
        addStore: function(store, cb) {
            var self = this;
            if ( store instanceof storemod.Store )
            {
                store.uri = self.normUri(store.uri);
                store._a  = self;
            }
            else
                store = new storemod.Store(this, store);
            store._updateModel(function(err) {
                if ( err )
                return cb(err);
            self._stores[store.uri] = store;

            // TODO: remove this sensitivity...
            if ( ! self.isLocal )
                return cb();

            self._save(self._c._txn(), function(err) {
                if ( err )
                return cb(err);
            cb(null, store);
            });
            });
        },

        //-------------------------------------------------------------------------
        removeStore: function(uri, cb) {
            var self = this;
            if ( ! self.isLocal )
                // todo: implement
                return cb(new common.LogicalError(
                            'cannot remove remote store "' + uri + '": remote peer responsibility'));
            if ( ! self._stores[uri] )
                return cb(new common.InternalError(
                            'cannot remove store "' + uri + '": no such store'));
            delete self._stores[uri];
            var model = self._getModel();
            model.stores = _.filter(model.stores, function(store) {
                return store.uri != uri;
            });
            _.each(model.peers, function(peer) {
                peer.routes = _.filter(peer.routes, function(route) {
                    return route.localUri != uri;
                });
                _.each(peer.stores, function(store) {
                    if ( store.binding && store.binding.uri == uri )
                    store.binding = null;
                });
            });
            return cb();
        },

        //-------------------------------------------------------------------------
        _isMapper: function() {
            // indicates whether or not this adapter is capable of mapping
            // items. in the standard SyncML peer model, only the server
            // ever does mapping, but in the dream-land of syncml-js, all
            // peers can be mappers, or even better, implements an extension
            // "is-uuid/adopted" that does not require mapping. so, since
            // that is just a dream-land for now, this will try to identify
            // if this adapter represents a server...
            // todo: enhance syncml-js so that it is not needed!...
            if ( ! this.isLocal )
                return this.url && this.url.length > 0;
            return this.devInfo && this.devInfo.devType == constant.DEVTYPE_SERVER;
        },

        //-------------------------------------------------------------------------
        describe: function(stream, cb) {
            var self = this;
            if ( self.url )
                stream.writeln('URL: ' + self.url);
            stream.writeln('Device ID: ' + self.devID);
            var s1 = stream.indented();
            var s2 = s1.indented();

            var describe_stores = function(cb) {
                var stores = self.getStores();
                if ( stores.length <= 0 )
                {
                    stream.writeln('Data stores: (none)');
                    return cb();
                }
                stream.writeln('Data stores:');
                common.cascade(stores, function(store, cb) {
                    s1.writeln(( store.displayName || store.uri ) + ':');
                    store.describe(s2, cb);
                }, cb);
            };

            var describe_peers = function(cb) {
                if ( ! self.getPeers )
                    return cb();
                var peers = self.getPeers();
                if ( peers.length <= 0 )
                {
                    stream.writeln('Known peers: (none)');
                    return cb();
                }
                stream.writeln('Known peers:');
                common.cascade(peers, function(peer, cb) {
                    s1.writeln(( peer.displayName || peer.url ) + ':');
                    peer.describe(s2, cb);
                }, cb);
            }

            describe_stores(function(err) {
                if ( err )
                return cb(err);
            describe_peers(cb);
            });
        }

    });

    return exports;

    })();

    module.exports = _self;
