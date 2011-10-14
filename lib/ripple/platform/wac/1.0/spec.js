module.exports = {

    id: "wac",
    version: "1.0",
    name: "WAC",
    type: "plaform",

    persistencePrefix: "wac-",

    config: require('ripple/platform/wac/1.0/spec/config'),
    device: require('ripple/platform/wac/1.0/spec/device'),
    ui: require('ripple/platform/wac/1.0/spec/ui'),
    events: require('ripple/platform/wac/1.0/spec/events'),

    objects: {
        navigator: {
            path: "w3c/1.0/navigator"
        },
        WidgetManager: {
            path: "wac/1.0/WidgetManager",
            feature: "http://jil.org/jil/api/1.1.1/widgetmanager"
        },
        Widget: {
            path: "wac/1.0/Widget",
            feature: "http://jil.org/jil/api/1.1/widget",
            children: {
                Device: {
                    path: "wac/1.0/Device",
                    feature: "http://jil.org/jil/api/1.1/device",
                    children: {
                        AccountInfo: {
                            path: "wac/1.0/AccountInfo",
                            feature: "http://jil.org/jil/api/1.1/accountinfo"
                        },
                        ApplicationTypes: {
                            path: "wac/1.0/ApplicationTypes",
                            feature: "http://jil.org/jil/api/1.1.5/applicationtypes"
                        },
                        DataNetworkInfo: {
                            path: "wac/1.0/DataNetworkInfo",
                            feature: "http://jil.org/jil/api/1.1.1/datanetworkinfo",
                            children: {
                                DataNetworkConnectionTypes: {
                                    path: "wac/1.0/DataNetworkConnectionTypes"
                                }
                            }
                        },
                        DeviceInfo: {
                            path: "wac/1.0/DeviceInfo",
                            feature: "http://jil.org/jil/api/1.1/deviceinfo"
                        },
                        DeviceStateInfo: {
                            path: "wac/1.0/DeviceStateInfo",
                            feature: "http://jil.org/jil/api/1.1/devicestateinfo",
                            children: {
                                Config: {
                                    path: "wac/1.0/Config",
                                    feature: "http://jil.org/jil/api/1.1/config"
                                },
                                AccelerometerInfo: {
                                    path: "wac/1.0/AccelerometerInfo",
                                    feature: "http://jil.org/jil/api/1.1/accelerometerinfo"
                                }
                            }
                        },
                        File: {
                            path: "wac/1.0/File",
                            feature: "http://jil.org/jil/api/1.1.1/file"
                        },
                        PositionInfo: {
                            path: "wac/1.0/PositionInfo",
                            feature: "http://jil.org/jil/api/1.1/positioninfo"
                        },
                        RadioInfo: {
                            path: "wac/1.0/RadioInfo",
                            feature: "http://jil.org/jil/api/1.1.1/radioinfo",
                            children: {
                                RadioSignalSourceTypes: {
                                    path: "wac/1.0/RadioSignalSourceTypes",
                                    feature: "http://jil.org/jil/api/1.1.5/radiosignalsourcetypes"
                                }
                            }
                        },
                        PowerInfo: {
                            path: "wac/1.0/PowerInfo",
                            feature: "http://jil.org/jil/api/1.1/powerinfo"
                        }
                    }
                },
                ExceptionTypes: {
                    path: "wac/1.0/ExceptionTypes",
                    feature: "http://jil.org/jil/api/1.1.5/exceptiontypes"
                },
                Exception: {
                    path: "wac/1.0/Exception",
                    feature: "http://jil.org/jil/api/1.1.5/exception"
                },
                Multimedia: {
                    path: "wac/1.0/Multimedia",
                    feature: "http://jil.org/jil/api/1.1/multimedia",
                    children: {
                        Camera: {
                            path: "wac/1.0/Camera",
                            feature: "http://jil.org/jil/api/1.1.2/camera"
                        },
                        AudioPlayer: {
                            path: "wac/1.0/AudioPlayer",
                            feature: "http://jil.org/jil/api/1.1/audioplayer"
                        },
                        VideoPlayer: {
                            path: "wac/1.0/VideoPlayer",
                            feature: "http://jil.org/jil/api/1.1.2/videoplayer"
                        }
                    }
                },
                Telephony: {
                    path: "wac/1.0/Telephony",
                    feature: "http://jil.org/jil/api/1.1.1/telephony",
                    children: {
                        CallRecord: {
                            path: "wac/1.0/CallRecord",
                            feature: "http://jil.org/jil/api/1.1/callrecord"
                        },
                        CallRecordTypes: {
                            path: "wac/1.0/CallRecordTypes",
                            feature: "http://jil.org/jil/api/1.1.1/callrecordtypes"
                        }
                    }
                },
                PIM: {
                    path: "wac/1.0/PIM",
                    feature: "http://jil.org/jil/api/1.1.1/pim",
                    children: {
                        AddressBookItem: {
                            path: "wac/1.0/AddressBookItem",
                            feature: "http://jil.org/jil/api/1.1/addressbookitem"
                        },
                        CalendarItem: {
                            path: "wac/1.0/CalendarItem",
                            feature: "http://jil.org/jil/api/1.1/calendaritem"
                        },
                        EventRecurrenceTypes: {
                            path: "wac/1.0/EventRecurrenceTypes",
                            feature: "http://jil.org/jil/api/1.1/eventrecurrencetypes"
                        }
                    }
                },
                Messaging: {
                    path: "wac/1.0/Messaging",
                    feature: "http://jil.org/jil/api/1.1/messaging",
                    children: {
                        Account: {
                            path: "wac/1.0/Account",
                            feature: "http://jil.org/jil/api/1.1/account"
                        },
                        Attachment: {
                            path: "wac/1.0/Attachment",
                            feature: "http://jil.org/jil/api/1.1/attachment"
                        },
                        Message: {
                            path: "wac/1.0/Message",
                            feature: "http://jil.org/jil/api/1.1/message"
                        },
                        MessageFolderTypes: {
                            path: "wac/1.0/MessageFolderTypes",
                            feature: "http://jil.org/jil/api/1.1.4/messagefoldertypes"
                        },
                        MessageQuantities: {
                            path: "wac/1.0/MessageQuantities",
                            feature: "http://jil.org/jil/api/1.1/messagequantities"
                        },
                        MessageTypes: {
                            path: "wac/1.0/MessageTypes",
                            feature: "http://jil.org/jil/api/1.1/messagetypes"
                        }
                    }
                }
            }
        }
    }

};
