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

var t = require('ripple/platform/ivi/2.2/typecast'),
    errorcode = require('ripple/platform/ivi/2.2/errorcode'),
    WebAPIError = require('ripple/platform/ivi/2.2/WebAPIError'),
    WebAPIException = require('ripple/platform/ivi/2.2/WebAPIException'),
    event = require('ripple/event'),
    _self,
    _security = {
        "http://tizen.org/api/vehicle": ["getSupported", "get", "set",
            "getHistory"]
    },
    VehiclePropertyType,
    VehicleSpeed,
    EngineSpeed,
    VehiclePowerMode,
    TripMeters,
    Acceleration,
    Transmission,
    CruiseControlStatus,
    WheelBrake,
    LightStatus,
    InteriorLightStatus,
    Horn,
    Fuel,
    EngineOil,
    ExteriorBrightness,
    Temperature,
    RainSensor,
    WindshieldWiper,
    DefrostDictionary,
    HVAC,
    VehicleFactory;

VehiclePropertyType = function () {
    this.__defineGetter__("timeStamp", function () {
        return undefined;
    });
};

VehicleSpeed = function (dictionary) {
    var vehicleSpeed = {};

    VehiclePropertyType.call(this, dictionary);

    vehicleSpeed.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    vehicleSpeed.VehicleSpeed = dictionary.VehicleSpeed || 0;

    this.__defineGetter__("timeStamp", function () {
        return vehicleSpeed.timeStamp;
    });

    this.__defineGetter__("VehicleSpeed", function () {
        return vehicleSpeed.VehicleSpeed;
    });
};

EngineSpeed = function (dictionary) {
    var engineSpeed = {};

    VehiclePropertyType.call(this, dictionary);

    engineSpeed.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    engineSpeed.EngineSpeed = dictionary.EngineSpeed || 0;

    this.__defineGetter__("timeStamp", function () {
        return engineSpeed.timeStamp;
    });

    this.__defineGetter__("EngineSpeed", function () {
        return engineSpeed.EngineSpeed;
    });
};

VehiclePowerMode = function (dictionary) {
    var vehiclePowerMode = {};

    VehiclePropertyType.call(this, dictionary);

    vehiclePowerMode.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    vehiclePowerMode.VehiclePowerMode = dictionary.VehiclePowerMode || 0;

    this.__defineGetter__("timeStamp", function () {
        return vehiclePowerMode.timeStamp;
    });

    this.__defineGetter__("VEHICLEPOWERMODE_OFF", function () {
        return 0;
    });

    this.__defineGetter__("VEHICLEPOWERMODE_ACCESSORY1", function () {
        return 1;
    });

    this.__defineGetter__("VEHICLEPOWERMODE_ACCESSORY2", function () {
        return 2;
    });

    this.__defineGetter__("VEHICLEPOWERMODE_RUN", function () {
        return 3;
    });

    this.__defineGetter__("VehiclePowerMode", function () {
        return vehiclePowerMode.VehiclePowerMode;
    });
};

TripMeters = function (dictionary) {
    var tripMeters = {};

    VehiclePropertyType.call(this, dictionary);

    tripMeters.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    tripMeters.TripMeters = dictionary.TripMeters || 0;

    this.__defineGetter__("timeStamp", function () {
        return tripMeters.timeStamp;
    });

    this.__defineGetter__("TripMeters", function () {
        return tripMeters.TripMeters;
    });
};

Acceleration = function (dictionary) {
    var acceleration = {};

    VehiclePropertyType.call(this, dictionary);

    acceleration.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    acceleration.X = dictionary.X || 0;
    acceleration.Y = dictionary.Y || 0;
    acceleration.Z = dictionary.Z || 0;

    this.__defineGetter__("timeStamp", function () {
        return acceleration.timeStamp;
    });

    this.__defineGetter__("X", function () {
        return acceleration.X;
    });

    this.__defineGetter__("Y", function () {
        return acceleration.Y;
    });

    this.__defineGetter__("Z", function () {
        return acceleration.Z;
    });
};

