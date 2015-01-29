
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
    "VehicleSpeed", "WheelSpeed", "EngineSpeed", "VehiclePowerModeType",
    "Acceleration", "Transmission", "CruiseControlStatus", "LightStatus",
    "InteriorLightStatus", "Horn", "Fuel", "EngineOil", "Temperature",
    "RainSensor", "ClimateControl", "Sunroof", "ConvertibleRoof",
     "Identification", "SizeConfiguration", "FuelConfiguration",
    "TransmissionConfiguration", "Odometer", "BatteryStatus", "ParkingBrake",
    "AntilockBrakingSystem", "TractionControlSystem", "AirbagStatus",
    "NightMode", "DrivingMode", "ChildSafetyLock", "ButtonEvent", "SteeringWheel",
    "ThrottlePosition", "EngineCoolant", "Door", "Tire", "Seat", "WasherFluid",
    "BrakeMaintenance", "WiperStatus", "TopSpeedLimit", "SideWindow", "Defrost"
];

//Vehicle Configuration
_vehicleMapStack.vehicleConfigurationMap = [
    "Identification-WMI", "Identification-VIN", "SizeConfiguration-width",
    "SizeConfiguration-height", "SizeConfiguration-length",
    "FuelConfiguration-fuelType", "FuelConfiguration-refuelPosition",
    "TransmissionConfiguration-transmissionGearType"
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
    "Temperature-interiorTemperature": [-5, 35, 1],
    "Temperature-exteriorTemperature": [-40, 60, 1],
    "Odometer-distanceTotal": [0, 10000, 10],
    "CruiseControlStatus-speed": [1, 100, 1],
    "ClimateControl-targetTemperature": [0, 35, 7],
    "Sunroof-openness": [0, 100, 1],
    "Sunroof-tilt": [0, 100, 1],
    "BatteryStatus-voltage": [0, 12, 1],
    "BatteryStatus-current": [0, 200, 1],
    "ButtonEvent-buttonEvent": [0, 100, 1],
    "SteeringWheel-angle": [-90, 90, 1],
    "ThrottlePosition-value": [0, 100, 1],
    "EngineCoolant-level": [0, 100, 1],
    "EngineCoolant-temperature": [0, 100, 1],
    "Tire-pressure": [0, 500, 1],
    "Tire-temperature": [0, 100, 1],
    "WasherFluid-level": [0, 100, 1],
    "BrakeMaintenance-fluidLevel": [0, 100, 1],
    "BrakeMaintenance-padWear": [0, 100, 1],
    "TopSpeedLimit-speed": [0, 400, 1],
    "SideWindow-openness": [0, 100, 1]
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
    "Temperature-interiorTemperature": {
        "type": "range"
    },
    "Temperature-exteriorTemperature": {
        "type": "range"
    },
    "RainSensor-rain": {
        "type": "select",
        "options": [{"No Rain": 0},{"Rain 1": 1},{"Rain 2": 2},{"Rain 3": 3},
            {"Rain 4": 4},{"Rain 5": 5},{"Rain 6": 6},{"Rain 7": 7},
            {"Rain 8": 8},{"Rain 9": 9},{"Heaviest": 10}]
    },
    "Odometer-distanceTotal": {
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
        "options": [{"NEUTRAL": 0},{"FIRST": 1},{"SECOND": 2},{"THIRD": 3},
            {"FORTH": 4},{"FIFTH": 5},{"SIXTH": 6},{"SEVENTH": 7},
            {"EIGHTH": 8},{"NINTH": 9},{"TENTH": 10},{"CVT": 64},
            {"REVERSE": 128},{"PARK": 255}]
    },
    "Transmission-mode": {
        "type": "select",
        "options": [{"NORMAL": 0},{"SPORT": 1},{"ECONOMY": 2},
            {"OEMCUSTOM1": 3},{"OEMCUSTOM2": 4}]
    },
    "CruiseControlStatus-status": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "CruiseControlStatus-speed": {
        "type": "range"
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
    "ClimateControl-airflowDirection": {
        "type": "select",
        "options": [{"FRONTPANEL": 0},{"FLOORDUCT": 1},{"FRONT": 0x02},
            {"DEFROSTER": 0x04}]
    },
    "ClimateControl-fanSpeedLevel": {
        "type": "select",
        "options": [{"0": 0},{"1": 1},{"2": 2},{"3": 3},{"4": 4},{"5": 5},
            {"6": 6},{"7": 7}]
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
    "ParkingBrake-status": {
        "type": "select",
        "options": [{"INACTIVE": "inactive"},{"ACTIVE": "active"},
            {"ERROR": "error"}]
    },
    "AntilockBrakingSystem-engaged": {
        "type": "radio",
        "options":[{"Engaged": true}, {"Idle": false}]
    },
    "TractionControlSystem-enabled": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "AirbagStatus-activated": {
        "type": "radio",
        "options": [{"INACTIVE": false}, {"ACTIVE": true}]
    },
    "ChildSafetyLock-lock": {
        "type": "radio",
        "options": [{"lock": true}, {"unlock": false}]
    },
    "NightMode-mode": {
        "type": "radio",
        "options": [{"Night": true}, {"Day": false}]
    },
    "DrivingMode-mode": {
        "type": "radio",
        "options": [{"Driving": true}, {"No Driving": false}]
    },
    "BatteryStatus-voltage": {
        "type": "range"
    },
    "BatteryStatus-current": {
        "type": "range"
    },
    "Door-status": {
        "type": "select",
        "options": [{"OPEN": "open"}, {"AJAR": "ajar"},
            {"CLOSED": "closed"}]
    },
    "Door-lock": {
        "type": "radio",
        "options": [{"lock": true}, {"unlock": false}]
    },
    "Tire-pressure": {
        "type": "range"
    },
    "Tire-temperature": {
        "type": "range"
    },
    "Tire-pressureLow": {
        "type": "radio",
        "options": [{"LOW": true}, {"NOT LOW": false}]
    },
    "Seat-seatbelt": {
        "type": "radio",
        "options": [{"Fastened": true}, {"Unfastened": false}]
    },
    "Seat-identificationType": {
        "type": "select",
        "options": [{"Pin": "pin"}, {"Keyfob": "keyfob"},
            {"Bluetooth": "Bluetooth"}, {"NFC": "NFC"},
            {"Fingerprint": "fingerprint"}, {"Camera": "camera"},
            {"Voice": "voice"}]
    },
    "Seat-occupant": {
        "type": "select",
        "options": [{"Adult": "adult"}, {"Child": "child"},
            {"Vancant": "vancant"}]
    },
    "WasherFluid-level": {
        "type": "range"
    },
    "WasherFluid-levelLow": {
        "type": "radio",
        "options": [{"Low": true}, {"Not Low": false}]
    },
    "BrakeMaintenance-fluidLevel": {
        "type": "range"
    },
    "BrakeMaintenance-fluidLevelLow": {
        "type": "radio",
        "options": [{"Low": true}, {"Not Low": false}]
    },
    "BrakeMaintenance-padWear": {
        "type": "range"
    },
    "BrakeMaintenance-brakesWorn": {
        "type": "radio",
        "options": [{"Worn": true}, {"Not Worn": false}]
    },
    "WiperStatus-wiperSetting": {
        "type": "select",
        "options": [{"OFF": "off"}, {"Once": "once"}, {"Slowest": "slowest"},
            {"Slow": "slow"}, {"Middle": "middle"}, {"Fast": "fast"},
            {"Fastest": "fastest"}, {"Auto": "auto"}]
    },
    "TopSpeedLimit-speed": {
        "type": "range"
    },
    "SideWindow-lock": {
        "type": "radio",
        "options": [{"Locked": true}, {"Unlocked": false}]
    },
    "SideWindow-openness": {
        "type": "range"
    },
    "Defrost-defrostWindow": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "Defrost-defrostMirrors": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    }
};

//attributes units
_vehicleMapStack.vehiclePropertyUnitsMap = {
    "VehicleSpeed-speed": "kph",
    "WheelSpeed-speed": "m/h",
    "EngineSpeed-speed": "rpm",
    "CruiseControlStatus-speed": "kph",
    "Fuel-level": "%",
    "Fuel-instantConsumption": "ml/s",
    "Fuel-vehicleTimeSinceRestart": "km/l",
    "Fuel-fuelConsumedSinceRestart": "km/l",
    "EngineOil-remaining": "%",
    "EngineOil-temperature": "C",
    "EngineOil-pressure": "kpa",
    "Temperature-interiorTemperature": "C",
    "Temperature-exteriorTemperature": "C",
    "ClimateControl-targetTemperature": "C",
    "Sunroof-openness": "%",
    "Sunroof-tilt": "%",
    "SizeConfiguration-width": "mm",
    "SizeConfiguration-height": "mm",
    "SizeConfiguration-length": "mm",
    "Odometer-distanceTotal": "km",
    "BatteryStatus-voltage": "V",
    "BatteryStatus-current": "A",
    "SteeringWheel-angle": "deg",
    "ThrottlePosition-value": "%",
    "EngineCoolant-level": "%",
    "EngineCoolant-temperature": "C",
    "Tire-pressure": "kpa",
    "Tire-temperature": "C",
    "WasherFluid-level": "%",
    "BrakeMaintenance-fluidLevel": "%",
    "BrakeMaintenance-padWear": "%",
    "TopSpeedLimit-speed": "kph",
    "SideWindow-openness": "%"
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
