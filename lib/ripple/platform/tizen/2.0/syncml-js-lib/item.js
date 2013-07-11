// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.item
// auth: griffin <griffin@uberdev.org>
// date: 2012/11/30
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common');

var _self = (function () {
    var exports = {};

    //---------------------------------------------------------------------------
    exports.Item = common.Base.extend({

        //: the unique identifier (within the context of a SyncML datastore)
        //: of the current SyncML item.
        id: null,

        compare: function(other) {
            return ( other === this ? 0 : 1 );
        }

    });

    return exports;

})();

module.exports = _self;
