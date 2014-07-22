/*
 *  Copyright 2014 Research In Motion Limited.
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
var utils = require('ripple/utils'),
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
            platform, rst, i, j,
            settingRst = {
                'screen-orientation': 'portrait',
                'context-menu': 'enable',
                'background-support': 'disable',
                encryption: 'disable',
                'install-location': 'auto',
                'hwkey-event': 'enable'
            };

        widgetInfo.id = configValidationObject.widget.validationResult[0].attributes.id.value || "";
        widgetInfo.name = configValidationObject.widget.children.name.validationResult[0].value;
        widgetInfo.icon = configValidationObject.widget.children.icon.validationResult[0].attributes.src.value;
        widgetInfo.version = configValidationObject.widget.validationResult[0].attributes.version.value;
        if (configValidationObject.widget.children.application.validationResult[0].valid) {
            widgetInfo.tizenAppId = configValidationObject.widget.children.application.validationResult[0].attributes.id.value;
            widgetInfo.tizenPackageId = configValidationObject.widget.children.application.validationResult[0].attributes.package.value;
        }

        widgetInfo.features = {};

        if (configValidationObject.widget.children.setting.hasOwnProperty('validationResult') === true) {
            rst = configValidationObject.widget.children.setting.validationResult;
            // the first one has higher priority per platform implementation
            for (i = rst.length -1 ; i >= 0; i--) {
                if (rst[i].valid === true) {
                    for (j in rst[i].attributes) {
                        if (rst[i].attributes[j].value !== undefined) {
                            settingRst[j] = rst[i].attributes[j].value;
                        }
                    }
                }
            }
            db.save("layout", settingRst["screen-orientation"]);
        }

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
                }
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
                            type: "iso-language"
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
                            type: "iso-language"
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
                            type: "iso-language"
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
                setting: {
                    nodeName: "tizen:setting",
                    required: false,
                    occurrence: 0,
                    attributes: {
                        'screen-orientation': {
                            attributeName: "screen-orientation",
                            required: false,
                            type: "list",
                            listValues: ['portrait', 'landscape', 'auto']
                        },
                        'context-menu': {
                            attributeName: "context-menu",
                            required: false,
                            type: "list",
                            listValues: ['enable', 'disable']
                        },
                        'background-support': {
                            attributeName: "background-support",
                            required: false,
                            type: "list",
                            listValues: ['enable', 'disable']
                        },
                        'encryption': {
                            attributeName: "encryption",
                            required: false,
                            type: "list",
                            listValues: ['enable', 'disable']
                        },
                        'install-location': {
                            attributeName: "install-location",
                            required: false,
                            type: "list",
                            listValues: ['auto', 'internal-only', 'perfer-external']
                        },
                        'hwkey-event': {
                            attributeName: "hwkey-event",
                            required: false,
                            type: "list",
                            listValues: ['enable', 'disable']
                        }
                    }
                },
                application: {
                    nodeName: "tizen:application",
                    required: true,
                    occurrence: 1,
                    attributes: {
                        id: {
                            attributeName: "id",
                            required: true,
                            type: "string"
                        },
                        required_version: {
                            attributeName: "required_version",
                            required: true,
                            type: "list",
                            listValues: ['1.0', '2.0', '2.1', '2.2']
                        },
                        package: {
                            attributeName: "package",
                            required: false,
                            type: "string"
                        }
                    }
                },
                "tizen:content": {
                    nodeName: "tizen:content",
                    required: false,
                    occurrence: 1,
                    attributes: {
                        src: {
                            attributeName: "src",
                            required: true,
                            type: "string"
                        }
                    }
                },
                control: {
                    nodeName: "tizen:app-control",
                    required: false,
                    occurrence: 0,
                    children: {
                        src: {
                            nodeName: "tizen:src",
                            required: true,
                            occurence: 0,
                            attributes: {
                                name: {
                                    attributeName: "name",
                                    required: false,
                                    type: "string"
                                }
                            }
                        },
                        operation: {
                            nodeName: "tizen:operation",
                            required: true,
                            occurence: 0,
                            attributes: {
                                name: {
                                    attributeName: "name",
                                    required: false,
                                    type: "string"
                                }
                            }
                        },
                        uri: {
                            nodeName: "tizen:uri",
                            required: false,
                            occurence: 0,
                            attributes: {
                                name: {
                                    attributeName: "name",
                                    required: false,
                                    type: "string"
                                }
                            }
                        },
                        mime: {
                            nodeName: "tizen:mime",
                            required: false,
                            occurence: 0,
                            attributes: {
                                name: {
                                    attributeName: "name",
                                    required: false,
                                    type: "string"
                                }
                            }
                        }
                    }
                },
                "app-widget": {
                    nodeName: "tizen:app-widget",
                    required: false,
                    occurrence: 0,
                    attributes: {
                        id: {
                            attributeName: "id",
                            required: true,
                            type: "string"
                        },
                        primary: {
                            attributeName: "primary",
                            required: true,
                            type: "list",
                            listValues: ['true', 'false']
                        },
                        "auto-launch": {
                            attributeName: "auto-launch",
                            required: false,
                            type: "list",
                            listValues: ['true', 'false']
                        },
                        "update-period": {
                            attributeName: "update-period",
                            required: false,
                            type: "integer"
                        }
                    },
                    children: {
                        "box-label": {
                            nodeName: "tizen:box-label",
                            required: true,
                            occurence: 1
                        },
                        "box-icon": {
                            nodeName: "tizen:box-icon",
                            required: true,
                            occurence: 1,
                            attributes: {
                                src: {
                                    attributeName: "src",
                                    required: true,
                                    type: "string"
                                }
                            }
                        },
                        "box-content": {
                            nodeName: "tizen:box-content",
                            required: true,
                            occurence: 1,
                            attributes: {
                                src: {
                                    attributeName: "src",
                                    required: true,
                                    type: "string"
                                },
                                "mouse-event": {
                                    attributeName: "mouse-event",
                                    required: false,
                                    type: "string"
                                },
                                "touch-event": {
                                    attributeName: "touch-event",
                                    required: false,
                                    type: "string"
                                }
                            },
                            children: {
                                "box-size": {
                                    nodeName: "tizen:box-size",
                                    required: false,
                                    occurence: 1,
                                    attributes: {
                                        "preview": {
                                            attributeName: "preview",
                                            required: false,
                                            type: "string"
                                        }
                                    }
                                },
                                pd: {
                                    nodeName: "tizen:pd",
                                    required: false,
                                    occurence: 1,
                                    attributes: {
                                        "src": {
                                            attributeName: "src",
                                            required: true,
                                            type: "string"
                                        },
                                        "width": {
                                            attributeName: "width",
                                            required: true,
                                            type: "integer"
                                        },
                                        "height": {
                                            attributeName: "height",
                                            required: true,
                                            type: "integer"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                account: {
                    nodeName: "tizen:account",
                    required: false,
                    occurrence: 0,
                    attributes: {
                        "multiple-account-support": {
                            attributeName: "multiple-account-support",
                            required: true,
                            type: "list",
                            listValues: ['true', 'false']
                        }
                    },
                    children: {
                        icon: {
                            nodeName: "tizen:icon",
                            required: false,
                            occurence: 1,
                            attributes: {
                                section: {
                                    attributeName: "section",
                                    required: true,
                                    type: "string"
                                }
                            }
                        },
                        "display-name": {
                            nodeName: "tizen:display-name",
                            required: false,
                            occurence: 1,
                            attributes: {
                                "xml:lang": {
                                    attributeName: "xml:lang",
                                    required: false,
                                    type: "string"
                                }
                            }
                        },
                        capability: {
                            nodeName: "capability",
                            required: false,
                            occurence: 1
                        }
                    }
                },
                feature: {
                    nodeName: "tizen:privilege",
                    required: false,
                    occurrence: 0,
                    attributes: {
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
                        name: {
                            attributeName: "name",
                            required: true,
                            type: "list",
                            listValues: ["http://developer.samsung.com/privilege/accessoryprotocol",
                                         "http://www.w3.org/TR/battery-status/",
                                         "http://www.w3.org/TR/geolocation-API/",
                                         "http://www.w3.org/TR/touch-events/",
                                         "http://www.w3.org/TR/vibration/",
                                         "http://tizen.org/privilege/tizen",
                                         "http://tizen.org/privilege/alarm",
                                         "http://tizen.org/privilege/application.launch",
                                         "http://tizen.org/privilege/appmanager.kill", "http://tizen.org/privilege/appmanager.certificate",
                                         "http://tizen.org/privilege/content.read", "http://tizen.org/privilege/content.write",
                                         "http://tizen.org/privilege/filesystem.read", "http://tizen.org/privilege/filesystem.write",
                                         "http://tizen.org/privilege/packagemanager.install", "http://tizen.org/privilege/package.info",
                                         "http://tizen.org/privilege/power",
                                         "http://tizen.org/privilege/system", "http://tizen.org/privilege/systemmanager",
                                         "http://tizen.org/privilege/time"]
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
                                    type: "iso-language"
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
                                    attributeName: "value",
                                    required: true,
                                    type: "string"
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
                            type: "iso-language"
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
