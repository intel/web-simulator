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
    exception = require('ripple/exception'),
    errorcode = require('ripple/platform/wac/2.0/errorcode'),
    wac2_utils = require('ripple/platform/wac/2.0/wac2_utils'),
    PendingObject = require('ripple/platform/wac/2.0/pendingObject'),
    DeviceApiError = require('ripple/platform/wac/2.0/deviceapierror'),
    PendingOperation = require('ripple/platform/wac/2.0/pendingoperation'),
    Task, TaskList, _get,
    _ID_WITHOUT = 0, _ID_GEN_NEW = 1, _ID_FROM_PROP = 2,
    _SIM_TASK_LIST = 0, _DEVICE_TASK_LIST = 1,
    _HIGH_PRIORITY = 0, _MEDIUM_PRIORITY = 1, _LOW_PRIORITY = 2,
    _STATUS_COMPLETED = 0, _STATUS_NEEDS_ACTION = 1, _STATUS_IN_PROCESS = 2, _STATUS_CANCELLED = 3,
    _TASK_OBJECTS = "wac2.0-pim-task-objects",
    _addTaskAllowed = true, _deleteTaskAllowed = true,
    _updateTaskAllowed = true, _findTasksAllowed = true;


module.exports = function () {
    var _taskListArray = [],
        _PENDING_TIME = 10;

    function _pendingOperate(operate) {
        var pendingObj, pendingOperation, i, argumentVector = [];

        for (i = 0; i < arguments.length - 1; i++)
            argumentVector[i] = arguments[i + 1];

        pendingObj = new PendingObject();

        pendingObj.pendingID = window.setTimeout(function () {
            pendingObj.setCancelFlag(false);
            operate.apply(this, argumentVector);
        }, _PENDING_TIME);

        pendingOperation = new PendingOperation(pendingObj);

        return pendingOperation;
    }

    /* taskProperties attribute check & paste */
    function _checkAndPasteProperties(p, dst) {

        if (p.summary !== null && p.summary !== undefined)
            dst.summary = String(p.summary);

        if (p.description !== null && p.description !== undefined)
            dst.description = String(p.description);

        if (p.status !== null && p.status !== undefined) {
            if (p.status === _STATUS_COMPLETED ||
                p.status === _STATUS_NEEDS_ACTION ||
                p.status === _STATUS_IN_PROCESS ||
                p.status === _STATUS_CANCELLED) {
                dst.status = p.status;
            } else
                return false;
        }

        if (p.priority !== null && p.priority !== undefined) {
            if (p.priority === _HIGH_PRIORITY ||
                p.priority === _MEDIUM_PRIORITY ||
                p.priority === _LOW_PRIORITY) {
                dst.priority = p.priority;
            } else
                return false;
        }

        if (p.dueDate !== null && p.dueDate !== undefined) {
            if (!wac2_utils.isValidDate(p.dueDate))
                return false;
            dst.dueDate = new Date(p.dueDate);
        }

        /* dueDate is a option properties.
           "The default value is undefined.
             If no value is provided, the task has no due date."
           If p.dueDate is set its default value 'undefined',
           we assign default value to dst.dueDate */
        if (p.dueDate === undefined) {
            dst.dueDate = undefined;
        }

        return true;
    }

    function _taskFilterCheck(filter) {
        var i;
        if (filter.id !== undefined && filter.id !== null) {
            filter.id = String(filter.id);
        } else {
            filter.id = undefined;
        }
        if (filter.summary !== undefined && filter.summary !== null) {
            filter.summary = String(filter.summary);
        } else {
            filter.summary = undefined;
        }
        if (filter.description !== undefined && filter.description !== null) {
            filter.description = String(filter.description);
        } else {
            filter.description = undefined;
        }
        if (filter.status !== undefined && filter.status !== null) {
            if (!wac2_utils.isValidArray(filter.status))  {
                return false;
            }
            for (i = 0; i < filter.status.length; i++) {
                filter.status[i] = filter.status[i] | 0;
                if (filter.status[i] !== _STATUS_COMPLETED &&
                    filter.status[i] !== _STATUS_NEEDS_ACTION &&
                    filter.status[i] !== _STATUS_IN_PROCESS &&
                    filter.status[i] !== _STATUS_CANCELLED) {
                    return false;
                }
            }
        } else {
            filter.status = undefined;
        }
        if (filter.priority !== undefined && filter.priority !== null) {
            if (!wac2_utils.isValidArray(filter.priority))  {
                return false;
            }
            for (i = 0; i < filter.priority.length; i++) {
                filter.priority[i] = filter.priority[i] | 0;
                if (filter.priority[i] !== _HIGH_PRIORITY &&
                    filter.priority[i] !== _MEDIUM_PRIORITY &&
                    filter.priority[i] !== _LOW_PRIORITY) {
                    return false;
                }
            }
        } else {
            filter.priority = undefined;
        }
        if (filter.dueDate !== undefined && filter.dueDate !== null) {
            if (!wac2_utils.isValidDate(filter.dueDate)) {
                return false;
            }
            filter.dueDate = new Date(filter.dueDate);
        } else {
            filter.dueDate = undefined;
        }
        return true;
    }

    function TaskProperties(prop) {
        var _self;
        _self = {
            priority : _LOW_PRIORITY,
            description : "",
            summary : "",
            dueDate : undefined,
            status : _STATUS_NEEDS_ACTION
        };
        if (prop) {
            if (_checkAndPasteProperties(prop, _self) === false)
                return undefined;
        }
        return _self;
    }

    function Task(prop, idChoice) {
        var id, _self = new TaskProperties(prop);
        /* if error occurs during checking, _self is an empty object.
           so i randomly pick description to check if property check fails */
        if (_self.description === undefined)
            return undefined;

        switch (idChoice) {
        case _ID_WITHOUT:
            // do nothing
            break;
        case _ID_GEN_NEW:
            id = Math.uuid(undefined, 16);
            _self.__defineGetter__("id", function () {
                return id;
            });
            break;
        case _ID_FROM_PROP:
            id = String(prop.id);
            _self.__defineGetter__("id", function () {
                return id;
            });
            break;
        }

        return _self;
    }

    function _get() {
        var taskListArray = [],
            data = db.retrieveObject(_TASK_OBJECTS);
        utils.forEach(data, function (taskList) {
            for (var t in taskList._list) {
                if (taskList._list[t].dueDate !== undefined &&
                    taskList._list[t].dueDate !== null)
                    taskList._list[t].dueDate = new Date(taskList._list[t].dueDate);
            }
            taskListArray.push(new TaskList(taskList._list, taskList.type, taskList.name));
        });

        /* add default taskList if taskListArray is empty */
        if (taskListArray.length === 0) {
            taskListArray = [new TaskList({}, 0, "Office tasks"), new TaskList({}, 1, "Home tasks")];
        }

        return taskListArray;
    }

    function _save() {
        db.saveObject(_TASK_OBJECTS, _taskListArray);
    }

    function TaskList(taskList, type, name) {
        var task;
        this._list = taskList;
        this.type = type;
        this.name = name;

        this.createTask = function (properties) {
            task = new Task(properties, _ID_WITHOUT);
            /* if error occurs during checking, task is an empty object.
               so i randomly pick summary to check if property check fails */
            if (task.summary === undefined) {
                exception.raise(exception.types.Argument,
                        "EventProperties: input parameter contains invalid values",
                        new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                return undefined;
            }
            return task;
        };

        this.addTask = function (onSuccess, onError, task) {
            var inner = this,
                newTask, _task = Object(task);
            function _addTask() {
                var ret;
                if (!_addTaskAllowed) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                newTask = new Task(_task, _ID_GEN_NEW);
                /* if error occurs during checking, newTask is an empty object.
                    so i randomly pick id to check if property check fails */
                if (newTask.id === undefined) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                ret = _pendingOperate(function () {
                    inner._list[newTask.id] = newTask;
                    _save();
                    onSuccess(new Task(newTask, _ID_FROM_PROP));
                });
            }

            return wac2_utils.validateTypeMismatch(onSuccess, onError, "addTask", _addTask);
        };

        this.updateTask = function (onSuccess, onError, task) {
            var inner = this,
                newTask, _task = Object(task);
            function _updateTask() {
                var ret;
                if (!_updateTaskAllowed) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                if (_checkAndPasteProperties(_task, _task) === false) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }

                ret = _pendingOperate(function () {
                    if (inner._list[_task.id]) {
                        newTask = new Task(inner._list[_task.id], _ID_FROM_PROP);
                        /* Don't need to double check the return of _checkAndPasteProperties 
                           _task has been checked & pasted already */
                        _checkAndPasteProperties(_task, newTask);
                        inner._list[newTask.id] = newTask;
                        _save();
                        onSuccess();
                    } else {
                        if (onError) {
                            onError(new DeviceApiError(errorcode.NOT_FOUND_ERR));
                        }
                    }
                });
                return ret;
            }

            return wac2_utils.validateTypeMismatch(onSuccess, onError, "updateTask", _updateTask);
        };

        this.deleteTask = function (onSuccess, onError, id) {
            var inner = this;
            function _deleteTask() {
                var ret;
                /* according to spec  "If any of the input parameters are not 
                   compatible with the expected type for that parameter, 
                   a DeviceAPIError with code TYPE_MISMATCH_ERR MUST be 
                   synchronously thrown." so an error is raised synchronously */
                utils.validateArgumentType(id, "string", null,
                        "Task:deleteTask: " + " invalid id parameter",
                        new DeviceApiError(errorcode.TYPE_MISMATCH_ERR));
                if (!_deleteTaskAllowed) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                ret = _pendingOperate(function () {
                    if (inner._list[id]) {
                        delete inner._list[id];
                        _save();
                        onSuccess();
                    } else {
                        if (onError)
                            onError(new DeviceApiError(errorcode.NOT_FOUND_ERR));
                    }
                });
                return ret;
            }

            return wac2_utils.validateTypeMismatch(onSuccess, onError, "deleteTask", _deleteTask);
        };

        this.findTasks = function (onSuccess, onError, filter) {
            var inner = this, _filter = Object(filter), tmp = [], rst = [], valid_tmp = false;
            function _findTasks() {
                var ret;
                if (!_taskFilterCheck(_filter)) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.INVALID_VALUES_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                if (!_findTasksAllowed) {
                    if (onError) {
                        setTimeout(function () {
                            onError(new DeviceApiError(errorcode.SECURITY_ERR));
                        }, 1);
                    }
                    return undefined;
                }
                ret = _pendingOperate(function () {
                    var i, e;
                    if (_filter.id !== undefined) {
                        tmp = wac2_utils.matchOptionString(inner._list, "id", _filter.id);
                        valid_tmp = true;
                    }
                    if (_filter.summary !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionString(tmp, "summary", _filter.summary);
                        } else {
                            tmp = wac2_utils.matchOptionString(inner._list, "summary", _filter.summary);
                            valid_tmp = true;
                        }
                    }
                    if (_filter.description !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionString(tmp, "description", _filter.description);
                        } else {
                            tmp = wac2_utils.matchOptionString(inner._list, "description", _filter.description);
                            valid_tmp = true;
                        }
                    }
                    if (_filter.status !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionShortArray(tmp, "status", _filter.status);
                        } else {
                            tmp = wac2_utils.matchOptionShortArray(inner._list, "status", _filter.status);
                            valid_tmp = true;
                        }
                    }
                    if (_filter.priority !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionShortArray(tmp, "priority", _filter.priority);
                        } else {
                            tmp = wac2_utils.matchOptionShortArray(inner._list, "priority", _filter.priority);
                            valid_tmp = true;
                        }
                    }
                    if (_filter.initialDueDate !== undefined ||
                        _filter.endDueDate !== undefined) {
                        if (valid_tmp) {
                            tmp = wac2_utils.matchOptionDate(tmp, "dueDate", _filter.initialDueDate, _filter.endDueDate);
                        } else {
                            tmp = wac2_utils.matchOptionDate(inner._list, "dueDate", _filter.initialDueDate, _filter.endDueDate);
                            valid_tmp = true;
                        }
                    }

                    if (valid_tmp) {
                        for (i = 0; i < tmp.length; i++) {
                            rst.push(new Task(tmp[i], _ID_FROM_PROP));
                        } 
                    } else {
                        for (e in inner._list) {
                            rst.push(new Task(inner._list[e], _ID_FROM_PROP));
                        }
                    }
                    onSuccess(rst);
                });
                return ret;
            }

            return wac2_utils.validateTypeMismatch(onSuccess, onError, "findTasks", _findTasks);
        };
    }

    this.getTaskLists = function (onSuccess, onError) {
        function _getTaskLists() {
            var ret;
            ret = _pendingOperate(function () {
                if (_taskListArray.length === 0) {
                    _taskListArray = _get();
                }
                onSuccess(_taskListArray);
            }, 1);
            return ret;
        }

        return wac2_utils.validateTypeMismatch(onSuccess, onError, "getTaskLists", _getTaskLists);
    };

    this.__defineGetter__("SIM_TASK_LIST", function () {
        return 0;
    });
    this.__defineGetter__("DEVICE_TASK_LIST", function () {
        return 1;
    });
    this.__defineGetter__("HIGH_PRIORITY", function () {
        return 0;
    });
    this.__defineGetter__("MEDIUM_PRIORITY", function () {
        return 1;
    });
    this.__defineGetter__("LOW_PRIORITY", function () {
        return 2;
    });
    this.__defineGetter__("STATUS_COMPLETED", function () {
        return 0;
    });
    this.__defineGetter__("STATUS_NEEDS_ACTION", function () {
        return 1;
    });
    this.__defineGetter__("STATUS_IN_PROCESS", function () {
        return 2;
    });
    this.__defineGetter__("STATUS_CANCELLED", function () {
        return 3;
    });

    this.handleSubFeatures = function (subFeatures) {
        if (wac2_utils.isEmptyObject(subFeatures) ||
            subFeatures["http://wacapps.net/api/pim.task"] ||
            (subFeatures["http://wacapps.net/api/pim.task.read"] &&
            subFeatures["http://wacapps.net/api/pim.task.write"])) {
            return;
        }
        if (subFeatures["http://wacapps.net/api/pim.task.read"] &&
           !subFeatures["http://wacapps.net/api/pim.task.write"]) {
            _addTaskAllowed = false;
            _deleteTaskAllowed = false;
            _updateTaskAllowed = false;
            return;
        }
        if (subFeatures["http://wacapps.net/api/pim.task.write"] &&
           !subFeatures["http://wacapps.net/api/pim.task.read"]) {
            _findTasksAllowed = false;
            return;
        }
        _console.warn("WAC-2.0-Task-handleSubFeatures: something wrong");
    };

};

