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
    TZDate:                             "TZDate",
    any:                                "any",
    boolean:                            false,
    byte:                               "byte",
    double:                             "double",
    float:                              "float",
    long:                               "long",
    octet:                              "octet",
    short:                              "short",
    long_long:                          "long long",
    unsigned_long:                      "unsigned long",
    unsigned_long_long:                 "unsigned long long",
    unsigned_short:                     "unsigned short",

    // Vehicle
    TransmissionMode:                   ["park", "reverse", "neutral", "low",
                                        "drive", "overdrive"],
    DoorOpenStatus:                     ["open", "ajar", "closed"],
    AirflowDirection:                   ["frontpanel", "floorduct", "bilevel",
                                        "defrostfloor"],
    VehicleTypeEnum:                    [ "passengerCarMini",
                                        "passengerCarLight",
                                        "passengerCarCompact",
                                        "passengerCarMedium",
                                        "passengerCarHeavy",
                                        "sportUtilityVehicle", "pickupTruck",
                                        "van"],
    TransmissionGearTypeEnum:           ["auto", "manual"],
    FuelTypeEnum:                       ["gasoline", "methanol", "ethanol",
                                        "diesel", "lpg", "cng", "electric"],
    VehiclePowerMode:                   ["off", "accessory1", "accessory2",
                                        "running"],
    ConvertibleRoofStatus:              ["closed", "closing", "opening",
                                        "opened"],
    ParkingBrakeStatus:                 ["inactive", "active", "error"]
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
 * Locale
 */

_t.LocaleChangedCallback = _t.Function;

/*
 * Media Server
 */
_t.MediaServerFoundServerCallback = _t.Function;
_t.MediaServerBrowseFindCallback = _t.Function;
_t.MediaServerErrorCallback = _t.Function;

/*
 * Vehicle
 */
_t.SupportedPropertiesSuccessCallback = _t.Function;

_t.VehiclePropertyErrorCallback = _t.Function;

_t.VehiclePropertyCallback = _t.Function;

_t.VehiclePropertyListCallback = _t.Function;

/*
 * VehicleSpeed
 */
_t.VehicleSpeed = {
    speed: _t.unsigned_short
};

/*
 * WheelSpeed
 */
_t.WheelSpeed = {
    speed: _t.unsigned_short
};

/*
 * EngineSpeed
 */
_t.EngineSpeed = {
    speed: _t.unsigned_long
};

/*
 * VehiclePowerModeType
 */
_t.VehiclePowerModeType = {
    value: _t.VehiclePowerMode
};

/*
 * Acceleration
 */
_t.Acceleration = {
    x: _t.unsigned_long,
    y: _t.unsigned_long,
    z: _t.unsigned_long
};

/*
 * Transmission
 */
_t.Transmission = {
    gear: _t.octet,
    mode: _t.TransmissionMode
};

/*
 * CruiseControlStatus
 */
_t.CruiseControlStatus = {
    activated: _t.boolean,
    speed:     _t.unsigned_short
};

/*
 * LightStatus
 */
_t.LightStatus = {
    head:                _t.boolean,
    rightTurn:           _t.boolean,
    leftTurn:            _t.boolean,
    brake:               _t.boolean,
    fog:                 _t.boolean,
    hazard:              _t.boolean,
    parking:             _t.boolean,
    highBeam:            _t.boolean,
    automaticHeadlights: _t.boolean,
    dynamicHighBeam:     _t.boolean,
    zone:                _t.unsigned_short
};

/*
 * InteriorLightStatus
 */
_t.InteriorLightStatus = {
    passenger: _t.boolean,
    driver:    _t.boolean,
    center:    _t.boolean
};

/*
 * Horn
 */
_t.Horn = {
    status: _t.boolean
};

/*
 * Fuel
 */
_t.Fuel = {
    level:                    _t.unsigned_short,
    range:                    _t.unsigned_long,
    instantConsumption:       _t.unsigned_long,
    averageConsumption:       _t.unsigned_long,
    fuelConsumedSinceRestart: _t.unsigned_long,
    vehicleTimeSinceRestart:  _t.unsigned_long
};

