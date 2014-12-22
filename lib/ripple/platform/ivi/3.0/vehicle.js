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

var utils = require('ripple/utils'),
    event = require('ripple/event'),
    t = require('ripple/platform/ivi/3.0/typecast'),
    errorcode = require('ripple/platform/ivi/3.0/errorcode'),
    WebAPIError = require('ripple/platform/ivi/3.0/WebAPIError'),
    VehicleCommonDataType,
    //Configuration and Identification Interfaces
    Identification,
    SizeConfiguration,
    FuelConfiguration,
    TransmissionConfiguration,
    WheelConfiguration,
    SteeringWheelConfiguration,
    //Running Status Interfaces
    VehicleSpeed,
    WheelSpeed,
    EngineSpeed,
    VehiclePowerModeType,
    PowerTrainTorque,
    AcceleratorPedalPosition,
    ThrottlePosition,
    //TripMeters   ------no work
    Diagnostic,
    Transmission,
    CruiseControlStatus,
    LightStatus,
    InteriorLightStatus,
    Horn,
    Chime,
    Fuel,
    EngineOil,
    Acceleration,
    EngineCoolant,
    SteeringWheel,
    IgnitionTime,
    YawRate,
    BrakeOperation,
    WheelTick,
    ButtonEvent,
    DrivingMode,
    NightMode,
    //Maintenance Interfaces
    Odometer,
    BatteryStatus,
    Tire,
    //DrivingSafety Interfaces
    AntilockBrakingSystem,
    TractionControlSystem,
    AirbagStatus,
    Door,
    //Climate Interfaces
    Temperature,
    RainSensor,
    Defrost,
    ClimateControl,
    Sunroof,
    ConvertibleRoof,
    //Vision and Parking Interfaces
    ParkingBrake,
    //
    VehicleFactory,
    _data = {
        nHandle: 0,          //subscribe listener flag
        supported: null,     //current supported properties
        history: null,         //all properties data
        cache: null,         //current all properties data
        properties: {}       //properties name
    },
    _security = {
        "http://tizen.org/privilege/vehicle": []
    },
    _self;

function _initialize () {
    _data.properties.common = ["diagnostic"];
    _data.properties.conf = [
        "identification", "sizeConfiguration", "fuelConfiguration",
        "transmissionConfiguration", "wheelConfiguration",
        "steeringWheelConfiguration"
    ];
    _data.properties.signal = [
        "vehicleSpeed", "wheelSpeed", "engineSpeed", "powerTrainTorque",
        "acceleratorPedalPosition", "throttlePosition", "tripMeters",
        "diagnostic", "transmission", "cruiseControlStatus", "lightStatus",
        "interiorLightStatus", "horn", "chime", "fuel", "engineOil", "acceleration",
        "engineCoolant", "steeringWheel", "ignitionTime", "yawRate",
        "brakeOperation", "wheelTick", "buttonEvent", "drivingMode",
        "nightMode", "odometer", "transmissionOil", "transmissionClutch",
        "brakeMaintenance", "washerFluid", "malfunctionIndicator",
        "batteryStatus", "tire", "driverIdentification",
        "languageConfiguration", "unitsOfMeasure", "mirror", "steeringWheel",
        "driveMode", "seatAdjustment", "dashboardIllumination", "vehicleSound",
        "antilockBrakingSystem", "tractionControlSystem",
        "electronicStabilityControl", "topSpeedLimit", "airbagStatus", "door",
        "childSafetyLock", "seat", "temperature", "rainSensor", "wiperStatus",
        "wiperSetting", "defrost", "sunroof", "convertibleRoof", "sideWindow",
        "climateControl", "atmosphericPressure", "laneDepartureStatus", "alarm",
        "parkingBrake", "parkingLights"
    ];

    event.on("vehicle-cache-refresh", function (supported, data) {
        _data.supported = supported;
        _data.cache = data;
    });

    event.trigger("vehicle-cache-request", [_data]);
}

event.on("vehicle-subscribe-response", function(propertyObj) {
    var property = propertyObj.type, success, handle, value;

    if (_data[property]) {
        for (handle in _data[property]) {
            success = _data[property][handle];
            value = new VehicleFactory(property, propertyObj.val);
            value['interfaceName'] = property; 
            success(value);
        }
    }
});

event.on("vehicle-history-response", function(history) {
    _data.history = history;
});

