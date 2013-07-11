// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// auth: metagriffin <metagriffin@uberdev.org>
// date: 2012/10/13
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------
var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    ET = require('ripple/platform/tizen/2.0/syncml-js-lib/elementtree'),
    _self;

_self = (function () {

    var exports = {};

    //---------------------------------------------------------------------------
    exports.ContentTypeInfo = common.Base.extend({

        //-------------------------------------------------------------------------
        constructor: function(ctype, versions, options) {
            this.ctype    = ctype;
            this.versions = _.isArray(versions) ? versions : [versions];
            _.defaults(this, options || {}, {
                preferred: false,
                transmit:  true,
                receive:   true,
            });
        },

        //-------------------------------------------------------------------------
        merge: function(other) {
            if ( this.ctype != other.ctype
                || ! _.isEqual(this.versions, other.versions)
                || this.preferred != other.preferred )
                return false;
            this.transmit = this.transmit || other.transmit;
            this.receive  = this.receive  || other.receive;
            return true
        },

        //-------------------------------------------------------------------------
        toStruct: function() {
            return {
                ctype: this.ctype,
                versions: this.versions,
                preferred: this.preferred,
                transmit:  this.transmit,
                receive:   this.receive
            };
        },

        //-------------------------------------------------------------------------
        toSyncML: function(nodeName, uniqueVerCt) {
            if ( _.isFunction(nodeName) )
            {
                cb = nodeName;
                nodeName = null;
            }
            else if ( _.isFunction(uniqueVerCt) )
            {
                cb = uniqueVerCt;
                uniqueVerCt = null;
            }
            if ( ! nodeName )
            {
                nodeName = this.transmit ? 'Tx' : 'Rx';
                if ( this.preferred )
                    nodeName += '-Pref';
            }
            if ( this.preferred )
                nodeName += '-Pref';

            if ( uniqueVerCt )
            {
                var ret = _.map(this.versions, function(v) {
                    var tmp = ET.Element(nodeName);
                    ET.SubElement(tmp, 'CTType').text = this.ctype;
                    ET.SubElement(tmp, 'VerCT').text = v;
                    return tmp;
                }, this);
                return ret;
            }
            var ret = ET.Element(nodeName);
            ET.SubElement(ret, 'CTType').text = this.ctype;
            _.each(this.versions, function(v) {
                ET.SubElement(ret, 'VerCT').text = v;
            });
            return ret;
        },

        describe: function(stream, cb) {
            stream.write(this.ctype);
            stream.write(this.versions.length == 1 ? ' version ' : ' versions ');
            stream.write(this.versions.join(', '));
            var flags = [];
            if ( this.preferred )
                flags.push('preferred');
            if ( this.transmit )
                flags.push('tx');
            if ( this.receive )
                flags.push('rx');
            if ( flags.length > 0 )
            {
                stream.write(' (');
                        stream.write(flags.join(', '));
                        stream.write(')');
                        }
                        stream.write('\n');
                        }

                        }, {

                            //-------------------------------------------------------------------------
                            fromStruct: function(struct) {
                                return new exports.ContentTypeInfo(struct.ctype, struct.versions, struct);
                            },

                    //-------------------------------------------------------------------------
                    fromSyncML: function(xnode) {
                        return new exports.ContentTypeInfo(
                            xnode.findtext('CTType'),
                            _.map(xnode.findall('VerCT'), function(e) { return e.text; }),
                            {
                                preferred: xnode.tag.match('-Pref$') != undefined,
                        transmit:  xnode.tag.indexOf('Tx') >= 0,
                        receive:   xnode.tag.indexOf('Rx') >= 0
                            }
                            );
                    }

                        });

    return exports;

})();

module.exports = _self;
