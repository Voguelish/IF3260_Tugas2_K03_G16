var vertices = [];
var oldAngle = 0;
var objects = [];
var anglex = 180;
var angley = 180;
var anglez = 180;
function check(canvas) {
  let gl = ['experimental-webgl', 'webgl', 'moz-webgl'];
  let flag;
  for (let i = 0; i < gl.length; i++) {
    try {
      flag = canvas.getContext(gl[i]);
      console.log(canvas.getContext(gl[i]));
    }
    catch (e) { }
    if (flag) {
      break;
    }
  }
  if (!flag) {
    alert("Maaf, WebGL tidak tersedia di browser anda. Silahkan update browser Anda.");
  }
  return flag;
}
const vertexShaderText = `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;
uniform mat4 Nmatrix;
attribute vec3 color;
varying vec3 vLighting;
varying vec3 vColor;
void main(void) {
    gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
    vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    vec3 directionalLightColor = vec3(1, 1, 1);
    vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
    vec4 transformedNormal = Nmatrix*vec4(normal, 1.);
    
    float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
    vColor = color;
}
`;

const fragmentShaderText = 'precision mediump float;' +
  'varying vec3 vColor;' +
  'varying vec3 vLighting;' +

  'void main(void) {' +
  'gl_FragColor = vec4(vColor, 1.);' +
  'gl_FragColor.rgb *= vLighting;' +
  '}';
function createShader(gl, type, source) {
  let shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('error!', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('error!', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  gl.validateProgram(program)
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('error validating program!', gl.getProgramInfoLog(program))
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
}
function setGeometry(gl, vertices) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
}
function setColors(gl, colors) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
}
var _Pmatrix;
var _Vmatrix;
var _Mmatrix;
var _Nmatrix;

// OBJECTS

var pyramid = [
  //bottom face
  -0.2, -0.2, 0.2, -0.18, -0.2, 0.2, -0.18, -0.2, -0.2, -0.2, -0.2, -0.2,
  0.18, -0.2, 0.2, 0.2, -0.2, 0.2, 0.2, -0.2, -0.2, 0.18, -0.2, -0.2,
  -0.2, -0.2, 0.2, 0.2, -0.2, 0.2, 0.2, -0.2, 0.18, -0.2, -0.2, 0.18,
  -0.2, -0.2, -0.2, 0.2, -0.2, -0.2, 0.2, -0.2, -0.18, -0.2, -0.2, -0.18,

  //right face
  0.2, -0.2, 0.2, 0.2, -0.2, 0.18, 0, 0.2, -0.01, 0, 0.2, 0.01,
  0.2, -0.2, -0.2, 0.2, -0.2, -0.18, 0, 0.2, 0.01, 0, 0.2, -0.01,
  0.2, -0.2, 0.2, 0.2, -0.2, -0.2, 0.18, -0.18, -0.18, 0.18, -0.18, 0.18,

  //front face
  -0.2, -0.2, 0.2, 0.2, -0.2, 0.2, 0.18, -0.18, 0.18, -0.18, -0.18, 0.18,
  -0.2, -0.2, 0.2, -0.18, -0.2, 0.2, 0.02, 0.2, 0.02, 0, 0.2, 0.02,
  0.18, -0.2, 0.2, 0.2, -0.2, 0.2, 0.02, 0.2, 0.02, 0, 0.2, 0.02,

  //left face
  -0.2, -0.2, 0.2, -0.2, -0.2, 0.18, 0, 0.2, -0.01, 0, 0.2, 0.01,
  -0.2, -0.2, -0.2, -0.2, -0.2, -0.18, 0, 0.2, 0.01, 0, 0.2, -0.01,
  -0.2, -0.2, 0.2, -0.2, -0.2, -0.2, -0.18, -0.18, -0.18, -0.18, -0.18, 0.18,

  //back face
  -0.2, -0.2, -0.2, 0.2, -0.2, -0.2, 0.18, -0.18, -0.18, -0.18, -0.18, -0.18,
  -0.2, -0.2, -0.2, -0.18, -0.2, -0.2, 0.02, 0.2, 0.02, 0, 0.2, 0.02,
  0.18, -0.2, -0.2, 0.2, -0.2, -0.2, 0.02, 0.2, 0.02, 0, 0.2, 0.02,
];
var vertexNormals = [
  //bottom
  0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
  0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
  0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
  0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

  //right
  0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0,
  0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0,
  0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0,

  //front
  0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
  0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5,
  0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5,

  //left
  -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0,
  -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0,
  -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0,

  //back
  0.0, 0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, -0.5,
  0.0, 0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, -0.5,
  0.0, 0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.5, -0.5
];
var colors = [
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,

  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,

  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,

  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,

  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,

  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,

];

