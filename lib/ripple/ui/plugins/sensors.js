/*
 * Copyright (c) 2010 Epic Train Hack
 * Copyright (c) 2011 Research In Motion Limited
 * Contributors: Wolfram Kriesing, Dan Silivestru, Brent Lintner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var event = require('ripple/event'),
    accelerometer = require('ripple/accelerometer'),
    deviceSettings = require('ripple/deviceSettings'),
    Acceleration = require('ripple/platform/w3c/1.0/Acceleration'),
    Rotation = require('ripple/platform/w3c/1.0/Rotation'),
    sensorSettings = require('ripple/sensorSettings'),
    _oldX, _oldY, _oldAlphaX,
    _camera, _scene, _renderer, _mesh,
    _offsets = {
        x: 0,
        y: 0,
        z: -9.81,
    },
    _flag, // whether the browser supports webGL
    _shape =
        //
        // The front side
        //
        // x, y, z      x, y, z         x, y, z
        // for some strange reason for y -100 is top, 100 is bottom
        "-30,30,10,     30,30,10,       30,60,10,       100,100,100,-1,0;" + // top left, top right, bottom right - of the right triangle
        "-30,30,10,     30,60,10,       -30,60,10,      100,100,100,-1,0;" + // top left, right bottom, left bottom - of the left triangle
        // front side "the phone display"
        "-20,-50,11,    20,-50,11,      20,20,11,       100,100,100,-1,0;" +
        "-20,-50,11,    20,20,11,       -20,20,11,      100,100,100,-1,0;" +
        // below the display
        "-30,30,10,     30,20,10,       30,30,10,       0,0,0,-1,0;" +
        "-30,30,10,     -30,20,10,      30,20,10,       0,0,0,-1,0;" +
        // above the display
        "-30,-60,10,    30,-60,10,      30,-50,10,      0,0,0,-1,0;" +
        "-30,-60,10,    30,-50,10,      -30,-50,10,     0,0,0,-1,0;" +
        // left of the display
        "-30,-50,10,    -20,-50,10,     -20,20,10,      0,0,0,-1,0;" +
        "-30,-50,10,    -20,20,10,      -30,20,10,      0,0,0,-1,0;" +
        // right of the display
        "20,-50,10,     30,-50,10,      30,20,10,       0,0,0,-1,0;" +
        "20,-50,10,     30,20,10,       20,20,10,       0,0,0,-1,0;" +


        // back side, opposite side to the above one
        "-30,-60,-10,   30,60,-10,      30,-60,-10,     0,0,0,-1,0;" +
        "-30,-60,-10,   -30,60,-10,     30,60,-10,      0,00,-1,0;" +
        // right side
        "30,-60,-10,    30,60,-10,      30,60,10,       50,50,80,-1,0;" +
        "30,-60,-10,    30,60,10,       30,-60,10,      50,50,80,-1,0;" +
        // left side
        "-30,-60,-10,   -30,60,10,      -30,60,-10,     50,50,80,-1,0;" +
        "-30,-60,-10,   -30,-60,10,     -30,60,10,      50,50,80,-1,0;" +

        // top
        "30,-60,-10,    -30,-60,10, -30,-60,-10,    50,80,50,-1,0;" +
        "30,-60,-10,    30,-60,10,      -30,-60,10, 50,80,50,-1,0;" +
        // bottom
        "30,60,-10, -30,60,-10,     -30,60,10,      80,50,50,-1,0;" +
        "30,60,-10, -30,60,10,      30,60,10,       80,50,50,-1,0";

function _createThreeDModel() {
    var node,
        shader,
        hemiLight,
        dirLight,
        material,
        uniforms,
        container,
        loader,
        directionalLight,
        isDiffuseTextureLoaded,
        isNormalTextureLoaded,
        shiftKeyDown,
        mouseDown,
        ctrlKeyDown = false;

    if (_flag) {
        // create a 3D phone model with three.js if webGL is supported
        node = document.getElementById("accelerometer-div");
        container = document.createElement("div");
        $("#accelerometer-div").append(container);

        _camera = new THREE.PerspectiveCamera(50, 1.5, 0.1, 100);
        _camera.position.set(4.32823, 3.74714, 2.62985);
        _scene = new THREE.Scene();
        _scene.add(new THREE.AmbientLight(0xffffff));
        directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        _scene.add(directionalLight);
        hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSV(0.6, 0.75, 1);
        hemiLight.groundColor.setHSV(0.095, 0.5, 1);
        hemiLight.position.set(0, 500, 0);
        _scene.add(hemiLight);
        dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSV(0.1, 0.1, 1);
        dirLight.position.set(-1, 1.75, 1);
        dirLight.position.multiplyScalar(50);
        _scene.add(dirLight);
        shader = THREE.ShaderSkin["skin"];
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms["tNormal"].value = THREE.ImageUtils.loadTexture("images/phoneMap_tNormal.png", {}, function () {
            isNormalTextureLoaded = true;
            if (isDiffuseTextureLoaded) {
                _renderer.clear();
                _renderer.render(_scene, _camera);
            }
        });
        uniforms["uNormalScale"].value = 0.75;
        uniforms["tDiffuse"].value = THREE.ImageUtils.loadTexture("images/phoneMap_tDiffuse.png", {}, function () {
            isDiffuseTextureLoaded = true;
            if (isNormalTextureLoaded) {
                _renderer.clear();
                _renderer.render(_scene, _camera);
            }
        });
        uniforms["uDiffuseColor"].value.setHex(0xbbbbbb);
        uniforms["uSpecularColor"].value.setHex(0x070707);
        uniforms["uAmbientColor"].value.setHex(0x111111);
        uniforms["uRoughness"].value = 0.185;
        uniforms["uSpecularBrightness"].value = 0.8;
        material = new THREE.ShaderMaterial({ fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true });
        loader = new THREE.JSONLoader(true);
        document.body.appendChild(loader.statusDomElement);

        loader.load("phoneModel.js", function (geometry) {
            loader.statusDomElement.style.display = "none";
            geometry.computeTangents();
            _mesh = new THREE.Mesh(geometry, material);
            _mesh.position.set(7, 2, -50);
            _mesh.scale.set(18, 12, 18);
            _scene.add(_mesh);
            _renderer.clear();
            _renderer.render(_scene, _camera);
        });

        _renderer = new THREE.WebGLRenderer({antialias: false});
        _renderer.setSize(300, 280);
        _renderer.setClearColorHex(0xffffff, 1);
        _renderer.autoClear = false;

        container.appendChild(_renderer.domElement);
    } else { // create the model with 3d.js
        node = document.querySelector("#accelerometer-canvas");

        jQuery("#accelerometer-div").css("display", "none");
        jQuery("#accelerometer-canvas").css("display", "block");
        ThreeDee.setCenter(150, 100);
        ThreeDee.setLight(-300, -300, 800);
        _updateCanvas(0, 0);
    }

    //change accelerometer and phone by moving the mouse and the key "shift"
    node.addEventListener("mousemove", function (event) {
        var cosX, sinX, cosY, sinY,
            alpha = accelerometer.getInfo().orientation.alpha,
            beta = accelerometer.getInfo().orientation.beta,
            gamma = accelerometer.getInfo().orientation.gamma,
            x = accelerometer.getInfo().acceleration.x,
            y = accelerometer.getInfo().acceleration.y,
            z = accelerometer.getInfo().acceleration.z;

        if (!mouseDown) {
            return;
        }

        // if the shift key is pressed down, only the alpha value will be chagned
        if (!shiftKeyDown) {
            _offsets.x = (_offsets.x + _oldX - event.offsetX) % 360;
            _offsets.y = (_offsets.y + _oldY - event.offsetY) % 360;

            alpha = alpha || 0;

            // enforce gamma in [-90,90] as per w3c spec
            gamma = -_offsets.x;
            if (gamma < -90) {
                gamma = -90;
            }
            if (gamma > 90) {
                gamma = 90;
            }

            // enforce beta in [-180,180] as per w3c spec
            beta = -_offsets.y % 360;
            if (beta < -180) {
                beta += 360;
            }
            else if (beta >= 180) {
                beta -= 360;
            }

            cosX = Math.cos(gamma * (Math.PI / 180));
            sinX = Math.sin(gamma * (Math.PI / 180));
            cosY = Math.cos(beta * (Math.PI / 180));
            sinY = Math.sin(beta * (Math.PI / 180));
            x = 9.81 * cosY * sinX;
            y = -9.81 * sinY;
            z = -9.81 * cosY * cosX;

        } else {
            alpha = (alpha - (_oldAlphaX - event.offsetX) * 2.5) % 360;
        }
        _oldX = event.offsetX;
        _oldY = event.offsetY;
        _oldAlphaX = event.offsetX;
        if (_flag)
            _updatePhoneModel(alpha, beta, gamma);
        else
            _updateCanvas(alpha, -beta, gamma);
        accelerometer.setInfo({
            x: x,
            y: y,
            z: z,
            alpha: alpha,
            beta: beta,
            gamma: gamma
        });
    }, false);

    node.addEventListener("mousedown", function (e) {
        mouseDown = true;
        _oldX = e.offsetX;
        _oldY = e.offsetY;
        if (shiftKeyDown) {
            _oldAlphaX = _oldX;
        }
    });

    node.addEventListener("mouseup", function () {
        mouseDown = false;
    });

    document.addEventListener("mouseup", function () {
        //Catch mouseup events that fire when outside canvas bounds
        mouseDown = false;
    });

    document.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
        case 16:                // Shift Key
            shiftKeyDown = true;
            break;
        case 17:                // Ctrl Key
            ctrlKeyDown = true;
            break;
        case 74:                // J Key
            if (shiftKeyDown && ctrlKeyDown) { //if shift+ctrl+j keydown in the meantime, console comes up rather than shift key down
                shiftKeyDown = false;
                ctrlKeyDown = false;
            }
            break;
        }
    });

    document.addEventListener("keyup", function (e) {
        if (e.keyCode === 16) { // Shift Key
            shiftKeyDown = false;
        }
    });
}

// update the 3d model created by 3d.js
function _updateCanvas(a, b, g) {
    ThreeDee.loadMesh(_shape);
    g = g || 0;
    ThreeDee.rotate(0, g, 0);
    ThreeDee.rotate(b, 0, a);
    ThreeDee.backface();
    ThreeDee.shade();
    ThreeDee.zSort();
    Draw.initialize(document.querySelector("#accelerometer-canvas"));
    Draw.clear(0, 0, 480, 300);
    Draw.drawScene(ThreeDee.getTranslation(), 3);
}

// update the 3d model created by three.js
function _updatePhoneModel(a, b, g) {
    _mesh.rotation.x = b / 90 * 1.5;
    _mesh.rotation.y = g / 90 * 1.5;
    _mesh.rotation.z = a / 90 * 1.5;
    _renderer.clear();
    _renderer.render(_scene, _camera);
}

function _resetAccelerometer() {
    _oldX = 0;
    _oldY = 0;
    _oldAlphaX = 0;
    _offsets = {
        x: 0,
        y: 0,
        z: -9.81
    };
    if (_flag) {
        _mesh.rotation.x = 0;
        _mesh.rotation.y = 0;
        _mesh.rotation.z = 0;
        _renderer.clear();
        _renderer.render(_scene, _camera);
    } else {
        _updateCanvas(0, 0);
    }

    accelerometer.setInfo({
        acceleration: new Acceleration(0, 0, 0),
        accelerationIncludingGravity: new Acceleration(0, 0, -9.81),
        rotationRate: new Rotation(0, 0, 0),
        orientation: new Rotation(0, 0, 0),
        timestamp: new Date().getTime()
    });
    accelerometer.triggerEvent();
}

function _resetMagneticField() {
    jQuery("#magnetic-x").val("100");
    jQuery("#magnetic-y").val("100");
    jQuery("#magnetic-z").val("100");
}

function _resetLightLevel() {
    $("#display-state").children().each(function() {
        if ($(this).val() === "OFF") {
            $(this).attr("selected", "true");
            this.selected = true;
        }
        else {
            $(this).attr("selected", "false");
            this.selected = false;
        }
    });
}


// set a typical mode for accelerometer simulation, when the phone drops,
// x will become to be 0, y will become to be -9.81 and z will become to be 0
function _setDrop() {
    //duration = 20 * 50 = 1000ms. 20 is ths number of steps and 50 is the duration of steps.
    var alpha = Number(accelerometer.getInfo().orientation.alpha),
        beta = Number(accelerometer.getInfo().orientation.beta),
        gamma = Number(accelerometer.getInfo().orientation.gamma),
        cosX, cosY, sinX, sinY, x, y, z,
        alphaStep = Math.abs(alpha) / 20,
        betaStep = Math.abs(beta - 90) / 20,
        gammaStep = Math.abs(gamma) / 20,
        counts = 0, dropTimeout,
        drop = function () {
            if (counts >= 20) {
                window.clearTimeout(dropTimeout);
                // to avoid showing "-0" or "-0.00"
                if (_flag)
                    _updatePhoneModel(0, 90, 0);
                else
                    _updateCanvas(0, -90, 0);
                accelerometer.setInfo({
                    x: 0,
                    y: -9.81,
                    z: 0,
                    alpha: 0,
                    beta: 90,
                    gamma: 0
                });
            } else {
                dropTimeout = setTimeout(drop, 50);
                step();
                counts++;
            }
        },
        step = function () {
            var _beta;

            alpha = alpha > 0 ? alpha - alphaStep : alpha + alphaStep;
            beta = beta > 90 ? beta - betaStep : beta + betaStep;
            gamma = gamma > 0 ? gamma - gammaStep : gamma + gammaStep;
            _beta = _flag ? beta + betaStep : -(beta + betaStep);
            if (_flag)
                _updatePhoneModel(alpha, _beta, gamma);
            else
                _updateCanvas(alpha, _beta, gamma);

            cosX = Math.cos(gamma * (Math.PI / 180));
            sinX = Math.sin(gamma * (Math.PI / 180));
            cosY = Number(Math.cos(beta * (Math.PI / 180)).toFixed(6));
            sinY = Math.sin(beta * (Math.PI / 180));
            x = 9.81 * cosY * sinX;
            y = -9.81 * sinY;
            z = -9.81 * cosY * cosX;
            accelerometer.setInfo({
                x: x,
                y: y,
                z: z,
                alpha: alpha,
                beta: beta,
                gamma: gamma
            });
            _offsets.x = -gamma;
            _offsets.y = -beta;
        };

    drop();
}

function _initializeSensorSettings() {
    var sensorsInputID = ["accelerometer-alpha", "accelerometer-beta", "accelerometer-gamma", "magnetic-x", "magnetic-y", "magnetic-z"],
        magneticEvent = ["MagneticField-xChanged", "MagneticField-yChanged", "MagneticField-zChanged"],
         magneticData = ["MagneticField.x", "MagneticField.y", "MagneticField.z"],
        oldValue, oldInputX,
        inputMouseDown,
        triggerFunction,
        selectedInputID = null;

    triggerFunction = function (val, index) {
        var cosX, cosY, sinX, sinY, x, y, z,
            alpha = accelerometer.getInfo().orientation.alpha,
            beta = accelerometer.getInfo().orientation.beta,
            gamma = accelerometer.getInfo().orientation.gamma;

        //choose which value to change according to index
        switch (index) {
        case 0:
            alpha = val;
            break;
        case 1:
            beta = val;
            break;
        case 2:
            gamma = val;
            break;
        default:
            sensorSettings.persist(magneticData[index - 3], val);
            event.trigger(magneticEvent[index - 3], [val]);
        }

        //change the phone model and values of other inputs when changing a value of input
        if (_flag)
            _updatePhoneModel(alpha, beta, gamma);
        else
            _updateCanvas(alpha, -beta, gamma);
        cosX = Math.cos(gamma * (Math.PI / 180));
        sinX = Math.sin(gamma * (Math.PI / 180));
        cosY = Math.cos(beta * (Math.PI / 180));
        sinY = Math.sin(beta * (Math.PI / 180));
        x = 9.81 * cosY * sinX;
        y = -9.81 * sinY;
        z = -9.81 * cosY * cosX;
        accelerometer.setInfo({
            x: x,
            y: y,
            z: z,
            alpha: alpha,
            beta: beta,
            gamma: gamma
        });
        _offsets.x = -gamma;
        _offsets.y = -beta;
    };

    // make the input elements more powful: drag mouse to left to decrease the value and right to increase it;
    // also change the value with arrow keys.


    sensorsInputID.forEach(function (id, index) {
        jQuery("#" + id).mousedown(function (e) {
            selectedInputID = id;
            oldValue = parseInt(this.value, 10);
            oldInputX = e.offsetX;
            inputMouseDown = true;
        });

        jQuery("#" + id).mousemove(function (e) {
            if (inputMouseDown && (selectedInputID !== null)) {
                jQuery("#" + selectedInputID).val(parseInt(oldValue + (e.offsetX - oldInputX) / 2, 10));
                if (parseInt(this.value, 10) <= parseInt(jQuery(this).attr("minValue"), 10)) {
                    this.value = jQuery(this).attr("minValue");
                }
                if (parseInt(this.value, 10) >= parseInt(jQuery(this).attr("maxValue"), 10)) {
                    this.value = jQuery(this).attr("maxValue");
                }
                triggerFunction(this.value, index);
            }
        });

        jQuery("#" + id).mouseup(function () {
            selectedInputID = null;
            inputMouseDown = false;
        });
        jQuery(document).mouseup(function () {
            selectedInputID = null;
            inputMouseDown = false;
        });

        jQuery("#" + id).click(function () {
            this.select();
        });

        jQuery("#" + id).blur(function () {
            if (isNaN(this.value)) {
                this.value = 0;
            }
            else if (parseInt(this.value, 10) > parseInt(jQuery(this).attr("maxValue"), 10))
                this.value = jQuery(this).attr("maxValue");
            else if (parseInt(this.value, 10) < parseInt(jQuery(this).attr("minValue"), 10))
                this.value = jQuery(this).attr("minValue");
            else
                this.value = parseInt(this.value, 10);
            triggerFunction(this.value, index);
        });

        jQuery("#" + id).keydown(function (e) {
            switch (e.keyCode) {
            case 38:
                if (parseInt(this.value, 10) < parseInt(jQuery(this).attr("maxValue"), 10)) {
                    this.value = parseInt(this.value, 10) + 1;
                    triggerFunction(this.value, index);
                }
                break;
            case 40:
                if (parseInt(this.value, 10) > parseInt(jQuery(this).attr("minValue"), 10)) {
                    this.value = parseInt(this.value, 10) - 1;
                    triggerFunction(this.value, index);
                }
                break;
            default:
                return;
            }
        });
    });
}

/*
//initialize light settings
function _initializeLightSettings() {
    var displayObj = document.getElementById("display-state"),
        DISPLAY_STATE  = require('ripple/constants').POWER_RESOURCE.SCREEN.STATE,
        brightness;

    displayObj.addEventListener("change", function () {
        var state = displayObj.value, value;
        value = DISPLAY_STATE[state].VALUE;
        deviceSettings.persist("Display.brightness", value);
        event.trigger("DisplayBrightnessChanged", [value]);
    });

    brightness = deviceSettings.retrieve("Display.brightness");
    if (brightness ===  DISPLAY_STATE.SCREEN_OFF.MAX) {
        displayObj.options[0].selected = true;
    } else if (brightness <= DISPLAY_STATE.SCREEN_DIM.MAX) {
        displayObj.options[1].selected = true;
    } else if (brightness <= DISPLAY_STATE.SCREEN_NORMAL.MAX) {
        displayObj.options[2].selected = true;
    } else {
        displayObj.options[3].selected = true;
    }
}
*/

