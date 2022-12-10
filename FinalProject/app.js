'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var sunGeometry = null; // this will be created after loading from a file
var earthGeometry = null;
var moonGeometry = null;
var mercuryGeometry = null;
var venusGeometry = null;
var marsGeometry = null;
var jupiterGeometry = null;
var saturnGeometry = null;
var uranusGeometry = null;
var neptuneGeometry = null;
var groundGeometry = null;
var topGeometry = null;
var backGeometry = null;
var frontGeometry = null;
var leftGeometry = null;
var rightGeometry = null;

var projectionMatrix = new Matrix4();
var lightPosition = new Vector3();
var mercuryPosition = new Vector3();
var venusPosition = new Vector3();
var earthPosition = new Vector3();
var moonPosition = new Vector3();
var marsPosition = new Vector3();
var jupiterPosition = new Vector3();
var saturnPosition = new Vector3();
var uranusPosition = new Vector3();
var neptunePosition = new Vector3();

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
    var scale = new Matrix4().makeScale(120.0, 120.0, 120.0);
    // compensate for the model being flipped on its side
    var rotation = new Matrix4().makeRotationX(-90);
    var translation = new Matrix4().makeTranslation(0, 0, -120);
    groundGeometry.worldMatrix.makeIdentity();
    groundGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);
    //top
    topGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    topGeometry.create(loadedAssets.skyPosZ);
    var rotation = new Matrix4().makeRotationX(-90);
    var translation = new Matrix4().makeTranslation(0, 0, 120);
    topGeometry.worldMatrix.makeIdentity();
    topGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);
    //back wall
    backGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    backGeometry.create(loadedAssets.skyPosX);
    var translation = new Matrix4().makeTranslation(0, 0, -120);
    backGeometry.worldMatrix.makeIdentity();
    backGeometry.worldMatrix.multiply(translation).multiply(scale);
    //front wall
    frontGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    frontGeometry.create(loadedAssets.skyNegX);
    var translation = new Matrix4().makeTranslation(0, 0, 120);
    frontGeometry.worldMatrix.makeIdentity();
    frontGeometry.worldMatrix.multiply(translation).multiply(scale);
    //left wall
    leftGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    leftGeometry.create(loadedAssets.skyNegX);
    var rotation = new Matrix4().makeRotationY(90);
    var translation = new Matrix4().makeTranslation(0, 0, -120);
    leftGeometry.worldMatrix.makeIdentity();
    leftGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);
    //right wall
    rightGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    rightGeometry.create(loadedAssets.skyNegX);
    var rotation = new Matrix4().makeRotationY(-90);
    var translation = new Matrix4().makeTranslation(0, 0, -120);
    rightGeometry.worldMatrix.makeIdentity();
    rightGeometry.worldMatrix.multiply(rotation).multiply(translation).multiply(scale);

    //SUN LIGHT
    sunGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    sunGeometry.create(loadedAssets.sphereJSON, loadedAssets.sunImage);
    var scale = new Matrix4().makeScale(0.08, 0.08, 0.08);
    var translation = new Matrix4().makeTranslation(0, 1.5, 0);
    sunGeometry.worldMatrix.makeIdentity();
    sunGeometry.worldMatrix.multiply(translation).multiply(scale);
    //EARTH
    earthGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    earthGeometry.create(loadedAssets.sphereJSON, loadedAssets.earthImage);
    var earthScale = new Matrix4().makeScale(0.025, 0.025, 0.025);
    var rotate = new Matrix4().makeRotationZ(23);
    earthGeometry.worldMatrix.makeIdentity().multiply(earthScale).multiply(rotate);
    //MOON
    moonGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    moonGeometry.create(loadedAssets.sphereJSON, loadedAssets.moonImage);
    var moonScale = new Matrix4().makeScale(0.008, 0.008, 0.008);
    moonGeometry.worldMatrix = moonGeometry.worldMatrix.multiply(earthGeometry.worldMatrix);
    moonGeometry.worldMatrix.makeIdentity().multiply(moonScale);
    //mercury
    mercuryGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    mercuryGeometry.create(loadedAssets.sphereJSON, loadedAssets.mercuryImage);
    var mercuryScale = new Matrix4().makeScale(0.01, 0.01, 0.01);
    mercuryGeometry.worldMatrix.makeIdentity().multiply(mercuryScale);
    //venus
    venusGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    venusGeometry.create(loadedAssets.sphereJSON, loadedAssets.venusImage);
    //var mercuryScale = new Matrix4().makeScale(0.01, 0.01, 0.01);
    var rotate = new Matrix4().makeRotationZ(177);
    venusGeometry.worldMatrix.makeIdentity().multiply(earthScale).multiply(rotate);
    //mars
    marsGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    marsGeometry.create(loadedAssets.sphereJSON, loadedAssets.marsImage);
    var rotate = new Matrix4().makeRotationZ(25);
    var marsScale = new Matrix4().makeScale(0.012, 0.012, 0.012);
    marsGeometry.worldMatrix.makeIdentity().multiply(marsScale).multiply(rotate);
    //jupiter
    jupiterGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    jupiterGeometry.create(loadedAssets.sphereJSON, loadedAssets.jupiterImage);
    // ringGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    // ringGeometry.create(loadedAssets.sphereJSON, loadedAssets.jupiterImage);
    var jupiterScale = new Matrix4().makeScale(0.05, 0.05, 0.05);
    jupiterGeometry.worldMatrix.makeIdentity().multiply(jupiterScale);
    //saturn
    saturnGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    saturnGeometry.create(loadedAssets.sphereJSON, loadedAssets.saturnImage);
    var rotate = new Matrix4().makeRotationZ(27);
    var saturnScale = new Matrix4().makeScale(0.045, 0.045, 0.045);
    saturnGeometry.worldMatrix.makeIdentity().multiply(saturnScale).multiply(rotate);
    //uranus
    uranusGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    uranusGeometry.create(loadedAssets.sphereJSON, loadedAssets.uranusImage);
    var rotate = new Matrix4().makeRotationZ(97);
    var uranusScale = new Matrix4().makeScale(0.035, 0.035, 0.035);
    uranusGeometry.worldMatrix.makeIdentity().multiply(uranusScale).multiply(rotate);
    //neptune
    neptuneGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    neptuneGeometry.create(loadedAssets.sphereJSON, loadedAssets.neptuneImage);
    var rotate = new Matrix4().makeRotationZ(28);
    var neptuneScale = new Matrix4().makeScale(0.035, 0.035, 0.035);
    neptuneGeometry.worldMatrix.makeIdentity().multiply(neptuneScale).multiply(rotate);

}

