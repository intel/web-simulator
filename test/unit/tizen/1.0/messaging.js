/*
Unit test for Messaging module
Author: Andreea Sandu
Email: andreea.m.sandu@intel.com
*/

describe("tizen_1.0_messaging", function () {
    var db = require('ripple/db'),
    platform = require('ripple/platform'),
    Messaging = require('ripple/platform/tizen/1.0/messaging'),
    Message = require('ripple/platform/tizen/1.0/Message'),
    mymessaging = new Messaging();

    mymessaging.handleSubFeatures({"http://tizen.org/api/messaging": true});
    beforeEach(function () {
        spyOn(db, "retrieveObject");
        spyOn(db, "saveObject");
        spyOn(platform, "current").andReturn(require('ripple/platform/tizen/1.0/spec'));
    });

/*
   **** Test no 1
   *getMessageServices fetches all existing Messaging services by type - SMS
   ****
*/
    it("fetches all existing Messaging services by type - SMS", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, errorCB);
        }
        catch (e) {
            except = true;
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs.length).toEqual(2);
            expect(except).not.toBeTruthy();
        });
    });

/*
   **** Test no 2
   *getMessageServices fetches all existing Messaging services by type - MMS
   ****
*/
    it("fetches all existing Messaging services by type - MMS", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.mms", successCB, errorCB);
        }
        catch (e) {
            except = true;
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs.length).toEqual(1);
            expect(except).not.toBeTruthy();
        });
    });

/*
   **** Test no 3
   *getMessageServices fetches all existing Messaging services by type - E-MAIL
   ****
*/
    it("fetches all existing Messaging services by type - E-mail", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.email", successCB, errorCB);
        }
        catch (e) {
            except = true;
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs.length).toEqual(1);
            expect(except).not.toBeTruthy();
        });
    });

/*
   **** Test no 4
   *getMessageServices fetches all existing Messaging services of given type and service ID
   ****
*/
    it("getMessageServices fetches all existing Messaging services of given type and service ID", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, errorCB, 'Tizen SMS Service 2');
        }
        catch (e) {
            except = true;
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs.length).toEqual(1);
            expect(servs[0].name).toEqual('SMS Service Name 2');
            expect(except).not.toBeTruthy();
        });
    });

/*
   **** Test no 5
   *getMessageServices is invoked several times, with the same parameters, the list of same objects should be obtained.
   ****
*/
    it("getMessageServices is invoked several times, with the same parameters, the list of same objects should be obtained", function () {
        var error = false,
        except = false,
        servs1 = null,
        servs2 = null,
        errorCB = function (error) {
            error = true;
        },
        successCB1 = function (services) {
            servs1 = services;
        },
        successCB2 = function (services) {
            servs2 = services;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB1, errorCB);
            mymessaging.getMessageServices("messaging.sms", successCB2, errorCB);
        }
        catch (e) {
            except = true;
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs1).toEqual(servs2);
            expect(except).not.toBeTruthy();
        });
    });

/*
   **** Test no 6
   *getMessageServices throws INVALID_VALUES_ERROR when messageServiceType is invalid
   ****
*/
    it("getMessageServices throws INVALID_VALUES_ERROR when messageServiceType is invalid", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.bogus", successCB, errorCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('INVALID_VALUES_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 7
   *getMessageServices throws INVALID_VALUES_ERROR when serviceId is invalid
   ****
*/
    it("getMessageServices throws INVALID_VALUES_ERROR when serviceId is invalid", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.mms", successCB, errorCB, 'Bogus');
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('INVALID_VALUES_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
        });
    });

