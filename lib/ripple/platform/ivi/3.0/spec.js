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
    version: "3.0",
    name: "IVI",

    persistencePrefix: "ivi3-",

    config: require('ripple/platform/ivi/3.0/spec/config'),
    ui: require('ripple/platform/ivi/3.0/spec/ui'),
    device: require('ripple/platform/ivi/3.0/spec/device'),
    sensor: require('ripple/platform/ivi/3.0/spec/sensor'),
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
                }
            }
        },
        tizen: {
            children: {
                vehicle: {
                    path: "ivi/3.0/vehicle",
                    feature: "http://tizen.org/privilege/vehicle",
                    handleSubfeatures: true
                }
            }
        }
    }
};
