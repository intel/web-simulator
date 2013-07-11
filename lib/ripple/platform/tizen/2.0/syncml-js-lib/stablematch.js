// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// desc: implements a solution to the stable matching problem using a
//       left-optimized algorithm. shamelessly adapted from:
//         https://github.com/paulgb/Python-Gale-Shapley/
// auth: metagriffin <mg.npmjs@uberdev.org>
// date: 2012/12/29
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var _self = (function () {

    var exports = {};

    // TODO: figure out how to pull this dynamically from package.json...
    exports.version = '0.0.4';

    //---------------------------------------------------------------------------
    exports.match = function(A, B, rankA, rankB) {
        if ( ! A || ! B || ! A.length || ! B.length ) {
            return [];
        }
        if ( A.length == B.length ) {
            return exports._match(A, B, rankA, rankB);
        }

        // TODO: this is a brute-force implementation of getting both
        //       lists to be of symmetric length... make this "better".
        //       for example, build this directly into _match() or use
        //       deterministic exclusion of the longer data set.

        var sA   = _.rest(A, 0);
        var sB   = _.rest(B, 0);
        var mlen = Math.max(sA, sB);
        while ( sA.length < mlen )
            sA.push(null);
        while ( sB.length < mlen )
            sB.push(null);
        var sRA  = function(a) {
            var ret = rankA(a);
            while ( ret.length < mlen )
                ret.push(null);
            return ret;
        };
        var sRB  = function(b) {
            var ret = rankB(b);
            while ( ret.length < mlen )
                ret.push(null);
            return ret;
        };
        var ret = exports._match(sA, sB, sRA, sRB);
        return _.filter(ret, function(pair) {
            return pair[0] != null && pair[1] != null;
        });
    };

    //---------------------------------------------------------------------------
    exports._match = function(A, B, rankA, rankB) {
        // this translates sets A and B to indeces, since _imatch can only work
        // with sets of elements that can be used as the key in a hash (in this
        // implementation).
        var iA  = _.range(A.length);
        var iB  = _.range(B.length);
        var iRA = function(ia) {
            var ret = rankA(A[ia]);
            return _.map(ret, function(item) {
                return _.indexOf(B, item);
            });
        };
        var iRB = function(ib) {
            var ret = rankB(B[ib]);
            return _.map(ret, function(item) {
                return _.indexOf(A, item);
            });
        };
        var ret = exports._imatch(iA, iB, iRA, iRB);
        return _.map(ret, function(item) {
            return [A[item[0]], B[item[1]]];
        });
    };

    //---------------------------------------------------------------------------
    exports._imatch = function(A, B, rankA, rankB) {
        // TODO: improve this... it was a brute-force porting of
        //         https://github.com/paulgb/Python-Gale-Shapley
        //       without any eye on optimal outcome or performance...
        //: `partners` is a paring hash of { a => [b, rank] }
        var partners = {};
        _.each(A, function(a) {
            partners[a] = [rankA(a)[0], 0];
        });
        //: `stable` indicates stability of the current pairing in `partners`
        var stable = false;
        while ( ! stable )
        {
            stable = true;
            _.each(B, function(b) {
                var paired = false;
                for ( var n=0 ; n<A.length ; n++ )
                {
                    var a = rankB(b)[n];
                    var pair = partners[a];
                    if ( pair[0] == b )
                    {
                        if ( paired )
                        {
                            stable = false;
                            partners[a] = [rankA(a)[pair[1] + 1], pair[1] + 1];
                        }
                        else
                            paired = true;
                    }
                }
            });
        }
        return _.map(_.keys(partners), function(a) {
            return [a, partners[a][0]];
        });
    };

    return exports;
})();

module.exports = _self;
