/*
 *  Copyright 2014 Intel Corporation.
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

    id: "wearable",
    version: "2.2",
    name: "WEARABLE",

    persistencePrefix: "wearable3-",

    config: require('ripple/platform/wearable/2.2/spec/config'),
    ui: require('ripple/platform/wearable/2.2/spec/ui'),
    device: require('ripple/platform/wearable/2.2/spec/device'),
    sensor: require('ripple/platform/wearable/2.2/spec/sensor'),
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
                    path: "wac/2.0/geolocation"
                },
                battery: {
                    path: "tizen/2.0/battery"
                }
            }
        },
        webapis: {
            children: {
                sa: {
                    path: "wearable/2.2/sa",
                    feature: "http://developer.samsung.com/privilege/accessoryprotocol",
                    handleSubfeatures: true
                }
            }
        },
        tizen: {
            feature: "http://tizen.org/privilege/tizen",
            children: {
                AlarmAbsolute: {
                    path: "tizen/2.0/AlarmAbsolute"
                },
                AlarmRelative: {
                    path: "tizen/2.0/AlarmRelative"
                },
                ApplicationControl: {
                    path: "tizen/2.0/ApplicationControl"
                },
                ApplicationControlData: {
                    path: "tizen/2.0/ApplicationControlData"
                },
                AttributeFilter: {
                    path: "tizen/2.0/AttributeFilter"
                },
                AttributeRangeFilter: {
                    path: "tizen/2.0/AttributeRangeFilter"
                },
                TZDate: {
                    path: "tizen/2.0/TZDate"
                },
                TimeDuration: {
                    path: "tizen/2.0/TimeDuration"
                },
                alarm: {
                    path: "tizen/2.0/alarm",
                    feature: "http://tizen.org/privilege/alarm",
                    handleSubfeatures: true
                },
                application: {
                    path: "tizen/2.0/application",
                    feature: "http://tizen.org/privilege/application.launch|http://tizen.org/privilege/appmanager.kill|http://tizen.org/privilege/appmanager.certificate",
                    handleSubfeatures: true
                },
                content: {
                    path: "tizen/2.0/content",
                    feature: "http://tizen.org/privilege/content.read|http://tizen.org/privilege/content.write",
                    handleSubfeatures: true
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
                    feature: "http://tizen.org/privilege/power",
                    handleSubfeatures: true
                },
                systeminfo: {
                    path: "tizen/2.0/systeminfo",
                    feature: "http://tizen.org/privilege/system|http://tizen.org/privilege/systemmanager",
                    handleSubfeatures: true
                },
                time: {
                    path: "tizen/2.0/time",
                    feature: "http://tizen.org/privilege/time",
                    handleSubfeatures: true
                }
            }
        }
    }
};