// -------------------------------------------------------------------------
function createEarthMatrix(angleZ, position) {
    var translation = new Matrix4().makeTranslation(position);
    var rotation = new Matrix4().makeRotationZ(angleZ);
    return rotation.multiply(translation);
  }
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

    

    var rotation = new Matrix4().makeRotationY(0.03);
    sunGeometry.worldMatrix.multiply(rotation);
    //mercury
    var cosTime = Math.cos(time.secondsElapsedSinceStart * 1.6);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 1.6);
    var rotation = new Matrix4().makeRotationY(0.01);
    mercuryGeometry.worldMatrix.multiply(rotation);
    var mercuryDistance = 5;
    mercuryPosition.x = cosTime * mercuryDistance;
    mercuryPosition.y = 1.5;
    mercuryPosition.z = sinTime * mercuryDistance;
    mercuryGeometry.worldMatrix.elements[3] = mercuryPosition.x;
    mercuryGeometry.worldMatrix.elements[7] = mercuryPosition.y;
    mercuryGeometry.worldMatrix.elements[11] = mercuryPosition.z; 
    //venus
    var cosTime = Math.cos(time.secondsElapsedSinceStart * 1.2);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 1.2);
    var venusDistance = mercuryDistance+2;
    venusPosition.x = cosTime * venusDistance;
    venusPosition.y = 1.5;
    venusPosition.z = sinTime * venusDistance;
    venusGeometry.worldMatrix.elements[3] = venusPosition.x;
    venusGeometry.worldMatrix.elements[7] = venusPosition.y;
    venusGeometry.worldMatrix.elements[11] = venusPosition.z; 
    //earth
    var cosTime = Math.cos(time.secondsElapsedSinceStart);
    var sinTime = Math.sin(time.secondsElapsedSinceStart);
    var rotation = new Matrix4().makeRotationY(1);
    earthGeometry.worldMatrix.multiply(rotation);
    var earthDistance = venusDistance+3;
    earthPosition.x = cosTime * earthDistance;
    earthPosition.y = 1.5;
    earthPosition.z = sinTime * earthDistance;
    earthGeometry.worldMatrix.elements[3] = earthPosition.x;
    earthGeometry.worldMatrix.elements[7] = earthPosition.y;
    earthGeometry.worldMatrix.elements[11] = earthPosition.z;
    //earth done now moon
    var cosTime = Math.cos(time.secondsElapsedSinceStart * 2);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 2);
    var moonDistance = 2;
    moonPosition.x = cosTime * moonDistance;
    moonPosition.y = 1.5;
    moonPosition.z = sinTime * moonDistance;
    moonGeometry.worldMatrix.elements[3] = earthPosition.x + moonPosition.x;
    // moonGeometry.worldMatrix.elements[3] = moonPosition.x;

    moonGeometry.worldMatrix.elements[7] = moonPosition.y;
    moonGeometry.worldMatrix.elements[11] = earthPosition.z + moonPosition.z;
    // moonGeometry.worldMatrix.elements[11] = moonPosition.z;

    //mars
    var cosTime = Math.cos(time.secondsElapsedSinceStart * 0.5);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 0.5);
    marsGeometry.worldMatrix.multiply(rotation);
    var marsDistance = earthDistance+4;
    marsPosition.x = cosTime * marsDistance;
    marsPosition.y = 1.5;
    marsPosition.z = sinTime * marsDistance;
    marsGeometry.worldMatrix.elements[3] = marsPosition.x;
    marsGeometry.worldMatrix.elements[7] = marsPosition.y;
    marsGeometry.worldMatrix.elements[11] = marsPosition.z; 
    //jupiter
    var cosTime = Math.cos(time.secondsElapsedSinceStart * 0.3);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 0.3);
    var rotation = new Matrix4().makeRotationY(2.3);
    jupiterGeometry.worldMatrix.multiply(rotation);
    var jupiterDistance = marsDistance + 4.5;
    jupiterPosition.x = cosTime * jupiterDistance;
    jupiterPosition.y = 1.5;
    jupiterPosition.z = sinTime * jupiterDistance;
    jupiterGeometry.worldMatrix.elements[3] = jupiterPosition.x;
    jupiterGeometry.worldMatrix.elements[7] = jupiterPosition.y;
    jupiterGeometry.worldMatrix.elements[11] = jupiterPosition.z; 
    //saturn
    var cosTime = Math.cos(time.secondsElapsedSinceStart * 0.2);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 0.2);
    var rotation = new Matrix4().makeRotationY(2.1);
    saturnGeometry.worldMatrix.multiply(rotation);
    var saturnDistance = jupiterDistance+6;
    saturnPosition.x = cosTime * saturnDistance;
    saturnPosition.y = 1.5;
    saturnPosition.z = sinTime * saturnDistance;
    saturnGeometry.worldMatrix.elements[3] = saturnPosition.x;
    saturnGeometry.worldMatrix.elements[7] = saturnPosition.y;
    saturnGeometry.worldMatrix.elements[11] = saturnPosition.z; 
    //uranus
    var cosTime = Math.cos(time.secondsElapsedSinceStart * 0.1);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 0.1);
    var rotation = new Matrix4().makeRotationY(1.3);
    uranusGeometry.worldMatrix.multiply(rotation);
    var uranusDistance = saturnDistance+5;
    uranusPosition.x = cosTime * uranusDistance;
    uranusPosition.y = 1.5;
    uranusPosition.z = sinTime * uranusDistance;
    uranusGeometry.worldMatrix.elements[3] = uranusPosition.x;
    uranusGeometry.worldMatrix.elements[7] = uranusPosition.y;
    uranusGeometry.worldMatrix.elements[11] = uranusPosition.z; 
    //neptune
    var cosTime = Math.cos(time.secondsElapsedSinceStart * 0.05);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 0.05);
    var rotation = new Matrix4().makeRotationY(1.4);
    uranusGeometry.worldMatrix.multiply(rotation);
    var neptuneDistance = uranusDistance+4;
    neptunePosition.x = cosTime * neptuneDistance;
    neptunePosition.y = 1.5;
    neptunePosition.z = sinTime * neptuneDistance;
    neptuneGeometry.worldMatrix.elements[3] = neptunePosition.x;
    neptuneGeometry.worldMatrix.elements[7] = neptunePosition.y;
    neptuneGeometry.worldMatrix.elements[11] = neptunePosition.z; 

    //var translation = new Matrix4().makeTranslation(earthPosition);
    //earthGeometry.worldMatrix.multiply(translation);

    // lightPosition.x = cosTime * earthDistance;
    // lightPosition.y = 1.5;
    // lightPosition.z = sinTime * earthDistance;

    //rotation = new Matrix4().makeRotationY(-time.secondsElapsedSinceStart);
    //earthGeometry.worldMatrix.multiply(rotation);

    // var earthTransform = createEarthMatrix(time.secondsElapsedSinceStart, earthPosition);
    // var e = earthTransform.elements;
    // earthGeometry.worldMatrix.set(
    //   e[0], e[1], e[2], e[3],
    //   e[4], e[5], e[6], e[7],
    //   e[8], e[9], e[10], e[11],
    //   e[12], e[13], e[14], e[15]
    // );
    

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
    mercuryGeometry.render(camera, projectionMatrix, phongShaderProgram);
    venusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    earthGeometry.render(camera, projectionMatrix, phongShaderProgram);
    marsGeometry.render(camera, projectionMatrix, phongShaderProgram);
    jupiterGeometry.render(camera, projectionMatrix, phongShaderProgram);
    saturnGeometry.render(camera, projectionMatrix, phongShaderProgram);
    uranusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    neptuneGeometry.render(camera, projectionMatrix, phongShaderProgram);
    gl.useProgram(basicColorProgram);
    gl.uniform4f(basicColorProgram.uniforms.colorUniform, 1.0, 1.0, 1.0, 1.0);
    

    
}
