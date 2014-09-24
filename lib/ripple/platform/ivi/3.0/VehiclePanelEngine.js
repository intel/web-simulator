
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
    db = require('ripple/db'),
    dbinit = require('ripple/platform/ivi/3.0/dbinit'),
    _vehicleMapStack = {},
    _databaseName = "ivi-vehicle-database",
    VehiclePanelEngine;

function _save (data) {
    db.saveObject(_databaseName, data);
}

function _get () {
    var database = db.retrieveObject(_databaseName);

    if (!database) {
        db.saveObject(_databaseName, dbinit.Vehicle);
        database = db.retrieveObject(_databaseName);
    }

    return database;
}

VehiclePanelEngine = function () {
    var _CONFIGURATION = "configuration", _AUTO = "auto",
        _database,
        _configuration, _currentConfiguration,
        _supported, _settings, _autoRunning;

    function _init () {
        _database = _get();

        _settings = _database.settingData;

        _configuration = _database.configurationData;
        _currentConfiguration = _database.currentConfiguration;

        _supported = _database.supported;

        _autoRunning = _database.autoRunningData;
    }

    this.saveData = function (supported, currentConfiguration, configuration, settings, autoRunning) {
        _database.supported = supported;
        _database.currentConfiguration = currentConfiguration;
        _database.settingData = settings;
        _database.configurationData[currentConfiguration] = configuration;
        _database.autoRunningData[0] = autoRunning;

        _save(_database);
    };

    function _formatVehicleDB (map, db) {
        var formatSettings = {},
            VehicleMap = map, vehicleData = db,
            property, name, item, i = 0;

        for (property in VehicleMap) {
            name = property.split("-")[0];
            item = property.split("-")[1];

            if (!formatSettings[name]) {
                formatSettings[name] = {};
            }

            formatSettings[name][item] = utils.copy(VehicleMap[property]);
            formatSettings[name][item].value = vehicleData[i];

            i++;
        }

        return formatSettings;
    }

    /**
     * get
     * @return {Object}
     */
    this.getConfiguration = function () {
        var configuration = {}, i, j, dataIndex, tempArray,
            configurationMap = _vehicleMapStack.vehicleConfigurationMap,
            configurationData = _configuration;

        for (j = 0; j < configurationData.length; j++) {
            dataIndex = _CONFIGURATION + j;
            configuration[dataIndex] = {};

            for (i = 0; i < configurationMap.length; i++) {
                tempArray = configurationMap[i].split("-");

                if (!configuration[dataIndex][tempArray[0]]) {
                    configuration[dataIndex][tempArray[0]] = {};
                }
                configuration[dataIndex][tempArray[0]][tempArray[1]] = configurationData[j][i];
            }
        }

        return configuration;
    };

    /**
     * get
     * @return {String}
     */
    this.getCurrentConfiguration = function () {
        return _CONFIGURATION + _currentConfiguration;
    };

    /**
     * get
     * @return {Array}
     */
    this.getProperties = function () {
        return _vehicleMapStack.vehicleProperties;
    };

    /**
     * get supported vehicle properties name.
     * @return {Array}
     */
    this.getSupported = function () {
        return _supported;
    };

    /**
     * get property unit.
     * @param property
     * @param item
     * @return {String}
     */
    this.getPropertyUnit = function (property, item) {
        var unitKey = property + "-" + item,
            propertyUnitMap = _vehicleMapStack.vehiclePropertyUnitsMap;

        return !propertyUnitMap[unitKey] ? "" : "(" + propertyUnitMap[unitKey] + ")";
    };

    this.getPropertyRange = function (property, item) {
        var rangeKey = property + "-" + item,
            propertyRangeMap = _vehicleMapStack.vehiclePropertyRangeMap;

        return !propertyRangeMap[rangeKey] ? false : propertyRangeMap[rangeKey];
    };

    /**
     * get
     * @param property
     * @param item
     * @return {*}
     */
    this.getPropertyConstant = function (property, item) {
        var propertyConstants = _vehicleMapStack.vehiclePropertyConstantsMap;

        return !propertyConstants[property] ? null : propertyConstants[property][item];
    };

    this.getSettings = function () {
        return _formatVehicleDB(_vehicleMapStack.vehicleSettingMap, _settings);
    };

    this.getAutoRunning = function () {
        var autoRunning = {}, i,
            autoRunningMap = _vehicleMapStack.vehicleAutoRunningMap,
            autoRunningData = _autoRunning;

        for (i = 0; i < _autoRunning.length; i++) {
            autoRunning[_AUTO + i] = _formatVehicleDB(autoRunningMap, autoRunningData[i]);
        }
        return autoRunning;
    };

    _init();
};