var hollowCube = [
  // Front face
  // v0-v1-v2-v3
  -0.3, -0.3, 0.3,
  0.3, -0.3, 0.3,
  0.3, 0.3, 0.3,
  -0.3, 0.3, 0.3,

  // Back face
  // v4-v5-v6-v7
  -0.3, -0.3, -0.3,
  0.3, -0.3, -0.3,
  0.3, 0.3, -0.3,
  -0.3, 0.3, -0.3,

  // Top face
  // v3-v2-v6-v7
  -0.3, 0.3, 0.3,
  0.3, 0.3, 0.3,
  0.3, 0.3, -0.3,
  -0.3, 0.3, -0.3,

  // Bottom face
  // v0-v1-v5-v4
  -0.3, -0.3, 0.3,
  0.3, -0.3, 0.3,
  0.3, -0.3, -0.3,
  -0.3, -0.3, -0.3,

]

var hollowCubeVertexNormals = [
  // Front face
  // v0-v1-v2-v3
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,

  // Back face
  // v4-v5-v6-v7
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,

  // Top face
  // v3-v2-v6-v7
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,

  // Bottom face
  // v0-v1-v5-v4
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
];

var hollowCubeColors = [
  // Front face
  // v0-v1-v2-v3
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,

  // Back face
  // v4-v5-v6-v7
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,


  // Top face
  // v3-v2-v6-v7
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,


  // Bottom face
  // v0-v1-v5-v4
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
];

//

const canvas = document.getElementById("canvas");
const gl = check(canvas);
var oldAngle = 0;
function setup() {
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  canvas.width = Math.round(95 / 100 * vw)
  canvas.height = Math.round(95 / 100 * vh)
  // Setup Shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);
  var program = createProgram(gl, vertexShader, fragmentShader);
  var vertBuff = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuff);
  setGeometry(gl, pyramid);

  // Create and store data into color buffer
  var color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  setColors(gl, colors);

  var normal_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

  _Pmatrix = gl.getUniformLocation(program, "Pmatrix");
  _Vmatrix = gl.getUniformLocation(program, "Vmatrix");
  _Mmatrix = gl.getUniformLocation(program, "Mmatrix");
  _Nmatrix = gl.getUniformLocation(program, "Nmatrix");

  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuff);
  var _position = gl.getAttribLocation(program, "position");
  gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(_position);

  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  var _color = gl.getAttribLocation(program, "color");
  gl.vertexAttribPointer(_color, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(_color);

  gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
  var _normal = gl.getAttribLocation(program, "normal");
  gl.vertexAttribPointer(_normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(_normal);

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(1, 1, 1, 1);
  gl.clearDepth(1.0);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
var distance = document.getElementById("distance").value;
var camera_height = 0.05
var view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -camera_height, distance, 1];
// draw object
function draw(proj_matrix, model_matrix, start, end) {
  const fov = 70 * Math.PI / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const near = 0;
  const far = 10;

  const projectionType = document.getElementById('projection').value;

  if (projectionType === "perspective") {
    perspective(proj_matrix, fov, aspect, near, far);
  } else if (projectionType === "orthographic") {
    orthographic(proj_matrix, -aspect, aspect, -1.0, 1.0, near, far);
  } else if (projectionType === "oblique") {
    oblique(proj_matrix, 75, 80);
  }

  setup();
  gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix);
  gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);
  gl.uniformMatrix4fv(_Mmatrix, false, model_matrix);
  console.log(_Mmatrix);
  console.log(_Vmatrix);
  console.log(_Pmatrix);

  let normalMatrix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  gl.uniformMatrix4fv(_Nmatrix, false, normalMatrix);

  for (var i = start; i < end; i++) {
    gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
    console.log("masuk gambar");
  }
}

function setUpInitScene() {
  document.getElementById('angle').value = oldAngle;
  var proj_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  var model_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  for (var i = 0; i < 12 * 4 * 4; i++) {
    vertices.push(pyramid[i]);
  }

  objects.push({
    "name": "pyramid",
    "offset": 0,
    "end": 16,
    "numVertices": 64,
    "vertices": vertices,
    "color": colors,
    "normals": vertexNormals,
    "projMatrix": proj_matrix,
    "modelMatrix": model_matrix
  });
  console.log(objects[0].projMatrix.length);
  console.log(objects[0].normals.length);
  console.log(objects[0].modelMatrix.length);
  
  for (var i = 0; i < objects.length; i++) {
    draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);
  }
  oldAngle = 0;
  document.getElementById('angle').value = oldAngle;
}

function yRotate(angleInRadians) {
  return [
    Math.cos(angleInRadians), 0, Math.sin(angleInRadians), 0,
    0, 1, 0, 0,
    -Math.sin(angleInRadians), 0, Math.cos(angleInRadians), 0,
    0, 0, 0, 1,
  ];
}

function multiply(a, b) {
  const result = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[i * 4 + k] * b[k * 4 + j];
      }
      result[i * 4 + j] = sum;
    }
  }
  return result;
}

function updateAngleY() {
  let value = document.getElementById('angle').value;
  value = value * Math.PI / 180;
  let move = value - oldAngle;
  let product = [];
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      let sum = 0;
      for (var k = 0; k < 4; k++)
        sum = sum + yRotate(move)[i * 4 + k] * view_matrix[k * 4 + j];
      product[i * 4 + j] = sum;
    }
  }
  view_matrix = product;
  setup();
  for (var i = 0; i < objects.length; i++) {
    draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);
  }
  oldAngle = value;
}

