// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.matcher
// auth: griffin <griffin@uberdev.org>
// date: 2012/12/05
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    _self;

_self = (function () {

    var exports = {};

    //---------------------------------------------------------------------------
    exports._cntpref = function(source, target) {
        return ( source.preferred ? 1 : 0 ) + ( target.preferred ? 1 : 0 );
    };

    //---------------------------------------------------------------------------
    exports._pickTransmitContentType = function(source, target, prefcnt, checkVersion) {
        for ( var sidx=0 ; sidx<source.length ; sidx++ )
{
    var sct = source[sidx];
    for ( var tidx=0 ; tidx<target.length ; tidx++ )
{
    var tct = target[tidx];
    if ( sct.ctype != tct.ctype )
    continue;
if ( ! checkVersion )
{
    if ( exports._cntpref(sct, tct) >= prefcnt )
        return [sct.ctype, sct.versions[sct.versions.length - 1]];
    continue;
}
for ( var svidx=sct.versions.length ; svidx>0 ; svidx-- )
{
    var sv = sct.versions[svidx - 1]
        for ( var tvidx=tct.versions.length ; tvidx>0 ; tvidx-- )
        {
            var tv = tct.versions[tvidx - 1]
                if ( sv != tv )
                    continue;
            if ( exports._cntpref(sct, tct) >= prefcnt )
                return [sct.ctype, sv];
        }
}
}
}
return null;
};

//---------------------------------------------------------------------------
exports.pickTransmitContentType = function(source, target) {

    // TODO: this is probably not the most efficient algorithm!...
    //       (but it works... ;-)

    // order of preference:
    //   - transmit => receive, BOTH preferred, VERSION match
    //   - transmit => receive, ONE preferred, VERSION match
    //   - transmit => receive, neither preferred, VERSION match
    //   - transmit => receive, BOTH preferred, no version match
    //   - transmit => receive, ONE preferred, no version match
    //   - transmit => receive, neither preferred, no version match
    //   - tx/rx => tx/rx, BOTH preferred, VERSION match
    //   - tx/rx => tx/rx, ONE preferred, VERSION match
    //   - tx/rx => tx/rx, neither preferred, VERSION match
    //   - tx/rx => tx/rx, BOTH preferred, no version match
    //   - tx/rx => tx/rx, ONE preferred, no version match
    //   - tx/rx => tx/rx, neither preferred, no version match

    // todo: make it explicit (or overrideable) that i am depending on the ordering
    //       of the versions supported to give an indicator of preference...

    var sct = source.getContentTypes();
    var tct = target.getContentTypes();

    var fct = function(cts, transmit) {
        return _.filter(cts, function(ct) {
            return transmit ? ct.transmit : ct.receive;
        });
    };

    return exports._pickTransmitContentType(fct(sct, true), fct(tct, false), 2, true)
        || exports._pickTransmitContentType(fct(sct, true), fct(tct, false), 1, true)
        || exports._pickTransmitContentType(fct(sct, true), fct(tct, false), 0, true)
        || exports._pickTransmitContentType(fct(sct, true), fct(tct, false), 2, false)
        || exports._pickTransmitContentType(fct(sct, true), fct(tct, false), 1, false)
        || exports._pickTransmitContentType(fct(sct, true), fct(tct, false), 0, false)
        || exports._pickTransmitContentType(sct, tct, 2, true)
        || exports._pickTransmitContentType(sct, tct, 1, true)
        || exports._pickTransmitContentType(sct, tct, 0, true)
        || exports._pickTransmitContentType(sct, tct, 2, false)
        || exports._pickTransmitContentType(sct, tct, 1, false)
        || exports._pickTransmitContentType(sct, tct, 0, false)
        || null;

};

// TODO: OH MY GOD.
//       this is insanely inefficient.
//       i'm embarrassed.
//       fortunately, it's hidden really low-level...
//       but now you know, doh! please don't blackmail me!... ;-)

// TODO: this currently requires that both tx and rx match in both
//       directions with the same velocity... it should prioritize
//       that, but then fallback to giving simplex matches priority.

//---------------------------------------------------------------------------
var has_ct = function(a, b, checkVersion, transmit, wildcard) {
    a = _.filter(a, function(e) { return transmit ? e.transmit : e.receive });
    b = _.filter(b, function(e) { return transmit ? e.transmit : e.receive });
    for ( var aidx=0 ; aidx<a.length ; aidx++ )
    {
        var ct_a = a[aidx];
        for ( var bidx=0 ; bidx<b.length ; bidx++ )
        {
            var ct_b = b[bidx];
            if ( ct_a.ctype != ct_b.ctype )
                continue;
            if ( ! checkVersion )
                return true;
            for ( var vaidx=0 ; vaidx<ct_a.versions.length ; vaidx++ )
            {
                var va = ct_a.versions[vaidx];
                for ( var vbidx=0 ; vbidx<ct_b.length ; vbidx++ )
                {
                    var vb = ct_b.versions[vbidx];
                    if ( va == vb )
                        return true;
                }
            }
        }
    } 
    return false;
};

//---------------------------------------------------------------------------
var has_ct_both = function(a, b, checkVersion, wildcard) {
    return has_ct(a, b, checkVersion, true, wildcard)
        && has_ct(a, b, checkVersion, false, wildcard);
};

//---------------------------------------------------------------------------
var cmpStore_ct_set_crit = function(base, ds1, ds2, checkVersion, wildcard) {
    var bds1 = has_ct_both(base, ds1, checkVersion, wildcard);
    var bds2 = has_ct_both(base, ds2, checkVersion, wildcard);
    if ( bds1 && bds2 )
        return 0;
    if ( bds1 )
        return -1;
    if ( bds2 )
        return 1;
    return 0;
};

//---------------------------------------------------------------------------
var cmpStore_ct_set = function(base, ds1, ds2) {
    var ret = cmpStore_ct_set_crit(base, ds1, ds2, true, false);
    if ( ret != 0 )
        return ret;
    ret = cmpStore_ct_set_crit(base, ds1, ds2, false, false);
    if ( ret != 0 )
        return ret;
    ret = cmpStore_ct_set_crit(base, ds1, ds2, true, true);
    if ( ret != 0 )
        return ret;
    ret = cmpStore_ct_set_crit(base, ds1, ds2, false, true);
    if ( ret != 0 )
        return ret;
    return 0;
};

//---------------------------------------------------------------------------
var getct = function(store) {
    return store.getContentTypes ? store.getContentTypes() : store.contentTypes;
};

//---------------------------------------------------------------------------
var cmpStore_ct_pref = function(base, ds1, ds2) {
    var basect = _.filter(getct(base), function(ct) { return ct.preferred; });
    var ds1ct  = _.filter(getct(ds1), function(ct) { return ct.preferred; });
    var ds2ct  = _.filter(getct(ds2), function(ct) { return ct.preferred; });
    return cmpStore_ct_set(basect, ds1ct, ds2ct);
};

//---------------------------------------------------------------------------
var cmpStore_ct_all = function(base, ds1, ds2) {
    return cmpStore_ct_set(getct(base), getct(ds1), getct(ds2));
};

//---------------------------------------------------------------------------
var cmpStore_ct = function(base, ds1, ds2) {
    var ret = cmpStore_ct_pref(base, ds1, ds2)
        if ( ret != 0 )
            return ret;
    return cmpStore_ct_all(base, ds1, ds2);
};

//---------------------------------------------------------------------------
var cmpStore_uri = function(base, ds1, ds2) {
    var ret = difflib.getCloseMatches(base.uri, [ds1.uri, ds2.uri], 1, 0.5);
    if ( ret.length <= 0 )
        return 0;
    if ( ret[0] == ds1.uri )
        return -1;
    return 1;
};

//---------------------------------------------------------------------------
exports.cmpStore = function(base, ds1, ds2) {
    var ret = cmpStore_ct(base, ds1, ds2);
    if ( ret != 0 )
        return ret;
    return cmpStore_uri(base, ds1, ds2);
};

return exports;

})();

module.exports = _self;