//can support all properties.
_vehicleMapStack.vehicleProperties = [
    "VehicleSpeed", "WheelSpeed", "EngineSpeed", "VehiclePowerModeType", "TripMeter",
    "Acceleration", "Transmission", "CruiseControlStatus", "WheelBrake",
    "LightStatus", "InteriorLightStatus", "Horn", "Fuel", "EngineOil",
    "Location", "ExteriorBrightness", "Temperature", "RainSensor",
    "WindshieldWiper", "ClimateControl", "WindowStatus", "Sunroof", "ConvertibleRoof",
    "Identification", "SizeConfiguration", "FuelConfiguration", "VehicleType", "Doors",
    "TransmissionConfiguration", "WheelInformation", "Odometer", "Fluid", "BatteryStatus",
    "TirePressure", "TireTemperature", "SecurityAlert", "ParkingBrake",
    "ParkingLight", "HazardLight", "AntilockBrakingSystem", "TractionControlSystem",
    "VehicleTopSpeedLimit", "AirbagStatus", "DoorStatus", "SeatBeltStatus",
    "OccupantStatus", "ObstacleDistance", "NightMode", "DrivingMode",
    "TurnSignal", "ButtonEvent", "SteeringWheel", "ThrottlePosition", "EngineCoolant"
];

//Vehicle Configuration
_vehicleMapStack.vehicleConfigurationMap = [
    "Identification-WMI", "Identification-VIN",
    "SizeConfiguration-width", "SizeConfiguration-height", "SizeConfiguration-length",
    "FuelConfiguration-fuelType", "FuelConfiguration-refuelPosition",
    "VehicleType-type",
    "Doors-doorsPerRow",
    "TransmissionConfiguration-transmissionGearType",
    "WheelInformation-frontWheelRadius", "WheelInformation-rearWheelRadius", "WheelInformation-wheelTrack", "WheelInformation-ABS"
];

//all ranged attributes' min. max and step.
_vehicleMapStack.vehiclePropertyRangeMap = {
    "VehicleSpeed-speed": [0, 400, 1],
    "WheelSpeed-speed": [0, 400, 1],
    "EngineSpeed-speed": [0, 10000, 20],
    "Acceleration-x": [0, 200, 1],
    "Acceleration-y": [0, 200, 1],
    "Acceleration-z": [0, 200, 1],
    "Fuel-level": [0, 100, 1],
    "Fuel-range": [0, 1000, 1],
    "Fuel-instantConsumption": [0, 100, 1],
    "Fuel-fuelConsumedSinceRestart": [0, 100, 1],
    "Fuel-vehicleTimeSinceRestart": [0, 100, 1],
    "EngineOil-remaining": [0, 100, 1],
    "EngineOil-temperature": [0, 100, 1],
    "EngineOil-pressure": [0, 1000, 1],
    "Location-latitude": [-180, 180, 1],
    "Location-longitude": [-19, 90, 1],
    "Location-altitude": [0, 100, 1],
    "Location-direction": [0, 360, 1],
    "ExteriorBrightness-exteriorBrightness": [0, 100, 1],
    "Temperature-interiorTemperature": [-5, 35, 1],
    "Temperature-exteriorTemperature": [-40, 60, 1],
    "Odometer-distanceTotal": [0, 10000, 10],
    "CruiseControlStatus-speed": [1, 100, 1],
    "ClimateControl-targetTemperature": [0, 35, 7],
    "Sunroof-openness": [0, 100, 1],
    "Sunroof-tilt": [0, 100, 1],
    "WindowStatus-openness": [0, 100, 1],
    "VehicleTopSpeedLimit-vehicleTopSpeedLimit": [0, 400, 1],
    "ObstacleDistance-obstacleDistance": [0, 120, 1],
    "Fluid-transmission": [0, 100, 1],
    "Fluid-brake": [0, 100, 1],
    "Fluid-washer": [0, 100, 1],
    "BatteryStatus-voltage": [0, 12, 1],
    "BatteryStatus-current": [0, 200, 1],
    "TirePressure-leftFront": [0, 500, 1],
    "TirePressure-rightFront": [0, 500, 1],
    "TirePressure-leftRear": [0, 500, 1],
    "TirePressure-rightRear": [0, 500, 1],
    "TireTemperature-leftFront": [0, 60, 1],
    "TireTemperature-rightFront": [0, 60, 1],
    "TireTemperature-leftRear": [0, 60, 1],
    "TireTemperature-rightRear": [0, 60, 1],
    "TurnSignal-turnSignal": [0, 100, 1],
    "ButtonEvent-buttonEvent": [0, 100, 1],
    "SteeringWheel-angle": [-90, 90, 1],
    "ThrottlePosition-value": [0, 100, 1],
    "EngineCoolant-level": [0, 100, 1],
    "EngineCoolant-temperature": [0, 100, 1],
};

