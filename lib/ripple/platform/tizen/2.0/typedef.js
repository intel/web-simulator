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

var _t, _c, _i;

/*
 * Primitive type definition
 */

_t = {
    // Basic
    Callback:                           "Callback",
    DOMString:                          "",
    Date:                               new Date(),
    Function:                           function () {},
    any:                                "any",
    boolean:                            false,
    byte:                               "byte",
    double:                             "double",
    float:                              "float",
    long:                               0,
    octet:                              "octet",
    short:                              0,
    "unsigned long":                    "unsigned long",
    "unsigned long long":               0,
    "unsigned short":                   0,

    // Common
    FilterMatchFlag:                    ["EXACTLY", "FULLSTRING", "CONTAINS",
                                         "STARTSWITH", "ENDSWITH", "EXISTS"],
    SortModeOrder:                      ["ASC", "DESC"],
    CompositeFilterType:                ["UNION", "INTERSECTION"],

    TimeDurationUnit:                   ["MSECS", "SECS", "MINS", "HOURS", "DAYS"],
    // Bluetooth
    BluetoothSocketState:               ["CLOSED", "OPEN"],
    BluetoothProfileType:               ["HEALTH", "HEALTH"],
    BluetoothHealthChannelType:         ["RELIABLE", "STREAMING"],

    // Calendar
    ByDayValue:                         ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],

    // Contact
    ContactTextFormat:                  ["VCARD_30", "VCARD_30"],    // Enum must has more than one value

    // Content
    ContentDirectoryStorageType:        ["INTERNAL", "EXTERNAL"],
    ContentType:                        ["IMAGE", "VIDEO", "AUDIO", "OTHER"],
    AudioContentLyricsType:             ["SYNCHRONIZED", "UNSYNCHRONIZED"],
    ImageContentOrientation:            ["NORMAL", "FLIP_HORIZONTAL", "ROTATE_180",
                                         "FLIP_VERTICAL", "TRANSPOSE", "ROTATE_90",
                                         "TRANSVERSE", "ROTATE_270"],

    // Data Control
    DataType:                           ["MAP", "SQL"],

    // Data Synchronization
    SyncMode:                           ["MANUAL", "PERIODIC", "PUSH"],
    SyncType:                           ["TWO_WAY", "SLOW",
                                         "ONE_WAY_FROM_CLIENT",
                                         "REFRESH_FROM_CLIENT",
                                         "ONE_WAY_FROM_SERVER",
                                         "REFRESH_FROM_SERVER"],
    SyncInterval:                       ["5_MINUTES", "15_MINUTES", "1_HOUR",
                                         "4_HOURS", "12_HOURS", "1_DAY",
                                         "1_WEEK", "1_MONTH"],
    SyncServiceType:                    ["CONTACT", "EVENT"],
    SyncStatus:                         ["SUCCESS", "FAIL", "STOP", "NONE"],

    // Download
    DownloadState:                      ["QUEUED", "DOWNLOADING", "PAUSED",
                                         "CANCELED", "COMPLETED", "FAILED"],
    DownloadNetworkType:                ["CELLULAR", "WIFI", "ALL"],

    // Messaging
    MessageServiceTag:                  ["messaging.sms", "messaging.mms", "messaging.email"],

    // Network Bearer Selection
    NetworkType:                        ["CELLULAR", "UNKNOWN"],

    // NFC
    NDEFRecordTextEncoding:             ["UTF8", "UTF16"],
    NFCTagType:                         ["GENERIC_TARGET", "ISO14443_A",
                                         "ISO14443_4A", "ISO14443_3A", "MIFARE_MINI",
                                         "MIFARE_1K", "MIFARE_4K", "MIFARE_ULTRA",
                                         "MIFARE_DESFIRE", "ISO14443_B",
                                         "ISO14443_4B", "ISO14443_BPRIME", "FELICA",
                                         "JEWEL", "ISO15693", "UNKNOWN_TARGET"],

    // Notification
    NotificationType:                   ["STATUS", "STATUS"],
    StatusNotificationType:             ["SIMPLE", "THUMBNAIL", "ONGOING",
                                         "PROGRESS"],
    NotificationProgressType:           ["PERCENTAGE", "BYTE"],

    // System Info
    SystemInfoPropertyId:               ["BATTERY", "CPU", "STORAGE", "DISPLAY",
                                         "DEVICE_ORIENTATION", "BUILD",
                                         "LOCALE", "NETWORK", "WIFI_NETWORK",
                                         "CELLULAR_NETWORK", "SIM", "PERIPHERAL"],
    SystemInfoNetworkType:              ["NONE", "2G", "2.5G", "3G", "4G",
                                         "WIFI", "ETHERNET", "UNKNOWN"],
    SystemInfoDeviceOrientationStatus:  ["PORTRAIT_PRIMARY",
                                         "PORTRAIT_SECONDARY",
                                         "LANDSCAPE_PRIMARY",
                                         "LANDSCAPE_SECONDARY"],
    SystemInfoSimState:                 ["ABSENT", "INITIALIZING", "READY",
                                         "PIN_REQUIRED", "PUK_REQUIRED",
                                         "NETWORK_LOCKED", "SIM_LOCKED",
                                         "UNKNOWN"],
    SystemInfoProfile:                  ["MOBILE_FULL", "MOBILE_WEB"],

    // System Setting
    SystemSettingType:                  ["HOME_SCREEN", "LOCK_SCREEN",
                                         "INCOMING_CALL", "NOTIFICATION_EMAIL"]
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
 *
 * _dictionary
 *     Dictionary type, which indicates that the object is a dictionary type.
 */

