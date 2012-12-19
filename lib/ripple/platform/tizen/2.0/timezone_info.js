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

var _timezone_data = {
    "Samoa": {diff: -11, abbr: "WST"},
    "Hawaii": {diff: -10, abbr: "HAST"},
    "Alaska": {diff: -9, abbr: "AKST"},
    "Baja California": {diff: -8, abbr: "PST"},
    "Arizona": {diff: -7, abbr: "MST"},
    "Chihuahua, La Paz, Mazatlan": {diff: -7, abbr: "MST"},
    "Guadalajara, Mexico City, Monterrey": {diff: -6, abbr: "CST"},
    "Bogota, Lima, Quito": {diff: -5, abbr: "PET"},
    "Asuncion": {diff: -4, abbr: "PYST"},
    "Cuiaba": {diff: -4, abbr: "AMST"},
    "Georgetown, La Paz, Manaus, San Juan": {diff: -4, abbr: "BOT"},
    "Santiago": {diff: -4, abbr: "CLST"},
    "Brasilia": {diff: -3, abbr: "BRST"},
    "Buenos Aires": {diff: -3, abbr: "ART"},
    "Cayenne, Fortaleza": {diff: -3, abbr: "GFT"},
    "Greenland": {diff: -3, abbr: "WGT"},
    "Montevideo": {diff: -3, abbr: "UYST"},
    "Azores": {diff: -1, abbr: "AZOT"},
    "Casablanca": {diff: 0, abbr: "UTC"},
    "Coordinated Universal Time": {diff: 0, abbr: "UTC"},
    "Dublin, Edinburgh, Lisbon, London": {diff: 0, abbr: "UTC"},
    "Monrovia, Reykjavik": {diff: 0, abbr: "UTC"},
    "Amsterdam, Berlin, Bern": {diff: 1, abbr: "CET"},
    "Rome, Stockholm, Vienna": {diff: 1, abbr: "CET"},
    "Belgrade, Bratislava, Budapest": {diff: 1, abbr: "CET"},
    "Ljubljana, Prague": {diff: 1, abbr: "CET"},
    "Brussels, Copenhagen, Madrid, Paris": {diff: 1, abbr: "CET"},
    "Sarajevo, Skopje, Warsaw, Zagreb": {diff: 1, abbr: "CET"},
    "Windhoek": {diff: 1, abbr: "WAST"},
    "Amman": {diff: 2, abbr: "EEST"},
    "Athens, Bucharest": {diff: 2, abbr: "EET"},
    "Beirut": {diff: 2, abbr: "EET"},
    "Cairo": {diff: 2, abbr: "EET"},
    "Damascus": {diff: 2, abbr: "EET"},
    "Harare, Pretoria": {diff: 2, abbr: "SAST"},
    "Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius": {diff: 2, abbr: "EET"},
    "Istanbul": {diff: 2, abbr: "EET"},
    "Jerusalem": {diff: 2, abbr: "IST"},
    "Baghdad": {diff: 3, abbr: "AST"},
    "Kuwait, Riyadh": {diff: 3, abbr: "AST"},
    "Nairobi": {diff: 3, abbr: "EAT"},
    "Abu Dhabi, Muscat": {diff: 4, abbr: "GST"},
    "Baku": {diff: 4, abbr: "AZT"},
    "Moscow, St. Petersburg, Volgograd": {diff: 4, abbr: "MSK"},
    "Tbilisi": {diff: 4, abbr: "GET"},
    "Yerevan": {diff: 4, abbr: "AMT"},
    "Islamabad, Karachi": {diff: 5, abbr: "PKT"},
    "Tashkent": {diff: 5, abbr: "UZT"},
    "Astana": {diff: 6, abbr: "ALMT"},
    "Dhaka": {diff: 6, abbr: "BST"},
    "Ekaterinburg": {diff: 6, abbr: "YEKT"},
    "Bangkok, Hanoi, Jakarta": {diff: 7, abbr: "ICT"},
    "Novosibirsk": {diff: 7, abbr: "NOVT"},
    "Beijing, Chongqing, Hong Kong, Urumqi": {diff: 8, abbr: "CST"},
    "Krasnoyarsk": {diff: 8, abbr: "KRAT"},
    "Kuala Lumpur, Singapore": {diff: 8, abbr: "SGT"},
    "Perth": {diff: 8, abbr: "WST"},
    "Taipei": {diff: 8, abbr: "CST"},
    "Ulaanbaatar": {diff: 8, abbr: "ULAT"},
    "Irkutsk": {diff: 9, abbr: "IRKT"},
    "Osaka, Sapporo, Tokyo": {diff: 9, abbr: "JST"},
    "Seoul": {diff: 9, abbr: "KST"},
    "Brisbane": {diff: 10, abbr: "EST"},
    "Canberra, Melbourne, Sydney": {diff: 10, abbr: "EST"},
    "Guam, Port Moresby": {diff: 10, abbr: ""},
    "Hobart": {diff: 10, abbr: "EDT"},
    "Yakutsk": {diff: 10, abbr: "YAKT"},
    "Solomon Is., New Caledonia": {diff: 11, abbr: "SBT"},
    "Vladivostok": {diff: 11, abbr: "VLAT"},
    "Auckland, Wellington": {diff: 12, abbr: "NZDT"},
    "Fiji": {diff: 12, abbr: "FJST"},
    "Magadan": {diff: 12, abbr: "MAGT"}
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

