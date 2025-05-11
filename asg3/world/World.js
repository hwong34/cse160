// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() { 
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV; 
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform float u_texColorWeight;
  uniform int u_whichTexture;
  void main() {
    vec4 baseColor = u_FragColor;
    vec4 texColor;
    if (u_whichTexture == -2) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }
    if (u_whichTexture == -1) {
      texColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 0) {
      texColor = texture2D(u_Sampler0, v_UV);
    } else {
      texColor = vec4(1.0); // white fallback
    }
    gl_FragColor = mix(baseColor, texColor, u_texColorWeight);
    
  }`

// Global variables
let canvas;
let gl;
let a_position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_whichTexture;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let camera = new Camera([0, 0, 3], [0, 0, -100], [0, 1, 0]);
let u_TexColorWeight;

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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_TexColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (!u_TexColorWeight) {
    console.log('Failed to get the storage location of u_TexColorWeight');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


// Global Var for UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; 
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
let isDragging = false;
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

      g_xRotation += deltaY * 0.5; 
      g_yRotation += deltaX * 0.5;

      lastMouseX = event.clientX;
      lastMouseY = event.clientY;

      renderScene(); 
    }
  });

  canvas.addEventListener("mouseup", () => {
      isDragging = false;
  });

}

function initTextures() {
  const texturesLoaded = [false, false];
  const files = ["grass.jpg", "walls.jpg"];
  files.forEach((file, index) => {
    const image = new Image();
    image.onload = function () {
      loadTexture(image, index);
      texturesLoaded[index] = true;


      if (texturesLoaded.every(loaded => loaded)) {
        requestAnimationFrame(tick); // start loop here
      }
    };
    image.src = file;
  });
}


function loadTexture(image, textureUnit) {
  let texture = gl.createTexture();
  gl.activeTexture(gl[`TEXTURE${textureUnit}`]);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(gl.program, `u_Sampler${textureUnit}`), textureUnit);

  console.log(`Loaded texture into unit ${textureUnit}: ${image.src}`);
}


function main() {
  setUpWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  document.onkeydown = keydown;
  initTextures(gl, 0);

  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };
  

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


function keydown(ev) {
  console.log("Before move:", Array.from(camera.eye.elements), Array.from(camera.at.elements));


  if (ev.keyCode == 68) { // D - Move right
    camera.moveRight(0.2);
  } else if (ev.keyCode == 65) { // A - Move left
    camera.moveLeft(0.2);
  } else if (ev.keyCode == 87) { // W - Move up
    camera.moveForward(0.2);
  } else if (ev.keyCode == 83) { // S - Move down
    camera.moveForward(-0.2);
  } else if (ev.keyCode == 81) { // Q - Rotate left
    camera.rotate(-5); 
  } else if (ev.keyCode == 69) { // E - Rotate right
    camera.rotate(5); 
  }
  console.log("After move:", Array.from(camera.eye.elements), Array.from(camera.at.elements));

  renderScene();
}


function updateAnimationAngles() {
  if (g_redAnimation) {
    g_redAngle = (8*Math.sin(6*g_seconds));
  } 
  if (g_pokeAnimation) {
    let pokeDuration = (performance.now() - g_pokeStartTime) / 1000; 
    g_specialAngle = 45 * Math.sin(pokeDuration * 5); 
    if (!g_pokeAnimation) {
      g_specialAngle = 20 * Math.sin(4*g_seconds);
    }
  
  }
  if (g_orangeAnimation) {
    g_orangeAngle = (18 * Math.sin(3*g_seconds));
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


let map = [];
for (let x = 0; x < 32; x++) {
  map[x] = [];
  for (let z = 0; z < 32; z++) {
    let isWall = (x < 2 || z < 2 || x >= 31 || z >= 31);
    map[x][z] = isWall ? 7 : 0;
  }
}

let wallCubes = [];

function initWorldFromMap(map) {
  
  for (let x = 0; x < map.length; x++) {
    for (let z = 0; z < map[0].length; z++) {
      for (let y = 0; y < map[x][z]; y++) {
        let cube = new Cube();
        cube.x = x;
        cube.y = y;
        cube.z = z;
        wallCubes.push(cube);
      }
    }
  }
}

initWorldFromMap(map);

let g_Cat = [{
  x: 0,
  z: 0,
  y: 0,
  speed: 0.01,
  angle: Math.random() * 120,    
  direction: Math.random() * 120
}];


function drawCat(x, y, z, directionAngle) {
  const base = new Matrix4();
  base.translate(x, y, z);
  base.rotate(directionAngle, 0, 1, 0);

  // Body
  const body = new Cube();
  body.color = [1.0, 0.5, 0.2, 1.0];
  body.textureNum = null;
  body.matrix.set(base);
  body.matrix.translate(-0.4, -0.3, 0.4);
  body.matrix.scale(0.8, 0.4, 0.4);
  body.renderFast();

  // Head
  const head = new Cube();
  head.color = [1.0, 0.5, 0.2, 1.0];
  head.textureNum = null;
  head.matrix.set(base);
  head.matrix.translate(-0.75, -0.2, 0.4);
  head.matrix.scale(0.35, 0.35, 0.4);
  head.renderFast();

  // Ears
  for (let offsetZ of [0.4, 0.1]) {
    const ear = new Cube();
    ear.textureNum = null;
    ear.color = [1.0, 0.0, 0.0, 1.0];
    ear.matrix.set(base);
    ear.matrix.translate(-0.75, 0.15, offsetZ);
    ear.matrix.scale(0.15, 0.15, 0.1);
    ear.renderFast();
  }

  // Legs
  const legPositions = [
    [-0.3, -0.45, 0.4],
    [-0.3, -0.45, 0.1],
    [0.2, -0.45, 0.4],
    [0.2, -0.45, 0.1]
  ];

  for (let i = 0; i < 4; i++) {
    const [lx, ly, lz] = legPositions[i];

    // Upper leg
    const upper = new Cube();
    upper.color = [1.0, 0.5, 0.2, 1.0];
    upper.textureNum = null;
    upper.matrix.set(base);
    upper.matrix.translate(lx, ly, lz);
    upper.matrix.rotate(-g_orangeAngle, 0, 0, 1);
    const jointMatrix = new Matrix4(upper.matrix); 
    upper.matrix.scale(0.15, 0.2, 0.1);
    upper.renderFast();

    // Lower leg
    const lower = new Cube();
    lower.textureNum = null;
    lower.color = [1.0, 0.0, 0.0, 1.0];
    lower.matrix.set(jointMatrix);
    lower.matrix.translate(0.05, -0.13, 0);
    lower.matrix.rotate(-10, 0, 0, 1);
    lower.matrix.rotate(-g_redAngle, 0, 0, 1);
    lower.matrix.scale(0.1, 0.2, 0.1);
    lower.matrix.translate(-0.5, 0, -0.001);
    lower.renderFast();
  }

  // Tail base
  const tail1 = new Cube();
  tail1.color = [1.0, 0.5, 0.2, 1.0];
  tail1.textureNum = null;
  tail1.matrix.set(base);
  tail1.matrix.translate(0.4, -0.1, 0.2);
  tail1.matrix.rotate(-5, 1, 0, 0);
  const tail1Base = new Matrix4(tail1.matrix); // Save for second tail
  tail1.matrix.scale(0.3, 0.1, 0.1);
  tail1.matrix.translate(-0.25, 0, -0.001);
  tail1.renderFast();

  // Tail tip
  const tail2 = new Cube();
  tail2.color = [1.0, 0.0, 0.0, 1.0];
  tail2.textureNum = null;
  tail2.matrix.set(tail1Base);
  tail2.matrix.translate(0.15, 0.0, 0.01);
  tail2.matrix.rotate(g_specialAngle, 0, 0, 1);
  tail2.matrix.scale(0.32, 0.1, 0.1);
  tail2.renderFast();
}



function moveCat() {
  const cat = g_Cat[0];
  const distance = 5.5;


  let rad = cat.angle * Math.PI / 180;
  let dx = -Math.cos(rad) * cat.speed;
  let dz = Math.sin(rad) * cat.speed;

  let nextX = cat.x + dx;
  let nextZ = cat.z + dz;
  let dist = Math.sqrt(nextX * nextX + nextZ * nextZ);

  if (dist < distance) {
    cat.x = nextX;
    cat.z = nextZ;
  } else {
    cat.angle += 180 + (Math.random() - 0.5);
  }

  if (Math.random() < 0.01) {
    cat.direction += (Math.random() - 0.5) * 30;
  }

  let diff = (cat.direction - cat.angle) % 90;
  cat.angle += diff * 0.05;  
}


function renderScene(){
  moveCat();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.BLEND);

  var ProjMat= new Matrix4();
  ProjMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, ProjMat.elements);

  var ViewMat = camera.getViewMatrix();
  gl.uniformMatrix4fv(u_ViewMatrix, false, ViewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.rotate(g_xRotation, 1, 0, 0); // Rotate around X
  globalRotMat.rotate(g_yRotation, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  //draw the floor
  var floor = new Cube();
  floor.color = [0.0, 0.0, 1.0, 1.0];
  floor.textureNum = 0;
  floor.matrix.translate(0, -.78, 2);
  floor.matrix.scale(32, 0, 32);
  floor.matrix.translate(-0.5, 3, 0.4);
  floor.renderFaster();

  //draw the sky
  var sky = new Cube();
  sky.textureNum = null;  
  sky.color = [0.0, 0.6, 1.0, 1.0]; 
  sky.matrix.translate(0, 6.3, 2.1);
  sky.matrix.scale(32, 0, 32);
  sky.matrix.translate(-0.5, 0.5, 0.4);
  sky.renderFaster();

  const offsetX = -map.length / 2;
  const offsetZ = -map[0].length / 2;

  for (let cube of wallCubes) {
    cube.matrix.setIdentity();
    cube.matrix.translate(cube.x + offsetX, cube.y - 0.75, cube.z + offsetZ);
    cube.matrix.scale(1.0, 1.0, 1.0);
    cube.renderFaster();
  }


  drawCat(g_Cat[0].x, g_Cat[0].y, g_Cat[0].z, g_Cat[0].angle);
  
  var thinwall = new Cube();
  thinwall.color = [0.5, 0.5, 0.5, 1.0];
  thinwall.matrix.scale(9, 3, 2);
  thinwall.matrix.translate(0.65, -0.25, 1.8);
  thinwall.renderFast();

  var thinwall1 = new Cube();
  thinwall1.color = [0.5, 0.5,0.5, 1.0];
  thinwall1.matrix.scale(2,3, 9);
  thinwall1.matrix.translate(1, -0.25, 1.6);
  thinwall1.render();

  var roof = new Cube(); 
  roof.textureNum = null;
  roof.color = [0.4, 0.26, 0.13, 1];
  roof.matrix.translate(-0.4, 1.3, 0);
  roof.matrix.scale(13, 1, 12.9);
  roof.matrix.translate(0.2, 0.95, 1.13);
  roof.render();
  
  var thinwall = new Cube();
  thinwall.color = [0.5, 0.5, 0.5, 1.0];
  thinwall.matrix.scale(9, 3, 2);
  thinwall.matrix.translate(0.65, -0.25, 1.8);
  thinwall.renderFast();

  var thinwall2 = new Cube();
  thinwall2.color = [0.5, 0.5,0.5, 1.0];
  thinwall2.matrix.scale(2,3, 9);
  thinwall2.matrix.translate(-1, -0.25, -0.68);
  thinwall2.renderFast();

  var thinwall3 = new Cube();
  thinwall3.color = [0.5, 0.5,0.5, 1.0];
  thinwall3.matrix.scale(10, 3, 2);
  thinwall3.matrix.translate(-1.45, -0.25, -0.7);
  thinwall3.renderFast();

  var roof2 = new Cube();
  roof2.textureNum = null;
  roof2.color = [0.4, 0.26, 0.13, 1];
  roof2.matrix.scale(14,1, 14);
  roof2.matrix.translate(-1,2.3,-0.1);
  roof2.renderFast();
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
  