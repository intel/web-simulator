/*
 *  Copyright 2013 Intel Corporation.
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

var BluetoothClassDeviceMinor = function () {
    // COMPUTER
    this.__defineGetter__("COMPUTER_UNCATEGORIZED", function () {
        return 0x00;
    });

    this.__defineGetter__("COMPUTER_DESKTOP", function () {
        return 0x01;
    });

    this.__defineGetter__("COMPUTER_SERVER", function () {
        return 0x02;
    });

    this.__defineGetter__("COMPUTER_LAPTOP", function () {
        return 0x03;
    });

    this.__defineGetter__("COMPUTER_HANDHELD_PC_OR_PDA", function () {
        return 0x04;
    });

    this.__defineGetter__("COMPUTER_PALM_PC_OR_PDA", function () {
        return 0x05;
    });

    this.__defineGetter__("COMPUTER_WEARABLE", function () {
        return 0x06;
    });

    // PHONE
    this.__defineGetter__("PHONE_UNCATEGORIZED", function () {
        return 0x00;
    });

    this.__defineGetter__("PHONE_CELLULAR", function () {
        return 0x01;
    });

    this.__defineGetter__("PHONE_CORDLESS", function () {
        return 0x02;
    });

    this.__defineGetter__("PHONE_SMARTPHONE", function () {
        return 0x03;
    });

    this.__defineGetter__("PHONE_MODEM_OR_GATEWAY", function () {
        return 0x04;
    });

    this.__defineGetter__("PHONE_ISDN", function () {
        return 0x05;
    });

    // AUDIO_VIDEO
    this.__defineGetter__("AV_UNRECOGNIZED", function () {
        return 0x00;
    });

    this.__defineGetter__("AV_WEARABLE_HEADSET", function () {
        return 0x01;
    });

    this.__defineGetter__("AV_HANDSFREE", function () {
        return 0x02;
    });

    this.__defineGetter__("AV_MICROPHONE", function () {
        return 0x04;
    });

    this.__defineGetter__("AV_LOUDSPEAKER", function () {
        return 0x05;
    });

    this.__defineGetter__("AV_HEADPHONES", function () {
        return 0x06;
    });

    this.__defineGetter__("AV_PORTABLE_AUDIO", function () {
        return 0x07;
    });

    this.__defineGetter__("AV_CAR_AUDIO", function () {
        return 0x08;
    });

    this.__defineGetter__("AV_SETTOP_BOX", function () {
        return 0x09;
    });

    this.__defineGetter__("AV_HIFI", function () {
        return 0x0a;
    });

    this.__defineGetter__("AV_VCR", function () {
        return 0x0b;
    });

    this.__defineGetter__("AV_VIDEO_CAMERA", function () {
        return 0x0c;
    });

    this.__defineGetter__("AV_CAMCORDER", function () {
        return 0x0d;
    });

    this.__defineGetter__("AV_MONITOR", function () {
        return 0x0e;
    });

    this.__defineGetter__("AV_DISPLAY_AND_LOUDSPEAKER", function () {
        return 0x0f;
    });

    this.__defineGetter__("AV_VIDEO_CONFERENCING", function () {
        return 0x10;
    });

    this.__defineGetter__("AV_GAMING_TOY", function () {
        return 0x12;
    });

    // PERIPHERAL
    this.__defineGetter__("PERIPHERAL_UNCATEGORIZED", function () {
        return 0;
    });

    this.__defineGetter__("PERIPHERAL_KEYBOARD", function () {
        return 0x10;
    });

    this.__defineGetter__("PERIPHERAL_POINTING_DEVICE", function () {
        return 0x20;
    });

    this.__defineGetter__("PERIPHERAL_KEYBOARD_AND_POINTING_DEVICE", function () {
        return 0x30;
    });

    this.__defineGetter__("PERIPHERAL_JOYSTICK", function () {
        return 0x01;
    });

    this.__defineGetter__("PERIPHERAL_GAMEPAD", function () {
        return 0x02;
    });

    this.__defineGetter__("PERIPHERAL_REMOTE_CONTROL", function () {
        return 0x03;
    });

    this.__defineGetter__("PERIPHERAL_SENSING_DEVICE", function () {
        return 0x04;
    });

    this.__defineGetter__("PERIPHERAL_DEGITIZER_TABLET", function () {
        return 0x05;
    });

    this.__defineGetter__("PERIPHERAL_CARD_READER", function () {
        return 0x06;
    });

    this.__defineGetter__("PERIPHERAL_DIGITAL_PEN", function () {
        return 0x07;
    });

    this.__defineGetter__("PERIPHERAL_HANDHELD_SCANNER", function () {
        return 0x08;
    });

    this.__defineGetter__("PERIPHERAL_HANDHELD_INPUT_DEVICE", function () {
        return 0x09;
    });

    // IMAGING
    this.__defineGetter__("IMAGING_UNCATEGORIZED", function () {
        return 0x00;
    });

    this.__defineGetter__("IMAGING_DISPLAY", function () {
        return 0x04;
    });

    this.__defineGetter__("IMAGING_CAMERA", function () {
        return 0x08;
    });

    this.__defineGetter__("IMAGING_SCANNER", function () {
        return 0x10;
    });

    this.__defineGetter__("IMAGING_PRINTER", function () {
        return 0x20;
    });

    // WEARABLE
    this.__defineGetter__("WEARABLE_WRITST_WATCH", function () {
        return 0x01;
    });

    this.__defineGetter__("WEARABLE_PAGER", function () {
        return 0x02;
    });

    this.__defineGetter__("WEARABLE_JACKET", function () {
        return 0x03;
    });

    this.__defineGetter__("WEARABLE_HELMET", function () {
        return 0x04;
    });

    this.__defineGetter__("WEARABLE_GLASSES", function () {
        return 0x05;
    });

    // TOY
    this.__defineGetter__("TOY_ROBOT", function () {
        return 0x01;
    });

    this.__defineGetter__("TOY_VEHICLE", function () {
        return 0x02;
    });

    this.__defineGetter__("TOY_DOLL", function () {
        return 0x03;
    });

    this.__defineGetter__("TOY_CONTROLLER", function () {
        return 0x04;
    });

    this.__defineGetter__("TOY_GAME", function () {
        return 0x05;
    });

    // HEALTH
    this.__defineGetter__("HEALTH_UNDEFINED", function () {
        return 0x00;
    });

    this.__defineGetter__("HEALTH_BLOOD_PRESSURE_MONITOR", function () {
        return 0x01;
    });

    this.__defineGetter__("HEALTH_THERMOMETER", function () {
        return 0x02;
    });

    this.__defineGetter__("HEALTH_WEIGHING_SCALE", function () {
        return 0x03;
    });

    this.__defineGetter__("HEALTH_GLUCOSE_METER", function () {
        return 0x04;
    });

    this.__defineGetter__("HEALTH_PULSE_OXIMETER", function () {
        return 0x05;
    });

    this.__defineGetter__("HEALTH_PULSE_RATE_MONITOR", function () {
        return 0x06;
    });

    this.__defineGetter__("HEALTH_DATA_DISPLAY", function () {
        return 0x07;
    });

    this.__defineGetter__("HEALTH_STEP_COUNTER", function () {
        return 0x08;
    });

    this.__defineGetter__("HEALTH_BODY_COMPOSITION_ANALYZER", function () {
        return 0x09;
    });

    this.__defineGetter__("HEALTH_PEAK_FLOW_MONITOR", function () {
        return 0x0a;
    });

    this.__defineGetter__("HEALTH_MEDICATION_MONITOR", function () {
        return 0x0b;
    });

    this.__defineGetter__("HEALTH_KNEE_PROSTHESIS", function () {
        return 0x0c;
    });

    this.__defineGetter__("HEALTH_ANKLE_PROSTHESIS", function () {
        return 0x0d;
    });
};

module.exports = BluetoothClassDeviceMinor;
