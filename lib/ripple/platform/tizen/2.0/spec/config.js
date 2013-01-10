/*
 *  Copyright 2011 Research In Motion Limited.
 *  Copyright 2011 Intel Corporation.
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
            helpText: "\"widget\" element describes widget information in configuration documents and serves as a container for other elements. It must be used in the configuration document and may have the following child elments: name,description,icon,author,license,content,feature and preference.The \"widget\" element MAY have following attributes: id,version,height,width, defaultlocale, xml:lang and dir",
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
                                         "http://www.w3.org/TR/battery-status/",
                                         "http://www.w3.org/TR/vibration/",
                                         "http://www.w3.org/TR/touch-events/",
                                         "http://tizen.org/privilege/tizen",
                                         "http://tizen.org/privilege/application.launch",
                                         "http://tizen.org/privilege/application.kill", "http://tizen.org/privilege/application.read",
                                         "http://tizen.org/privilege/time", "http://tizen.org/api/alarm",
                                         "http://tizen.org/api/alarm.read", "http://tizen.org/api/alarm.write",
                                         "http://tizen.org/privilege/contact.read", "http://tizen.org/privilege/contact.write",
                                         "http://tizen.org/privilege/filesystem.write", "http://tizen.org/privilege/filesystem.read",
                                         "http://tizen.org/privilege/calendar.read", "http://tizen.org/privilege/calendar.write",
                                         "http://tizen.org/privilege/callhistory",
                                         "http://tizen.org/privilege/callhistory.read", "http://tizen.org/privilege/callhistory.write",
                                         "http://tizen.org/privilege/messaging.send",
                                         "http://tizen.org/privilege/messaging.read", "http://tizen.org/privilege/messaging.write",
                                         "http://tizen.org/privilege/bluetooth.admin",
                                         "http://tizen.org/privilege/bluetooth.gap", "http://tizen.org/privilege/bluetooth.spp",
                                         "http://tizen.org/api/nfc", "http://tizen.org/api/nfc.tag",
                                         "http://tizen.org/api/nfc.p2p",
                                         "http://tizen.org/privilege/content.read", "http://tizen.org/privilege/content.write",
                                         "http://tizen.org/privilege/systeminfo",
                                         "http://tizen.org/privilege/power", "http://tizen.org/privilege/download",
                                         "http://tizen.org/privilege/notification"]
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