//simulate car running attributes' controller-types.
_vehicleMapStack.vehicleAutoRunningMap = {
    "VehicleSpeed-speed": {
        "type": "range"
    },
    "WheelSpeed-speed": {
        "type": "range"
    },
    "EngineSpeed-speed": {
        "type": "range"
    },
    "VehiclePowerModeType-value": {
        "type": "select",
        "options": [{"OFF": "off"},{"ACCESSORY1": "accessory1"},
            {"ACCESSORY2": "accessory2"},{"RUNNING": "running"}]
    },
    "TripMeter-tripMeters": {
        "type": "text"
    },
    "Acceleration-x": {
        "type": "range"
    },
    "Acceleration-y": {
        "type": "range"
    },
    "Acceleration-z": {
        "type": "range"
    },
    "Fuel-level": {
        "type": "range"
    },
    "Fuel-range": {
        "type": "range"
    },
    "Fuel-instantConsumption": {
        "type": "range"
    },
    "Fuel-vehicleTimeSinceRestart": {
        "type": "range"
    },
    "Fuel-fuelConsumedSinceRestart": {
        "type": "range"
    },
    "EngineOil-remaining": {
        "type": "range"
    },
    "EngineOil-temperature": {
        "type": "range"
    },
    "EngineOil-pressure": {
        "type": "range"
    },
    "Location-latitude": {
        "type": "range"
    },
    "Location-longitude": {
        "type": "range"
    },
    "Location-altitude": {
        "type": "range"
    },
    "Location-direction": {
        "type": "range"
    },
    "ExteriorBrightness-exteriorBrightness": {
        "type": "range"
    },
    "Temperature-interiorTemperature": {
        "type": "range"
    },
    "Temperature-exteriorTemperature": {
        "type": "range"
    },
    "RainSensor-rain": {
        "type": "select",
        "options": [{"No Rain": 0},{"Rain 1": 1},{"Rain 2": 2},{"Rain 3": 3},{"Rain 4": 4},{"Rain 5": 5},
            {"Rain 6": 6},{"Rain 7": 7},{"Rain 8": 8},{"Rain 9": 9},{"Heaviest": 10}]
    },
    "Odometer-distanceTotal": {
        "type": "range"
    },
    "TurnSignal-turnSignal": {
        "type": "range"
    },
    "ButtonEvent-buttonEvent": {
        "type": "range"
    },
    "SteeringWheel-angle": {
        "type": "range"
    },
    "ThrottlePosition-value": {
        "type": "range"
    },
    "EngineCoolant-level": {
        "type": "range"
    },
    "EngineCoolant-temperature": {
        "type": "range"
    }
};

