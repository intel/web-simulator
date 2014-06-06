/*
 *  Copyright 2014 Intel Corporation.
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
    t = require('ripple/platform/ivi/3.0/typecast'),
    errorcode = require('ripple/platform/ivi/3.0/errorcode'),
    WebAPIException = require('ripple/platform/ivi/3.0/WebAPIException'),
    _security = {
        "http://tizen.org/privilege/vehicle": []
    },
    _data = {
        DEFAULT: {lang: "eng"},
        listener: null,
        locale: null,
        language: [],
        dbStorage: "ivi-locale"
    },
    _self;

function _save(data) {
    db.saveObject(_data.dbStorage, data);
}

function _get() {
    var database = db.retrieveObject(_data.dbStorage);

    if (!database) {
        db.saveObject(_data.dbStorage, _data.DEFAULT);
        database = db.retrieveObject(_data.dbStorage);
    }

    return database;
}

function _initialize() {
    _data.locale = _get();

    // ISO 639-2 Language Codes
    _data.language = ["abk", "ace", "ach", "ada", "ady", "ady", "aar", "afh",
        "afr", "afa", "ain", "aka", "akk", "alb", "sqi", "gsw", "ale", "alg",
        "gsw", "tut", "amh", "anp", "apa", "ara", "arg", "arp", "arw", "arm",
        "hye", "rup", "art", "rup", "asm", "ast", "ast", "ath", "aus", "map",
        "ava", "ave", "awa", "aym", "aze", "ast", "ban", "bat", "bal", "bam",
        "bai", "bad", "bnt", "bas", "bak", "baq", "eus", "btk", "bej", "bej",
        "bel", "bem", "ben", "ber", "bho", "bih", "bik", "byn", "bin", "bis",
        "byn", "zbl", "zbl", "zbl", "nob", "bos", "bra", "bre", "bug", "bul",
        "bua", "bur", "mya", "cad", "spa", "cat", "cau", "ceb", "cel", "cai",
        "khm", "chg", "cmc", "cha", "che", "chr", "nya", "chy", "chb", "nya",
        "chi", "zho", "chn", "chp", "cho", "zha", "chu", "chu", "chk", "chv",
        "nwc", "nwc", "syc", "rar", "cop", "cor", "cos", "cre", "mus", "crp",
        "cpe", "cpf", "cpp", "crh", "crh", "hrv", "cus", "cze", "ces", "dak",
        "dan", "dar", "del", "chp", "div", "zza", "zza", "din", "div", "doi",
        "dgr", "dra", "dua", "dut", "nld", "dum", "dyu", "dzo", "frs", "bin",
        "efi", "egy", "eka", "elx", "eng", "enm", "ang", "myv", "epo", "est",
        "ewe", "ewo", "fan", "fat", "fao", "fij", "fil", "fin", "fiu", "dut",
        "nld", "fon", "fre", "fra", "frm", "fro", "fur", "ful", "gaa", "gla",
        "car", "glg", "lug", "gay", "gba", "gez", "geo", "kat", "ger", "deu",
        "nds", "gmh", "goh", "gem", "kik", "gil", "gon", "gor", "got", "grb",
        "grc", "gre", "ell", "kal", "grn", "guj", "gwi", "hai", "hat", "hat",
        "hau", "haw", "heb", "her", "hil", "him", "hin", "hmo", "hit", "hmn",
        "hun", "hup", "iba", "ice", "isl", "ido", "ibo", "ijo", "ilo", "arc",
        "smn", "inc", "ine", "ind", "inh", "ina", "ile", "iku", "ipk", "ira",
        "gle", "mga", "sga", "iro", "ita", "jpn", "jav", "kac", "jrb", "jpr",
        "kbd", "kab", "kac", "kal", "xal", "kam", "kan", "kau", "pam", "kaa",
        "krc", "krl", "kar", "kas", "csb", "kaw", "kaz", "kha", "khi", "kho",
        "kik", "kmb", "kin", "zza", "kir", "zza", "tlh", "kom", "kon", "kok",
        "kor", "kos", "kpe", "kro", "kua", "kum", "kur", "kru", "kut", "kua",
        "kir", "lad", "lah", "lam", "day", "lao", "lat", "lav", "ast", "ltz",
        "lez", "lim", "lim", "lim", "lin", "lit", "jbo", "nds", "nds", "dsb",
        "loz", "lub", "lua", "lui", "smj", "lun", "luo", "lus", "ltz", "rup",
        "mac", "mkd", "mad", "mag", "mai", "mak", "mlg", "may", "msa", "mal",
        "div", "mlt", "mnc", "mdr", "man", "mni", "mno", "glv", "mao", "mri",
        "arn", "arn", "mar", "chm", "mah", "mwr", "mas", "myn", "men", "mic",
        "mic", "min", "mwl", "moh", "mdf", "rum", "ron", "rum", "ron", "mkh",
        "hmn", "lol", "mon", "mos", "mul", "mun", "nqo", "nah", "nau", "nav",
        "nav", "nde", "nbl", "ndo", "nap", "new", "nep", "new", "nia", "nic",
        "ssa", "niu", "zxx", "nog", "non", "nai", "nde", "frr", "sme", "nso",
        "nor", "nob", "nno", "zxx", "nub", "iii", "nym", "nya", "nyn", "nno",
        "nyo", "nzi", "ile", "oci", "pro", "arc", "xal", "oji", "chu", "chu",
        "nwc", "chu", "ori", "orm", "osa", "oss", "oss", "oto", "pal", "pau",
        "pli", "pam", "pag", "pan", "pap", "paa", "pus", "nso", "per", "fas",
        "peo", "phi", "phn", "fil", "pon", "pol", "por", "pra", "pro", "pan",
        "pus", "que", "raj", "rap", "rar", "qaa-qtz", "roa", "rum", "ron",
        "roh", "rom", "run", "rus", "kho", "sal", "sam", "smi", "smo", "sad",
        "sag", "san", "sat", "srd", "sas", "nds", "sco", "gla", "sel", "sem",
        "nso", "srp", "srr", "shn", "sna", "iii", "scn", "sid", "sgn", "bla",
        "snd", "sin", "sin", "sit", "sio", "sms", "den", "sla", "slo", "slk",
        "slv", "sog", "som", "son", "snk", "wen", "nso", "sot", "sai", "nbl",
        "alt", "sma", "spa", "srn", "zgh", "suk", "sux", "sun", "sus", "swa",
        "ssw", "swe", "gsw", "syr", "tgl", "tah", "tai", "tgk", "tmh", "tam",
        "tat", "tel", "ter", "tet", "tha", "tib", "bod", "tig", "tir", "tem",
        "tiv", "tlh", "tli", "tpi", "tkl", "tog", "ton", "tsi", "tso", "tsn",
        "tum", "tup", "tur", "ota", "tuk", "tvl", "tyv", "twi", "udm", "uga",
        "uig", "ukr", "umb", "mis", "und", "hsb", "urd", "uig", "uzb", "vai",
        "cat", "ven", "vie", "vol", "vot", "wak", "wln", "war", "was", "wel",
        "cym", "fry", "him", "wal", "wal", "wol", "xho", "sah", "yao", "yap",
        "yid", "yor", "ypk", "znd", "zap", "zza", "zza", "zen", "zha", "zul",
        "zun"];
}

_self = function () {
    var locale;

    function getLocale() {
        return _data.locale.lang;
    }

    function setLocale(newLocale) {
        t.Locale("setLocale", arguments);

        if (_data.language.indexOf(newLocale) === -1) {
            throw new WebAPIException(errorcode.UNKNOWN);
        }

        if (_data.locale.lang === newLocale)
            return;

        _data.locale.lang = newLocale;
        _save(_data.locale);

        window.setTimeout(function () {
            if (_data.listener) {
                _data.listener(newLocale);
            }
        }, 1);
    }

    function localeChanged(callback) {
        t.Locale("localeChanged", arguments);

        _data.listener = callback;
    }

    function handleSubFeatures(subFeatures) {
        var i, subFeature;

        for (subFeature in subFeatures) {
            for (i in _security[subFeature]) {
                _security[_security[subFeature][i]] = true;
            }
        }
    }

    locale = {
        getLocale:         getLocale,
        setLocale:         setLocale,
        localeChanged:     localeChanged,
        handleSubFeatures: handleSubFeatures
    };

    return locale;
};

_initialize();

module.exports = _self;
