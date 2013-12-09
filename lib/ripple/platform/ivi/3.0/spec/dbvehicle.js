module.exports = {
    "supported": ["VehicleSpeed", "EngineSpeed", "VehiclePowerMode", "TripMeter",
        "Acceleration", "Transmission", "CruiseControlStatus", "WheelBrake",
        "LightStatus", "InteriorLightStatus", "Horn", "Fuel", "EngineOil",
        "Location", "ExteriorBrightness", "Temperature", "RainSensor",
        "WindshieldWiper", "HVAC", "WindowStatus", "Sunroof", "ConvertibleRoof",
        "VehicleId", "Size", "FuelInfo", "VehicleType", "Doors",
        "TransmissionGearType", "WheelInformation", "Odometer", "Fluid", "Battery",
        "TirePressure", "TireTemperature", "SecurityAlert", "ParkingBrake",
        "ParkingLight", "HazardLight", "AntilockBrakingSystem", "TractionControlSystem",
        "VehicleTopSpeedLimit", "AirbagStatus", "DoorStatus", "SeatBeltStatus",
        "OccupantStatus", "ObstacleDistance", "NightMode", "DrivingMode"],
    "history": [],
    "currentConfiguration": 0,
    "configurationData": [
        [
            "AFA", //VehicleId => WMI
            "21D1M2883N342FFG7", //VehicleId => VIN
            2096, //Size => width
            1860, //Size => height
            4779, //Size => length
            0, //FuelInfo => type
            0, //FuelInfo => refuelPosition
            0, //VehicleType => type
            [2, 2], //Doors => doorsPerRow
            0, //TransmissionGearType => transmissionGearType
            1953, //WheelInformation => frontWheelRadius
            2000, //WheelInformation => rearWheelRadius
            1465, //WheelInformation => wheelTrack
            true //WheelInformation => ABS
        ],
        [
            "KMH", "21D1M2888N342FFL7", /**/2125, 1961, 4901, /**/4, 3, /**/4, /**/[2, 2], /**/2,
        /**/1964, 2000, 1470, true
        ]
    ],
    "settingData": [
        0, //Transmission-gearPosition
        0, //Transmission-mode
        true, //CruiseControlStatus-activated
        0, //CruiseControlStatus-speed
        true, //WheelBrake-engaged
        false, //LightStatus-head
        false, //LightStatus-rightTurn
        false, //LightStatus-leftTurn
        false, //LightStatus-brake
        false, //LightStatus-fog
        false, //LightStatus-hazard
        false, //LightStatus-parking
        false, //LightStatus-highBeam
        false, //InteriorLightStatus-passenger
        false, //InteriorLightStatus-driver
        false, //InteriorLightStatus-center
        false, //Horn-horn
        0, //WindshieldWiper-windshieldWiper
        0x04, //HVAC-airflowDirection
        0, //HVAC-airflowDirection
        0, //HVAC-targetTemperature
        false, //HVAC-airConditioning
        false, //HVAC-airRecirculation
        false, //HVAC-heater
        false, //HVAC-steeringWheelHeater
        false, //HVAC-seatHeater
        false, //HVAC-seatCooler
        0, //Sunroof-openness
        0, //Sunroof-tilt
        0, //ConvertibleRoof-openness
        true, //SecurityAlert-securityAlert
        true, //ParkingBrake-parkingBrake
        true, //ParkingLight-parkingLight
        true, //HazardLight-hazardLight
        true, //AntilockBrakingSystem-antilockBrakingSystem
        true, //TractionControlSystem-TractionControlSystem
        120, //VehicleTopSpeedLimit-VehicleTopSpeedLimit
        0, //WindowStatus-openness
        true, //WindowStatus-defrost
        2, //AirbagStatus-airbagStatus
        0, //DoorStatus-doorStatus
        true, //DoorStatus-doorLockStatus
        true, //DoorStatus-childLockStatus
        false, //SeatBeltStatus-seatBeltStatus
        0, //OccupantStatus-occupantStatus
        10, //ObstacleDistance-obstacleDistance
        false, //NightMode-nightMode
        0, //DrivingMode-drivingMode
        0, //Fluid-transmission
        0, //Fluid-brake
        0, //Fluid-washer
        220, //Battery-voltage
        0.5, //Battery-current
        0, //TirePressure-leftFront
        0, //TirePressure-rightFront
        0, //TirePressure-leftRear
        0, //TirePressure-rightRear
        0, //TireTemperature-leftFront
        0, //TireTemperature-rightFront
        0, //TireTemperature-leftRear
        0 //TireTemperature-rightRear
    ],
    "autoRunningData": [
        [
            0, //VehicleSpeed => vehicleSpeed
            0, //EngineSpeed => engineSpeed
            1, //VehiclePowerMode => vehiclePowerMode
            [23, 7876, 124, 4577], //TripMeter => tripMeters
            0, //Acceleration => x
            0, //Acceleration => y
            0, //Acceleration => z
            87, //Fuel => level
            251, //Fuel => range
            250, //Fuel => instantConsumption
            85, //Fuel => instantEconomy
            15, //Fuel => averageEconomy
            0, //EngineOil => remaining
            0, //EngineOil => temperature
            0, //EngineOil => pressure
            0, //Location => latitude
            0, //Location => longitude
            0, //Location => altitude
            0, //Location => direction
            0, //ExteriorBrightness => exteriorBrightness
            0, //Temperature => interior
            0, //Temperature => exterior
            2, //RainSensor => rainSensor
            15000 //Odometer => odometer
        ],
        [
            60, /**/2500, /**/0, /**/[23, 7876, 124, 4577, 10], /**/10, 10, 10, /**/80, 251, 59, 87, 15,
        /**/150, 560, 59, /**/-15, -89, 16, 69, /**/456, /**/45, 45, /**/10, /**/1213
        ],
        [
            120, /**/2800, /**/1, /**/[23, 7876, 124, 4577, 25], /**/120, 120, 120, /**/65, 251, 59, 87, 15,
        /**/78, 546, 54, /**/-97, -54, 124, 65, /**/45, /**/67, 45, /**/9, /**/250
        ]
    ]
};
