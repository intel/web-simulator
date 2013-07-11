// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.synchronizer
// auth: griffin <griffin@uberdev.org>
// date: 2012/11/05
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    constant = require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
    ctype = require('ripple/platform/tizen/2.0/syncml-js-lib/ctype'),
    state = require('ripple/platform/tizen/2.0/syncml-js-lib/state'),
    protocol = require('ripple/platform/tizen/2.0/syncml-js-lib/protocol'),
    storage = require('ripple/platform/tizen/2.0/syncml-js-lib/storage'),
    _self;

_self = (function () {

    var exports = {};
    var badStatus = protocol.badStatus;

    //---------------------------------------------------------------------------
    exports.Synchronizer = common.Base.extend({

        //-------------------------------------------------------------------------
        constructor: function(options) {
        },

        //-------------------------------------------------------------------------
        initStoreSync: function(session, cb) {
            async.eachSeries(session.peer._getModel().stores, function(rstore, cb) {
                // TODO: should the server-side be doing this? probably not
                //       since store mapping is a client-side decision...
                var ruri = session.peer.normUri(rstore.uri);
                if ( session.info.dsstates[ruri] || ! rstore.binding )
                return cb();
            var lstore = session.adapter.getStore(rstore.binding.uri);
            if ( ! lstore || ! lstore.agent )
                return cb();
            var ds = state.makeStoreSyncState({
                uri        : lstore.uri,
                peerUri    : ruri,
                lastAnchor : rstore.binding.localAnchor,
                mode       : session.info.mode || constant.ALERT_TWO_WAY,
                action     : 'alert'
            });
            if ( ! ds.lastAnchor )
            {
                switch ( ds.mode )
            {
                case constant.ALERT_SLOW_SYNC:
                case constant.ALERT_REFRESH_FROM_CLIENT:
                case constant.ALERT_REFRESH_FROM_SERVER:
                    {
                        break;
                    }
                case constant.ALERT_TWO_WAY:
                case constant.ALERT_ONE_WAY_FROM_CLIENT:
                case constant.ALERT_ONE_WAY_FROM_SERVER:
                    {
                        if ( session.info.mode == constant.SYNCTYPE_AUTO )
                        {
                            ds.mode = constant.ALERT_SLOW_SYNC;
                            break;
                        }
                        var uaEvent = {
                            session   : session,
                            store     : lstore,
                            peerStore : rstore,
                            modeReq   : ds.mode
                        };
                        return session.ua.chooseRefreshRequired(uaEvent, function(err, mode) {
                            if ( err )
                            return cb(err);
                        if ( ! _.contains([constant.ALERT_SLOW_SYNC,
                                constant.ALERT_REFRESH_FROM_CLIENT,
                                constant.ALERT_REFRESH_FROM_SERVER], mode) )
                            return cb(new common.TypeError(
                                    'invalid mode chosen for refresh: ' + common.j(mode)));
                        ds.mode = mode;
                        session.info.dsstates[ds.uri] = ds;
                        return cb();
                        });
                    }
                default:
                    {
                        return cb(new common.InternalError(
                                    'unexpected sync mode "' + ds.mode + '" requested'));
                    }
            }
            }
            session.info.dsstates[ds.uri] = ds;
            return cb();
            }, cb);
        },

        //-------------------------------------------------------------------------
        // SYNCHRONIZATION PHASE: ACTION
        //-------------------------------------------------------------------------

        //-------------------------------------------------------------------------
        actions: function(session, commands, cb) {
            var self = this;
            common.cascade(_.keys(session.info.dsstates), function(uri, cb) {
                var ds = session.info.dsstates[uri];
                if ( ds.action == 'done' )
                return cb();
            // TODO: is this the right handling of an "error" dsstate?...
            if ( ds.action == 'error' )
                return cb();
            var func = self['_action_' + ds.action.toLowerCase()];
            if ( ! func )
                return cb(new common.InternalError(
                        'unexpected store action "' + ds.action + '"'));
            try{
                func.call(self, session, ds, function(err, cmds) {
                    if ( err )
                    return cb(err);
                _.each(cmds, function(cmd) { commands.push(cmd); });
                return cb();
                });
            }catch(e){
                return cb(new common.InternalError(
                        'failed invoking synchronizer action: ' + e, e));
            }
            }, function(err) {
                if ( err )
                    return cb(err);
                return cb(null, commands);
            });
        },

        //-------------------------------------------------------------------------
        _action_alert: function(session, dsstate, cb) {

            var src = session.adapter.getStore(dsstate.uri);
            var tgt = session.peer.getStore(dsstate.peerUri);

            // TODO: ensure that mode is acceptable...

            // todo: perhaps i should only specify maxObjSize if it differs from
            //       adapter.maxObjSize?...

            return cb(null, [state.makeCommand({
                name        : constant.CMD_ALERT,
                   cmdID       : session.nextCmdID(),
                   data        : dsstate.mode,
                   source      : src.uri,
                   target      : tgt.uri,
                   lastAnchor  : dsstate.lastAnchor,
                   nextAnchor  : dsstate.nextAnchor,
                   maxObjSize  : src.maxObjSize,
            })]);

        },

        //-------------------------------------------------------------------------
        _action_send: function(session, dsstate, cb) {
            var store = session.adapter.getStore(dsstate.uri);
            var agent = store.agent;
            var peerStore = session.peer.getStore(dsstate.peerUri);

            var cmd = state.makeCommand({
                name   : constant.CMD_SYNC,
                cmdID  : session.nextCmdID(),
                source : dsstate.uri,
                // target : adapter.router.getTargetUri(uri),
                target : dsstate.peerUri
            });

            switch ( dsstate.mode )
            {
                case constant.ALERT_TWO_WAY:
                case constant.ALERT_SLOW_SYNC:
                case constant.ALERT_ONE_WAY_FROM_CLIENT:
                case constant.ALERT_REFRESH_FROM_CLIENT:
                case constant.ALERT_ONE_WAY_FROM_SERVER:
                case constant.ALERT_REFRESH_FROM_SERVER:
                    // todo: these should only be received out-of-band, right?...
                    // case constant.ALERT_TWO_WAY_BY_SERVER:
                    // case constant.ALERT_ONE_WAY_FROM_CLIENT_BY_SERVER:
                    // case constant.ALERT_REFRESH_FROM_CLIENT_BY_SERVER:
                    // case constant.ALERT_ONE_WAY_FROM_SERVER_BY_SERVER:
                    // case constant.ALERT_REFRESH_FROM_SERVER_BY_SERVER:
                    {
                        break;
                    }
                default:
                    {
                        return cb(new common.InternalError(
                                    'unexpected sync mode "' + common.mode2string(dsstate.mode) + '"'));
                    }
            }

            if ( session.isServer )
            {
                if ( dsstate.mode == constant.ALERT_REFRESH_FROM_CLIENT
                        || dsstate.mode == constant.ALERT_ONE_WAY_FROM_CLIENT )
                {
                    cmd.noc = 0;
                    return cb(null, [cmd]);
                }
            }

            if ( ! session.isServer )
            {
                if ( dsstate.mode == constant.ALERT_REFRESH_FROM_SERVER
                        || dsstate.mode == constant.ALERT_ONE_WAY_FROM_SERVER )
                {
                    cmd.noc = 0;
                    return cb(null, [cmd]);
                }
            }

            switch ( dsstate.mode )
            {

                case constant.ALERT_TWO_WAY:
                case constant.ALERT_ONE_WAY_FROM_CLIENT: // when ! session.isServer
                case constant.ALERT_ONE_WAY_FROM_SERVER: // when session.isServer
                    {
                        // send local changes

                        storage.getAll(
                                session.context,
                                session.txn().objectStore('change').index('store_id'),
                                {only: peerStore.id},
                                function(err, changes) {
                                    if ( err )
                            return cb(err);
                        var ctype = session.context.router.getBestTransmitContentType(
                            session.adapter, session.peer, dsstate.uri);
                        cmd.data = [];

                        // TODO: add support for hierarchical operations...
                        //       including MOVE, COPY, etc.

                        // TODO: this assumes that the entire object set can fit in memory...
                        //       perhaps, as a work-around, just keep a reference to the object
                        //       and then stream-based serialize it actually gets converted to
                        //       XML.

                        common.cascade(changes, function(change, cb) {

                            if ( dsstate.conflicts && _.indexOf(dsstate.conflicts, change.item_id) >= 0 )
                            return cb();

                        var scmdtype = null;
                        switch ( change.state )
                        {
                            case constant.ITEM_ADDED:    scmdtype = constant.CMD_ADD;     break;
                            case constant.ITEM_MODIFIED: scmdtype = constant.CMD_REPLACE; break;
                            case constant.ITEM_DELETED:  scmdtype = constant.CMD_DELETE;  break;
                            default:
                                                         {
                                                             return cb();
                                                         }
                        }

                        // todo: do something with the ctype version (ie. ctype[1])?...
                        var scmd = state.makeCommand({
                            name    : scmdtype,
                            cmdID   : session.nextCmdID(),
                            format  : constant.FORMAT_AUTO,
                            type    : change.state != constant.ITEM_DELETED ? ctype[0] : null,
                            uri     : dsstate.uri
                        });

                        // TODO: need to add hierarchical addition support here...

                        var set_data = scmdtype == constant.CMD_DELETE ? common.noop : function(cb) {

                            agent.getItem(change.item_id, function(err, item) {
                                if ( err )
                                return cb(err);
                            agent.dumpsItem(item, ctype[0], ctype[1], function(err, data, nct, nv) {
                                if ( err )
                                return cb(err);
                            scmd.data = data;
                            scmd.type = nct || scmd.type;
                            // todo: what to do with the content-type version?... eg.
                            //         scmd.version = nv || scmd.version;
                            // TODO: support hierarchical sync
                            // if ( agent.hierarchicalSync && item.parent )
                            //   scmd.sourceParent = '' + item.parent
                            return cb();
                            });
                            });
                        };

                        var set_target = scmdtype == constant.CMD_ADD ? function(cb) {
                            scmd.source = change.item_id;
                            cb();
                        } : function(cb) {
                            if ( ! session.isServer )
                            {
                                scmd.source = change.item_id;
                                return cb();
                            }
                            peerStore._getMapping(change.item_id, function(err, luid) {
                                if ( err )
                                return cb(err);
                            if ( luid )
                                scmd.target = luid;
                            else
                                scmd.source = change.item_id;
                            cb();
                            });
                        };

                        set_data(function(err) {
                            if ( err )
                            return cb(err);
                        set_target(function(err) {
                            if ( err )
                            return cb(err);
                        cmd.data.push(scmd);
                        return cb();
                        });
                        });
                        }, function(err) {
                            if ( err )
                                return cb(err);
                            cmd.noc = cmd.data.length;
                            return cb(null, [cmd]);
                        });
                                }
                        );
                        return;
                    }
                case constant.ALERT_SLOW_SYNC:
                case constant.ALERT_REFRESH_FROM_SERVER: // when session.isServer
                case constant.ALERT_REFRESH_FROM_CLIENT: // when ! session.isServer
                    {
                        // todo: this approach assumes that the entire object set can fit
                        //       in memory... perhaps move to an iterator-based approach?...
                        cmd.data = [];

                        agent.getAllItems(function(err, items) {

                            if ( err )
                            return cb(err);

                        // TODO: support hierarchical sync...

                        if ( agent.hierarchicalSync )
                        {
                            return cb(new common.NotImplementedError('hierarchical-sync'));
                            //       orditems = []            # the ordered items
                            //       dunitems = dict()        # lut of the ordered items
                            //       curitems = dict()        # lut of current items (for loop detection)
                            //       lutitems = dict([(item.id, item) for item in items])
                            //       def appenditem(item):
                            //         if item.id in dunitems:
                            //           return
                            //         if item.id in curitems:
                            //           raise common.LogicalError('recursive item hierarchy detected at item %r' % (item,))
                            //         curitems[item.id] = True
                            //         if item.parent is not None:
                            //           appenditem(lutitems[item.parent])
                            //         orditems.append(item)
                            //         dunitems[item.id] = item
                            //       for item in items:
                            //         curitems = dict()
                            //         appenditem(item)
                        }

                        var ctype = session.context.router.getBestTransmitContentType(
                                session.adapter, session.peer, dsstate.uri);

                        common.cascade(items, function(item, cb) {

                            // TODO: these should all be non-deleted items, right?...

                            if ( _.indexOf(dsstate.conflicts, '' + item.id) >= 0 )
                            return cb();

                        // note: need to check for mappings since on slow-sync, the
                        // server will already have received the client's "add" commands
                        // at this point (and therefore should not send them back...)
                        var check_sync = function(cb) {
                            if ( ! session.isServer )
                            return cb(null, true);
                        peerStore._getMapping(item.id, function(err, luid) {
                            return cb(err, luid ? false : true);
                        });
                        };

                        check_sync(function(err, dosync) {
                            if ( err )
                            return cb(err);

                        if ( ! dosync )
                            return cb();

                        agent.dumpsItem(
                            item, ctype[0], ctype[1],
                            function(err, data, new_ct, new_v) {

                                if ( err )
                            return cb(err);

                        // todo: do something with the content-type version...
                        var scmd = state.makeCommand({
                            name    : constant.CMD_ADD,
                            cmdID   : session.nextCmdID(),
                            format  : constant.FORMAT_AUTO,
                            type    : new_ct || ctype[0],
                            uri     : dsstate.uri,
                            source  : '' + item.id,
                            data    : data
                        });

                        if ( agent.hierarchicalSync )
                        {
                            // TODO: support hierarchical sync...
                            // if agent.hierarchicalSync and item.parent is not None:
                            //   scmd.sourceParent = str(item.parent)
                            return cb(new common.NotImplementedError('hierarchical-sync'));
                        }

                        cmd.data.push(scmd);
                        return cb();
                            });

                        });

                        }, function(err) {
                            if ( err )
                                return cb(err);
                            cmd.noc = cmd.data.length;
                            return cb(null, [cmd]);
                        });

                        });
                        return;
                    }
            }

            return cb(new common.InternalError(
                        'unexpected sync situation (action=' + dsstate.action
                            + ', mode=' + common.mode2string(dsstate.mode)
                            + ', isServer=' + ( session.isServer ? '1' : '0' ) + ')'));
                    },

                    //-------------------------------------------------------------------------
                    _action_save: function(session, dsstate, cb) {
                        if ( ! session.isServer )
                // TODO: for now, only servers should take the "save" action - the client
                //       will explicitly do this at the end of the .sync() method.
                //       ... mostly because clients don't call synchronizer.actions()
                //       one final time ...
                //       *BUT* perhaps that should be changed?... for example, .sync()
                //       could call synchronizer.actions() to cause action_save's to occur
                //       *AND* verify that synchronizer.actions() does not return anything...
                return cb(new common.InternalError(
                        'unexpected sync save situation (action=' + dsstate.action
                            + ', mode=' + common.mode2string(dsstate.mode)
                            + ', isServer=' + ( session.isServer ? '1' : '0' ) + ')'));

                    var peerStore = session.peer.getStore(dsstate.peerUri);
                    var binding = peerStore._getBinding();
                    binding.localAnchor  = dsstate.nextAnchor;
                    binding.remoteAnchor = dsstate.peerNextAnchor;
                    return cb(null);
                    },

                    //-------------------------------------------------------------------------
                    // SYNCHRONIZATION PHASE: REACTION
                    //-------------------------------------------------------------------------

                    //-------------------------------------------------------------------------
                    reactions: function(session, commands, cb) {
                        var self = this;
                        var ret  = [];
                        session.hierlut = null;
                        common.cascade(commands, function(cmd, cb) {
                            var func = self['_reaction_' + cmd.name.toLowerCase()];
                            if ( ! func )
                            return cb(new common.InternalError(
                                    'unexpected store reaction "' + cmd.name + '"'));
                        try{
                            func.call(self, session, cmd, function(err, cmds) {
                                if ( err ) {
                                    return cb(err);
                                }
                                _.each(cmds, function(cmd) { ret.push(cmd); });
                                return cb();
                            });
                        }catch(e){
                            return cb(new common.InternalError(
                                    'failed invoking synchronizer reaction: ' + e, e));
                        }
                        }, function(err) {
                            session.hierlut = null;
                            if ( err )
                                return cb(err);
                            return cb(null, ret);
                        });
                    },

                    //-------------------------------------------------------------------------
                    _reaction_sync: function(session, command, cb) {
                        var self = this;
                        var ret  = [state.makeCommand({
                            name       : constant.CMD_STATUS,
                            cmdID      : session.nextCmdID(),
                            msgRef     : command.msgID,
                            cmdRef     : command.cmdID,
                            targetRef  : command.target,
                            sourceRef  : command.source,
                            statusOf   : command.name,
                            statusCode : constant.STATUS_OK
                        })];
                        var store = session.adapter.getStore(session.adapter.normUri(command.target));
                        var dsstate = session.info.dsstates[store.uri];
                        if ( ! store.agent )
                        {
                            // todo: this is a bit different handling than anywhere else...
                            //       should everywhere else be like here, or the other way
                            //       round?...
                            //       the "REAL BIG ISSUE" is that atomicity of the changes
                            //       is a little vague at this point...
                            dsstate.stats.hereErr += 1;
                            dsstate.action = 'error';
                            dsstate.error  = {
                                message:  'Sync agent for store "' + store.uri + '" not available',
                                code:     'syncml-js.TypeError'
                            };
                            ret[0].statusCode = constant.STATUS_SERVICE_UNAVAILABLE;
                            ret[0].errorMsg   = dsstate.error.message;
                            ret[0].errorCode  = dsstate.error.code;
                            return cb(null, ret);
                        }

                        if ( store.agent.hierarchicalSync )
                            session.hierlut = {};

                        var preprocess = common.noop;

                        if ( ( ! session.isServer && dsstate.mode == constant.ALERT_REFRESH_FROM_SERVER )
                                || ( session.isServer && dsstate.mode == constant.ALERT_REFRESH_FROM_CLIENT ) )
                        {
                            // delete all local items
                            preprocess = function(cb) {
                                store.agent.getAllItems(function(err, items) {
                                    if ( err )
                                    return cb(err);
                                common.cascade(items, function(item, cb) {
                                    store.agent.deleteItem(item.id, function(err) {
                                        if ( err )
                                        return cb(err);
                                    dsstate.stats.hereDel += 1;
                                    if ( ! session.isServer )
                                        return cb();
                                    store.registerChange(item.id, constant.ITEM_DELETED,
                                        {excludePeerID: session.peer.id}, cb);
                                    });
                                }, function(err) {
                                    if ( err )
                                    return cb(err);
                                return store.getPeerStore(session.peer)._delChange({}, cb);
                                });
                                });
                            };
                        }

                        if ( dsstate.mode == constant.ALERT_SLOW_SYNC
                                || ( session.isServer && dsstate.mode == constant.ALERT_REFRESH_FROM_SERVER ) )
                        {
                            // delete all mappings and pending changes
                            var peerStore = store.getPeerStore(session.peer);
                            var prepreprocess = preprocess;
                            preprocess = function(cb) {
                                prepreprocess(function(err) {
                                    if ( err )
                                    return cb(err);
                                peerStore._delChange({}, function(err) {
                                    if ( err )
                                    return cb(err);
                                peerStore._clearAllMappings(cb);
                                });
                                });
                            };
                        }

                        preprocess(function(err) {
                            if ( err )
                            return cb(err);

                        if ( command.data.length <= 0 )
                            return cb(null, ret);

                        // paranoia: verify that i should be receiving data...
                        if ( ! ( dsstate.mode == constant.ALERT_TWO_WAY
                                || dsstate.mode == constant.ALERT_SLOW_SYNC
                                || ( ! session.isServer
                                    && ( dsstate.mode == constant.ALERT_ONE_WAY_FROM_SERVER
                                        || dsstate.mode == constant.ALERT_REFRESH_FROM_SERVER ) )
                                || ( session.isServer
                                    && ( dsstate.mode == constant.ALERT_ONE_WAY_FROM_CLIENT
                                        || dsstate.mode == constant.ALERT_REFRESH_FROM_CLIENT ) ) ) )
                            return cb(new common.ProtocolError(
                                    'unexpected sync data (role="'
                                        + ( session.isServer ? 'server' : 'client' )
                                        + '", mode="' + common.mode2string(dsstate.mode)
                                        + '")'));

                        common.cascade(command.data, function(cmd, cb) {

                            // NOTE: commented this paranoia setting out, since the server
                            //       *may* decide to update/delete a client item...
                            //       e.g. conflict-resolved-merge (207)
                            // TODO: perhaps i should only allow non-ADDs for those items
                            //       that i received a conflict-resolved-merge (207) for?...

                            // // paranoia: non-'add' sync commands should only be received in non-refresh modes
                            // if ( cmd.name != constant.CMD_ADD
                            //      && _.indexOf([constant.ALERT_TWO_WAY,
                            //                    constant.ALERT_ONE_WAY_FROM_SERVER,
                            //                    constant.ALERT_ONE_WAY_FROM_CLIENT], dsstate.mode) < 0 )
                            //   return cb(new common.ProtocolError(
                            //     'unexpected non-add sync command (role="'
                            //       + ( session.isServer ? 'server' : 'client' )
                            //       + '", mode="' + common.mode2string(dsstate.mode)
                            //       + '", command="' + cmd.name
                            //       + '")'));

                            self._reaction_syncdispatch(session, cmd, store, dsstate, function(err, cmds) {
                                if ( err )
                                return cb(err);
                            _.each(cmds, function(cmd) { ret.push(cmd); });
                            return cb();
                            });

                        }, function(err) {
                            if ( err )
                                return cb(err);
                            return cb(null, ret);
                        });
                        });
                    },

                    //-------------------------------------------------------------------------
                    _reaction_syncdispatch: function(session, cmd, store, dsstate, cb) {

                        var self = this;
                        var func = self['_reaction_sync_' + cmd.name.toLowerCase()];
                        if ( ! func )
                            return cb(new common.ProtocolError(
                                        'unexpected reaction requested for sync command "' + cmd.name + '"'));

                        var check_for_conflicts = common.noop;

                        if ( session.isServer
                                && cmd.name != constant.CMD_ADD
                                && dsstate.mode != constant.ALERT_REFRESH_FROM_CLIENT )
                        {
                            // server, non-add, non-slowsync, non-refresh commands: check for conflicts.
                            // note that certain types of content could be a conflict even if it is an
                            // "Add" command; for example, two files with the same name cannot be added
                            // from separate clients.

                            check_for_conflicts = function(cb) {

                                // todo: allow agents to raise a ConflictError...
                                //       ==> perhaps this is already covered by the .matchItem() API?...

                                var policy = store.conflictPolicy || session.adapter.conflictPolicy;
                                var peerStore = session.peer.getStore(dsstate.peerUri);
                                self.getSourceMapping(
                                        session, constant.CMD_SYNC, cmd, peerStore, cmd.source,
                                        function(err, itemID) {

                                            if ( err )
                                    return cb(err);
                                if ( ! itemID )
                                    // this shouldn't happen...
                                    return cb();

                                peerStore._getChange(itemID, function(err, change) {
                                    if ( err )
                                    return cb(err);
                                if ( ! change )
                                    return cb();

                                var retcmd = state.makeCommand({
                                    name       : constant.CMD_STATUS,
                                    cmdID      : session.nextCmdID(),
                                    msgRef     : cmd.msgID,
                                    cmdRef     : cmd.cmdID,
                                    sourceRef  : cmd.source,
                                    targetRef  : cmd.target,
                                    statusOf   : cmd.name,
                                    // todo: make this error message a bit more descriptive...
                                    errorMsg   : 'command "' + cmd.name + '" conflict for item ID "'
                                    + itemID + '" (state: ' + common.state2string(change.state) + ')'
                                });


                                    // four possible states: mod-mod, mod-del, del-mod, del-del
                                    if ( ! dsstate.conflicts )
                                    dsstate.conflicts = [];

                                    // handle mod-mod (but only if change-tracking is enabled)
                                    if ( change.state == constant.ITEM_MODIFIED
                                        && cmd.name == constant.CMD_REPLACE )
                                    {
                                        cmd._conflict = retcmd;
                                        cmd._change   = change;
                                        return cb();
                                    }

                                    // handle del-del
                                    if ( change.state == constant.ITEM_DELETED
                                            && cmd.name == constant.CMD_DELETE )
                                    {
                                        // both changes are deletes... that's not a conflict.
                                        // TODO: should i really be doing all this here?... it does not
                                        //       follow the pattern..
                                        peerStore._delChange({
                                            itemID: change.item_id,
                                            state:  change.state
                                        }, function(err) {
                                            if ( err )
                                            return cb(err);
                                        dsstate.stats.peerDel   += 1;
                                        dsstate.stats.hereDel   += 1;
                                        dsstate.stats.merged    += 1;
                                        retcmd.statusCode = constant.STATUS_CONFLICT_RESOLVED_MERGE;
                                        retcmd.errorCode  = null;
                                        retcmd.errorMsg   = null;
                                        return cb(null, [retcmd]);
                                        });
                                        return;
                                    }

                                    // handle del-mod or mod-del
                                    if ( ( change.state == constant.ITEM_DELETED
                                                || cmd.name == constant.CMD_DELETE )
                                            && policy != constant.POLICY_ERROR )
                                    {
                                        // one of them is a delete and a conflict that can be solved
                                        // by the framework
                                        cmd._conflict = retcmd;
                                        cmd._change   = change;
                                        return cb();
                                    }

                                    dsstate.conflicts.push(itemID);
                                    dsstate.stats.peerErr   += 1;
                                    dsstate.stats.conflicts += 1;
                                    retcmd.statusCode = constant.STATUS_UPDATE_CONFLICT;
                                    retcmd.errorCode  = 'syncml-js.synchronizer.RSd.10';
                                    return cb(null, [retcmd]);
                                });
                                        }
                                );
                            };
                        }

                        check_for_conflicts(function(err, cmds) {
                            if ( err || cmds )
                            return cb(err, cmds);
                        try{
                            func.call(self, session, cmd, store, dsstate, cb);
                        }catch(e){
                            return cb(new common.InternalError(
                                    'failed invoking synchronizer sync reaction: ' + e, e));
                        }
                        });

                    },

                    //-------------------------------------------------------------------------
                    _reaction_sync_add: function(session, cmd, store, dsstate, cb) {
                        var curitem = null;
                        var item    = null;
                        if ( store.agent.hierarchicalSync )
                        {
                            if ( cmd.targetParent )
                                cmd.data.parent = cmd.targetParent;
                            else if ( cmd.sourceParent )
                                cmd.data.parent = session.hierlut[cmd.sourceParent];
                        }

                        var matcher = common.noop;
                        if ( session.isServer && dsstate.mode == constant.ALERT_SLOW_SYNC )
                        {
                            // TODO: if the matched item is already mapped to another client-side
                            //       object, then this should cancel the matching...
                            matcher = function(cb) {
                                store.agent.matchItem(cmd.data, function(err, match) {
                                    if ( err )
                                    return cb(err);
                                if ( ! match || ! match.compare )
                                    return cb();
                                curitem = match;
                                if ( match.compare(cmd.data) == 0 )
                                    return cb();
                                store.agent.mergeItems(curitem, cmd.data, null, function(err) {
                                    // TODO: if there is a common.ConflictError, set
                                    //       curitem to null and continue without error...
                                    if ( err )
                                    return cb(err);
                                store.registerChange(curitem.id, constant.ITEM_MODIFIED,
                                    {changeSpec: cspec, excludePeerID: session.peer.id},
                                    cb);
                                });
                                });
                            };
                        }

                        matcher(function(err) {
                            if ( err )
                            return cb(err);
                        var adder = common.noop;
                        if ( ! curitem )
                            adder = function(cb) {
                                store.agent.addItem(cmd.data, function(err, newitem) {
                                    if ( err )
                                    return cb(err);
                                item = newitem;
                                dsstate.stats.hereAdd += 1;
                                store.registerChange(item.id, constant.ITEM_ADDED,
                                    {excludePeerID: session.peer.id}, cb);
                                });
                            };
                        else
                            item = curitem;
                        return adder(function(err) {
                            if ( err )
                            return cb(err);

                        if ( store.agent.hierarchicalSync )
                            session.hierlut[cmd.source] = item.id;

                        var ret = [state.makeCommand({
                            name       : constant.CMD_STATUS,
                            cmdID      : session.nextCmdID(),
                            msgRef     : cmd.msgID,
                            cmdRef     : cmd.cmdID,
                            sourceRef  : cmd.source,
                            statusOf   : cmd.name,
                            statusCode : ( curitem
                                ? constant.STATUS_ALREADY_EXISTS
                                : constant.STATUS_ITEM_ADDED )
                        })];

                        if ( ! session.isServer )
                        {
                            ret.push(state.makeCommand({
                                name       : constant.CMD_MAP,
                                cmdID      : session.nextCmdID(),
                                source     : store.uri,
                                target     : dsstate.peerUri,
                                sourceItem : item.id,
                                targetItem : cmd.source
                            }));
                            return cb(null, ret);
                        }

                        var peerStore = session.peer.getStore(dsstate.peerUri);
                        peerStore._setMapping(item.id, cmd.source, function(err) {
                            if ( err )
                            return cb(err);
                        return cb(null, ret);
                        });

                        });
                        });

                    },

                    //-------------------------------------------------------------------------
                    getSourceMapping: function(session, cmdctxt, cmd, peerStore, luid, cb) {
                        peerStore._getReverseMapping(luid, function(err, guid) {

                            if ( err )
                            return cb(err);

                        if ( guid )
                            return cb(null, guid);

                        return cb(new common.InvalidItem(
                                'unexpected "' + cmdctxt + '/' + cmd.name
                                + '" request for unmapped item ID "' + luid + '"'));

                        // todo: pysyncml generates a nice cmd-specific error node:
                        //       (which is probably over-kill)

                        //     curmap = adapter._context._model.Mapping.q(store_id=peerStore.id, luid=luid).one()
                        //     return str(curmap.guid)
                        //   except NoResultFound:
                        //     msg = 'unexpected "%s/%s" request for unmapped item ID: %r' % (cmdctxt, cmd.name, luid)
                        //     # todo: this is a bit of a hack when cmdctxt == 'Status'...
                        //     return state.Command(
                        //       name       = constant.CMD_STATUS,
                        //       cmdID      = session.nextCmdID(),
                        //       msgRef     = cmd.msgID,
                        //       cmdRef     = cmd.cmdID,
                        //       sourceRef  = cmd.source,
                        //       targetRef  = cmd.target,
                        //       statusOf   = cmd.name if cmdctxt != constant.CMD_STATUS else cmdctxt,
                        //       statusCode = constant.STATUS_COMMAND_FAILED,
                        //       errorCode  = __name__ + '.' + self.__class__.__name__ + '.GSM.10',
                        //       errorMsg   = msg,
                        //       )

                        });
                    },

                    //-------------------------------------------------------------------------
                    _reaction_sync_replace: function(session, cmd, store, dsstate, cb) {

                        // TODO: handle hierarchical-sync...
                        var self = this;
                        var item = cmd.data;
                        var get_item_id = ( ! session.isServer ) ? function(cb) {
                            item.id = cmd.target;
                            return cb();
                        } : function(cb) {
                            var peerStore = session.peer.getStore(dsstate.peerUri);
                            self.getSourceMapping(
                                    session, constant.CMD_SYNC, cmd, peerStore, cmd.source,
                                    function(err, guid) {

                                        if ( err )
                                return cb(err);

                            // todo: what if guid is null?...

                            item.id = guid;
                            return cb();
                                    }
                                    );
                        };

                        var okcmd = state.makeCommand({
                            name       : constant.CMD_STATUS,
                            cmdID      : session.nextCmdID(),
                            msgRef     : cmd.msgID,
                            cmdRef     : cmd.cmdID,
                            targetRef  : cmd.target,
                            sourceRef  : cmd.source,
                            statusOf   : cmd.name,
                            statusCode : constant.STATUS_OK
                        });

                        var handle_conflict = ( ! cmd._conflict ) ? common.noop : function(cb) {

                            //   if cmd._conflict is not None:
                            //     try:
                            //       if cmd._change.state == constant.ITEM_DELETED:
                            //         raise common.ConflictError('item deleted')
                            //       if cmd._change.changeSpec is None:
                            //         raise common.ConflictError('no change tracking enabled - falling back to policy')
                            //       cspec = store.agent.mergeItems(store.agent.getItem(item.id), item, cmd._change.changeSpec)
                            //       dsstate.stats.hereMod += 1
                            //       store.registerChange(item.id, constant.ITEM_MODIFIED,
                            //                            changeSpec=cspec, excludePeerID=adapter.peer.id)
                            //       okcmd.statusCode = constant.STATUS_CONFLICT_RESOLVED_MERGE
                            //       # NOTE: *not* suppressing the change that is registered from server
                            //       #       to client, since the merge may have resulted in an item that
                            //       #       is not identical to the one on the client.
                            //       return [okcmd]
                            //     except common.ConflictError, e:
                            //       # conflict types: client=mod/server=mod or client=mod/server=del
                            //       if store.conflictPolicy == constant.POLICY_CLIENT_WINS:
                            //         adapter._context._model.session.delete(cmd._change)
                            //         dsstate.stats.merged += 1
                            //         okcmd.statusCode = constant.STATUS_CONFLICT_RESOLVED_CLIENT_DATA
                            //         if cmd._change.state == constant.ITEM_DELETED:
                            //           # todo: this "re-creation" of a new item is detrimental to
                            //           #       clients that are tracking changes to an item (for
                            //           #       example, a SyncML svn client bridge...). but then, to
                            //           #       them, this item may already have been deleted. ugh.
                            //           dsstate.stats.hereMod += 1
                            //           item = store.agent.addItem(item)
                            //           peerStore = store.peer
                            //           adapter._context._model.Mapping.q(store_id=peerStore.id, guid=item.id).delete()
                            //           newmap = adapter._context._model.Mapping(store_id=peerStore.id,
                            //                                                    guid=item.id,
                            //                                                    luid=cmd.source)
                            //           adapter._context._model.session.add(newmap)
                            //           store.registerChange(item.id, constant.ITEM_ADDED,
                            //                                excludePeerID=adapter.peer.id)
                            //           return [okcmd]
                            //         # falling back to standard handling...
                            //       elif store.conflictPolicy == constant.POLICY_SERVER_WINS:
                            //         dsstate.stats.merged += 1
                            //         okcmd.statusCode = constant.STATUS_CONFLICT_RESOLVED_SERVER_DATA
                            //         return [okcmd]
                            //       else:
                            //         # store.conflictPolicy == constant.POLICY_ERROR or other...
                            //         dsstate.stats.peerErr    += 1
                            //         dsstate.stats.conflicts  += 1
                            //         cmd._conflict.errorMsg   += ', agent failed merge: ' + str(e)
                            //         cmd._conflict.statusCode = constant.STATUS_UPDATE_CONFLICT
                            //         cmd._conflict.errorCode  = common.fullClassname(self) + '.RSR.10'
                            //         dsstate.conflicts.append(str(item.id))
                            //         return [cmd._conflict]

                            cb();

                        };

                        // TODO: support hierarchical-sync...
                        // if ( store.agent.hierarchicalSync )
                        //   session.hierlut[cmd.source] = item.id;

                        get_item_id(function(err) {
                            if ( err )
                            return cb(err);
                        handle_conflict(function(err) {
                            if ( err )
                            return cb(err);
                        store.agent.replaceItem(item, session.isServer, function(err, cspec) {
                            if ( err )
                            return cb(err);
                        dsstate.stats.hereMod += 1;
                        store.registerChange(
                            item.id, constant.ITEM_MODIFIED,
                            {changeSpec: cspec, excludePeerID: session.peer.id},
                            function(err) {
                                if ( err )
                            return cb(err);
                        return cb(null, [okcmd]);
                            }
                            );
                        });
                        });
                        });

                    },

                    //-------------------------------------------------------------------------
                    _reaction_sync_delete: function(session, cmd, store, dsstate, cb) {

                        var self   = this;
                        var status = constant.STATUS_OK;
                        var itemID = null;

                        var get_item_id = ( ! session.isServer ) ? function(cb) {
                            itemID = cmd.target;
                            return cb();
                        } : function(cb) {
                            var peerStore = session.peer.getStore(dsstate.peerUri);
                            self.getSourceMapping(
                                    session, constant.CMD_SYNC, cmd, peerStore, cmd.source,
                                    function(err, guid) {

                                        // if not isinstance(itemID, basestring):
                                        //   return [itemID]

                                        if ( err )
                                return cb(err);

                            // todo: what if guid is null?...

                            itemID = guid;
                            if ( ! cmd._conflict )
                                return cb();
                            var policy = store.conflictPolicy || session.adapter.conflictPolicy;
                            switch ( policy )
                            {

                                case constant.POLICY_CLIENT_WINS:
                                    {


                                        // TODO ::: implement these...

                                        //   //     adapter._context._model.session.delete(cmd._change)
                                        //   //     status = constant.STATUS_CONFLICT_RESOLVED_CLIENT_DATA
                                        //   //     session.dsstates[store.uri].stats.merged += 1
                                        //   //     # falling back to standard handling...

                                        //   break;

                                    }
                                case constant.POLICY_SERVER_WINS:
                                    {


                                        //   //     adapter._context._model.session.delete(cmd._change)
                                        //   //     store.peer.registerChange(itemID, constant.ITEM_ADDED)
                                        //   //     session.dsstates[store.uri].stats.merged += 1
                                        //   //     cmd._conflict.statusCode = constant.STATUS_CONFLICT_RESOLVED_SERVER_DATA
                                        //   //     cmd._conflict.errorCode  = None
                                        //   //     cmd._conflict.errorMsg   = None
                                        //   //     return [cmd._conflict]

                                        //   break;

                                    }

                                default:
                                    {
                                        // a constant.POLICY_ERROR policy should have been handled by the dispatch
                                        return cb(new common.InternalError(
                                                    'unexpected conflictPolicy: %s', '' + policy));
                                    }
                            }
                                    }
                            );

                        };

                        get_item_id(function(err) {
                            if ( err )
                            return cb(err);
                        store.agent.deleteItem(itemID, function(err) {
                            if ( err )
                            return cb(err);
                        dsstate.stats.hereDel += 1;
                        store.registerChange(
                            itemID, constant.ITEM_DELETED, {excludePeerID: session.peer.id},
                            function(err) {
                                if ( err )
                            return cb(err);
                        return cb(null, [state.makeCommand({
                            name       : constant.CMD_STATUS,
                               cmdID      : session.nextCmdID(),
                               msgRef     : cmd.msgID,
                               cmdRef     : cmd.cmdID,
                               targetRef  : cmd.target,
                               sourceRef  : cmd.source,
                               statusOf   : cmd.name,
                               // todo: should this return DELETE_WITHOUT_ARCHIVE instead of OK?...
                               // statusCode = constant.STATUS_DELETE_WITHOUT_ARCHIVE,
                               statusCode : status
                        })]);
                            }
                            );
                        });
                        });

                    },

                    //-------------------------------------------------------------------------
                    _reaction_map: function(session, command, cb) {
                        var peerStore = session.peer.getStore(command.source);
                        if ( command.target != peerStore._getBinding().uri )
                            return cb(new common.NoSuchRoute(
                                        'unexpected "Map" event for unbound stores (local: "'
                                            + command.target + ', remote: "' + command.source + '")'));
                        common.cascade(command.items, function(item, cb) {
                            // todo: support hierarchical sync...
                            peerStore._setMapping(item.target, item.source, cb);
                        }, function(err) {
                            if ( err )
                            return cb(err);
                        return cb(null, [state.makeCommand({
                            name       : constant.CMD_STATUS,
                               cmdID      : session.nextCmdID(),
                               msgRef     : command.msgID,
                               cmdRef     : command.cmdID,
                               targetRef  : command.target,
                               sourceRef  : command.source,
                               statusOf   : command.name,
                               statusCode : constant.STATUS_OK
                        })]);
                        });
                    },

                    //-------------------------------------------------------------------------
                    // SYNCHRONIZATION PHASE: SETTLE
                    //-------------------------------------------------------------------------

                    //-------------------------------------------------------------------------
                    settle: function(session, cmd, chkcmd, xnode, cb) {

                        // TODO: remove the "xnode" parameter... it is a hack so that i can
                        //       call badStatus() the same way as in protocol.js
                        // todo: there is a bit of a disconnect between how action and reaction
                        //       phases are called (for a list of commands), whereas the settle
                        //       phase is called on a per-item basis... not ideal, but the protocol
                        //       is really set up that way :(
                        // TODO: check all valid values of ``data``...
                        // todo: anything else in common?...
                        // todo: trap errors...

                        var func = this['_settle_' + cmd.name.toLowerCase()];
                        if ( ! func )
                            return cb(new common.ProtocolError('unexpected settle command "' + cmd.name + '"'));
                        return func.call(this, session, cmd, chkcmd, xnode, cb);
                    },

                    //-------------------------------------------------------------------------
                    _settle_add: function(session, cmd, chkcmd, xnode, cb) {
                        switch ( cmd.data )
                        {
                            default:
                                {
                                    return cb(badStatus(xnode));
                                }
                            case constant.STATUS_OK:
                            case constant.STATUS_ITEM_ADDED:
                            case constant.STATUS_CONFLICT_RESOLVED_DUPLICATE:
                                {
                                    session.info.dsstates[chkcmd.uri].stats.peerAdd += 1;
                                    break;
                                }
                            case constant.STATUS_ALREADY_EXISTS:
                            case constant.STATUS_CONFLICT_RESOLVED_MERGE:
                                // todo: should this conflict-resolved-merge status be stored so
                                //       that only this item can have a non-"ADD" during initial
                                //       sync?...
                            case constant.STATUS_CONFLICT_RESOLVED_CLIENT_DATA:
                                {
                                    session.info.dsstates[chkcmd.uri].stats.merged += 1;
                                    break;
                                }
                        }

                        var peerStore = session.peer.getStore(
                                session.context.router.getTargetUri(
                                    session.adapter, session.peer, chkcmd.uri));

                        peerStore._delChange({
                            itemID: chkcmd.source,
                            state: constant.ITEM_ADDED
                        }, cb);
                    },

                    //-------------------------------------------------------------------------
                    _settle_replace: function(session, cmd, chkcmd, xnode, cb) {

                        var self = this;
                        var dsstate = session.info.dsstates[chkcmd.uri];

                        if ( ! session.isServer && cmd.data == constant.STATUS_UPDATE_CONFLICT )
                        {
                            dsstate.stats.hereErr   += 1;
                            dsstate.stats.conflicts += 1;
                            return cb();
                        }
                        if ( cmd.data != constant.STATUS_OK
                                && cmd.data != constant.STATUS_CONFLICT_RESOLVED_MERGE
                                && cmd.data != constant.STATUS_CONFLICT_RESOLVED_CLIENT_DATA
                                && cmd.data != constant.STATUS_CONFLICT_RESOLVED_SERVER_DATA )
                            return cb(badStatus(xnode));
                        if ( cmd.data == constant.STATUS_CONFLICT_RESOLVED_MERGE
                                || cmd.data == constant.STATUS_CONFLICT_RESOLVED_CLIENT_DATA
                                || cmd.data == constant.STATUS_CONFLICT_RESOLVED_SERVER_DATA )
                            dsstate.stats.merged += 1;
                        if ( cmd.data != constant.STATUS_CONFLICT_RESOLVED_SERVER_DATA )
                            dsstate.stats.peerMod += 1;

                        var peerStore = session.peer.getStore(
                                session.context.router.getTargetUri(
                                    session.adapter, session.peer, chkcmd.uri));

                        var get_item_id = ( ! session.isServer ) ? function(cb) {
                            return cb(null, chkcmd.source);
                        } : function(cb) {
                            // if not isinstance(locItemID, basestring):
                            //   return locItemID

                            self.getSourceMapping(
                                    session, constant.CMD_STATUS, cmd, peerStore, chkcmd.target,
                                    function(err, guid) { return cb(err, guid); }
                                    );
                        };

                        get_item_id(function(err, locItemID) {

                            if ( err )
                            return cb(err);

                        // todo: this is *technically* subject to a race condition... but the
                        //       same peer should really not be synchronizing at the same time...
                        // todo: also potentially check Change.registered...
                        // TODO: this could be solved by:
                        //         a) never updating a Change record (only deleting and replacing)
                        //         b) deleting Change records by ID instead of by store/item/state...

                        peerStore._delChange({
                            itemID    : locItemID,
                            state     : constant.ITEM_MODIFIED,
                        }, cb);

                        });

                    },

                    //-------------------------------------------------------------------------
                    _settle_delete: function(session, cmd, chkcmd, xnode, cb) {
                        var self    = this;
                        var dsstate = session.info.dsstates[chkcmd.uri];
                        if ( ! session.isServer && cmd.data == constant.STATUS_UPDATE_CONFLICT )
                        {
                            dsstate.stats.hereErr   += 1;
                            dsstate.stats.conflicts += 1;
                            return cb();
                        }
                        if ( ! session.isServer && cmd.data == constant.STATUS_CONFLICT_RESOLVED_MERGE )
                        {
                            dsstate.stats.hereDel   += 1;
                            dsstate.stats.peerDel   += 1;
                            dsstate.stats.merged    += 1;
                        }
                        else if ( ! session.isServer && cmd.data == constant.STATUS_CONFLICT_RESOLVED_CLIENT_DATA )
                        {
                            dsstate.stats.peerDel   += 1;
                            dsstate.stats.merged    += 1;
                        }
                        else if ( ! session.isServer && cmd.data == constant.STATUS_CONFLICT_RESOLVED_SERVER_DATA )
                            dsstate.stats.merged    += 1;
                        else if ( cmd.data == constant.STATUS_ITEM_NOT_DELETED )
                        {
                            // note: the reason that this *may* be ok is that some servers (funambol)
                            //       will report ITEM_NOT_DELETED when the item did not exist, thus this
                            //       is "alright"...
                            // todo: perhaps this should be raised as an error if the
                            //       remote peer != funambol?...
                        }
                        else if ( cmd.data == constant.STATUS_OK )
                            dsstate.stats.peerDel += 1;
                        else
                            return cb(badStatus(xnode));

                        var peerStore = session.peer.getStore(
                                session.context.router.getTargetUri(
                                    session.adapter, session.peer, chkcmd.uri));

                        // todo: handle hierarchical sync...
                        var get_locItemID = ( ! chkcmd.target ) ? function(cb) {
                            cb(null, chkcmd.source);
                        } : function(cb) {
                            self.getSourceMapping(
                                    session, constant.CMD_STATUS, cmd, peerStore, chkcmd.target,
                                    function(err, guid) { return cb(err, guid); }
                                    );
                        };

                        // todo: this is *technically* subject to a race condition... but the
                        //       same peer should really not be synchronizing at the same time...
                        // todo: also potentially check Change.registered...
                        // TODO: this could be solved by:
                        //         a) never updating a Change record (only deleting and replacing)
                        //         b) deleting Change records by ID instead of by store/item/state...

                        get_locItemID(function(err, locItemID) {
                            if ( err )
                            return cb(err);
                        peerStore._delChange({
                            itemID    : locItemID,
                            state     : constant.ITEM_DELETED,
                        }, cb);
                        });

                    }

    });

    return exports;

})();

module.exports = _self;
