// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() { 
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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
let u_Size;


function setUpWebGL() {
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Constants 
const POINT = 1;
const TRIANGLE = 2;
const CIRCLE = 3;

// Global Var for UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 8;

function addActionsForHtmlUI() {
  // button functionality for green/red coloring points
  document.getElementById('green').onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  // clear button to remove the points
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };
  // button functionality to draw different shapes
  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; };
  document.getElementById('TriButton').onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; };
  
  // Slider functionality for red/green/blue colors
  document.getElementById('redSlide').addEventListener('mouseup', function ()  {g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function ()  {g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function ()  {g_selectedColor[2] = this.value/100; });

  // slider functionality for point size/segment adjustments
  document.getElementById('sizeSlide').addEventListener('mouseup', function ()  {g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function ()  {g_selectedSegment = this.value; });

  // button to draw picture
  document.getElementById('drawImageButton').onclick = function() {
  // Show the image
  const img = document.getElementById('PokeballImage');
  img.style.display = 'block'; // Make the image visible

  // Draw the triangles using WebGL
  drawPicture();
};
  
  

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

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);


}

function drawPicture() {
  // Example triangles representing your picture
  const triangles = [
    { vertices: [-0.15, 0, -0.05, 0, -0.15, 0.1], color: [1.0, 1.0, 1.0, 1.0] }, 
    { vertices: [-0.05, 0.1, -0.05, 0, -0.15, 0.1], color: [1.0, 1.0, 1.0, 1.0] }, // first center white square
    { vertices: [-0.05, 0.0, 0.6, 0, -0.05, 0.1], color: [0.5, 0.5, 0.5, 1.0] },
    { vertices: [0.6, 0.1, 0.6,0, -0.05, 0.1], color: [0.5, 0.5, 0.5, 1.0]},  // grey rectangle to the right of white square
    { vertices: [-0.8,0, -0.15,0, -0.8, 0.1], color: [0.5, 0.5, 0.5, 1.0]},
    { vertices: [-0.15, 0.1, -0.8, 0.1, -0.15, 0], color: [0.5, 0.5, 0.5, 1.0]},  // grey rectangle to the left
    { vertices: [-0.20, 0.1, 0.0,0.1, -0.2, 0.15], color: [0.5, 0.5, 0.5, 1.0]},
    { vertices: [0, 0.15, 0, 0.1, -0.2, 0.15], color: [0.5, 0.5, 0.5, 1.0]},  // grey rectangle on top of the white square
    { vertices: [-0.2, -0.05, 0, -0.05, -0.2, 0], color: [0.5, 0.5, 0.5, 1.0]},
    { vertices: [0, 0, 0, -0.05, -0.2, 0], color: [0.5, 0.5, 0.5, 1.0]},    // grey rectangle on the botton of the white square
    { vertices: [-0.2, 0.1, -0.8, 0.1, -0.55, 0.5], color: [1.0, 0.0, 0.0, 1.0]}, 
    { vertices: [-0.2, 0.1, -0.55, 0.5, -0.2, 0.65], color: [1.0, 0.0, 0.0, 1.0]},
    { vertices: [-0.2, 0.15, 0,.15, -0.2, 0.65], color: [1.0, 0.0, 0.0, 1.0]},
    { vertices: [0, 0.65, 0, 0.15, -0.2, 0.65], color: [1.0, 0.0, 0.0, 1.0]},
    { vertices: [0, 0.1, 0, 0.65, 0.35, 0.5], color: [1.0, 0.0, 0.0, 1.0]},
    { vertices: [0, 0.1, 0.6, 0.1, 0.35, 0.5], color: [1.0, 0.0, 0.0, 1.0]},
    { vertices: [-0.2, 0, -0.8, 0, -0.55, -0.5], color: [1.0, 1.0, 1.0, 1.0]},
    { vertices: [-0.2, 0, -0.55, -0.5, -0.2, -0.6], color: [1.0, 1.0, 1.0, 1.0]},
    { vertices: [-0.2, -0.6, 0, -0.6, -0.2, -0.05], color: [1.0, 1.0, 1.0, 1.0]},
    { vertices: [0, -0.05, 0, -0.6, -0.2, -0.05], color: [1.0, 1.0, 1.0, 1.0]},
    { vertices: [0,0, 0.35, -0.5, 0, -0.6], color: [1.0, 1.0, 1.0, 1.0]},
    { vertices: [0,0, 0.6, 0, 0.35, -0.5], color: [1.0, 1.0, 1.0, 1.0]}
  ];
  

  for (let i = 0; i < triangles.length; i++) {
    const { vertices, color } = triangles[i];
    drawTriangles(vertices, color);
  }

  
}


var g_shapesList = [];

function click(ev) {
  let [x, y] = connectCoordinatesEventToGL(ev);
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle;
    point.segments = g_selectedSegment;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  renderAllShapes();
}

function connectCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x,y]);
}

// draws/updates on the canvas
function renderAllShapes(){
  // Clear <canvas>

  var startTime = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " +  htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