/*
 * Common
 */

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

_t.CompositeFilter = {
    type:    _t.CompositeFilterType,
    filters: ["AbstractFilter"]     // Recursive expansion
};

_t.AbstractFilter = {
    _derived: [_t.AttributeFilter, _t.AttributeRangeFilter, _t.CompositeFilter]
};

_t.SortMode = {
    attributeName: _t.DOMString,
    order:         _t.SortModeOrder
};

_t.SimpleCoordinates = {
    latitude:  _t.double,
    longitude: _t.double
};

_t.TimeDuration = {
    length: _t["unsigned long long"],
    unit:   _t.TimeDurationUnit
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

_t.ApplicationId                              = _t.DOMString;
_t.ApplicationContextId                       = _t.DOMString;
_t.ApplicationInformationArraySuccessCallback = _t.Function;
_t.FindAppControlSuccessCallback              = _t.Function;
_t.ApplicationContextArraySuccessCallback     = _t.Function;

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

_t.ApplicationControlDataArrayReplyCallback = {
    onsuccess: _t.Callback,
    onfailure: _t.Callback
};

_t.ApplicationInformationEventCallback = {
    oninstalled:   _t.Callback,
    onupdated:     _t.Callback,
    onuninstalled: _t.Callback
};

/*
 * Bluetooth
 */

_t.BluetoothAddress                          = _t.DOMString;
_t.BluetoothUUID                             = _t.DOMString;
_t.BluetoothDeviceSuccessCallback            = _t.Function;
_t.BluetoothDeviceArraySuccessCallback       = _t.Function;
_t.BluetoothSocketSuccessCallback            = _t.Function;
_t.BluetoothServiceSuccessCallback           = _t.Function;
_t.BluetoothHealthApplicationSuccessCallback = _t.Function;
_t.BluetoothHealthChannelSuccessCallback     = _t.Function;

_t.BluetoothClass = {
    major:      _t.octet,
    minor:      _t.octet,
    services:   [_t["unsigned short"]],
    hasService: _t.Function
};

_t.BluetoothDevice = {
    name:                   _t.DOMString,
    address:                _t.BluetoothAddress,
    deviceClass:            _t.BluetoothClass,
    isBonded:               _t.boolean,
    isTrusted:              _t.boolean,
    isConnected:            _t.boolean,
    uuids:                  [_t.BluetoothUUID],
    connectToServiceByUUID: _t.Function
};

_t.BluetoothHealthApplication = {
    dataType:   _t["unsigned short"],
    name:       _t.DOMString,
    onconnect:  _t.BluetoothHealthChannelSuccessCallback,
    unregister: _t.Function,

    _optional: {
        onconnect: true
    }
};

_t.BluetoothAdapterChangeCallback = {
    onstatechanged:      _t.Callback,
    onnamechanged:       _t.Callback,
    onvisibilitychanged: _t.Callback
};

_t.BluetoothDiscoverDevicesSuccessCallback = {
    onstarted:           _t.Callback,
    ondevicefound:       _t.Callback,
    ondevicedisappeared: _t.Callback,
    onfinished:          _t.Callback
};

_t.BluetoothHealthChannelChangeCallback = {
    onmessage: _t.Callback,
    onclose:   _t.Callback
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
 * Calendar
 */

_t.CalendarChangeCallback = {
    onitemsadded:   _t.Callback,
    onitemsupdated: _t.Callback,
    onitemsremoved: _t.Callback
};

/*
 * CallHistory
 */

_t.CallHistoryEntryArraySuccessCallback = _t.Callback;

_t.RemoteParty = {
    remoteParty: _t.DOMString,
    personId:    _t.PersonId
};

_t.CallHistoryEntry = {
    id:            _t.DOMString,
    type:          _t.DOMString,
    features:      [_t.DOMString],
    remoteParties: [_t.RemoteParty],
    startTime:     _t.Date,
    duration:      _t["unsigned long"],
    direction:     _t.DOMString
};

_t.CallHistoryChangeCallback = {
    onadded:   _t.Callback,
    onchanged: _t.Callback,
    onremoved: _t.Callback
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
    oncontactsadded:   _t.Callback,
    oncontactsupdated: _t.Callback,
    oncontactsremoved: _t.Callback
};

_t.PersonsChangeCallback = {
    onpersonsadded:   _t.Callback,
    onpersonsupdated: _t.Callback,
    onpersonsremoved: _t.Callback
};

_t.ContactInit = {
    name:          _t.ContactName,
    addresses:     [_t.ContactAddress],
    photoURI:      _t.DOMString,
    phoneNumbers:  [_t.ContactPhoneNumber],
    emails:        [_t.ContactEmailAddress],
    birthday:      _t.Date,
    anniversaries: [_t.ContactAnniversary],
    organizations: [_t.ContactOrganization],
    notes:         [_t.DOMString],
    urls:          [_t.ContactWebSite],
    ringtoneURI:   _t.DOMString,
    groupIds:      [_t.ContactGroupId],

    _dictionary: true
};

_t.ContactNameInit = {
    prefix:            _t.DOMString,
    suffix:            _t.DOMString,
    firstName:         _t.DOMString,
    middleName:        _t.DOMString,
    lastName:          _t.DOMString,
    nicknames:         [_t.DOMString],
    phoneticFirstName: _t.DOMString,
    phoneticLastName:  _t.DOMString,

    _dictionary: true
};

_t.ContactOrganizationInit = {
    name:       _t.DOMString,
    department: _t.DOMString,
    title:      _t.DOMString,
    role:       _t.DOMString,
    logoURI:    _t.DOMString,

    _dictionary: true
};

_t.ContactAddressInit = {
    country:               _t.DOMString,
    region:                _t.DOMString,
    city:                  _t.DOMString,
    streetAddress:         _t.DOMString,
    additionalInformation: _t.DOMString,
    postalCode:            _t.DOMString,
    isDefault:             _t.boolean,
    types:                 [_t.DOMString],

    _dictionary: true
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
    oncontentadded:   _t.Callback,
    oncontentupdated: _t.Callback,
    oncontentremoved: _t.Callback
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
 * Data Synchronization
 */

_t.SyncProfileId = _t.DOMString;

_t.SyncInfo = {
    url:      _t.DOMString,
    id:       _t.DOMString,
    password: _t.DOMString,
    mode:     _t.SyncMode,
    type:     _t.SyncType,
    interval: _t.SyncInterval,

    _optional: {
        // nullable
        id:       true,
        password: true,
        type:     true,
        interval: true
    }
};

_t.SyncServiceInfo = {
    enable:            _t.boolean,
    serviceType:       _t.SyncServiceType,
    serverDatabaseUri: _t.DOMString,
    id:                _t.DOMString,
    password:          _t.DOMString,

    _optional: {
        // nullable
        id:       true,
        password: true
    }
};

_t.SyncProfileInfo = {
    profileId:   _t.SyncProfileId,
    profileName: _t.DOMString,
    syncInfo:    _t.SyncInfo,
    serviceInfo: [_t.SyncServiceInfo],

    _optional: {
        // nullable
        profileId:   true,
        serviceInfo: true
    }
};

_t.SyncProgressCallback = {
    onprogress:  _t.Callback,
    oncompleted: _t.Callback,
    onstopped:   _t.Callback,
    onfailed:    _t.Callback
};

/*
 * Download
 */

_t.DownloadHTTPHeaderFields = {};

_t.DownloadRequest = {
    url:         _t.DOMString,
    destination: _t.DOMString,
    fileName:    _t.DOMString,
    networkType: _t.DownloadNetworkType,
    httpHeader:  _t.DownloadHTTPHeaderFields,

    _optional: {
        destination: true,
        fileName:    true,
        networkType: true,
        httpHeader:  true
    }
};

_t.DownloadCallback = {
    onprogress:  _t.Callback,
    onpaused:    _t.Callback,
    oncanceled:  _t.Callback,
    oncompleted: _t.Callback,
    onfailed:    _t.Callback
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
    messagesadded:   _t.Callback,
    messagesupdated: _t.Callback,
    messagesremoved: _t.Callback
};

_t.MessageConversationsChangeCallback = {
    conversationsadded:   _t.Callback,
    conversationsupdated: _t.Callback,
    conversationsremoved: _t.Callback
};

_t.MessageFoldersChangeCallback = {
    foldersadded:   _t.Callback,
    foldersupdated: _t.Callback,
    foldersremoved: _t.Callback
};

/*
 * Network Bearer Selection
 */

_t.NetworkSuccessCallback = {
    onsuccess:      _t.Callback,
    ondisconnected: _t.Callback
};

/*
 * NFC
 */

_t.NDEFMessageReadCallback  = _t.Function;
_t.ByteArraySuccessCallback = _t.Function;

_t.NFCTagDetectCallback = {
    onattach: _t.Callback,
    ondetach: _t.Callback
};

_t.NFCPeerDetectCallback = {
    onattach: _t.Callback,
    ondetach: _t.Callback
};

_t.NDEFRecordText = {
    text:         _t.DOMString,
    languageCode: _t.DOMString,
    encoding:     _t.NDEFRecordTextEncoding
};

_t.NDEFRecordURI = {
    uri: _t.DOMString
};

_t.NDEFRecordMedia = {
    mimeType: _t.DOMString
};

_t.NDEFRecord = {
    tnf:     _t.short,
    type:    [_t.byte],
    id:      [_t.byte],
    payload: [_t.byte],

    _derived: [_t.NDEFRecordText, _t.NDEFRecordURI, _t.NDEFRecordMedia]
};

_t.NDEFMessage = {
    recordCount: _t.long,
    records:     [_t.NDEFRecord],
    toByte:      _t.Function
};

/*
 * Notification
 */

_t.NotificationId = _t.DOMString;

_t.NotificationDetailInfo = {
    mainText: _t.DOMString,
    subText:  _t.DOMString,

    _optional: {
        // nullable
        subText: true
    }
};

_t.StatusNotificationInit = {
    content:             _t.DOMString,
    iconPath:            _t.DOMString,
    soundPath:           _t.DOMString,
    vibration:           _t.boolean,
    appControl:          _t.ApplicationControl,
    appId:               _t.ApplicationId,
    progressType:        _t.NotificationProgressType,
    progressValue:       _t["unsigned long"],
    number:              _t.long,
    subIconPath:         _t.DOMString,
    detailInfo:          [_t.NotificationDetailInfo],
    ledColor:            _t.DOMString,
    ledOnPeriod:         _t["unsigned long"],
    ledOffPeriod:        _t["unsigned long"],
    backgroundImagePath: _t.DOMString,
    thumbnails:          [_t.DOMString],

    _dictionary: true
};

_t.StatusNotification = {
    statusType:          _t.StatusNotificationType,
    iconPath:            _t.DOMString,
    subIconPath:         _t.DOMString,
    number:              _t.long,
    detailInfo:          [_t.NotificationDetailInfo],
    ledColor:            _t.DOMString,
    ledOnPeriod:         _t["unsigned long"],
    ledOffPeriod:        _t["unsigned long"],
    backgroundImagePath: _t.DOMString,
    thumbnails:          [_t.DOMString],
    soundPath:           _t.DOMString,
    vibration:           _t.boolean,
    appControl:          _t.ApplicationControl,
    appId:               _t.ApplicationId,
    progressType:        _t.NotificationProgressType,
    progressValue:       _t["unsigned long"],

    _optional: {
        // nullable
        iconPath:            true,
        subIconPath:         true,
        number:              true,
        detailInfo:          true,
        ledColor:            true,
        backgroundImagePath: true,
        thumbnails:          true,
        soundPath:           true,
        appControl:          true,
        appId:               true,
        progressValue:       true
    }
};

_t.Notification = {
    id:         _t.NotificationId,
    type:       _t.NotificationType,
    postedTime: _t.Date,
    title:      _t.DOMString,
    content:    _t.DOMString,

    _optional: {
        // nullable
        id:         true,
        postedTime: true,
        content:    true
    },

    _derived: [_t.StatusNotification]
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
_t.PackageInformationArraySuccessCallback = _t.Function;

_t.PackageProgressCallback = {
    onprogress: _t.Callback,
    oncomplete: _t.Callback
};

_t.PackageInfomationEventCallback = {
    oninstalled:   _t.Callback,
    onupdated:     _t.Callback,
    onuninstalled: _t.Callback
};

/*
 * System Info
 */

_t.SystemInfoPropertySuccessCallback = _t.Callback;

_t.SystemInfoOptions = {
    timeout:       _t["unsigned long"],
    highThreshold: _t.double,
    lowThreshold:  _t.double,

    _dictionary: true
};

/*
 * System Setting
 */

_t.SystemSettingSuccessCallback = _t.Function;

/*
 * Vehicle
 */
_t.SupportedPropertiesSuccessCallback = _t.Function;

_t.VehiclePropertyErrorCallback = _t.Function;

/*
 * Constructor list definition
 */

/*
 * Generic constructor
 *     Construct a prototype of constructor. A fake array of arguments type is
 *     specified for constructor.
 *
 * Overloaded constructors
 *     Construct an array of prototype of constructor. Each array element is
 *     specified for one of constructors. The constructor with extra arguments
 *     are recommended to be defined ahead of the one with fewer same arguments
 *     for exact match.
 */

_c = {
    // Alarm
    AlarmAbsolute: [],

    // Contact
    Contact:       [],

    // NFC
    NDEFMessage:   [],
    NDEFRecord:    [],

    // Data Synchronization
    SyncInfo:      []
};

/*
 * Common
 */

// AttributeFilter
_c.AttributeFilter = {
    0: _t.DOMString,
    1: _t.FilterMatchFlag,
    2: _t.any,

    _optional: {
        1: true,
        2: true
    }
};

// AttributeRangeFilter
_c.AttributeRangeFilter = {
    0: _t.DOMString,
    1: _t.any,
    2: _t.any,

    _optional: {
        1: true,
        2: true
    }
};

// CompositeFilter
_c.CompositeFilter = {
    0: _t.CompositeFilterType,
    1: [_t.AbstractFilter],

    _optional: {
        1: true
    }
};

// SortMode
_c.SortMode = {
    0: _t.DOMString,
    1: _t.SortModeOrder,

    _optional: {
        1: true
    }
};

// SimpleCoordinates
_c.SimpleCoordinates = {
    0: _t.double,
    1: _t.double
};

// TimeDuration
_c.TimeDuration = {
    0: _t["unsigned long long"],
    1: _t.TimeDurationUnit,

    _optional: {
        1: true
    }
};

/*
 * Alarm
 */

// AlarmRelative
_c.AlarmRelative = {
    0: _t.long,
    1: _t.long,

    _optional: {
        1: true
    }
};

// AlarmAbsolute
_c.AlarmAbsolute[0] = {
    0: _t.Date,
    1: [_t.ByDayValue]
};

_c.AlarmAbsolute[1] = {
    0: _t.Date,
    1: _t.long
};

_c.AlarmAbsolute[2] = {
    0: _t.Date
};

/*
 * Application
 */

// ApplicationControlData
_c.ApplicationControlData = {
    0: _t.DOMString,
    1: [_t.DOMString]
};

// ApplicationControl
_c.ApplicationControl = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.DOMString,
    3: _t.DOMString,
    4: [_t.ApplicationControlData],

    _optional: {
        1: true,
        2: true,
        3: true,
        4: true
    }
};

/*
 * Bookmark
 */

// BookmarkItem
_c.BookmarkItem = {
    0: _t.DOMString,
    1: _t.DOMString
};

// BookmarkFolder
_c.BookmarkFolder = {
    0: _t.DOMString
};

/*
 * Contact
 */

// Contact
_c.Contact[0] = {
    0: _t.ContactInit,

    _optional: {
        0: true
    }
};

_c.Contact[1] = {
    0: _t.DOMString
};

// ContactRef
_c.ContactRef = {
    0: _t.AddressBookId,
    1: _t.ContactId
};

// ContactName
_c.ContactName = {
    0: _t.ContactNameInit,

    _optional: {
        0: true
    }
};

// ContactOrganization
_c.ContactOrganization = {
    0: _t.ContactOrganizationInit,

    _optional: {
        0: true
    }
};

// ContactWebSite
_c.ContactWebSite = {
    0: _t.DOMString,
    1: _t.DOMString,

    _optional: {
        1: true
    }
};

// ContactAnniversary
_c.ContactAnniversary = {
    0: _t.Date,
    1: _t.DOMString,

    _optional: {
        1: true
    }
};

// ContactAddress
_c.ContactAddress = {
    0: _t.ContactAddressInit,

    _optional: {
        0: true
    }
};

// ContactPhoneNumber
_c.ContactPhoneNumber = {
    0: _t.DOMString,
    1: [_t.DOMString],
    2: _t.boolean,

    _optional: {
        1: true,
        2: true
    }
};

// ContactEmailAddress
_c.ContactEmailAddress = {
    0: _t.DOMString,
    1: [_t.DOMString],
    2: _t.boolean,

    _optional: {
        1: true,
        2: true
    }
};

// ContactGroup
_c.ContactGroup = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.DOMString,

    _optional: {
        1: true,
        2: true
    }
};

/*
 * Data Synchronization
 */

// SyncInfo
_c.SyncInfo[0] = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.DOMString,
    3: _t.SyncMode,
    4: _t.SyncType
};

_c.SyncInfo[1] = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.DOMString,
    3: _t.SyncMode,
    4: _t.SyncInterval
};

