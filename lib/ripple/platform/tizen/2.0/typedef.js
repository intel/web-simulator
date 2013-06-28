/*
 *  Copyright 2013 Intel Corporation.
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
    DOMString:                    "",
    Date:                         new Date(),
    Function:                     function () {},
    any:                          "any",
    boolean:                      false,
    double:                       "double",
    float:                        "float",
    long:                         0,
    "unsigned long":              0,
    "unsigned long long":         0,
    "unsigned short":             0,

    // Common
    FilterMatchFlag:              ["EXACTLY", "FULLSTRING", "CONTAINS",
                                   "STARTSWITH", "ENDSWITH", "EXISTS"],
    SortModeOrder:                ["ASC", "DESC"],
    CompositeFilterType:          ["UNION", "INTERSECTION"],

    // Calendar
    ByDayValue:                   ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],

    // Contact
    ContactTextFormat:            ["VCARD_30", "VCARD_30"],    // Enum must has more than one value

    // Content
    ContentDirectoryStorageType:  ["INTERNAL", "EXTERNAL"],
    ContentType:                  ["IMAGE", "VIDEO", "AUDIO", "OTHER"],
    AudioContentLyricsType:       ["SYNCHRONIZED", "UNSYNCHRONIZED"],
    ImageContentOrientation:      ["NORMAL", "FLIP_HORIZONTAL", "ROTATE_180",
                                   "FLIP_VERTICAL", "TRANSPOSE", "ROTATE_90",
                                   "TRANSVERSE", "ROTATE_270"],

    // Data Control
    DataType:                     ["MAP", "SQL"],

    // Messaging
    MessageServiceTag:            ["messaging.sms", "messaging.mms", "messaging.email"],

    // Network Bearer Selection
    NetworkType:                  ["CELLULAR", "UNKNOWN"]
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
 *     Derived types, which used in two cases of definition,
 *
 *     Subtype list
 *         An array consists of derived subtypes. It exists in the definition of
 *         a base type.
 *
 *     Union types
 *         An array consists of member types. It exists in the definition of
 *         a union type.
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
 * Alarm
 */

_t.AlarmId = _t.DOMString;

_t.AlarmRelative = {
    delay:               _t["unsigned long long"],
    period:              _t["unsigned long long"],
    getRemainingSeconds: _t.Function,

    _optional: {
        // nullable
        period:              true,
        getRemainingSeconds: true
    }
};

_t.AlarmAbsolute = {
    date:                 _t.Date,
    period:               _t["unsigned long long"],
    daysOfTheWeek:        [_t.ByDayValue],
    getNextScheduledDate: _t.Function,

    _optional: {
        // nullable
        period:               true,
        getNextScheduledDate: true
    }
};

_t.Alarm = {
    id: _t.AlarmId,

    _optional: {
        // nullable
        id: true
    },

    _derived: [_t.AlarmRelative, _t.AlarmAbsolute]
};

/*
 * Application
 */

_t.ApplicationId = _t.DOMString;

_t.ApplicationControlData = {
    key:   _t.DOMString,
    value: [_t.DOMString]
};

_t.ApplicationControl = {
    operation: _t.DOMString,
    uri:       _t.DOMString,
    mime:      _t.DOMString,
    category:  _t.DOMString,
    data:      [_t.ApplicationControlData],

    _optional: {
        // nullable
        uri:      true,
        mime:     true,
        category: true
    }
};

/*
 * Bookmark
 */

_t.BookmarkFolder = {
    parent: "BookmarkFolder",
    title:  _t.DOMString,

    _optional: {
        // nullable
        parent: true
    }
};

_t.BookmarkItem = {
    parent: _t.BookmarkFolder,
    title:  _t.DOMString,
    url:    _t.DOMString,

    _optional: {
        // nullable
        parent: true
    }
};

_t.Bookmark = {
    _derived: [_t.BookmarkItem, _t.BookmarkFolder]
};

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

/*
 * Content
 */

_t.ContentId                            = _t.DOMString;
_t.ContentDirectoryId                   = _t.DOMString;
_t.ContentArraySuccessCallback          = _t.Function;
_t.ContentDirectoryArraySuccessCallback = _t.Function;
_t.ContentScanSuccessCallback           = _t.Function;

_t.ContentChangeCallback = {
    oncontentadded:   _t.Function,
    oncontentupdated: _t.Function,
    oncontentremoved: _t.Function
};

