'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var sunGeometry = null; // this will be created after loading from a file
var earthGeometry = null;
var moonGeometry = null;
var groundGeometry = null;
var topGeometry = null;
var backGeometry = null;
var frontGeometry = null;
var leftGeometry = null;
var rightGeometry = null;

var projectionMatrix = new Matrix4();
var lightPosition = new Vector3();
var earthPosition = new Vector3();
var moonPosition = new Vector3();

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var basicColorProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    vertexColorVS: null, vertexColorFS: null,
    sphereJSON: null,
    skyNegX: null,
    skyPosX: null,
    skyNegY: null,
    skyPosY: null,
    skyNegZ: null,
    skyPosZ: null,
    sunImage: null,
    mercuryImage: null,
    venusImage: null,
    eathImage: null,
    marsImage: null,
    jupiterImage: null,
    saturnImage: null,
    uranusImage: null,
    neptuneImage: null,
    moonImage: null
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/GalaxyTex_NegativeX.png'),
        loadImage('./data/GalaxyTex_PositiveX.png'),
        loadImage('./data/GalaxyTex_NegativeY.png'),
        loadImage('./data/GalaxyTex_PositiveY.png'),
        loadImage('./data/GalaxyTex_NegativeZ.png'),
        loadImage('./data/GalaxyTex_PositiveZ.png'),
        loadImage('./data/2k_sun.jpg'),
        loadImage('./data/2k_mercury.jpg'),
        loadImage('./data/2k_venus.jpg'),
        loadImage('./data/2k_earth_daymap.jpg'),
        loadImage('./data/2k_mars.jpg'),
        loadImage('./data/2k_jupiter.jpg'),
        loadImage('./data/2k_saturn.jpg'),
        loadImage('./data/2k_uranus.jpg'),
        loadImage('./data/2k_neptune.jpg'),
        loadImage('./data/2k_moon.jpg')
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.vertexColorVS = values[2];
        loadedAssets.vertexColorFS = values[3];
        loadedAssets.sphereJSON = values[4];
        loadedAssets.skyNegX = values[5];
        loadedAssets.skyPosX = values[6];
        loadedAssets.skyNegY = values[7];
        loadedAssets.skyPosY = values[8];
        loadedAssets.skyNegZ = values[9];
        loadedAssets.skyPosZ = values[10];
        loadedAssets.sunImage = values[11];
        loadedAssets.mercuryImage = values[12];
        loadedAssets.venusImage = values[13];
        loadedAssets.earthImage = values[14];
        loadedAssets.marsImage = values[15];
        loadedAssets.jupiterImage = values[16];
        loadedAssets.saturnImage = values[17];
        loadedAssets.uranusImage = values[18];
        loadedAssets.neptuneImage = values[19];
        loadedAssets.moonImage = values[20];
    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
    };

    basicColorProgram = createCompiledAndLinkedShaderProgram(loadedAssets.vertexColorVS, loadedAssets.vertexColorFS);
    gl.useProgram(basicColorProgram);

    basicColorProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(basicColorProgram, "aVertexPosition"),
        vertexColorsAttribute: gl.getAttribLocation(basicColorProgram, "aVertexColor"),
    };

    basicColorProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(basicColorProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(basicColorProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(basicColorProgram, "uProjectionMatrix"),
        colorUniform: gl.getUniformLocation(basicColorProgram, "uColor")
    };
}

