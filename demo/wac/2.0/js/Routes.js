(Demo.Routes = function($, jQuery){

    function _setNavBackAndHome(){
        $.UI.setLeftNav("Back")
            .setRightNav("Home", "index.html");
    }

    function _errorOcurred(e) {
        switch (e.code)
        {
        case e.INVALID_VALUES_ERR:
            alert(e.code + ":" + e.message + "\nThe successCallback does not contains a function.");
            break;

        case e.NOT_SUPPORTED_ERR:
            alert(e.code + ":" + e.message + "\nThis feature is not supported.");
            break;

        case e.SECURITY_ERR:
            alert(e.code + ":" + e.message + "\nThis functionality is not allowed.");
            break;

        default: // e.UNKNOWN_ERR
            alert(e.code + ":" + e.message);
            break;
        }
    }

    function _catchException(e) {
        switch (e.code)
        {
        case e.TYPE_MISMATCH_ERR:
            alert(e.code + ":" + e.message + "\nInput parameters are not compatible with the expected type for that parameter.");
            break;
            
        default: // e.UNKNOWN_ERR
            alert(e.code + ":" + e.message);
            break;
        }
    }

    // ----- Private Vars -----
    var _baseUrl = "",
        _history = [],
        _routes = {

            "index.html": function(){

                $.Routes.clearHistory();

                $.UI.setLeftNav()
                    .setTitle("Demo")
                    .setRightNav();

            },

            "camera.html": function () {
                var camera = Widget.Multimedia.Camera,
                    imgNum = 0;

                _setNavBackAndHome();

                camera.setWindow(document.getElementById("camera_container"));

                camera.onCameraCaptured = function (file) {
                    jQuery("#file").text(file);
                    jQuery("#cameraEvent").show('slow');

                    setTimeout(function () {
                        jQuery("#cameraEvent").hide('slow');
                    }, 5000);
                };

                jQuery("#camera-capture").unbind().bind("mousedown", function () {
                    camera.captureImage("/virtual/photos/camera_" + imgNum + ".png", false);
                    imgNum++;
                });

                jQuery("#camera-record").unbind().bind("mousedown", function () {
                    camera.startVideoCapture("/virtual/videos/camera_" + imgNum + ".ogv", false, 60, false);
                    imgNum++;
                });

                jQuery("#camera-stop").unbind().bind("mousedown", function () {
                    camera.stopVideoCapture();
                });
            },

            "video.html": function () {
                var videoPlayer = Widget.Multimedia.VideoPlayer;

                _setNavBackAndHome();

                videoPlayer.setWindow(document.getElementById("video_container"));

                videoPlayer.onStateChange = function (state) {
                    //update some fields here
                };

                jQuery("#video-open").unbind().bind("mousedown", function () {
                    videoPlayer.open('images/sample.ogv');
                });

                jQuery("#video-play").unbind().bind("mousedown", function () {
                    videoPlayer.play(1);
                });

                jQuery("#video-pause").unbind().bind("mousedown", function () {
                    videoPlayer.pause();
                });

                jQuery("#video-resume").unbind().bind("mousedown", function () {
                    videoPlayer.resume();
                });

                jQuery("#video-stop").unbind().bind("mousedown", function () {
                    videoPlayer.stop();
                });

            },

            "audio.html": function(){
                var audioPlayer = Widget.Multimedia.AudioPlayer,
                    filePath = jQuery("#audio-file-url"),
                    repeat = jQuery("#audio-repeat");

                _setNavBackAndHome();
                filePath.val($.Routes.getUrl() + "assets/sax.mp3");

                audioPlayer.onStateChange = function (state) {
                    //update some fields here
                };

                jQuery("#audio-open").bind("mousedown", function() {
                    audioPlayer.open(filePath.val());
                });

                jQuery("#audio-play").bind("mousedown", function() {
                    audioPlayer.play(Number(repeat.val() || 1));
                });

                jQuery("#audio-pause").bind("mousedown", function() {
                    audioPlayer.pause();
                });

                jQuery("#audio-resume").bind("mousedown", function() {
                    audioPlayer.resume();
                });

                jQuery("#audio-stop").bind("mousedown", function() {
                    audioPlayer.stop();
                });

            },

            "platforms.html": function(){
                _setNavBackAndHome();
            },

            "accelerometer.html": function(){
                _setNavBackAndHome();
                
                var inputX = jQuery("#accelerometer-x-axis"),
                    inputY = jQuery("#accelerometer-y-axis"),
                    inputZ = jQuery("#accelerometer-z-axis"),
                    idWatch = 0,
                    shakeValue = 0;

                function updateAcceleration(acceleration) {
                    var myXaxis = acceleration.xAxis,
                        myYaxis = acceleration.yAxis,
                        myZaxis = acceleration.zAxis,
                        newAccelerometerData = "";

                    inputX.val(myXaxis);
                    inputY.val(myYaxis);
                    inputZ.val(myZaxis);

                    if (myXaxis > 10 || myXaxis < -10 || myYaxis > 10 || myYaxis < -10 || myZaxis > 10 || myZaxis < -10) {
                        // Increase the value so less shaking is needed to reach a shaking detection
                        shakeValue += 2;
                    }
                    else {
                        if (shakeValue > 0) {
                            shakeValue -= 1;
                        }
                    }

                    newAccelerometerData += '<br>';
                    if (shakeValue > 10) {
                        newAccelerometerData += 'User is shaking? YES';
                    }
                    else {
                        newAccelerometerData += 'User is shaking? NO';
                    }
                    jQuery("#accelerometer-shake-status").html(newAccelerometerData);
                }

                jQuery("#accelerometer-get").unbind().bind("mousedown", function () {
                    try {
                        var pendingOperation = null;

                        pendingOperation = deviceapis.accelerometer.getCurrentAcceleration(updateAcceleration, _errorOcurred);

                        if (pendingOperation != null) {
                            if (confirm("Are you sure want to cancel the operation")) {
                                if (pendingOperation.cancel()) {
                                    alert("pending operation is cancelled");
                                }
                                else {
                                    alert("pending operation can not be cancelled");
                                }
                            }
                        }
                    }
                    catch (e) {
                        _catchException(e);
                    }
                });

                jQuery("#accelerometer-watch").unbind().bind("mousedown", function () {
                    try {
                        if (idWatch != 0)
                            return;
                        idWatch = deviceapis.accelerometer.watchAcceleration(updateAcceleration, _errorOcurred,
                            {minNotificationInterval: 100});
                    }
                    catch (e) {
                        _catchException(e);
                    }
                });

                jQuery("#accelerometer-clear").unbind().bind("mousedown", function () {
                    try {
                        if (idWatch == 0)
                            return;
                        deviceapis.accelerometer.clearWatch(idWatch);
                        idWatch = 0;
                    }
                    catch (e) {
                        _catchException(e);
                    }
                });
            },

            "applications.html": function() {

                var i,
                    appSelect = jQuery("#launchApplicationsSelect"),
                    applications = Widget.Device.getAvailableApplications();

                _setNavBackAndHome();

                for(i = 0; i < applications.length; i++) {
                    appSelect.append($.Utils.createElement("option", {
                        "value": applications[i],
                        "innerText": applications[i]
                    }));
                }

                jQuery("#launchApplicationButton").bind("mousedown", function() {
                    Widget.Device.launchApplication(appSelect.val());
                });

            },

            "infopane.html": function(){
                _setNavBackAndHome();
            },

            "config.html": function(){
                _setNavBackAndHome();
            },

            "orientation.html": function(){
                _setNavBackAndHome();

                var inputAlpha = jQuery("#orientation-alpha"),
                    inputBeta  = jQuery("#orientation-beta"),
                    inputGamma = jQuery("#orientation-gamma"),
                    idWatch = 0,
                    newOrientation = '',
                    oldOrientation = '';

                function updateOrientation(rotation) {
                    azimuth = rotation.alpha;
                    pitch = rotation.beta;
                    roll = rotation.gamma;

                    inputAlpha.val(azimuth);
                    inputBeta.val(pitch);
                    inputGamma.val(roll);

                    if (pitch < -45) {
                        if(pitch > -135)
                            newOrientation = 'Bottom';
                    }
                    else if (pitch > 45) {
                        if (pitch < 135)
                            newOrientation = 'Top';
                    }
                    else if (roll > 45) {
                        newOrientation = 'Right';
                    }
                    else if (roll < -45) {
                        newOrientation = 'Left';
                    }
                    else {
                        newOrientation = 'Flat';
                    }

                    if (newOrientation != oldOrientation) {
                        oldOrientation = newOrientation;
                        jQuery("#orientation-status").html("Current Orientation: " + newOrientation);
                    }
                }

                function captureScreenDimensionChange(width, height) {
                    var message = "JIL :: onScreenChangeDimensions was called. <br />" +
                                    "Width ==> " + width + " Height ==> " + height;
                    _notifyEventWasCalled(message);
                }

                jQuery("#orientation-get").unbind().bind("mousedown", function () {
                    try {
                        var pendingOperation = null;

                        pendingOperation = deviceapis.orientation.getCurrentOrientation(updateOrientation, _errorOcurred);

                        if (pendingOperation != null) {
                            if (confirm("Are you sure want to cancel the operation")) {
                                if (pendingOperation.cancel()) {
                                    alert("pending operation is cancelled");
                                }
                                else {
                                    alert("pending operation can not be cancelled");
                                }
                            }
                        }
                    }
                    catch (e) {
                        _catchException(e);
                    }
                });

                jQuery("#orientation-watch").unbind().bind("mousedown", function () {
                    try {
                        if (idWatch != 0)
                            return;
                        idWatch = deviceapis.orientation.watchOrientation(updateOrientation, _errorOcurred,
                            {minNotificationInterval: 100});
                    }
                    catch (e) {
                        _catchException(e);
                    }
                });

                jQuery("#orientation-clear").unbind().bind("mousedown", function () {
                    try {
                        if (idWatch == 0)
                            return;
                        deviceapis.orientation.clearWatch(idWatch);
                        idWatch = 0;
                    }
                    catch (e) {
                        _catchException(e);
                    }
                });
            },

            "gps.html": function(){

                _setNavBackAndHome();
                    
                if (GBrowserIsCompatible()) {
                    
                    var map = new GMap2(document.getElementById("map_canvas"));

                    map.setUIToDefault();

                    // callback to update map info
                    function updateMap(positionInfo){

                        var point = new GLatLng(positionInfo.latitude, positionInfo.longitude);

                        map.setCenter(point, 13);

                        map.clearOverlays();

                        map.addOverlay(new GMarker(point));

                    }                    

                    // Register for JIL callback
                    Widget.Device.DeviceStateInfo.onPositionRetrieved = updateMap;

                    Widget.Device.DeviceStateInfo.requestPositionInfo("gps");

                    jQuery("#refreshMapButton").bind("mousedown", function () {
                        Widget.Device.DeviceStateInfo.requestPositionInfo("gps");
                    });
                    

                }

            },

            "persistence.html": function(){

                _setNavBackAndHome();
    
                jQuery("#persistenceSaveButton").bind("mousedown", function() {
                    $.Persistence.save(jQuery("#persistenceKey")[0].value, jQuery("#persistenceValue")[0].value);
                    jQuery("#persistenceResult").removeClass("irrelevant");
                });

                jQuery("#persistenceDeleteButton").bind("mousedown", function() {
                    $.Persistence.remove(jQuery("#persistenceKey")[0].value);
                    jQuery("#persistenceResult").removeClass("irrelevant");
                });

            },

            "telephony.html": function(){
                _setNavBackAndHome();

                Widget.Telephony.onCallEvent = function(callType, number) {
                    jQuery("#eventType").text(callType);
                    jQuery("#eventNumber").text(number);

                    jQuery("#telephonyEvent").show('slow');

                    setTimeout(function() {
                        jQuery("#telephonyEvent").hide('slow');
                    }, 5000);
                };

                Widget.Telephony.onCallRecordsFound = function(calls) {
                    var table = jQuery("#telephonySearchResults");

                    if(calls.length > 0) {
                        jQuery("#telephonyResult").show();
                        table.empty();

                        for(var i = 0; i < calls.length; i++) {
                            table.append("<tr><td>{name}</td><td>{number}</td></tr>"
                                 .replace("{name}", calls[i].callRecordName)
                                 .replace("{number}", calls[i].callRecordAddress));
                        }
                    }
                    else {
                        jQuery("#telephonyResult").hide();
                    }


                }

                jQuery("#telephonyCallButton").bind("click", function() {
                    Widget.Telephony.initiateVoiceCall(jQuery("#telephonyNumber").val());
                });

                jQuery("#telephonySearchButton").bind("click", function() {
                    var search = {};

                    if(jQuery("#telephonyName").val()) {
                        search.callRecordName = jQuery("#telephonyName").val();
                    }

                    if(jQuery("#telephonyNumber").val()) {
                        search.callRecordAddress = jQuery("#telephonyNumber").val();
                    }

                    Widget.Telephony.findCallRecords(search);
                });

            },

            "events.html": function() {

                var message = " was fired and successfully captured!";

                _setNavBackAndHome();

                Widget.onMaximize = function() {
                    _notifyEventWasCalled("Widget.onMaximize" + message);
                };
                
                Widget.onWakeup = function() {
                    _notifyEventWasCalled("Widget.onWakeup" + message);
                };
                
                Widget.onFocus = function() {
                    _notifyEventWasCalled("Widget.onFocus" + message);
                };
                
                Widget.onRestore = function() {
                    _notifyEventWasCalled("Widget.onRestore" + message);
                };
                
            }
        };

    // ----- Private Methods -----
    function _notifyEventWasCalled(message) {
        var eventDiv = jQuery("#eventResult"),
            eventResultDiv;

        if (eventDiv.length > 0) {

            eventResultDiv = eventDiv.children("#eventResultInfo");
            eventDiv
                .show(0, function() {
                    eventResultDiv.html(message);
                })
                .delay(5000)
                .hide(0, function() {
                    eventResultDiv.html("");
                });
        }

    }

    // ----- Public Properties -----
    return {

        setUrl: function(url) {
            _baseUrl = url;
        },
 
        getUrl: function() {
            return _baseUrl;
        },
        
        load: function(view){

            return _routes[view] || null;

        },

        clearHistory: function (){
            _history = [];
        },

        // TODO: add other callback in case callee wants to pass a custom callback not in Routes.
        navigate: function (view, params){

            try{

                if(!view){

                    // if im going back I need to remove myself first
                    _history.pop();

                    var lastView = _history.pop();

                    view = (lastView && lastView[0]) || "index.html";
                    params = (lastView && lastView[2]) || null;

                }
                
                var xhr = new XMLHttpRequest(),
                    callback;

                xhr.onreadystatechange = function (){

                    if(this.readyState === 4) {
                        
                        try{

                            $.UI.loadView(this.responseText);

                            callback = $.Routes.load(view);

                            if (callback){
                                callback.apply(null, params);
                            }

                            $.Routes.historyChanged(view, callback, params);
                            
                        }
                        catch (e){
                            $.Exception.handle(e);
                        }

                    }

                };

                xhr.open("GET", _baseUrl + "html/" + view);

                xhr.send(null);
            }
            catch (e){
                $.Exception.handle(e);
            }

        },
        
        historyChanged: function(view, callback, params){
            _history.push([view, callback, params]);
        }

    };

}(Demo, $));