function VehicleInterface (property) {
    function _supported() {
        t.Vehicle("supported", arguments);

        if (_data.supported.indexOf(property) === -1) {
            return false;
        }

        return true;
    }

    function _getFrom() {
        var history = _data.history;

        for (var i = 0; i < history.length; i++) {
            if (history[i][property]) {
                return history[i][property].timeStamp;
            }
        }
        return null;
    }

    function _getTo() {
        var history = _data.history;

        for (var i = history.length - 1; i >= 0; i--) {
            if (history[i][property]) {
                return history[i][property].timeStamp;
            }
        }
        return null;
    }

    this.__defineGetter__("supported", function () {
        return _supported(property);
    });

    this.__defineGetter__("zones", function () {
        return null;
    });

    this.__defineGetter__("isLogged", function () {
        return true;
    });

    this.__defineGetter__("from", function () {
        return new Date(_getFrom());
    });

    this.__defineGetter__("to", function () {
        return new Date(_getTo());
    });

    this.get = function (zone) {
        zone = zone ? zone : 0;
        t.Vehicle("get", arguments);

        var data = {
            then: function (resolve, reject) {
                var data;

                if (_data.supported.indexOf(property) === -1) {
                    reject(new WebAPIError(errorcode.PROPERTY_UNAVAILABLE));
                    return;
                }

                data = new VehicleFactory(property, _data.cache[property]);
                resolve(data);
            },
            interfaceName: property,
            zone: zone
        };

        for(var pro in _data.cache[property]) {
             data[pro] = _data.cache[property][pro];
        }
       
        return data;
    };

    this.getHistory = function (begin, end, zone) {
        zone = zone ? zone : 0;
        t.Vehicle("getHistory", arguments);

        return {
            then: function (resolve) {
                var history = _data.history,
                    data = [],
                    i, val, timeStamp;

                if (!begin || !end) {
                    resolve(data);
                    return;
                }
                begin = begin.getTime();
                end = end.getTime();

                for ( i = 0; i < history.length; i++) {
                    val = history[i][property];

                    if (val) {
                        timeStamp = val.timeStamp;
                        if (timeStamp < begin || timeStamp > end) {
                            continue;
                        }

                        data.push(new VehicleFactory(property, val));
                    }
                }

                resolve(data);
            }
        };
    };

    this.availableForRetrieval = function (attr) {
        if (_data.supported.indexOf(property) === -1) {
            return "not_supported";
        }
        return "available";
    };

    this.availabilityChangedListener = function (callback) {
        return 0;
    };

    this.removeAvailabilityChangedListener = function (handle) {
        return;
    };
}

function VehicleConfigurationInterface (property) {
    VehicleInterface.call(this, property);
}

function VehicleSignalInterface (property) {
    VehicleInterface.call(this, property);

    this.set = function (value, zone) {
        zone = zone ? zone : 0;
        t.Vehicle("set", arguments);

        return {
            then: function (resolve, reject) {
                var val = utils.copy(value);

                if (_data.supported.indexOf(property) === -1) {
                    reject(new WebAPIError(errorcode.PROPERTY_UNAVAILABLE));
                    return;
                }
                resolve();
                event.trigger("vehicle-set-request", [property, val]);
            }
        };
    };

    this.subscribe = function (success, zone) {
        var handle = ++_data.nHandle,
            key = "subscribe" + handle;

        zone = zone ? zone : 0;
        t.Vehicle("subscribe", arguments);

        if (!_data[property]) {
            _data[property] = {};
        }

        _data[property][key] = success;

        event.trigger("vehicle-subscribe-request", [property, true, zone]);

        return handle;
    };

    this.unsubscribe = function (handle) {
        var key = "subscribe" + handle;

        t.Vehicle("unsubscribe", arguments);

        if (_data[property] && _data[property][key])
            delete _data[property][key];

        return;
    };

    this.availableForSubscription = function (attr) {
        if (_data.supported.indexOf(property) === -1) {
            return "not_supported";
        }
        return "available";
    };

    this.availableForSetting = function (attr) {
        if (_data.supported.indexOf(property) === -1) {
            return "not_supported";
        }
        return "available";
    };
}

_self = function () {
    var vehicle;

    function _defineInterfaces() {
        var i, propertyName, propertyKey;

        for (i = 0; i < _data.properties.common.length; i++) {
            propertyKey = _data.properties.common[i];
            propertyName = propertyKey.substring(0, 1).toUpperCase() +
                    propertyKey.substring(1);

            vehicle[propertyKey] = {};
            (function(property){
                vehicle[propertyKey] = new VehicleInterface(property);
            })(propertyName);
        }

        for (i = 0; i < _data.properties.conf.length; i++) {
            propertyKey = _data.properties.conf[i];
            propertyName = propertyKey.substring(0, 1).toUpperCase() +
                    propertyKey.substring(1);

            vehicle[propertyKey] = {};
            (function(property){
                vehicle[propertyKey] = new VehicleConfigurationInterface(property);
            })(propertyName);
        }

        for (i = 0; i < _data.properties.signal.length; i++) {
            propertyKey = _data.properties.signal[i];
            propertyName = propertyKey.substring(0, 1).toUpperCase() +
                    propertyKey.substring(1);

            vehicle[propertyKey] = {};
            (function(property){
                vehicle[propertyKey] = new VehicleSignalInterface(property);
            })(propertyName);
        }
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
        handleSubFeatures: handleSubFeatures
    };
    _defineInterfaces();

    return vehicle;
};

