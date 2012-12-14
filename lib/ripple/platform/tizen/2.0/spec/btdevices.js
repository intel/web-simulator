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
    "22:33:44:12:34:56": {
        "name": "Tizen Phone",
        "address": "22:33:44:12:34:56",
        "deviceClass": {
            "major": 0x02,
            "majorName": "PHONE",
            "minor": 0x03,
            "minorName": "PHONE_SMARTPHONE",
            "services": [0x0080],
            "servicesName": ["OBJECT_TRANSFER"]
        },
        "isTrusted": false,
        "services": {
            "5bce9431-6c75-32ab-afe0-2ec108a30860" : {
                "name": "Data Exchange",
                "uuid": "5bce9431-6c75-32ab-afe0-2ec108a30860",
                "protocol": "RFCOMM"
            },
            "3537d485-0c1e-445a-a066-43fafcfb61d1" : {
                "name": "Data Transfer",
                "uuid": "3537d485-0c1e-445a-a066-43fafcfb61d1",
                "protocol": "RFCOMM"
            }
        }
    },
    "22:33:44:12:34:88": {
        "name": "Keyboard",
        "address": "22:33:44:12:34:88",
        "deviceClass": {
            "major": 0x05,
            "majorName": "PERIPHERAL",
            "minor": 0x10,
            "minorName": "PERIPHERAL_KEYBOARD",
            "services": [0x0080],
            "servicesName": ["OBJECT_TRANSFER"]
        },
        "isTrusted": true,
        "services": {
            "3537d485-0c1e-445a-a066-43fafcfb61d1" : {
                "name": "Data Exchange",
                "uuid": "3537d485-0c1e-445a-a066-43fafcfb61d1",
                "protocol": "RFCOMM"
            }
        }
    },
    "22:33:44:88:34:58": {
        "name": "Tizen Laptop",
        "address": "22:33:44:88:34:58",
        "deviceClass": {
            "major": 0x01,
            "majorName": "COMPUTER",
            "minor": 0x03,
            "minorName": "COMPUTER_LAPTOP",
            "services": [0x0080],
            "servicesName": ["OBJECT_TRANSFER"]
        },
        "isTrusted": true,
        "services": {
            "3537d485-0c1e-445a-a066-43fafcfb61d1" : {
                "name": "Data Exchange",
                "uuid": "3537d485-0c1e-445a-a066-43fafcfb61d1",
                "protocol": "RFCOMM"
            }
        }
    }
};
