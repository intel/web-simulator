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
    "long long":                        "long long",
    "unsigned long":                    "unsigned long",
    "unsigned long long":               "unsigned long long",
    "unsigned short":                   "unsigned short"
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
 * VehicleSpeed
 */
_t.VehicleSpeed = {
    vehicleSpeed: _t["unsigned long"]
};

/*
 * EngineSpeed
 */
_t.EngineSpeed = {
    engineSpeed: _t["unsigned long"]
};

/*
 * VehiclePowerMode
 */
_t.VehiclePowerMode = {
    vehiclePowerMode: _t.octet
};

/*
 * TripMeters
 */
_t.TripMeter = {
    tripMeters: [_t["unsigned long"]]
};

/*
 * Acceleration
 */
_t.Acceleration = {
    x: _t["unsigned long"],
    y: _t["unsigned long"],
    z: _t["unsigned long"]
};

/*
 * Transmission
 */
_t.Transmission = {
    gearPosition: _t.octet,
    mode: _t.octet
};

/*
 * CruiseControlStatus
 */
_t.CruiseControlStatus = {
    activated: _t.boolean,
    speed: _t["unsigned short"]
};
/*
 * WheelBrake
 */
_t.WheelBrake = {
    engaged: _t.boolean
};

/*
 * LightStatus
 */
_t.LightStatus = {
    head: _t.boolean,
    rightTurn: _t.boolean,
    leftTurn: _t.boolean,
    brake: _t.boolean,
    fog: _t.boolean,
    hazard: _t.boolean,
    parking: _t.boolean,
    highBeam: _t.boolean
};

/*
 * InteriorLightStatus
 */
_t.InteriorLightStatus = {
    passenger: _t.boolean,
    driver: _t.boolean,
    center: _t.boolean
};

/*
 * Horn
 */
_t.Horn = {
    on: _t.On
};

/*
 * Fuel
 */
_t.Fuel = {
    level: _t["unsigned short"],
    range: _t["unsigned short"],
    instantConsumption: _t["unsigned short"],
    instantEconomy: _t["unsigned short"],
    averageEconomy: _t["unsigned short"]
};

/*
 * EngineOil
 */
_t.EngineOil = {
    remaining: _t["unsigned short"],
    temperature: _t.long,
    pressure: _t["unsigned short"]
};

/*
 * Location
 */
_t.Location = {
    latitude: _t.double,
    longitude: _t.double,
    altitude: _t.double,
    direction: _t["unsigned short"]
};

/*
 * ExteriorBrightness
 */
_t.ExteriorBrightness = {
    exteriorBrightness: _t["unsigned long"]
};

/*
 * Temperature
 */
_t.Temperature = {
    interior: _t.short,
    exterior: _t.short
};

/*
 * RainSensor
 */
_t.RainSensor = {
    rainSensor: _t["unsigned short"]
};

/*
 * WindshieldWiper
 */
_t.WindshieldWiper = {
    windshieldWiper: _t["unsigned short"]
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
    airflowDirection: _t["unsigned short"],
    fanSpeed: _t["unsigned short"],
    targetTemperature: _t["unsigned short"],
    airConditioning: _t.boolean,
    airRecirculation: _t.boolean,
    heater: _t.boolean,
    defrost: _t.DefrostDictionary,
    steeringWheelHeater: _t.boolean,
    seatHeater: _t.boolean,
    seatCooler: _t.boolean
};

/*
 * WindowStatus
 */
_t.WindowStatus = {
    WindowStatus: _t.any
};

/*
 * Sunroof
 */
_t.Sunroof = {
    openness: _t["unsigned short"],
    tilt: _t["unsigned short"]
};

/*
 * ConvertibleRoof
 */
_t.ConvertibleRoof = {
    openness: _t["unsigned short"]
};

/*
 * VehicleId
 */
_t.VehicleId = {
    WMI: _t.DOMString,
    VIN: _t.DOMString
};

/*
 * Size
 */
_t.Size = {
    width: _t["unsigned long"],
    height: _t["unsigned long"],
    length: _t["unsigned long"]
};

/*
 * FuelInfo
 */
_t.FuelInfo = {
    type: _t["unsigned short"],
    refuelPosition: _t["unsigned short"]
};

/*
 * VehicleType
 */
_t.VehicleType = {
    type: _t["unsigned short"]
};

/*
 * Doors
 */
_t.Doors = {
    doorsPerRow: [_t["unsigned short"]]
};

/*
 * TransmissionGearType
 */
_t.TransmissionGearType = {
    transmissionGearType: _t["unsigned short"]
};

/*
 * WheelInformation
 */
_t.WheelInformation = {
    frontWheelRadius: _t["unsigned short"],
    rearWheelRadius: _t["unsigned short"],
    wheelTrack: _t["unsigned long"],
    ABS: _t.boolean
};