// -------------------------------------------------------------------------
function createScene() {
    //floor
    groundGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    groundGeometry.create(loadedAssets.skyNegZ);
    var scale = new Matrix4().makeScale(60.0, 60.0, 60.0);
    // compensate for the model being flipped on its side
    var rotation = new Matrix4().makeRotationX(-90);
    var translation = new Matrix4().makeTranslation(0, 0, -30);
    groundGeometry.worldMatrix.makeIdentity();
    groundGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);
    //top
    topGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    topGeometry.create(loadedAssets.skyPosZ);
    var scale = new Matrix4().makeScale(60.0, 60.0, 60.0);
    // compensate for the model being flipped on its side
    var rotation = new Matrix4().makeRotationX(-90);
    var translation = new Matrix4().makeTranslation(0, 0, 30);
    topGeometry.worldMatrix.makeIdentity();
    topGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);
    //back wall
    backGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    backGeometry.create(loadedAssets.skyPosX);
    var scale = new Matrix4().makeScale(60.0, 60.0, 60.0);
    // compensate for the model being flipped on its side
    //var rotation = new Matrix4().makeRotationX(90);
    var translation = new Matrix4().makeTranslation(0, 0, -30);
    backGeometry.worldMatrix.makeIdentity();
    backGeometry.worldMatrix.multiply(translation).multiply(scale);
    //front wall
    frontGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    frontGeometry.create(loadedAssets.skyNegX);
    var scale = new Matrix4().makeScale(60.0, 60.0, 60.0);
    // compensate for the model being flipped on its side
    //var rotation = new Matrix4().makeRotationX(90);
    var translation = new Matrix4().makeTranslation(0, 0, 30);
    frontGeometry.worldMatrix.makeIdentity();
    frontGeometry.worldMatrix.multiply(translation).multiply(scale);
    //left wall
    leftGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    leftGeometry.create(loadedAssets.skyNegX);
    var scale = new Matrix4().makeScale(60.0, 60.0, 60.0);
    // compensate for the model being flipped on its side
    var rotation = new Matrix4().makeRotationY(90);
    var translation = new Matrix4().makeTranslation(0, 0, -30);
    leftGeometry.worldMatrix.makeIdentity();
    leftGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);
    //right wall
    rightGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    rightGeometry.create(loadedAssets.skyNegX);
    var scale = new Matrix4().makeScale(60.0, 60.0, 60.0);
    // compensate for the model being flipped on its side
    var rotation = new Matrix4().makeRotationY(-90);
    var translation = new Matrix4().makeTranslation(0, 0, -30);
    rightGeometry.worldMatrix.makeIdentity();
    rightGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);

    sunGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    sunGeometry.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    // Scaled it down so that the diameter is 3
    var scale = new Matrix4().makeScale(0.03, 0.03, 0.03);
    // raise it by the radius to make it sit on the ground
    var translation = new Matrix4().makeTranslation(0, 1.5, 0);
    //SUN LIGHT
    sunGeometry.worldMatrix.makeIdentity();
    sunGeometry.worldMatrix.multiply(translation).multiply(scale);
    //EARTH
    earthGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    earthGeometry.create(loadedAssets.sphereJSON, loadedAssets.earthImage);
    var earthScale = new Matrix4().makeScale(0.025, 0.025, 0.025);
    earthGeometry.worldMatrix.makeIdentity().multiply(earthScale);
    //MOON
    moonGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    moonGeometry.create(loadedAssets.sphereJSON, loadedAssets.moonImage);
    var moonScale = new Matrix4().makeScale(0.05, 0.05, 0.05);
    moonGeometry.worldMatrix.makeIdentity().multiply(moonScale);
}

// -------------------------------------------------------------------------
function createMoonMatrix(moonRotationAngle, offsetFromEarth, earthWorldMatrix) {
    var moonMatrix = new Matrix4();
    var translation = new Matrix4().makeTranslation(offsetFromEarth);
    var rotation = new Matrix4().makeRotationZ(moonRotationAngle);
    var temp = rotation.multiply(translation);
    moonMatrix = earthWorldMatrix.multiply(temp);
    return moonMatrix;
}
// ----------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    time.update();
    camera.update(time.deltaTime);

    var cosTime = Math.cos(time.secondsElapsedSinceStart);
    var sinTime = Math.sin(time.secondsElapsedSinceStart);

    // special case rotation where the vector is along the x-axis (4, 0)
    var earthDistance = 8;

    var rotation = new Matrix4().makeRotationY(0.1);
    sunGeometry.worldMatrix.multiply(rotation);

    earthPosition.x = cosTime * earthDistance;
    earthPosition.y = 1.5;
    earthPosition.z = sinTime * earthDistance;
    // lightPosition.x = cosTime * earthDistance;
    // lightPosition.y = 1.5;
    // lightPosition.z = sinTime * earthDistance;

    rotation = new Matrix4().makeRotationY(-time.secondsElapsedSinceStart);
    earthGeometry.worldMatrix.multiply(rotation);
    earthGeometry.worldMatrix.elements[3] = earthPosition.x;
    earthGeometry.worldMatrix.elements[7] = earthPosition.y;
    earthGeometry.worldMatrix.elements[11] = earthPosition.z;

    //earth done now moon
    var moonDistance = 4;

    //var temp = createMoonMatrix(1, new Vector4(0, 3, 0, 1), earthGeometry.worldMatrix);

    
    // moonGeometry.worldMatrix.elements[3] = temp.x;
    // moonGeometry.worldMatrix.elements[7] = temp.y;
    // moonGeometry.worldMatrix.elements[11] = temp.z;

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(phongShaderProgram);
    var uniforms = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();
    gl.uniform3f(uniforms.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);
    groundGeometry.render(camera, projectionMatrix, phongShaderProgram);
    topGeometry.render(camera, projectionMatrix, phongShaderProgram);
    backGeometry.render(camera, projectionMatrix, phongShaderProgram);
    frontGeometry.render(camera, projectionMatrix, phongShaderProgram);
    leftGeometry.render(camera, projectionMatrix, phongShaderProgram);
    rightGeometry.render(camera, projectionMatrix, phongShaderProgram);
    
    sunGeometry.render(camera, projectionMatrix, phongShaderProgram);
    moonGeometry.render(camera, projectionMatrix, phongShaderProgram);

    gl.useProgram(basicColorProgram);
    gl.uniform4f(basicColorProgram.uniforms.colorUniform, 1.0, 1.0, 1.0, 1.0);
    earthGeometry.render(camera, projectionMatrix, phongShaderProgram);
}