_t.VideoContent = {
    geolocation: _t.SimpleCoordinates,
    album:       _t.DOMString,
    artists:     [_t.DOMString],
    duration:    _t["unsigned long"],
    width:       _t["unsigned long"],
    height:      _t["unsigned long"],

    _optional: {
        // nullable
        geolocation: true,
        album:       true,
        artists:     true
    }
};

_t.AudioContentLyrics = {
    type:       _t.AudioContentLyricsType,
    timestamps: [_t["unsigned long"]],
    texts:      [_t.DOMString]
};

_t.AudioContent = {
    album:       _t.DOMString,
    genres:      [_t.DOMString],
    artists:     [_t.DOMString],
    composers:   [_t.DOMString],
    lyrics:      _t.AudioContentLyrics,
    copyright:   _t.DOMString,
    bitrate:     _t["unsigned long"],
    trackNumber: _t["unsigned short"],
    duration:    _t["unsigned long"],

    _optional: {
        // nullable
        album:       true,
        genres:      true,
        artists:     true,
        composers:   true,
        lyrics:      true,
        copyright:   true,
        trackNumber: true
    }
};

_t.ImageContent = {
    geolocation: _t.SimpleCoordinates,
    width:       _t["unsigned long"],
    height:      _t["unsigned long"],
    orientation: _t.ImageContentOrientation,

    _optional: {
        // nullable
        geolocation: true
    }
};

_t.Content = {
    editableAttributes: [_t.DOMString],
    id:                 _t.ContentId,
    name:               _t.DOMString,
    type:               _t.ContentType,
    mimeType:           _t.DOMString,
    title:              _t.DOMString,
    contentURI:         _t.DOMString,
    thumbnailURIs:      [_t.DOMString],
    releaseDate:        _t.Date,
    modifiedDate:       _t.Date,
    size:               _t["unsigned long"],
    description:        _t.DOMString,
    rating:             _t.float,

    _optional: {
        // nullable
        thumbnailURIs: true,
        releaseDate:   true,
        modifiedDate:  true,
        description:   true
    },

    _derived: [_t.VideoContent, _t.AudioContent, _t.ImageContent]
};

/*
 * Data Control
 */

_t.DataControlSuccessCallback         = _t.Function;
_t.DataControlErrorCallback           = _t.Function;
_t.DataControlInsertSuccessCallback   = _t.Function;
_t.DataControlSelectSuccessCallback   = _t.Function;
_t.DataControlGetValueSuccessCallback = _t.Function;

_t.RowData = {
    columns: [_t.DOMString],
    values:  [_t.DOMString]
};

/*
 * Messaging
 */

_t.MessageId                               = _t.DOMString;
_t.MessageAttachmentId                     = _t.DOMString;
_t.MessageConvId                           = _t.DOMString;
_t.MessageFolderId                         = _t.DOMString;
_t.MessageServiceArraySuccessCallback      = _t.Function;
_t.MessageRecipientsCallback               = _t.Function;
_t.MessageBodySuccessCallback              = _t.Function;
_t.MessageAttachmentSuccessCallback        = _t.Function;
_t.MessageArraySuccessCallback             = _t.Function;
_t.MessageConversationArraySuccessCallback = _t.Function;
_t.MessageFolderArraySuccessCallback       = _t.Function;

_t.MessagesChangeCallback = {
    messagesadded:   _t.Function,
    messagesupdated: _t.Function,
    messagesremoved: _t.Function
};

_t.MessageConversationsChangeCallback = {
    conversationsadded:   _t.Function,
    conversationsupdated: _t.Function,
    conversationsremoved: _t.Function
};

_t.MessageFoldersChangeCallback = {
    foldersadded:   _t.Function,
    foldersupdated: _t.Function,
    foldersremoved: _t.Function
};

/*
 * Network Bearer Selection
 */

_t.NetworkSuccessCallback = {
    onsuccess:      _t.Function,
    ondisconnected: _t.Function
};

/*
 * Push
 */

_t.PushRegistrationId          = _t.DOMString;
_t.PushRegisterSuccessCallback = _t.Function;
_t.PushNotificationCallback    = _t.Function;

/*
 * Package
 */

_t.PackageId = _t.DOMString;
_t.PackageProgressCallback = {
    onprogress: _t.Function,
    oncomplete: _t.Function
};
_t.PackageInformationArraySuccessCallback = _t.Function;
_t.PackageInfomationEventCallback = {
    oninstalled:   _t.Function,
    onupdated:     _t.Function,
    onuninstalled: _t.Function
};

module.exports = _t;