_c.SyncInfo[2] = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.DOMString,
    3: _t.SyncMode
};

// SyncServiceInfo
_c.SyncServiceInfo = {
    0: _t.boolean,
    1: _t.SyncServiceType,
    2: _t.DOMString,
    3: _t.DOMString,
    4: _t.DOMString,

    _optional: {
        3: true,
        4: true
    }
};

// SyncProfileInfo
_c.SyncProfileInfo = {
    0: _t.DOMString,
    1: _t.SyncInfo,
    2: [_t.SyncServiceInfo],

    _optional: {
        2: true
    }
};

/*
 * Download
 */

// DownloadRequest
_c.DownloadRequest = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.DOMString,
    3: _t.DownloadNetworkType,
    4: _t.DownloadHTTPHeaderFields,

    _optional: {
        1: true,
        2: true,
        3: true,
        4: true
    }
};

/*
 * NFC
 */

// NDEFMessage
_c.NDEFMessage[0] = {
    0: [_t.NDEFRecord]
};

_c.NDEFMessage[1] = {
    0: [_t.byte]
};

_c.NDEFMessage[2] = null;

// NDEFRecord
_c.NDEFRecord[0] = {
    0: _t.short,
    1: [_t.byte],
    2: [_t.byte],
    3: [_t.byte],

    _optional: {
        3: true
    }
};

