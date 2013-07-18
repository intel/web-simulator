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

var _t, _i;

/*
 * Primitive type definition
 */

_t = {
    // Basic
    DOMString:                    "",
    Date:                         new Date(),
    Function:                     function () {},
    any:                          "any",
    boolean:                      false,
    double:                       "double",
    float:                        "float",
    long:                         0,
    "unsigned long":              "unsigned long",
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

    // Data Sync
    SyncMode:                     ["MANUAL", "PERIODIC", "PUSH"],
    SyncType:                     ["TWO_WAY", "SLOW", "ONE_WAY_FROM_CLIENT", "REFRESH_FROM_CLIENT", "ONE_WAY_FROM_SERVER", "REFRESH_FROM_SERVER"],
    SyncInterval:                 ["5_MINUTES", "15_MINUTES", "1_HOUR", "4_HOURS", "12_HOURS", "1_DAY", "1_WEEK", "1_MONTH"],
    SyncServiceType:              ["CONTACT", "EVENT"],
    SyncStatus:                   ["SUCCESS", "FAIL", "STOP", "NONE"],

    // Messaging
    MessageServiceTag:            ["messaging.sms", "messaging.mms", "messaging.email"],

    // Network Bearer Selection
    NetworkType:                  ["CELLULAR", "UNKNOWN"],

    // Notification
    NotificationType:             ["STATUS", "STATUS"],
    StatusNotificationType:       ["SIMPLE", "THUMBNAIL", "ONGOING",
                                   "PROGRESS"],
    NotificationProgressType:     ["PERCENTAGE", "BYTE"]
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
    date:  _t.Date,
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
    ringtoneURI:     _t.DOMString,
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
        ringtoneURI:   true
    }
};

_t.ContactGroup = {
    id:            _t.ContactGroupId,
    addressBookId: _t.AddressBookId,
    name:          _t.DOMString,
    ringtoneURI:   _t.DOMString,
    photoURI:      _t.DOMString,
    readOnly:      _t.boolean,

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
 * Data Sync
 */

_t.SyncProfileId = _t.DOMString;

_t.SyncInfo = {
    url:                _t.DOMString,
    mode:               _t.SyncMode,
    type:               _t.SyncType,
    interval:           _t.SyncInterval,

    _optional: {
        // nullable
        type:       true,
        interval:   true
    }
};

_t.SyncServiceInfo = {
    enable:             _t.boolean,
    serviceType:        _t.SyncServiceType,
    serverDatabaseUri:  _t.DOMString
};

_t.SyncProfileInfo = {
    profileName:    _t.DOMString,
    syncInfo:       _t.SyncInfo,
    serviceInfo:    [_t.SyncServiceInfo],

    _optional: {
        // nullable
        serviceInfo:    true
    }
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

_t.MessageFolder = {
    id:             _t.MessageFolderId,
    parentId:       _t.MessageFolderId,
    serviceId:      _t.DOMString,
    contentType:    _t.MessageServiceTag,
    name:           _t.DOMString,
    path:           _t.DOMString,
    type:           _t.DOMString,
    synchronizable: _t.boolean,

    _optional: {
        // nullable
        parentId: true
    }

};

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
    ondisconnected: _t.Function,

    _optional: {
        onsuccess:      true,
        ondisconnected: true
    }
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
    oncomplete: _t.Function,

    _optional: {
        onprogress: true,
        oncomplete: true
    }
};
_t.PackageInformationArraySuccessCallback = _t.Function;
_t.PackageInfomationEventCallback = {
    oninstalled:   _t.Function,
    onupdated:     _t.Function,
    onuninstalled: _t.Function,

    _optional: {
        oninstalled:   true,
        onupdated:     true,
        onuninstalled: true
    }
};

/*
 * Interface prototype definition
 */

_i = {
    // Alarm
    AlarmManager:              {},

    // Bookmark
    BookmarkManager:           {},

    // Contact
    ContactManager:            {},
    AddressBook:               {},
    Person:                    {},

    // Content
    ContentManager:            {},

    // Data Control
    DataControlManager:        {},
    SQLDataControlConsumer:    {},
    MappedDataControlConsumer: {}
};

/*
 * Alarm
 */

// AlarmManager
_i.AlarmManager.add = {
    0: _t.Alarm,
    1: _t.ApplicationId,
    2: _t.ApplicationControl,

    _optional: {
        2: true
    }
};

_i.AlarmManager.remove = {
    0: _t.AlarmId
};

_i.AlarmManager.removeAll = null;

_i.AlarmManager.get = {
    0: _t.AlarmId
};

_i.AlarmManager.getAll = null;

/*
 * Bookmark
 */

// BookmarkManager
_i.BookmarkManager.get = {
    0: _t.BookmarkFolder,
    1: _t.boolean,

    _optional: {
        0: true,
        1: true
    }
};

_i.BookmarkManager.add = {
    0: _t.Bookmark,
    1: _t.BookmarkFolder,

    _optional: {
        1: true
    }
};

_i.BookmarkManager.remove = {
    0: _t.Bookmark,

    _optional: {
        0: true
    }
};

/*
 * Contact
 */

// ContactManager
_i.ContactManager.getAddressBooks = {
    0: _t.AddressBookArraySuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        1: true
    }
};

_i.ContactManager.getUnifiedAddressBook = null;
_i.ContactManager.getDefaultAddressBook = null;

_i.ContactManager.getAddressBook = {
    0: _t.AddressBookId
};

_i.ContactManager.get = {
    0: _t.PersonId
};

_i.ContactManager.update = {
    0: _t.Person
};