//Vehicle Setting attributes' controller-types.
_vehicleMapStack.vehicleSettingMap = {
    "Transmission-gear": {
        "type": "select",
        "options": [{"NEUTRAL": 0},{"FIRST": 1},{"SECOND": 2},{"THIRD": 3}, {"FORTH": 4},{"FIFTH": 5},
            {"SIXTH": 6},{"SEVENTH": 7}, {"EIGHTH": 8},{"NINTH": 9},{"TENTH": 10},{"CVT": 64},
            {"REVERSE": 128},{"PARK": 255}]
    },
    "Transmission-mode": {
        "type": "select",
        "options": [{"NORMAL": 0},{"SPORT": 1},{"ECONOMY": 2}, {"OEMCUSTOM1": 3},{"OEMCUSTOM2": 4}]
    },
    "CruiseControlStatus-status": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "CruiseControlStatus-speed": {
        "type": "range"
    },
    "WheelBrake-engaged": {
        "type": "radio",
        "options": [{"Engaged": true}, {"Disengaged": false}]
    },
    "LightStatus-head": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "LightStatus-rightTurn": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "LightStatus-leftTurn": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "LightStatus-brake": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "LightStatus-fog": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "LightStatus-hazard": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "LightStatus-parking": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "LightStatus-highBeam": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "InteriorLightStatus-passenger": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "InteriorLightStatus-driver": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "InteriorLightStatus-center": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "Horn-status": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "WindshieldWiper-windshieldWiper": {
        "type": "select",
        "options": [{"OFF": 0},{"SLOWEST": 1},{"FASTEST": 5},{"AUTO": 10}]
    },
    "ClimateControl-airflowDirection": {
        "type": "select",
        "options": [{"FRONTPANEL": 0},{"FLOORDUCT": 1},{"FRONT": 0x02}, {"DEFROSTER": 0x04}]
    },
    "ClimateControl-fanSpeedLevel": {
        "type": "select",
        "options": [{"0": 0},{"1": 1},{"2": 2},{"3": 3},{"4": 4},{"5": 5}, {"6": 6},{"7": 7}]
    },
    "ClimateControl-targetTemperature": {
        "type": "range"
    },
    "ClimateControl-airConditioning": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "ClimateControl-airRecirculation": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "ClimateControl-heater": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "ClimateControl-steeringWheelHeater": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "ClimateControl-seatHeater": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "ClimateControl-seatCooler": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "Sunroof-openness": {
        "type": "range"
    },
    "Sunroof-tilt": {
        "type": "range"
    },
    "ConvertibleRoof-status": {
        "type": "select",
        "options": [{"CLOSED": "closed"},{"CLOSING": "closing"},
            {"OPENING": "opening"},{"OPENED": "opened"}]
    },
    "SecurityAlert-securityAlert": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "ParkingBrake-status": {
        "type": "select",
        "options": [{"INACTIVE": "inactive"},{"ACTIVE": "active"},
            {"ERROR": "error"}]
    },
    "ParkingLight-parkingLight": {
        "type": "radio",
        "options": [{"Engaged": true}, {"Disengaged": false}]
    },
    "HazardLight-hazardLight": {
        "type": "radio",
        "options": [{"Engaged": true}, {"Disengaged": false}]
    },
    "AntilockBrakingSystem-engaged": {
        "type": "radio",
        "options":[{"Engaged": true}, {"Idle": false}]
    },
    "TractionControlSystem-enabled": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "VehicleTopSpeedLimit-vehicleTopSpeedLimit": {
        "type": "range"
    },
    "WindowStatus-openness": {
        "type": "range"
    },
    "WindowStatus-defrost": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "AirbagStatus-activated": {
        "type": "radio",
        "options": [{"INACTIVE": false}, {"ACTIVE": true}]
    },
    "DoorStatus-doorStatus": {
        "type": "select",
        "options": [{"CLOSED": 0},{"OPEN": 1},{"AJAR": 2}]
    },
    "DoorStatus-doorLockStatus": {
        "type": "radio",
        "options": [{"Locked": true}, {"Unlocked": false}]
    },
    "DoorStatus-childLockStatus": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "SeatBeltStatus-seatBeltStatus": {
        "type": "radio",
        "options": [{"Fasten": true}, {"Unfastened": false}]
    },
    "OccupantStatus-occupantStatus": {
        "type": "select",
        "options": [{"VACANT": 0},{"CHILD": 1},{"ADULT": 2}]
    },
    "ObstacleDistance-obstacleDistance": {
        "type": "range"
    },
    "NightMode-mode": {
        "type": "radio",
        "options": [{"Night": true}, {"Day": false}]
    },
    "DrivingMode-mode": {
        "type": "radio",
        "options": [{"Driving": true}, {"No Driving": false}]
    },
    "Fluid-transmission": {
        "type": "range"
    },
    "Fluid-brake": {
        "type": "range"
    },
    "Fluid-washer": {
        "type": "range"
    },
    "BatteryStatus-voltage": {
        "type": "range"
    },
    "BatteryStatus-current": {
        "type": "range"
    },
    "TirePressure-leftFront": {
        "type": "range"
    },
    "TirePressure-rightFront": {
        "type": "range"
    },
    "TirePressure-leftRear": {
        "type": "range"
    },
    "TirePressure-rightRear": {
        "type": "range"
    },
    "TireTemperature-leftFront": {
        "type": "range"
    },
    "TireTemperature-rightFront": {
        "type": "range"
    },
    "TireTemperature-leftRear": {
        "type": "range"
    },
    "TireTemperature-rightRear": {
        "type": "range"
    }
};