Transmission = function (dictionary) {
    var transmission = {};

    VehiclePropertyType.call(this, dictionary);

    transmission.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    transmission.GearPosition = dictionary.GearPosition || 0;
    transmission.Mode = dictionary.Mode || 0;

    this.__defineGetter__("timeStamp", function () {
        return transmission.timeStamp;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_NEUTRAL", function () {
        return 0;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_FIRST", function () {
        return 1;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_SECOND", function () {
        return 2;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_THIRD", function () {
        return 3;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_FORTH", function () {
        return 4;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_FIFTH", function () {
        return 5;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_SIXTH", function () {
        return 6;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_SEVENTH", function () {
        return 7;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_EIGHTH", function () {
        return 8;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_NINTH", function () {
        return 9;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_TENTH", function () {
        return 10;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_CVT", function () {
        return 64;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_REVERSE", function () {
        return 128;
    });

    this.__defineGetter__("TRANSMISSIONPOSITION_PARK", function () {
        return 255;
    });

    this.__defineGetter__("TRANSMISSIONMODE_NORMAL", function () {
        return 0;
    });

    this.__defineGetter__("TRANSMISSIONMODE_SPORT", function () {
        return 1;
    });

    this.__defineGetter__("TRANSMISSIONMODE_ECONOMY", function () {
        return 2;
    });

    this.__defineGetter__("TRANSMISSIONMODE_OEMCUSTOM1", function () {
        return 3;
    });

    this.__defineGetter__("TRANSMISSIONMODE_OEMCUSTOM2", function () {
        return 4;
    });

    this.__defineGetter__("GearPosition", function () {
        return transmission.GearPosition;
    });

    this.__defineGetter__("Mode", function () {
        return transmission.Mode;
    });
};

CruiseControlStatus = function (dictionary) {
    var cruiseControlStatus = {};

    VehiclePropertyType.call(this, dictionary);

    cruiseControlStatus.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    cruiseControlStatus.Activated = dictionary.Activated || false;
    cruiseControlStatus.Speed = dictionary.Speed || 0;

    this.__defineGetter__("timeStamp", function () {
        return cruiseControlStatus.timeStamp;
    });

    this.__defineGetter__("Activated", function () {
        return cruiseControlStatus.Activated;
    });

    this.__defineGetter__("Speed", function () {
        return cruiseControlStatus.Speed;
    });
};

WheelBrake = function (dictionary) {
    var wheelBrake = {};

    VehiclePropertyType.call(this, dictionary);

    wheelBrake.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    wheelBrake.Engaged = dictionary.Engaged || false;

    this.__defineGetter__("timeStamp", function () {
        return wheelBrake.timeStamp;
    });

    this.__defineGetter__("Engaged", function () {
        return wheelBrake.Engaged;
    });
};

LightStatus = function (dictionary) {
    var lightStatus = {};

    VehiclePropertyType.call(this, dictionary);

    lightStatus.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    lightStatus.Head = dictionary.Head || false;
    lightStatus.RightTurn = dictionary.RightTurn || false;
    lightStatus.LeftTurn = dictionary.LeftTurn || false;
    lightStatus.Brake = dictionary.Brake || false;
    lightStatus.Fog = dictionary.Fog || false;
    lightStatus.Hazard = dictionary.Hazard || false;
    lightStatus.Parking = dictionary.Parking || false;
    lightStatus.HighBeam = dictionary.HighBeam || false;

    this.__defineGetter__("timeStamp", function () {
        return lightStatus.timeStamp;
    });

    this.__defineGetter__("Head", function () {
        return lightStatus.Head;
    });

    this.__defineGetter__("RightTurn", function () {
        return lightStatus.RightTurn;
    });

    this.__defineGetter__("LeftTurn", function () {
        return lightStatus.LeftTurn;
    });

    this.__defineGetter__("Brake", function () {
        return lightStatus.Brake;
    });

    this.__defineGetter__("Fog", function () {
        return lightStatus.Fog;
    });

    this.__defineGetter__("Hazard", function () {
        return lightStatus.Hazard;
    });

    this.__defineGetter__("Parking", function () {
        return lightStatus.Parking;
    });

    this.__defineGetter__("HighBeam", function () {
        return lightStatus.HighBeam;
    });
};

