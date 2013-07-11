// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.remoteadapter
// auth: griffin <griffin@uberdev.org>
// date: 2012/11/04
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    devinfomod = require('ripple/platform/tizen/2.0/syncml-js-lib/devinfo'),
    adapter = require('ripple/platform/tizen/2.0/syncml-js-lib/adapter'),
    storemod = require('ripple/platform/tizen/2.0/syncml-js-lib/store'),
    _self;

_self = (function () {
    var exports = {};

    //---------------------------------------------------------------------------
    exports.RemoteAdapter = adapter.Adapter.extend({

        //-------------------------------------------------------------------------
        constructor: function(adapter, options) {

            //: [read-only] the URL of the remote syncml peer, acting as a server,
            //: to connect to.
            this.url = options.url || null;

            //: [read-only] specifies whether this Adapter represents a local
            //: or remote peer.
            this.isLocal = false;

            //: [read-only] the DevID of the remote syncml peer (which usually
            //: defaults to the URL).
            this.devID = options.devID || options.url || null;

            //: [read-only] the authentication method to use to identify the local
            //: peer to the remote peer.
            ///TODO: this.auth = options.auth || null;
            this.auth = 'syncml:auth-basic';

            //: [read-only] the human-friendly display name of the remote peer.
            this.displayName = options.displayName || null;

            //: [read-only] the username to use during credential-based authentication.
            this.username = options.username || null;

            //: [read-only] the password to use during credential-based authentication.
            this.password = options.password || null;

            //: [read-only] the peer-wide default value of the maximum
            //: message size.
            this.maxMsgSize = options.maxMsgSize || null;

            //: [read-only] the peer-wide default value of the maximum
            //: object size.
            this.maxObjSize = options.maxObjSize || null;

            //: [read-only] the DevInfo object for this remote peer.
            this.devInfo = null;

            this.lastSessionID = options.lastSessionID || null;

            // --- private attributes
            this.id       = options.id || common.makeID();
            this._a       = adapter;
            this._c       = adapter._c;
            this._stores  = {};
            this._proxy   = null;

            // TODO: filter these options for db-valid only properties...
            this._options = options;
        },

            //-------------------------------------------------------------------------
            _load: function(cb) {

                var self  = this;
                var model = this._getModel();

                // todo: should this be loading these?...
                // self.displayName = model.displayName;
                // self.devID       = model.devID;

                var loadDevInfo = function(cb) {
                    var di = new devinfomod.DevInfo(self, model.devInfo);
                    di._load(function(err) {
                        if ( err )
                        return cb(err);
                    self.devInfo = di;
                    cb();
                    });
                };

                var loadStores = function(cb) {
                    common.cascade(model.stores, function(e, cb) {
                        var store = new storemod.Store(self, e);
                        store._load(function(err) {
                            if ( err )
                            return cb(err);
                        self._stores[store.uri] = store;
                        return cb();
                        });
                    }, cb);
                };

                loadDevInfo(function(err) {
                    if ( err )
                    return cb(err);
                loadStores(cb);
                });
            },

            //-------------------------------------------------------------------------
            _updateModel: function(cb) {
                var self = this;
                if ( ! this._a._model || ! this._a._model.peers )
                    return cb(new common.InternalError('peer created on un-initialized adapter'));
                var model = self._getModel();
                // todo: should this be in this._getModel()?...
                if ( ! model )
                {
                    model = {
                        id:       self.id,
                        devInfo:  null,
                        stores:   [],
                        routes:   []
                    };
                    self._a._model.peers.push(model);
                }

                model.isLocal         = 0;
                model.url             = self.url;
                model.devID           = self.devID;
                model.displayName     = self.displayName;
                model.auth            = self.auth;
                model.username        = self.username;
                model.password        = self.password;
                model.lastSessionID   = self.lastSessionID
                    model.maxMsgSize      = self.maxMsgSize;
                model.maxObjSize      = self.maxObjSize;

                common.cascade([

                        // update the devInfo model
                        function(cb) {
                            if ( ! self.devInfo )
                    return cb();
                return self.devInfo._updateModel(cb);
                        },

                        // update the stores model
                        function(cb) {
                            // TODO: this should really be the responsibility of the Store class...
                            // NOTE: since bindings are not stored in Store, they need to be saved
                            //       and re-applied.
                            // TODO: or, perhaps better, i should purge all unwanted stores
                            //       instead of doing this brute-force method...
                            var bindings = _.object(_.map(model.stores, function(store) {
                                return [store.uri, store.binding];
                            }));
                            model.stores = [];
                            common.cascade(_.values(self._stores), function(store, cb) {
                                store._updateModel(cb);
                            }, function(err) {
                                if ( err )
                                return cb(err);
                            _.each(bindings, function(binding, uri) {
                                var store = _.find(model.stores, function(s) { return s.uri == uri; });
                                if ( ! store )
                                return;
                            store.binding = binding;
                            });
                            return cb();
                            });
                        },

                        ], cb);

            },

            //-------------------------------------------------------------------------
            _getModel: function() {
                return _.find(this._a._model.peers,
                        function(e) { return e.id == this.id; }, this);
            },

            //-------------------------------------------------------------------------
            _setRemoteInfo: function(devInfo, stores, cb) {
                var self      = this;
                self._model   = self._getModel();
                devInfo._a    = self;
                self.devInfo  = devInfo;
                self.devInfo._updateModel(function(err) {
                    if ( err )
                    return cb(err);
                // merge the new datastore info with any pre-existing store bindings
                // step 1: prepare the new stores (clean up the URIs)
                var lut = _.object(_.map(stores, function(store) {
                    store.uri = self.normUri(store.uri);
                    return [store.uri, store];
                }));
                // step 2: remove all stores that are no longer mentioned
                self._stores = _.object(
                    _.map(
                        _.filter(_.keys(self._stores), function(oldUri) {
                            return _.indexOf(_.keys(lut), oldUri) >= 0;
                        }), function(uri) {
                            return [uri, self._stores[uri]];
                        }
                        )
                    );
                // step 3: merge the datastore info for existing stores
                var merge_stores = function(cb) {
                    common.cascade(_.values(self._stores), function(store, cb) {
                        store.merge(lut[store.uri], function(err) {
                            if ( err )
                            return cb(err);
                        delete lut[store.uri];
                        return cb();
                        });
                    }, cb);
                };
                // step 4: add new datastores
                var add_stores = function(cb) {
                    common.cascade(_.values(lut), function(store, cb) {
                        self.addStore(store, cb);
                    }, cb);
                };
                merge_stores(function(err) {
                    if ( err )
                    return cb(err);
                add_stores(cb);
                });
                });
            },

            //-------------------------------------------------------------------------
            setRoute: function(localUri, remoteUri, autoMapped, cb) {
                if ( _.isFunction(autoMapped) )
                    // defaulting 'autoMapped' to false
                    return this.setRoute(localUri, remoteUri, false, autoMapped);
                var pmodel = this._getModel();
                if ( ! pmodel )
                    return cb(new common.InternalError('could not locate this peer in local adapter'));
                pmodel.routes = _.filter(pmodel.routes, function(r) {
                    return r.localUri != localUri && r.remoteUri != remoteUri;
                });
                pmodel.routes.push({localUri   : localUri,
                    remoteUri  : remoteUri,
                    autoMapped : autoMapped
                });
                // now search through previous bindings, breaking incorrect ones...
                // NOTE: this requires that a router.recalculate() is called at
                //       some point later since other valid bindings may now be
                //       possible...
                _.each(pmodel.stores, function(store) {
                    if ( store.uri != remoteUri
                        && ( ! store.binding || store.binding.uri != localUri ) )
                    {
                        return;
                    }
                    if ( ! store.binding )
                {
                    store.binding = {
                        uri          : localUri,
                    autoMapped   : autoMapped,
                    localAnchor  : null,
                    remoteAnchor : null
                    };
                    return;
                }
                if ( store.uri == remoteUri && store.binding.uri == localUri )
                {
                    store.binding.autoMapped = store.binding.autoMapped && autoMapped;
                    return;
                }
                store.binding = null;
                return;
                });
                // TODO: this additional route may impact "smart routing" - recalculate?...
                // TODO: saving adapter from peer --- SHOULD IT BE DOING THIS?...
                // TODO: get transaction from a session!...
                this._a._save(this._c._txn(), cb);
            },

            //-------------------------------------------------------------------------
            sendRequest: function(session, contentType, data, cb) {
                var xmlhttp;

                // TODO: shouldn't proxies just overwrite .sendRequest() ?...
                if ( this._proxy )
                    return this._proxy.sendRequest(session, contentType, data, cb);

                var req = {
                    url     : session.info.respUri || this.url,
                    method  : 'POST',
                    headers : {'Content-Type': contentType},
                    body    : data
                };

                xmlhttp = new XMLHttpRequest();
                xmlhttp.open(req.method, req.url, false);

                xmlhttp.setRequestHeader("Content-Type", contentType);
                xmlhttp.send(req.body);

                var response = {
                    headers: {
                        "Content-Type": xmlhttp.getResponseHeader("content-type")
                    },
                    body: xmlhttp.responseXML
                };
                return cb(null, response);
            }

    });

    return exports;

})();

module.exports = _self;