const transpose = (out, a) => {
  // Self-tranpose
  if (out === a) {
    let a01 = a[1];
    let a02 = a[2];
    let a03 = a[3];
    let a12 = a[6];
    let a13 = a[7];
    let a23 = a[11];

    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;

  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}

const perspective = (out, fovy, aspect, near, far) => {
  let f = 1.0 / Math.tan(fovy / 2);

  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    out[10] = (far + near) / (near - far);
    out[14] = 2 * far * near / (near - far);
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}

const orthographic = (out, left, right, bottom, top, near, far) => {
  let l_r = 1 / (left - right);
  let b_t = 1 / (bottom - top);
  let n_f = 1 / (near - far);

  out[0] = -2 * l_r;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * b_t;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * n_f;
  out[11] = 0;
  out[12] = (left + right) * l_r;
  out[13] = (top + bottom) * b_t;
  out[14] = (far + near) * n_f;
  out[15] = 1;

  return out;
}

const oblique = (out, theta, phi) => {
  var t = theta * Math.PI / 180;
  var p = phi * Math.PI / 180;
  var cotT = -1 / Math.tan(t);
  var cotP = -1 / Math.tan(p);

  out[0] = 1;
  out[1] = 0;
  out[2] = cotT;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = cotP;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;

  transpose(out, out);

  return out;
}

function projectionHandler() {
  projectionType = document.getElementById("projection").value;
  if (projectionType == "orthographic") {
    distance = -1.3;
    view_matrix[14] = distance;
  } else if (projectionType == "oblique") {
    distance = 0;
    view_matrix[14] = distance;
  } else {
    distance = -1.3;
    view_matrix[14] = distance;
  }
  setup();
  for (var i = 0; i < objects.length; i++) {
    draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);
  }

}

function distanceHandler() {
  projectionType = document.getElementById("projection").value;
  if (projectionType == "perspective") {
    distance = document.getElementById("distance").value;
    view_matrix[14] = distance;
    setup();
    for (var i = 0; i < objects.length; i++) {
      draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);
    }
  }
}

function resetHandler() {
  document.getElementById("projection").value = "perspective";
  document.getElementById("distance").value = -1.3;
  document.getElementById("angle").value = 0;
  projectionHandler();
  updateAngleY();
}

function getCenterPoint(start, end, arr) {
  let maxX = -Infinity;
  let minX = Infinity;
  let maxY = -Infinity;
  let minY = Infinity;

  for (let i = start; i < end; i += 3) {
    maxX = Math.max(maxX, arr[i]);
    minX = Math.min(minX, arr[i]);
    maxY = Math.max(maxY, arr[i + 1]);
    minY = Math.min(minY, arr[i + 1]);
  }

  const centerX = (maxX + minX) / 2;
  const centerY = (maxY + minY) / 2;
  return [centerX, centerY];
}
function translation(tx, ty, tz) {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1,
  ];
}

function scale(sx, sy, sz) {
  return [
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1,
  ];
}
function updateScale(obj,value){
  var idx=0;
  for (var i = 0; i <objects.length; i++){
    if(objects[i].name == obj){
        idx = i;
        break;
    }
  }
  let centerPoint = getCenterPoint(objects[idx].offset * 12, objects[idx].offset * 12 + objects[idx].numVertices * 3, vertices);
  var translate_matrix1 = translation(-centerPoint[0], -centerPoint[1], 0);
  var translate_matrix2 = translation(centerPoint[0], centerPoint[1], 0);
  var scale_matrix = scale(value, value, value);
  const product = [];
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      let sum = 0;
      for (var k = 0; k < 4; k++)
        sum = sum + scale_matrix[i * 4 + k] * translate_matrix2[k * 4 + j];
      product[i * 4 + j] = sum;
    }
  }
  const model_matrix = [];
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      let sum2 = 0;
      for (var k = 0; k < 4; k++)
        sum2 = sum2 + translate_matrix1[i * 4 + k] * product[k * 4 + j];
      model_matrix[i * 4 + j] = sum2;
    }
  }
  const currentModelMatrix = objects[idx].modelMatrix;
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      let sum3 = 0;
      for (var k = 0; k < 4; k++)
        sum3 = sum3 + model_matrix[i * 4 + k] * currentModelMatrix[k * 4 + j];
      objects[idx].modelMatrix[i * 4 + j] = sum3;
    }
  }
  for(var i = 0; i<objects.length; i++){
      draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);  
  }
}

const buttons = document.querySelectorAll('#button-container button');
let activeButtonValues = "";
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(otherButton => {
      otherButton.classList.remove('active');
    });
    button.classList.add('active');
    const activeButtonValue = document.querySelector('#button-container button.active').value;
    console.log(activeButtonValue);
    activeButtonValues = activeButtonValue;    
    if(activeButtonValues==="pyramid"){
      console.log(activeButtonValues==="pyramid");
      const scaleInput = document.getElementById('scale');
      scaleInput.addEventListener('change', () => {
        const scaleValue = scaleInput.value;
        console.log(scaleValue);
        updateScale(activeButtonValue,scaleValue)
      });    }
  });
});
