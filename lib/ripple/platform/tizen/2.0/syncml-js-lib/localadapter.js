// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.localadapter
// auth: griffin <griffin@uberdev.org>
// date: 2012/10/22
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    constant = require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
    codec = require('ripple/platform/tizen/2.0/syncml-js-lib/codec'),
    storage = require('ripple/platform/tizen/2.0/syncml-js-lib/storage'),
    remote = require('ripple/platform/tizen/2.0/syncml-js-lib/remoteadapter'),
    storemod = require('ripple/platform/tizen/2.0/syncml-js-lib/store'),
    devinfomod = require('ripple/platform/tizen/2.0/syncml-js-lib/devinfo'),
    adapter = require('ripple/platform/tizen/2.0/syncml-js-lib/adapter'),
    state = require('ripple/platform/tizen/2.0/syncml-js-lib/state'),
    useragent = require('ripple/platform/tizen/2.0/syncml-js-lib/useragent'),
    _self;

_self = (function () {
    var exports = {};

    //---------------------------------------------------------------------------
    exports.LocalAdapter = adapter.Adapter.extend({

        //-------------------------------------------------------------------------
        constructor: function(context, options, devInfo) {

            // todo: is there anyway to mark attributes as read-only?...

            //: [read-only] devInfo describes this adapter's device info and
            //: capabilities.
            this.devInfo = null;

            //: [read-only] the device ID of this adapter.
            this.devID = options.devID || null;

            //: [read-only] specifies whether this Adapter represents a local
            //: or remote peer.
            this.isLocal = true;

            //: [read-only] human-facing name of this adapter
            this.displayName = options.displayName || null;

            //: [read-only] the adapter-wide default value of the maximum
            //: message size.
            this.maxMsgSize = options.maxMsgSize || null;

            //: [read-only] the adapter-wide default value of the maximum
            //: object size.
            this.maxObjSize = options.maxObjSize || null;

            //: [read-only] specifies default conflict resolution policy for
            //: this adapter. if undefined, defaults to constant.POLICY_ERROR.
            this.conflictPolicy = options.conflictPolicy || constant.POLICY_ERROR;

            // --- private attributes
            this.id       = options.id || common.makeID();
            this._c       = context;
            // TODO: use _.pick() for these options...
            this._options = options;
            this._devInfo = devInfo;
            this._model   = null;
            this._stores  = {};
            this._peers   = [];
        },

            //-------------------------------------------------------------------------
            _getModel: function() {
                return this._model;
            },

            //-------------------------------------------------------------------------
            setDevInfo: function(devInfo, cb) {
                if ( this._model == undefined )
                    this._model = {
                        id              : this.id,
                        displayName     : this.displayName,
                        maxMsgSize      : this.maxMsgSize,
                        maxObjSize      : this.maxObjSize,
                        conflictPolicy  : this.conflictPolicy,
                        devInfo         : null,
                        stores          : [],
                        peers           : [],
                        isLocal         : 1
                    };

                var di = new devinfomod.DevInfo(this, devInfo);
                di._updateModel(_.bind(function(err) {
                    if ( err )
                        return cb(err);

                    this._model.devID = this._model.devInfo.devID;
                    this.devID        = this._model.devInfo.devID;
                    this.devInfo      = di;

                // since the local devinfo has changed, we need to ensure that
                // we rebroadcast it (in case there are any affects...), thus
                // resetting all anchors.
                // TODO: this seems a little heavy-handed, since this will force
                //       a slow-sync for each datastore. is that really the best
                //       thing?...
                this._resetAllAnchors();

                this._save(this._c._txn(), cb);

                }, this));
            },

            //-------------------------------------------------------------------------
            _resetAllAnchors: function() {
                _.each(this._model.peers, function(peer) {
                    _.each(peer.stores, function(store) {
                        if ( ! store.binding )
                        return;
                    store.binding.localAnchor  = null;
                    store.binding.remoteAnchor = null;
                    });
                });
            },

            //-------------------------------------------------------------------------
            getPeers: function() {
                return this._peers;
            },

            //-------------------------------------------------------------------------
            addPeer: function(peerInfo, cb) {
                var self = this;

                // TODO: if there is already a peer for the specified URL, then
                //       we may have a problem!...

                // todo: if we are adding a peer to an adapter that already has
                //       non-client peers, then we may have a problem!...
                //       (this is only true while syncml-js is not capable of truly
                //       operating in peer-to-peer mode)

                var peer = new remote.RemoteAdapter(this, peerInfo);
                peer._updateModel(function(err) {
                    if ( err )
                    return cb(err);
                self._peers.push(peer);
                cb(null, peer);
                });
            },

            //-------------------------------------------------------------------------
            save: function(cb) {
                this._save(this._c._txn(), cb);
            },

            //-------------------------------------------------------------------------
            _save: function(dbtxn, cb) {
                var self = this;
                self._updateModel(function(err) {
                    if ( err )
                    return cb(err);
                storage.put(dbtxn.objectStore('adapter'), self._model, cb);
                });
            },

            //-------------------------------------------------------------------------
            _updateModel: function(cb) {
                var self = this;
                var model = self._model;
                model.displayName    = self.displayName;
                model.devID          = self.devID;
                model.maxMsgSize     = self.maxMsgSize;
                model.maxObjSize     = self.maxObjSize;
                model.conflictPolicy = self.conflictPolicy;
                model.isLocal        = 1;
                common.cascade([
                        // update the devInfo model
                        function(cb) {
                            if ( ! self.devInfo )
                    return cb();
                return self.devInfo._updateModel(cb);
                        },
                        // update the stores model
                        function(cb) {
                            model.stores = [];
                            common.cascade(_.values(self._stores), function(store, cb) {
                                store._updateModel(cb);
                            }, cb);
                        },

                        // update the peers model
                        function(cb) {
                            // NOTE: unlike stores, which can completely regenerate the
                            //       model based on the class, the peers store binding
                            //       and routing info is only in the model, so cannot be
                            //       completely deleted...
                            common.cascade(self._peers, function(peer, cb) {
                                peer._updateModel(cb);
                            }, cb);
                        }

                ], cb);
            },

            //-------------------------------------------------------------------------
            _load: function(cb) {
                var self = this;

                // TODO: if options specifies a devID/name/etc, use that...

                storage.getAll(
                    this._c,
                    this._c._txn().objectStore('adapter').index('isLocal'),
                    {only: 1},
                    function(err, adapters) {
                        if ( err ) {
                            return cb(err);
                        }
                        if ( adapters.length > 1 )
                            return cb('multiple local adapters defined - specify which devID to load');
                        if ( adapters.length <= 0 )
                            return cb(null, self);
                        self._loadModel(adapters[0], function(err) {
                            if ( err )
                                return cb(err);
                            return cb(null, self);
                        });
                    }
                );
            },

            //-------------------------------------------------------------------------
            _loadModel: function(model, cb) {
                var self = this;
                self._model         = model;
                self.displayName    = model.displayName;
                self.devID          = model.devID;
                self.maxMsgSize     = model.maxMsgSize;
                self.maxObjSize     = model.maxObjSize;
                self.conflictPolicy = model.conflictPolicy;
                common.cascade([
                        // load device info
                        function(cb) {
                            var di = new devinfomod.DevInfo(self, self._model.devInfo);
                            di._load(function(err) {
                                if ( err )
                                return cb(err);
                            self.devInfo = di;
                            cb();
                            });
                        },
                        // load stores
                        function(cb) {
                            common.cascade(model.stores, function(e, cb) {
                                var store = new storemod.Store(self, e);
                                store._load(function(err) {
                                    if ( err )
                                    return cb(err);
                                self._stores[store.uri] = store;
                                return cb();
                                });
                            }, cb);
                        },
                        // load peers
                        function(cb) {
                            var remotes = _.filter(model.peers, function(e) {
                                return ! e.isLocal;
                            });
                            self._peers = [];
                            common.cascade(remotes, function(e, cb) {
                                var peer = new remote.RemoteAdapter(self, e);
                                peer._load(function(err) {
                                    if ( err )
                                    return cb(err);
                                self._peers.push(peer);
                                return cb();
                                });
                            }, cb);
                        }
                ], cb);
            },

            //-------------------------------------------------------------------------
            sync: function(peer, mode, options, cb) {
                // `options` is optional and can have the following properties:
                //   * `ua`

                // TODO: initialize a new context transaction?...
                // todo: or perhaps add a new session.txn?...

                if ( cb == undefined && _.isFunction(options) )
                {
                    cb = options;
                    options = {};
                }
                options = options || {};

                var self = this;
                var discover = ( mode == constant.SYNCTYPE_DISCOVER );
                if ( discover )
                    mode = constant.SYNCTYPE_SLOW_SYNC;

                if ( ! _.find(self._peers, function(p) { return p === peer; }) )
                    return cb(new common.InvalidAdapter('invalid peer for adapter'));
                if ( mode != constant.SYNCTYPE_AUTO )
                {
                    mode = common.synctype2alert(mode);
                    if ( ! mode )
                        return cb(new common.TypeError('invalid synctype'));
                }
                if ( ! self.devInfo )
                    return cb(new common.InvalidAdapter('cannot synchronize adapter as client: invalid devInfo'));

                var session = state.makeSession({
                    context  : self._c,
                    ua       : new useragent.UserAgentMultiplexer([options.ua, self._c.ua]),
                    txn      : _.bind(self._c._txn, self._c),
                    adapter  : self,
                    peer     : peer,
                    isServer : false,
                    discover : discover,
                    info     : state.makeSessionInfo({
                        id       : ( peer.lastSessionID || 0 ) + 1,
                    msgID    : 1,
                    codec    : self._c.codec,
                    mode     : mode
                    })
                });

                session.send = function(contentType, data, cb) {
                    session.peer.sendRequest(session, contentType, data, function(err, response) {
                        if ( err )
                        return cb(err);
                    // todo: allow the client to force the server to authorize itself as well...
                    self._receive(session, response, null, cb);
                    });
                };

                // TODO: should i do a router.calculate() at this point?
                //       the reason is that if there was a sync, then a
                //       .setRoute(), then things may have changed...
                //       corner-case, yes... but still valid.

                var failed = 0;

                var startSession = function() {
                    session.context.protocol.initialize(session, null, function(err, commands) {
                        if ( err )
                        return cb(err);
                    self._transmit(session, commands, function(err) {
                        if ( err )
                    {
                        if ( ! ( err instanceof common.InvalidCredentials )
                            && ! ( err instanceof common.CredentialsRequired ) )
                            return cb(err);
                        if ( err instanceof common.InvalidCredentials )
                        failed += 1;
                    if ( failed > 100 )
                    {
                        return cb(err);
                    }
                    var credErr = err;
                    var uaEvent = {
                        session : session,
                        auth    : err.auth,
                        count   : failed
                    };
                    return session.ua.fetchCredentials(uaEvent, function(err, auth) {
                        if ( err )
                        return cb(err);
                    if ( ! auth )
                        return cb(credErr);
                    if ( auth.persist )
                    {
                        session.peer.auth = auth.type;
                        session.peer.username = auth.username;
                        session.peer.password = auth.password;
                    }
                    else
                        session.auth = auth;
                    // todo: should i just create a new session?...
                    session.info.id += 1;
                    session.info.msgID = 1;
                    return startSession();
                    });
                    }
                    self._save(session.txn(), function(err) {
                        if ( err )
                        return cb(err);
                    return cb(null, self._session2stats(session));
                    });
                    });
                    });
                };

                session.context.synchronizer.initStoreSync(session, function(err) {
                    if ( err )
                    return cb(err);
                startSession();
                });

            },

            //-------------------------------------------------------------------------
            _session2stats: function(session) {
                var ret = {};
                _.each(_.values(session.info.dsstates), function(ds) {
                    var stats = _.clone(ds.stats);
                    stats.mode = common.alert2synctype(ds.mode);
                    if ( ds.action == 'error' && ds.error )
                    stats.error = ds.error;
                ret[ds.uri] = stats;
                });
                return ret;
            },

            //-------------------------------------------------------------------------
            _transmit: function(session, commands, cb) {
                var self = this;
                if ( session.info.msgID > 20 )
                    return cb('too many client/server messages');
                session.context.protocol.negotiate(session, commands, function(err, commands) {
                    if ( err )
                    return cb(err);
                if ( session.context.protocol.isComplete(session, commands) )
                {
                    // we're done! store all the anchors and session IDs and exit...
                    var pmodel = session.peer._getModel();
                    if ( ! pmodel )
                    return cb('unexpected error: could not locate this peer in local adapter');
                _.each(session.info.dsstates, function(ds, uri) {
                    var pstore = _.find(pmodel.stores, function(s) { return s.uri == ds.peerUri; });
                    if ( ! pstore )
                    return cb('unexpected error: could not locate bound peer store in local adapter');
                pstore.binding.localAnchor  = ds.nextAnchor;
                pstore.binding.remoteAnchor = ds.peerNextAnchor;
                });
                session.peer.lastSessionID = session.info.id;
                pmodel.lastSessionID       = session.info.id;
                return cb();
                }
                session.context.protocol.produce(session, commands, function(err, tree) {
                    if ( err )
                    return cb(err);
                codec.Codec.autoEncode(tree, session.info.codec, function(err, contentType, data) {
                    if ( err )
                    return cb(err);
                // update the session with the last request commands so
                // that when we receive the response package, it can be
                // compared against that.
                // TODO: should that only be done on successful transmit?...
                session.info.lastCommands = commands;
                session.send(contentType, data, function(err) {
                    if ( err )
                    return cb(err);
                cb();
                });
                })
                });
                });
            },

            //-------------------------------------------------------------------------
            authorize: function(request, sessionInfo, authorize, cb) {
                var self = this;
                var ct   = request.headers['Content-Type'];
                codec.Codec.autoDecode(ct, request.body, function(err, xtree, codecName) {
                    if ( err )
                    return cb(err);
                self._c.protocol.authorize(xtree, null, authorize, cb);
                });
            },

            //-------------------------------------------------------------------------
            getTargetID: function(request, sessionInfo, cb) {
                var self = this;
                var ct   = request.headers['Content-Type'];
                codec.Codec.autoDecode(ct, request.body, function(err, xtree, codecName) {
                    if ( err )
                    return cb(err);
                return cb(null, self._c.protocol.getTargetID(xtree));
                });
            },

            //-------------------------------------------------------------------------
            handleRequest: function(request, sessionInfo, authorize, response, options, cb) {

                // TODO: initialize a new context transaction?...
                // todo: or perhaps add a new session.txn?...

                if ( cb == undefined && _.isFunction(options) )
                {
                    cb = options;
                    options = {};
                }
                options = options || {};

                var self = this;
                var session = state.makeSession({
                    context  : self._c,
                    ua       : new useragent.UserAgentMultiplexer([options.ua, self._c.ua]),
                    txn      : _.bind(self._c._txn, self._c),
                    adapter  : self,
                    peer     : null,
                    isServer : true,
                    info     : sessionInfo
                });
                session.send = response;
                this._receive(session, request, authorize, function(err, stats) {
                    if ( err )
                    return cb(err);
                self._save(session.txn(), function(err) {
                    if ( err )
                    return cb(err);
                return cb(null, self._session2stats(session));
                });
                });
            },

            //-------------------------------------------------------------------------
            _receive: function(session, request, authorize, cb) {
                var self = this;
                if ( ! session.isServer )
                {
                    session.info.lastMsgID = session.info.msgID;
                    session.info.msgID += 1;
                }
                var ct = request.headers['Content-Type'];
                codec.Codec.autoDecode(ct, request.body, function(err, xtree, codecName) {
                    if ( err )
                    return cb(err);
                session.info.codec = codecName;
                var do_authorize = ( ! authorize ) ? common.noop : function(cb) {
                    session.context.protocol.authorize(xtree, null, authorize, function(err) {
                        return cb(err);
                    });
                };
                do_authorize(function(err) {
                    if ( err )
                    return cb(err);
                session.context.protocol.consume(
                    session, session.info.lastCommands, xtree,
                    function(err, commands) {
                        if ( err ) {
                            return cb(err);
                        }
                        if ( session.discover && session.peer.devInfo )
                    return cb(null, self._session2stats(session));
                self._transmit(session, commands, function(err) {
                    if ( err )
                    return cb(err);
                if ( ! session.isServer )
                    return cb();
                self._save(session.txn(), function(err) {
                    if ( err )
                    return cb(err);
                return cb(null, self._session2stats(session));
                });
                });
                    }
                );
                });
                })
            },

    });

    return exports;

})();

module.exports = _self;
