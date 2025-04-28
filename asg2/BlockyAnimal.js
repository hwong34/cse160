// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() { 
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setUpWebGL() {
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants 
const POINT = 1;
const TRIANGLE = 2;
const CIRCLE = 3;

// Global Var for UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];

//let g_selectedType = POINT;

let g_globalAngle = 0;
let g_redAngle = 0;
let g_orangeAngle = 0;
let g_redAnimation = false;
let g_orangeAnimation = false;
let g_pokeAnimation = false;
let g_pokeStartTime = 0;
let g_specialAngle = 0;
let g_lastFrameTime = performance.now();
let g_xRotation = 0;
let g_yRotation = 0; 
let isDragging = false; // Track when the mouse is clicked
let lastMouseX, lastMouseY;



function addActionsForHtmlUI() {

  document.getElementById('animationRedOnButton').onclick = function() {g_redAnimation = true;};
  document.getElementById('animationRedOffButton').onclick = function() {g_redAnimation = false;};
  document.getElementById('animationOrangeOnButton').onclick = function() {g_orangeAnimation = true;};
  document.getElementById('animationOrangeOffButton').onclick = function() {g_orangeAnimation = false;};
  document.getElementById('angleSlide').addEventListener('mousemove', function ()  {g_globalAngle = this.value; renderScene(); });

  document.getElementById('redSlide').addEventListener('mousemove', function () {g_redAngle = -this.value; renderScene(); });
  document.getElementById('orangeSlide').addEventListener('mousemove', function () {g_orangeAngle = -this.value; renderScene(); });

  canvas.addEventListener("mousedown", (event) => {
    if (event.shiftKey) {
        startPokeAnimation();
    }
  });
  canvas.addEventListener("mousedown", (event) => {
    if (event.shiftKey) {
        g_pokeAnimation = true;
        g_pokeStartTime = performance.now();
    }
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
        g_pokeAnimation = false;
    }
  });
  canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });

  canvas.addEventListener("mousemove", (event) => {
      if (isDragging) {
          let deltaX = event.clientX - lastMouseX;
          let deltaY = event.clientY - lastMouseY;

          g_xRotation += deltaY * 0.5; // Adjust sensitivity
          g_yRotation += deltaX * 0.5;

          lastMouseX = event.clientX;
          lastMouseY = event.clientY;

          renderScene(); // Update the scene to reflect new rotation
      }
  });

  canvas.addEventListener("mouseup", () => {
      isDragging = false;
  });
}

function main() {
  setUpWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };
  

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  console.log(g_seconds);
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}


function click(ev) {
  
  renderScene();
}


function updateAnimationAngles() {
  if (g_redAnimation) {
    g_redAngle = (8*Math.sin(2*g_seconds));
  } 
  if (g_pokeAnimation) {
    let pokeDuration = (performance.now() - g_pokeStartTime) / 1000; 
    g_specialAngle = 45 * Math.sin(pokeDuration * 5); 
    if (!g_pokeAnimation) {
      g_specialAngle = 20 * Math.sin(g_seconds);
    }
  
  }
  if (g_orangeAnimation) {
    g_orangeAngle = (18 * Math.sin(2*g_seconds));
  }
}

function startPokeAnimation() {
  g_pokeAnimation = true;
  g_pokeStartTime = performance.now(); // Track when animation started
}


function measurePerformance() {
  let currentTime = performance.now();
  let frameTime = currentTime - g_lastFrameTime;
  g_lastFrameTime = currentTime;

  let fps = Math.floor(1000 / frameTime); 
  sendTextToHTML(`FPS: ${fps}`, "performanceIndicator"); 
}