//attributes units
_vehicleMapStack.vehiclePropertyUnitsMap = {
    "VehicleSpeed-speed": "kph",
    "WheelSpeed-speed": "m/h",
    "EngineSpeed-speed": "rpm",
    "TripMeter-tripMeters": "[m,...]",
    "CruiseControlStatus-speed": "kph",
    "Fuel-level": "%",
    "Fuel-instantConsumption": "ml/s",
    "Fuel-vehicleTimeSinceRestart": "km/l",
    "Fuel-fuelConsumedSinceRestart": "km/l",
    "EngineOil-remaining": "%",
    "EngineOil-temperature": "C",
    "EngineOil-pressure": "kpa",
    "ExteriorBrightness-exteriorBrightness": "lux",
    "Temperature-interiorTemperature": "C",
    "Temperature-exteriorTemperature": "C",
    "ClimateControl-targetTemperature": "C",
    "Sunroof-openness": "%",
    "Sunroof-tilt": "%",
    "WindowStatus-openness": "%",
    "ObstacleDistance-obstacleDistance": "m",
    "SizeConfiguration-width": "mm",
    "SizeConfiguration-height": "mm",
    "SizeConfiguration-length": "mm",
    "WheelInformation-frontWheelRadius": "mm",
    "WheelInformation-rearWheelRadius": "mm",
    "WheelInformation-wheelTrack": "mm",
    "Odometer-distanceTotal": "km",
    "Fluid-transmission": "%",
    "Fluid-brake": "%",
    "Fluid-washer": "%",
    "BatteryStatus-voltage": "V",
    "BatteryStatus-current": "A",
    "TirePressure-leftFront": "kpa",
    "TirePressure-rightFront": "kpa",
    "TirePressure-leftRear": "kpa",
    "TirePressure-rightRear": "kpa",
    "TireTemperature-leftFront": "C",
    "TireTemperature-rightFront": "C",
    "TireTemperature-leftRear": "C",
    "TireTemperature-rightRear": "C",
    "VehicleTopSpeedLimit-vehicleTopSpeedLimit": "kph",
    "SteeringWheel-angle": "deg",
    "ThrottlePosition-value": "%",
    "EngineCoolant-level": "%",
    "EngineCoolant-temperature": "C"
};

//key and value of select types in attributes
_vehicleMapStack.vehiclePropertyConstantsMap = {
    "FuelConfiguration": {
        "fuelType": {
            "val0": "GASOLINE",
            "val1": "HIGH_OCTANE",
            "val2": "DIESEL",
            "val3": "ELECTRIC",
            "val4": "HYDROGEN"
        },
        "refuelPosition": {
            "val0": "LEFT",
            "val1": "RIGHT",
            "val2": "FRONT",
            "val3": "REAR"
        }
    },
    "VehicleType": {
        "type": {
            "val0": "SEDAN",
            "val1": "COUPE",
            "val2": "CABRIOLE",
            "val3": "ROADSTER",
            "val4": "SUV",
            "val5": "TRUCK"
        }
    },
    "TransmissionConfiguration": {
        "transmissionGearType": {
            "val0": "AUTO",
            "val1": "MANUAL",
            "val2": "CV"
        }
    },
    "VehiclePowerModeType": {
        "value": {
            "val0": "off",
            "val1": "accessory1",
            "val2": "accessory2",
            "val3": "running"
        }
    }
};

exports.VehiclePanelEngine = new VehiclePanelEngine();
