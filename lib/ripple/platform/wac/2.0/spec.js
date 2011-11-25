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

    id: "wac",
    version: "2.0",
    name: "WAC",

    persistencePrefix: "wac2-",

    config: require('ripple/platform/wac/2.0/spec/config'),
    ui: require('ripple/platform/wac/2.0/spec/ui'),
    device: require('ripple/platform/wac/2.0/spec/device'),

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
        navigator: {
            path: "w3c/1.0/navigator",
            children: {
                geolocation: {
                    path: "wac/2.0/geolocation",
                    feature: "http://www.w3.org/TR/geolocation-API/"
                }
            }
        },
        deviceapis: {
            path: "wac/2.0/deviceapis",
            feature: "http://wacapps.net/api/deviceapis",
            /*
             * Before we inject those cloned objects into the simulated application
             * namespace, we will handle the feature requests from config.xml.
             * Especially for:
             * - camera.show, camera.capture
             * - devicestatus.deviceinfo, devicestatus.networkinfo
             * - filesystem.read, filesystem.write
             * - messaging.send, messaging.find, messaging.subscribe, messaging.write
             * - pim
             *  - contact.read, contact.write
             *  - calendar.read, calendar.write
             *  - task.read, task.write
             */
            children: {
                accelerometer: {
                    path: "wac/2.0/accelerometer",
                    feature: "http://wacapps.net/api/accelerometer"
                },
                orientation: {
                    path: "wac/2.0/orientation",
                    feature: "http://wacapps.net/api/orientation"
                },
                camera: {
                    path: "wac/2.0/camera",
                    feature: "http://wacapps.net/api/camera|http://wacapps.net/api/camera.show|http://wacapps.net/api/camera.capture",
                    handleSubfeatures: true
                },
                devicestatus: {
                    path: "wac/2.0/devicestatus",
                    feature: "http://wacapps.net/api/devicestatus"
                },
                filesystem: {
                    path: "wac/2.0/filesystem",
                    feature: "http://wacapps.net/api/filesystem|http://wacapps.net/api/filesystem.read|http://wacapps.net/api/filesystem.write",
                    handleSubfeatures: true
                },
                messaging: {
                    path: "wac/2.0/messaging",
                    feature: "http://wacapps.net/api/messaging"
                },
                pim: {
                    children: {
                        contact: {
                            path: "wac/2.0/contact",
                            feature: "http://wacapps.net/api/pim.contact"
                        },
                        calendar: {
                            path: "wac/2.0/calendar",
                            feature: "http://wacapps.net/api/pim.calendar"
                        },
                        task: {
                            path: "wac/2.0/task",
                            feature: "http://wacapps.net/api/pim.task"
                        }
                    }
                },
                deviceinteraction: {
                    path: "wac/2.0/deviceinteraction",
                    feature: "http://wacapps.net/api/deviceinteraction"
                }
            }
        }
    }
};