module.exports = {
    panel: {
        domId: "sensors-container",
        collapsed: true,
        pane: "left",
        titleName: "Sensors",
        display: true
    },
    initialize: function () {
        var gl,
            testCanvas = document.getElementById("accelerometer-canvas");

        try { // check whether the browser supports webGL, returns null if not support
            gl = testCanvas.getContext("experimental-webgl");
            gl.viewport(0, 0, testCanvas.width, testCanvas.height);
        } catch (e) {
            console.log("unsupport webgl");
        }

        _flag = gl ? true : false;

        accelerometer.init();
        _createThreeDModel();
        _initializeSensorSettings();
        //_initializeLightSettings();

        jQuery("#accelerometer-shake").click(function () {
            window.setTimeout(require('ripple/ui/plugins/goodVibrations').shakeDevice(8), 1);
            accelerometer.shake();
        });

        jQuery("#sensor-reset-all").click(function () {
            _resetAccelerometer();
            _resetMagneticField();
            _resetLightLevel();
        });

        jQuery("#accelerometer-drop").click(_setDrop);

        event.on("AccelerometerInfoChangedEvent", function (motion) {
            jQuery("#accelerometer-x").html(motion.accelerationIncludingGravity.x.toFixed(2));
            jQuery("#accelerometer-y").html(motion.accelerationIncludingGravity.y.toFixed(2));
            jQuery("#accelerometer-z").html(motion.accelerationIncludingGravity.z.toFixed(2));
            jQuery("#accelerometer-alpha").val(Number(motion.orientation.alpha).toFixed(2));
            jQuery("#accelerometer-beta").val(Number(motion.orientation.beta).toFixed(2));
            jQuery("#accelerometer-gamma").val(Number(motion.orientation.gamma).toFixed(2));
        }, this);
    }
};
