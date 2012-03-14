/*
 *  Copyright 2011 Intel Corporation.
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
    version: "1.0",
    name: "TIZEN",

    persistencePrefix: "tizen1-",

    config: require('ripple/platform/tizen/1.0/spec/config'),
    ui: require('ripple/platform/tizen/1.0/spec/ui'),
    device: require('ripple/platform/tizen/1.0/spec/device'),
    sensor: require('ripple/platform/tizen/1.0/spec/sensor'),
    DeviceMotionEvent: require('ripple/platform/tizen/1.0/DeviceMotionEvent'),
    DeviceOrientationEvent: require('ripple/platform/tizen/1.0/DeviceOrientationEvent'),

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
            path: "w3c/1.0/navigator",
            children: {
                geolocation: {
                    path: "wac/2.0/geolocation",
                    feature: "http://www.w3.org/TR/geolocation-API/"
                }
            }
        },
        tizen: {
            feature: "http://tizen.org/api/tizen",
            children: {
                CompositeFilter: {
                    path: "tizen/1.0/CompositeFilter"
                },
                AttributeFilter: {
                    path: "tizen/1.0/AttributeFilter"
                },
                AttributeRangeFilter: {
                    path: "tizen/1.0/AttributeRangeFilter"
                },
                SortMode: {
                    path: "tizen/1.0/SortMode"
                },
                SimpleCoordinates: {
                    path: "tizen/1.0/SimpleCoordinates"
                },
                TZDate: {
                    path: "tizen/1.0/TZDate"
                },
                TimeDuration: {
                    path: "tizen/1.0/TimeDuration"
                },
                application: {
                    path: "tizen/1.0/application",
                    feature: "http://tizen.org/api/application"
                },
                time: {
                    path: "tizen/1.0/time",
                    feature: "http://tizen.org/api/time|http://tizen.org/api/time.read|http://tizen.org/api/time.write",
                    handleSubfeatures: true
                },
                contact: {
                    path: "tizen/1.0/contact",
                    feature: "http://tizen.org/api/contact|http://tizen.org/api/contact.read|http://tizen.org/api/contact.write",
                    handleSubfeatures: true
                },
                calendar: {
                    path: "tizen/1.0/calendar",
                    feature: "http://tizen.org/api/calendar|http://tizen.org/api/calendar.read|http://tizen.org/api/calendar.write",
                    handleSubfeatures: true
                },
                call: {
                    path: "tizen/1.0/call",
                    feature: "http://tizen.org/api/call|http://tizen.org/api/call.history|http://tizen.org/api/call.history.read|http://tizen.org/api/call.history.write",
                    handleSubfeatures: true
                },
                messaging: {
                    path: "tizen/1.0/messaging",
                    feature: "http://tizen.org/api/messaging|http://tizen.org/api/messaging.send|http://tizen.org/api/messaging.read|http://tizen.org/api/messaging.write",
                    handleSubfeatures: true
                },
                bluetooth: {
                    path: "tizen/1.0/bluetooth",
                    feature: "http://tizen.org/api/bluetooth|http://tizen.org/api/bluetooth.spp|http://tizen.org/api/bluetooth.gap",
                    handleSubfeatures: true
                },
                lbs: {
                    path: "tizen/1.0/lbs",
                    children: {
                        geocoder: {
                            path: "tizen/1.0/geocoder",
                            feature: "http://tizen.org/api/lbs.geocoder"
                        },
                        poi: {
                            path: "tizen/1.0/poi",
                            feature: "http://tizen.org/api/lbs.poi"
                        },
                        map: {
                            path: "tizen/1.0/map",
                            feature: "http://tizen.org/api/lbs.map"
                        },
                        route: {
                            path: "tizen/1.0/route",
                            feature: "http://tizen.org/api/lbs.route"
                        }
                    }
                },
                nfc: {
                    path: "tizen/1.0/nfc",
                    feature: "http://tizen.org/api/nfc|http://tizen.org/api/nfc.tag|http://tizen.org/api/nfc.p2p|http://tizen.org/api/nfc.se",
                    handleSubfeatures: true
                },
                sensors: {
                    path: "tizen/1.0/sensors",
                    feature: "http://tizen.org/api/sensors"
                },
                systeminfo: {
                    path: "tizen/1.0/systeminfo",
                    feature: "http://tizen.org/api/systeminfo"
                }
            }
        }
    }
};

