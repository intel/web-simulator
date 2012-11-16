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

module.exports = {

    id: "tizen",
    version: "2.0",
    name: "TIZEN",

    persistencePrefix: "tizen1-",

    config: require('ripple/platform/tizen/2.0/spec/config'),
    ui: require('ripple/platform/tizen/2.0/spec/ui'),
    device: require('ripple/platform/tizen/2.0/spec/device'),
    sensor: require('ripple/platform/tizen/2.0/spec/sensor'),
    DeviceMotionEvent: require('ripple/platform/tizen/2.0/DeviceMotionEvent'),
    DeviceOrientationEvent: require('ripple/platform/tizen/2.0/DeviceOrientationEvent'),

    objects: {
        Coordinates: {
            path: "w3c/1.0/Coordinates"
        },
        Position: {
            path: "w3c/1.0/Position"
        },
        PositionError: {
            path: "w3c/1.0/PositionError"
        },
        SensorConnection: {
            path: "w3c/1.0/SensorConnection"
        },
        navigator: {
            path: "tizen/2.0/navigator",
            children: {
                geolocation: {
                    path: "wac/2.0/geolocation",
                    feature: "http://www.w3.org/TR/geolocation-API/"
                },
                battery: {
                    path: "tizen/2.0/battery",
                    feature: "http://www.w3.org/TR/battery-status/"
                }
            }
        },
        tizen: {
            feature: "http://tizen.org/api/tizen",
            children: {
                CompositeFilter: {
                    path: "tizen/2.0/CompositeFilter"
                },
                AttributeFilter: {
                    path: "tizen/2.0/AttributeFilter"
                },
                AttributeRangeFilter: {
                    path: "tizen/2.0/AttributeRangeFilter"
                },
                SortMode: {
                    path: "tizen/2.0/SortMode"
                },
                alarm: {
                    path: "tizen/2.0/alarm",
                    feature: "http://tizen.org/api/alarm|http://tizen.org/api/alarm.read|http://tizen.org/api/alarm.write",
                    handleSubfeatures: true
                },
                AlarmRelative: {
                    path: "tizen/2.0/AlarmRelative"
                },
                AlarmAbsolute: {
                    path: "tizen/2.0/AlarmAbsolute"
                },
                download: {
                    path: "tizen/2.0/download",
                    feature: "http://tizen.org/api/download"
                },
                URLDownload: {
                    path: "tizen/2.0/URLDownload",
                },
                notification: {
                    path: "tizen/2.0/notification",
                    feature: "http://tizen.org/api/notification",
                },
                StatusNotification: {
                    path: "tizen/2.0/StatusNotification"
                },
                Account: {
                    path: "tizen/2.0/AccountBase"
                },
                AccountService: {
                    path: "tizen/2.0/AccountService"
                },
                account: {
                    path: "tizen/2.0/account",
                    feature: "http://tizen.org/api/account"
                },
                application: {
                    path: "tizen/2.0/application",
                    feature: "http://tizen.org/api/application|http://tizen.org/api/application.launch|http://tizen.org/api/application.kill|http://tizen.org/api/application.read",
                    handleSubfeatures: true
                },
                ApplicationService: {
                    path: "tizen/2.0/ApplicationService"
                },
                ApplicationServiceData: {
                    path: "tizen/2.0/ApplicationServiceData"
                },
                /*
                bluetooth: {
                    path: "tizen/2.0/bluetooth",
                    feature: "http://tizen.org/api/bluetooth|http://tizen.org/api/bluetooth.admin|http://tizen.org/api/bluetooth.gap|http://tizen.org/api/bluetooth.spp",
                    handleSubfeatures: true
                },
                */
                ContactName: {
                    path: "tizen/2.0/ContactName"
                },
                ContactOrganization: {
                    path: "tizen/2.0/ContactOrganization"
                },
                ContactWebSite: {
                    path: "tizen/2.0/ContactWebSite"
                },
                ContactAnniversary: {
                    path: "tizen/2.0/ContactAnniversary"
                },
                ContactAccount: {
                    path: "tizen/2.0/ContactAccount"
                },
                ContactAddress: {
                    path: "tizen/2.0/ContactAddress"
                },
                ContactPhoneNumber: {
                    path: "tizen/2.0/ContactPhoneNumber"
                },
                ContactEmailAddress: {
                    path: "tizen/2.0/ContactEmailAddress"
                },
                ContactRef: {
                    path: "tizen/2.0/ContactRef"
                },
                Contact: {
                    path: "tizen/2.0/ContactBase"
                },
                call: {
                    path: "tizen/2.0/call",
                    feature: "http://tizen.org/api/call|http://tizen.org/api/call.history|http://tizen.org/api/call.history.read|http://tizen.org/api/call.history.write",
                    handleSubfeatures: true
                },
                SimpleCoordinates: {
                    path: "tizen/2.0/SimpleCoordinates"
                },
                TZDate: {
                    path: "tizen/2.0/TZDate"
                },
                TimeDuration: {
                    path: "tizen/2.0/TimeDuration"
                },
                Message: {
                    path: "tizen/2.0/Message"
                },
                time: {
                    path: "tizen/2.0/time",
                    feature: "http://tizen.org/api/time|http://tizen.org/api/time.read|http://tizen.org/api/time.write",
                    handleSubfeatures: true
                },
                contact: {
                    path: "tizen/2.0/contact",
                    feature: "http://tizen.org/api/contact|http://tizen.org/api/contact.read|http://tizen.org/api/contact.write",
                    handleSubfeatures: true
                },
                calendar: {
                    path: "tizen/2.0/calendar",
                    feature: "http://tizen.org/api/calendar|http://tizen.org/api/calendar.read|http://tizen.org/api/calendar.write",
                    handleSubfeatures: true
                },
                CalendarItem: {
                    path: "tizen/2.0/CalendarItem"
                },
                CalendarEvent: {
                    path: "tizen/2.0/CalendarEvent"
                },
                CalendarTask: {
                    path: "tizen/2.0/CalendarTask"
                },
                CalendarRecurrenceRule: {
                    path: "tizen/2.0/CalendarRecurrenceRule"
                },
                messaging: {
                    path: "tizen/2.0/messaging",
                    feature: "http://tizen.org/api/messaging|http://tizen.org/api/messaging.send|http://tizen.org/api/messaging.read|http://tizen.org/api/messaging.write",
                    handleSubfeatures: true
                },
                nfc: {
                    path: "tizen/2.0/nfc",
                    feature: "http://tizen.org/api/nfc|http://tizen.org/api/nfc.tag|http://tizen.org/api/nfc.p2p",
                    handleSubfeatures: true
                },
                lbs: {
                    children: {
                        geocoder: {
                            path: "tizen/2.0/geocoder",
                            feature: "http://tizen.org/api/geocoder"
                        },
                        GeoRectBounds: {
                            path: "tizen/2.0/GeoRectBounds"
                        },
                        GeoCircleBounds: {
                            path: "tizen/2.0/GeoCircleBounds"
                        },
                        GeoPolyBounds: {
                            path: "tizen/2.0/GeoPolyBounds"
                        },
                        GeometryFilter: {
                            path: "tizen/2.0/GeometryFilter"
                        }
                    }
                },
                mediacontent: {
                    path: "tizen/2.0/mediacontent",
                    feature: "http://tizen.org/api/mediacontent"
                },
                sensors: {
                    path: "tizen/2.0/sensors",
                    feature: "http://tizen.org/api/sensors"
                },
                systeminfo: {
                    path: "tizen/2.0/systeminfo",
                    feature: "http://tizen.org/api/systeminfo"
                },
                filesystem: {
                    path: "tizen/2.0/filesystem",
                    feature: "http://tizen.org/api/filesystem|http://tizen.org/api/filesystem.read|http://tizen.org/api/filesystem.write"
                },
                power: {
                    path: "tizen/2.0/power",
                    feature: "http://tizen.org/api/power"
                },
                PowerStateRequest: {
                    path: "tizen/2.0/PowerStateRequest",
                    feature: "http://tizen.org/api/power"
                }
            }
        }
    }
};
