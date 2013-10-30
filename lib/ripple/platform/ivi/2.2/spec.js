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

    id: "ivi",
    version: "2.2",
    name: "IVI",

    persistencePrefix: "ivi2-",

    config: require('ripple/platform/ivi/2.2/spec/config'),
    ui: require('ripple/platform/ivi/2.2/spec/ui'),
    device: require('ripple/platform/ivi/2.2/spec/device'),
    sensor: require('ripple/platform/ivi/2.2/spec/sensor'),
    DeviceMotionEvent: require('ripple/platform/ivi/2.2/DeviceMotionEvent'),
    DeviceOrientationEvent: require('ripple/platform/ivi/2.2/DeviceOrientationEvent'),

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
                    path: "wac/2.0/geolocation"
                },
                vehicle: {
                    path: "ivi/2.2/vehicle",
                    feature: "http://tizen.org/api/vehicle",
                    handleSubfeatures: true
                }
            }
        },
        tizen: {/*
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
                }
            }*/
        }
    }
};
