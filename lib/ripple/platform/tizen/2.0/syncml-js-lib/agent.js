// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.agent
// auth: griffin <griffin@uberdev.org>
// date: 2012/10/22
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common');

var _self = (function () {

    var exports = {};

    //---------------------------------------------------------------------------
    exports.Agent = common.Base.extend({

        //-------------------------------------------------------------------------
        constructor: function(options) {
            options = _.defaults(options, {
                hierarchicalSync: false
            });
            this.hierarchicalSync = options.hierarchicalSync;
        },

        //-------------------------------------------------------------------------
        dumpItem: function(item, stream, contentType, version, cb) {
            return this.dumpsItem(
                item, contentType, version,
                function(err, data, new_contentType, new_version) {
                    if ( err ) {
                        return cb(err);
                    }
                    stream.write(data, function(err) {
                        if ( err ) {
                            return cb(err);
                        }
                        cb(null, new_contentType, new_version);
                    });
                });
        },

        //-------------------------------------------------------------------------
        loadItem: function(stream, contentType, version, cb) {
            var self = this;
            stream.read(function(err, data) {
                if ( err ) {
                    cb(err);
                }
                self.loadsItem(data, contentType, version, cb);
            });
        },

        //-------------------------------------------------------------------------
        deleteAllItems: function(cb) {
            var self = this;
            self.getAllItems(function(err, items) {
                if ( err ) {
                    return cb(err);
                }
                common.cascade(items, function(e, cb) {
                    self.deleteItem(e, cb);
                }, cb);
            });
        },

        // TODO: add documentation about all expected methods...

        getAllItems: function(cb) {
            // cb(null, LIST)
            return cb(new common.NotImplementedError());
        },

        dumpsItem: function(item, contentType, version, cb) {
            // cb(null, DATA [, NEW-CONTENTTYPE [, NEW-VERSION]])
            return cb(new common.NotImplementedError());
        },

        loadsItem: function(data, contentType, version, cb) {
            // cb(null, ITEM)
            return cb(new common.NotImplementedError());
        },

        addItem: function(item, cb) {
            // cb(null, ITEM)
            return cb(new common.NotImplementedError());
        },

        getItem: function(itemID, cb) {
            // cb(null, ITEM)
            return cb(new common.NotImplementedError());
        },

        replaceItem: function(item, reportChanges, cb) {
            // cb(null [, CSPEC])
            return cb(new common.NotImplementedError());
        },

        deleteItem: function(itemID, cb) {
            // cb(null)
            return cb(new common.NotImplementedError());
        },

        getContentTypes: function() {
            throw new common.NotImplementedError();
        },

        matchItem: function(item, cb) {
            this.getAllItems(function(err, list) {
                if ( err ) {
                    return cb(err);
                }
                var match = _.find(list, function(cur) {
                    return cur.compare && cur.compare(item) == 0;
                });
                return cb(null, match);
            });
        }

    // TODO: mergeItems()

    });

    return exports;

})();

module.exports = _self;
