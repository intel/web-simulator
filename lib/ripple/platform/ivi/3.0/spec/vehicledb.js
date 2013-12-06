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

module.exports = {
    supported: ["VehicleSpeed", "EngineSpeed", "VehiclePowerMode", "TripMeter",
        "Acceleration", "Transmission", "CruiseControlStatus", "WheelBrake",
        "LightStatus", "InteriorLightStatus", "Horn", "Fuel", "EngineOil",
        "Location", "ExteriorBrightness", "Temperature", "RainSensor",
        "WindshieldWiper", "HVAC", "WindowStatus", "Sunroof", "ConvertibleRoof",
        "VehicleId", "Size", "FuelInfo", "VehicleType", "Doors",
        "TransmissionGearType", "WheelInformation", "Odometer", "Fluid", "Battery",
        "TirePressure", "TireTemperature", "SecurityAlert", "ParkingBrake",
        "ParkingLight", "HazardLight", "AntilockBrakingSystem", "TractionControlSystem",
        "VehicleTopSpeedLimit", "AirbagStatus", "DoorStatus", "SeatBeltStatus",
        "OccupantStatus", "ObstacleDistance"],
    config: {
        "current": "Car1",
        "Car1": {
            "VehicleId": {
                "WMI": "AFA",
                "VIN": "21D1M2883N342FFG7"
            },
            "Size": {
                "width": 2096,
                "height": 1860,
                "length": 4779
            },
            "FuelInfo": {
                "type": 0,
                "refuelPosition": 0
            },
            "VehicleType": {
                "type": 0
            },
            "Doors": {
                "doorsPerRow": [2,2]
            },
            "TransmissionGearType": {
                "transmissionGearType": 0
            },
            "WheelInformation": {
                "frontWheelRadius": 1953,
                "rearWheelRadius": 2000,
                "wheelTrack": 1465,
                "ABS": true
            }
        },
        "Car2": {
            "VehicleId": {
                "WMI": "KMH",
                "VIN": "21D1M2888N342FFL7"
            },
            "Size": {
                "width": 2125,
                "height": 1961,
                "length": 4901
            },
            "FuelInfo": {
                "type": 4,
                "refuelPosition": 3
            },
            "VehicleType": {
                "type": 4
            },
            "Doors": {
                "doorsPerRow": [2,2]
            },
            "TransmissionGearType": {
                "transmissionGearType": 2
            },
            "WheelInformation": {
                "frontWheelRadius": 1964,
                "rearWheelRadius": 2000,
                "wheelTrack": 1470,
                "ABS": true
            }
        }
    },
    stopSet: {
        "Fluid": {
            "transmission": {
                "type": "text",
                "title": "unsigned short (0-100 percentage)",
                "default": 100
            },
            "brake": {
                "type": "text",
                "title": "unsigned short (0-100 percentage)",
                "default": 100
            },
            "washer": {
                "type": "text",
                "title": "unsigned short (0-100 percentage)",
                "default": 100
            }
        },
        "Battery": {
            "voltage": {
                "type": "text",
                "title": "double",
                "default": 11.5
            },
            "current": {
                "type": "text",
                "title": "double",
                "default": 10.4
            }
        },
        "TirePressure": {
            "leftFront": {
                "type": "text",
                "title": "double (kpa)",
                "default": 100.5
            },
            "rightFront": {
                "type": "text",
                "title": "double (kpa)",
                "default": 120.3
            },
            "leftRear": {
                "type": "text",
                "title": "double (kpa)",
                "default": 200.6
            },
            "rightRear": {
                "type": "text",
                "title": "double (kpa)",
                "default": 600.5
            }
        },
        "TireTemperature": {
            "leftFront": {
                "type": "text",
                "title": "double (celcius)",
                "default": 88.5
            },
            "rightFront": {
                "type": "text",
                "title": "double (celcius)",
                "default": 52.1
            },
            "leftRear": {
                "type": "text",
                "title": "double (celcius)",
                "default": 70.6
            },
            "rightRear": {
                "type": "text",
                "title": "double (celcius)",
                "default": 96.5
            }
        }
    },
    enabledSet: {
        "Transmission": {
            "gearPosition": {
                "type": "select",
                "options": [{"NEUTRAL":0},{"FIRST":1},{"SECOND":2},{"THIRD":3},
                    {"FORTH":4},{"FIFTH":5},{"SIXTH":6},{"SEVENTH":7},
                    {"EIGHTH":8},{"NINTH":9},{"TENTH":10},{"CVT":64},
                    {"REVERSE":128},{"PARK":255}],
                "default": 255
            },
            "mode": {
                "type": "select",
                "options": [{"NORMAL":0},{"SPORT":1},{"ECONOMY":2},
                    {"OEMCUSTOM1":3},{"OEMCUSTOM2":4}],
                "default": 0
            }
        },
        "CruiseControlStatus": {
            "activated": {
                "type": "radio",
                "options": ["active","inactive"],
                "default": true
            },
            "speed": {
                "type": "text",
                "title": "unsigned short (kph)",
                "default": 100
            }
        },
        "WheelBrake": {
            "engaged": {
                "type": "radio",
                "options": ["engaged","disengaged"],
                "default": true
            }
        },
        "LightStatus": {
            "head": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "rightTurn": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "leftTurn": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "brake": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "fog": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "hazard": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "parking": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "highBeam": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            }
        },
        "InteriorLightStatus": {
            "passenger": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "driver": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "center": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            }
        },
        "Horn": {
            "horn": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            }
        },
        "WindshieldWiper": {
            "windshieldWiper": {
                "type": "select",
                "options": [{"OFF":0},{"SLOWEST":1},{"FASTEST":5},{"AUTO":10}],
                "default": 0
            }
        },
        "HVAC": {
            "airflowDirection": {
                "type": "select",
                "options": [{"FRONTPANEL":0},{"FLOORDUCT":1},{"FRONT":0x02},
                    {"DEFROSTER":0x04}],
                "default": 0
            },
            "fanSpeed": {
                "type": "select",
                "options": [{"0":0},{"1":1},{"2":2},{"3":3},{"4":4},{"5":5},
                    {"6":6},{"7":7}],
                "default": 1
            },
            "targetTemperature": {
                "type": "text",
                "title": "unsigned short (celcius)",
                "default": 21
            },
            "airConditioning": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "airRecirculation": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "heater": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "defrost-window":  {
                "type": "text",
                "title": "unsigned short",
                "default": 1
            },
            "defrost-defrost": {
                "type": "radio",
                "options": ["yes","no"],
                "default": true
            },
            "steeringWheelHeater": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "seatHeater": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            },
            "seatCooler": {
                "type": "radio",
                "options": ["on","off"],
                "default": false
            }
        },
        "Sunroof": {
            "openness": {
                "type": "text",
                "title": "unsigned short (percentage)",
                "default": 50
            },
            "tilt": {
                "type": "text",
                "title": "unsigned short (percentage)",
                "default": 50
            }
        },
        "ConvertibleRoof": {
            "openness": {
                "type": "text",
                "title": "unsigned short (percentage)",
                "default": 50
            }
        },
        "SecurityAlert": {
            "securityAlert": {
                "type": "radio",
                "options": ["on","off"],
                "default": true
            }
        },
        "ParkingBrake": {
            "parkingBrake": {
                "type": "radio",
                "options": ["engaged","disengaged"],
                "default": true
            }
        },
        "ParkingLight": {
            "parkingLight": {
                "type": "radio",
                "options": ["engaged","disengaged"],
                "default": true
            }
        },
        "HazardLight": {
            "hazardLight": {
                "type": "radio",
                "options": ["engaged","disengaged"],
                "default": true
            }
        },
        "AntilockBrakingSystem": {
            "securityAlert": {
                "type": "radio",
                "options": ["engaged","idle"],
                "default": true
            }
        },
        "TractionControlSystem": {
            "tractionControlSystem": {
                "type": "radio",
                "options": ["on","off"],
                "default": true
            }
        },
        "VehicleTopSpeedLimit": {
            "vehicleTopSpeedLimit": {
                "type": "text",
                "title": "unsigned short (km/h)",
                "default": 150
            }
        },
        "WindowStatus": {
            "WindowStatus": {
                "type": "text",
                "title": "dictionary",
                "default": null
            }
        },
        "AirbagStatus": {
            "airbagStatus": {
                "type": "text",
                "title": "dictionary",
                "default": null
            }
        },
        "DoorStatus": {
            "airbagStatus": {
                "type": "text",
                "title": "dictionary",
                "default": null
            }
        },
        "SeatBeltStatus": {
            "doorStatus": {
                "type": "text",
                "title": "dictionary",
                "default": null
            },
            "doorLockStatus": {
                "type": "text",
                "title": "dictionary",
                "default": null
            },
            "childLockStatus": {
                "type": "radio",
                "options": ["on","off"],
                "default": true
            }
        },
        "OccupantStatus": {
            "occupantStatus": {
                "type": "text",
                "title": "dictionary",
                "default": null
            }
        },
        "ObstacleDistance": {
            "obstacleDistance": {
                "type": "text",
                "title": "dictionary",
                "default": null
            }
        }
    },
    properties: ["VehicleSpeed", "EngineSpeed", "VehiclePowerMode", "TripMeter",
        "Acceleration", "Transmission", "CruiseControlStatus", "WheelBrake",
        "LightStatus", "InteriorLightStatus", "Horn", "Fuel", "EngineOil",
        "Location", "ExteriorBrightness", "Temperature", "RainSensor",
        "WindshieldWiper", "HVAC", "WindowStatus", "Sunroof", "ConvertibleRoof",
        "VehicleId", "Size", "FuelInfo", "VehicleType", "Doors",
        "TransmissionGearType", "WheelInformation", "Odometer", "Fluid", "Battery",
        "TirePressure", "TireTemperature", "SecurityAlert", "ParkingBrake",
        "ParkingLight", "HazardLight", "AntilockBrakingSystem", "TractionControlSystem",
        "VehicleTopSpeedLimit", "AirbagStatus", "DoorStatus", "SeatBeltStatus",
        "OccupantStatus", "ObstacleDistance"],
    dataCount: 9,
    now: "1384408800000",
    historyCount: 0,
    history: {
    },
    zone: {
        "ZONE_None": 0,
        "ZONE_Front": 1,
        "ZONE_Middle": 0x10,
        "ZONE_Right": 0x100,
        "ZONE_Left": 0x1000,
        "ZONE_Rear": 0x10000,
        "ZONE_Center": 0x10000
    },
    data: {
        "1384408800000": { //2013-11-14 14:00:00
            "VehicleSpeed" : {
                "vehicleSpeed": 0
            },
            "EngineSpeed" : {
                "engineSpeed": 0
            },
            "VehiclePowerMode": {
                "vehiclePowerMode": 1
            },
            "TripMeter": {
                "tripMeters": [23, 7876, 124, 4577]
            },
            "Acceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "Fuel": {
                "level": 87,
                "range": 251,
                "instantConsumption": 250,
                "instantEconomy": 85,
                "averageEconomy": 15
            },
            "EngineOil": {
                "remaining": 0,
                "temperature": 0,
                "pressure": 0
            },
            "Location": {
                "latitude": 0,
                "longitude": 0,
                "altitude": 0,
                "direction": 0
            },
            "ExteriorBrightness": {
                "exteriorBrightness": 0
            },
            "Temperature": {
                "interior": 0,
                "exterior": 0
            },
            "RainSensor": {
                "rainSensor": 2
            },
            "Odometer": {
                "odometer": 333
            }
        },
        "1384401600000": { //2013-11-14 12:00:00
            "VehicleSpeed" : {
                "vehicleSpeed": 60
            },
            "EngineSpeed" : {
                "engineSpeed": 2500
            },
            "VehiclePowerMode": {
                "vehiclePowerMode": 0
            },
            "TripMeter": {
                "tripMeters": [100, 1000, 1500]
            },
            "Acceleration": {
                "x": 10,
                "y": 10,
                "z": 10
            },
            "Fuel": {
                "level": 100,
                "range": 105,
                "instantConsumption": 59,
                "instantEconomy": 87,
                "averageEconomy": 15
            },
            "EngineOil": {
                "remaining": 150,
                "temperature": 560,
                "pressure": 59
            },
            "Location": {
                "latitude": -15,
                "longitude": -89,
                "altitude": 16,
                "direction": 69
            },
            "ExteriorBrightness": {
                "exteriorBrightness": 456
            },
            "Temperature": {
                "interior": 45,
                "exterior": 45
            },
            "RainSensor": {
                "rainSensor": 10
            },
            "Odometer": {
                "odometer": 1213
            }
        },
        "1384402500000": { //2013-11-14 12:15:00
            "VehicleSpeed" : {
                "vehicleSpeed": 120
            },
            "EngineSpeed" : {
                "engineSpeed": 2800
            },
            "VehiclePowerMode": {
                "vehiclePowerMode": 1
            },
            "TripMeter": {
                "tripMeters": [100, 1000]
            },
            "Acceleration": {
                "x": 1002,
                "y": 1045,
                "z": 1036
            },
            "Fuel": {
                "level": 100,
                "range": 254,
                "instantConsumption": 59,
                "instantEconomy": 87,
                "averageEconomy": 15
            },
            "EngineOil": {
                "remaining": 78,
                "temperature": 546,
                "pressure": 54
            },
            "Location": {
                "latitude": -97,
                "longitude": -54,
                "altitude": 124,
                "direction": 65
            },
            "ExteriorBrightness": {
                "exteriorBrightness": 45
            },
            "Temperature": {
                "interior": 67,
                "exterior": 45
            },
            "RainSensor": {
                "rainSensor": 9
            },
            "Odometer": {
                "odometer": 250
            }
        },
        "1384403400000": { //2013-11-14 12:30:00
            "VehicleSpeed" : {
                "vehicleSpeed": 180
            },
            "EngineSpeed" : {
                "engineSpeed": 3100
            },
            "VehiclePowerMode": {
                "vehiclePowerMode": 2
            },
            "TripMeter": {
                "tripMeters": [100, 1000, 1500]
            },
            "Acceleration": {
                "x": 1234,
                "y": 45,
                "z": 67
            },
            "Fuel": {
                "level": 34,
                "range": 67,
                "instantConsumption": 97,
                "instantEconomy": 123,
                "averageEconomy": 56
            },
            "EngineOil": {
                "remaining": 155,
                "temperature": 960,
                "pressure": 78
            },
            "Location": {
                "latitude": 58,
                "longitude": -89,
                "altitude": 123,
                "direction": 69
            },
            "ExteriorBrightness": {
                "exteriorBrightness": 768
            },
            "Temperature": {
                "interior": 45,
                "exterior": 98
            },
            "RainSensor": {
                "rainSensor": 8
            },
            "Odometer": {
                "odometer": 360
            }
        },
        "1384404300000": { //2013-11-14 12:45:00
            "VehicleSpeed" : {
                "vehicleSpeed": 240
            },
            "EngineSpeed" : {
                "engineSpeed": 3400
            },
            "VehiclePowerMode": {
                "vehiclePowerMode": 3
            },
            "TripMeter": {
                "tripMeters": [100, 15]
            },
            "Acceleration": {
                "x": 789,
                "y": 234,
                "z": 1200
            },
            "Fuel": {
                "level": 58,
                "range": 78,
                "instantConsumption": 123,
                "instantEconomy": 56,
                "averageEconomy": 31
            },
            "EngineOil": {
                "remaining": 54,
                "temperature": 963,
                "pressure": 210
            },
            "Location": {
                "latitude": -15,
                "longitude": 32,
                "altitude": 16,
                "direction": 23
            },
            "ExteriorBrightness": {
                "exteriorBrightness": 234
            },
            "Temperature": {
                "interior": 76,
                "exterior": 45
            },
            "RainSensor": {
                "rainSensor": 7
            },
            "Odometer": {
                "odometer": 38
            }
        },
        "1384405200000": { //2013-11-14 13:00:00
            "VehicleSpeed" : {
                "vehicleSpeed": 280
            },
            "EngineSpeed" : {
                "engineSpeed": 3700
            },
            "VehiclePowerMode": {
                "vehiclePowerMode": 0
            },
            "TripMeter": {
                "tripMeters": [1245, 1000]
            },
            "Acceleration": {
                "x": 400,
                "y": 10,
                "z": 600
            },
            "Fuel": {
                "level": 120,
                "range": 130,
                "instantConsumption": 140,
                "instantEconomy": 145,
                "averageEconomy": 47
            },
            "EngineOil": {
                "remaining": 56,
                "temperature": 78,
                "pressure": 54
            },
            "Location": {
                "latitude": -15,
                "longitude": 12,
                "altitude": 16,
                "direction": 69
            },
            "ExteriorBrightness": {
                "exteriorBrightness": 45
            },
            "Temperature": {
                "interior": 45,
                "exterior": 58
            },
            "RainSensor": {
                "rainSensor": 6
            },
            "Odometer": {
                "odometer": 1314
            }
        },
        "1384406100000": { //2013-11-14 13:15:00
            "VehicleSpeed" : {
                "vehicleSpeed": 320
            },
            "EngineSpeed" : {
                "engineSpeed": 4000
            },
            "VehiclePowerMode": {
                "vehiclePowerMode": 1
            },
            "TripMeter": {
                "tripMeters": [90, 100, 1000]
            },
            "Acceleration": {
                "x": 850,
                "y": 853,
                "z": 956
            },
            "Fuel": {
                "level": 78,
                "range": 99,
                "instantConsumption": 98,
                "instantEconomy": 125,
                "averageEconomy": 157
            },
            "EngineOil": {
                "remaining": 89,
                "temperature": 1001,
                "pressure": 12
            },
            "Location": {
                "latitude": 46,
                "longitude": -89,
                "altitude": 16,
                "direction": 69
            },
            "ExteriorBrightness": {
                "exteriorBrightness": 432
            },
            "Temperature": {
                "interior": 45,
                "exterior": 21
            },
            "RainSensor": {
                "rainSensor": 5
            },
            "Odometer": {
                "odometer": 521
            }
        },
        "1384407000000": { //2013-11-14 13:30:00
            "VehicleSpeed" : {
                "vehicleSpeed": 220
            },
            "EngineSpeed" : {
                "engineSpeed": 3200
            },
            "VehiclePowerMode": {
                "vehiclePowerMode": 3
            },
            "TripMeter": {
                "tripMeters": [55]
            },
            "Acceleration": {
                "x": 777,
                "y": 7878,
                "z": 521
            },
            "Fuel": {
                "level": 58,
                "range": 96,
                "instantConsumption": 230,
                "instantEconomy": 237,
                "averageEconomy": 245
            },
            "EngineOil": {
                "remaining": 12,
                "temperature": 521,
                "pressure": 16
            },
            "Location": {
                "latitude": -15,
                "longitude": -89,
                "altitude": 16,
                "direction": 86
            },
            "ExteriorBrightness": {
                "exteriorBrightness": 123
            },
            "Temperature": {
                "interior": 45,
                "exterior": 12
            },
            "RainSensor": {
                "rainSensor": 4
            },
            "Odometer": {
                "odometer": 2
            }
        },
        "1384407900000": { //2013-11-14 13:45:00
            "VehicleSpeed" : {
                "vehicleSpeed": 100
            },
            "EngineSpeed" : {
                "engineSpeed": 2600
            },
            "VehiclePowerMode": {
                "vehiclePowerMode": 2
            },
            "TripMeter": {
                "tripMeters": [1030, 1012]
            },
            "Acceleration": {
                "x": 888,
                "y": 666,
                "z": 444
            },
            "Fuel": {
                "level": 132,
                "range": 145,
                "instantConsumption": 87,
                "instantEconomy": 169,
                "averageEconomy": 91
            },
            "EngineOil": {
                "remaining": 66,
                "temperature": 1314,
                "pressure": 88
            },
            "Location": {
                "latitude": -15,
                "longitude": -89,
                "altitude": 789,
                "direction": 69
            },
            "ExteriorBrightness": {
                "exteriorBrightness": 768
            },
            "Temperature": {
                "interior": 0,
                "exterior": 45
            },
            "RainSensor": {
                "rainSensor": 3
            },
            "Odometer": {
                "odometer": 66
            }
        }
    }
};
