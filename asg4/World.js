// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec3 a_Normal;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() { 
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV; 
    v_Normal = a_Normal; 
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform vec3 u_lightPos;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform int u_whichTexture;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else {
      gl_FragColor = vec4(1.0); // white fallback
    }
    vec3 lightVector = vec3(v_VertPos)-u_lightPos;
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
    float specular = pow(max(dot(E, R), 0.0), 20.0);
    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;
    if (u_lightOn) {
      if (u_whichTexture == -1) {
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
      
    } 
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
let camera = new Camera();
//let u_TexColorWeight;
let a_Normal;
let u_lightPos;
let u_lightOn;
let u_cameraPos;

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
  gl.disable(gl.CULL_FACE)
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

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
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
  /*
  u_TexColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (!u_TexColorWeight) {
    console.log('Failed to get the storage location of u_TexColorWeight');
    return;
  }
  */
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
let g_lastFrameTime = performance.now();
let g_xRotation = 0;
let g_yRotation = 0; 
let isDragging = false;
let lastMouseX, lastMouseY;
let g_NormalsOn = false;
let g_lightPos = [0, 1, 2];
let g_lightAnimation = true;
let g_lightOn = true;



function addActionsForHtmlUI() {

  document.getElementById('normalOn').onclick = function() {g_NormalsOn = true; renderScene();};
  document.getElementById('normalOff').onclick = function() {g_NormalsOn = false; renderScene();};
  document.getElementById('lightsOn').onclick = function() {g_lightOn = true;};
  document.getElementById('lightsOff').onclick = function() {g_lightOn = false;};
  document.getElementById('lightAnimationOn').onclick = function() {g_lightAnimation = true;};
  document.getElementById('lightAnimationOff').onclick = function() {g_lightAnimation = false;}
  document.getElementById('animationRedOnButton').onclick = function() {g_redAnimation = true;};
  document.getElementById('animationRedOffButton').onclick = function() {g_redAnimation = false;};
  document.getElementById('animationOrangeOnButton').onclick = function() {g_orangeAnimation = true;};
  document.getElementById('animationOrangeOffButton').onclick = function() {g_orangeAnimation = false;};
  document.getElementById('angleSlide').addEventListener('mousemove', function ()  {g_globalAngle = this.value; renderScene(); });

  document.getElementById('redSlide').addEventListener('mousemove', function () {g_redAngle = -this.value; renderScene(); });
  document.getElementById('orangeSlide').addEventListener('mousemove', function () {g_orangeAngle = -this.value; renderScene(); });
  document.getElementById('lightslideX').addEventListener('mousemove', function () {g_lightPos[0] = this.value/100; renderScene(); });
  document.getElementById('lightslideY').addEventListener('mousemove', function () {g_lightPos[1] = this.value/100; renderScene(); });
  document.getElementById('lightslideZ').addEventListener('mousemove', function () {g_lightPos[2] = this.value/100; renderScene(); });
  
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
  measurePerformance()
  requestAnimationFrame(tick);
}


function click(ev) {
  
  renderScene();
}


function keydown(ev) {
  if (ev.keyCode == 68) { 
    camera.moveRight(0.2);
  } else if (ev.keyCode == 65) {
    camera.moveLeft(0.2);
  } else if (ev.keyCode == 87) {
    camera.moveForward(0.2);
  } else if (ev.keyCode == 83) { 
    camera.moveForward(-0.2);
  } else if (ev.keyCode == 81) { 
    camera.rotate(-5); 
  } else if (ev.keyCode == 69) { 
    camera.rotate(5); 
  } else if (ev.key === "ArrowUp") {
    camera.moveUp(0.2);
  } else if (ev.key === "ArrowDown") {
    camera.moveDown(0.2);
  }

  renderScene();
}


function updateAnimationAngles() {
  if (g_redAnimation) {
    g_redAngle = (8*Math.sin(6*g_seconds));
  }

  if (g_orangeAnimation) {
    g_orangeAngle = (18 * Math.sin(3*g_seconds));
  }
  if (g_lightAnimation) {
    g_lightPos[0] = Math.cos(g_seconds) * 1.75;
  }
}

function startPokeAnimation() {
  g_pokeAnimation = true;
  g_pokeStartTime = performance.now(); 
}


function measurePerformance() {
  let currentTime = performance.now();
  let frameTime = currentTime - g_lastFrameTime;
  g_lastFrameTime = currentTime;

  let fps = Math.floor(1000 / frameTime); 
  sendTextToHTML(`FPS: ${fps}`, "performanceIndicator"); 
}


let map = [];
for (let x = 0; x < 15; x++) {
  map[x] = [];
  for (let z = 0; z < 15; z++) {
    let isWall = (x < 2 || z < 2 || x >= 14 || z >= 14);
    map[x][z] = isWall ? 7 : 0;
  }
}


function drawCat() {

  // Body
  const body = new Cube();
  body.color = [1.0, 0.5, 0.2, 1.0];
  body.textureNum = -2;
  if (g_NormalsOn) {
    body.textureNum = -3;
  }
  body.matrix.translate(-0.4, -0.3, 0.4);
  body.matrix.scale(0.8, 0.4, 0.4);
  body.renderFaster();

  // Head
  const head = new Cube();
  head.color = [1.0, 0.5, 0.2, 1.0];
  head.textureNum = -2;
  if (g_NormalsOn) {
    head.textureNum = -3;
  }
  head.matrix.translate(-0.75, -0.2, 0.4);
  head.matrix.scale(0.35, 0.35, 0.4);
  head.renderFaster();

  // Ears
  for (let offsetZ of [0.4, 0.1]) {
    const ear = new Cube();
    ear.textureNum = -2;
    if (g_NormalsOn) {
      ear.textureNum = -3;
    }
    ear.color = [1.0, 0.0, 0.0, 1.0];
    ear.matrix.translate(-0.75, 0.15, offsetZ);
    ear.matrix.scale(0.15, 0.15, 0.1);
    ear.renderFaster();
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
    upper.textureNum = -2;
    if (g_NormalsOn) {
      upper.textureNum = -3;
    }
    upper.matrix.translate(lx, ly, lz);
    upper.matrix.rotate(-g_orangeAngle, 0, 0, 1);
    const jointMatrix = new Matrix4(upper.matrix); 
    upper.matrix.scale(0.15, 0.2, 0.1);
    upper.renderFaster();

    // Lower leg
    const lower = new Cube();
    lower.textureNum = -2;
    if (g_NormalsOn) {
      lower.textureNum = -3;
    }
    lower.color = [1.0, 0.0, 0.0, 1.0];
    lower.matrix.set(jointMatrix);
    lower.matrix.translate(0.05, -0.13, 0);
    lower.matrix.rotate(-10, 0, 0, 1);
    lower.matrix.rotate(-g_redAngle, 0, 0, 1);
    lower.matrix.scale(0.1, 0.2, 0.1);
    lower.matrix.translate(-0.5, 0, -0.001);
    lower.renderFaster();
  }

  // Tail base
  const tail1 = new Cube();
  tail1.color = [1.0, 0.0, 0.0, 1.0];
  tail1.textureNum = -2;
  if (g_NormalsOn) {
    tail1.textureNum = -3;
  }
  tail1.matrix.translate(0.4, -0.1, 0.2);
  tail1.matrix.rotate(-5, 1, 0, 0);
  const tail1Base = new Matrix4(tail1.matrix); 
  tail1.matrix.scale(0.3, 0.1, 0.1);
  tail1.matrix.translate(-0.25, 0, -0.001);
  tail1.renderFaster();


}


function renderScene(){
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  
  var ProjMat= new Matrix4();
  ProjMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, ProjMat.elements);

  var ViewMat = camera.getViewMatrix();
  gl.uniformMatrix4fv(u_ViewMatrix, false, ViewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  globalRotMat.rotate(g_xRotation, 1, 0, 0); // Rotate around X
  globalRotMat.rotate(g_yRotation, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, camera.eye.x, camera.eye.y, camera.eye.z);
  gl.uniform1i(u_lightOn, g_lightOn);


  var light = new Cube();
  light.textureNum = -2;
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(0.25, 1.0, 10.0);
  light.renderFaster();

  var sphere1 = new Sphere();
  sphere1.color = [0, 0, 0, 1];
  sphere1.textureNum = -1;
  if (g_NormalsOn) {
    sphere1.textureNum = -3;
  }
  sphere1.matrix.translate(-1.75, -0.1, -0.2);
  sphere1.matrix.scale(0.5, 0.5, 0.5);
  sphere1.render();

  const offsetX = -map.length / 2;
  const offsetZ = -map[0].length / 2;
  
  var cube1 = new Cube();
  cube1.textureNum = -2;  //original color
  if (g_NormalsOn) {
    cube1.textureNum = -3;
  }
  cube1.color = [0.7, 0.7, 0.7, 1];
  cube1.matrix.scale(5, 5, 5);
  cube1.matrix.translate(-0.5, -0.125, 0.85);
  cube1.renderFaster();
  drawCat();

}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
      console.log("Failed to get " +  htmlID + " from HTML");
      return;
    }
    htmlElm.innerHTML = text;
  }
  