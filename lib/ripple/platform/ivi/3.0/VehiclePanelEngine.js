
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
    data = require('ripple/platform/ivi/3.0/spec/dbvehicle'),
    _vehicleMapStack = {},
    _databaseName = "ivi-vehicle-database",
    VehiclePanelEngine;

function _save (data) {
    db.saveObject(_databaseName, data);
}

function _get () {
    var database = db.retrieveObject(_databaseName);

    if (!database) {
        db.saveObject(_databaseName, data);
        database = db.retrieveObject(_databaseName);
    }

    return database;
}

VehiclePanelEngine = function () {
    var _CONFIGURATION = "configuration", _AUTO = "auto",
        _database,
        _configuration, _currentConfiguration,
        _supported, _settings;

    function _init () {
        _database = data;

        _configuration = _database.configurationData;
        _currentConfiguration = _database.currentConfiguration;

        _supported = _database.supported;

        _settings = _database.settingData;
    }

    function _formatSettings () {
        var formatSettings = {},
            settings = _vehicleMapStack.vehicleSettingMap,
            property, name, item, i = 0;

        for (property in settings) {
            name = property.split("-")[0];
            item = property.split("-")[1];

            if (!formatSettings[name]) {
                formatSettings[name] = {};
            }

            formatSettings[name][item] = utils.copy(settings[property]);
            formatSettings[name][item].value = _settings[i];

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
    }

    /**
     * get
     * @return {String}
     */
    this.getCurrentConfiguration = function () {
        return _CONFIGURATION + _currentConfiguration;
    }

    /**
     * get
     * @return {Array}
     */
    this.getProperties = function () {
        return _vehicleMapStack.vehicleProperties;
    }

    /**
     * get supported vehicle properties name.
     * @return {Array}
     */
    this.getSupported = function () {
        return _supported;
    }

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
    }

    /**
     * get
     * @param property
     * @param item
     * @return {*}
     */
    this.getPropertyConstant = function (property, item) {
        var propertyConstants = _vehicleMapStack.vehiclePropertyConstantsMap;

        return !propertyConstants[property] ? null : propertyConstants[property][item];
    }

    this.getSettings = function () {
        return _formatSettings();
    }

    /**
     * format auto running data into ,map object
     * @return {Object}
     */
    this.formatAutoRunning = function () {
        var autoRunning = {}, i, j, dataIndex, tempArray,
            autoRunningMap = _vehicleMapStack.vehicleAutoRunningMap,
            autoRunningData = _database.autoRunningData;

        for (j = 0; j < autoRunningData.length; j++) {
            dataIndex = _AUTO + j;
            autoRunning[dataIndex] = {};

            for (i = 0; i < autoRunningMap.length; i++) {
                tempArray = autoRunningMap[i].split("-");

                if (!autoRunning[dataIndex][tempArray[0]]) {
                    autoRunning[dataIndex][tempArray[0]] = {};
                }
                autoRunning[dataIndex][tempArray[0]][tempArray[1]] = autoRunningData[j][i];
            }
        }

        return autoRunning;
    }

    _init();
};

_vehicleMapStack.vehicleProperties = [
    "VehicleSpeed", "EngineSpeed", "VehiclePowerMode", "TripMeter",
    "Acceleration", "Transmission", "CruiseControlStatus", "WheelBrake",
    "LightStatus", "InteriorLightStatus", "Horn", "Fuel", "EngineOil",
    "Location", "ExteriorBrightness", "Temperature", "RainSensor",
    "WindshieldWiper", "HVAC", "WindowStatus", "Sunroof", "ConvertibleRoof",
    "VehicleId", "Size", "FuelInfo", "VehicleType", "Doors",
    "TransmissionGearType", "WheelInformation", "Odometer", "Fluid", "Battery",
    "TirePressure", "TireTemperature", "SecurityAlert", "ParkingBrake",
    "ParkingLight", "HazardLight", "AntilockBrakingSystem", "TractionControlSystem",
    "VehicleTopSpeedLimit", "AirbagStatus", "DoorStatus", "SeatBeltStatus",
    "OccupantStatus", "ObstacleDistance", "NightMode", "DrivingMode"
];