/*
 * EngineOil
 */
_t.EngineOil = {
    remaining:   _t.unsigned_short,
    temperature: _t.long,
    pressure:    _t.unsigned_short
};

/*
 * Temperature
 */
_t.Temperature = {
    interiorTemperature: _t.float,
    exteriorTemperature: _t.float
};

/*
 * RainSensor
 */
_t.RainSensor = {
    rain: _t.byte,
    zone: _t.unsigned_short
};

/*
 * Sunroof
 */
_t.Sunroof = {
    openness: _t.byte,
    tilt:     _t.byte
};

/*
 * ConvertibleRoof
 */
_t.ConvertibleRoof = {
    status: _t.ConvertibleRoofStatus
};

/*
 * Identification
 */
_t.Identification = {
    WMI:         _t.DOMString,
    VIN:         _t.DOMString,
    brand:       _t.DOMString,
    model:       _t.DOMString,
    year:        _t.DOMString,
    vehicleType: _t.VehicleTypeEnum
};

/*
 * SizeConfiguration
 */
_t.SizeConfiguration = {
    width:      _t.unsigned_short,
    height:     _t.unsigned_short,
    length:     _t.unsigned_short,
    doorsCount: [_t.unsigned_short],
    totalDoors: _t.unsigned_short
};

/*
 * FuelConfiguration
 */
_t.FuelConfiguration = {
    fuelType:       _t.FuelTypeEnum,
    refuelPosition: _t.unsigned_short
};

/*
 * TransmissionConfiguration
 */
_t.TransmissionConfiguration = {
    transmissionGearType: _t.TransmissionGearTypeEnum
};

/*
 * Odometer
 */
_t.Odometer = {
    distanceSinceStart: _t.unsigned_long,
    distanceTotal:      _t.unsigned_long
};

/*
 * ParkingBrake
 */
_t.ParkingBrake = {
    status: _t.ParkingBrakeStatus
};

/*
 * AntilockBrakingSystem
 */
_t.AntilockBrakingSystem = {
    enabled: _t.boolean,
    engaged: _t.boolean
};

/*
 * TractionControlSystem
 */
_t.TractionControlSystem = {
    enabled: _t.boolean,
    engaged: _t.boolean
};

/*
 * AirbagStatus
 */
_t.AirbagStatus = {
    activated: _t.boolean,
    deployed:  _t.boolean,
    zone:      _t.unsigned_short
};

/*
 * NightMode
 */
_t.NightMode = {
    mode: _t.boolean
};

/*
 * DrivingMode
 */
_t.DrivingMode = {
    mode: _t.boolean
};

/*
 * ButtonEvent
 */
_t.ButtonEvent = {
    buttonEvent: _t.unsigned_short
};

/*
 * SteeringWheel
 */
_t.SteeringWheel = {
    angle: _t.short
};

/*
 * ThrottlePosition
 */
_t.ThrottlePosition = {
    value: _t.unsigned_short
};

/*
 * EngineCoolant
 */
_t.EngineCoolant = {
    level:       _t.unsigned_short,
    temperature: _t.unsigned_short
};

/*
 * BrakeOperation
 */
_t.BrakeOperation = {
    brakePedalDepressed: _t.boolean
};

/*
 * Tire
 */
_t.Tire = {
    pressureLow: _t.boolean,
    pressure:    _t.unsigned_short,
    temperature: _t.short,
    zone:        _t.unsigned_short
};

/*
 * Door
 */
_t.Door = {
    status: _t.DoorOpenStatus,
    lock:   _t.boolean,
    zone:   _t.unsigned_short
};

/*
 * Defrost
 */
_t.Defrost = {
    defrostWindow:  _t.boolean,
    defrostMirrors: _t.boolean,
    zone:           _t.unsigned_short
};

/*
 * ClimateControl
 */