// draws/updates on the canvas
function renderScene(){
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.BLEND);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.rotate(g_xRotation, 1, 0, 0); // Rotate around X
  globalRotMat.rotate(g_yRotation, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  
  
  var body = new Cube();
  body.color = [1.0, 0.5, 0.2, 1.0]; 
  body.matrix.setTranslate(-0.4, -0.3, 0.4);
  body.matrix.scale(0.8, 0.4, 0.4);
  body.render(); // Body

  var head = new Cube();
  head.color = [1.0, 0.5, 0.2, 1.0];
  head.matrix.setTranslate(-0.75, -0.2, 0.4);
  head.matrix.scale(0.35, 0.35, 0.4);
  head.render(); // Head
  drawTriangles3D(-0.8, 0.4, 0.1);
  var ears1 = new Cube();
  ears1.color = [1.0, 0.0, 0.0, 1.0];
  ears1.matrix.translate(-0.75, 0.15, 0.4); 
  ears1.matrix.scale(0.15, 0.15, 0.1);
  ears1.render();

  var ears2 = new Cube();
  ears2.color = [1.0, 0.0, 0.0, 1.0];
  ears2.matrix.translate(-0.75, 0.15, 0.1); 
  ears2.matrix.scale(0.15, 0.15, 0.1);
  ears2.render();
 
  var eye1 = new Cube();
  eye1.color = [1.0, 1.0, 1.0, 1.0]; 
  var eyeMatrix = new Matrix4(head.matrix);
  eye1.matrix.set(eyeMatrix); 
  eye1.matrix.translate(-0.15, 0.6, -0.2); 
  eye1.matrix.scale(0.2, 0.2, 0.1); 
  eye1.render();

  var eye2 = new Cube();
  eye2.color = [1,1,1,1];
  eye2.matrix.set(eyeMatrix);
  eye2.matrix.translate(-0.15, 0.6, -0.7);
  eye2.matrix.scale(0.2, 0.2, 0.1);
  eye2.render();

  var whiskers1 = new Cube();
  whiskers1.color = [0.5, 0.5, 0.5, 1];
  whiskers1.matrix.set(eyeMatrix);
  whiskers1.matrix.translate(-0.1, 0.2, -0.45);
  whiskers1.matrix.scale(0.1, 0.1, 0.1);
  whiskers1.render();

  var whiskers2 = new Cube();
  whiskers2.color = [0.5, 0.5, 0.5, 1];
  whiskers2.matrix.set(eyeMatrix);
  whiskers2.matrix.translate(-0.1, 0.35, -0.3);
  whiskers2.matrix.rotate(-30, 1, 0, 0);
  var whiskers = new Matrix4(whiskers2.matrix);
  whiskers2.matrix.scale(0.05, 0.05, 0.2);
  whiskers2.render();

  var whisker3 = new Cube();
  whisker3.color = [0.5, 0.5, 0.5, 1]; 
  whisker3.matrix.set(eyeMatrix);
  whisker3.matrix.translate(-0.1, 0.2, -0.53);
  whisker3.matrix.rotate(-30, 1, 0, 0);
  whisker3.matrix.scale(0.05, 0.05, 0.2); 
  whisker3.render(); 

  var whisker4 = new Cube();
  whisker4.color = [0.5, 0.5, 0.5, 1]; 
  whisker4.matrix.set(whiskers);
  whisker4.matrix.translate(0, 0.05, -0.26);
  whisker4.matrix.rotate(60, 1, 0, 0);
  whisker4.matrix.scale(0.05, 0.05, 0.2); 
  whisker4.render(); 


  var whisker5 = new Cube();
  whisker5.color = [0.5, 0.5, 0.5, 1]; 
  whisker5.matrix.set(whiskers);
  whisker5.matrix.translate(0, 0.04, -0.18);
  whisker5.matrix.rotate(240, 1, 0, 0);
  whisker5.matrix.scale(0.05, 0.05, 0.2); 
  whisker5.render(); 

  var whisker6 = new Cube();
  whisker6.color = [0.5, 0.5, 0.5, 1];
  whisker6.matrix.set(eyeMatrix);
  whisker6.matrix.translate(-0.1, 0.25, -0.3);
  whisker6.matrix.scale(0.15, 0.05, 0.4); 
  whisker6.render(); 

  var nose = new Cube();
  nose.color = [1,1,1,1];
  nose.matrix.set(eyeMatrix);
  nose.matrix.translate(-0.1, 0.45, -0.45);
  nose.matrix.scale(0.1, 0.1, 0.1);
  nose.render();

  var upperLeg = new Cube();
  upperLeg.color = [1.0, 0.5, 0.2, 1.0]; 
  upperLeg.matrix.translate(-0.3, -0.45, 0.4);
  upperLeg.matrix.rotate(-g_orangeAngle, 0, 0, 1);
  var upperlegCoordinates = new Matrix4(upperLeg.matrix);
  upperLeg.matrix.scale(0.15, 0.2, 0.1);
  upperLeg.render(); 


  var upperLeg1 = new Cube();
  upperLeg1.color = [1.0, 0.0, 0.0, 1.0];
  upperLeg1.matrix.set(upperlegCoordinates); 
  upperLeg1.matrix.translate(0.05, -0.13, 0); 
  upperLeg1.matrix.rotate(-10, 0, 0, 1);
  upperLeg1.matrix.rotate(-g_redAngle, 0, 0, 1); 
  upperLeg1.matrix.scale(0.1, 0.2, 0.1);
  upperLeg1.matrix.translate(-.5,0,-.001);
  upperLeg1.render()
    


  var upperLeg2= new Cube();
  upperLeg2.color = [1.0, 0.5, 0.2, 1.0]; 
  upperLeg2.matrix.translate(-0.3, -0.45, 0.1);
  upperLeg2.matrix.rotate(-g_orangeAngle, 0, 0, 1);
  var upperleg1Coord = new Matrix4(upperLeg2.matrix);
  upperLeg2.matrix.scale(0.15, 0.2, 0.1);
  upperLeg2.render(); 

  var upperLeg3 = new Cube();
  upperLeg3.color = [1.0, 0.0, 0.0, 1.0];
  upperLeg3.matrix.set(upperleg1Coord);
  upperLeg3.matrix.translate(0.05, -0.13, 0); 
  upperLeg3.matrix.rotate(-10, 0, 0, 1);
  upperLeg3.matrix.rotate(-g_redAngle, 0, 0, 1);
  upperLeg3.matrix.scale(0.1, 0.2, 0.1);
  upperLeg3.matrix.translate(-.5, 0, -.001);
  upperLeg3.render();

  var bottomLeg = new Cube();
  bottomLeg.color = [1.0, 0.5, 0.2, 1.0];  
  bottomLeg.matrix.translate(0.2, -0.45, 0.4);
  bottomLeg.matrix.rotate(-g_orangeAngle, 0, 0, 1);
  var bottomLegCoord = new Matrix4(bottomLeg.matrix);
  bottomLeg.matrix.scale(0.15, 0.2, 0.1);
  bottomLeg.render(); 

  var bottomLeg1 = new Cube();
  bottomLeg1.color = [1, 0, 0, 1];
  bottomLeg1.matrix.set(bottomLegCoord);
  bottomLeg1.matrix.translate(0.05, -0.13, 0);
  bottomLeg1.matrix.rotate(-10, 0, 0, 1);
  bottomLeg1.matrix.rotate(-g_redAngle, 0, 0, 1);
  bottomLeg1.matrix.scale(0.1, 0.2, 0.1);
  bottomLeg1.matrix.translate(-.5, 0, -.001);
  bottomLeg1.render();

  var bottomLeg2 = new Cube();
  bottomLeg2.color = [1.0, 0.5, 0.2, 1.0]; 
  bottomLeg2.matrix.translate(0.2, -0.45, 0.1);
  bottomLeg2.matrix.rotate(-g_orangeAngle, 0, 0, 1);
  var bottom1Coord = new Matrix4(bottomLeg2.matrix);
  bottomLeg2.matrix.scale(0.15, 0.2, 0.1);
  bottomLeg2.render(); 

  var bottomLeg3 = new Cube();
  bottomLeg3.color = [1, 0, 0, 1];
  bottomLeg3.matrix.set(bottom1Coord);
  bottomLeg3.matrix.translate(0.05, -0.13, 0);
  bottomLeg3.matrix.rotate(-10, 0, 0, 1);
  bottomLeg3.matrix.rotate(-g_redAngle, 0, 0, 1);
  bottomLeg3.matrix.scale(0.1, 0.2, 0.1);
  bottomLeg3.matrix.translate(-.5, 0, -.001);
  bottomLeg3.render();

  // Create tail1
  var tail1 = new Cube();
  tail1.color = [1.0, 0.5, 0.2, 1.0]; 
  tail1.matrix.translate(0.4, -0.1, 0.2);
  tail1.matrix.rotate(-5, 1, 0, 0);
  var Tail1Coordinates = new Matrix4(tail1.matrix); // Store tail1's transformations
  tail1.matrix.scale(0.3, 0.1, 0.1);
  tail1.matrix.translate(-0.25, 0, -.001);
  tail1.render();

  // Create tail2 RELATIVE to tail1
  var tail2 = new Cube();
  tail2.color = [1.0, 0.0, 0.0, 1.0];
  tail2.matrix.set(Tail1Coordinates);  // Correctly inherit tail1's transformation
  tail2.matrix.translate(0.15, 0.0, 0.01); // Position relative to tail1
  tail2.matrix.rotate(g_specialAngle, 0, 0, 1); // Apply rotation properly
  tail2.matrix.scale(0.32, 0.1, 0.1);  // Scale appropriately
  tail2.render();
  
  
  measurePerformance();

}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " +  htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

