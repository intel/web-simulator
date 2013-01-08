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

var event = require('ripple/event'),
    errorcode = require('ripple/platform/tizen/2.0/errorcode'),
    WebAPIError = require('ripple/platform/tizen/2.0/WebAPIError'),
    utils = require('ripple/utils'),
    dbfs  = require('ripple/platform/tizen/2.0/dbfs'),
    tizen1_utils = require('ripple/platform/tizen/2.0/tizen1_utils'),
    _maxPathLength = 256,
    _virtualRoots = ["documents", "images", "music", "videos", "downloads", "wgt-package", "wgt-private", "wgt-private-tmp", "removable", "attachments"],
    _security = {
        "http://tizen.org/privilege/filesystem": [],
        "http://tizen.org/privilege/filesystem.read": ["copyTo", "moveTo", "createDirectory", "createFile", "deleteDirectory", "deleteFile", "openStreamR"],
        "http://tizen.org/privilege/filesystem.write": ["readAsText", "openStreamW"],
        all: true
    },
    _realRoots = dbfs.roots,
    _r2vmap = {},
    _v2rmap = {},
    _initialized = false,
    _readOnly  = false,
    _writeOnly = false,
    _defaultMode = "rw",
    _storages = [], // filesystem storages
    _observers = [],
    File,
    FileStream,
    FileFilter,
    FileSystemStorage;

function _isValidChar(c) {
    return  (c >= '0' && c <= '9') ||
        (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c === ' ') ||
        (c === '_') ||
        (c === '-') ||
        (c === '.');
}

function _isValidFileName(name) {
    var _valid = true,
        _c;

    if (name === '' || name === '.' || name === '..' || (name.length > _maxPathLength)) {
        _valid = false;
    } else {
        for (_c = 0; _c < name.length; _c++) {
            if (!_isValidChar(name[_c])) {
                _valid = false;
                break;
            }
        }
    }

    return _valid;
}

function _initialize() {
    var _i;

    _storages.push(FileSystemStorage("InternalFlash", "INTERNAL", "MOUNTED" ));
    _storages.push(FileSystemStorage("MMC", "EXTERNAL", "REMOVED"));
    dbfs.initialize();

    // set up the map between real path and virtual path
    for (_i = 0; _i < _virtualRoots.length; _i++) {
        _r2vmap[_realRoots[_i]] = _virtualRoots[_i];
    }

    utils.forEach(_r2vmap, function (value, key) {
        _v2rmap[value] = key;
    });
}