InteriorLightStatus = function (dictionary) {
    var interiorLightStatus = {};

    VehiclePropertyType.call(this, dictionary);

    interiorLightStatus.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    interiorLightStatus.Passenger = dictionary.Passenger || false;
    interiorLightStatus.Driver = dictionary.Driver || false;
    interiorLightStatus.Center = dictionary.Center || false;

    this.__defineGetter__("timeStamp", function () {
        return interiorLightStatus.timeStamp;
    });

    this.__defineGetter__("Passenger", function () {
        return interiorLightStatus.Passenger;
    });

    this.__defineGetter__("Driver", function () {
        return interiorLightStatus.Driver;
    });

    this.__defineGetter__("Center", function () {
        return interiorLightStatus.Center;
    });
};

Horn = function (dictionary) {
    var horn = {};

    VehiclePropertyType.call(this, dictionary);

    horn.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    horn.On = dictionary.On || false;

    this.__defineGetter__("timeStamp", function () {
        return horn.timeStamp;
    });

    this.__defineGetter__("On", function () {
        return horn.On;
    });
};

Fuel = function (dictionary) {
    var fuel = {};

    VehiclePropertyType.call(this, dictionary);

    fuel.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    fuel.Level = dictionary.Level || 0;
    fuel.Range = dictionary.Range || 0;
    fuel.InstantConsumption = dictionary.InstantConsumption || 0;
    fuel.InstantEconomy = dictionary.InstantEconomy || 0;
    fuel.AverageEconomy = dictionary.AverageEconomy || 0;

    this.__defineGetter__("timeStamp", function () {
        return fuel.timeStamp;
    });

    this.__defineGetter__("Level", function () {
        return fuel.Level;
    });

    this.__defineGetter__("Range", function () {
        return fuel.Range;
    });

    this.__defineGetter__("InstantConsumption", function () {
        return fuel.InstantConsumption;
    });

    this.__defineGetter__("InstantEconomy", function () {
        return fuel.InstantEconomy;
    });

    this.__defineGetter__("AverageEconomy", function () {
        return fuel.AverageEconomy;
    });

    this.__defineSetter__("AverageEconomy", function (val) {
        try {
            fuel.AverageEconomy = _t["unsigned short"](val);
        }
        catch (err) {
        }
    });
};

EngineOil = function (dictionary) {
    var engineOil = {};

    VehiclePropertyType.call(this, dictionary);

    engineOil.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    engineOil.Remaining = dictionary.Remaining || 0;
    engineOil.Temperature = dictionary.Temperature || 0;
    engineOil.Pressure = dictionary.Pressure || 0;

    this.__defineGetter__("timeStamp", function () {
        return engineOil.timeStamp;
    });

    this.__defineGetter__("Remaining", function () {
        return engineOil.Remaining;
    });

    this.__defineGetter__("Temperature", function () {
        return engineOil.Temperature;
    });

    this.__defineGetter__("Pressure", function () {
        return engineOil.Pressure;
    });
};

ExteriorBrightness = function (dictionary) {
    var exteriorBrightness = {};

    VehiclePropertyType.call(this, dictionary);

    exteriorBrightness.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    exteriorBrightness.ExteriorBrightness = 0;

    this.__defineGetter__("timeStamp", function () {
        return exteriorBrightness.timeStamp;
    });

    this.__defineGetter__("ExteriorBrightness", function () {
        return exteriorBrightness.ExteriorBrightness;
    });
};

Temperature = function (dictionary) {
    var temperature = {};

    VehiclePropertyType.call(this, dictionary);

    temperature.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    temperature.Interior = dictionary.Interior || 0;
    temperature.Exterior = dictionary.Interior || 0;

    this.__defineGetter__("timeStamp", function () {
        return temperature.timeStamp;
    });

    this.__defineGetter__("Interior", function () {
        return temperature.Interior;
    });

    this.__defineGetter__("Exterior", function () {
        return temperature.Exterior;
    });
};

RainSensor = function (dictionary) {
    var rainSensor = {};

    VehiclePropertyType.call(this, dictionary);

    rainSensor.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    rainSensor.RainSensor = dictionary.RainSensor || 0;

    this.__defineGetter__("timeStamp", function () {
        return rainSensor.timeStamp;
    });

    this.__defineGetter__("RainSensor", function () {
        return rainSensor.RainSensor;
    });
};

