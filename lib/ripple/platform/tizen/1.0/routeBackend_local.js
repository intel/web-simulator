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

var db = require('ripple/db'),
    utils = require('ripple/utils'),
    errorcode = require('ripple/platform/tizen/1.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/1.0/WebAPIError'),
    SimpleCoordinates = require('ripple/platform/tizen/1.0/SimpleCoordinates'),
    tizen1_utils = require('ripple/platform/tizen/1.0/tizen1_utils'),
    lbs = require('ripple/platform/tizen/1.0/lbs'),
    LocationServiceProvider = {},
    RouteWaypoint,
    RouteDistance,
    RouteDuration,
    RouteStep,
    RouteSegment,
    RouteRequestOptions,
    RouteResultSummary,
    RouteResult,
    _data = {
        DB_ROUTE_LOCATION_KEY: "tizen1-db-route",
        DB_ROUTE_COLLEAGE_KEY: "tizen2-db-route",
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
        text: "",
        value: 0,
        unit: "KM"
    };
};

// The RouteDuration object
RouteDuration = function () {
    return {
        text: "",
        value: 0 // The duration in a seconds
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
    var _self = {
        segments: []
    };

    _self.summary = new RouteResultSummary();

    return _self;
};

// Floyd arithmetic in Mathematics, solving the optimal way
function floyd(e, n, startIndex, endIndex) {
    var MAX = Infinity,
        a = new Array(n), i, j, k, p = new Array(n),
        paths, pathWay = [];

    for (i = 1; i < n + 1; i++) {
        a[i] = new Array(n);
    }
    for (i = 1; i < n + 1; i++) {
        p[i] = new Array(n);
    }
    for (i = 1; i < n + 1; i++) {
        for (j = 1; j < n + 1; j++) {
            if (i === j || e[i][j] === "MIN") {
                a[i][j] = 0;
            } else if (e[i][j] !== 0 && e[i][j] !== "MIN") {
                a[i][j] = e[i][j];
            } else {
                a[i][j] = MAX;
            }
            p[i][j] = 0;
        }
    }
    for (i = 1; i < n + 1; i++) {
        a[i][i] = 0;
    }
    for (k = 1; k < n + 1; k++) {
        for (i = 1; i < n + 1; i++) {
            for (j = 1; j < n + 1; j++) {
                if (parseInt(a[i][k], 10) + parseInt(a[k][j], 10) < a[i][j]) {
                    a[i][j] = parseInt(a[i][k], 10) + parseInt(a[k][j], 10);
                    p[i][j] = k;
                }
            }
        }
    }
    _data.path = [];
    paths = findPath(startIndex, endIndex, p);
    pathWay = [];
    pathWay.push(startIndex);
    for (i = 0; i < paths.length; i++) {
        pathWay.push(paths[i]);
    }
    pathWay.push(endIndex);

    return pathWay;
}

// Find the best way in the locations
function findPath(i, j, p) {
    var k = p[i][j];

    if (k === 0 || i === j) {
        return _data.path;
    }
    findPath(i, k, p);
    _data.path.push(k);

    return findPath(k, j, p);
}

// Find the index in the locations by string
function findIndexByStr(str, locations) {
    for (var i in locations) {
        if (locations[i].name === str) {
            return parseInt(i, 10) + 1;
        }
    }
    return -1;
}

// Find the index in the colleages by name1 and name2
function findValueByStr(start, end, locations, colleages) {
    for (var i in colleages) {
        if (colleages[i].name1 === locations[start - 1].name && colleages[i].name2 === locations[end - 1].name) {
            return parseInt(i, 10);
        } else if (colleages[i].name2 === locations[start - 1].name && colleages[i].name1 === locations[end - 1].name) {
            return parseInt(i, 10);
        }
    }
    return -1;
}

// Find the index in the locations by latitude and longitude
function searchIndexBycoodinates(latitude, longitude, locations) {
    if (latitude !== null && longitude !== null) {
        for (var i in locations) {
            if (locations[i].latitude === latitude && locations[i].longitude === longitude) {
                return parseInt(i, 10) + 1;
            }
        }
    }
    return -1;
}

// Get the relation among the locations
function getRelation(n, colleages, locations, goal) {
    var i, j, start, end, relation = new Array(n + 1);
    for (i = 1; i < n + 2; i++) {
        relation[i] = new Array(n + 1);
    }
    for (i = 1; i < n + 1; i++) {
        for (j = 1; j < n + 1; j++) {
            relation[i][j] = 0;
        }
    }
    for (i in colleages) {
        start = findIndexByStr(colleages[i].name1, locations);
        end = findIndexByStr(colleages[i].name2, locations);
        if (start !== -1 && end !== -1 && start !== end) {
            switch (goal) {
            case "distance":
                relation[start][end] = colleages[i].distance;
                relation[end][start] = colleages[i].distance;
                break;

            case "duration":
                relation[start][end] = colleages[i].duration;
                relation[end][start] = colleages[i].duration;
                break;

            case "simple":
                relation[start][end] = 1;
                relation[end][start] = 1;
                break;

            case "scenic":
                if (colleages[i].addition.scenic === "SCENIC") {
                    relation[start][end] = 1;
                    relation[start][end] = 1;
                } else if (colleages[i].addition.scenic === "") {
                    relation[start][end] = "MIN";
                    relation[start][end] = "MIN";
                }
                break;

            case "cheap":
                if (colleages[i].addition.toll === "TOLL") {
                    relation[start][end] = 1;
                    relation[end][start] = 1;
                } else if (colleages[i].addition.toll === "") {
                    relation[start][end] = "MIN";
                    relation[start][end] = "MIN";
                }
                break;

            case "safe":
                if (colleages[i].addition.hazardous === "HAZARDOUS") {
                    relation[start][end] = 1;
                    relation[end][start] = 1;
                } else if (colleages[i].addition.hazardous === "") {
                    relation[start][end] = "MIN";
                    relation[end][start] = "MIN";
                }
                break;

            default:
                return null;
            }
        }
    }

    return relation;
}

// Get the distance relationship among the locations
function distanceRelation(n, colleages, locations) {
    return getRelation(n, colleages, locations, "distance");
}

// Get the duration relationship among the locations
function durationRelation(n, colleages, locations) {
    return getRelation(n, colleages, locations, "duration");
}

// Get the simple relationship among the locations
function simpleRelation(n, colleages, locations) {
    return getRelation(n, colleages, locations, "simple");
}

// Get the cheap relationship among the locations
function cheapRelation(n, colleages, locations) {
    return getRelation(n, colleages, locations, "cheap");
}

// Get the safe relationship among the locations
function safeRelation(n, colleages, locations) {
    return getRelation(n, colleages, locations, "safe");
}

// Get the scenic relationship among the locations
function scenicRelation(n, colleages, locations) {
    return getRelation(n, colleages, locations, "scenic");
}

// Get the shortest way by origin, destination, locations and colleages
function optimalWay(origin, destination, locations, colleages, relation) {
    var n = locations.length, i, steps = [], step, relations, routeLocations,
        originIndex, destinationIndex, startIndex, endIndex, colleageIndex,
        originLatitude, originLongitude, destinationLatitude, destinationLongitude,
        startLatitude, startLongitude, endLatitude, endLongitude,
        originLocation, destinationLocation, segment, result;

    originLatitude = origin.latitude;
    originLongitude = origin.longitude;
    originIndex = searchIndexBycoodinates(originLatitude, originLongitude, locations);

    destinationLatitude = destination.latitude;
    destinationLongitude = destination.longitude;
    destinationIndex = searchIndexBycoodinates(destinationLatitude, destinationLongitude, locations);

    relations = relation(n, colleages, locations);

    if (originIndex !== -1 && destinationIndex !== -1) {
        routeLocations = floyd(relations, n, parseInt(originIndex, 10), parseInt(destinationIndex, 10));

        for (i = 0; i < routeLocations.length - 1; i++) {
            colleageIndex = findValueByStr(routeLocations[i], routeLocations[i + 1], locations, colleages);

            if (colleageIndex !== -1) {
                step = new RouteStep();
                startIndex = parseInt(routeLocations[i], 10) - 1;
                endIndex = parseInt(routeLocations[i + 1], 10) - 1;

                startLatitude = locations[startIndex].latitude;
                startLongitude = locations[startIndex].longitude;
                originLocation = new SimpleCoordinates(startLatitude, startLongitude);

                endLatitude = locations[endIndex].latitude;
                endLongitude = locations[endIndex].longitude;
                destinationLocation = new SimpleCoordinates(endLatitude, endLongitude);

                step.origin = originLocation;
                step.destination = destinationLocation;
                step.distance = colleages[colleageIndex].distance;
                step.duration = colleages[colleageIndex].duration;
                step.mode = colleages[colleageIndex].mode;
                step.addition = colleages[colleageIndex].addition;

                steps.push(step);
            } else if (colleageIndex === -1) {
                return null;
            }
        }

        segment = new RouteSegment();
        segment.steps = steps;
        result = new RouteResult();
        result.segments[0] = segment;

        return result;
    }
    return null;
}

// Get the shortest way by origin, destination, locations and colleages
function shortestWay(origin, destination, locations, colleages) {
    return optimalWay(origin, destination, locations, colleages, distanceRelation);
}

// Get the fastest way by origin, destination, locations and colleages
function fastestWay(origin, destination, locations, colleages) {
    return optimalWay(origin, destination, locations, colleages, durationRelation);
}

// Get the simplest way by origin, destination, locations and colleages
function simplestWay(origin, destination, locations, colleages) {
    return optimalWay(origin, destination, locations, colleages, simpleRelation);
}

// Get the most scenic way by origin, destination, locations and colleages
function mostScenicWay(origin, destination, locations, colleages) {
    return optimalWay(origin, destination, locations, colleages, scenicRelation);
}

// Get the cheapest way by origin, destination, locations and colleages
function cheapestWay(origin, destination, locations, colleages) {
    return optimalWay(origin, destination, locations, colleages, cheapRelation);
}

// Get the safest way by origin, destination, locations and colleages
function safestWay(origin, destination, locations, colleages) {
    return optimalWay(origin, destination, locations, colleages, safeRelation);
}

// Uniquelize the array
function uniquelize(array) {
    var temp = {}, result = [], i;
    for (i = array.length; i--;) {
        temp[array[i]] = array[i];
    }
    for (i in temp) {
        result.push(temp[i]);
    }
    return result;
}

// Is it intersect between the Array a and b
function intersect(a, b) {
    var i, j;

    a = uniquelize(a);
    if (a.length === 0 && b.length === 0) {
        return true;
    }
    for (i in a) {
        for (j in b) {
            if (a[i] === b[j])
                return true;
        }
    }
    return false;
}

function getConstrains(result) {
    var steps = result.segments[0].steps, constrains = [];

    utils.forEach(steps, function (item, index) {
        if (item.addition.highway === "HIGHWAY") {
            constrains.push("HIGHWAY");
        }
        if (item.addition.toll === "TOLL") {
            constrains.push("TOLL");
        }
        if (item.addition.bridge === "BRIDGE") {
            constrains.push("BRIDGE");
        }
        if (item.addition.hazardous === "HAZARDOUS") {
            constrains.push("HAZARDOUS");
        }
        if (item.addition.scenic === "SCENIC") {
            constrains.push("SCENIC");
        }
    });
    if (constrains.length > 0) {
        return uniquelize(constrains);
    }
    return constrains;
}

module.exports = function (prop) {
    var _self = new lbs.LocationServiceProvider(prop);
    _self.find = function (origin, destination, successCallback, errorCallback, options) {
        function _find() {
            var locations, colleages, i, result = {}, emptyResult = [], modes = [], resultModes = [], constrains = [], resultconstrains = [];

            locations = db.retrieveObject(_data.DB_ROUTE_LOCATION_KEY);
            colleages = db.retrieveObject(_data.DB_ROUTE_COLLEAGE_KEY);

            modes = options.modes;
            constrains = options.constrains;
            if (locations.length > 0 && colleages.length > 0) {
                switch (options.routeGoal) {
                case "SHORTEST":
                    result = shortestWay(origin, destination, locations, colleages);
                    break;

                case "FASTEST":
                    result = fastestWay(origin, destination, locations, colleages);
                    break;

                case "SIMPLEST":
                    result = simplestWay(origin, destination, locations, colleages);
                    break;

                case "MOST_SCENIC":
                    result = mostScenicWay(origin, destination, locations, colleages);
                    break;

                case "CHEAPEST":
                    result = cheapestWay(origin, destination, locations, colleages);
                    break;

                case "SAFEST":
                    result = safestWay(origin, destination, locations, colleages);
                    break;

                default:
                    result = shortestWay(origin, destination, locations, colleages);
                    break;
                }
                if (result !== null) {
                    for (i in result.segments[0].steps) {
                        resultModes.push(result.segments[0].steps[i].mode);
                    }
                    resultconstrains = getConstrains(result);
                    if (intersect(resultModes, modes) && intersect(resultconstrains, constrains)) {
                        successCallback(result);
                    } else {
                        successCallback(null);
                    }
                }
            } else {
                successCallback(emptyResult);
            }
        }
        tizen1_utils.validateTypeMismatch(successCallback, errorCallback, "find", _find);
    };
    return _self;
};
