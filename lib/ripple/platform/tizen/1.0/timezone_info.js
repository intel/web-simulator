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

var _self,
    _timezone_data = {
    "International Date Line West": {diff: -12, abbr: ""},
    "Coordinated Universal Time-11": {diff: -11, abbr: ""},
    "Samoa": {diff: -11, abbr: ""},
    "Hawaii": {diff: -10, abbr: ""},
    "Alaska": {diff: -9, abbr: ""},
    "Baja California": {diff: -8, abbr: ""},
    "Pacific Time (US & Canada)": {diff: -8, abbr: ""},
    "Arizona": {diff: -7, abbr: ""},
    "Chihuahua, La Paz, Mazatlan": {diff: -7, abbr: ""},
    "Mountain Time (US & Canada)": {diff: -7, abbr: ""},
    "Central America": {diff: -6, abbr: ""},
    "Central Time (US & Canada)": {diff: -6, abbr: ""},
    "Guadalajara, Mexico City, Monterrey": {diff: -6, abbr: ""},
    "Saskatchewan": {diff: -6, abbr: ""},
    "Bogota, Lima, Quito": {diff: -5, abbr: ""},
    "Eastern Time (US & Canada)": {diff: -5, abbr: ""},
    "Indiana (East)": {diff: -5, abbr: ""},
//    "Caracas": {diff: -4.5, abbr: ""},
    "Asuncion": {diff: -4, abbr: ""},
    "Atlantic Time (Canada)": {diff: -4, abbr: ""},
    "Cuiaba": {diff: -4, abbr: ""},
    "Georgetown, La Paz, Manaus, San Juan": {diff: -4, abbr: ""},
    "Santiago": {diff: -4, abbr: ""},
//    "Newfoundland": {diff: -3.5, abbr: ""},
    "Brasilia": {diff: -3, abbr: ""},
    "Buenos Aires": {diff: -3, abbr: "ART"},
    "Cayenne, Fortaleza": {diff: -3, abbr: ""},
    "Greenland": {diff: -3, abbr: ""},
    "Montevideo": {diff: -3, abbr: ""},
    "Coordinated Universal Time-02": {diff: -2, abbr: ""},
    "Mid-Atlantic": {diff: -2, abbr: ""},
    "Azores": {diff: -1, abbr: ""},
    "Cape Verde Is.": {diff: -1, abbr: ""},
    "Casablanca": {diff: 0, abbr: "UTC"},
    "Coordinated Universal Time": {diff: 0, abbr: "UTC"},
    "Dublin, Edinburgh, Lisbon, London": {diff: 0, abbr: "UTC"},
    "Monrovia, Reykjavik": {diff: 0, abbr: "UTC"},
    "Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna": {diff: 1, abbr: ""},
    "Belgrade, Bratislava, Budapest, Ljubljana, Prague": {diff: 1, abbr: ""},
    "Brussels, Copenhagen, Madrid, Paris": {diff: 1, abbr: "CET"},
    "Sarajevo, Skopje, Warsaw, Zagreb": {diff: 1, abbr: ""},
    "West Central Africa": {diff: 1, abbr: ""},
    "Windhoek": {diff: 1, abbr: ""},
    "Amman": {diff: 2, abbr: ""},
    "Athens, Bucharest": {diff: 2, abbr: "EET"},
    "Beirut": {diff: 2, abbr: ""},
    "Cairo": {diff: 2, abbr: "EET"},
    "Damascus": {diff: 2, abbr: ""},
    "Harare, Pretoria": {diff: 2, abbr: ""},
    "Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius": {diff: 2, abbr: ""},
    "Istanbul": {diff: 2, abbr: ""},
    "Jerusalem": {diff: 2, abbr: ""},
    "Minsk": {diff: 2, abbr: ""},
    "Baghdad": {diff: 3, abbr: ""},
    "Kaliningrad": {diff: 3, abbr: ""},
    "Kuwait, Riyadh": {diff: 3, abbr: ""},
    "Nairobi": {diff: 3, abbr: ""},
//    "Tehran": {diff: 3.5, abbr: ""},
    "Abu Dhabi, Muscat": {diff: 4, abbr: ""},
    "Baku": {diff: 4, abbr: ""},
    "Moscow, St. Petersburg, Volgograd": {diff: 4, abbr: ""},
    "Port Louis": {diff: 4, abbr: ""},
    "Tbilisi": {diff: 4, abbr: ""},
    "Yerevan": {diff: 4, abbr: ""},
//    "Kabul": {diff: 4.5, abbr: ""},
    "Islamabad, Karachi": {diff: 5, abbr: ""},
    "Tashkent": {diff: 5, abbr: ""},
//    "Chennai, Kolkata, Mumbai, New Delhi": {diff: 5.5, abbr: ""},
//    "Sri Jayawardenepura": {diff: 5.5, abbr: ""},
//    "Kathmandu": {diff: 5.75, abbr: ""},
    "Astana": {diff: 6, abbr: ""},
    "Dhaka": {diff: 6, abbr: ""},
    "Ekaterinburg": {diff: 6, abbr: ""},
//    "Yangon (Rangoon)": {diff: 6.5, abbr: ""},
    "Bangkok, Hanoi, Jakarta": {diff: 7, abbr: ""},
    "Novosibirsk": {diff: 7, abbr: ""},
    "Beijing, Chongqing, Hong Kong, Urumqi": {diff: 8, abbr: "CST"},
    "Krasnoyarsk": {diff: 8, abbr: ""},
    "Kuala Lumpur, Singapore": {diff: 8, abbr: "SGT"},
    "Perth": {diff: 8, abbr: ""},
    "Taipei": {diff: 8, abbr: ""},
    "Ulaanbaatar": {diff: 8, abbr: ""},
    "Irkutsk": {diff: 9, abbr: ""},
    "Osaka, Sapporo, Tokyo": {diff: 9, abbr: "JST"},
    "Seoul": {diff: 9, abbr: "KST"},
//    "Adelaide": {diff: 9.5, abbr: ""},
//    "Darwin": {diff: 9.5, abbr: ""},
    "Brisbane": {diff: 10, abbr: ""},
    "Canberra, Melbourne, Sydney": {diff: 10, abbr: "EST"},
    "Guam, Port Moresby": {diff: 10, abbr: ""},
    "Hobart": {diff: 10, abbr: ""},
    "Yakutsk": {diff: 10, abbr: ""},
    "Solomon Is., New Caledonia": {diff: 11, abbr: ""},
    "Vladivostok": {diff: 11, abbr: ""},
    "Auckland, Wellington": {diff: 12, abbr: ""},
    "Coordinated Universal Time+12": {diff: 12, abbr: ""},
    "Fiji": {diff: 12, abbr: ""},
    "Magadan": {diff: 12, abbr: ""},
    "Nuku'alofa": {diff: 13, abbr: ""}
};

module.exports = {
    getAllTimezone: function () {
        var i, ret = [];
        for (i in _timezone_data)
            ret.push(i);
        return ret;
    },
    getTimezoneDiff: function (zone) {
        return _timezone_data[zone].diff;
    },
    getTimezoneAbbr: function (zone) {
        return _timezone_data[zone].abbr;
    },
    isValidTimezone: function (zone) {
        return (_timezone_data[zone] === undefined) ? false : true;
    }
};

