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

var _t, _c, _i;

/*
 * Primitive type definition
 */

_t = {
    // Basic
    Callback:                           "Callback",
    DOMString:                          "",
    Date:                               new Date(),
    Function:                           function () {},
    any:                                "any",
    boolean:                            false,
    byte:                               "byte",
    double:                             "double",
    float:                              "float",
    long:                               0,
    octet:                              "octet",
    short:                              0,
    "unsigned long":                    "unsigned long",
    "unsigned long long":               0,
    "unsigned short":                   0
};

/*
 * Derivative type definition
 */

/*
 * Object attributes
 *     Contruct a prototype of an object. Specify a primitive type for each attribute.
 *
 * _optional
 *     Optional attributes table, which consists of two types of attributes,
 *
 *     nullable
 *         Nullable attributes, marked as '?' in IDL.
 *
 *     undefined
 *         Array type attributes, that not definitely specified to be
 *         initialized as an empty array, i.e., undefined-initialized array.
 *
 * _derived
 *     Derived types, which used in two cases of definition,
 *
 *     Subtype list
 *         An array consists of derived subtypes. It exists in the definition of
 *         a base type.
 *
 *     Union types
 *         An array consists of member types. It exists in the definition of
 *         a union type.
 *
 * _dictionary
 *     Dictionary type, which indicates that the object is a dictionary type.
 */

/*
 * Vehicle
 */
_t.SupportedPropertiesSuccessCallback = _t.Function;

_t.VehiclePropertyErrorCallback = _t.Function;

_t.VehiclePropertyCallback = _t.Function;

_t.VehiclePropertyListCallback = _t.Function;

/*
 * VehiclePropertyType
 */
_t.VehiclePropertyType = {
    timeStamp: _t.Date,

    _derived: [_t.VehicleSpeed, _t.EngineSpeed, _t.VehiclePowerMode,
        _t.TripMeters, _t.Acceleration, _t.Transmission,
        _t.CruiseControlStatus, _t.WheelBrake, _t.LightStatus,
        _t.InteriorLightStatus, _t.Horn, _t.Fuel, _t.EngineOil,
        _t.ExteriorBrightness, _t.Temperature, _t.RainSensor,
        _t.WindshieldWiper, _t.HVAC]
};

/*
 * VehicleSpeed
 */
_t.VehicleSpeed = {
    VehicleSpeed: _t["unsigned short"]
};

/*
 * EngineSpeed
 */
_t.EngineSpeed = {
    EngineSpeed: _t["unsigned long"]
};

/*
 * VehiclePowerMode
 */
_t.VehiclePowerMode = {
    VehiclePowerMode: _t.octet
};

/*
 * TripMeters
 */
_t.TripMeters = {
    TripMeters: [_t["unsigned long"]]
};

/*
 * Acceleration
 */
_t.Acceleration = {
    X: _t["unsigned long"],
    Y: _t["unsigned long"],
    Z: _t["unsigned long"]
};

/*
 * Transmission
 */
_t.Transmission = {
    GearPosition: _t.octet,
    Mode: _t.octet
};

/*
 * CruiseControlStatus
 */
_t.CruiseControlStatus = {
    Activated: _t.boolean,
    Speed: _t["unsigned short"]
};
/*
 * WheelBrake
 */
_t.WheelBrake = {
    Engaged: _t.boolean
};

/*
 * LightStatus
 */
_t.LightStatus = {
    Head: _t.boolean,
    RightTurn: _t.boolean,
    LeftTurn: _t.boolean,
    Brake: _t.boolean,
    Fog: _t.boolean,
    Hazard: _t.boolean,
    Parking: _t.boolean,
    HighBeam: _t.boolean
};

/*
 * InteriorLightStatus
 */
_t.InteriorLightStatus = {
    Passenger: _t.boolean,
    Driver: _t.boolean,
    Center: _t.boolean
};

/*
 * Horn
 */
_t.Horn = {
    On: _t.On
};

/*
 * Fuel
 */
_t.Fuel = {
    Level: _t["unsigned short"],
    Range: _t["unsigned short"],
    InstantConsumption: _t["unsigned short"],
    InstantEconomy: _t["unsigned short"],
    AverageEconomy: _t["unsigned short"]
};

/*
 * EngineOil
 */
_t.EngineOil = {
    Remaining: _t["unsigned short"],
    Temperature: _t.long,
    Pressure: _t["unsigned short"]
};

/*
 * ExteriorBrightness
 */
_t.ExteriorBrightness = {
    ExteriorBrightness: _t["unsigned long"]
};

/*
 * Temperature
 */
_t.Temperature = {
    Interior: _t["unsigned short"],
    Exterior: _t["unsigned short"]
};

/*
 * RainSensor
 */
_t.RainSensor = {
    RainSensor: _t["unsigned short"]
};

/*
 * WindshieldWiper
 */
_t.WindshieldWiper = {
    WindshieldWiper: _t["unsigned short"]
};

/*
 * DefrostDictionary
 */
_t.DefrostDictionary = {
    window: _t["unsigned short"],
    defrost: _t.boolean,

    _dictionary: true
};

/*
 * HVAC
 */
_t.HVAC = {
    AirflowDirection: _t["unsigned short"],
    FanSpeed: _t["unsigned short"],
    TargetTemperature: _t["unsigned short"],
    AirConditioning: _t.boolean,
    AirRecirculation: _t.boolean,
    Heater: _t.boolean,
    Defrost: _t.DefrostDictionary,
    SteeringWheelHeater: _t.boolean,
    SeatHeater: _t.boolean
};

/*
 * Constructor list definition
 */

/*
 * Generic constructor
 *     Construct a prototype of constructor. A fake array of arguments type is
 *     specified for constructor.
 *
 * Overloaded constructors
 *     Construct an array of prototype of constructor. Each array element is
 *     specified for one of constructors. The constructor with extra arguments
 *     are recommended to be defined ahead of the one with fewer same arguments
 *     for exact match.
 */

_c = {};

/*
 * Interface prototype definition
 */

_i = {
    // Vehicle
    Vehicle: {}
};

_i.Vehicle.getSupported = {
    0: _t.SupportedPropertiesSuccessCallback,
    1: _t.VehiclePropertyErrorCallback
}

_i.Vehicle.get = {
    0: _t.DOMString,
    1: _t.VehiclePropertyCallback,
    2: _t.VehiclePropertyErrorCallback
}

_i.Vehicle.set = {
    0: _t.DOMString,
    1: _t.any,
    2: _t.VehiclePropertyCallback,
    3: _t.VehiclePropertyErrorCallback
}

_i.Vehicle.getHistory = {
    0: _t.DOMString,
    1: _t.Date,
    2: _t.Date,
    3: _t.VehiclePropertyListCallback,
    4: _t.VehiclePropertyErrorCallback
}

// Exports
_t.constructor = _c;
_t.interface   = _i;

module.exports = _t;
