// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.useragent
// auth: griffin <griffin@uberdev.org>
// date: 2013/06/07
// copy: (C) CopyLoose 2013 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    constant = require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
    _self;

_self = (function () {
    var exports = {};

    //---------------------------------------------------------------------------
    exports.UserAgent = common.Base.extend({
        // primary handlers:
        acceptSyncModeSwitch:  null, // function(EVENT, CALLBACK(ERR))
            acceptDevInfoSwap:     null, // function(EVENT, CALLBACK(ERR))
            chooseRefreshRequired: null, // function(EVENT, CALLBACK(ERR, TYPE))
            fetchCredentials:      null, // function(EVENT, CALLBACK(ERR, AUTH))
            // fallback handlers:
            accept:                null, // function(TYPE, EVENT, CALLBACK(ERR))
            choose:                null, // function(TYPE, EVENT, CALLBACK(ERR, CHOICE))
            fetch:                 null, // function(TYPE, EVENT, CALLBACK(ERR, STRUCT))
            // catchall handler:
            handle:                null  // function(ACTION, TYPE, EVENT, CALLBACK(ERR, RESULT...))
    });

    //---------------------------------------------------------------------------
    exports.UserAgentMultiplexer = common.Base.extend({

        //-------------------------------------------------------------------------
        constructor: function(uaList) {
            this.ualist = uaList;
        },

        //-------------------------------------------------------------------------
        _getHandler: function(name) {
            for ( var idx=0 ; idx<this.ualist.length ; idx++ )
    {
        var ua = this.ualist[idx];
        if ( ua && _.isFunction(ua[name]) )
        return ua[name];
    }
    return null;
        },

        //-------------------------------------------------------------------------
        hasHandler: function(name) {
            return !! this._getHandler(name);
        },

        //-------------------------------------------------------------------------
        acceptSyncModeSwitch: function(event, cb) {
            return this._handle({
                handler: 'acceptSyncModeSwitch',
            action:  'accept',
            type:    'sync.mode.switch'
            }, event, cb);
        },

        //-------------------------------------------------------------------------
        acceptDevInfoSwap: function(event, cb) {
            return this._handle({
                handler: 'acceptDevInfoSwap',
            action:  'accept',
            type:    'dev.info.swap'
            }, event, cb);
        },

        //-------------------------------------------------------------------------
        chooseRefreshRequired: function(event, cb) {
            return this._handle({
                handler: 'chooseRefreshRequired',
            action:  'choose',
            type:    'refresh.required',
            choices: [
            {value: constant.SYNCTYPE_SLOW_SYNC, default: true},
            {value: constant.SYNCTYPE_REFRESH_FROM_CLIENT},
            {value: constant.SYNCTYPE_REFRESH_FROM_SERVER}
            ]
            }, event, function(err, choice) {
                if ( err )
                return cb(err);
            // todo: catch the condition where `choice` is not a valid synctype
            return cb(err, common.synctype2alert(choice));
            });
        },

        //-------------------------------------------------------------------------
        fetchCredentials: function(event, cb) {
            return this._handle({
                handler: 'fetchCredentials',
            action:  'fetch',
            type:    'auth.challenge',
            choices: [
            {value: constant.SYNCTYPE_SLOW_SYNC, default: true},
            {value: constant.SYNCTYPE_REFRESH_FROM_CLIENT},
            {value: constant.SYNCTYPE_REFRESH_FROM_SERVER}
            ]
            }, event, cb);
        },

        //-------------------------------------------------------------------------
        _handle: function(spec, event, cb) {
            event = _.extend({}, spec, event, {
                type         : spec.type,
            context      : event.session.context,
            adapter      : event.session.adapter,
            peer         : event.session.peer,
            ua_handler   : spec.handler,
            ua_action    : spec.action
            });
            var handler = this._getHandler(spec.handler);
            if ( handler )
                return handler(event, cb);
            handler = this._getHandler(spec.action);
            if ( handler )
                return handler(spec.type, event, cb);
            handler = this._getHandler('handle');
            if ( handler )
                return handler(spec.action, spec.type, event, cb);
            if ( spec.action == 'accept' )
            {
                return cb();
            }
            if ( spec.action == 'choose'
                    && event.choices && event.choices.length > 0 )
            {
                var choice = _.find(event.choices, function(c) { return c.default; });
                if ( ! choice )
                    choice = event.choices[0];
                if ( choice.value )
                    choice = choice.value;
                return cb(null, choice);
            }
            if ( spec.type == 'auth.challenge' )
                return cb();
            return cb(new common.NotImplementedError(
                        'user-agent handler for event type "' + spec.type + '" (action: "'
                            + spec.action + '") not found or defined'));
        }

    });

    return exports;

})();

module.exports = _self;
