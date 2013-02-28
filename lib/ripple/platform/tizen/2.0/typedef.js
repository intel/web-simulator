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

/*
 * Primitive type definition
 */

var _t = {
    // Basic
    DOMString:           "",
    Date:                new Date(),
    Function:            function () {},
    any:                 "any",
    boolean:             false,
    double:              0.0,
    long:                0,

    // Common
    FilterMatchFlag:     ["EXACTLY", "FULLSTRING", "CONTAINS",
                          "STARTSWITH", "ENDSWITH", "EXISTS"],
    SortModeOrder:       ["ASC", "DESC"],
    CompositeFilterType: ["UNION", "INTERSECTION"],

    // Contact
    ContactTextFormat:   ["VCARD_30", "VCARD_30"]    // Enum must has more than one value
};

/*
 * Derivative type definition
 */

/*
 * Object attributes
 *     Contruct a prototype of an object. Specify a primitive type for each attribute.
 *
 * _optional
 *     Optional attributes table, which consists of two types of attributes,
 *
 *     nullable
 *         Nullable attributes, marked as '?' in IDL.
 *
 *     undefined
 *         Array type attributes, that not definitely specified to be
 *         initialized as an empty array, i.e., undefined-initialized array.
 *
 * _derived
 *     Subtype list, which consists of derived subtypes. It only exists in the
 *     definition of base type.
 */

/*
 * Common
 */

_t.CompositeFilter = {
    type:    _t.CompositeFilterType,
    filters: ["AbstractFilter"]     // Recursive expansion
};

_t.AttributeFilter = {
    attributeName: _t.DOMString,
    matchFlag:     _t.FilterMatchFlag,
    matchValue:    _t.any
};

_t.AttributeRangeFilter = {
    attributeName: _t.DOMString,
    initialValue:  _t.any,
    endValue:      _t.any
};

_t.AbstractFilter = {
    _derived: [_t.CompositeFilter, _t.AttributeFilter, _t.AttributeRangeFilter]
};

_t.SortMode = {
    attributeName: _t.DOMString,
    order:         _t.SortModeOrder
};

_t.SimpleCoordinates = {
    latitude:  _t.double,
    longitude: _t.double
};

_t.SuccessCallback = _t.Function;
_t.ErrorCallback   = _t.Function;

/*
 * Contact
 */

_t.AddressBookId  = _t.DOMString;
_t.ContactId      = _t.DOMString;
_t.PersonId       = _t.DOMString;
_t.ContactGroupId = _t.DOMString;

_t.Person = {
    id:               _t.PersonId,
    displayName:      _t.DOMString,
    contactCount:     _t.long,
    hasPhoneNumber:   _t.boolean,
    hasEmail:         _t.boolean,
    isFavorite:       _t.boolean,
    photoURI:         _t.DOMString,
    ringtoneURI:      _t.DOMString,
    displayContactId: _t.ContactId,

    _optional: {
        // nullable
        photoURI:    true,
        ringtoneURI: true
    }
};

_t.ContactRef = {
    addressBookId: _t.AddressBookId,
    contactId:     _t.ContactId
};

_t.ContactName = {
    prefix:            _t.DOMString,
    suffix:            _t.DOMString,
    firstName:         _t.DOMString,
    middleName:        _t.DOMString,
    lastName:          _t.DOMString,
    nicknames:         [_t.DOMString],
    phoneticFirstName: _t.DOMString,
    phoneticLastName:  _t.DOMString,
    displayName:       _t.DOMString,

    _optional: {
        // nullable
        prefix:            true,
        suffix:            true,
        firstName:         true,
        middleName:        true,
        lastName:          true,
        phoneticFirstName: true,
        phoneticLastName:  true,
        displayName:       true
    }
};

_t.ContactOrganization = {
    name:       _t.DOMString,
    department: _t.DOMString,
    title:      _t.DOMString,
    role:       _t.DOMString,
    logoURI:    _t.DOMString,

    _optional: {
        // nullable
        name:       true,
        department: true,
        title:      true,
        role:       true,
        logoURI:    true
    }
};

_t.ContactWebSite = {
    url:  _t.DOMString,
    type: _t.DOMString,

    _optional: {
        // nullable
        type: true
    }
};

_t.ContactAnniversary = {
    date:  _t.DOMString,
    label: _t.DOMString,

    _optional: {
        // nullable
        label: true
    }
};

_t.ContactAddress = {
    country:               _t.DOMString,
    region:                _t.DOMString,
    city:                  _t.DOMString,
    streetAddress:         _t.DOMString,
    additionalInformation: _t.DOMString,
    postalCode:            _t.DOMString,
    isDefault:             _t.boolean,
    types:                 [_t.DOMString],

    _optional: {
        // nullable
        country:               true,
        region:                true,
        city:                  true,
        streetAddress:         true,
        additionalInformation: true,
        postalCode:            true,
        // undefined
        types:                 true
    }
};

_t.ContactPhoneNumber = {
    number:    _t.DOMString,
    isDefault: _t.boolean,
    types:     [_t.DOMString],

    _optional: {
        // undefined
        types: true
    }
};

_t.ContactEmailAddress = {
    email:     _t.DOMString,
    isDefault: _t.boolean,
    types:     [_t.DOMString],

    _optional: {
        // undefined
        types: true
    }
};

_t.Contact = {
    id:              _t.ContactId,
    personId:        _t.PersonId,
    addressBookId:   _t.AddressBookId,
    lastUpdated:     _t.Date,
    isFavorite:      _t.boolean,
    name:            _t.ContactName,
    addresses:       [_t.ContactAddress],
    photoURI:        _t.DOMString,
    phoneNumbers:    [_t.ContactPhoneNumber],
    emails:          [_t.ContactEmailAddress],
    birthday:        _t.Date,
    anniversaries:   [_t.ContactAnniversary],
    organizations:   [_t.ContactOrganization],
    notes:           [_t.DOMString],
    urls:            [_t.ContactWebSite],
    ringtoneURI:     [_t.DOMString],
    groupIds:        [_t.ContactGroupId],
    convertToString: _t.Function,
    clone:           _t.Function,

    _optional: {
        // nullable
        id:            true,
        personId:      true,
        addressBookId: true,
        lastUpdated:   true,
        name:          true,
        photoURI:      true,
        birthday:      true,
        ringtoneURI:   true,
        // undefined
        phoneNumbers:  true,
        emails:        true,
        anniversaries: true,
        organizations: true,
        notes:         true
    }
};

_t.ContactGroup = {
    id:            _t.ContactGroupId,
    addressBookId: _t.AddressBookId,
    name:          _t.DOMString,
    ringtoneURI:   _t.DOMString,
    photoURI:      _t.DOMString,
    readOnly:      _t.DOMString,

    _optional: {
        // nullable
        id:            true,
        addressBookId: true,
        ringtoneURI:   true,
        photoURI:      true
    }
};

_t.PersonArraySuccessCallback      = _t.Function;
_t.ContactArraySuccessCallback     = _t.Function;
_t.AddressBookArraySuccessCallback = _t.Function;

_t.AddressBookChangeCallback = {
    oncontactsadded:   _t.Function,
    oncontactsupdated: _t.Function,
    oncontactsremoved: _t.Function
};

_t.PersonsChangeCallback = {
    onpersonsadded:   _t.Function,
    onpersonsupdated: _t.Function,
    onpersonsremoved: _t.Function
};

module.exports = _t;
