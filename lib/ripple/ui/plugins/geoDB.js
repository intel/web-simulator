/*
 *  Copyright 2012 Intel Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var db = require('ripple/db'),
    utils = require('ripple/utils'),
    lbs = require('ripple/platform/tizen/1.0/lbs'),
    _GEO_OBJECTS = "tizen1.0-geocode-objects",
    _geoList, _currentGeo, _saveID, _showGeoDetail;

function _getGeo() {
    var geoList = [],
        data = db.retrieveObject(_GEO_OBJECTS);

    utils.forEach(data, function (geo) {
        geoList.push(geo);
    });
    return geoList;
}

function _saveGeo() {
    db.saveObject(_GEO_OBJECTS, _geoList);
}

function GeoEntry(addr, coord) {
    var _self;
    _self = {
        address : addr || null,
        coordinate : coord || null
    };
    return _self;
}

function _updateGeoDBSelect() {
    var geoDBSelect = document.getElementById("geo-select"),
        geoNode, i;

    geoDBSelect.innerHTML = "";
    for (i = 0; i < _geoList.length; i++) {
        geoNode = utils.createElement("option", {
            "innerText": "(" + _geoList[i].coordinate.latitude + ", " + _geoList[i].coordinate.longitude + ")",
            "value": i
        });
        if (_currentGeo === Number(geoNode.value)) {
            geoNode.selected = true;
            _showGeoDetail(_geoList[_currentGeo].coordinate, _geoList[_currentGeo].address);
        }
        geoDBSelect.appendChild(geoNode);
    }
}

function _showGeoDetail(coord, addr) {
    jQuery("#geoDB-latitude").val(coord.latitude);
    jQuery("#geoDB-longitude").val(coord.longitude);
    jQuery("#geoDB-altitude").val(coord.altitude);
    jQuery("#geoDB-accuracy").val(coord.accuracy);
    jQuery("#geoDB-altitudeAccuracy").val(coord.altitudeAccuracy);
    jQuery("#geoDB-heading").val(coord.heading);
    jQuery("#geoDB-speed").val(coord.speed);

    jQuery("#geoDB-country").val(addr.country);
    jQuery("#geoDB-region").val(addr.region);
    jQuery("#geoDB-county").val(addr.county);
    jQuery("#geoDB-city").val(addr.city);
    jQuery("#geoDB-street").val(addr.street);
    jQuery("#geoDB-streetNumber").val(addr.streetNumber);
    jQuery("#geoDB-premises").val(addr.premises);
    jQuery("#geoDB-additionalInformation").val(addr.additionalInformation);
    jQuery("#geoDB-postalCode").val(addr.postalCode);
}

function _changeGeoData() {
    var id = Number(jQuery("#geo-select").val());
    _currentGeo = id;
    _showGeoDetail(_geoList[id].coordinate, _geoList[id].address);
}

function _triggerReadOnly(on) {
    if (on === true) {
        jQuery("#geoDB-table input").attr("readonly", "readonly");
        jQuery("#geoDB-add").show();
        jQuery("#geoDB-modify").show();
        jQuery("#geoDB-delete").show();
        jQuery("#geo-select").removeAttr("disabled");
        jQuery("#geoDB-save").hide();
        jQuery("#geoDB-cancel").hide();
    } else {
        jQuery("#geoDB-table input").removeAttr("readonly");
        jQuery("#geoDB-add").hide();
        jQuery("#geoDB-modify").hide();
        jQuery("#geoDB-delete").hide();
        jQuery("#geo-select").attr("disabled", "disabled");
        jQuery("#geoDB-save").show();
        jQuery("#geoDB-cancel").show();
    }
}

function _addGeoData() {
    _triggerReadOnly(false);
    jQuery("#geoDB-table input").val("");
    _saveID = _geoList.length;
    jQuery("#geo-select").val("");
}
function _modifyGeoData() {
    _triggerReadOnly(false);
    _saveID = _currentGeo;
}
function _deleteGeoData() {
    _geoList.splice(_currentGeo, 1);
    _saveGeo();
    _currentGeo = 0;
    _updateGeoDBSelect();
}
function _saveGeoData() {
    var entry;
    entry = new GeoEntry(new lbs.StructuredAddress({
        country: jQuery("#geoDB-country").val(),
        region: jQuery("#geoDB-region").val(),
        county: jQuery("#geoDB-county").val(),
        city: jQuery("#geoDB-city").val(),
        street: jQuery("#geoDB-street").val(),
        streetNumber: jQuery("#geoDB-streetNumber").val(),
        premises: jQuery("#geoDB-premises").val(),
        additionalInformation: jQuery("#geoDB-additionalInformation").val(),
        postalCode: jQuery("#geoDB-postalCode").val()
    }),
        new lbs.GeoCoordinates({
        latitude: jQuery("#geoDB-latitude").val(),
        longitude: jQuery("#geoDB-longitude").val(),
        altitude: jQuery("#geoDB-altitude").val(),
        accuracy: jQuery("#geoDB-accuracy").val(),
        altitudeAccuracy: jQuery("#geoDB-altitudeAccuracy").val(),
        heading: jQuery("#geoDB-heading").val(),
        speed: jQuery("#geoDB-speed").val()
    }));
    if (_saveID === _geoList.length)
        _geoList.push(entry);
    else
        _geoList[_saveID] = entry;
    
    _saveGeo();
    _currentGeo = _saveID;
    _updateGeoDBSelect();
    _triggerReadOnly(true);
}

function _cancelGeoData() {
    _triggerReadOnly(true);
    _updateGeoDBSelect();
}

module.exports = {
    panel: {
        domId: "geoDB-container",
        collapsed: true,
        pane: "right"
    },

    initialize: function () {
        _currentGeo = 0; // set _geoList[0] as default value
        _geoList = _getGeo();
        _updateGeoDBSelect();
        _triggerReadOnly(true);

        jQuery("#geo-select").bind("change", function () {
            _changeGeoData();
        });
        jQuery("#geoDB-add").bind("click", function () {
            _addGeoData();
        });
        jQuery("#geoDB-modify").bind("click", function () {
            _modifyGeoData();
        });
        jQuery("#geoDB-delete").bind("click", function () {
            _deleteGeoData();
        });
        jQuery("#geoDB-save").bind("click", function () {
            _saveGeoData();
        });
        jQuery("#geoDB-cancel").bind("click", function () {
            _cancelGeoData();
        });
    }
};