WindshieldWiper = function (dictionary) {
    var windshieldWiper = {};

    VehiclePropertyType.call(this, dictionary);

    windshieldWiper.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    windshieldWiper.WindshieldWiper = dictionary.WindshieldWiper || 0;

    this.__defineGetter__("timeStamp", function () {
        return windshieldWiper.timeStamp;
    });

    this.__defineGetter__("WIPERSPEED_OFF", function () {
        return 0;
    });

    this.__defineGetter__("WIPERSPEED_SLOWEST", function () {
        return 1;
    });

    this.__defineGetter__("WIPERSPEED_FASTEST", function () {
        return 5;
    });

    this.__defineGetter__("WIPERSPEED_AUTO", function () {
        return 10;
    });

    this.__defineGetter__("WindshieldWiper", function () {
        return windshieldWiper.WindshieldWiper;
    });
};

DefrostDictionary = function () {
    this.window = 0;
    this.defrost = false;
};

HVAC = function (dictionary) {
    var hvac = {};

    VehiclePropertyType.call(this, dictionary);

    hvac.timeStamp = (new Date()).setTime(dictionary.timeStamp) || undefined;
    hvac.AirflowDirection = dictionary.AirflowDirection || 0;
    hvac.FanSpeed = dictionary.FanSpeed || 0;
    hvac.TargetTemperature = dictionary.TargetTemperature || 0;
    hvac.AirConditioning = dictionary.AirConditioning || false;
    hvac.AirRecirculation = dictionary.AirRecirculation || false;
    hvac.Heater = dictionary.Heater || false;
    hvac.Defrost = new DefrostDictionary();
    hvac.SteeringWheelHeater = dictionary.SteeringWheelHeater || false;
    hvac.SeatHeater = dictionary.SeatHeater || false;

    this.__defineGetter__("timeStamp", function () {
        return hvac.timeStamp;
    });

    this.__defineGetter__("AIRFLOWDIRECTION_DEFROSTER", function () {
        return 0;
    });

    this.__defineGetter__("AIRFLOWDIRECTION_FLOORDUCT", function () {
        return 1;
    });

    this.__defineGetter__("AIRFLOWDIRECTION_FRONT", function () {
        return 0x02;
    });

    this.__defineGetter__("AIRFLOWDIRECTION_DEFROSTER", function () {
        return 0x04;
    });

    this.__defineGetter__("AirflowDirection", function () {
        return hvac.AirflowDirection;
    });

    this.__defineSetter__("AirflowDirection", function (val) {
        try {
            hvac.AirflowDirection = t["unsigned short"](val);
        }
        catch (err) {
        }
    });

    this.__defineGetter__("FanSpeed", function () {
        return hvac.FanSpeed;
    });

    this.__defineSetter__("FanSpeed", function (val) {
        try {
            hvac.FanSpeed = t["unsigned short"](val);
        }
        catch (err) {
        }
    });

    this.__defineGetter__("TargetTemperature", function () {
        return hvac.TargetTemperature;
    });

    this.__defineSetter__("TargetTemperature", function (val) {
        try {
            hvac.TargetTemperature = t["unsigned short"](val);
        }
        catch (err) {
        }
    });

    this.__defineGetter__("AirConditioning", function () {
        return hvac.AirConditioning;
    });

    this.__defineSetter__("AirConditioning", function (val) {
        try {
            hvac.AirConditioning = t.boolean(val);
        }
        catch (err) {
        }
    });

    this.__defineGetter__("AirRecirculation", function () {
        return hvac.AirRecirculation;
    });

    this.__defineSetter__("AirRecirculation", function (val) {
        try {
            hvac.AirRecirculation = t.boolean(val);
        }
        catch (err) {
        }
    });

    this.__defineGetter__("Heater", function () {
        return hvac.Heater;
    });

    this.__defineSetter__("Heater", function (val) {
        try {
            hvac.Heater = t.boolean(val);
        }
        catch (err) {
        }
    });

    this.__defineGetter__("Defrost", function () {
        return hvac.Defrost;
    });

    this.__defineSetter__("Defrost", function (val) {
        try {
            hvac.Defrost = t.DefrostDictionary(val);
        }
        catch (err) {
        }
    });

    this.__defineGetter__("SteeringWheelHeater", function () {
        return hvac.SteeringWheelHeater;
    });

    this.__defineSetter__("SteeringWheelHeater", function (val) {
        try {
            hvac.SteeringWheelHeater = t.boolean(val);
        }
        catch (err) {
        }
    });

    this.__defineGetter__("SeatHeater", function () {
        return hvac.SeatHeater;
    });

    this.__defineSetter__("SeatHeater", function (val) {
        try {
            hvac.SeatHeater = t.boolean(val);
        }
        catch (err) {
        }
    });
};

