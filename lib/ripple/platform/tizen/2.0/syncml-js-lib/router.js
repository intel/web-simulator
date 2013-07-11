// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.router
// auth: griffin <griffin@uberdev.org>
// date: 2012/11/04
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    constant = require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
    ctype = require('ripple/platform/tizen/2.0/syncml-js-lib/ctype'),
    matcher = require('ripple/platform/tizen/2.0/syncml-js-lib/matcher'),
    stablematch = require('ripple/platform/tizen/2.0/syncml-js-lib/stablematch'),
    _self;

_self = (function () {

    var exports = {};

    //---------------------------------------------------------------------------
    exports.Router = common.Base.extend({

        //-------------------------------------------------------------------------
        constructor: function(options) {
        },

        //-------------------------------------------------------------------------
        getTargetUri: function(adapter, peer, sourceUri) {
            var pmodel = peer._getModel();
            for ( var idx=0 ; idx<pmodel.routes.length ; idx++ )
    {
        var route = pmodel.routes[idx];
        if ( route.localUri == sourceUri )
        return route.remoteUri;
    }
    for ( var idx=0 ; idx<pmodel.stores.length ; idx++ )
    {
        var store = pmodel.stores[idx];
        if ( store.binding && store.binding.uri == sourceUri )
        return store.uri;
    }
    return null;
        },

        //-------------------------------------------------------------------------
        recalculate: function(adapter, peer, cb) {
            // the non-"SmartRouter" only connects manually-configured routes...
            var routes = _.filter(peer._getModel().routes,
                    function(r) { return ! r.autoMapped; });
            return this._setupRoutes(adapter, peer, routes, cb);
        },

        //-------------------------------------------------------------------------
        _setupRoutes: function(adapter, peer, routes, cb) {
            // available local URIs
            var lset = _.map(adapter._getModel().stores,
                    function(s) { return adapter.normUri(s.uri); });
            // available remote URIs
            var rset = _.map(peer._getModel().stores,
                    function(s) { return peer.normUri(s.uri); });

            // break all routes not listed
            var ruris = _.map(routes, function(r) { return r.remoteUri; });
            var xrset = _.filter(rset, function(uri) {
                return _.indexOf(ruris, uri) < 0;
            });
            _.each(xrset, function(uri) {
                var smodel = peer.getStore(uri)._getModel();
                if ( ! smodel.binding )
                return;
            smodel.binding = null;
            });

            var err = null;
            _.each(routes, function(route) {
                if ( err )
                return;

            route.localUri  = adapter.normUri(route.localUri);
            route.remoteUri = peer.normUri(route.remoteUri);
            if ( _.indexOf(rset, route.remoteUri) < 0
                || _.indexOf(lset, route.localUri) < 0 )
            {
                err = 'unable to route from "' + route.localUri
                + '" (here) to "' + route.remoteUri
                + '" (peer): no such stores or already routed elsewhere';
            return;
            }

            lset = _.filter(lset, function(uri) { return uri != route.localUri; });
            rset = _.filter(rset, function(uri) { return uri != route.remoteUri; });


            var smodel = peer.getStore(route.remoteUri)._getModel();
            if ( smodel.binding && smodel.binding.uri == route.localUri )
                return;
            smodel.binding = {
                uri          : route.localUri,
                autoMapped   : route.autoMapped,
                localAnchor  : null,
                remoteAnchor : null
            };
            });

            if ( err )
                return cb(err);

            return cb();
        },

        //-------------------------------------------------------------------------
        getBestTransmitContentType: function(adapter, peer, uri) {
            var lstore = adapter.getStore(uri);
            var rstore = peer.getStore(this.getTargetUri(adapter, peer, uri));
            return matcher.pickTransmitContentType(lstore, rstore);
        },

    });

    //---------------------------------------------------------------------------
    exports.SmartRouter = exports.Router.extend({

        //-------------------------------------------------------------------------
        recalculate: function(adapter, peer, cb) {

            // note: if you don't want smart routing, assign the non-SmartRouter
            //       router (i.e. syncml-js.Router) to the loaded context

            // available local URIs
            var llut = _.object(
                _.map(adapter._getModel().stores,
                    function(s) { return [adapter.normUri(s.uri), s]; }));
            var lset = _.keys(llut);

            // available remote URIs
            var rlut = _.object(
                _.map(peer._getModel().stores,
                    function(s) { return [adapter.normUri(s.uri), s]; }));
            var rset = _.keys(rlut);

            // TODO: i am directly touching the model here.
            //       total i-rep violation.
            //       i'm embarrassed.
            //       fortunately, it's just between syncml-js classes...
            //       but now you know, doh! please don't blackmail me!... ;-)

            // manual routes
            var pmodel = peer._getModel();
            pmodel.routes = _.filter(pmodel.routes,
                    function(r) { return ! r.autoMapped; });

            // remove manual routes from available routes
            var uris = _.map(pmodel.routes, function(r) { return r.localUri; });
            lset = _.filter(lset, function(uri) {
                return _.indexOf(uris, uri) < 0;
            });
            uris = _.map(pmodel.routes, function(r) { return r.remoteUri; });
            rset = _.filter(rset, function(uri) {
                return _.indexOf(uris, uri) < 0;
            });

            // match remaining stores
            var rankL = function(luri) {
                var ret = _.rest(rset, 0);
                ret.sort(function(a, b) {
                    return matcher.cmpStore(llut[luri], rlut[a], rlut[b]);
                });
                return ret;
            };
            var rankR = function(ruri) {
                var ret = _.rest(lset, 0);
                ret.sort(function(a, b) {
                    return matcher.cmpStore(rlut[ruri], llut[a], llut[b]);
                });
                return ret;
            };
            var matches = stablematch.match(lset, rset, rankL, rankR);

            // add them to the routes (as auto-routed)
            for ( var idx=0 ; idx<matches.length ; idx++ )
            {
                var pair = matches[idx];
                pmodel.routes.push({
                    localUri   : pair[0],
                    remoteUri  : pair[1],
                    autoMapped : true
                });
            }

            return this._setupRoutes(adapter, peer, pmodel.routes, cb);
        },

    });

    return exports;

})();

module.exports = _self;