_t.ClimateControl = {
    airflowDirection:    _t.AirflowDirection,
    fanSpeedLevel:       _t.byte,
    targetTemperature:   _t.byte,
    airConditioning:     _t.boolean,
    heater:              _t.boolean,
    seatHeater:          _t.byte,
    seatCooler:          _t.byte,
    airRecirculation:    _t.boolean,
    steeringWheelHeater: _t.byte,
    zone:                _t.unsigned_short
};

/*
 * BatteryStatus
 */
_t.BatteryStatus = {
    chargeLevel: _t.unsigned_short,
    voltage:     _t.unsigned_short,
    current:     _t.unsigned_short,
    zone:        _t.unsigned_short
};

/*
 * VehicleCommonDataType
 */
_t.VehicleCommonDataType = {
    timeStamp: _t.unsigned_long_long,

    _derived: [_t.VehicleSpeed, _t.WheelSpeed, _t.EngineSpeed,
        _t.VehiclePowerModeType, _t.Acceleration, _t.Transmission,
        _t.CruiseControlStatus, _t.LightStatus, _t.InteriorLightStatus, _t.Horn,
        _t.Fuel, _t.EngineOil, _t.Temperature, _t.RainSensor, _t.Sunroof,
        _t.ConvertibleRoof, _t.Identification, _t.SizeConfiguration,
        _t.FuelConfiguration, _t.TransmissionConfiguration, _t.Odometer,
        _t.ParkingBrake, _t.AntilockBrakingSystem, _t.TractionControlSystem,
        _t.AirbagStatus, _t.NightMode, _t.ButtonEvent, _t.SteeringWheel,
        _t.ThrottlePosition, _t.EngineCoolant, _t.BrakeOperation, _t.Tire,
        _t.Door, _t.Defrost, _t.ClimateControl, _t.BatteryStatus]
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
    // Locale
    Locale:             {},

    // Media Server
    MediaServerManager: {},
    MediaServer:        {},
    MediaContainer:     {},

    // Speech
    SpeechManager:      {},

    // Vehicle
    Vehicle:            {}
};

// Locale
_i.Locale.setLocale = {
    0: _t.DOMString
};

_i.Locale.getLocale = null;

_i.Locale.localeChanged = {
    0: _t.LocaleChangedCallback
};

// Media Server
_i.MediaServerManager.scanNetwork = {
    0: _t.MediaServerErrorCallback,

    _optional: {
        // nullable
        0: true
    }
};

_i.MediaServer.upload = {
    0: _t.DOMString
};

_i.MediaServer.createFolder = {
    0: _t.DOMString
};

_i.MediaServer.browse = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.unsigned_long,
    3: _t.unsigned_long,
    4: _t.MediaServerErrorCallback,

    _optional: {
        // nullable
        4: true
    }
};

_i.MediaServer.find = {
    0: _t.DOMString,
    1: _t.DOMString,
    2: _t.DOMString,
    3: _t.unsigned_long,
    4: _t.unsigned_long,
    5: _t.MediaServerErrorCallback,

    _optional: {
        // nullable
        5: true
    }
};

_i.MediaContainer.upload = {
    0: _t.DOMString,
    1: _t.DOMString
};

_i.MediaContainer.createFolder = {
    0: _t.DOMString
};

// Speech
_i.SpeechManager.vocalizeString = {
    0: _t.DOMString
};

_i.SpeechManager.setCBListener = {
    0: _t.Function,

    _optional: {
        // nullable
        0: true
    }
};

// Vehicle
_i.Vehicle.get = {
    0: _t.short,

    _optional: {
        // nullable
        0: true
    }
};

_i.Vehicle.subscribe = {
    0: _t.VehiclePropertyCallback,
    1: _t.short,

    _optional: {
        // nullable
        1: true
    }
};

_i.Vehicle.unsubscribe = {
    0: _t.unsigned_short,
};

_i.Vehicle.set = {
    0: _t.VehicleCommonDataType,
    1: _t.short,

    _optional: {
        // nullable
        1: true
    }
};

_i.Vehicle.getHistory = {
    0: _t.Date,
    1: _t.Date,
    2: _t.short,

    _optional: {
        // nullable
        2: true
    }
};

// Exports
_t.constructor = _c;
_t.interface   = _i;

module.exports = _t;