_self = function () {
    var vehicle;

    function getSupported (successCallback, errorCallback) {
        if (!_security.getSupported) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.Vehicle("getSupported", arguments);

        window.setTimeout(function () {
            event.on("vehicle-supported-properties-message", function (properties) {
                successCallback(properties.supported);
            });
            event.trigger("vehicle-supported-properties-request");
        }, 1);
    }

    function get (property, successCallback, errorCallback) {
        if (!_security.get) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.Vehicle("get", arguments);

        window.setTimeout(function () {
            event.on("vehicle-get-property-message", function (value, status) {
                if (status) {
                    successCallback(VehicleFactory(property, value));
                }
                else {
                    errorCallback(new WebAPIError(errorcode.PROPERTY_UNAVAILABLE));
                }
            });
            event.trigger("vehicle-get-property-request", [property]);
        }, 1);
    }

    function set (property, value, successCallback, errorCallback) {
        if (!_security.set) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.Vehicle("set", arguments);

        window.setTimeout(function () {
            event.on("vehicle-set-property-message", function (status) {
                if (status) {
                    successCallback(VehicleFactory(property, value));
                }
                else {
                    errorCallback(new WebAPIError(errorcode.PROPERTY_UNAVAILABLE));
                }
            });

            event.trigger("vehicle-set-property-request", [property, value]);
        }, 1);
    }

    function getHistory (property, startTime, endTime, successCallback, errorCallback) {
        var newValues = [], i;

        if (!_security.getHistory) {
            throw new WebAPIException(errorcode.PERMISSION_DENIED);
        }

        t.Vehicle("getHistory", arguments);

        window.setTimeout(function () {
            event.on("vehicle-history-property-message", function (values, status) {
                if (status) {
                    for (i = 0; i < values.length; i++) {
                        newValues.push(VehicleFactory(property, values[i]));
                    }
                    successCallback(newValues);
                }
                else {
                    errorCallback(new WebAPIError(errorcode.PROPERTY_UNAVAILABLE));
                }
            });
            event.trigger("vehicle-history-property-request", [property, startTime, endTime]);
        }, 1);
    }

    function handleSubFeatures (subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    vehicle = {
        getSupported: getSupported,
        get: get,
        set: set,
        getHistory: getHistory,
        handleSubFeatures: handleSubFeatures
    };

    return vehicle;
};

VehicleFactory = function (vehicleType, value) {
    var instanceType;

    switch (vehicleType) {
        case "VehicleSpeed":
            instanceType = new VehicleSpeed(value);
            break;
        case "EngineSpeed":
            instanceType = new EngineSpeed(value);
            break;
        case "VehiclePowerMode":
            instanceType = new VehiclePowerMode(value);
            break;
        case "TripMeters":
            instanceType = new TripMeters(value);
            break;
        case "Acceleration":
            instanceType = new Acceleration(value);
            break;
        case "Transmission":
            instanceType = new Transmission(value);
            break;
        case "CruiseControlStatus":
            instanceType = new CruiseControlStatus(value);
            break;
        case "WheelBrake":
            instanceType = new WheelBrake(value);
            break;
        case "LightStatus":
            instanceType = new LightStatus(value);
            break;
        case "InteriorLightStatus":
            instanceType = new InteriorLightStatus(value);
            break;
        case "Horn":
            instanceType = new Horn(value);
            break;
        case "Fuel":
            instanceType = new Fuel(value);
            break;
        case "EngineOil":
            instanceType = new EngineOil(value);
            break;
        case "ExteriorBrightness":
            instanceType = new ExteriorBrightness(value);
            break;
        case "Temperature":
            instanceType = new Temperature(value);
            break;
        case "RainSensor":
            instanceType = new RainSensor(value);
            break;
        case "WindshieldWiper":
            instanceType = new WindshieldWiper(value);
            break;
        case "HVAC":
            instanceType = new HVAC(value);
            break;
    }

    return instanceType;
};

module.exports = _self;