function _resolveSync(srcLocation, onSuccess, onError, accessMode) {
    var _parts = srcLocation.replace(/\/$/, '').split("/"),
        _header, _fullPath,
        _i;

    // TODO: Initialize at bootstrap and emulatorBridge.link
    if (!_initialized) {
        _initialize();
        _initialized = true;
    }

    for (_i = 0; _i < _parts.length; _i++) {
        if (!_isValidFileName(_parts[_i])) {
            if (onError) {
                onError(new WebAPIError(errorcode.INVALID_VALUES_ERR));
            }
            return;
        }
    }

    _header = _v2rmap[_parts[0]];
    if (_header === undefined) {
        if (onError) {
            onError(new WebAPIError(errorcode.NOT_FOUND_ERR));
        }
        return;
    }

    if (_parts.length === 1) {
        _fullPath = _header;
    } else {
        _fullPath = _header + "/" + _parts.splice(1, _parts.length - 1).join("/");
    }

    dbfs.stat(_fullPath,
            function (entry) {
                onSuccess(new File(entry, accessMode));
            },
            function () {
                if (onError) {
                    onError(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }
            });
}

function _resolveAsync(onSuccess, onError, srcLocation, accessMode) {
    _resolveSync(srcLocation,
                function (file) {
                    setTimeout(function () {
                        onSuccess(file);
                    }, 1);
                },
                function (e) {
                    setTimeout(function () {
                        onError(e);
                    }, 1);
                },
                accessMode);
}

File = function (entry, mode) {
    var _entry = entry,
        _mode = mode,
        _parent,
        _self;

    function _r2v(rpath) {
        var i, v, r, regExp;

        for (i = 0; i < _virtualRoots.length; i++) {
            v = _virtualRoots[i];
            r = _v2rmap[v];
            if (rpath.match("^" + r)) {
                regExp = new RegExp("^" + r);
                return rpath.replace(regExp, v);
            }
        }

        return "";
    }

    function _v2r(vpath) {
        var i, v, r, regExp;

        for (i = 0; i < _virtualRoots.length; i++) {
            v = _virtualRoots[i];
            r = _v2rmap[v];
            if (vpath.match("^" + v)) {
                regExp = new RegExp("^" + v);
                return vpath.replace(regExp, r);
            }
        }

        return "";
    }

    function _copyMoveInternal(onSuccess, onError, src, dst, overwrite, func) {
        var _srcName = String(src),
            _dstName = String(dst),
            _src = null,
            _dst = null,
            _error = false,
            _dstParent = null,
            _dstParts  = _dstName.split("/"),
            _dstParentName = _dstParts.splice(0, _dstParts.length - 1).join("/");

        if (!_entry.isDirectory) {
            if (onError) {
                setTimeout(function () {
                    onError(new WebAPIError(errorcode.IO_ERR));
                }, 1);
            }
            return undefined;
        }

        _resolveSync(_srcName,
                function (file) {
                    _src = file;
                },
                function (e) {
                    setTimeout(function () {
                        onError(e);
                    }, 1);
                },
                _mode);

        if (_src) {
            if (_src.parent.fullPath === _self.fullPath) {
                if (!_readOnly && _mode !== "r") {
                    _resolveSync(_dstParentName,
                            function (file) {
                                _dstParent = file;
                            },
                            function (e) {
                                setTimeout(function () {
                                    onError(e);
                                }, 1);
                            },
                            _mode);

                    if (_dstParent === null) {
                        return undefined;
                    }

                    _resolveSync(_dstName,
                            function (file) {
                                _dst = file;
                            },
                            function (e) {
                                if (e.code !== errorcode.NOT_FOUND_ERR) {
                                    setTimeout(function () {
                                        onError(e);
                                    }, 1);
                                    _error = true;
                                }
                            },
                            _mode);

                    if (_error) {
                        return undefined;
                    }

                    if (_src.isFile) {
                        if (_dst === null) {
                            func(_v2r(_srcName), _v2r(_dstName),
                                    function () {
                                        setTimeout(function () {
                                            onSuccess();
                                        }, 1);
                                    },
                                    function () {});
                            return null;
                        } else {
                            if (_dst.isFile && Boolean(overwrite) && (_srcName !== _dstName)) {
                                func(_v2r(_srcName), _v2r(_dstName),
                                        function () {
                                            setTimeout(function () {
                                                onSuccess();
                                            }, 1);
                                        },
                                        function () {});
                                return null;
                            } else {
                                setTimeout(function () {
                                    onError(new WebAPIError(errorcode.IO_ERR));
                                }, 1);
                            }
                        }
                    } else {
                        if (_dst === null) {
                            func(_v2r(_srcName), _v2r(_dstName),
                                function () {
                                    setTimeout(function () {
                                        onSuccess();
                                    }, 1);
                                },
                                function () {});
                            return null;
                        } else {
                            setTimeout(function () {
                                onError(new WebAPIError(errorcode.IO_ERR));
                            }, 1);
                        }
                    }
                } else {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                }
            } else {
                if (onError) {
                    setTimeout(function () {
                        onError(new WebAPIError(errorcode.IO_ERR));
                    }, 1);
                }
            }
        }

        return undefined;
    }

    _self = {
        toURI: function () {
            return "file://" + _entry.fullPath;
        },
        listFiles: function (onSuccess, onError, filter) {
            var _filter = Object(filter),
                _filterName = _filter.name,
                _startModified = _filter.startModified,
                _endModified   = _filter.endModified;

            function _matchName(fileName) {
                var _matched = true,
                    _name1 = String(_filterName).toLowerCase(),
                    _name2 = fileName.toLowerCase(),
                    _pattern;

                if (_filterName !== undefined && _filterName !== null) {
                    if (!_name1.match("\\\\%")) {
                        if (_name1.match("%")) {
                            _pattern = new RegExp("^" + _name1.replace(/%/g, ".*") + "$");
                            _matched = _name2.match(_pattern) ? true : false;
                        } else {
                            _matched = (_name1 === _name2);
                        }
                    } else {
                        // % is not allowed as a part of file name
                        _matched = false;
                    }
                }

                return _matched;
            }

            function _matchDate(date) {
                var _matched = true;

                if (_startModified !== undefined && _startModified !== null) {
                    _matched = (date.getTime() >= _startModified.getTime());
                }

                if (_matched && (_endModified !== undefined && _endModified !== null)) {
                    _matched = (date.getTime() <= _endModified.getTime());
                }

                return _matched;
            }

            function _matchFilter(entry) {
                return _matchName(entry.name) && _matchDate(entry.lastModifiedDate);
            }

            function _listFiles() {
                var _files = [];

                if ((_startModified !== undefined && !tizen1_utils.isValidDate(_startModified)) ||
                    (_endModified !== undefined && !tizen1_utils.isValidDate(_endModified))) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                if (!_entry.isDirectory) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.IO_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                utils.forEach(_entry.children, function (child) {
                    if (_matchFilter(child)) {
                        _files.push(new File(child, _mode));
                    }
                });

                setTimeout(function () {
                    onSuccess(_files);
                }, 1);

                return null;
            }

            return tizen1_utils.validateTypeMismatch(onSuccess, onError, "listFiles", _listFiles);
        },
        openStream: function (mode, onSuccess, onError, encoding) {
            function _openStream() {
                var  _openMode = String(mode),
                    _encoding = encoding ? String(encoding) : "UTF-8";

                if (_openMode !== "r" && _openMode !== "w" && _openMode !== "a") {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                if (!_security.all && ((!_security.openStreamR && _openMode === "r") || (!_security.openStreamW && _openMode === "w"))) {
                    throw new WebAPIError(errorcode.SECURITY_ERR);
                }

                if (_encoding !== "UTF-8" && _encoding !== "ISO-8859-1") {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                if (((_readOnly || _mode === "r") && (_openMode === "w" || _openMode === "a")) ||
                    (_writeOnly && _openMode === "r")) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                setTimeout(function () {
                    onSuccess(new FileStream(_entry, _openMode, _encoding));
                }, 1);

                return null;
            }

            return tizen1_utils.validateTypeMismatch(onSuccess, onError, "openStream", _openStream);
        },
        readAsText: function (onSuccess, onError, encoding) {
            if (!_security.all && !_security.readAsText) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            function _readAsText() {
                var _encoding = encoding ? String(encoding) : "UTF-8";
                if (_encoding !== "UTF-8" && _encoding !== "ISO-8859-1") {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                if (_writeOnly) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                if (_self.isFile) {
                    dbfs.read(_entry.fullPath,
                            function (data) {
                                setTimeout(function () {
                                    onSuccess(data);
                                }, 1);
                            },
                            function () {});
                    return null;
                } else {
                    if (onError) {
                        setTimeout(function () {
                            onError(new WebAPIError(errorcode.IO_ERR));
                        }, 1);
                    }
                }

                return undefined;
            }

            return tizen1_utils.validateTypeMismatch(onSuccess, onError, "readAsText", _readAsText);
        },
        copyTo: function (src, dst, overwrite, onSuccess, onError) {
            if (!_security.all && !_security.copyTo) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            function _copyTo() {
                return _copyMoveInternal(onSuccess, onError, src, dst, overwrite, dbfs.cp);
            }

            return tizen1_utils.validateTypeMismatch(onSuccess, onError, "copyTo", _copyTo);
        },
        moveTo: function (src, dst, overwrite, onSuccess, onError) {
            if (!_security.all && !_security.moveTo) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            function _moveTo() {
                return _copyMoveInternal(onSuccess, onError, src, dst, overwrite, dbfs.mv);
            }

            return tizen1_utils.validateTypeMismatch(onSuccess, onError, "moveTo", _moveTo);
        },
        createDirectory: function (dirPath) {
            var _path  = String(dirPath),
                _parts = _path.replace(/\/$/, "").split("/"),
                _dir   = null,
                _exist = null,
                _current = _entry.fullPath,
                _i;

            if (!_security.all && !_security.createDirectory) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            function onSuccess(entry) {
                _dir = entry;
            }

            for (_i = 0; _i < _parts.length; _i++) {
                if (!_isValidFileName(_parts[_i])) {
                    throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
                }
            }

            if (!entry.isDirectory) {
                throw new WebAPIError(errorcode.IO_ERR);
            }

            _exist = _parts.reduce(function (obj, token) {
                return token === "" ? obj : (obj.children ? obj.children[token] || null : null);
            }, _entry);

            if (_exist) {
                throw new WebAPIError(errorcode.IO_ERR);
            }

            if (_readOnly || _mode === "r") {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            for (_i = 0; _i < _parts.length; _i++) {
                _current = _current + "/" + _parts[_i];
                dbfs.mkdir(_current, onSuccess);
            }

            return new File(_dir, _mode);
        },
        createFile: function (filePath) {
            var _name = String(filePath),
                _file = null;

            if (!_security.all && !_security.createFile) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            if (!_isValidFileName(_name)) {
                throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
            }

            if (!entry.isDirectory || (_entry.children && _entry.children[_name])) {
                throw new WebAPIError(errorcode.IO_ERR);
            }

            if (_readOnly || _mode === "r") {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            dbfs.touch(_entry.fullPath + "/" + _name,
                        function (entry) {
                            _file = new File(entry, _mode);
                        },
                        function () {});

            return _file;
        },
        resolve: function (filePath) {
            var _fullPath = _self.fullPath + "/" + String(filePath),
                _file = null;

            if (!_entry.isDirectory) {
                throw new WebAPIError(errorcode.IO_ERR);
            }

            _resolveSync(_fullPath,
                    function (file) {
                        _file = file;
                    },
                    function (e) {
                        throw (e);
                    },
                    _mode);

            return _file;
        },
        deleteDirectory: function (directory, recursive, onSuccess, onError) {
            if (!_security.all && !_security.deleteDirectory) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            function _deleteDirectory() {
                var _dir = null,
                    _dirName = String(directory);
                _resolveSync(_dirName,
                        function (file) {
                            _dir = file;
                        },
                        function (e) {
                            setTimeout(function () {
                                onError(e);
                            }, 1);
                        },
                        _mode);

                if (_dir) {
                    if (_dir.isDirectory &&
                        _dir.parent.fullPath === _self.fullPath &&
                        (!recursive && _dir.length === 0)) {
                        if (!_readOnly && _mode !== "r") {
                            dbfs.rmdir(_v2r(_dirName),
                                    function () {
                                        setTimeout(function () {
                                            onSuccess();
                                        }, 1);
                                    },
                                    function () {});
                            return null;
                        } else {
                            if (onError) {
                                setTimeout(function () {
                                    onError(new WebAPIError(errorcode.SECURITY_ERR));
                                }, 1);
                            }
                        }
                    } else {
                        if (onError) {
                            setTimeout(function () {
                                onError(new WebAPIError(errorcode.IO_ERR));
                            }, 1);
                        }
                    }
                }

                return undefined;
            }

            return tizen1_utils.validateTypeMismatch(onSuccess, onError, "deleteDirectory", _deleteDirectory);
        },
        deleteFile: function (fileName, onSuccess, onError) {
            if (!_security.all && !_security.deleteFile) {
                throw new WebAPIError(errorcode.SECURITY_ERR);
            }

            function _deleteFile() {
                var _file = null;
                _resolveSync(String(fileName),
                        function (file) {
                            _file = file;
                        },
                        function (e) {
                            if (onError) {
                                setTimeout(function () {
                                    onError(e);
                                }, 1);
                            }
                        },
                        _mode);

                if (_file) {
                    if (_file.isFile && _file.parent.fullPath === _self.fullPath) {
                        if (!_readOnly && _mode !== "r") {
                            dbfs.rm(_v2r(fileName),
                                    function () {
                                        setTimeout(function () {
                                            onSuccess();
                                        }, 1);
                                    },
                                    function () {});
                            return null;
                        } else {
                            if (onError) {
                                setTimeout(function () {
                                    onError(new WebAPIError(errorcode.SECURITY_ERR));
                                }, 1);
                            }
                        }
                    } else {
                        if (onError) {
                            setTimeout(function () {
                                onError(new WebAPIError(errorcode.IO_ERR));
                            }, 1);
                        }
                    }
                }

                return undefined;
            }

            return tizen1_utils.validateTypeMismatch(onSuccess, onError, "deleteFile", _deleteFile);
        }
    };

    _self.__defineGetter__("parent", function () {
        var _parts = _self.fullPath.split("/");

        if (_parent === undefined) {
            if (_parts.length === 1) {
                // virtual root's parent is null
                _parent = null;
            } else {
                _resolveSync(_parts.splice(0, _parts.length - 1).join("/"),
                        function (file) {
                            _parent = file;
                        },
                        function () {},
                        _mode);
            }
            return _parent;
        } else {
            return _parent;
        }
    });

    _self.__defineGetter__("readOnly", function () {
        return false;
    });

    _self.__defineGetter__("isFile", function () {
        return !_entry.isDirectory;
    });

    _self.__defineGetter__("isDirectory", function () {
        return _entry.isDirectory;
    });

    _self.__defineGetter__("created", function () {
        return undefined;
    });

    _self.__defineGetter__("modified", function () {
        if (_entry.isDirectory) {
            return undefined;
        } else {
            return _entry.lastModifiedDate;
        }
    });

    _self.__defineGetter__("path", function () {
        var _parts = _self.fullPath.split("/");

        if (_parts.length === 1) {
            // virtual root
            return _parts.join("");
        } else {
            return _parts.splice(0, _parts.length - 1).join("/") + "/";
        }
    });

    _self.__defineGetter__("name", function () {
        return _entry.name;
    });

    _self.__defineGetter__("fullPath", function () {
        return _r2v(_entry.fullPath);
    });

    _self.__defineGetter__("fileSize", function () {
        if (_entry.isDirectory) {
            return undefined;
        } else {
            return _entry.data.length;
        }
    });

    _self.__defineGetter__("length", function () {
        var _l = 0;
        if (_entry.isDirectory) {
            utils.forEach(_entry.children, function () {
                _l++;
            });
            return _l;
        } else {
            return undefined;
        }
    });

    return _self;
};

FileStream = function (entry, mode, encoding) {
    var _entry = entry,
        _data = entry.data,
        _mode = mode,
        _position = (_mode === "a" ? _data.length : 0),
        _self;

    _self = {
        close: function () {
            var _element;
            if (mode === "a" || mode === "w") {
                dbfs.write(_entry.fullPath, _data, function () {}, function () {});
            }
            for (_element in _self) {
                delete _self[_element];
            }
        },
        read: function (charCount) {
            var _count  = charCount | 0,
                _substr = _data.substring(_position, _position + _count);

            if (_position + _count > _data.length) {
                _position = _data.length;
            } else {
                _position += _count;
            }

            return _substr;
        },
        readBytes: function (byteCount) {
            var _substr = _self.read(byteCount),
                _bytes = [],
                _i;

            for (_i = 0; _i < _substr.length; _i++) {
                _bytes.push(_substr.charCodeAt(_i));
            }

            return _bytes;
        },
        readBase64: function (byteCount) {
            var _substr = _self.read(byteCount);

            return window.atob(_substr);
        },
        write: function (stringData) {
            var _stringData = String(stringData),
                _substr = _data.substring(0, _position);

            _data = _substr.concat(_stringData);
            _position = _data.length;
        },
        writeBytes: function (byteData) {
            _self.write(String.fromCharCode.apply(String, byteData));
        },
        writeBase64: function (base64Data) {
            _self.write(window.btoa(String(base64Data)));
        }
    };

    _self.__defineGetter__("eof", function () {
        return _position === _data.length;
    });

    _self.__defineGetter__("position", function () {
        return _position;
    });

    _self.__defineSetter__("position", function (value) {
        var _value = value | 0;

        if (_value >= 0 && _value <= _data.length) {
            _position = _value;
        } else {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
    });

    _self.__defineGetter__("bytesAvailable", function () {
        return (_data.length - _position) || -1;
    });

    return _self;
};

FileFilter = function (name, startModified, endModified, startCreated, endCreated) {
    var _self = {
        name: name,
        startModified: utils.copy(startModified),
        endModified: utils.copy(endModified),
        endCreated: utils.copy(endCreated)
    };

    return _self;
};

FileSystemStorage = function (label, type, state) {
    var _self = {
        label: label,
        type: type,
        state: state
    };

    return _self;
};

module.exports = {
    maxPathLength: _maxPathLength,
    resolve: function (srcLocation, onSuccess, onError, accessMode) {
        function _resolve() {
            var _mode = accessMode ? String(accessMode) : _defaultMode;

            if (_mode === "r" || _mode === "rw") {
                _resolveAsync(onSuccess, onError, String(srcLocation), _mode);
                return null;
            } else {
                if (onError) {
                    setTimeout(function () {
                        onError(new WebAPIError(errorcode.INVALID_VALUES_ERR));
                    }, 1);
                }
            }
            return undefined;
        }

        return tizen1_utils.validateTypeMismatch(onSuccess, onError, "resolve", _resolve);
    },

    getStorage: function (label, onSuccess, onError) {
        var storage = null, _label = String(label);

        _storages.some(function (value) {
            if (value.label === _label) {
                storage = utils.copy(value);
                setTimeout(function () {
                    onSuccess(storage);
                }, 1);
                return true;
            }
        });

        if (!storage) {
            if(onError) {
                setTimeout(function () {
                    onError(new WebAPIError(errorcode.NOT_FOUND_ERR));
                }, 1);

            } else {
                throw new WebAPIError(errorcode.NOT_FOUND_ERR);
            }
        }
    },

    listStorages: function (onSuccess, onError) {
        function _listStorages() {
            setTimeout(function () {
                onSuccess(utils.copy(_storages));
            }, 1);
        }

        return tizen1_utils.validateTypeMismatch(onSuccess, onError, "listStorages", _listStorages);
    },

    addStorageStateChangeListener: function(onSuccess, onError) {
        function _addStorageStateChangeListener() {
            var watchId = (new Date()).getTime() || 0;
            _observers[watchId] = function(storage) {//storage is which state is changed
		        onSuccess(storage);
		    };

            // This event should be triggered from outside
		    event.on("StateChange", _observers[watchId]);
		    return Number(watchId);
        }

        return tizen1_utils.validateTypeMismatch(onSuccess, onError, "addStorageStateChangeListener", _addStorageStateChangeListener);
    },

    removeStorageStateChangeListener: function (watchId) {
        if (!watchId || typeof watchId !== "number") {
            throw new WebAPIError(errorcode.TYPE_MISMATCH_ERR);
        }
        watchId = String(watchId);

        if (_observers[watchId]) {
            event.deleteEventHandler("StateChange", _observers[watchId]);
            delete _observers[watchId];
        } else {
            throw new WebAPIError(errorcode.INVALID_VALUES_ERR);
        }
    },

    handleSubFeatures: function (subFeatures) {
        function setSecurity(_security) {
            return function (method) {
                _security[method] = true;
            };
        }

        for (var subFeature in subFeatures) {
            if (_security[subFeature].length === 0) {
                _security.all = true;
                return;
            }
            _security.all = false;
            utils.forEach(_security[subFeature], setSecurity);
        }
    }
};

