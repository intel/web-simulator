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
        var error = function (e) {
            expect(e.code).toEqual(e.INVALID_VALUES_ERR);
        };

        fs.resolve(null, error);
        waits(2);
        runs(function () {
        });
    });

    it("fs: resolve the right parameter", function () {
        var error = function (e) {
        }, success = function (file) {
            expect(file.name).toEqual("images");
            expect(file.isDirectory).toEqual(true);
            expect(file.path).toEqual("images");
            expect(file.fullPath).toEqual("images");
            expect(file.toURI()).toEqual("file:///opt/images");
        };

        fs.resolve(success, error, "images", "rw");
        waits(2);
        runs(function () {
        });
    });

    it("fs: resolve the wrong parameter", function () {
        var error = function (e) {
            expect(e.code).toEqual(e.NOT_FOUND_ERR);
        },  success = function (file) {
        };

        fs.resolve(success, error, "image", "rw");
        waits(2);
        runs(function () {
        });
    });

    it("file: createDirectory and deleteDirectory", function () {
        var _file, _l, _exist,
        deleteSuccess = function () {
            if (!_exist) {
                expect(_l).toEqual(_file.length);
            }
        },
        error = function (e) {
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
            file.deleteDirectory(deleteSuccess, null, "images/createTmp", false);
            waits(2);
            runs(function () {
            });
        };
        
        fs.resolve(success, error, "images", "rw");
        waits(2);
        runs(function () {
        });
    });

    it("file: createFile and deleteFile", function () {
        var _file, _l, _exist,
        deleteSuccess = function () {
            if (!_exist) {
                expect(_l).toEqual(_file.length);
            }
        },
        error = function (e) {
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

            file.deleteFile(deleteSuccess, null, "images/createTmpFile");
            waits(2);
            runs(function () {
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(2);
        runs(function () {
        });
    });

    it("file: resolve", function () {
        var _file, _l, _resolved, _exist,
        deleteSuccess = function () {
            if (!_exist) {
                expect(_l).toEqual(_file.length);
            }
        },
        error = function (e) {
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

            file.deleteFile(deleteSuccess, null, "images/createTmpFile");
            waits(2);
            runs(function () {
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(2);
        runs(function () {
        });
    });

    it("file: listFiles", function () {
        var _file, _l, _exist, _i, _found,
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
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
        },
        error = function (e) {
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

            file.listFiles(listSuccess, null);
            waits(2);
            runs(function () {
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(3);
        runs(function () {
            _file.deleteFile(deleteSuccess, null, "images/createListFile");
            waits(2);
            runs(function () {
            });
        });
    });

    it("file: listFiles with filter", function () {
        var _file, _l, _exist, _i, _found,
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
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
        },
        error = function (e) {
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

            file.listFiles(listSuccess, null, {name: "c%"});
            waits(2);
            runs(function () {
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(3);
        runs(function () {
            _file.deleteFile(deleteSuccess, null, "images/createListFile");
            waits(2);
            runs(function () {
            });
        });
    });

    it("file: copyTo", function () {
        var _file, _l, _exist, _resolved,
        cpSuccess = function () {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 2);
            }
            _resolved = _file.resolve("createListFile2");
            expect(_resolved.name).toEqual("createListFile2");
            expect(_resolved.parent.name).toEqual(_file.name);
        },
        delete1Success = function () {
            expect(_l + 1).toEqual(_file.length);
        },
        delete2Success = function () {
            expect(_l).toEqual(_file.length);
        },
        error = function (e) {
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

            file.copyTo(cpSuccess, null, "images/createListFile", "images/createListFile2", false);
            waits(2);
            runs(function () {
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(3);
        runs(function () {
            _file.deleteFile(delete1Success, null, "images/createListFile");
            waits(2);
            runs(function () {
                _file.deleteFile(delete2Success, null, "images/createListFile2");
                waits(2);
                runs(function () {
                });
            });
        });
    });

    it("file: moveTo", function () {
        var _file, _l, _exist, _resolved,
        mvSuccess = function () {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            _resolved = _file.resolve("createListFile2");
            expect(_resolved.name).toEqual("createListFile2");
            expect(_resolved.parent.name).toEqual(_file.name);
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
        },
        error = function (e) {
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

            file.moveTo(mvSuccess, error, "images/createListFile", "images/createListFile2", false);
            waits(2);
            runs(function () {
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(3);
        runs(function () {
            _file.deleteFile(deleteSuccess, null, "images/createListFile2");
            waits(2);
            runs(function () {
            });
        });
    });

    it("file: readAsText", function () {
        var _file, _l, _exist, _newFile,
        readSuccess = function (str) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            expect(str).toEqual("");
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
        },
        error = function (e) {
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

            _newFile.readAsText(readSuccess, error);
            waits(2);
            runs(function () {
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(3);
        runs(function () {
            _file.deleteFile(deleteSuccess, null, "images/createListFile");
            waits(2);
            runs(function () {
            });
        });
    });

    it("file: openStream", function () {
        var _file, _l, _exist, _newFile,
        streamSuccess = function (stream) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            stream.write("Helloworld");
            stream.close();

            expect(_newFile.fileSize).toEqual(10);
        },
        readSuccess = function (str) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            expect(str).toEqual("Helloworld");
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
        },
        error = function (e) {
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

            _newFile.openStream(streamSuccess, error, "w");
            waits(2);
            runs(function () {
                _newFile.readAsText(readSuccess, error);
                waits(2);
                runs(function () {
                });
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(3);
        runs(function () {
            _file.deleteFile(deleteSuccess, null, "images/createListFile");
            waits(2);
            runs(function () {
            });
        });
    });

    it("filestream: read", function () {
        var _file, _l, _exist, _newFile, _txt,
        stream1Success = function (stream) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            stream.write("Helloworld");
            stream.close();
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
        },
 
        readSuccess = function (str) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            expect(str).toEqual("Helloworld");
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
        },
        error = function (e) {
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

            _newFile.openStream(stream1Success, error, "w");
            waits(2);
            runs(function () {
                _newFile.openStream(stream2Success, error, "r");
                waits(2);
                runs(function () {
                });
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(3);
        runs(function () {
            _file.deleteFile(deleteSuccess, null, "images/createListFile");
            waits(2);
            runs(function () {
            });
        });
    });

    it("filestream: write", function () {
        var _file, _l, _exist, _newFile, _txt,
        stream1Success = function (stream) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            /* Helloworld */
            stream.writeBytes([ 72, 101, 108, 108, 111, 119, 111, 114, 108, 100 ]);
            stream.close();
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
        },
 
        readSuccess = function (str) {
            if (!_exist) {
                expect(_file.length).toEqual(_l + 1);
            }
            expect(str).toEqual("Helloworld");
        },
        deleteSuccess = function () {
            expect(_l).toEqual(_file.length);
        },
        error = function (e) {
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

            _newFile.openStream(stream1Success, error, "w");
            waits(2);
            runs(function () {
                _newFile.openStream(stream2Success, error, "r");
                waits(2);
                runs(function () {
                });
            });
        };

        fs.resolve(success, error, "images", "rw");
        waits(3);
        runs(function () {
            _file.deleteFile(deleteSuccess, null, "images/createListFile");
            waits(2);
            runs(function () {
            });
        });
    });
});
