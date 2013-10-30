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
    supported: ["VehicleSpeed", "VehiclePowerMode", "LightStatus", "HVAC"],
    dataCount: 3,
    data: {
        "2013-11-01 12:12:34": {
            "VehicleSpeed" : {
                "VehicleSpeed": 120
            },
            "EngineSpeed" : {
                "EngineSpeed": 3000
            },
            "VehiclePowerMode" : {
                "VehiclePowerMode": 1
            },
            "TripMeters" : {
                "TripMeters": [100, 200]
            },
            "Acceleration": {
                "X": 100,
                "Y": 5,
                "Z": 6
            },
            "Transmission": {
                "GearPosition": 128,
                "Mode": 3
            },
            "CruiseControlStatus": {
                "Activated": true,
                "Speed": 80
            },
            "WheelBrake": {
                "Engaged": true
            },
            "LightStatus": {
                "Head": true,
                "RightTurn": false,
                "LeftTurn": false,
                "Brake": false,
                "Fog": false,
                "Hazard": false,
                "Parking": false,
                "HighBeam": false
            },
            "InteriorLightStatus": {
                "Passenger": true,
                "Driver": false,
                "Center": false,
                "Brake": false,
                "Fog": false,
                "Hazard": false,
                "Parking": false,
                "HighBeam": false
            },
            "Horn": {
                "On": true
            },
            "Fuel": {
                "Level": 100,
                "Range": 5,
                "InstantConsumption": 6,
                "InstantEconomy": 200,
                "AverageEconomy": 130
            },
            "EngineOil": {
                "Remaining": 10,
                "Temperature": 200,
                "Pressure": 79
            },
            "ExteriorBrightness": {
                "ExteriorBrightness": 10
            },
            "Temperature": {
                "Interior": 10,
                "Exterior": 10
            },
            "RainSensor": {
                "RainSensor": 10
            },
            "WindshieldWiper": {
                "WindshieldWiper": 10
            },
            "HVAC": {
                "AirflowDirection": 100,
                "FanSpeed": 5,
                "TargetTemperature": 6,
                "AirConditioning": false,
                "AirRecirculation": false,
                "Heater": false,
                "Defrost": {window: 1, defrost:true},
                "SteeringWheelHeater": false,
                "SeatHeater": false
            }
        },
        "2013-11-03 11:15:56": {
            "VehicleSpeed" : {
                "VehicleSpeed": 130
            },
            "EngineSpeed" : {
                "EngineSpeed": 3200
            },
            "VehiclePowerMode" : {
                "VehiclePowerMode": 2
            },
            "TripMeters" : {
                "TripMeters": [200, 300]
            },
            "Acceleration": {
                "X": 90,
                "Y": 50,
                "Z": 60
            },
            "Transmission": {
                "GearPosition": 156,
                "Mode": 2
            },
            "CruiseControlStatus": {
                "Activated": false,
                "Speed": 90
            },
            "WheelBrake": {
                "Engaged": true
            },
            "LightStatus": {
                "Head": false,
                "RightTurn": false,
                "LeftTurn": false,
                "Brake": false,
                "Fog": true,
                "Hazard": false,
                "Parking": false,
                "HighBeam": false
            },
            "InteriorLightStatus": {
                "Passenger": true,
                "Driver": false,
                "Center": false,
                "Brake": false,
                "Fog": true,
                "Hazard": false,
                "Parking": false,
                "HighBeam": false
            },
            "Horn": {
                "On": false
            },
            "Fuel": {
                "Level": 150,
                "Range": 5,
                "InstantConsumption": 6,
                "InstantEconomy": 100,
                "AverageEconomy": 130
            },
            "EngineOil": {
                "Remaining": 10,
                "Temperature": 200,
                "Pressure": 79
            },
            "ExteriorBrightness": {
                "ExteriorBrightness": 10
            },
            "Temperature": {
                "Interior": 20,
                "Exterior": 10
            },
            "RainSensor": {
                "RainSensor": 10
            },
            "WindshieldWiper": {
                "WindshieldWiper": 20
            },
            "HVAC": {
                "AirflowDirection": 120,
                "FanSpeed": 5,
                "TargetTemperature": 6,
                "AirConditioning": true,
                "AirRecirculation": false,
                "Heater": false,
                "Defrost": {window: 1, defrost:true},
                "SteeringWheelHeater": false,
                "SeatHeater": false
            }
        },
        "2013-11-11 01:00:25": {
            "VehicleSpeed" : {
                "VehicleSpeed": 150
            },
            "EngineSpeed" : {
                "EngineSpeed": 2500
            },
            "VehiclePowerMode" : {
                "VehiclePowerMode": 1
            },
            "TripMeters" : {
                "TripMeters": [100, 200]
            },
            "Acceleration": {
                "X": 100,
                "Y": 5,
                "Z": 6
            },
            "Transmission": {
                "GearPosition": 128,
                "Mode": 3
            },
            "CruiseControlStatus": {
                "Activated": true,
                "Speed": 80
            },
            "WheelBrake": {
                "Engaged": true
            },
            "LightStatus": {
                "Head": true,
                "RightTurn": false,
                "LeftTurn": false,
                "Brake": false,
                "Fog": false,
                "Hazard": false,
                "Parking": false,
                "HighBeam": false
            },
            "InteriorLightStatus": {
                "Passenger": true,
                "Driver": false,
                "Center": false,
                "Brake": false,
                "Fog": false,
                "Hazard": false,
                "Parking": false,
                "HighBeam": false
            },
            "Horn": {
                "On": true
            },
            "Fuel": {
                "Level": 100,
                "Range": 5,
                "InstantConsumption": 6,
                "InstantEconomy": 200,
                "AverageEconomy": 130
            },
            "EngineOil": {
                "Remaining": 10,
                "Temperature": 200,
                "Pressure": 79
            },
            "ExteriorBrightness": {
                "ExteriorBrightness": 10
            },
            "Temperature": {
                "Interior": 10,
                "Exterior": 10
            },
            "RainSensor": {
                "RainSensor": 10
            },
            "WindshieldWiper": {
                "WindshieldWiper": 10
            },
            "HVAC": {
                "AirflowDirection": 98,
                "FanSpeed": 7,
                "TargetTemperature": 6,
                "AirConditioning": false,
                "AirRecirculation": true,
                "Heater": false,
                "Defrost": {window: 1, defrost:true},
                "SteeringWheelHeater": true,
                "SeatHeater": false
            }
        }
    }
}