// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// auth: metagriffin <metagriffin@uberdev.org>
// date: 2012/10/27
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    constant = require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
    _self;

_self = (function () {
    var exports = {};

    //---------------------------------------------------------------------------
    exports.makeCommand = function(options) {
        return _.defaults({}, options, {
            // ?
        });
    };

    //---------------------------------------------------------------------------
    exports.makeStats = function(options) {
        return _.defaults({}, options, {
            mode      : null,
               hereAdd   : 0,
               hereMod   : 0,
               hereDel   : 0,
               hereErr   : 0,
               peerAdd   : 0,
               peerMod   : 0,
               peerDel   : 0,
               peerErr   : 0,
               conflicts : 0,
               merged    : 0,
        });
    };

    //---------------------------------------------------------------------------
    exports.makeSessionInfo = function(options) {
        return _.defaults({}, options, {
            id           : null,
               msgID        : null,
               cmdID        : 0,
               dsstates     : {},
               lastCommands : [],
               stats        : exports.makeStats()
        });
    };

    //---------------------------------------------------------------------------
    exports.makeStoreSyncState = function(options) {
        return _.defaults({}, options, {
            uri        : null,
               peerUri    : null,
               lastAnchor : null,
               nextAnchor : '' + common.ts(),
               mode       : constant.ALERT_TWO_WAY,
               action     : null,
               stats      : exports.makeStats()
        });
    };

    //---------------------------------------------------------------------------
    exports.makeSession = function(options) {
        return new (function() {
            this.context   = options.context || null;
            this.ua        = options.ua      || null;
            this.txn       = options.txn     || options.context.txn;
            this.adapter   = options.adapter || null;
            this.peer      = options.peer    || null;
            this.info      = options.info    || null;
            this.discover  = options.discover ? true : false;
            this.isServer  = options.isServer ? true : false;
            this.nextCmdID = function() {
                this.info.cmdID += 1;
                return this.info.cmdID;
            };
        })();

        // return _.defaults({}, options, {
        //   context : null,
        //   adapter : null,
        //   peer    : null,
        //   info    : null
        // });
    };

    var smult = function(s, count) {
        var ret = '';
        for ( var idx=0 ; idx<count ; idx++ )
            ret += s;
        return ret;
    };

    var num2str = function(num) {
        // TODO: i18n...
        // TODO: this is *UGLY*
        // TODO: OMG, i'm *so* embarrassed
        // TODO: but it works... sort of.
        if ( num == 0 )
            return '-';
        var ret = '';
        num = '' + num;
        for ( var idx=num.length ; idx>0 ; idx-=3 )
        {
            if ( ret.length > 0 )
                ret = ',' + ret;
            ret = num.charAt(idx - 1) + ret;
            if ( idx - 1 > 0 )
                ret = num.charAt(idx - 2) + ret;
            if ( idx - 2 > 0 )
                ret = num.charAt(idx - 3) + ret;
        }
        return ret;
    };

    var center = function(s, wid, pad) {
        // todo: is there no way to get sprintf to do this for me???...
        pad = pad || ' ';
        if ( wid <= s.length )
            return s;
        var diff = wid - s.length;
        return smult(pad, Math.floor(diff / 2)) + s + smult(pad, Math.ceil(diff / 2));
    };

    var right = function(s, wid, pad) {
        // todo: is there no way to get sprintf to do this for me???...
        pad = pad || ' ';
        if ( wid <= s.length )
            return s;
        return smult(pad, wid - s.length) + s;
    };

    //---------------------------------------------------------------------------
    // TODO: this should probably be put into another package...
    exports.describeStats = function(stats, stream, options) {

        // ASCII OBJECTIVE:
        // +----------------------------------------------------------------------------------+
        // |                                      TITLE                                       |
        // +----------+------+-------------------------+--------------------------+-----------+
        // |          |      |          Local          |          Remote          | Conflicts |
        // |   Source | Mode |  Add  | Mod | Del | Err |   Add  | Mod | Del | Err | Col | Mrg |
        // +----------+------+-------+-----+-----+-----+--------+-----+-----+-----+-----+-----+
        // | contacts |  <=  |   -   |  -  |  -  |  -  | 10,387 |  -  |  -  |  -  |  -  |  -  |
        // |     note |  SS  | 1,308 |  -  |   2 |  -  |    -   |  -  |  -  |  -  |  -  |  -  |
        // +----------+------+-------+-----+-----+-----+--------+-----+-----+-----+-----+-----+
        // |                  1,310 local changes and 10,387 remote changes.                  |
        // +----------------------------------------------------------------------------------+

        // UNICODE OBJECTIVE:
        // ┌──────────────────────────────────────────────────────────────────────────────────┐
        // │                                      TITLE                                       │
        // ├──────────┬──────┬─────────────────────────┬──────────────────────────┬───────────┤
        // │          │      │          Local          │          Remote          │ Conflicts │
        // │   Source │ Mode │  Add    Mod   Del   Err │   Add    Mod   Del   Err │ Col   Mrg │
        // ├──────────┼──────┼───────┼─────┼─────┼─────┼────────┼─────┼─────┼─────┼─────┼─────┤
        // │ contacts │  <=  │       │     │     │     │ 10,387 │     │     │     │     │     │
        // │     note │  SS  │ 1,308 │     │   2 │     │        │     │     │     │     │     │
        // ├──────────┴──────┴───────┴─────┴─────┴─────┴────────┴─────┴─────┴─────┴─────┴─────┤
        // │                  1,310 local changes and 10,387 remote changes.                  │
        // └──────────────────────────────────────────────────────────────────────────────────┘

        // todo: perhaps the fancy version should have color-coding as well?...

        options = _.defaults({}, options, {
            title      : null,
                details    : true,
                totals     : true,
                ascii      : false,
                gettext    : function(text) { return text; }
        });

        var modeStringLut = _.object([
                [constant.SYNCTYPE_TWO_WAY             , '<>'],
                [constant.SYNCTYPE_SLOW_SYNC           , 'SS'],
                [constant.SYNCTYPE_ONE_WAY_FROM_CLIENT , '->'],
                [constant.SYNCTYPE_REFRESH_FROM_CLIENT , '=>'],
                [constant.SYNCTYPE_ONE_WAY_FROM_SERVER , '<-'],
                [constant.SYNCTYPE_REFRESH_FROM_SERVER , '<=']
                ]);

        if ( options.ascii )
        {

            // unicode graphing characters: ('\xe2\x94\x80' - '\xe2\x94\xc0')
            // mapping table unicode ==> ascii

            glyphs = {
                '─': '-',
                '━': '-',
                '│': '|',
                '┃': '|',
                '┄': '-',
                '┅': '-',
                '┆': '|',
                '┇': '|',
                '┈': '-',
                '┉': '-',
                '┊': '|',
                '┋': '|',
                '┌': '+',
                '┍': '+',
                '┎': '+',
                '┏': '+',
                '┐': '+',
                '┑': '+',
                '┒': '+',
                '┓': '+',
                '└': '+',
                '┕': '+',
                '┖': '+',
                '┗': '+',
                '┘': '+',
                '┙': '+',
                '┚': '+',
                '┛': '+',
                '├': '+',
                '┝': '+',
                '┞': '+',
                '┟': '+',
                '┠': '+',
                '┡': '+',
                '┢': '+',
                '┣': '+',
                '┤': '+',
                '┥': '+',
                '┦': '+',
                '┧': '+',
                '┨': '+',
                '┩': '+',
                '┪': '+',
                '┫': '+',
                '┬': '+',
                '┭': '+',
                '┮': '+',
                '┯': '+',
                '┰': '+',
                '┱': '+',
                '┲': '+',
                '┳': '+',
                '┴': '+',
                '┵': '+',
                '┶': '+',
                '┷': '+',
                '┸': '+',
                '┹': '+',
                '┺': '+',
                '┻': '+',
                '┼': '+',
                '┽': '+',
                '┾': '+',
                '┿': '+',
            };

            var UnicodeToAsciiStream = common.Stream.extend({
                constructor: function(stream) {
                    this.stream = stream;
                },
                write: function(data) {
                    if ( data == undefined )
                return;
            var ascii = '';
            for ( var idx=0 ; idx<data.length ; idx++ )
            {
                var el = data[idx];
                if ( glyphs[el] != undefined )
                ascii += glyphs[el];
                else
                ascii += el;
            }
            this.stream.write(ascii);
                }
            });

            stream = new UnicodeToAsciiStream(stream);

        }

        // todo: this does not handle the case where the title is wider than the table.

        var wSrc  = options.gettext('Source').length;
        var wMode = options.gettext('Mode').length;
        var wCon  = options.gettext('Conflicts').length;
        var wCol  = options.gettext('Col').length;
        var wMrg  = options.gettext('Mrg').length;
        var wHereAdd = wPeerAdd = options.gettext('Add').length;
        var wHereMod = wPeerMod = options.gettext('Mod').length;
        var wHereDel = wPeerDel = options.gettext('Del').length;
        var wHereErr = wPeerErr = options.gettext('Err').length

            var totLoc = 0;
        var totRem = 0;
        var totErr = 0;
        var totCol = 0;
        var totMrg = 0;

        _.each(stats, function(value, key) {
            wSrc  = Math.max(wSrc, key.length);
            wMode = Math.max(wMode, modeStringLut[value.mode].length);
            wCol  = Math.max(wCol, num2str(value.conflicts).length);
            wMrg  = Math.max(wMrg, num2str(value.merged).length);
            wHereAdd = Math.max(wHereAdd, num2str(value.hereAdd).length);
            wPeerAdd = Math.max(wPeerAdd, num2str(value.peerAdd).length);
            wHereMod = Math.max(wHereMod, num2str(value.hereMod).length);
            wPeerMod = Math.max(wPeerMod, num2str(value.peerMod).length);
            wHereDel = Math.max(wHereDel, num2str(value.hereDel).length);
            wPeerDel = Math.max(wPeerDel, num2str(value.peerDel).length);
            wHereErr = Math.max(wHereErr, num2str(value.hereErr).length);
            wPeerErr = Math.max(wPeerErr, num2str(value.peerErr).length);
            totLoc += value.hereAdd + value.hereMod + value.hereDel;
            totRem += value.peerAdd + value.peerMod + value.peerDel;
            totErr += value.hereErr + value.peerErr;
            totCol += value.conflicts;
            totMrg += value.merged;
        });

        // TODO: i'm 100% sure there is a python library that can do this for me...

        if ( wCon > wCol + 3 + wMrg )
        {
            diff = wCon - ( wCol + 3 + wMrg );
            wCol += diff / 2;
            wMrg = wCon - 3 - wCol;
        }
        else
            wCon = wCol + 3 + wMrg;

        if ( options.details )
            tWid = ( wSrc + 3 + wMode + 3
                    + wHereAdd + wHereMod + wHereDel + wHereErr + 9 + 3
                    + wPeerAdd + wPeerMod + wPeerDel + wPeerErr + 9 + 3
                    + wCon );
        else
            tWid = options.title ? options.title.length : 0;

        if ( options.totals )
        {
            // TODO: oh dear. from an i18n POV, this is *horrible*!...
            sumlist = [];
            // for val, singular, plural in [
            _.each([
                    [totLoc, options.gettext('local change'), options.gettext('local changes')],
                    [totRem, options.gettext('remote change'), options.gettext('remote changes')],
                    [totErr, options.gettext('error'), options.gettext('errors')]
                    ], function(set) {
                        if ( set[0] <= 0 )
                return;
            sumlist.push(num2str(set[0]) + ' ' + ( set[0] == 1 ? set[1] : set[2] ));
                    });
            if ( sumlist.length <= 0 )
                sumlist = options.gettext('No changes');
            else if ( sumlist.length == 1 )
                sumlist = sumlist[0];
            else
                sumlist = ( sumlist.slice(0, -1).join(', ') + ' '
                        + options.gettext('and') + ' ' + sumlist[sumlist.length - 1] );
            if ( totMrg > 0 || totCol > 0 )
            {
                sumlist += ': ';
                if ( totMrg == 1 )
                    sumlist += num2str(totMrg) + ' ' + options.gettext('merge');
                else if ( totMrg > 1 )
                    sumlist += num2str(totMrg) + ' ' + options.gettext('merges');
                if ( totMrg > 0 && totCol > 0 )
                    sumlist += ' ' + options.gettext('and') + ' ';
                if ( totCol == 1 )
                    sumlist += num2str(totCol) + ' ' + options.gettext('conflict');
                else if ( totCol > 1 )
                    sumlist += num2str(totCol) + ' ' + options.gettext('conflicts');
            }
            sumlist += '.';
            if ( sumlist.length > tWid )
            {
                wSrc += sumlist.length - tWid;
                tWid = sumlist.length;
            }
        }

        if ( options.title )
        {
            stream.write('┏━' + smult('━', tWid) + '━┓\n');
            stream.write('┃ ' + center(options.title, tWid) + ' ┃\n');
        }

        if ( options.details )
        {
            if ( options.title )
                stream.write('┡━'
                        + smult('━', wSrc)
                        + '━┯━'
                        + smult('━', wMode)
                        + '━┯━'
                        + smult('━', ( wHereAdd + wHereMod + wHereDel + wHereErr + 9 ))
                        + '━┯━'
                        + smult('━', ( wPeerAdd + wPeerMod + wPeerDel + wPeerErr + 9 ))
                        + '━┯━'
                        + smult('━', wCon)
                        + '━┩\n'
                        );
            else
                stream.write('┌─'
                        + smult('─', wSrc)
                        + '─┬─'
                        + smult('─', wMode)
                        + '─┬─'
                        + smult('─', ( wHereAdd + wHereMod + wHereDel + wHereErr + 9 ))
                        + '─┬─'
                        + smult('─', ( wPeerAdd + wPeerMod + wPeerDel + wPeerErr + 9 ))
                        + '─┬─'
                        + smult('─', wCon)
                        + '─┐\n'
                        );

            stream.write('│ ' + smult(' ', wSrc));
            stream.write(' │ ' + smult(' ', wMode));
            stream.write(' │ ' + center(options.gettext('Local'), wHereAdd + wHereMod + wHereDel + wHereErr + 9 ));
            stream.write(' │ ' + center(options.gettext('Remote'), wPeerAdd + wPeerMod + wPeerDel + wPeerErr + 9 ));
            stream.write(' │ ' + center(options.gettext('Conflicts'), wCon));
            stream.write(' │\n');

            stream.write('│ ' + right(options.gettext('Source'), wSrc));
            stream.write(' │ ' + center(options.gettext('Mode'), wMode));
            stream.write(' │ ' + center(options.gettext('Add'), wHereAdd));
            stream.write(( options.ascii ? ' │ ' : '   ' ) + center(options.gettext('Mod'), wHereMod));
            stream.write(( options.ascii ? ' │ ' : '   ' ) + center(options.gettext('Del'), wHereDel));
            stream.write(( options.ascii ? ' │ ' : '   ' ) + center(options.gettext('Err'), wHereErr));
            stream.write(' │ ' + center(options.gettext('Add'), wPeerAdd));
            stream.write(( options.ascii ? ' │ ' : '   ' ) + center(options.gettext('Mod'), wPeerMod));
            stream.write(( options.ascii ? ' │ ' : '   ' ) + center(options.gettext('Del'), wPeerDel));
            stream.write(( options.ascii ? ' │ ' : '   ' ) + center(options.gettext('Err'), wPeerErr));
            stream.write(' │ ' + center(options.gettext('Col'), wCol));
            stream.write(( options.ascii ? ' │ ' : '   ' ) + center(options.gettext('Mrg'), wMrg));
            stream.write(' │\n');

            stream.write('├─' + smult('─', wSrc)
                    + '─┼─' + smult('─', wMode)
                    + '─┼─' + smult('─', wHereAdd)
                    + '─┼─' + smult('─', wHereMod)
                    + '─┼─' + smult('─', wHereDel)
                    + '─┼─' + smult('─', wHereErr)
                    + '─┼─' + smult('─', wPeerAdd)
                    + '─┼─' + smult('─', wPeerMod)
                    + '─┼─' + smult('─', wPeerDel)
                    + '─┼─' + smult('─', wPeerErr)
                    + '─┼─' + smult('─', wCol)
                    + '─┼─' + smult('─', wMrg)
                    + '─┤\n'
                    );

            var numcol = function(val, wid) {
                if ( val == 0 )
                    return ' │ ' + center(options.ascii ? '-' : ' ', wid);
                return ' │ ' + right(num2str(val), wid);
            };

            var keys = _.keys(stats);
            // todo: sort case insensitively...
            keys.sort();
            _.each(keys, function(key) {
                var stat = stats[key];
                stream.write('│ ' + right(key, wSrc));
                stream.write(' │ ' + center(modeStringLut[stat.mode], wMode));
                stream.write(numcol(stat.hereAdd, wHereAdd));
                stream.write(numcol(stat.hereMod, wHereMod));
                stream.write(numcol(stat.hereDel, wHereDel));
                stream.write(numcol(stat.hereErr, wHereErr));
                stream.write(numcol(stat.peerAdd, wPeerAdd));
                stream.write(numcol(stat.peerMod, wPeerMod));
                stream.write(numcol(stat.peerDel, wPeerDel));
                stream.write(numcol(stat.peerErr, wPeerErr));
                stream.write(numcol(stat.conflicts, wCol));
                stream.write(numcol(stat.merged, wMrg));
                stream.write(' │\n');
            });

            if ( options.totals )
                stream.write('├─');
            else
                stream.write('└─');

            stream.write(smult('─', wSrc)
                    + '─┴─' + smult('─', wMode)
                    + '─┴─' + smult('─', wHereAdd)
                    + '─┴─' + smult('─', wHereMod)
                    + '─┴─' + smult('─', wHereDel)
                    + '─┴─' + smult('─', wHereErr)
                    + '─┴─' + smult('─', wPeerAdd)
                    + '─┴─' + smult('─', wPeerMod)
                    + '─┴─' + smult('─', wPeerDel)
                    + '─┴─' + smult('─', wPeerErr)
                    + '─┴─' + smult('─', wCol)
                    + '─┴─' + smult('─', wMrg)
                    );

            if ( options.totals )
                stream.write('─┤\n');
            else
                stream.write('─┘\n');
        }

        // ─━│┃┄┅┆┇┈┉┊┋┼┽┾┿
        // ┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛
        // ├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫
        // ┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻

        if ( options.totals )
        {
            if ( !! options.title && ! options.details )
                stream.write('┌─' + smult('─', tWid) + '─┐\n');
            stream.write('│ ' + center(sumlist, tWid));
            stream.write(' │\n');
            stream.write('└─' + smult('─', tWid) + '─┘\n');
        }

        return;

    };

    return exports;

})();

module.exports = _self;
