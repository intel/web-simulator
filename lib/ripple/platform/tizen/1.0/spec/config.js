/*
 *  Copyright 2011 Research In Motion Limited.
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
var platform = require('ripple/platform'),
    utils = require('ripple/utils'),
    db = require('ripple/db'),
    constants = require('ripple/constants');

module.exports = {
    fileName: "config.xml",
    validateVersion: function (configValidationObject) {
        var valid = true;
        // no xmlns:JIL in wac 2.0 spec
        valid = !!configValidationObject.widget.validationResult[0].attributes.xmlns.valid;

        return valid;
    },
    extractInfo: function (configValidationObject) {
        if (!configValidationObject) {
            return null;
        }

        var widgetInfo = {},
            configFeatures,
            configPreferences,
            preferenceName,
            platform;

        widgetInfo.id = configValidationObject.widget.validationResult[0].attributes.id.value || "";
        widgetInfo.name = configValidationObject.widget.children.name.validationResult[0].value;
        widgetInfo.icon = configValidationObject.widget.children.icon.validationResult[0].attributes.src.value;
        widgetInfo.version = configValidationObject.widget.validationResult[0].attributes.version.value;

        widgetInfo.features = {};

        configFeatures = configValidationObject.widget.children.feature.validationResult;
        utils.forEach(configFeatures, function (f) {
            if (f.valid === true) {
                var feature = {id: f.attributes.name.value,
                         required: f.attributes.required.valid};
                widgetInfo.features[feature.id] = feature;
            }
        });

        widgetInfo.preferences = {};

        configPreferences = configValidationObject.widget.children.preference.validationResult;

        platform = require('ripple/platform');
        utils.forEach(configPreferences, function (preference) {
            preferenceName = preference.attributes.name.value;
            if (preferenceName) {
                widgetInfo.preferences[preferenceName] = {
                    "key": preferenceName,
                    "value": preference.attributes.value.value || "",
                    "readonly": preference.attributes.readonly.value === "true"
                };

                db.save(preferenceName,
                        widgetInfo.preferences[preferenceName].value,
                        platform.getPersistencePrefix(widgetInfo.id));
            }
        });

        return widgetInfo;
    },
    schema: {
        rootElement: "widget",
        widget: {
            nodeName: "widget",
            required: true,
            occurrence: 1,
            helpText: "\"widget\" element describes widget information in configuration documents and serves as a container for other elements. It must be used in configuration document and may have following child elments: name,description,icon,author,license,content,feature and preference. \"widget\" element MAY have following attributes: id,version,height,width, defaultlocale, xml:lang and dir",
            attributes: {
                xmlns: {
                    attributeName: "xmlns",
                    required: true,
                    type: "list",
                    listValues: ["http://www.w3.org/ns/widgets"]
                },
                "xmlns:tizen": {
                    attributeName: "xmlns:tizen",
                    required: false,
                    type: "list",
                    listValues: ["http://tizen.org/ns/widgets"]
                },
                "xml:lang": {
                    attributeName: "xml:lang",
                    required: false,
                    type: "iso-language"
                },
                dir: {
                    attributeName: "dir",
                    required: false,
                    type: "list",
                    listValues: ["ltr", "rtl", "lro", "rlo"]
                },
                id: {
                    attributeName: "id",
                    required: false,
                    type: "string"
                },
                version: {
                    attributeName: "version",
                    required: false,
                    type: "string"
                },
                height: {
                    attributeName: "height",
                    required: false,
                    type: "integer"
                },
                width: {
                    attributeName: "width",
                    required: false,
                    type: "integer"
                },
                viewmodes: {
                    attributeName: "viewmodes",
                    required: false,
                    type: "list",
                    listValues: ["windowed", "floating", "fullscreen", "maximized", "minimized"]
                },
                defaultlocale: {
                    attributeName: "defaultlocale",
                    required: false,
                    type: "iso-language"
                },
            },
            children: {
                name: {
                    nodeName: "name",
                    required: false,
                    occurrence: 0,
                    type: "string",
                    attributes: {
                        "xml:lang": {
                            attributeName: "xml:lang",
                            required: false,
                            type: "iso-language",
                            unique: true
                        },
                        dir: {
                            attributeName: "dir",
                            required: false,
                            type: "list",
                            listValues: ["ltr", "rtl", "lro", "rlo"]
                        },
                        "short": {
                            attributeName: "short",
                            required: false,
                            type: "string"
                        }
                    },
                    children: {
                        span: {
                            nodeName: "span",
                            required: false,
                            type: "string",
                            attributes: {
                                "xml:lang": {
                                    attributeName: "xml:lang",
                                    required: false,
                                    type: "iso-language",
                                    unique: true
                                },
                                dir: {
                                    attributeName: "dir",
                                    required: false,
                                    type: "list",
                                    listValues: ["ltr", "rtl", "lro", "rlo"]
                                }
                            }
                        }
                    }
                },
                description: {
                    nodeName: "description",
                    required: false,
                    occurrence: 0,
                    type: "string",
                    attributes: {
                        "xml:lang": {
                            attributeName: "xml:lang",
                            required: false,
                            type: "iso-language",
                            unique: true
                        },
                        dir: {
                            attributeName: "dir",
                            required: false,
                            type: "list",
                            listValues: ["ltr", "rtl", "lro", "rlo"]
                        }
                    },
                    children: {
                        span: {
                            nodeName: "span",
                            required: false,
                            type: "string",
                            attributes: {
                                "xml:lang": {
                                    attributeName: "xml:lang",
                                    required: false,
                                    type: "iso-language",
                                    unique: true
                                },
                                dir: {
                                    attributeName: "dir",
                                    required: false,
                                    type: "list",
                                    listValues: ["ltr", "rtl", "lro", "rlo"]
                                }
                            }
                        }
                    }
                },
                author: {
                    nodeName: "author",
                    required: false,
                    occurrence: 0,
                    type: "string",
                    attributes: {
                        "xml:lang": {
                            attributeName: "xml:lang",
                            required: false,
                            type: "iso-language",
                        },
                        dir: {
                            attributeName: "dir",
                            required: false,
                            type: "list",
                            listValues: ["ltr", "rtl", "lro", "rlo"]
                        },
                        href: {
                            attributeName: "href",
                            required: false,
                            type: "regex",
                            regex: constants.REGEX.URL
                        },
                        email: {
                            attributeName: "email",
                            required: false,
                            type: "regex",
                            regex: constants.REGEX.EMAIL
                        }
                    },
                    children: {
                        span: {
                            nodeName: "span",
                            required: false,
                            type: "string",
                            attributes: {
                                "xml:lang": {
                                    attributeName: "xml:lang",
                                    required: false,
                                    type: "iso-language",
                                    unique: true
                                },
                                dir: {
                                    attributeName: "dir",
                                    required: false,
                                    type: "list",
                                    listValues: ["ltr", "rtl", "lro", "rlo"]
                                }
                            }
                        }
                    }
                },
                license: {
                    nodeName: "license",
                    required: false,
                    occurrence: 0,
                    type: "string",
                    attributes: {
                        "xml:lang": {
                            attributeName: "xml:lang",
                            required: false,
                            type: "iso-language",
                        },
                        dir: {
                            attributeName: "dir",
                            required: false,
                            type: "list",
                            listValues: ["ltr", "rtl", "lro", "rlo"]
                        },
                        href: {
                            attributeName: "href",
                            type: "regex",
                            required: false,
                            regex: constants.REGEX.URL
                        }
                    },
                    children: {
                        span: {
                            nodeName: "span",
                            required: false,
                            type: "string",
                            attributes: {
                                "xml:lang": {
                                    attributeName: "xml:lang",
                                    required: false,
                                    type: "iso-language",
                                    unique: true
                                },
                                dir: {
                                    attributeName: "dir",
                                    required: false,
                                    type: "list",
                                    listValues: ["ltr", "rtl", "lro", "rlo"]
                                }
                            }
                        }
                    }
                },
                icon: {
                    nodeName: "icon",
                    required: false,
                    occurrence: 0,
                    attributes: {
                        "xml:lang": {
                            attributeName: "xml:lang",
                            required: false,
                            type: "iso-language",
                        },
                        dir: {
                            attributeName: "dir",
                            required: false,
                            type: "list",
                            listValues: ["ltr", "rtl", "lro", "rlo"]
                        },
                        src: {
                            attributeName: "src",
                            required: true,
                            type: "string"
                        },
                        width: {
                            attributeName: "width",
                            required: false,
                            type: "integer"
                        },
                        height: {
                            attributeName: "height",
                            required: false,
                            type: "integer"
                        }
                    }
                },
                content: {
                    nodeName: "content",
                    required: false,
                    occurrence: 1,
                    attributes: {
                        "xml:lang": {
                            attributeName: "xml:lang",
                            required: false,
                            type: "iso-language",
                            unique: true
                        },
                        dir: {
                            attributeName: "dir",
                            required: false,
                            type: "list",
                            listValues: ["ltr", "rtl", "lro", "rlo"]
                        },
                        src: {
                            attributeName: "src",
                            required: true,
                            type: "string"
                        },
                        encoding: {
                            attributeName: "encoding",
                            required: false,
                            type: "string"
                        },
                        type: {
                            attributeName: "type",
                            required: false,
                            type: "string"
                        }
                    }
                },
                feature: {
                    nodeName: "feature",
                    required: false,
                    occurrence: 0,
                    attributes: {
                        "xml:lang": {
                            attributeName: "xml:lang",
                            required: false,
                            type: "iso-language",
                        },
                        dir: {
                            attributeName: "dir",
                            required: false,
                            type: "list",
                            listValues: ["ltr", "rtl", "lro", "rlo"]
                        },
                        name: {
                            attributeName: "name",
                            required: true,
                            type: "list",
                            listValues: ["http://www.w3.org/TR/geolocation-API/",
                                         "http://wacapps.net/api/deviceapis", "http://wacapps.net/api/accelerometer",
                                         "http://wacapps.net/api/orientation", "http://wacapps.net/api/camera",
                                         "http://wacapps.net/api/camera.show", "http://wacapps.net/api/camera.capture",
                                         "http://wacapps.net/api/devicestatus", "http://wacapps.net/api/devicestatus.deviceinfo",
                                         "http://wacapps.net/api/devicestatus.networkinfo", "http://wacapps.net/api/filesystem",
                                         "http://wacapps.net/api/filesystem.read", "http://wacapps.net/api/filesystem.write",
                                         "http://wacapps.net/api/messaging", "http://wacapps.net/api/messaging.send",
                                         "http://wacapps.net/api/messaging.find", "http://wacapps.net/api/messaging.subscribe",
                                         "http://wacapps.net/api/messaging.write", "http://wacapps.net/api/pim.contact",
                                         "http://wacapps.net/api/pim.contact.read", "http://wacapps.net/api/pim.contact.write",
                                         "http://wacapps.net/api/pim.calendar", "http://wacapps.net/api/pim.calendar.read",
                                         "http://wacapps.net/api/pim.calendar.write", "http://wacapps.net/api/pim.task",
                                         "http://wacapps.net/api/pim.task.read", "http://wacapps.net/api/pim.task.write",
                                         "http://wacapps.net/api/deviceinteraction",
                                         "http://tizen.org/api/tizen", "http://tizen.org/api/application",
                                         "http://tizen.org/api/time", "http://tizen.org/api/time.read",
                                         "http://tizen.org/api/time.write", "http://tizen.org/api/contact",
                                         "http://tizen.org/api/contact.read", "http://tizen.org/api/contact.write",
                                         "http://tizen.org/api/calendar", "http://tizen.org/api/calendar.read",
                                         "http://tizen.org/api/calendar.write", "http://tizen.org/api/call",
                                         "http://tizen.org/api/call.history", "http://tizen.org/api/call.history.read",
                                         "http://tizen.org/api/call.history.write", "http://tizen.org/api/messaging",
                                         "http://tizen.org/api/messaging.send", "http://tizen.org/api/messaging.read",
"http://tizen.org/api/messaging.write", "http://tizen.org/api/bluetooth",
                                        "http://tizen.org/api/bluetooth.gap", "http://tizen.org/api/bluetooth.spp",
                                        "http://tizen.org/api/lbs.geocoder", "http://tizen.org/api/lbs.poi",
                                        "http://tizen.org/api/lbs.map", "http://tizen.org/api/lbs.route",
                                        "http://tizen.org/api/nfc",
                                        "http://tizen.org/api/nfc.tag", "http://tizen.org/api/nfc.p2p",
                                        "http://tizen.org/api/nfc.se", "http://tizen.org/api/sensors",
                                        "http://tizen.org/api/systeminfo",
                                        "http://tizen.org/api/alarm", "http://tizen.org/api/alarm.read", "http://tizen.org/api/alarm.write",
                                        "http://www.w3.org/TR/battery-status/"]
                        },
                        required: {
                            attributeName: "required",
                            type: "boolean",
                            required: false
                        }
                    },
                    children: {
                        param: {
                            nodeName: "param",
                            required: false,
                            occurrence: 0,
                            attributes: {
                                "xml:lang": {
                                    attributeName: "xml:lang",
                                    required: false,
                                    type: "iso-language",
                                },
                                dir: {
                                    attributeName: "dir",
                                    required: false,
                                    type: "list",
                                    listValues: ["ltr", "rtl", "lro", "rlo"]
                                },
                                name: {
                                    attributeName: "name",
                                    required: true,
                                    type: "string",
                                },
                                value: {
                                    attributeName: "value",
                                    required: true,
                                    type: "string",
                                }
                            }
                        }
                    }
                },
                preference: {
                    nodeName: "preference",
                    required: false,
                    occurrence: 0,
                    attributes: {
                        "xml:lang": {
                            attributeName: "xml:lang",
                            required: false,
                            type: "iso-language",
                        },
                        dir: {
                            attributeName: "dir",
                            required: false,
                            type: "list",
                            listValues: ["ltr", "rtl", "lro", "rlo"]
                        },
                        name: {
                            attributeName: "name",
                            required: true,
                            type: "string"
                        },
                        value: {
                            type: "string",
                            required: false,
                            attributeName: "value"
                        },
                        readonly: {
                            attributeName: "readonly",
                            type: "boolean",
                            required: false
                        }
                    }
                }
            }
        }
    }
};
