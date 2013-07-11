// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// auth: metagriffin <metagriffin@uberdev.org>
// date: 2012/10/13
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var constant = require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
    _self;

_self = (function () {
    var exports = {};

    //---------------------------------------------------------------------------
    // object inheritance helper routines shamelessly scrubbed from backbone.js

    // The self-propagating extend function that Backbone classes use.
    var extend = exports.extend = function (protoProps, classProps) {
        var child = inherits(this, protoProps, classProps);
        child.extend = this.extend;
        return child;
    };

    // Shared empty constructor function to aid in prototype-chain creation.
    var ctor = function(){};

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    var inherits = function(parent, protoProps, staticProps) {
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ parent.apply(this, arguments); };
        }

        // Inherit class (static) properties from parent.
        _.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);

        // Add static properties to the constructor function, if supplied.
        if (staticProps) _.extend(child, staticProps);

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };

    //-----------------------------------------------------------------------------
    exports.Base = function() {};
    exports.Base.extend = extend;

    //-----------------------------------------------------------------------------
    var SyncmlError = exports.Base.extend({
        constructor: function(msg, exception, attrs) {
            this.message = this.name;
            if ( msg != undefined )
        this.message += ': ' + msg;
    this.exception = exception;
    if ( attrs )
        _.extend(this, attrs);
        },
        toString: function() {
            return this.message;
        }
    });

    //---------------------------------------------------------------------------
    exports.Stream = exports.Base.extend({

        writeln: function(data) {
            if ( data == undefined )
        return;
    return this.write(data + '\n');
        },

        indented: function(indent) {
            return new exports.IndentStream(this, indent || this._indent);
        }

    });

    _.extend(exports, {

        //---------------------------------------------------------------------------
        // exceptions
        SyncmlError:           SyncmlError.extend({name: 'SyncmlError'}),
        TypeError:             SyncmlError.extend({name: 'TypeError'}),
        NotImplementedError:   SyncmlError.extend({name: 'NotImplementedError'}),
        ProtocolError:         SyncmlError.extend({name: 'ProtocolError'}),
        InternalError:         SyncmlError.extend({name: 'InternalError'}),
        ConflictError:         SyncmlError.extend({name: 'ConflictError'}),
        FeatureNotSupported:   SyncmlError.extend({name: 'FeatureNotSupported'}),
        LogicalError:          SyncmlError.extend({name: 'LogicalError'}),
        CredentialsRequired:   SyncmlError.extend({name: 'CredentialsRequired'}),
        InvalidCredentials:    SyncmlError.extend({name: 'InvalidCredentials'}),
        InvalidContext:        SyncmlError.extend({name: 'InvalidContext'}),
        InvalidAdapter:        SyncmlError.extend({name: 'InvalidAdapter'}),
        InvalidStore:          SyncmlError.extend({name: 'InvalidStore'}),
        InvalidContentType:    SyncmlError.extend({name: 'InvalidContentType'}),
        InvalidAgent:          SyncmlError.extend({name: 'InvalidAgent'}),
        InvalidContent:        SyncmlError.extend({name: 'InvalidContent'}),
        InvalidItem:           SyncmlError.extend({name: 'InvalidItem'}),
        UnknownCodec:          SyncmlError.extend({name: 'UnknownCodec'}),
        NoSuchRoute:           SyncmlError.extend({name: 'NoSuchRoute'}),
        UnknownAuthType:       SyncmlError.extend({name: 'UnknownAuthType'}),
        UnknownFormatType:     SyncmlError.extend({name: 'UnknownFormatType'}),

        //---------------------------------------------------------------------------
        // UUID generation
        makeID: function() {
            // shamelessly scrubbed from:
            //   http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
            // (adjusted to remove the dashes)
            // todo: see some of those links on how to make this more "robust"...
            return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },

        //-------------------------------------------------------------------------
        synctype2alert: function(type) {
            return constant.SyncTypeToAlert[type];
        },

        //-------------------------------------------------------------------------
        alert2synctype: function(alert) {
            for ( var key in constant.SyncTypeToAlert )
            {
                if ( constant.SyncTypeToAlert[key] == alert )
                    return exports.int(key);
            }
            return null;
        },

        //-------------------------------------------------------------------------
        mode2string: function(code) {
            switch ( code )
            {
                case constant.ALERT_TWO_WAY:                       return 'two-way';
                case constant.ALERT_SLOW_SYNC:                     return 'slow-sync';
                case constant.ALERT_ONE_WAY_FROM_CLIENT:           return 'one-way-from-client';
                case constant.ALERT_REFRESH_FROM_CLIENT:           return 'refresh-from-client';
                case constant.ALERT_ONE_WAY_FROM_SERVER:           return 'one-way-from-server';
                case constant.ALERT_REFRESH_FROM_SERVER:           return 'refresh-from-server';
                case constant.ALERT_TWO_WAY_BY_SERVER:             return 'two-way-by-server';
                case constant.ALERT_ONE_WAY_FROM_CLIENT_BY_SERVER: return 'one-way-from-client-by-server';
                case constant.ALERT_REFRESH_FROM_CLIENT_BY_SERVER: return 'refresh-from-client-by-server';
                case constant.ALERT_ONE_WAY_FROM_SERVER_BY_SERVER: return 'one-way-from-server-by-server';
                case constant.ALERT_REFRESH_FROM_SERVER_BY_SERVER: return 'refresh-from-server-by-server';
                default: return 'UNKNOWN';
            }
        },

        //-------------------------------------------------------------------------
        state2string: function(state) {
            switch ( state )
            {
                case constant.ITEM_OK:           return 'ok';
                case constant.ITEM_ADDED:        return 'added';
                case constant.ITEM_MODIFIED:     return 'modified';
                case constant.ITEM_DELETED:      return 'deleted';
                case constant.ITEM_SOFTDELETED:  return 'soft-deleted';
                default: return 'UNKNOWN';
            }
        },

        //-------------------------------------------------------------------------
        oneWay: function(mode) {
            switch ( mode )
            {
                case constant.ALERT_TWO_WAY:
                case constant.ALERT_SLOW_SYNC:
                    return false;
                case constant.ALERT_ONE_WAY_FROM_CLIENT:
                case constant.ALERT_REFRESH_FROM_CLIENT:
                case constant.ALERT_ONE_WAY_FROM_SERVER:
                case constant.ALERT_REFRESH_FROM_SERVER:
                    return true;
                    // case constant.ALERT_TWO_WAY_BY_SERVER:
                    // case constant.ALERT_ONE_WAY_FROM_CLIENT_BY_SERVER:
                    // case constant.ALERT_REFRESH_FROM_CLIENT_BY_SERVER:
                    // case constant.ALERT_ONE_WAY_FROM_SERVER_BY_SERVER:
                    // case constant.ALERT_REFRESH_FROM_SERVER_BY_SERVER:
                default:
                    throw new exports.InternalError('invalid mode "' + mode + '"');
            }
        },

        //-------------------------------------------------------------------------
        oneWayIn: function(session, mode) {
            switch ( mode )
            {
                case constant.ALERT_TWO_WAY:
                case constant.ALERT_SLOW_SYNC:
                    return false;
                case constant.ALERT_ONE_WAY_FROM_CLIENT:
                case constant.ALERT_REFRESH_FROM_CLIENT:
                    return !! session.isServer;
                case constant.ALERT_ONE_WAY_FROM_SERVER:
                case constant.ALERT_REFRESH_FROM_SERVER:
                    return ! session.isServer;
                    // case constant.ALERT_TWO_WAY_BY_SERVER:
                    // case constant.ALERT_ONE_WAY_FROM_CLIENT_BY_SERVER:
                    // case constant.ALERT_REFRESH_FROM_CLIENT_BY_SERVER:
                    // case constant.ALERT_ONE_WAY_FROM_SERVER_BY_SERVER:
                    // case constant.ALERT_REFRESH_FROM_SERVER_BY_SERVER:
                default:
                    throw new exports.InternalError('invalid mode "' + mode + '"');
            }
        },

        //-------------------------------------------------------------------------
        oneWayOut: function(session, mode) {
            switch ( mode )
            {
                case constant.ALERT_TWO_WAY:
                case constant.ALERT_SLOW_SYNC:
                    return false;
                case constant.ALERT_ONE_WAY_FROM_CLIENT:
                case constant.ALERT_REFRESH_FROM_CLIENT:
                    return ! session.isServer;
                case constant.ALERT_ONE_WAY_FROM_SERVER:
                case constant.ALERT_REFRESH_FROM_SERVER:
                    return !! session.isServer;
                    // case constant.ALERT_TWO_WAY_BY_SERVER:
                    // case constant.ALERT_ONE_WAY_FROM_CLIENT_BY_SERVER:
                    // case constant.ALERT_REFRESH_FROM_CLIENT_BY_SERVER:
                    // case constant.ALERT_ONE_WAY_FROM_SERVER_BY_SERVER:
                    // case constant.ALERT_REFRESH_FROM_SERVER_BY_SERVER:
                default:
                    throw new exports.InternalError('invalid mode "' + mode + '"');
            }
        },

        //-------------------------------------------------------------------------
        cascade: function(list, iterator, cb) {
            if ( ! cb && iterator )
            {
                cb = iterator;
                iterator = null;
            }
            if ( ! list )
                return cb();
            var cur = 0;
            var next = function() {
                if ( cur >= list.length )
                    return cb();
                var curcb = function(err) {
                    if ( err )
                        return cb(err);
                    cur += 1;
                    var args = [];
                    for ( var idx=1 ; idx<arguments.length ; idx++ )
                        args.push(arguments[idx]);
                    return next.apply(null, args);
                };
                var func = iterator || list[cur];
                var args = [];
                if ( iterator )
                    args.push(list[cur]);
                for ( var idx=0 ; idx<arguments.length ; idx++ )
                    args.push(arguments[idx]);
                args.push(curcb);
                return func.apply(null, args);
            };
            return next();
        },

        //-------------------------------------------------------------------------
        ts: function() {
            return Math.floor((new Date()).getTime() / 1000);
        },

        //-------------------------------------------------------------------------
        j: function(obj) {
            return JSON.stringify(obj);
        },

        //-------------------------------------------------------------------------
        noop: function(cb) {
            return cb();
        },

        //-------------------------------------------------------------------------
        platformBits: function() {

            // TODO: implement this!...

            return 32;
        },

        //-------------------------------------------------------------------------
        getMaxMemorySize: function(context) {

            // Returns the maximum size of a memory object. By default this
            // is, set to ``sys.maxint``, however the `context` may override
            // this behavior.

            // NOTE: currently, this is being hardcoded to a maximum of 2GB for
            //       compatibility with funambol servers, which croak above that
            //       value.

            // TODO: allow the context to control this, or implement auto-detect to
            //       determine what the remote peer can support...

            return Math.min(Math.pow(2, exports.platformBits() - 1) - 1,
                    Math.pow(2, 31) - 1);
        },

        //-------------------------------------------------------------------------
        normpath: function(path) {
            if ( path == undefined )
                return null;
            if ( path.length <= 0 )
                return '';
            if ( path.indexOf('/') < 0 )
                path = path.replace('\\', '/');
            var ret = [];
            var plist = path.split('/');
            for ( var idx=0 ; idx<plist.length ; idx++ )
            {
                var item = plist[idx];
                if ( item.length <= 0 || item == '.' )
                    continue;
                if ( item != '..' || ret.length <= 0 || ret[ret.length - 1] == '..' )
                {
                    ret.push(item);
                    continue;
                }
                ret.pop();
            }
            ret = ret.join('/');
            if ( path.charAt(0) != '/' )
                return ret;
            return '/' + ret;
        },

        //-------------------------------------------------------------------------
        int: function(str, defval) {
            if ( ! str )
                return defval;
            return parseInt(str, 10);
        },

        //-------------------------------------------------------------------------
        cmp: function(a, b) {
            if ( a < b )
                return -1;
            if ( a > b )
                return 1;
            return 0;
        },

        //-------------------------------------------------------------------------
        // partially emulates python's string.split() method
        splitn: function(str, sep, limit) {
            var ret = str.split(sep);
            if ( ret.length <= ( limit + 1 ) )
                return ret;
            var tmp = ret.slice(0, limit);
            tmp.push(ret.slice(limit).join(sep));
            return tmp;
        },

        //-------------------------------------------------------------------------
        prettyJson: function(obj, indent) {
            indent = indent || '';
            var ret = '';
            if ( _.isArray(obj) )
            {
                if ( obj.length <= 0 )
                    return '[]';
                ret = '[\n' + indent;
                _.each(obj, function(el, idx) {
                    ret += '  ' + exports.prettyJson(el, indent + '  ');
                    if ( idx + 1 < obj.length )
                    ret += ',';
                ret += '\n' + indent;
                });
                return ret + ']';
            }
            if ( _.isObject(obj) )
            {
                var keys = _.keys(obj);
                if ( keys.length <= 0 )
                    return '{}';
                keys.sort();
                ret = '{\n' + indent;
                    _.each(keys, function(key, idx) {
                        ret += '  ' + exports.prettyJson(key)
                        + ': ' + exports.prettyJson(obj[key], indent + '  ');
                    if ( idx + 1 < keys.length )
                        ret += ',';
                    ret += '\n' + indent;
                    });
                    return ret + ( indent.length <= 0 ? '}\n' : '}' );
            }
            return JSON.stringify(obj);
        },

        //-------------------------------------------------------------------------
        urlEncode: function(dat) {
            return ( dat == undefined ? dat : encodeURIComponent(dat) );
        },

        //-------------------------------------------------------------------------
        /*
           rmfr: function(path, cb) {
           fs.stat(path, function(err, stats) {
           if ( err && err.code == 'ENOENT' )
           return cb();
           if ( err )
           return cb(err);
           if ( ! stats.isDirectory() )
           return fs.unlink(path, cb);
           fs.readdir(path, function(err, files) {
           exports.cascade(files, function(file, cb) {
           var curpath = pathmod.join(path, file);
           return exports.rmfr(curpath, cb);
           }, function(err) {
           if ( err )
           return cb(err);
           fs.rmdir(path, cb);
           });
           });
           });
           },
           */
        //-------------------------------------------------------------------------
        /*
           makedirs: function(path, cb) {
        // node sucks. i can't believe it doesn't provide a fs.makedirs(). wtf.
        // clean up the path
        path = pathmod.normalize(path.split(/[\\\/]/).join('/'));
        var paths = path.split('/');
        paths = _.map(paths, function(p, idx) {
        return paths.slice(0, idx + 1).join('/');
        });
        if ( path.charAt(0) == '/' )
        paths.shift();
        exports.cascade(paths, function(path, cb) {
        fs.stat(path, function(err, stats) {
        if ( err && err.code == 'ENOENT' )
        return fs.mkdir(path, cb);
        if ( err )
        return cb(err);
        if ( stats.isDirectory() )
        return cb();
        // this probably won't work, but let's get the error anyhow...
        return fs.mkdir(path, cb);
        });
        }, cb);
        },
        */

        //-------------------------------------------------------------------------
        StringStream: exports.Stream.extend({

            constructor: function(initData) {
                this._data = initData || '';
            },

        write: function(data) {
            if ( data == undefined )
            return;
        this._data += data;
        },

        getData: function() {
            return this._data;
        }

        }),

        //-------------------------------------------------------------------------
        IndentStream: exports.Stream.extend({

            //-----------------------------------------------------------------------
            constructor: function(stream, indent, options) {
                options = options || {};
                this._stream    = stream;
                this._indent    = indent || '  ';
                this._cleared   = true;
                this._stayBlank = !! options.stayBlank;
            },

        //-----------------------------------------------------------------------
        write: function(data) {
            var self = this;
            if ( data == undefined )
            return;
        // if ( ! data || ! data.length || data.length <= 0 )
        //   return;
        var lines = data.split('\n');
        if ( self._cleared )
            self._stream.write(self._indent);
        self._cleared = false;
        for ( var idx=0 ; idx<lines.length ; idx++ )
        {
            var line = lines[idx];
            if ( line == '' )
            {
                if ( idx + 1 >= lines.length )
                    self._cleared = true;
                else
                {
                    if ( idx != 0 && ! self._stayBlank )
                        self._stream.write(self._indent);
                }
            }
            else
            {
                if ( idx != 0 || self._cleared )
                    self._stream.write(self._indent);
                self._stream.write(line);
            }
            if ( idx + 1 < lines.length )
                self._stream.write('\n');
        }
        }

        })

    });

    return exports;
})();

module.exports = _self;
