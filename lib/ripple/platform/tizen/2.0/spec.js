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
    version: "2.1",
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
            feature: "http://tizen.org/privilege/tizen",
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
                    feature: "http://tizen.org/privilege/alarm",
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
                    feature: "http://tizen.org/privilege/download"
                },
                DownloadRequest: {
                    path: "tizen/2.0/DownloadRequest",
                },
                notification: {
                    path: "tizen/2.0/notification",
                    feature: "http://tizen.org/privilege/notification",
                    handleSubfeatures: true
                },
                StatusNotification: {
                    path: "tizen/2.0/StatusNotification"
                },
                NotificationDetailInfo: {
                    path: "tizen/2.0/NotificationDetailInfo"
                },
                application: {
                    path: "tizen/2.0/application",
                    feature: "http://tizen.org/privilege/application.launch|http://tizen.org/privilege/application.kill|http://tizen.org/privilege/application.read",
                    handleSubfeatures: true
                },
                ApplicationControl: {
                    path: "tizen/2.0/ApplicationControl"
                },
                ApplicationControlData: {
                    path: "tizen/2.0/ApplicationControlData"
                },
                bluetooth: {
                    path: "tizen/2.0/bluetooth",
                    feature: "http://tizen.org/privilege/bluetooth.admin|http://tizen.org/privilege/bluetooth.gap|http://tizen.org/privilege/bluetooth.spp",
                    handleSubfeatures: true
                },
                contact: {
                    path: "tizen/2.0/contact",
                    feature: "http://tizen.org/privilege/contact.read|http://tizen.org/privilege/contact.write",
                    handleSubfeatures: true
                },
                Contact: {
                    path: "tizen/2.0/ContactBase"
                },
                ContactRef: {
                    path: "tizen/2.0/ContactRef"
                },
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
                ContactAddress: {
                    path: "tizen/2.0/ContactAddress"
                },
                ContactPhoneNumber: {
                    path: "tizen/2.0/ContactPhoneNumber"
                },
                ContactEmailAddress: {
                    path: "tizen/2.0/ContactEmailAddress"
                },
                ContactGroup: {
                    path: "tizen/2.0/ContactGroup"
                },
                callhistory: {
                    path: "tizen/2.0/callHistory",
                    feature: "http://tizen.org/privilege/callhistory|http://tizen.org/privilege/callhistory.read|http://tizen.org/privilege/callhistory.write",
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
                    feature: "http://tizen.org/privilege/time",
                    handleSubfeatures: true
                },
                calendar: {
                    path: "tizen/2.0/calendar",
                    feature: "http://tizen.org/privilege/calendar.read|http://tizen.org/privilege/calendar.write",
                    handleSubfeatures: true
                },
                CalendarTask: {
                    path: "tizen/2.0/CalendarTask"
                },
                CalendarEvent: {
                    path: "tizen/2.0/CalendarEvent"
                },
                CalendarAttendee: {
                    path: "tizen/2.0/CalendarAttendee"
                },
                CalendarRecurrenceRule: {
                    path: "tizen/2.0/CalendarRecurrenceRule"
                },
                CalendarEventId: {
                    path: "tizen/2.0/CalendarEventId"
                },
                CalendarAlarm: {
                    path: "tizen/2.0/CalendarAlarm"
                },
                messaging: {
                    path: "tizen/2.0/messaging",
                    feature: "http://tizen.org/privilege/messaging.send|http://tizen.org/privilege/messaging.read|http://tizen.org/privilege/messaging.write",
                    handleSubfeatures: true
                },
                nfc: {
                    path: "tizen/2.0/nfc",
                    feature: "http://tizen.org/privilege/nfc.common|http://tizen.org/privilege/nfc.admin|http://tizen.org/privilege/nfc.tag|http://tizen.org/privilege/nfc.p2p|http://tizen.org/privilege/nfc.cardemulation",
                    handleSubfeatures: true
                },
                NDEFMessage: {
                    path: "tizen/2.0/NDEFMessage"
                },
                NDEFRecord: {
                    path: "tizen/2.0/NDEFRecord"
                },
                NDEFRecordText: {
                    path: "tizen/2.0/NDEFRecordText"
                },
                NDEFRecordURI: {
                    path: "tizen/2.0/NDEFRecordURI"
                },
                NDEFRecordMedia: {
                    path: "tizen/2.0/NDEFRecordMedia"
                },
                content: {
                    path: "tizen/2.0/content",
                    feature: "http://tizen.org/privilege/content.read|http://tizen.org/privilege/content.write",
                    handleSubfeatures: true
                },
                systeminfo: {
                    path: "tizen/2.0/systeminfo",
                    feature: "http://tizen.org/privilege/systeminfo"
                },
                systemsetting: {
                    path: "tizen/2.0/systemsetting",
                    feature: "http://tizen.org/privilege/setting"
                },
                filesystem: {
                    path: "tizen/2.0/filesystem",
                    feature: "http://tizen.org/privilege/filesystem.read|http://tizen.org/privilege/filesystem.write"
                },
                package: {
                    path: "tizen/2.0/package",
                    feature: "http://tizen.org/privilege/packagemanager.install|http://tizen.org/privilege/package.info",
                    handleSubfeatures: true
                },
                power: {
                    path: "tizen/2.0/power",
                    feature: "http://tizen.org/privilege/power"
                },
                networkbearerselection: {
                    path: "tizen/2.0/networkbearerselection",
                    feature: "http://tizen.org/privilege/networkbearerselection"
                },
                push: {
                    path: "tizen/2.0/push",
                    feature: "http://tizen.org/privilege/push"
                }
            }
        }
    }
};