_i.ContactManager.updateBatch = {
    0: [_t.Person],
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.ContactManager.remove = {
    0: _t.PersonId
};

_i.ContactManager.removeBatch = {
    0: [_t.PersonId],
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.ContactManager.find = {
    0: _t.PersonArraySuccessCallback,
    1: _t.ErrorCallback,
    2: _t.AbstractFilter,
    3: _t.SortMode,

    _optional: {
        1: true,
        2: true,
        3: true
    }
};

_i.ContactManager.addChangeListener = {
    0: _t.PersonsChangeCallback
};

_i.ContactManager.removeChangeListener = {
    0: _t.long
};

// AddressBook
_i.AddressBook.get = {
    0: _t.ContactId
};

_i.AddressBook.add = {
    0: _t.Contact
};

_i.AddressBook.addBatch = {
    0: [_t.Contact],
    1: _t.ContactArraySuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.AddressBook.update = {
    0: _t.Contact
};

_i.AddressBook.updateBatch = {
    0: [_t.Contact],
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.AddressBook.remove = {
    0: _t.ContactId
};

_i.AddressBook.removeBatch = {
    0: [_t.ContactId],
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.AddressBook.find = {
    0: _t.ContactArraySuccessCallback,
    1: _t.ErrorCallback,
    2: _t.AbstractFilter,
    3: _t.SortMode,

    _optional:{
        1: true,
        2: true,
        3: true
    }
};

_i.AddressBook.addChangeListener = {
    0: _t.AddressBookChangeCallback,
    1: _t.ErrorCallback,

    _optional: {
        1: true
    }
};

_i.AddressBook.removeChangeListener = {
    0: _t.long
};

_i.AddressBook.getGroup = {
    0: _t.ContactGroupId
};

_i.AddressBook.addGroup = {
    0: _t.ContactGroup
};

_i.AddressBook.updateGroup = {
    0: _t.ContactGroup
};

_i.AddressBook.removeGroup = {
    0: _t.ContactGroupId
};

_i.AddressBook.getGroups = null;

// Person
_i.Person.link = {
    0: _t.PersonId
};

_i.Person.unlink = {
    0: _t.ContactId
};

/*
 * Content
 */

// ContentManager
_i.ContentManager.update = {
    0: _t.Content
};

_i.ContentManager.updateBatch = {
    0: [_t.Content],
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.ContentManager.getDirectories = {
    0: _t.ContentDirectoryArraySuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        1: true
    }
};

_i.ContentManager.find = {
    0: _t.ContentArraySuccessCallback,
    1: _t.ErrorCallback,
    2: _t.ContentDirectoryId,
    3: _t.AbstractFilter,
    4: _t.SortMode,
    5: _t["unsigned long"],
    6: _t["unsigned long"],

    _optional: {
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: true
    }
};

_i.ContentManager.scanFile = {
    0: _t.DOMString,
    1: _t.ContentScanSuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.ContentManager.setChangeListener = {
    0: _t.ContentChangeCallback
};

_i.ContentManager.unsetChangeListener = null;

/*
 * Data Control
 */

// DataControlManager
_i.DataControlManager.getDataControlConsumer = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.DataType
};

// SQLDataControlConsumer
_i.SQLDataControlConsumer.insert = {
    0: _t["unsigned long"],
    1: _t.RowData,
    2: _t.DataControlInsertSuccessCallback,
    3: _t.DataControlErrorCallback,

    _optional: {
        2: true,
        3: true
    }
};

_i.SQLDataControlConsumer.update = {
    0: _t["unsigned long"],
    1: _t.RowData,
    2: _t.DOMString,
    3: _t.DataControlSuccessCallback,
    4: _t.DataControlErrorCallback,

    _optional: {
        3: true,
        4: true
    }
};

_i.SQLDataControlConsumer.remove = {
    0: _t["unsigned long"],
    1: _t.DOMString,
    2: _t.DataControlSuccessCallback,
    3: _t.DataControlErrorCallback,

    _optional: {
        2: true,
        3: true
    }
};

_i.SQLDataControlConsumer.select = {
    0: _t["unsigned long"],
    1: [_t.DOMString],
    2: _t.DOMString,
    3: _t.DataControlSelectSuccessCallback,
    4: _t.DataControlErrorCallback,
    5: _t["unsigned long"],
    6: _t["unsigned long"],

    _optional: {
        4: true,
        5: true,
        6: true
    }
};

// MappedDataControlConsumer
_i.MappedDataControlConsumer.addValue = {
    0: _t["unsigned long"],
    1: _t.DOMString,
    2: _t.DOMString,
    3: _t.DataControlSuccessCallback,
    4: _t.DataControlErrorCallback,

    _optional: {
        3: true,
        4: true
    }
};

_i.MappedDataControlConsumer.removeValue = {
    0: _t["unsigned long"],
    1: _t.DOMString,
    2: _t.DOMString,
    3: _t.DataControlSuccessCallback,
    4: _t.DataControlErrorCallback,

    _optional: {
        4: true
    }
};

_i.MappedDataControlConsumer.getValue = {
    0: _t["unsigned long"],
    1: _t.DOMString,
    2: _t.DataControlGetValueSuccessCallback,
    3: _t.DataControlErrorCallback,

    _optional: {
        3: true
    }
};

_i.MappedDataControlConsumer.updateValue = {
    0: _t["unsigned long"],
    1: _t.DOMString,
    2: _t.DOMString,
    3: _t.DOMString,
    4: _t.DataControlSuccessCallback,
    5: _t.DataControlErrorCallback,

    _optional: {
        5: true
    }
};

_t.interface = _i;

module.exports = _t;
