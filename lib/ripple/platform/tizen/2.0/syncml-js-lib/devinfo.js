// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// lib:  syncml-js.devinfo
// auth: griffin <griffin@uberdev.org>
// date: 2012/11/06
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var common = require('ripple/platform/tizen/2.0/syncml-js-lib/common'),
    constant = require('ripple/platform/tizen/2.0/syncml-js-lib/constant'),
    storemod = require('ripple/platform/tizen/2.0/syncml-js-lib/store'),
    ET = require('ripple/platform/tizen/2.0/syncml-js-lib/elementtree'),
    _self;

_self = (function () {

    var exports = {};

    var strAttributeMap = [
    ['manufacturerName',    'Man'],
      ['modelName',           'Mod'],
      ['oem',                 'OEM'],
      ['firmwareVersion',     'FwV'],
      ['softwareVersion',     'SwV'],
      ['hardwareVersion',     'HwV'],
      ['devID',               'DevID'],
      ['devType',             'DevTyp']
    ];

var boolAttributeMap = [
    ['utc',                 'UTC'],
      ['largeObjects',        'SupportLargeObjs'],
      ['hierarchicalSync',    'SupportHierarchicalSync'],
      ['numberOfChanges',     'SupportNumberOfChanges']
    ];

//---------------------------------------------------------------------------
exports.DevInfo = common.Base.extend({

    //-------------------------------------------------------------------------
    constructor: function(adapter, options) {
        var self = this;
        var options = _.defaults({}, options, {
            devType           : constant.DEVTYPE_WORKSTATION,
            manufacturerName  : '-',
            modelName         : '-',
            oem               : '-',
            hardwareVersion   : '-',
            firmwareVersion   : '-',
            softwareVersion   : '-',
            utc               : true,
            largeObjects      : true,
            hierarchicalSync  : true,
            numberOfChanges   : true,
            extensions        : {}
        });

        // todo: is there anyway to mark attributes as read-only?...

        //: [read-only] these are all read-only attributes
        this.devID            = options.devID || common.makeID();
        this.devType          = options.devType;
        this.manufacturerName = options.manufacturerName;
        this.modelName        = options.modelName;
        this.oem              = options.oem;
        this.hardwareVersion  = options.hardwareVersion;
        this.firmwareVersion  = options.firmwareVersion;
        this.softwareVersion  = options.softwareVersion;
        this.utc              = options.utc;
        this.largeObjects     = options.largeObjects;
        this.hierarchicalSync = options.hierarchicalSync;
        this.numberOfChanges  = options.numberOfChanges;
        this.extensions       = {};

        _.each(options.extensions, function(values, name) {
            self.setExtension(name, values);
        });

        // --- private attributes
        this._a       = adapter;
    },

        //-------------------------------------------------------------------------
        setExtension: function(name, values) {
            this.extensions[name] = _.isArray(values) ? values : [values];
        },

        //-------------------------------------------------------------------------
        getExtensionKeys: function() {
            return _.keys(this.extensions);
        },

        //-------------------------------------------------------------------------
        getExtension: function(name) {
            return this.extensions[name];
        },

        //-------------------------------------------------------------------------
        _load: function(cb) {
            cb();
        },

        //-------------------------------------------------------------------------
        _updateModel: function(cb) {
            if ( ! this._a._model )
                return cb('devinfo created on un-initialized adapter');
            this._a._model.devInfo = {
                devID            : this.devID,
                devType          : this.devType,
                manufacturerName : this.manufacturerName,
                modelName        : this.modelName,
                oem              : this.oem,
                hardwareVersion  : this.hardwareVersion,
                firmwareVersion  : this.firmwareVersion,
                softwareVersion  : this.softwareVersion,
                utc              : this.utc,
                largeObjects     : this.largeObjects,
                hierarchicalSync : this.hierarchicalSync,
                numberOfChanges  : this.numberOfChanges,
                extensions       : this.extensions
            };
            cb();
        },

        //-------------------------------------------------------------------------
        toSyncML: function(dtdVersion, stores) {
            dtdVersion = dtdVersion || constant.SYNCML_DTD_VERSION_1_2;
            if ( dtdVersion != constant.SYNCML_DTD_VERSION_1_2 )
                throw new Error('unsupported DTD version "' + dtdVersion + '"')
                    var xret = ET.Element('DevInf', {'xmlns': constant.NAMESPACE_DEVINF})
                    ET.SubElement(xret, 'VerDTD').text = dtdVersion;
            for ( var idx=0 ; idx<strAttributeMap.length ; idx++ )
            {
                var map = strAttributeMap[idx];
                // todo: should i enforce the fact that these are all *required*?...
                if ( this[map[0]] != undefined )
                    ET.SubElement(xret, map[1]).text = this[map[0]];
            }
            for ( var idx=0 ; idx<boolAttributeMap.length ; idx++ )
            {
                var map = boolAttributeMap[idx];
                if ( this[map[0]] )
                    ET.SubElement(xret, map[1])
            }
            if ( stores && stores.length > 0 )
                for ( var idx=0 ; idx<stores.length ; idx++ )
                    xret.append(stores[idx].toSyncML());
            var xext = null;
            for ( var name in this.extensions )
            {
                if ( ! xext )
                    xext = ET.SubElement(xret, 'Ext');
                ET.SubElement(xext, 'XNam').text = name;
                var values = this.extensions[name];
                for ( var idx=0 ; idx<values.length ; idx++ )
                    ET.SubElement(xext, 'XVal').text = '' + values[idx];
            };
            return xret;
        },

}, {

    //-------------------------------------------------------------------------
    fromSyncML: function(xnode) {
        var options = {};
        var stores  = []
            var dtdVersion = xnode.findtext('VerDTD')
            if ( dtdVersion != constant.SYNCML_DTD_VERSION_1_2 )
                throw new common.ProtocolError('unsupported DTD version "' + dtdVersion + '"');
        for ( var idx=0 ; idx<strAttributeMap.length ; idx++ )
        {
            var map = strAttributeMap[idx];
            // todo: should i enforce the fact that these are all *required*?...
            options[map[0]] = xnode.findtext(map[1]);
        }
        for ( var idx=0 ; idx<boolAttributeMap.length ; idx++ )
        {
            var map = boolAttributeMap[idx];
            options[map[0]] = xnode.find(map[1]) != undefined;
        }
        _.each(xnode.getchildren(), function(child) {
            if ( child.tag == 'DataStore' )
            return stores.push(storemod.Store.fromSyncML(child));
        if ( child.tag == 'Ext' )
        {
            options.extensions = {};
            var elist = child.getchildren();
            var ecur  = null;
            for ( var idx=0 ; idx<elist.length ; idx++ )
        {
            var eitem = elist[idx];
            if ( eitem.tag == 'XNam' )
        {
            ecur = eitem.text;
            continue;
        }
        if ( ! ecur )
            // paranoia...
            continue;
        if ( ! options.extensions[ecur] )
            options.extensions[ecur] = [];
        options.extensions[ecur].push(eitem.text);
        }
        return;
        }
        });
        return [new exports.DevInfo(null, options), stores];
    }

});

return exports;

})();

module.exports = _self;