VehicleFactory = function (vehicleType, value) {
    var instanceType;

    switch (vehicleType) {
    //configuration
    case "Identification":
        instanceType = new Identification(value);
        break;
    case "SizeConfiguration":
        instanceType = new SizeConfiguration(value);
        break;
    case "FuelConfiguration":
        instanceType = new FuelConfiguration(value);
        break;
    case "TransmissionConfiguration":
        instanceType = new TransmissionConfiguration(value);
        break;
    case "WheelConfiguration":
        instanceType = new WheelConfiguration(value);
        break;
    case "SteeringWheelConfiguration":
        instanceType = new SteeringWheelConfiguration(value);
        break;
    //signal
    case "VehicleSpeed":
        instanceType = new VehicleSpeed(value);
        break;
    case "WheelSpeed":
        instanceType = new WheelSpeed(value);
        break;
    case "EngineSpeed":
        instanceType = new EngineSpeed(value);
        break;
    case "VehiclePowerModeType":
        instanceType = new VehiclePowerModeType(value);
        break;
    case "PowerTrainTorque":
        instanceType = new PowerTrainTorque(value);
        break;
    case "AcceleratorPedalPosition":
        instanceType = new AcceleratorPedalPosition(value);
        break;
    case "ThrottlePosition":
        instanceType = new ThrottlePosition(value);
        break;
    case "Diagnostic":
        instanceType = new Diagnostic(value);
        break;
    case "Transmission":
        instanceType = new Transmission(value);
        break;
    case "CruiseControlStatus":
        instanceType = new CruiseControlStatus(value);
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
    case "Chime":
        instanceType = new Chime(value);
        break;
    case "Fuel":
        instanceType = new Fuel(value);
        break;
    case "EngineOil":
        instanceType = new EngineOil(value);
        break;
    case "Acceleration":
        instanceType = new Acceleration(value);
        break;
    case "EngineCoolant":
        instanceType = new EngineCoolant(value);
        break;
    case "SteeringWheel":
        instanceType = new SteeringWheel(value);
        break;
    case "IgnitionTime":
        instanceType = new IgnitionTime(value);
        break;
    case "YawRate":
        instanceType = new YawRate(value);
        break;
    case "BrakeOperation":
        instanceType = new BrakeOperation(value);
        break;
    case "WheelTick":
        instanceType = new WheelTick(value);
        break;
    case "ButtonEvent":
        instanceType = new ButtonEvent(value);
        break;
    case "DrivingMode":
        instanceType = new DrivingMode(value);
        break;
    case "NightMode":
        instanceType = new NightMode(value);
        break;
    //
    case "Odometer":
        instanceType = new Odometer(value);
        break;
    case "BatteryStatus":
        instanceType = new BatteryStatus(value);
        break;
    case "Tire":
        instanceType = new Tire(value);
        break;
    //
    case "AntilockBrakingSystem":
        instanceType = new AntilockBrakingSystem(value);
        break;
    case "TractionControlSystem":
        instanceType = new TractionControlSystem(value);
        break;
    case "AirbagStatus":
        instanceType = new AirbagStatus(value);
        break;
    case "Door":
        instanceType = new Door(value);
        break;
    //
    case "Temperature":
        instanceType = new Temperature(value);
        break;
    case "RainSensor":
        instanceType = new RainSensor(value);
        break;
    case "Defrost":
        instanceType = new Defrost(value);
        break;
    case "ClimateControl":
        instanceType = new ClimateControl(value);
        break;
    case "Sunroof":
        instanceType = new Sunroof(value);
        break;
    case "ConvertibleRoof":
        instanceType = new ConvertibleRoof(value);
        break;
    //
    case "ParkingBrake":
        instanceType = new ParkingBrake(value);
        break;
    }

    function _construct () {
        var val;

        for (val in value) {
            instanceType[val] = value[val];
        }
        return instanceType;
    }

    return _construct();
};

VehicleCommonDataType = function (propertyTypes) {
    var commonData = {};

    if (propertyTypes == null) {
        commonData.timeStamp = null;
    } else {
        commonData.timeStamp = propertyTypes.timeStamp;
    }

    this.__defineGetter__("timeStamp", function () {
        return commonData.timeStamp;
    });
};

VehiclePowerModeType = function (propertyTypes) {
    var vehiclePowerMode = {};

    VehicleCommonDataType.call(this, propertyTypes);

    vehiclePowerMode.value = propertyTypes.value || "off";

    this.__defineGetter__("value", function () {
        return vehiclePowerMode.value;
    });
};

Horn = function (propertyTypes) {
    var horn = {};

    VehicleCommonDataType.call(this, propertyTypes);

    horn.status = propertyTypes.status || false;

    this.__defineGetter__("status", function () {
        return horn.status;
    });

    this.__defineSetter__("status", function (val) {
        try {
            horn.status = t.boolean(val);
        } catch (err) {
        }
    });
};

