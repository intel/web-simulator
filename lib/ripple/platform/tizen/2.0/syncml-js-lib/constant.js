// -*- coding: utf-8 -*-
//-----------------------------------------------------------------------------
// file: $Id$
// desc: SyncML constants
// auth: metagriffin <metagriffin@uberdev.org>
// date: 2012/10/13
// copy: (C) CopyLoose 2012 UberDev <hardcore@uberdev.org>, No Rights Reserved.
//-----------------------------------------------------------------------------

var _self = {
    // SyncML versions
    SYNCML_VERSION_1_0                      : 'SyncML/1.0',
    SYNCML_VERSION_1_1                      : 'SyncML/1.1',
    SYNCML_VERSION_1_2                      : 'SyncML/1.2',
    SYNCML_DTD_VERSION_1_0                  : '1.0',
    SYNCML_DTD_VERSION_1_1                  : '1.1',
    SYNCML_DTD_VERSION_1_2                  : '1.2',

    // SyncML alert/sync codes
    ALERT_DISPLAY                           : 100,
    ALERT_TWO_WAY                           : 200,
    ALERT_SLOW_SYNC                         : 201,
    ALERT_ONE_WAY_FROM_CLIENT               : 202,
    ALERT_REFRESH_FROM_CLIENT               : 203,
    ALERT_ONE_WAY_FROM_SERVER               : 204,
    ALERT_REFRESH_FROM_SERVER               : 205,
    ALERT_TWO_WAY_BY_SERVER                 : 206,
    ALERT_ONE_WAY_FROM_CLIENT_BY_SERVER     : 207,
    ALERT_REFRESH_FROM_CLIENT_BY_SERVER     : 208,
    ALERT_ONE_WAY_FROM_SERVER_BY_SERVER     : 209,
    ALERT_REFRESH_FROM_SERVER_BY_SERVER     : 210,
    // alert codes 211-220 are reserved for future use

    // SyncML SyncCap SyncTypes
    SYNCTYPE_AUTO                           : null,
    SYNCTYPE_TWO_WAY                        : 1,
    SYNCTYPE_SLOW_SYNC                      : 2,
    SYNCTYPE_ONE_WAY_FROM_CLIENT            : 3,
    SYNCTYPE_REFRESH_FROM_CLIENT            : 4,
    SYNCTYPE_ONE_WAY_FROM_SERVER            : 5,
    SYNCTYPE_REFRESH_FROM_SERVER            : 6,
    SYNCTYPE_SERVER_ALERTED                 : 7,

    // Special syncml-js SyncTypes
    SYNCTYPE_DISCOVER                       : 'discover',

    // SyncML synctype-to-alertcode mapping
    // taking advantage of the fact that 1..7 maps to 200..206
    // (more or less... "7" is a bit "nebulous"...)
    SyncTypeToAlert: _.object(_.map(_.range(7), function(i) {
        return [ i + 1, i + 200 ];
    })),

    // Conflict handling policies
    POLICY_ERROR                            : 1,
    POLICY_CLIENT_WINS                      : 2,
    POLICY_SERVER_WINS                      : 3,

    // SyncML XML namespaces
    NAMESPACE_SYNCML_1_0                    : 'syncml:syncml1.0',
    NAMESPACE_SYNCML_1_1                    : 'syncml:syncml1.1',
    NAMESPACE_SYNCML_1_2                    : 'syncml:syncml1.2',
    NAMESPACE_METINF                        : 'syncml:metinf',
    NAMESPACE_DEVINF                        : 'syncml:devinf',
    NAMESPACE_AUTH_BASIC                    : 'syncml:auth-basic',
    NAMESPACE_AUTH_MD5                      : 'syncml:auth-md5',
    NAMESPACE_FILTER_CGI                    : 'syncml:filtertype-cgi',

    // Commonly used content-types
    TYPE_TEXT_PLAIN                         : 'text/plain',
    TYPE_VCARD_V21                          : 'text/x-vcard',
    TYPE_VCARD_V30                          : 'text/vcard',
    TYPE_VCALENDAR                          : 'text/x-vcalendar',
    TYPE_ICALENDAR                          : 'text/calendar',
    TYPE_MESSAGE                            : 'text/message',
    TYPE_SYNCML                             : 'application/vnd.syncml',
    TYPE_SYNCML_DEVICE_INFO                 : 'application/vnd.syncml-devinf',
    TYPE_SYNCML_ICALENDAR                   : 'application/vnd.syncml-xcal',
    TYPE_SYNCML_EMAIL                       : 'application/vnd.syncml-xmsg',
    TYPE_SYNCML_BOOKMARK                    : 'application/vnd.syncml-xbookmark',
    TYPE_SYNCML_RELATIONAL_OBJECT           : 'application/vnd.syncml-xrelational',
    TYPE_OMADS_FOLDER                       : 'application/vnd.omads-folder',
    TYPE_OMADS_FILE                         : 'application/vnd.omads-file',
    TYPE_OMADS_EMAIL                        : 'application/vnd.omads-email',
    TYPE_SQL                                : 'application/sql',
    TYPE_LDAP                               : 'text/directory',
    TYPE_EMAIL                              : 'message/rfc2822',
    TYPE_EMAIL_822                          : 'message/rfc822',
    TYPE_SIF_CONTACT                        : 'text/x-s4j-sifc',
    TYPE_SIF_NOTE                           : 'text/x-s4j-sifn',
    TYPE_SIF_TASK                           : 'text/x-s4j-sift',
    TYPE_SIF_EVENT                          : 'text/x-s4j-sife',

    // non-agent URI paths
    URI_DEVINFO_1_0                         : 'devinf10',
    URI_DEVINFO_1_1                         : 'devinf11',
    URI_DEVINFO_1_2                         : 'devinf12',

    // Response codes - Generic
    STATUS_INVALID_CODE                     : 0,
    // Response codes - Informational 1xx
    STATUS_IN_PROGRESS                      : 101,
    // Response codes - Successful 2xx
    STATUS_OK                               : 200,
    STATUS_ITEM_ADDED                       : 201,
    STATUS_ACCEPTED_FOR_PROCESSING          : 202,
    STATUS_NONAUTHORIATATIVE_RESPONSE       : 203,
    STATUS_NO_CONTENT                       : 204,
    STATUS_RESET_CONTENT                    : 205,
    STATUS_PARTIAL_CONTENT                  : 206,
    STATUS_CONFLICT_RESOLVED_MERGE          : 207,
    STATUS_CONFLICT_RESOLVED_CLIENT_DATA    : 208,
    STATUS_CONFLICT_RESOLVED_DUPLICATE      : 209,
    STATUS_DELETE_WITHOUT_ARCHIVE           : 210,
    STATUS_ITEM_NOT_DELETED                 : 211,
    STATUS_AUTHENTICATION_ACCEPTED          : 212,
    STATUS_CHUNKED_ITEM_ACCEPTED            : 213,
    STATUS_OPERATION_CANCELLED_OK           : 214,
    STATUS_NOT_EXECUTED                     : 215,
    STATUS_ATOMIC_ROLLBACK_OK               : 216,
    STATUS_RESULT_ALERT                     : 221,
    STATUS_NEXT_MESSAGE                     : 222,
    STATUS_NO_END_OF_DATA                   : 223,
    STATUS_SUSPEND                          : 224,
    STATUS_RESUME                           : 225,
    STATUS_DATA_MANAGEMENT                  : 226,
    // status codes 227-250 are reserved for future use,
    // Response codes - Redirection 3xx
    STATUS_MULTIPLE_CHOICES                 : 300,
    STATUS_MOVED_PERMANENTLY                : 301,
    STATUS_FOUND                            : 302,
    STATUS_SEE_ANOTHER_URI                  : 303,
    STATUS_NOT_MODIFIED                     : 304,
    STATUS_USE_PROXY                        : 305,
    // Response codes - Originator Exceptions 4xx
    STATUS_BAD_REQUEST                      : 400,
    STATUS_INVALID_CREDENTIALS              : 401,
    STATUS_PAYMENT_REQUIRED                 : 402,
    STATUS_FORBIDDEN                        : 403,
    STATUS_NOT_FOUND                        : 404,
    STATUS_COMMAND_NOT_ALLOWED              : 405,
    STATUS_OPTIONAL_FEATURE_NOT_SUPPORTED   : 406,
    STATUS_MISSING_CREDENTIALS              : 407,
    STATUS_REQUEST_TIMEOUT                  : 408,
    STATUS_UPDATE_CONFLICT                  : 409,
    STATUS_GONE                             : 410,
    STATUS_SIZE_REQUIRED                    : 411,
    STATUS_INCOMPLETE_COMMAND               : 412,
    STATUS_REQUESTED_ENTITY_TOO_LARGE       : 413,
    STATUS_URI_TOO_LONG                     : 414,
    STATUS_UNSUPPORTED_MEDIA_TYPE           : 415,
    STATUS_REQUESTED_SIZE_TOO_BIG           : 416,
    STATUS_RETRY_LATER                      : 417,
    STATUS_ALREADY_EXISTS                   : 418,
    STATUS_CONFLICT_RESOLVED_SERVER_DATA    : 419,
    STATUS_DEVICE_FULL                      : 420,
    STATUS_UNKNOWN_SEARCH_GRAMMAR           : 421,
    STATUS_BAD_CGI_SCRIPT                   : 422,
    STATUS_SOFT_DELETE_CONFLICT             : 423,
    STATUS_OBJECT_SIZE_MISMATCH             : 424,
    STATUS_PERMISSION_DENIED                : 425,
    // Response codes - Recipient Exceptions 5xx
    STATUS_COMMAND_FAILED                   : 500,
    STATUS_NOT_IMPLEMENTED                  : 501,
    STATUS_BAD_GATEWAY                      : 502,
    STATUS_SERVICE_UNAVAILABLE              : 503,
    STATUS_GATEWAY_TIMEOUT                  : 504,
    STATUS_VERSION_NOT_SUPPORTED            : 505,
    STATUS_PROCESSING_ERROR                 : 506,
    STATUS_ATOMIC_FAILED                    : 507,
    STATUS_REFRESH_REQUIRED                 : 508,
    STATUS_RECIPIENT_EXCEPTION_RESERVED1    : 509,
    STATUS_DATASTORE_FAILURE                : 510,
    STATUS_SERVER_FAILURE                   : 511,
    STATUS_SYNCHRONIZATION_FAILED           : 512,
    STATUS_PROTOCOL_VERSION_NOT_SUPPORTED   : 513,
    STATUS_OPERATION_CANCELLED              : 514,
    STATUS_ATOMIC_ROLLBACK_FAILED           : 516,
    STATUS_ATOMIC_RESPONSE_TOO_LARGE_TO_FIT : 517,

    // SyncML codecs
    CODEC_XML                               : 'xml',
    CODEC_WBXML                             : 'wbxml',
    FORMAT_B64                              : 'b64',
    FORMAT_AUTO                             : 'auto',

    // SyncML nodes
    NODE_SYNCML                             : 'SyncML',
    NODE_SYNCBODY                           : 'SyncBody',

    // SyncML commands
    CMD_SYNCHDR                             : 'SyncHdr',
    CMD_SYNC                                : 'Sync',
    CMD_ALERT                               : 'Alert',
    CMD_STATUS                              : 'Status',
    CMD_GET                                 : 'Get',
    CMD_PUT                                 : 'Put',
    CMD_ADD                                 : 'Add',
    CMD_REPLACE                             : 'Replace',
    CMD_DELETE                              : 'Delete',
    CMD_RESULTS                             : 'Results',
    CMD_ATOMIC                              : 'Atomic',
    CMD_COPY                                : 'Copy',
    CMD_EXEC                                : 'Exec',
    CMD_MAP                                 : 'Map',
    CMD_MAPITEM                             : 'MapItem',
    CMD_SEARCH                              : 'Search',
    CMD_SEQUENCE                            : 'Sequence',
    CMD_FINAL                               : 'Final',

    // SyncML standard device types
    DEVTYPE_HANDHELD                        : 'handheld',
    DEVTYPE_PAGER                           : 'pager',
    DEVTYPE_PDA                             : 'pda',
    DEVTYPE_PHONE                           : 'phone',
    DEVTYPE_SERVER                          : 'server',
    DEVTYPE_SMARTPHONE                      : 'smartphone',
    DEVTYPE_WORKSTATION                     : 'workstation',

    // Item status codes
    ITEM_OK                                 : 0,
    ITEM_ADDED                              : 1,
    ITEM_MODIFIED                           : 2,
    ITEM_DELETED                            : 3,
    ITEM_SOFTDELETED                        : 4,
};

module.exports = _self;
