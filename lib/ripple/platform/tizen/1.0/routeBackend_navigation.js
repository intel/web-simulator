/*
 *  Copyright 2012 Intel Corporation.
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
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    lbs_utils = require('ripple/platform/tizen/1.0/lbs_utils'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    SimpleCoordinates = require('ripple/platform/tizen/1.0/SimpleCoordinates'),
    RouteWaypoint,
    RouteDistance,
    RouteDuration,
    RouteStep,
    RouteSegment,
    RouteRequestOptions,
    RouteResultSummary,
    RouteResult,
    LocationServiceProvider = {},
    _data = {
        positionDistance: {},
        positionDuration: {},
        routeProvider: {},
        routes: [],
        RouteDistanceUnit: ["M", "KM", "MI", "FT"],
        providers: [],
        path: []
    }, 
    _self;

// The RouteWaypoint object
RouteWaypoint = function () {
    return {
        position: {
            latitude: 0,
            longitude: 0
        },
        isStopover: true
    };
};

// The RouteDistance object
RouteDistance = function () {
    return {
        text : "Distance",
        value : "0",
        unit : "KM "
    };
};

// The RouteDuration object
RouteDuration = function () {
    return {
        text : "Duration",
        value : "0" // The duration in a seconds
    };
};

// The RouteStep object
RouteStep = function () {
    var _self = {
        mode: "",        // The way of the travel, for example: car, bike, foot
        instruction: "", // The instruction of this step
        points: []       // The points of this step
    };

    _self.origin      = new SimpleCoordinates(0, 0);
    _self.destination = new SimpleCoordinates(0, 0);
    _self.distance    = new RouteDistance();
    _self.duration    = new RouteDuration();

    return _self;
};
// The RouteSegment object
RouteSegment = function () {
    var _self = {
        steps: []
    };

    _self.origin      = new SimpleCoordinates(0, 0);
    _self.destination = new SimpleCoordinates(0, 0);
    _self.distance    = new RouteDistance();
    _self.duration    = new RouteDuration();

    return _self;
};

// The RouteRequestOptions object
RouteRequestOptions = function () {
    return {
        mode: "", // CAR, BIKE
        unit: "KM",
        routeGoal: "SHORTEST",
        constraints: ["HIGHWAY", "TOLL", "UNPAVED"],
        wayPoints: [],
        maxResults: 1
    };
};

// The RouteResultSummary object
RouteResultSummary = function () {
    var _self = {};

    _self.origin        = new SimpleCoordinates(0, 0);
    _self.destination   = new SimpleCoordinates(0, 0);
    _self.totalDistance = new RouteDistance();
    _self.totalDuration = new RouteDuration();

    return _self;
};

// The RouteResult object
RouteResult = function () {
    var _self, jsonStr, jsonObj;
    jsonObj = { 
            "type" : "Point",
            "coordinates" : []
        };
    jsonStr = JSON.stringify(jsonObj);
    _self = {
        segments : [],
        toGeoJSON : function () {
                return jsonStr;
            }
    };
    _self.summary = new RouteResultSummary();
    return _self;
};

function calcDegree(distance) { 
    return distance * Math.PI / 180.0;
} 

//calcute the distance
function  calculateDistance(lat1, lat2, lon1, lon2) {
    var R = 6371, dLat, dLon, a, c, distance; // km
    dLat = calcDegree(parseFloat(lat2) - parseFloat(lat1));
    dLon = calcDegree(parseFloat(lon2) - parseFloat(lon1));
    
    lat1 = calcDegree(lat1);
    lat2 = calcDegree(lat2);

    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
             Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    distance = R * c;
    return distance;
}

function calculateDuration(mode, distance) {
    var duration, v;
    switch (mode) {
    case "motorcar" :
        v = 50;
        duration = distance / v;
        break;
    case "bicycle" :
        v = 20;
        duration = distance / v;
        break;
    case "foot" :
        v = 5;
        duration = distance / v;
        break;
    default:
        duration = 0;
    }
    return duration;
}

function optimalWay(points, mode) {
    var steps = [], startLatitude, startLongitude, originLocation, endLatitude, endLongitude,
    destinationLocation, step, distance, segment, result, i, routeDistance, routeDuration;
    for (i = 0;i < points.length - 1;i++) {
        startLatitude       = points[i].lat;
        startLongitude      = points[i].lon;
        originLocation      = new SimpleCoordinates(startLatitude, startLongitude);
        endLatitude         = points[i + 1].lat;
        endLongitude        = points[i + 1].lon;
        destinationLocation = new SimpleCoordinates(endLatitude, endLongitude);
        step                = new RouteStep();
        step.origin         = originLocation;
        step.destination    = destinationLocation;
        distance            = calculateDistance(startLatitude, endLatitude, startLongitude, endLongitude);
        routeDistance       = new RouteDistance();
        routeDistance.value = distance;
        routeDistance.unit  = "km";
        step.distance       = routeDistance;
        routeDuration       = new RouteDuration();
        routeDuration.value = calculateDuration(mode, distance);
        step.duration       = routeDuration;
        steps.push(step);
    }
    return steps;
}

function existInSupports(str, array) {
    for (var i in array) {
        if (str === array[i]) {
            return true;
        }
    }
    return false;
}

function navigation(searchStr, flat, flon, tlat, tlon, v, fast) {
    var positions = [];

    _data.positionDistance = {};
    _data.positionDuration = {};
    jQuery.ajax({
        type : "get",
        async : false,
        url : searchStr,
        data : {
            flat : flat,
            flon : flon,
            tlat : tlat,
            tlon : tlon,
            v : v,
            fast : fast,
            layer : 'mapnik',
            format : "geojson"
        },
        contentType : "application/json; charset=utf-8",
        dataType : "json",
        cache : false,
        success : function (data) {
            $.each(data.coordinates, function (i, item) {
                var point = {};
                point.lon = item[0];
                point.lat = item[1];
                positions.push(point);
            });
            $.each(data.properties, function (i, item) {
                if (typeof item === "number") {
                    _data.positionDistance = new RouteDistance();
                    _data.positionDistance.value = item;
                    _data.positionDistance.unit = "km";
                    _data.positionDuration = new RouteDuration();
                    _data.positionDuration.value = calculateDuration(v, item);
                }
            });
        },
        error : function (errorCB) {
            if (errorCB) {
                setTimeout(function () {
                    errorCB(new WebAPIError(errorcode.NETWORK_ERR));
                }, 1);
            }
        }
    });
    return positions;
}


function filterWaypoints(routeWaypoints) {
    var mathWaypoints = [], i;
    for (i in routeWaypoints) {
        if (routeWaypoints[i].position.latitude !== "" &&
            routeWaypoints[i].position.latitude !== undefined &&
            routeWaypoints[i].position.latitude !== null &&
            routeWaypoints[i].position.longitude !== null &&
            routeWaypoints[i].position.longitude !== "" &&
            routeWaypoints[i].position.longitude !== undefined) {
            mathWaypoints.push(routeWaypoints[i]);
        }
    }
    return mathWaypoints;
}

module.exports = function (prop) {
    var _self = new lbs_utils.LocationServiceProvider(prop);

    _self.supportedGoals       = ["SHORTEST", "FASTEST", "MOST_SCENIC", "SIMPLEST", "CHEAPEST", "SAFEST" ];
    _self.supportedModes       = ["motorcar", "bicycle", "foot"];
    _self.supportedConstraints = ["HIGHWAY", "TOLL", "UNPAVED", "BORDER", "GRAVEL_PAVING", "TUNNEL", "BRIDGE", "LEFT_TURN", "CARPOOL", "HAZARDOUS_CARGO" ];
    _self.supportsWayPoints    = true;
    _self.find = function (origin, destination, successCallback, errorCallback, options) {
        function _find() {
            var flat, flon, tlat, tlon, v, fast, layer, mapnik, format, searchStr, mode, result,
                points = [],
                routeWaypoints = [],
                segmentPositions = [],
                positions = [],
                segments = [],
                totalDistances = 0, totalDurations = 0,
                k, key, segment, startPosition, endPosition,
                summary, distance, duration;

            v = options.mode;
            //init
            if (!existInSupports(v, _self.supportedModes)) {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }
            if (!existInSupports(options.routeGoal, _self.supportedGoals)) {
                throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
            }
            switch (options.routeGoal) {
            case "SHORTEST":
                fast = 0;
                break;

            case "FASTEST":
                fast = 1;
                break;

            case "SIMPLEST":
                break;

            case "MOST_SCENIC":
                break;

            case "CHEAPEST":
                break;

            case "SAFEST":
                break;

            default:
                fast = 0;
            }
            searchStr      = "http://www.yournavigation.org/api/dev/gosmore.php";
            routeWaypoints = options.wayPoints;
            routeWaypoints = filterWaypoints(routeWaypoints);
            segmentPositions.push(origin);

            if (routeWaypoints.length > 0) {
                for (k in routeWaypoints) {
                    segmentPositions.push(routeWaypoints[k].position);
                }
            }
            segmentPositions.push(destination);

            for (key = 0; key < segmentPositions.length - 1; key++) {
                segment             = new RouteSegment();
                startPosition       = segmentPositions[key];
                endPosition         = segmentPositions[key + 1];
                segment.origin      = startPosition;
                segment.destination = endPosition;
                flat                = startPosition.latitude;
                flon                = startPosition.longitude;
                tlat                = endPosition.latitude;
                tlon                = endPosition.longitude;
                positions           = navigation(searchStr, flat, flon, tlat, tlon, v, fast);
                segment.steps       = optimalWay(positions, v);
                segment.distance    = _data.positionDistance;
                totalDistances     += _data.positionDistance.value;
                segment.duration    = _data.positionDuration;
                totalDurations     += _data.positionDuration.value;
                segments.push(segment);
            }
            result                = new RouteResult();
            summary               = new RouteResultSummary();
            summary.origin        = segmentPositions[0];
            summary.destination   = segmentPositions[segmentPositions.length - 1];
            distance              = new RouteDistance();
            distance.value        = totalDistances;
            distance.unit         = "km";
            summary.totalDistance = distance;
            duration              = new RouteDuration();
            duration.value        = totalDurations;
            summary.totalDuration = duration;
            result.segments       = segments;
            result.summary        = summary;
            successCallback(result);
        }

        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "find", _find);
    };

    return _self;
};