RainSensor = function (propertyTypes) {
    var rainSensor = {};

    VehicleCommonDataType.call(this, propertyTypes);

    rainSensor.rain = propertyTypes.rain || 0;
    rainSensor.zone = propertyTypes.zone || 0;

    this.__defineGetter__("rain", function () {
        return rainSensor.rain;
    });

    this.__defineSetter__("rain", function (val) {
        try {
            val = t.byte(val);
            if (val >= 0 && val <= 10) {
                rainSensor.rain = val;
            }
        } catch (err) {
        }
    });

    this.__defineGetter__("zone", function () {
        return rainSensor.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            rainSensor.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

Sunroof = function (propertyTypes) {
    var sunroof = {};

    VehicleCommonDataType.call(this, propertyTypes);

    sunroof.openness = propertyTypes.openness || 0;
    sunroof.tilt = propertyTypes.tilt || 0;
    sunroof.zone = propertyTypes.zone || 0;

    this.__defineGetter__("openness", function () {
        return sunroof.openness;
    });

    this.__defineSetter__("openness", function (val) {
        try {
            val = t.byte(val);
            if (val >= 0 && val <= 100) {
                sunroof.openness = val;
            }
        } catch (err) {
        }
    });

    this.__defineGetter__("tilt", function () {
        return sunroof.tilt;
    });

    this.__defineSetter__("tilt", function (val) {
        try {
            val = t.byte(val);
            if (val >= 0 && val <= 100) {
                sunroof.tilt = val;
            }
        } catch (err) {
        }
    });

    this.__defineGetter__("zone", function () {
        return sunroof.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            sunroof.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

ConvertibleRoof = function (propertyTypes) {
    var convertibleRoof = {};

    VehicleCommonDataType.call(this, propertyTypes);

    convertibleRoof.status = propertyTypes.status || "closed";

    this.__defineGetter__("status", function () {
        return convertibleRoof.status;
    });

    this.__defineSetter__("status", function (val) {
        try {
            convertibleRoof.status = t.ConvertibleRoofStatus(val);
        } catch (err) {
        }
    });
};

Identification = function (propertyTypes) {
    var identification = {};

    VehicleCommonDataType.call(this, propertyTypes);

    identification.VIN = propertyTypes.VIN || null;
    identification.WMI = propertyTypes.WMI || null;
    identification.brand = propertyTypes.brand || null;
    identification.model = propertyTypes.model || null;
    identification.year = propertyTypes.year || null;
    identification.vehicleType = propertyTypes.vehicleType || null;

    this.__defineGetter__("VIN", function () {
        return identification.VIN;
    });

    this.__defineGetter__("WMI", function () {
        return identification.WMI;
    });

    this.__defineGetter__("brand", function () {
        return identification.brand;
    });

    this.__defineGetter__("model", function () {
        return identification.model;
    });

    this.__defineGetter__("year", function () {
        return identification.year;
    });

    this.__defineGetter__("vehicleType", function () {
        return identification.vehicleType;
    });
};

SizeConfiguration = function (propertyTypes) {
    var sizeConfiguration = {};

    VehicleCommonDataType.call(this, propertyTypes);

    sizeConfiguration.doorsCount = propertyTypes.doorsCount || null;
    sizeConfiguration.height = propertyTypes.height || null;
    sizeConfiguration.length = propertyTypes.length || null;
    sizeConfiguration.totalDoors = propertyTypes.totalDoors || null;
    sizeConfiguration.width = propertyTypes.width || null;

    this.__defineGetter__("doorsCount", function () {
        return sizeConfiguration.doorsCount;
    });

    this.__defineGetter__("height", function () {
        return sizeConfiguration.height;
    });

    this.__defineGetter__("length", function () {
        return sizeConfiguration.length;
    });

    this.__defineGetter__("totalDoors", function () {
        return sizeConfiguration.totalDoors;
    });

    this.__defineGetter__("width", function () {
        return sizeConfiguration.width;
    });
};

FuelConfiguration = function (propertyTypes) {
    var fuelConfiguration = {};

    VehicleCommonDataType.call(this, propertyTypes);

    fuelConfiguration.fuelType = propertyTypes.fuelType || null;
    fuelConfiguration.refuelPosition = propertyTypes.refuelPosition || null;

    this.__defineGetter__("fuelType", function () {
        return fuelConfiguration.fuelType;
    });

    this.__defineGetter__("refuelPosition", function () {
        return fuelConfiguration.refuelPosition;
    });
};

TransmissionConfiguration = function (propertyTypes) {
    var transmissionConfiguration = {};

    VehicleCommonDataType.call(this, propertyTypes);

    transmissionConfiguration.transmissionGearType =
        propertyTypes.transmissionGearType || null;

    this.__defineGetter__("transmissionGearType", function () {
        return transmissionConfiguration.transmissionGearType;
    });
};

WheelConfiguration = function (propertyTypes) {
    var wheelConfiguration = {};

    VehicleCommonDataType.call(this, propertyTypes);

    wheelConfiguration.wheelRadius = propertyTypes.wheelRadius || null;
    wheelConfiguration.zone = propertyTypes.zone || 0;

    this.__defineGetter__("wheelRadius", function () {
        return wheelConfiguration.wheelRadius;
    });

    this.__defineGetter__("zone", function () {
        return wheelConfiguration.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            wheelConfiguration.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

SteeringWheelConfiguration = function (propertyTypes) {
    var steeringWheelConfiguration = {};

    VehicleCommonDataType.call(this, propertyTypes);

    steeringWheelConfiguration.steeringWheelLeft =
        propertyTypes.steeringWheelLeft || null;

    this.__defineGetter__("steeringWheelLeft", function () {
        return steeringWheelConfiguration.steeringWheelLeft;
    });
};

VehicleSpeed = function (propertyTypes) {
    var vehicleSpeed = {};

    VehicleCommonDataType.call(this, propertyTypes);

    vehicleSpeed.speed = propertyTypes.speed || 0;

    this.__defineGetter__("speed", function () {
        return vehicleSpeed.speed;
    });
};

WheelSpeed = function (propertyTypes) {
    var wheelSpeed = {};

    VehicleCommonDataType.call(this, propertyTypes);

    wheelSpeed.speed = propertyTypes.speed || 0;
    wheelSpeed.zone = propertyTypes.zone || 0;

    this.__defineGetter__("speed", function () {
        return wheelSpeed.speed;
    });

    this.__defineGetter__("zone", function () {
        return wheelSpeed.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            wheelSpeed.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

EngineSpeed = function (propertyTypes) {
    var engineSpeed = {};

    VehicleCommonDataType.call(this, propertyTypes);

    engineSpeed.speed = propertyTypes.speed || 0;

    this.__defineGetter__("speed", function () {
        return engineSpeed.speed;
    });
};

PowerTrainTorque = function (propertyTypes) {
    var powerTrainTorque = {};

    VehicleCommonDataType.call(this, propertyTypes);

    powerTrainTorque.value = propertyTypes.value || 0;

    this.__defineGetter__("value", function () {
        return powerTrainTorque.value;
    });
};

AcceleratorPedalPosition = function (propertyTypes) {
    var acceleratorPedalPosition = {};

    VehicleCommonDataType.call(this, propertyTypes);

    acceleratorPedalPosition.value = propertyTypes.value || 0;

    this.__defineGetter__("value", function () {
        return acceleratorPedalPosition.value;
    });
};

ThrottlePosition = function (propertyTypes) {
    var throttlePosition = {};

    VehicleCommonDataType.call(this, propertyTypes);

    throttlePosition.value = propertyTypes.value || 0;

    this.__defineGetter__("value", function () {
        return throttlePosition.value;
    });
};

Diagnostic = function (propertyTypes) {
    var diagnostic = {};

    VehicleCommonDataType.call(this, propertyTypes);

    diagnostic.accumulatedEngineRuntime =
        propertyTypes.accumulatedEngineRuntime || 0;
    diagnostic.distanceWithMILOn = propertyTypes.distanceWithMILOn || 0;
    diagnostic.distanceSinceCodeCleared =
        propertyTypes.distanceSinceCodeCleared || 0;
    diagnostic.timeRunMILOn = propertyTypes.timeRunMILOn || 0;
    diagnostic.timeTroubleCodeClear = propertyTypes.timeTroubleCodeClear || 0;

    this.__defineGetter__("accumulatedEngineRuntime", function () {
        return diagnostic.accumulatedEngineRuntime;
    });

    this.__defineGetter__("distanceWithMILOn", function () {
        return diagnostic.distanceWithMILOn;
    });

    this.__defineGetter__("distanceSinceCodeCleared", function () {
        return diagnostic.distanceSinceCodeCleared;
    });

    this.__defineGetter__("timeRunMILOn", function () {
        return diagnostic.timeRunMILOn;
    });

    this.__defineGetter__("timeTroubleCodeClear", function () {
        return diagnostic.timeTroubleCodeClear;
    });
};

Transmission = function (propertyTypes) {
    var transmission = {};

    VehicleCommonDataType.call(this, propertyTypes);

    transmission.gear = propertyTypes.gear || null;
    transmission.mode = propertyTypes.mode || null;

    this.__defineGetter__("gear", function () {
        return transmission.gear;
    });

    this.__defineGetter__("mode", function () {
        return transmission.mode;
    });
};

CruiseControlStatus = function (propertyTypes) {
    var cruiseControlStatus = {};

    VehicleCommonDataType.call(this, propertyTypes);

    cruiseControlStatus.status = propertyTypes.status || false;
    cruiseControlStatus.speed = propertyTypes.speed || 0;

    this.__defineGetter__("status", function () {
        return cruiseControlStatus.status;
    });

    this.__defineGetter__("speed", function () {
        return cruiseControlStatus.speed;
    });
};

LightStatus = function (propertyTypes) {
    var lightStatus = {};

    VehicleCommonDataType.call(this, propertyTypes);

    lightStatus.head = propertyTypes.head || false;
    lightStatus.rightTurn = propertyTypes.rightTurn || false;
    lightStatus.leftTurn = propertyTypes.leftTurn || false;
    lightStatus.brake = propertyTypes.brake || false;
    lightStatus.fog = propertyTypes.fog || null;
    lightStatus.hazard = propertyTypes.hazard || false;
    lightStatus.parking = propertyTypes.parking || false;
    lightStatus.highBeam = propertyTypes.highBeam || false;
    lightStatus.automaticHeadlights = propertyTypes.automaticHeadlights || null;
    lightStatus.dynamicHighBeam = propertyTypes.dynamicHighBeam || null;
    lightStatus.zone = propertyTypes.zone || 0;

    this.__defineGetter__("head", function () {
        return lightStatus.head;
    });

    this.__defineSetter__("head", function (val) {
        try {
            lightStatus.head = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("rightTurn", function () {
        return lightStatus.rightTurn;
    });

    this.__defineSetter__("rightTurn", function (val) {
        try {
            lightStatus.rightTurn = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("leftTurn", function () {
        return lightStatus.leftTurn;
    });

    this.__defineSetter__("leftTurn", function (val) {
        try {
            lightStatus.leftTurn = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("brake", function () {
        return lightStatus.brake;
    });

    this.__defineSetter__("brake", function (val) {
        try {
            lightStatus.brake = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("fog", function () {
        return lightStatus.fog;
    });

    this.__defineSetter__("fog", function (val) {
        try {
            lightStatus.fog = t.boolean(val, "?");
        } catch (err) {
        }
    });

    this.__defineGetter__("hazard", function () {
        return lightStatus.hazard;
    });

    this.__defineSetter__("hazard", function (val) {
        try {
            lightStatus.hazard = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("parking", function () {
        return lightStatus.parking;
    });

    this.__defineSetter__("parking", function (val) {
        try {
            lightStatus.parking = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("highBeam", function () {
        return lightStatus.highBeam;
    });

    this.__defineSetter__("highBeam", function (val) {
        try {
            lightStatus.highBeam = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("automaticHeadlights", function () {
        return lightStatus.automaticHeadlights;
    });

    this.__defineSetter__("automaticHeadlights", function (val) {
        try {
            lightStatus.automaticHeadlights = t.boolean(val, "?");
        } catch (err) {
        }
    });

    this.__defineGetter__("dynamicHighBeam", function () {
        return lightStatus.dynamicHighBeam;
    });

    this.__defineSetter__("dynamicHighBeam", function (val) {
        try {
            lightStatus.dynamicHighBeam = t.boolean(val, "?");
        } catch (err) {
        }
    });

    this.__defineGetter__("zone", function () {
        return lightStatus.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            lightStatus.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

InteriorLightStatus = function (propertyTypes) {
    var interiorLightStatus = {};

    VehicleCommonDataType.call(this, propertyTypes);

    interiorLightStatus.passenger = propertyTypes.passenger || false;
    interiorLightStatus.driver = propertyTypes.driver || false;
    interiorLightStatus.center = propertyTypes.center || false;

    this.__defineGetter__("passenger", function () {
        return interiorLightStatus.passenger;
    });

    this.__defineSetter__("passenger", function (val) {
        try {
            interiorLightStatus.passenger = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("driver", function () {
        return interiorLightStatus.driver;
    });

    this.__defineSetter__("driver", function (val) {
        try {
            interiorLightStatus.driver = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("center", function () {
        return interiorLightStatus.center;
    });

    this.__defineSetter__("center", function (val) {
        try {
            interiorLightStatus.center = t.boolean(val);
        } catch (err) {
        }
    });
};

Chime = function (propertyTypes) {
    var chime = {};

    VehicleCommonDataType.call(this, propertyTypes);

    chime.status = chime.status || false;

    this.__defineGetter__("status", function () {
        return chime.status;
    });
};

Fuel = function (propertyTypes) {
    var fuel = {};

    VehicleCommonDataType.call(this, propertyTypes);

    fuel.level = propertyTypes.level || 0;
    fuel.range = propertyTypes.range || 0;
    fuel.instantConsumption = propertyTypes.instantConsumption || 0;
    fuel.averageConsumption = propertyTypes.averageConsumption || 0;
    fuel.fuelConsumedSinceRestart = propertyTypes.fuelConsumedSinceRestart || 0;
    fuel.vehicleTimeSinceRestart = propertyTypes.vehicleTimeSinceRestart || 0;

    this.__defineGetter__("level", function () {
        return fuel.level;
    });

    this.__defineGetter__("range", function () {
        return fuel.range;
    });

    this.__defineGetter__("instantConsumption", function () {
        return fuel.instantConsumption;
    });

    this.__defineGetter__("averageConsumption", function () {
        return fuel.averageConsumption;
    });

    this.__defineGetter__("fuelConsumedSinceRestart", function () {
        return fuel.fuelConsumedSinceRestart;
    });

    this.__defineGetter__("vehicleTimeSinceRestart", function () {
        return fuel.vehicleTimeSinceRestart;
    });
};

EngineOil = function (propertyTypes) {
    var engineOil = {};

    VehicleCommonDataType.call(this, propertyTypes);

    engineOil.remaining = propertyTypes.remaining || 0;
    engineOil.temperature = propertyTypes.temperature || 0;
    engineOil.pressure = propertyTypes.Pressure || 0;

    this.__defineGetter__("remaining", function () {
        return engineOil.remaining;
    });

    this.__defineSetter__("remaining", function (val) {
        try {
            engineOil.remaining = t.unsigned_short(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("temperature", function () {
        return engineOil.temperature;
    });

    this.__defineSetter__("temperature", function (val) {
        try {
            engineOil.temperature = t.long(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("pressure", function () {
        return engineOil.pressure;
    });

    this.__defineSetter__("pressure", function (val) {
        try {
            engineOil.pressure = t.unsigned_short(val);
        } catch (err) {
        }
    });
};

Acceleration = function (propertyTypes) {
    var acceleration = {};

    VehicleCommonDataType.call(this, propertyTypes);

    acceleration.x = propertyTypes.x || 0;
    acceleration.y = propertyTypes.y || 0;
    acceleration.z = propertyTypes.z || 0;

    this.__defineGetter__("x", function () {
        return acceleration.x;
    });

    this.__defineGetter__("y", function () {
        return acceleration.y;
    });

    this.__defineGetter__("z", function () {
        return acceleration.z;
    });
};

EngineCoolant = function (propertyTypes) {
    var engineCoolant = {};

    VehicleCommonDataType.call(this, propertyTypes);

    engineCoolant.level = propertyTypes.level || 0;
    engineCoolant.temperature = propertyTypes.temperature || 0;

    this.__defineGetter__("level", function () {
        return engineCoolant.level;
    });

    this.__defineGetter__("temperature", function () {
        return engineCoolant.temperature;
    });
};

SteeringWheel = function (propertyTypes) {
    var steeringWheel = {};

    VehicleCommonDataType.call(this, propertyTypes);

    steeringWheel.angle = propertyTypes.angle || 0;

    this.__defineGetter__("angle", function () {
        return steeringWheel.angle;
    });
};

IgnitionTime = function (propertyTypes) {
    var ignitionTime = {};

    VehicleCommonDataType.call(this, propertyTypes);

    ignitionTime.ignitionOnTime = propertyTypes.ignitionOnTime || 0;
    ignitionTime.ignitionOffTime = propertyTypes.ignitionOffTime || 0;

    this.__defineGetter__("ignitionOnTime", function () {
        return ignitionTime.ignitionOnTime;
    });

    this.__defineGetter__("ignitionOffTime", function () {
        return ignitionTime.ignitionOffTime;
    });
};

YawRate = function (propertyTypes) {
    var yawRate = {};

    VehicleCommonDataType.call(this, propertyTypes);

    yawRate.value = propertyTypes.value || 0;

    this.__defineGetter__("value", function () {
        return yawRate.value;
    });
};

BrakeOperation = function (propertyTypes) {
    var brakeOperation = {};

    VehicleCommonDataType.call(this, propertyTypes);

    if (propertyTypes == null) {
        brakeOperation.brakePedalDepressed = false;
    } else {
        brakeOperation.brakePedalDepressed = propertyTypes.brakePedalDepressed;
    }

    this.__defineGetter__("brakePedalDepressed", function () {
        return brakeOperation.brakePedalDepressed;
    });
};

WheelTick = function (propertyTypes) {
    var wheelTick = {};

    VehicleCommonDataType.call(this, propertyTypes);

    wheelTick.value = propertyTypes.value || 0;
    wheelTick.zone = propertyTypes.zone || 0;

    this.__defineGetter__("value", function () {
        return wheelTick.value;
    });

    this.__defineGetter__("zone", function () {
        return wheelTick.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            wheelTick.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

ButtonEvent = function (propertyTypes) {
    var buttonEvent = {};

    VehicleCommonDataType.call(this, propertyTypes);

    buttonEvent.buttonEvent = propertyTypes.buttonEvent || 0;

    this.__defineGetter__("buttonEvent", function () {
        return buttonEvent.buttonEvent;
    });

    this.__defineSetter__("buttonEvent", function (val) {
        try {
            buttonEvent.buttonEvent = t.unsigned_short(val);
        } catch (err) {
        }
    });
};

DrivingMode = function (propertyTypes) {
    var drivingMode = {};

    VehicleCommonDataType.call(this, propertyTypes);

    drivingMode.mode = propertyTypes.mode || false;

    this.__defineGetter__("drivingMode", function () {
        return drivingMode.drivingMode;
    });
};

NightMode = function (propertyTypes) {
    var nightMode = {};

    VehicleCommonDataType.call(this, propertyTypes);

    nightMode.mode = propertyTypes.mode || false;

    this.__defineGetter__("mode", function () {
        return nightMode.mode;
    });

    this.__defineSetter__("mode", function (val) {
        try {
            nightMode.mode = t.boolean(val);
        } catch (err) {
        }
    });
};

Odometer = function (propertyTypes) {
    var odm = {};

    VehicleCommonDataType.call(this, propertyTypes);

    odm.distanceSinceStart = propertyTypes.distanceSinceStart || null;
    odm.distanceTotal = propertyTypes.distanceTotal || 0;

    this.__defineGetter__("distanceSinceStart", function () {
        return odm.distanceSinceStart;
    });

    this.__defineGetter__("distanceTotal", function () {
        return odm.distanceTotal;
    });
};

BatteryStatus = function (propertyTypes) {
    var batteryStatus = {};

    VehicleCommonDataType.call(this, propertyTypes);

    batteryStatus.chargeLevel = propertyTypes.chargeLevel || null;
    batteryStatus.voltage = propertyTypes.voltage || null;
    batteryStatus.current = propertyTypes.current || null;
    batteryStatus.zone = propertyTypes.zone || 0;

    //this is a temporary work around method
    if(batteryStatus.chargeLevel == null) {
        batteryStatus.chargeLevel = batteryStatus.current;
    }

    this.__defineGetter__("chargeLevel", function () {
        return batteryStatus.chargeLevel;
    });

    this.__defineGetter__("voltage", function () {
        return batteryStatus.voltage;
    });

    this.__defineGetter__("current", function () {
        return batteryStatus.current;
    });

    this.__defineGetter__("zone", function () {
        return batteryStatus.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            batteryStatus.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

Tire = function (propertyTypes) {
    var tire = {};

    VehicleCommonDataType.call(this, propertyTypes);

    if (propertyTypes == null) {
        tire.pressureLow = null;
        tire.pressure = null;
        tire.temperature = null;
        tire.zone = 0;
    } else {
        tire.pressureLow = propertyTypes.pressureLow;
        tire.pressure = propertyTypes.pressure;
        tire.temperature = propertyTypes.temperature;
        tire.zone = propertyTypes.zone;
    }
    
    
    this.__defineGetter__("pressureLow", function () {
        return tire.pressureLow;
    });

    this.__defineGetter__("pressure", function () {
        return tire.pressure;
    });

    this.__defineGetter__("zone", function () {
        return tire.zone;
    });

    this.__defineGetter__("temperature", function () {
        return tire.temperature;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            tire.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

AntilockBrakingSystem = function (propertyTypes) {
    var abs = {};

    VehicleCommonDataType.call(this, propertyTypes);

    abs.enabled = propertyTypes.enabled || false;
    abs.engaged = propertyTypes.engaged || false;

    this.__defineGetter__("enabled", function () {
        return abs.enabled;
    });

    this.__defineGetter__("engaged", function () {
        return abs.engaged;
    });
};

TractionControlSystem = function (propertyTypes) {
    var tcs = {};

    VehicleCommonDataType.call(this, propertyTypes);

    tcs.enabled = propertyTypes.enabled || false;
    tcs.engaged = propertyTypes.engaged || false;

    this.__defineGetter__("enabled", function () {
        return tcs.enabled;
    });

    this.__defineGetter__("engaged", function () {
        return tcs.engaged;
    });
};

AirbagStatus = function (propertyTypes) {
    var airbagStatus = {};

    VehicleCommonDataType.call(this, propertyTypes);

    airbagStatus.activated = propertyTypes.activated || false;
    airbagStatus.deployed = propertyTypes.deployed || false;
    airbagStatus.zone = propertyTypes.zone || 0;

    this.__defineGetter__("activated", function () {
        return airbagStatus.activated;
    });

    this.__defineGetter__("deployed", function () {
        return airbagStatus.deployed;
    });

    this.__defineGetter__("zone", function () {
        return airbagStatus.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            airbagStatus.zone = t.unsigned_short(val);
        } catch (err) {
        }
    });
};

Door = function (propertyTypes) {
    var door = {};

    VehicleCommonDataType.call(this, propertyTypes);

    door.status = propertyTypes.status || "closed";
    door.lock = propertyTypes.lock || false;
    door.zone = propertyTypes.zone || 0;

    this.__defineGetter__("status", function () {
        return door.status;
    });

    this.__defineGetter__("lock", function () {
        return door.lock;
    });

    this.__defineSetter__("lock", function (val) {
        try {
            door.lock = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("zone", function () {
        return door.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            door.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

Temperature = function (propertyTypes) {
    var temperature = {};

    VehicleCommonDataType.call(this, propertyTypes);

    temperature.interiorTemperature = propertyTypes.interiorTemperature || 0;
    temperature.exteriorTemperature = propertyTypes.exteriorTemperature || 0;

    this.__defineGetter__("interiorTemperature", function () {
        return temperature.interiorTemperature;
    });

    this.__defineGetter__("exteriorTemperature", function () {
        return temperature.exteriorTemperature;
    });
};

Defrost = function (propertyTypes) {
    var defrost = {};

    VehicleCommonDataType.call(this, propertyTypes);

    defrost.defrostWindow = propertyTypes.defrostWindow || null;
    defrost.defrostMirrors = propertyTypes.defrostMirrors || null;
    defrost.zone = propertyTypes.zone || 0;

    this.__defineGetter__("defrostWindow", function () {
        return defrost.defrostWindow;
    });

    this.__defineSetter__("defrostWindow", function (val) {
        try {
            defrost.defrostWindow = t.boolean(val, "?");
        } catch (err) {
        }
    });

    this.__defineGetter__("defrostMirrors", function () {
        return defrost.defrostMirrors;
    });

    this.__defineSetter__("defrostMirrors", function (val) {
        try {
            defrost.defrostMirrors = t.boolean(val, "?");
        } catch (err) {
        }
    });

    this.__defineGetter__("zone", function () {
        return defrost.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            defrost.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

ClimateControl = function (propertyTypes) {
    var climateControl = {};

    VehicleCommonDataType.call(this, propertyTypes);

    climateControl.airflowDirection = propertyTypes.airflowDirection ||
        "frontpanel";
    climateControl.fanSpeedLevel = propertyTypes.fanSpeedLevel || 0;
    climateControl.targetTemperature = propertyTypes.targetTemperature || null;
    climateControl.airConditioning = propertyTypes.airConditioning || false;
    climateControl.heater = propertyTypes.heater || false;
    climateControl.seatHeater = propertyTypes.seatHeater || null;
    climateControl.seatCooler = propertyTypes.seatCooler || null;
    climateControl.airRecirculation = propertyTypes.airRecirculation || false;
    climateControl.steeringWheelHeater = propertyTypes.steeringWheelHeater ||
        null;
    climateControl.zone = propertyTypes.zone || 0;

    this.__defineGetter__("airflowDirection", function () {
        return climateControl.airflowDirection;
    });

    this.__defineSetter__("airflowDirection", function (val) {
        try {
            climateControl.airflowDirection = t.AirflowDirection(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("fanSpeedLevel", function () {
        return climateControl.fanSpeedLevel;
    });

    this.__defineSetter__("fanSpeedLevel", function (val) {
        try {
            climateControl.fanSpeedLevel = t.byte(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("targetTemperature", function () {
        return climateControl.targetTemperature;
    });

    this.__defineSetter__("targetTemperature", function (val) {
        try {
            climateControl.targetTemperature = t.byte(val, "?");
        } catch (err) {
        }
    });

    this.__defineGetter__("airConditioning", function () {
        return climateControl.airConditioning;
    });

    this.__defineSetter__("airConditioning", function (val) {
        try {
            climateControl.airConditioning = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("heater", function () {
        return climateControl.heater;
    });

    this.__defineSetter__("heater", function (val) {
        try {
            climateControl.heater = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("seatHeater", function () {
        return climateControl.seatHeater;
    });

    this.__defineSetter__("seatHeater", function (val) {
        try {
            climateControl.seatHeater = t.byte(val, "?");
        } catch (err) {
        }
    });

    this.__defineGetter__("seatCooler", function () {
        return climateControl.seatCooler;
    });

    this.__defineSetter__("seatCooler", function (val) {
        try {
            climateControl.seatCooler = t.byte(val, "?");
        } catch (err) {
        }
    });

    this.__defineGetter__("airRecirculation", function () {
        return climateControl.airRecirculation;
    });

    this.__defineSetter__("airRecirculation", function (val) {
        try {
            climateControl.airRecirculation = t.boolean(val);
        } catch (err) {
        }
    });

    this.__defineGetter__("steeringWheelHeater", function () {
        return climateControl.steeringWheelHeater;
    });

    this.__defineSetter__("steeringWheelHeater", function (val) {
        try {
            climateControl.steeringWheelHeater = t.byte(val, "?");
        } catch (err) {
        }
    });

    this.__defineGetter__("zone", function () {
        return climateControl.zone;
    });

    this.__defineSetter__("zone", function (val) {
        try {
            climateControl.zone = t.unsigned_short(val, "?");
        } catch (err) {
        }
    });
};

ParkingBrake = function (propertyTypes) {
    var parkingBrake = {};

    VehicleCommonDataType.call(this, propertyTypes);

    parkingBrake.status = propertyTypes.status || "inactive";

    this.__defineGetter__("status", function () {
        return parkingBrake.status;
    });

    this.__defineSetter__("status", function (val) {
        try {
            parkingBrake.status = t.ParkingBrakeStatus(val);
        } catch (err) {
        }
    });
};

_initialize();

module.exports = _self;
