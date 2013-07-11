/*
 *  Copyright 2013 Intel Corporation
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
    _parser,
    _serializer,
    _self;

function _find(query, element, type) {
    var querylist = query.split("/"),
        e = element._node,
        tag, i, ret;

    if (querylist.length === 0) {
        return undefined;
    }

    for(i = 0; i < querylist.length; i++) {
        tag = querylist[i];
        try {
            e = e.getElementsByTagName(tag)[0];
        } catch (error) {
            e = undefined;
            break;
        }
    }

    if (e) {
        if (type === "TEXT") {
            return e.textContent;
        } else if (type === "NODE") {
            ret = {
                _doc: element,
                _node: e,
                find: function (query) {
                    return _find(query, this, "NODE");
                },
                findtext: function (query) {
                    return _find(query, this, "TEXT");
                },
                findall: function (query) {
                    return _findall(query, this);
                },
                getchildren: function () {
                    return _getchildren(this);
                },
                append: function (node) {
                    this._node.appendChild(node._node);
                },
                getroot: function () {
                    return this;
                }
            };
            ret.__defineSetter__("text", function (text) {
                this._node.textContent = text;
            });
            ret.__defineGetter__("text", function () {
                return this._node.textContent;
            });
            ret.__defineGetter__("tag", function () {
                return _tag(this);
            });
            return ret;
        }
    } else {
        return undefined;
    }
}

function _findall(query, element) {
    var querylist = query.split("/"),
        e = element._node,
        tag,
        array,
        tmp,
        ret = [],
        i;

    for(i = 0; i < querylist.length - 1; i++) {
        tag = querylist[i];
        try {
            e = e.getElementsByTagName(tag)[0];
        } catch (error) {
            return ret;
        }
    }

    tag = querylist[querylist.length - 1];
    array = e.getElementsByTagName(tag);
    ///return ret;
    for(i = 0; i < array.length; i++) {
        tmp = {
            _doc: element,
            _node: array[i],
            find: function (query) {
                return _find(query, this, "NODE");
            },
            findtext: function (query) {
                return _find(query, this, "TEXT");
            },
            findall: function (query) {
                return _findall(query, this);
            },
            getchildren: function () {
                return _getchildren(this);
            },
            append: function (node) {
                this._node.appendChild(node._node);
            },
            getroot: function () {
                return this;
            }
        };
        tmp.__defineSetter__("text", function (text) {
            this._node.textContent = text;
        });
        tmp.__defineGetter__("text", function () {
            return this._node.textContent;
        });
        tmp.__defineGetter__("tag", function () {
            return _tag(this);
        });
        ret.push(tmp);
    }
    return ret;
}

function _tag(element) {
    var array;
    array = element._node.tagName.split(":");
    return array[array.length - 1];
}

function _getchildren(element) {
    var ret = [], e, i;
    for (i = 0; i < element._node.childNodes.length; i++) {
        e = {
            _doc: element,
            _node: element._node.childNodes[i],
            find: function (query) {
                return _find(query, this, "NODE");
            },
            findtext: function (query) {
                return _find(query, this, "TEXT");
            },
            findall: function (query) {
                return _findall(query, this);
            },
            getchildren: function () {
                return _getchildren(this);
            },
            append: function (node) {
                this._node.appendChild(node._node);
            },
            getroot: function () {
                return this;
            }
        };
        e.__defineSetter__("text", function (text) {
            this._node.textContent = text;
        });
        e.__defineGetter__("text", function () {
            return this._node.textContent;
        });
        e.__defineGetter__("tag", function () {
            return _tag(this);
        });
        ret.push(e);
    }

    return ret;
}


_self = (function () {
    ET = {};

    ET.Element = function(name, attributes) {
        var element = {},
            doc,
            node;

        doc = _parser.parseFromString("<" + name + "></" + name + ">", "text/xml");
        node = doc.childNodes[0];
        if (attributes) {
            utils.forEach(attributes, function (value, key) {
                node.setAttribute(key, value);
            });
        }

        element = {
            _doc: doc,
            _node: node,
            find: function (query) {
                return _find(query, this, "NODE");
            },
            findtext: function (query) {
                return _find(query, this, "TEXT");
            },
            findall: function (query) {
                return _findall(query, this);
            },
            getchildren: function () {
                return _getchildren(this);
            },
            append: function (node) {
                this._node.appendChild(node._node);
            },
            getroot: function () {
                return this;
            }
        };

        element.__defineSetter__("text", function (text) {
            this._node.textContent = text;
        });

        element.__defineGetter__("text", function () {
            return this._node.textContent;
        });

        element.__defineGetter__("tag", function () {
            return _tag(this);
        });

        return element;
    };

    ET.SubElement = function(element, name, attributes) {
        var subElement = {},
            node;
        node = element._doc.createElement(name);
        if (attributes) {
            utils.forEach(attributes, function (value, key) {
                node.setAttribute(key, value);
            });
        }
        element._node.appendChild(node);
        subElement = {
            _doc: element._doc,
            _node: node,
            find: function (query) {
                return _find(query, this, "NODE");
            },
            findtext: function (query) {
                return _find(query, this, "TEXT");
            },
            findall: function (query) {
                return _findall(query, this);
            },
            getchildren: function () {
                return _getchildren(this);
            },
            append: function (node) {
                this._node.appendChild(node._node);
            },
            getroot: function () {
                return this;
            }
        };
        subElement.__defineSetter__("text", function (text) {
            this._node.textContent = text;
        });
        subElement.__defineGetter__("text", function () {
            return this._node.textContent;
        });
        subElement.__defineGetter__("tag", function () {
            return _tag(this);
        });

        return subElement;
    };

    ET.tostring = function(element) {
        return _serializer.serializeToString(element._node);
    };
    ET.parse = function(doc) {
        var element = {};

        element = {
            _doc: doc,
            _node: doc.childNodes[0],
            find: function (query) {
                return _find(query, this, "NODE");
            },
            findtext: function (query) {
                return _find(query, this, "TEXT");
            },
            findall: function (query) {
                return _findall(query, this);
            },
            getchildren: function () {
                return _getchildren(this);
            },
            append: function (node) {
                this._node.appendChild(node._node);
            },
            getroot: function () {
                return this;
            }
        };
        element.__defineSetter__("text", function (text) {
            this._node.textContent = text;
        });
        element.__defineGetter__("text", function () {
            return this._node.textContent;
        });
        element.__defineGetter__("tag", function () {
            return _tag(this);
        });

        return element;
    };

    ET.CdataElement = function(str) {
        var doc, cdata;
        doc = _parser.parseFromString("<data></data>", "text/xml");
        cdata = doc.createCDATASection(str);
        return cdata;
    };

    return ET;
})();

_parser = new DOMParser();
_serializer = new XMLSerializer();

module.exports = _self;