_c.NDEFRecord[1] = {
    0: [_t.byte]
};

// NDEFRecordText
_c.NDEFRecordText = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.DOMString,

    _optional: {
        2: true
    }
};

// NDEFRecordURI
_c.NDEFRecordURI = {
    0: _t.DOMString
};

// NDEFRecordMedia
_c.NDEFRecordMedia = {
    0: _t.DOMString,
    1: [_t.byte]
};

/*
 * Notification
 */

// StatusNotification
_c.StatusNotification = {
    0: _t.StatusNotificationType,
    1: _t.DOMString,
    2: _t.StatusNotificationInit,

    _optional: {
        2: true
    }
};

// NotificationDetailInfo
_c.NotificationDetailInfo = {
    0: _t.DOMString,
    1: _t.DOMString,

    _optional: {
        1: true
    }
};

/*
 * Interface prototype definition
 */

_i = {
    // Alarm
    AlarmManager:                  {},

    // Application
    ApplicationManager:            {},
    Application:                   {},
    RequestedApplicationControl:   {},

    // Bluetooth
    BluetoothManager:              {},
    BluetoothAdapter:              {},
    BluetoothDevice:               {},
    BluetoothSocket:               {},
    BluetoothClass:                {},
    BluetoothServiceHandler:       {},
    BluetoothHealthProfileHandler: {},
    BluetoothHealthApplication:    {},
    BluetoothHealthChannel:        {},

    // Bookmark
    BookmarkManager:               {},

    // CallHistory
    CallHistory:                    {},

    // Contact
    ContactManager:                {},
    AddressBook:                   {},
    Person:                        {},
    Contact:                       {},

    // Content
    ContentManager:                {},

    // Data Control
    DataControlManager:            {},
    SQLDataControlConsumer:        {},
    MappedDataControlConsumer:     {},

    // Data Synchronization
    DataSynchronizationManager:    {},

    // Download
    DownloadManager:               {},

    // Network Bearer Selection
    NetworkBearerSelection:        {},

    // NFC
    NFCManager:                    {},
    NFCAdapter:                    {},
    NFCTag:                        {},
    NFCPeer:                       {},
    NDEFMessage:                   {},

    // Notification
    NotificationManager:           {},

    // Message
    Messaging:                     {},
    MessageService:                {},
    MessageStorage:                {},

    // Package
    PackageManager:                {},

    // Push
    PushManager:                   {},

    // System Info
    SystemInfo:                    {},

    // System Setting
    SystemSettingManager:          {},

    // Time
    TimeUtil:                      {},
    TZDate:                        {},
    TimeDuration:                  {},

    // Vehicle
    Vehicle:                       {}
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
 * Application
 */

// ApplicationManager
_i.ApplicationManager.getCurrentApplication = null;

_i.ApplicationManager.kill = {
    0: _t.ApplicationContextId,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.ApplicationManager.launch = {
    0: _t.ApplicationId,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.ApplicationManager.launchAppControl = {
    0: _t.ApplicationControl,
    1: _t.ApplicationId,
    2: _t.SuccessCallback,
    3: _t.ErrorCallback,
    4: _t.ApplicationControlDataArrayReplyCallback,

    _optional: {
        1: true,
        2: true,
        3: true,
        4: true
    }
};

_i.ApplicationManager.findAppControl = {
    0: _t.ApplicationControl,
    1: _t.FindAppControlSuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

_i.ApplicationManager.getAppsContext = {
    0: _t.ApplicationContextArraySuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        1: true
    }
};

_i.ApplicationManager.getAppContext = {
    0: _t.ApplicationContextId,

    _optional: {
        0: true
    }
};

_i.ApplicationManager.getAppsInfo = {
    0: _t.ApplicationInformationArraySuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        1: true
    }
};

_i.ApplicationManager.getAppInfo = {
    0: _t.ApplicationId,

    _optional: {
        0: true
    }
};

_i.ApplicationManager.getAppCerts = {
    0: _t.ApplicationId,

    _optional: {
        0: true
    }
};

_i.ApplicationManager.getAppSharedURI = {
    0: _t.ApplicationId,

    _optional: {
        0: true
    }
};

_i.ApplicationManager.getAppMetaData = {
    0: _t.ApplicationId,

    _optional: {
        0: true
    }
};

_i.ApplicationManager.addAppInfoEventListener = {
    0: _t.ApplicationInformationEventCallback
};

_i.ApplicationManager.removeAppInfoEventListener = {
    0: _t.long
};

// Application
_i.Application.exit = null;
_i.Application.hide = null;
_i.Application.getRequestedAppControl = null;

// RequestedApplicationControl
_i.RequestedApplicationControl.replyResult = {
    0: [_t.ApplicationControlData],

    _optional: {
        0: true
    }
};

_i.RequestedApplicationControl.replyFailure = null;

/*
 * Bluetooth
 */

// BluetoothManager
_i.BluetoothManager.getDefaultAdapter = null;

// BluetoothAdapter
_i.BluetoothAdapter.setName = {
    0: _t.DOMString,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.BluetoothAdapter.setPowered = {
    0: _t.boolean,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.BluetoothAdapter.setVisible = {
    0: _t.boolean,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,
    3: _t["unsigned short"],

    _optional: {
        1: true,
        2: true,
        3: true
    }
};

_i.BluetoothAdapter.setChangeListener = {
    0: _t.BluetoothAdapterChangeCallback
};

_i.BluetoothAdapter.unsetChangeListener = null;

_i.BluetoothAdapter.discoverDevices = {
    0: _t.BluetoothDiscoverDevicesSuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        1: true
    }
};

_i.BluetoothAdapter.stopDiscovery = {
    0: _t.SuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        0: true,
        1: true
    }
};

_i.BluetoothAdapter.getKnownDevices = {
    0: _t.BluetoothDeviceArraySuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        1: true
    }
};

_i.BluetoothAdapter.getDevice = {
    0: _t.BluetoothAddress,
    1: _t.BluetoothDeviceSuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

_i.BluetoothAdapter.createBonding = {
    0: _t.BluetoothAddress,
    1: _t.BluetoothDeviceSuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

_i.BluetoothAdapter.destroyBonding = {
    0: _t.BluetoothAddress,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.BluetoothAdapter.registerRFCOMMServiceByUUID = {
    0: _t.BluetoothUUID,
    1: _t.DOMString,
    2: _t.BluetoothServiceSuccessCallback,
    3: _t.ErrorCallback,

    _optional: {
        3: true
    }
};

_i.BluetoothAdapter.getBluetoothProfileHandler = {
    0: _t.BluetoothProfileType
};

// BluetoothDevice
_i.BluetoothDevice.connectToServiceByUUID = {
    0: _t.BluetoothUUID,
    1: _t.BluetoothSocketSuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

// BluetoothSocket
_i.BluetoothSocket.readData = null;
_i.BluetoothSocket.close = null;

_i.BluetoothSocket.writeData = {
    0: [_t.byte]
};

// BluetoothClass
_i.BluetoothClass.hasService = {
    0: _t["unsigned short"]
};

// BluetoothServiceHandler
_i.BluetoothServiceHandler.unregister = {
    0: _t.SuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        0: true,
        1: true
    }
};

// BluetoothHealthProfileHandler
_i.BluetoothHealthProfileHandler.registerSinkApplication = {
    0: _t["unsigned short"],
    1: _t.DOMString,
    2: _t.BluetoothHealthApplicationSuccessCallback,
    3: _t.ErrorCallback,

    _optional: {
        3: true
    }
};

_i.BluetoothHealthProfileHandler.connectToSource = {
    0: _t.BluetoothDevice,
    1: _t.BluetoothHealthApplication,
    2: _t.BluetoothHealthChannelSuccessCallback,
    3: _t.ErrorCallback,

    _optional: {
        3: true
    }
};

// BluetoothHealthApplication
_i.BluetoothHealthApplication.unregister = {
    0: _t.SuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        0: true,
        1: true
    }
};

// BluetoothHealthChannel
_i.BluetoothHealthChannel.close = null;
_i.BluetoothHealthChannel.unsetListener = null;

_i.BluetoothHealthChannel.sendData = {
    0: [_t.byte]
};

_i.BluetoothHealthChannel.setListener = {
    0: _t.BluetoothHealthChannelChangeCallback
};

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
 * CallHistory
 */

// CallHistory
_i.CallHistory.find = {
    0: _t.CallHistoryEntryArraySuccessCallback,
    1: _t.ErrorCallback,
    2: _t.AbstractFilter,
    3: _t.SortMode,
    4: _t["unsigned long"],
    5: _t["unsigned long"],

    _optional: {
        1: true,
        2: true,
        3: true,
        4: true,
        5: true
    }
};

_i.CallHistory.remove = {
    0: _t.CallHistoryEntry
};

_i.CallHistory.removeBatch = {
    0: [_t.CallHistoryEntry],
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.CallHistory.removeAll = {
    0: _t.SuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        0: true,
        1: true
    }
};

_i.CallHistory.addChangeListener = {
    0: _t.CallHistoryChangeCallback
};

_i.CallHistory.removeChangeListener = {
    0: _t.long
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

// Contact
_i.Contact.convertToString = {
    0: _t.ContactTextFormat,

    _optional: {
        0: true
    }
};

_i.Contact.clone = null;

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

/*
 * Data Synchronization
 */

// DataSynchronizationManager
_i.DataSynchronizationManager.getMaxProfilesNum = null;
_i.DataSynchronizationManager.getProfilesNum    = null;
_i.DataSynchronizationManager.getAll            = null;

_i.DataSynchronizationManager.add = {
    0: _t.SyncProfileInfo
};

_i.DataSynchronizationManager.update = {
    0: _t.SyncProfileInfo
};

_i.DataSynchronizationManager.remove = {
    0: _t.SyncProfileId
};

_i.DataSynchronizationManager.get = {
    0: _t.SyncProfileId
};

_i.DataSynchronizationManager.startSync = {
    0: _t.SyncProfileId,
    1: _t.SyncProgressCallback,

    _optional: {
        1: true
    }
};

_i.DataSynchronizationManager.stopSync = {
    0: _t.SyncProfileId
};

_i.DataSynchronizationManager.getLastSyncStatistics = {
    0: _t.SyncProfileId
};

/*
 * Download
 */

// DownloadManager
_i.DownloadManager.start = {
    0: _t.DownloadRequest,
    1: _t.DownloadCallback,

    _optional: {
        1: true
    }
};

_i.DownloadManager.cancel = {
    0: _t.long
};

_i.DownloadManager.pause = {
    0: _t.long
};

_i.DownloadManager.resume = {
    0: _t.long
};

_i.DownloadManager.getState = {
    0: _t.long
};

_i.DownloadManager.getDownloadRequest = {
    0: _t.long
};

_i.DownloadManager.getMIMEType = {
    0: _t.long
};

_i.DownloadManager.setListener = {
    0: _t.long,
    1: _t.DownloadCallback
};

/*
 * Network Bearer Selection
 */

// NetworkBearerSelection
_i.NetworkBearerSelection.requestRouteToHost = {
    0: _t.NetworkType,
    1: _t.DOMString,
    2: _t.NetworkSuccessCallback,
    3: _t.ErrorCallback,

    _optional: {
        3: true
    }
};

_i.NetworkBearerSelection.releaseRouteToHost = {
    0: _t.NetworkType,
    1: _t.DOMString,
    2: _t.SuccessCallback,
    3: _t.ErrorCallback,

    _optional: {
        3: true
    }
};

/*
 * NFC
 */

// NFCManager
_i.NFCManager.getDefaultAdapter = null;
_i.NFCManager.setExclusiveMode = {
    0: _t.boolean
};

// NFCAdapter
_i.NFCAdapter.setPowered = {
    0: _t.boolean,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.NFCAdapter.setTagListener = {
    0: _t.NFCTagDetectCallback,
    1: [_t.NFCTagType],

    _optional: {
        1: true
    }
};

_i.NFCAdapter.setPeerListener = {
    0: _t.NFCPeerDetectCallback
};

_i.NFCAdapter.unsetTagListener  = null;
_i.NFCAdapter.unsetPeerListener = null;
_i.NFCAdapter.getCachedMessage  = null;

// NFCTag
_i.NFCTag.readNDEF = {
    0: _t.NDEFMessageReadCallback,
    1: _t.ErrorCallback,

    _optional: {
        1: true
    }
};

_i.NFCTag.writeNDEF = {
    0: _t.NDEFMessage,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

_i.NFCTag.transceive = {
    0: [_t.byte],
    1: _t.ByteArraySuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

// NFCPeer
_i.NFCPeer.setReceiveNDEFListener = {
    0: _t.NDEFMessageReadCallback
};

_i.NFCPeer.unsetReceiveNDEFListener = null;

_i.NFCPeer.sendNDEF = {
    0: _t.NDEFMessage,
    1: _t.SuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        1: true,
        2: true
    }
};

// NDEFMessage
_i.NDEFMessage.toByte = null;

/*
 * Notification
 */

// NotificationManager
_i.NotificationManager.post = {
    0: _t.Notification
};

_i.NotificationManager.update = {
    0: _t.Notification
};

_i.NotificationManager.remove = {
    0: _t.NotificationId
};

_i.NotificationManager.get = {
    0: _t.NotificationId
};

_i.NotificationManager.removeAll = null;
_i.NotificationManager.getAll = null;

/*
 * Package
 */

// PackageManager
_i.PackageManager.install = {
    0: _t.DOMString,
    1: _t.PackageProgressCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

_i.PackageManager.uninstall = {
    0: _t.PackageId,
    1: _t.PackageProgressCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

_i.PackageManager.getPackagesInfo = {
    0: _t.PackageInformationArraySuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        1: true
    }
};

_i.PackageManager.getPackageInfo = {
    0: _t.PackageId,

    _optional: {
        0: true
    }
};

_i.PackageManager.setPackageInfoEventListener = {
    0: _t.PackageInfomationEventCallback
};

_i.PackageManager.unsetPackageInfoEventListener = null;

/*
 * Push
 */

// PushManager
_i.PushManager.registerService = {
    0: _t.ApplicationControl,
    1: _t.PushRegisterSuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

_i.PushManager.unregisterService = {
    0: _t.SuccessCallback,
    1: _t.ErrorCallback,

    _optional: {
        0: true,
        1: true
    }
};

_i.PushManager.connectService = {
    0: _t.PushNotificationCallback
};

_i.PushManager.disconnectService = null;
_i.PushManager.getRegistrationId = null;

/*
 * System Info
 */

// SystemInfo
_i.SystemInfo.getCapabilities = null;

_i.SystemInfo.getPropertyValue = {
    0: _t.SystemInfoPropertyId,
    1: _t.SystemInfoPropertySuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

_i.SystemInfo.addPropertyValueChangeListener = {
    0: _t.SystemInfoPropertyId,
    1: _t.SystemInfoPropertySuccessCallback,
    2: _t.SystemInfoOptions,

    _optional: {
        2: true
    }
};

_i.SystemInfo.removePropertyValueChangeListener = {
    0: _t["unsigned long"]
};

/*
 * System Setting
 */

// SystemSettingManager
_i.SystemSettingManager.setProperty = {
    0: _t.SystemSettingType,
    1: _t.DOMString,
    2: _t.SuccessCallback,
    3: _t.ErrorCallback,

    _optional: {
        3: true
    }
};

_i.SystemSettingManager.getProperty = {
    0: _t.SystemSettingType,
    1: _t.SystemSettingSuccessCallback,
    2: _t.ErrorCallback,

    _optional: {
        2: true
    }
};

/*
 * Time
 */

// TimeUtil
_i.TimeUtil.getCurrentDateTime = null;
_i.TimeUtil.getLocalTimezone = null;
_i.TimeUtil.getAvailableTimezones = null;
_i.TimeUtil.getDateFormat = {
    0: _t.boolean,

    _optional: {
        0: true
    }
};

_i.TimeUtil.getTimeFormat = null;
_i.TimeUtil.isLeapYear = {
    0: _t.long
};

// TimeDuration
_i.TimeDuration.difference = {
    0: _t.TimeDuration
};

_i.TimeDuration.equalsTo = {
    0: _t.TimeDuration
};

_i.TimeDuration.lessThan = {
    0: _t.TimeDuration
};

_i.TimeDuration.greaterThan = {
    0: _t.TimeDuration
};

_i.Vehicle.getSupported = {
    0: _t.SupportedPropertiesSuccessCallback,
    1: _t.VehiclePropertyErrorCallback
}

// Exports
_t.constructor = _c;
_t.interface   = _i;

module.exports = _t;
