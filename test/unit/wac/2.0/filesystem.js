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

//debugger;
describe("wac_2.0_filesystem", function () {
    var Filesystem = require('ripple/platform/wac/2.0/filesystem'),
        db = require('ripple/db'),
        fs = new Filesystem();

    beforeEach(function () {
        spyOn(db, "retrieveObject");
        spyOn(db, "saveObject");
    });

    it("fs: maxPathLength is 256", function () {
        expect(fs.maxPathLength).toEqual(256);
    });

    it("fs: resolve invalid success callback raises an exception", function () {
        var error = jasmine.createSpy();
        try {
            fs.resolve(1, error);
        } catch (e) {
            runs(function () {
                expect(e.code).toEqual(e.TYPE_MISMATCH_ERR);
            });
        }
    });

    it("fs: resolve invalid parameters calls error callback", function () {
        var successCalled, 
        error = function (e) {
            expect(e.code).toEqual(e.INVALID_VALUES_ERR);
            successCalled = true;
        };

        fs.resolve(null, error);
        waitsFor(function () {
            return successCalled;
        });
    });

    it("fs: resolve the right parameter", function () {
        var successCalled,
        error = function (e) {
            successCalled = false;
        }, success = function (file) {
            expect(file.name).toEqual("images");
            expect(file.isDirectory).toEqual(true);
            expect(file.path).toEqual("images");
            expect(file.fullPath).toEqual("images");
            expect(file.toURI()).toEqual("file:///opt/images");
            successCalled = true;
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
    });

    it("fs: resolve the wrong parameter", function () {
        var successCalled,
        error = function (e) {
            expect(e.code).toEqual(e.NOT_FOUND_ERR);
            successCalled = true;
        },  success = function (file) {
            successCalled = false;
        };

        fs.resolve(success, error, "image", "rw");
        waitsFor(function () {
            return successCalled;
        });
    });

    it("file: createDirectory and deleteDirectory", function () {
        var _file, _l, _exist, successCalled, deleteSuccessCalled,
        deleteSuccess = function () {
            if (!_exist) {
                expect(_l).toEqual(_file.length);
            }
            deleteSuccessCalled = true;
        },
        deleteError = function (e) {
            deleteSuccessCalled = false;
        },  
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                file.createDirectory("createTmp");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }
            file.deleteDirectory(deleteSuccess, deleteError, "images/createTmp", false);
            successCalled = true;
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        };
        
        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
    });

    it("file: createFile and deleteFile", function () {
        var _file, _l, _exist, successCalled, deleteSuccessCalled,
        deleteSuccess = function () {
            if (!_exist) {
                expect(_l).toEqual(_file.length);
            }
            deleteSuccessCalled = true;
        },
        deleteError = function (e) {
            deleteSuccessCalled = false;
        },  
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                file.createFile("createTmpFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }
            successCalled = true;
            file.deleteFile(deleteSuccess, deleteError, "images/createTmpFile");
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
    });

    it("file: resolve", function () {
        var _file, _l, _resolved, _exist, successCalled, deleteSuccessCalled,
        deleteSuccess = function () {
            if (!_exist) {
                expect(_l).toEqual(_file.length);
            }
            deleteSuccessCalled = true;
        },
        deleteError = function (e) {
            deleteSuccessCalled = false;
        },  
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                file.createFile("createTmpFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }

            _resolved = file.resolve("createTmpFile");
            expect(_resolved.name).toEqual("createTmpFile");
            expect(_resolved.parent.name).toEqual(_file.name);
            successCalled = true;
            file.deleteFile(deleteSuccess, deleteError, "images/createTmpFile");
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
    });

    it("file: listFiles", function () {
        var _file, _l, _exist, _i, _found, successCalled, deleteSuccessCalled, listSuccessCalled,
        listSuccess = function (files) {
            if (!_exist) {
                expect(files.length).toEqual(_file.length);
            }
            for (_i = 0; _i < files.length; _i++) {
                if (files[_i].name === "createListFile") {
                    _found = true;
                }
            }
            expect(_found).toEqual(true);
            listSuccessCalled = true;
        },
        listError = function () {
            listSuccessCalled = false;
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
            deleteSuccessCalled = true;
        },
        deleteError = function () {
            deleteSuccessCalled = false;
        },
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                file.createFile("createListFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }

            file.listFiles(listSuccess, listError);
            successCalled = true;
            waitsFor(function () {
                return listSuccessCalled;
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
        runs(function () {
            _file.deleteFile(deleteSuccess, deleteError, "images/createListFile");
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        });
    });

    it("file: listFiles with filter", function () {
        var _file, _l, _exist, _i, _found, successCalled, listSuccessCalled, deleteSuccessCalled,
        listSuccess = function (files) {
            if (!_exist) {
                expect(files.length).toEqual(_file.length);
            }
            for (_i = 0; _i < files.length; _i++) {
                if (files[_i].name === "createListFile") {
                    _found = true;
                }
            }
            expect(_found).toEqual(true);
            listSuccessCalled = true;
        },
        listError = function (e) {
            listSuccessCalled = false;
        },  
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
            deleteSuccessCalled = true;
        },
        deleteError = function (e) {
            deleteSuccessCalled = false;
        },  
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                file.createFile("createListFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }
            successCalled = true;
            file.listFiles(listSuccess, listError, {name: "c%"});
            waitsFor(function () {
                return listSuccessCalled;
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
        runs(function () {
            _file.deleteFile(deleteSuccess, deleteError, "images/createListFile");
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        });
    });

    it("file: copyTo", function () {
        var _file, _l, _exist, _resolved, successCalled, d1SuccessCalled, d2SuccessCalled, cpSuccessCalled,
        cpSuccess = function () {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 2);
            }
            _resolved = _file.resolve("createListFile2");
            expect(_resolved.name).toEqual("createListFile2");
            expect(_resolved.parent.name).toEqual(_file.name);
            cpSuccessCalled = true;
        },
        cpError = function () {
            cpSuccessCalled = false;
        },
        delete1Success = function () {
            expect(_l + 1).toEqual(_file.length);
            d1SuccessCalled = true;
        },
        delete2Success = function () {
            expect(_l).toEqual(_file.length);
            d2SuccessCalled = true;
        },
        delete1Error = function () {
            d1SuccessCalled = false;
        },
        delete2Error = function () {
            d2SuccessCalled = false;
        },
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                file.createFile("createListFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }
            successCalled = true;
            file.copyTo(cpSuccess, cpError, "images/createListFile", "images/createListFile2", false);
            waitsFor(function () {
                return cpSuccessCalled;
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
        runs(function () {
            _file.deleteFile(delete1Success, delete1Error, "images/createListFile");
            waitsFor(function () {
                return d1SuccessCalled;
            });
            runs(function () {
                _file.deleteFile(delete2Success, delete2Error, "images/createListFile2");
                waitsFor(function () {
                    return d2SuccessCalled;
                });
            });
        });
    });

    it("file: moveTo", function () {
        var _file, _l, _exist, _resolved, successCalled, deleteSuccessCalled, mvSuccessCalled,
        mvSuccess = function () {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            _resolved = _file.resolve("createListFile2");
            expect(_resolved.name).toEqual("createListFile2");
            expect(_resolved.parent.name).toEqual(_file.name);
            mvSuccessCalled = true;
        },
        mvError = function () {
            mvSuccessCalled = false;
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
            deleteSuccessCalled = true;
        },
        deleteError = function () {
            deleteSuccessCalled = false;
        },
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                file.createFile("createListFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }
            successCalled = true;
            file.moveTo(mvSuccess, mvError, "images/createListFile", "images/createListFile2", false);
            waitsFor(function () {
                return mvSuccessCalled;
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
        runs(function () {
            _file.deleteFile(deleteSuccess, deleteError, "images/createListFile2");
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        });
    });

    it("file: readAsText", function () {
        var _file, _l, _exist, _newFile, successCalled, readSuccessCalled, deleteSuccessCalled,
        readSuccess = function (str) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            expect(str).toEqual("");
            readSuccessCalled = true;
        },
        readError = function () {
            readSuccessCalled = false;
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
            deleteSuccessCalled = true;
        },
        deleteError = function () {
            deleteSuccessCalled = false;
        },
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                _newFile = file.createFile("createListFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }
            successCalled = true;
            _newFile.readAsText(readSuccess, readError);
            waitsFor(function () {
                return readSuccessCalled;
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
        runs(function () {
            _file.deleteFile(deleteSuccess, deleteError, "images/createListFile");
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        });
    });

    it("file: openStream", function () {
        var _file, _l, _exist, _newFile, successCalled, streamSuccessCalled, deleteSuccessCalled, readSuccessCalled,
        streamSuccess = function (stream) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            stream.write("Helloworld");
            stream.close();

            expect(_newFile.fileSize).toEqual(10);
            streamSuccessCalled = true;
        },
        streamError = function () {
            streamSuccessCalled = false;
        },
        readSuccess = function (str) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            expect(str).toEqual("Helloworld");
            readSuccessCalled = true;
        },
        readError = function () {
            readSuccessCalled = false;
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
            deleteSuccessCalled = true;
        },
        deleteError = function () {
            deleteSuccessCalled = false;
        },
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                _newFile = file.createFile("createListFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }
            successCalled = true;
            _newFile.openStream(streamSuccess, streamError, "w");
            waitsFor(function () {
                return streamSuccessCalled;
            });
            runs(function () {
                _newFile.readAsText(readSuccess, readError);
                waitsFor(function () {
                    return readSuccessCalled;
                });
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
        runs(function () {
            _file.deleteFile(deleteSuccess, deleteError, "images/createListFile");
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        });
    });

    it("filestream: read", function () {
        var _file, _l, _exist, _newFile, _txt, successCalled, s1SuccessCalled, s2SuccessCalled, deleteSuccessCalled,
        stream1Success = function (stream) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            stream.write("Helloworld");
            stream.close();
            s1SuccessCalled = true;
        },
        stream1Error = function () {
            s1SuccessCalled = false;
        },
        stream2Success = function (stream) {
            _txt = stream.read(5);
            expect(_txt).toEqual("Hello");
            _txt = stream.read(5);
            expect(_txt).toEqual("world");

            expect(stream.eof).toEqual(true);

            stream.position = 0;
            _txt = stream.read(_newFile.fileSize);
            expect(_txt).toEqual("Helloworld");

            stream.position = 5;
            expect(stream.bytesAvailable).toEqual(5);
            _txt = stream.read(5);
            expect(_txt).toEqual("world");
            expect(stream.bytesAvailable).toEqual(-1);

            stream.close();
            s2SuccessCalled = true;
        },
        stream2Error = function () {
            s2SuccessCalled = false;
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
            deleteSuccessCalled = true;
        },
        deleteError = function () {
            deleteSuccessCalled = false;
        },
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                _newFile = file.createFile("createListFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }
            successCalled = true;
            _newFile.openStream(stream1Success, stream1Error, "w");
            waitsFor(function () {
                return s1SuccessCalled;
            });
            runs(function () {
                _newFile.openStream(stream2Success, stream2Error, "r");
                waitsFor(function () {
                    return s2SuccessCalled;
                });
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
        runs(function () {
            _file.deleteFile(deleteSuccess, deleteError, "images/createListFile");
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        });
    });

    it("filestream: write", function () {
        var _file, _l, _exist, _newFile, _txt, successCalled, s1SuccessCalled, s2SuccessCalled, deleteSuccessCalled,
        stream1Success = function (stream) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            /* Helloworld */
            stream.writeBytes([ 72, 101, 108, 108, 111, 119, 111, 114, 108, 100 ]);
            stream.close();
            s1SuccessCalled = true;
        },
        stream1Error = function () {
            s1SuccessCalled = false;
        },
        stream2Success = function (stream) {
            _txt = stream.read(5);
            expect(_txt).toEqual("Hello");
            _txt = stream.read(5);
            expect(_txt).toEqual("world");

            expect(stream.eof).toEqual(true);

            stream.position = 0;
            _txt = stream.read(_newFile.fileSize);
            expect(_txt).toEqual("Helloworld");

            stream.position = 5;
            expect(stream.bytesAvailable).toEqual(5);
            _txt = stream.read(5);
            expect(_txt).toEqual("world");
            expect(stream.bytesAvailable).toEqual(-1);

            stream.position = 5;
            _txt = stream.readBytes(5);
            expect(String.fromCharCode.apply(String, _txt)).toEqual("world");

            stream.close();
            s2SuccessCalled = true;
        },
        stream2Error = function () {
            s2SuccessCalled = false;
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
            deleteSuccessCalled = true;
        },
        deleteError = function () {
            deleteSuccessCalled = false;
        },
        error = function (e) {
            successCalled = false;
        },  
        success = function (file) {
            _l = file.length;
            _file = file;
            _exist = false;

            try {   
                _newFile = file.createFile("createListFile");
            } catch (e) {
                if (e.IO_ERR) {
                    _exist = true;
                }
            }
            if (!_exist) {
                expect(_l + 1).toEqual(file.length);
            }

            successCalled = true;
            _newFile.openStream(stream1Success, stream1Error, "w");
            waitsFor(function () {
                return s1SuccessCalled;
            });
            runs(function () {
                _newFile.openStream(stream2Success, stream2Error, "r");
                waitsFor(function () {
                    return s2SuccessCalled;
                });
            });
        };

        fs.resolve(success, error, "images", "rw");
        waitsFor(function () {
            return successCalled;
        });
        runs(function () {
            _file.deleteFile(deleteSuccess, deleteError, "images/createListFile");
            waitsFor(function () {
                return deleteSuccessCalled;
            });
        });
    });
});