_vehicleMapStack.vehicleAutoRunningMap = [
    "VehicleSpeed-vehicleSpeed",
    "EngineSpeed-engineSpeed",
    "VehiclePowerMode-vehiclePowerMode",
    "TripMeter-tripMeters",
    "Acceleration-x", "Acceleration-y", "Acceleration-z",
    "Fuel-level", "Fuel-range", "Fuel-instantConsumption", "Fuel-instantEconomy", "Fuel-averageEconomy",
    "EngineOil-remaining", "EngineOil-temperature", "EngineOil-pressure",
    "Location-latitude", "Location-longitude", "Location-altitude", "Location-direction",
    "ExteriorBrightness-exteriorBrightness",
    "Temperature-interior", "Temperature-exterior",
    "RainSensor-rainSensor",
    "Odometer-odometer"
];

_vehicleMapStack.vehicleConfigurationMap = [
    "VehicleId-WMI", "VehicleId-VIN",
    "Size-width", "Size-height", "Size-length",
    "FuelInfo-type", "FuelInfo-refuelPosition",
    "VehicleType-type",
    "Doors-doorsPerRow",
    "TransmissionGearType-transmissionGearType",
    "WheelInformation-frontWheelRadius", "WheelInformation-rearWheelRadius", "WheelInformation-wheelTrack", "WheelInformation-ABS"
];