/*
 * Odometer
 */
_t.Odometer = {
    odometer: _t["unsigned long"]
};

/*
 * Fluid
 */
_t.Fluid = {
    transmission: _t["unsigned short"],
    brake: _t["unsigned short"],
    washer: _t["unsigned short"]
};

/*
 * Battery
 */
_t.Battery = {
    voltage: _t.double,
    current: _t.double
};

/*
 * TirePressure
 */
_t.TirePressure = {
    leftFront: _t.double,
    rightFront: _t.double,
    leftRear: _t.double,
    rightRear: _t.double
};

/*
 * TireTemperature
 */
_t.TireTemperature = {
    leftFront: _t.double,
    rightFront: _t.double,
    leftRear: _t.double,
    rightRear: _t.double
};

/*
 * SecurityAlert
 */
_t.SecurityAlert = {
    securityAlert: _t.boolean
};

/*
 * ParkingBrake
 */
_t.ParkingBrake = {
    parkingBrake: _t.boolean
};

/*
 * ParkingLight
 */
_t.ParkingLight = {
    parkingLight: _t.boolean
};

/*
 * HazardLight
 */
_t.HazardLight = {
    hazardLight: _t.boolean
};

/*
 * AntilockBrakingSystem
 */
_t.AntilockBrakingSystem = {
    antilockBrakingSystem: _t.boolean
};

/*
 * TractionControlSystem
 */
_t.TractionControlSystem = {
    tractionControlSystem: _t.boolean
};

/*
 * VehicleTopSpeedLimit
 */
_t.VehicleTopSpeedLimit = {
    vehicleTopSpeedLimit: _t["unsigned short"]
};

/*
 * AirbagStatus
 */
_t.AirbagStatus = {
    airbagStatus: _t.any
};

/*
 * DoorStatus
 */
_t.DoorStatus = {
    doorStatus: _t.any,
    doorLockStatus: _t.any,
    childLockStatus: _t.boolean
};

/*
 * SeatBeltStatus
 */
_t.SeatBeltStatus = {
    seatBeltStatus: _t.any
};

/*
 * OccupantStatus
 */
_t.OccupantStatus = {
    occupantStatus: _t.any
};

/*
 * ObstacleDistance
 */
_t.ObstacleDistance = {
    obstacleDistance: _t.any
};

/*
 * VehiclePropertyType
 */
_t.VehiclePropertyType = {
    time: _t["unsigned long long"],
    zone: _t.short,
    source: _t.DOMString,

    _derived: [_t.VehicleSpeed, _t.EngineSpeed, _t.VehiclePowerMode,
        _t.TripMeter, _t.Acceleration, _t.Transmission,
        _t.CruiseControlStatus, _t.WheelBrake, _t.LightStatus,
        _t.InteriorLightStatus, _t.Horn, _t.Fuel, _t.EngineOil, _t.Location,
        _t.ExteriorBrightness, _t.Temperature, _t.RainSensor,
        _t.WindshieldWiper, _t.HVAC, _t.WindowStatus, _t.Sunroof,
        _t.ConvertibleRoof, _t.VehicleId, _t.Size, _t.FuelInfo, _t.VehicleType,
        _t.Doors, _t.TransmissionGearType, _t.WheelInformation, _t.Odometer,
        _t.Fluid, _t.Battery, _t.TirePressure, _t.TireTemperature,
        _t.SecurityAlert, _t.ParkingBrake, _t.ParkingLight, _t.HazardLight,
        _t.AntilockBrakingSystem, _t.TractionControlSystem,
        _t.VehicleTopSpeedLimit, _t.AirbagStatus, _t.DoorStatus,
        _t.SeatBeltStatus, _t.OccupantStatus, _t.ObstacleDistance]
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

_i.Vehicle.get = {
    0: _t.DOMString,
    1: _t.short,

    _optional: {
        // nullable
        1: true
    }
};

_i.Vehicle.subscribe = {
    0: _t.DOMString,
    1: _t.VehiclePropertyCallback,
    2: _t.short,
    3: _t.VehiclePropertyErrorCallback,

    _optional: {
        // nullable
        2: true,
        3: true
    }
};

_i.Vehicle.set = {
    0: _t.DOMString,
    1: _t.VehiclePropertyType,
    2: _t.VehiclePropertyErrorCallback,

    _optional: {
        // nullable
        2: true
    }
};

_i.Vehicle.getHistory = {
    0: _t.DOMString,
    1: _t.short,
    2: _t.Date,
    3: _t.Date,
    4: _t.VehiclePropertyListCallback,
    5: _t.VehiclePropertyErrorCallback,

    _optional: {
        // nullable
        5: true
    }
};

// Exports
_t.constructor = _c;
_t.interface   = _i;

module.exports = _t;
