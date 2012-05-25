/*
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

var db = require('ripple/db'),
    utils = require('ripple/utils'),
    _console = require('ripple/console'),
    _cache = {},
    _self;

function _get(path) {
    return path.replace(/^\//, '').split("/").reduce(function (obj, token) {
        return token === "" ? obj : (obj.children ? obj.children[token] || null : null);
    }, _cache);
}

function _getInfo(path) {
    var parent = ("/" + path.replace(/^\//, '').replace(/\/$/, '')).split("/"),
        name = parent.splice(parent.length - 1, 1).join("");

    return {
        name: name,
        parent: parent.join("/") || "/"
    };
}

function _set(path, obj) {
    var parent = _cache,
        tokens = path.replace(/^\//, '').split("/"),
        child = tokens.splice(tokens.length - 1, 1).join("");

    tokens.forEach(function (token) {
        parent = parent.children[token];
    });

    parent.children = parent.children || {};
    parent.children[child] = obj;
}

function _delete(path) {
    var parent = _cache,
        tokens = path.replace(/^\//, '').split("/"),
        child = tokens.splice(tokens.length - 1, 1).join("");

    tokens.forEach(function (token) {
        parent = parent.children[token];
    });

    delete parent.children[child];
}

function _save() {
    db.saveObject("tizen1-db-filesystem", _cache);
}

function _walk(path, parent) {
    _self.ls(path, function (entries) {
        parent.children = parent.children || {};

        entries.forEach(function (entry) {
            parent.children[entry.name] = entry;

            if (entry.isDirectory) {
                _walk(entry.fullPath, entry);
            } else {
                /* after getting Date out of DB, Date will become
                   a string, so need to recast it back to Date */
                if (entry.lastModifiedDate !== null && entry.lastModifiedDate !== undefined)
                    entry.lastModifiedDate = new Date(entry.lastModifiedDate);

                _self.read(entry.fullPath, function (data) {
                    parent.children[entry.name].data = data;
                }, function (e) {
                    _console.error(e);
                });
            }
        });
    }, function (e) {
        _console.error(e);
    });
}

function _createPath(path) {
    var parts = path.replace(/^\//, '').split("/"),
        workflow = jWorkflow.order();

    parts.forEach(function (part, index) {
        var dir = "/" + utils.copy(parts).splice(0, index + 1).join("/");

        workflow.andThen(function (prev, baton) {
            baton.take();
            _self.mkdir(dir, baton.pass, baton.pass);
        });
    });

    workflow.start();
}

_self = {
    // The order is consistent with _virtualRoots in filesystem.js
    roots: ["/opt/documents", "/opt/images", "/opt/music", "/opt/videos", "/opt/downloads", "/home/user/appdata/simulatedapp/wgt-package", "/home/user/appdata/simulatedapp/wgt-private", "/home/user/appdata/simulatedapp/wgt-private-tmp", "/SDCard", "/opt/attachments"],
    initialize: function () {
        // TODO: Initialize at bootstrap and emulatorBridge.link
        _cache = db.retrieveObject("tizen1-db-filesystem") || {};
        // create real root paths if empty
        _self.roots.every(function (root) {
            _createPath(root);
            return true;
        });
       // build the file system cache so that we could access information synchronously
        _walk("/", _cache);
    },
    ls: function (path, success, error) {
        try {
            var dir = _get(path),
                items = [];

            if (dir) {
                utils.forEach(dir.children, function (item) {
                    items.push(item);
                });
            }
            else {
                items = {};
            }

            success(items);
        }
        catch (e) {
            e.code = 1;
            error(e);
        }
    },
    rm: function (path, success, error, options) {
        _delete(path);
        _save();
        success();
    },
    rmdir: function (path, success, error, options) {
        _delete(path);
        _save();
        success();
    },
    mkdir: function (path, success, error) {
        var entry = _get(path),
            info = _getInfo(path);

        if (!entry) {
            _set(path, {
                name: info.name,
                isDirectory: true,
                fullPath: path
            });
            entry = _get(path);
            _save();
        }

        if (entry) {
            success(entry);
        }
        else {
            error({code: 1});
        }
    },
    mv: function (from, to, success, error) {
        try {
            var fromEntry = _get(from),
                toInfo = _getInfo(to);

            fromEntry.fullPath = to;
            fromEntry.name = toInfo.name;

            _set(to, fromEntry);
            _delete(from);
            _save();
            success();
        }
        catch (e) {
            e.code = 1;
            error(e);
        }
    },
    touch: function (path, success, error) {
        var entry = _get(path),
            info  = _getInfo(path);

        if (!entry) {
            _set(path, {
                lastModifiedDate: new Date(),
                name: info.name,
                isDirectory: false,
                fullPath: path,
                data: ""
            });
            entry = _get(path);
        }
        _save();
        success(entry);
    },
    cp: function (from, to, success, error) {
        try {
            var fromEntry = _get(from),
                copied = utils.copy(fromEntry);

            copied.name  = _getInfo(to).name;
            copied.fullPath = to;
            _set(to, copied);
            _save();
            success();
        }
        catch (e) {
            e.code = 1;
            error(e);
        }
    },
    stat: function (path, success, error) {
        var entry = _get(path);

        if (entry) {
            success(entry);
        } else {
            error({code: 1});
        }
    },
    write: function (path, contents, success, error, options) {
        var entry = _get(path);

        if (entry) {
            entry.lastModifiedDate = new Date();
            entry.data = contents;
            _save();
            success();
        } else {
            error({code: 1});
        }

    },
    read: function (path, success, error) {
        var entry = _get(path);

        if (entry) {
            success(utils.copy(entry.data));
        }
        else {
            error({code: 1});
        }
    }
};

module.exports = _self;