/*
   **** Test no 8
   *getMessageServices throws TYPE_MISMATCH_ERROR when messageServiceType is null
   ****
*/
    it("getMessageServices throws TYPE_MISMATCH_ERROR when messageServiceType is null", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices(null, successCB, errorCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 9
   *getMessageServices throws TYPE_MISMATCH_ERROR when messageServiceType is a function
   ****
*/
    it("getMessageServices throws TYPE_MISMATCH_ERROR when messageServiceType is a function", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices(function () {
            }, successCB, errorCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 10
   *getMessageServices throws TYPE_MISMATCH_ERROR when messageServiceType is a number
   ****
*/
    it("getMessageServices throws TYPE_MISMATCH_ERROR when messageServiceType is a number", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices(1, successCB, errorCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 11
   *getMessageServices throws TYPE_MISMATCH_ERROR when serviceId is null
   ****
*/
    xit("getMessageServices throws TYPE_MISMATCH_ERROR when serviceId is null", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, errorCB, null);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 12
   *getMessageServices throws TYPE_MISMATCH_ERROR when serviceId is a function
   ****
*/
    it("getMessageServices throws TYPE_MISMATCH_ERROR when serviceId is a function", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, errorCB, function () {
            });
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 13
   *getMessageServices throws TYPE_MISMATCH_ERROR when serviceId is a number
   ****
*/
    it("getMessageServices throws TYPE_MISMATCH_ERROR when serviceId is a number", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        },
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, errorCB, 1);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 14
   *getMessageServices throws TYPE_MISMATCH_ERROR when successCB is a number
   ****
*/
    xit("getMessageServices throws TYPE_MISMATCH_ERROR when successCB is a number", function () {
        var error = false,
        except = false,
        servs = null,
        errorCB = function (error) {
            error = true;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", 1, errorCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 16
   *getMessageServices throws TYPE_MISMATCH_ERROR when errorCB is null
   ****
*/
    xit("getMessageServices throws TYPE_MISMATCH_ERROR when errorCB is null", function () {
        var error = false,
        except = false,
        servs = null,
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, null);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 17
   *getMessageServices throws TYPE_MISMATCH_ERROR when errorCB is a number
   ****
*/
    it("getMessageServices throws TYPE_MISMATCH_ERROR when errorCB is a number", function () {
        var error = false,
        except = false,
        servs = null,
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, 1);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs).toBeNull();
            expect(except).toBeTruthy();
        });
    });

/*
   **** Test no 18
   *getMessageServices works without errorCB
   ****
*/
    it("getMessageServices works without errorCB", function () {
        var error = false,
        except = false,
        servs = null,
        successCB = function (services) {
            servs = services;
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(servs.length).toEqual(2);
            expect(except).not.toBeTruthy();
        });
    });

/*
   **** Test no 19
   *sendMessage throws TYPE_MISMATCH_ERROR when message is null
   ****
*/
    it("sendMessage throws TYPE_MISMATCH_ERROR when message is null", function () {
        var error = false,
        except = false,
        exceptSend = false,
        errorCB = function (error) {
            error = true;
        },
        successSendCB = jasmine.createSpy("success_callback"),
        errorSendCB = jasmine.createSpy("error_callback"),
        successCB = function (services) {
            try {
                services[0].sendMessage(null, successSendCB, errorSendCB);
            }
            catch (e) {
                exceptSend = true;
                expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
            }
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, errorCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(successSendCB).not.toHaveBeenCalled();
            expect(errorSendCB).not.toHaveBeenCalled();
            expect(except).not.toBeTruthy();
            expect(exceptSend).toBeTruthy();
        });
    });

/*
   **** Test no 20
   *sendMessage throws TYPE_MISMATCH_ERROR when message is a function
   ****
*/
    it("sendMessage throws TYPE_MISMATCH_ERROR when message is a function", function () {
        var error = false,
        except = false,
        exceptSend = false,
        errorCB = function (error) {
            error = true;
        },
        successSendCB = jasmine.createSpy("success_callback"),
        errorSendCB = jasmine.createSpy("error_callback"),
        successCB = function (services) {
            try {
                services[0].sendMessage(function () {
                }, successSendCB, errorSendCB);
            }
            catch (e) {
                exceptSend = true;
                expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
            }
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, errorCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(successSendCB).not.toHaveBeenCalled();
            expect(errorSendCB).not.toHaveBeenCalled();
            expect(except).not.toBeTruthy();
            expect(exceptSend).toBeTruthy();
        });
    });

/*
   **** Test no 21
   *sendMessage throws TYPE_MISMATCH_ERROR when message is a number
   ****
*/
    it("sendMessage throws TYPE_MISMATCH_ERROR when message is a number", function () {
        var error = false,
        except = false,
        exceptSend = false,
        errorCB = function (error) {
            error = true;
        },
        successSendCB = jasmine.createSpy("success_callback"),
        errorSendCB = jasmine.createSpy("error_callback"),
        successCB = function (services) {
            try {
                services[0].sendMessage(1, successSendCB, errorSendCB);
            }
            catch (e) {
                exceptSend = true;
                expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
            }
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, errorCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(1);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(successSendCB).not.toHaveBeenCalled();
            expect(errorSendCB).not.toHaveBeenCalled();
            expect(except).not.toBeTruthy();
            expect(exceptSend).toBeTruthy();
        });
    });

 /*
   **** Test no 22
   *sendMessage throws INVALID_VALUES_ERROR when message is invalid
   ****
*/
    xit("sendMessage throws INVALID_VALUES_ERROR when message is invalid ", function () {
        var msg = new Message("messaging.sms", {
            plainBody: "test.",
            to: ["+34666666666", "+34888888888"]
        }),
        error = false,
        except = false,
        exceptSend = false,
        errorCB = function (error) {
            error = true;
        },
        successSendCB = jasmine.createSpy("success_callback"),
        errorSendCB = jasmine.createSpy("error_callback"),
        successCB = function (services) {
            try {
                services[0].sendMessage(msg, successSendCB, errorSendCB);
            }
            catch (e) {
                exceptSend = true;
                expect(e.name).toEqual('INVALID_VALUES_ERROR');
            }
        };

        try {
            mymessaging.getMessageServices("messaging.sms", successCB, errorCB);
        }
        catch (e) {
            except = true;
            expect(e.name).toEqual('TYPE_MISMATCH_ERROR');
        }

        waits(10);

        runs(function () {
            expect(error).not.toBeTruthy();
            expect(successSendCB).not.toHaveBeenCalled();
            expect(errorSendCB).not.toHaveBeenCalled();
            expect(except).not.toBeTruthy();
            expect(exceptSend).toBeTruthy();
        });
    });

});