_vehicleMapStack.vehicleSettingMap = {
    "Transmission-gearPosition": {
        "type": "select",
        "options": [{"NEUTRAL": 0},{"FIRST": 1},{"SECOND": 2},{"THIRD": 3}, {"FORTH": 4},{"FIFTH": 5},
            {"SIXTH": 6},{"SEVENTH": 7}, {"EIGHTH": 8},{"NINTH": 9},{"TENTH": 10},{"CVT": 64},
            {"REVERSE": 128},{"PARK": 255}]
    },
    "Transmission-mode": {
        "type": "select",
        "options": [{"NORMAL": 0},{"SPORT": 1},{"ECONOMY": 2}, {"OEMCUSTOM1": 3},{"OEMCUSTOM2": 4}]
    },
    "CruiseControlStatus-activated": {
        "type": "radio",
        "options": [{"Active": true}, {"Inactive": false}]
    },
    "CruiseControlStatus-speed": {
        "type": "text",
        "range": [0, 65535]
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
    "Horn-horn": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "WindshieldWiper-windshieldWiper": {
        "type": "select",
        "options": [{"OFF": 0},{"SLOWEST": 1},{"FASTEST": 5},{"AUTO": 10}]
    },
    "HVAC-airflowDirection": {
        "type": "select",
        "options": [{"FRONTPANEL": 0},{"FLOORDUCT": 1},{"FRONT": 0x02}, {"DEFROSTER": 0x04}]
    },
    "HVAC-fanSpeed": {
        "type": "select",
        "options": [{"0": 0},{"1": 1},{"2": 2},{"3": 3},{"4": 4},{"5": 5}, {"6": 6},{"7": 7}]
    },
    "HVAC-targetTemperature": {
        "type": "text",
        "range": [0, 65535]
    },
    "HVAC-airConditioning": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "HVAC-airRecirculation": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "HVAC-heater": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "HVAC-steeringWheelHeater": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "HVAC-seatHeater": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "HVAC-seatCooler": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "Sunroof-openness": {
        "type": "text",
        "range": [0, 100]
    },
    "Sunroof-tilt": {
        "type": "text",
        "range": [0, 100]
    },
    "ConvertibleRoof-openness": {
        "type": "text",
        "range": [0, 100]
    },
    "SecurityAlert-securityAlert": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "ParkingBrake-parkingBrake": {
        "type": "radio",
        "options": [{"Engaged": true}, {"Disengaged": false}]
    },
    "ParkingLight-parkingLight": {
        "type": "radio",
        "options": [{"Engaged": true}, {"Disengaged": false}]
    },
    "HazardLight-hazardLight": {
        "type": "radio",
        "options": [{"Engaged": true}, {"Disengaged": false}]
    },
    "AntilockBrakingSystem-antilockBrakingSystem": {
        "type": "radio",
        "options":[{"Engaged": true}, {"Idle": false}]
    },
    "TractionControlSystem-tractionControlSystem": {
        "type": "radio",
        "options": [{"On": true}, {"Off": false}]
    },
    "VehicleTopSpeedLimit-vehicleTopSpeedLimit": {
        "type": "text",
        "options": [0, 65535]
    },
    "WindowStatus-openness": {
        "type": "text",
        "options": [0, 100]
    },
    "WindowStatus-defrost": {
        "type": "text",
        "options": [{"On": true}, {"Off": false}]
    },
    "AirbagStatus-airbagStatus": {
        "type": "select",
        "options": [{"INACTIVE": 0},{"ACTIVE": 1},{"DEPLOYED": 2}]
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
        "type": "text",
        "range": "double"
    },
    "NightMode-nightMode": {
        "type": "radio",
        "options": [{"Night": true}, {"Day": false}]
    },
    "DrivingMode-drivingMode": {
        "type": "select",
        "options": [{"Not Driving": 0},{"Driving": 1}]
    },
    "Fluid-transmission": {
        "type": "text",
        "range": [0, 100]
    },
    "Fluid-brake": {
        "type": "text",
        "range": [0, 100]
    },
    "Fluid-washer": {
        "type": "text",
        "range": [0, 100]
    },
    "Battery-voltage": {
        "type": "text",
        "range": "double"
    },
    "Battery-current": {
        "type": "text",
        "range": "double"
    },
    "TirePressure-leftFront": {
        "type": "text",
        "range": "double"
    },
    "TirePressure-rightFront": {
        "type": "text",
        "range": "double"
    },
    "TirePressure-leftRear": {
        "type": "text",
        "range": "double"
    },
    "TirePressure-rightRear": {
        "type": "text",
        "range": "double"
    },
    "TireTemperature-leftFront": {
        "type": "text",
        "range": "double"
    },
    "TireTemperature-rightFront": {
        "type": "text",
        "range": "double"
    },
    "TireTemperature-leftRear": {
        "type": "text",
        "range": "double"
    },
    "TireTemperature-rightRear": {
        "type": "text",
        "range": "double"
    }
};

_vehicleMapStack.vehiclePropertyUnitsMap = {
    "VehicleSpeed-vehicleSpeed": "KPH",
    "EngineSpeed-engineSpeed": "RPM",
    "TripMeter-tripMeters": "[M,...]",
    "CruiseControlStatus-speed": "KPH",
    "Fuel-level": "%",
    "Fuel-instantConsumption": "ML/S",
    "Fuel-instantEconomy": "KM/L",
    "Fuel-averageEconomy": "KM/L",
    "EngineOil-remaining": "%",
    "EngineOil-temperature": "C",
    "EngineOil-pressure": "KPA",
    "ExteriorBrightness-exteriorBrightness": "LUX",
    "Temperature-interior": "C",
    "Temperature-exterior": "C",
    "HVAC-targetTemperature": "C",
    "Sunroof-openness": "%",
    "Sunroof-tilt": "%",
    "ConvertibleRoof-openness": "%",
    "Size-width": "mm",
    "Size-height": "mm",
    "Size-length": "mm",
    "WheelInformation-frontWheelRadius": "mm",
    "WheelInformation-rearWheelRadius": "mm",
    "WheelInformation-wheelTrack": "mm",
    "Odometer-odometer": "KM",
    "Fluid-transmission": "%",
    "Fluid-brake": "%",
    "Fluid-washer": "%",
    "Battery-voltage": "V",
    "Battery-current": "A",
    "TirePressure-leftFront": "KPA",
    "TirePressure-rightFront": "KPA",
    "TirePressure-leftRear": "KPA",
    "TirePressure-rightRear": "KPA",
    "TireTemperature-leftFront": "C",
    "TireTemperature-rightFront": "C",
    "TireTemperature-leftRear": "C",
    "TireTemperature-rightRear": "C",
    "VehicleTopSpeedLimit-vehicleTopSpeedLimit": "KPH"
};

_vehicleMapStack.vehiclePropertyConstantsMap = {
    "FuelInfo": {
        "type": {
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
    "TransmissionGearType": {
        "transmissionGearType": {
            "val0": "AUTO",
            "val1": "MANUAL",
            "val2": "CV"
        }
    }
};

exports.VehiclePanelEngine = new VehiclePanelEngine();