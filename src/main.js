var hollowModel = {};
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

var pyramid = {
  name: 'pyramid',
  vertexPositions: [
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
  ],
  vertexNormals: [
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
  ],
  vertexColors: [
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
  ]
};

var hollowCube = {
  name: 'hollowCube',
  vertexPositions: [
    // LEFT SIDE
    // Front
    -0.3, -0.3, 0.3, -0.25, -0.3, 0.3, -0.25, 0.3, 0.3, -0.3, 0.3, 0.3,
    // Back
    -0.3, -0.3, -0.3, -0.25, -0.3, -0.3, -0.25, 0.3, -0.3, -0.3, 0.3, -0.3,
    // Top
    -0.3, 0.3, 0.3, -0.25, 0.3, 0.3, -0.25, 0.3, -0.3, -0.3, 0.3, -0.3,
    // Bottom
    -0.3, -0.3, 0.3, -0.25, -0.3, 0.3, -0.25, -0.3, -0.3, -0.3, -0.3, -0.3,
    // Left
    -0.25, -0.3, -0.3, -0.25, -0.3, 0.3, -0.25, 0.3, 0.3, -0.25, 0.3, -0.3,
    // Left
    -0.3, -0.3, -0.3, -0.3, -0.3, 0.3, -0.3, 0.3, 0.3, -0.3, 0.3, -0.3,

    // RIGHT SIDE
    // Front
    0.25, -0.3, 0.3, 0.3, -0.3, 0.3, 0.3, 0.3, 0.3, 0.25, 0.3, 0.3,
    // Back
    0.25, -0.3, -0.3, 0.3, -0.3, -0.3, 0.3, 0.3, -0.3, 0.25, 0.3, -0.3,
    // Top
    0.25, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, -0.3, 0.25, 0.3, -0.3,
    // Bottom
    0.25, -0.3, 0.3, 0.3, -0.3, 0.3, 0.3, -0.3, -0.3, 0.25, -0.3, -0.3,
    // Left
    0.3, -0.3, -0.3, 0.3, -0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, -0.3,
    // Left
    0.25, -0.3, -0.3, 0.25, -0.3, 0.3, 0.25, 0.3, 0.3, 0.25, 0.3, -0.3,

    // TOP SIDE
    // Front
    -0.25, 0.25, 0.3, 0.25, 0.25, 0.3, 0.25, 0.3, 0.3, -0.25, 0.3, 0.3,
    // Back
    -0.25, 0.25, -0.3, 0.25, 0.25, -0.3, 0.25, 0.3, -0.3, -0.25, 0.3, -0.3,
    // Top
    -0.25, 0.3, 0.3, 0.25, 0.3, 0.3, 0.25, 0.3, -0.3, -0.25, 0.3, -0.3,
    // Bottom
    -0.25, 0.25, 0.3, 0.25, 0.25, 0.3, 0.25, 0.25, -0.3, -0.25, 0.25, -0.3,
    // Left
    0.25, 0.25, -0.3, 0.25, 0.25, 0.3, 0.25, 0.3, 0.3, 0.25, 0.3, -0.3,
    // Left
    -0.25, 0.25, -0.3, -0.25, 0.25, 0.3, -0.25, 0.3, 0.3, -0.25, 0.3, -0.3,

    // BOTTOM SIDE
    // Front
    -0.25, -0.3, 0.3, 0.25, -0.3, 0.3, 0.25, -0.25, 0.3, -0.25, -0.25, 0.3,
    // Back
    -0.25, -0.3, -0.3, 0.25, -0.3, -0.3, 0.25, -0.25, -0.3, -0.25, -0.25, -0.3,
    // Top
    -0.25, -0.25, 0.3, 0.25, -0.25, 0.3, 0.25, -0.25, -0.3, -0.25, -0.25, -0.3,
    // Bottom
    -0.25, -0.3, 0.3, 0.25, -0.3, 0.3, 0.25, -0.3, -0.3, -0.25, -0.3, -0.3,
    // Left
    0.25, -0.3, -0.3, 0.25, -0.3, 0.3, 0.25, -0.25, 0.3, 0.25, -0.25, -0.3,
    // Left
    -0.25, -0.3, -0.3, -0.25, -0.3, 0.3, -0.25, -0.25, 0.3, -0.25, -0.25, -0.3,
  ],
  vertexNormals: [
    // LEFT SIDE
    // Front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // Back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    // Top
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // Bottom
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    // Top
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // Bottom
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,

    // RIGHT SIDE
    // Front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // Back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    // Top
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // Bottom
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    // Top
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // Bottom
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,

    // TOP SIDE
    // Front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // Back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    // Top
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // Bottom
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    // Top
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // Bottom
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,

    // BOTTOM SIDE
    // Front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // Back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    // Top
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // Bottom
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    // Top
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // Bottom
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
  ],
  vertexColors: [
    // LEFT SIDE
    // Front
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    // Back
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    // Top
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    // Bottom
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    // Right
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    // Left
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,

    // RIGHT SIDE
    // Front
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    // Back
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    // Top
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    // Bottom
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    // Right
    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
    // Left
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,

    // TOP SIDE
    // Front
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,
    // Back
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,
    // Top
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,
    // Bottom
    0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
    // Right
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,
    // Left
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,

    // BOTTOM SIDE
    // Front
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,
    // Back
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,
    // Top
    0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
    // Bottom
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,
    // Right
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,
    // Left
    0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8, 0, 0.8, 0.8,
  ]
};

var prism = {
  name: 'prism',
  vertexPositions: [
    // FRONT side
    // left
    -0.3, -0.3, 0.3,
    -0.25, -0.25, 0.3,
    0.0, 0.25, 0.3,
    0.0, 0.3, 0.3,
    // right
    0.0, 0.3, 0.3,
    0.0, 0.25, 0.3,
    0.25, -0.25, 0.3,
    0.3, -0.3, 0.3,
    // bottom
    -0.25, -0.25, 0.3,
    -0.3, -0.3, 0.3,
    0.3, -0.3, 0.3,
    0.25, -0.25, 0.3,

    // BACK side
    // left
    -0.3, -0.3, -0.3,
    -0.25, -0.25, -0.3,
    0.0, 0.25, -0.3,
    0.0, 0.3, -0.3,
    // right
    0.0, 0.3, -0.3,
    0.0, 0.25, -0.3,
    0.25, -0.25, -0.3,
    0.3, -0.3, -0.3,
    // bottom
    -0.25, -0.25, -0.3,
    -0.3, -0.3, -0.3,
    0.3, -0.3, -0.3,
    0.25, -0.25, -0.3,

    // LEFT side
    // outer
    0.0, 0.3, 0.3,
    0.0, 0.3, -0.3,
    -0.3, -0.3, -0.3,
    -0.3, -0.3, 0.3,
    // inner
    0.0, 0.25, 0.3,
    -0.25, -0.25, 0.3,
    -0.25, -0.25, -0.3,
    0.0, 0.25, -0.3,

    // Right side
    // outer
    0.0, 0.3, 0.3,
    0.3, -0.3, 0.3,
    0.3, -0.3, -0.3,
    0.0, 0.3,- 0.3,
    // inner
    0.0, 0.25, 0.3,
    0.0, 0.25, -0.3,
    0.25, -0.25, -0.3,
    0.25, -0.25, 0.3,

    // Bottom side
    // outer
    -0.3, -0.3, 0.3,
    -0.3, -0.3, -0.3,
    0.3, -0.3, -0.3,
    0.3, -0.3, 0.3,
    // inner
    -0.25, -0.25, 0.3,
    0.25, -0.25, 0.3,
    0.25, -0.25, -0.3,
    -0.25, -0.25, -0.3,
  ],
  vertexNormals: [
    // FRONT side
    // left
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    // right
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    // bottom
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // BACK side
    // left
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    // right
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    // bottom
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    // LEFT side
    // outer
    -0.36, 0.18, 0,
    -0.36, 0.18, 0,
    -0.36, 0.18, 0,
    -0.36, 0.18, 0,
    // inner
    0.3, -0.15, 0,
    0.3, -0.15, 0,
    0.3, -0.15, 0,
    0.3, -0.15, 0,

    // Right side
    // outer
    0.36, 0.18, 0,
    0.36, 0.18, 0,
    0.36, 0.18, 0,
    0.36, 0.18, 0,
    // inner
    -0.3, -0.15, 0,
    -0.3, -0.15, 0,
    -0.3, -0.15, 0,
    -0.3, -0.15, 0,

    // Bottom side
    // outer
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    // inner
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
  ],
  vertexColors: [
    // FRONT side
    // left
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    // right
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    // bottom
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,

    // BACK side
    // left
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    // right
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    // bottom
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,
    0.8, 0.3, 0.5,

    // LEFT side
    // outer
    0.3, 0.5, 0.8,
    0.3, 0.5, 0.8,
    0.3, 0.5, 0.8,
    0.3, 0.5, 0.8,
    // inner
    0.9, 0.9, 0.9,
    0.9, 0.9, 0.9,
    0.9, 0.9, 0.9,
    0.9, 0.9, 0.9,

    // Right side
    // outer
    0.3, 0.5, 0.8,
    0.3, 0.5, 0.8,
    0.3, 0.5, 0.8,
    0.3, 0.5, 0.8,
    // inner
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,
    0.8, 0.8, 0.8,

    // Bottom side
    // outer
    0.3, 0.5, 0.8,
    0.3, 0.5, 0.8,
    0.3, 0.5, 0.8,
    0.3, 0.5, 0.8,
    // inner
    0.7, 0.7, 0.7,
    0.7, 0.7, 0.7,
    0.7, 0.7, 0.7,
    0.7, 0.7, 0.7,
  ]
};

hollowModel = pyramid;
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
  setGeometry(gl, hollowModel.vertexPositions);

  // Create and store data into color buffer
  var color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  setColors(gl, hollowModel.vertexColors);

  var normal_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hollowModel.vertexNormals), gl.STATIC_DRAW);

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
  const fov = 75 * Math.PI / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const near = 0.1;
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
  updateAngleY();

  var proj_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  var model_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  for (var i = 0; i < 12 * 4 * 4; i++) {
    vertices.push(hollowModel.vertexPositions[i]);
  }

  const numVertices = hollowModel.vertexPositions.length / 3;

  objects.push({
    "name": hollowModel.name,
    "offset": 0,
    "end": numVertices,
    "numVertices": numVertices,
    "vertices": vertices,
    "color": hollowModel.vertexColors,
    "normals": hollowModel.vertexNormals,
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

function modelHandler() {
  var modelName = document.getElementById("model").value;
  if (modelName == "pyramid") {
    hollowModel = pyramid;
  } else if (modelName == "hollow-cube") {
    hollowModel = hollowCube;
  } else {
    hollowModel = prism;
  }
  console.log("model changed to " + modelName);
  setup();
  for (var i = 0; i < objects.length; i++) {
    draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);
  }
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
function rotateX(rad) {
  return [
      1, 0, 0, 0,
      0, Math.cos(rad), -Math.sin(rad), 0,
      0, Math.sin(rad), Math.cos(rad), 0,
      0, 0, 0, 1
  ];
}

function rotateY(rad) {
  return [
      Math.cos(rad), 0, Math.sin(rad), 0,
      0, 1, 0, 0,
      -Math.sin(rad), 0, Math.cos(rad), 0,
      0, 0, 0, 1
  ]
}

function rotateZ(rad) {
  return [
      Math.cos(rad), -Math.sin(rad), 0, 0,
      Math.sin(rad), Math.cos(rad), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
  ]
}

function rotationMatrix(x, y, z) {
  // x : deg, y : deg, z : deg

  // get radian value
  x *= Math.PI / 180;
  y *= Math.PI / 180;
  z *= Math.PI / 180;

  // get rotation matrix
  var matx = rotateX(x);
  var maty = rotateY(y);
  var matz = rotateZ(z);

  // 
  return multiply(matx, multiply(maty, matz));
}
function updateTranslate(obj,axis, value){
  var idx=0;
  for (var i = 0; i <objects.length; i++){
    if(objects[i].name == obj){
        idx = i;
        break;
    }
  }
  if(axis == 'x'){
      var model_matrix = translation(value, 0, 0);  
  }
  else{
    console.log("masuk y");
      var model_matrix = translation(0, value, 0);
  }

  let currentModelMatrix = objects[idx].modelMatrix;
  for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
          let sum = 0;
          for (var k = 0; k < 4; k++)
              sum = sum + currentModelMatrix[i * 4 + k] * model_matrix[k * 4 + j];
              objects[idx].modelMatrix[i * 4 + j] = sum;
      }
  }
  for(var i = 0; i<objects.length; i++){
    console.log(objects[i].offset);
    console.log(objects[i].modelMatrix.length);
    console.log(objects[i].projMatrix.length);
    setup();
      draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);  
  }
}
function updateRotation(obj, x, y, z) {
  var idx=0;
  for (var i = 0; i <objects.length; i++){
    if(objects[i].name == obj){
        idx = i;
        break;
    }
  }
  let centerPoint = getCenterPoint(objects[idx].offset*12, objects[idx].offset*12 + objects[idx].numVertices*3,vertices);
  var translate_matrix1 = translation(-centerPoint[0], -centerPoint[1], 0);
  var translate_matrix2 = translation(centerPoint[0], centerPoint[1], 0);
  var rotation_matrix = rotationMatrix(x, y, z);

  var trans = multiply(translate_matrix1, multiply(rotation_matrix, translate_matrix2));
  objects[idx].modelMatrix = multiply(trans, objects[idx].modelMatrix)

  for(var i = 0; i<objects.length; i++){
    draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);  
  }
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
      //translation
      const xTranslation= document.getElementById('translation-x');
      const yTranslation= document.getElementById('translation-y');
      const zTranslation= document.getElementById('translation-z');
      //rotation
      const rotXInput = document.getElementById('rotation-x');
      const rotYInput = document.getElementById('rotation-y');
      const rotZInput = document.getElementById('rotation-z');
      xTranslation.addEventListener('input',()=>{
        const xValue= xTranslation.value;
        console.log(xValue);
        updateTranslate(activeButtonValues,'x',xValue);
      });
      yTranslation.addEventListener('input',()=>{
        const yValue= yTranslation.value;
        updateTranslate(activeButtonValues,'y',yValue);
      });

      zTranslation.addEventListener('input',()=>{
        const zValue= zTranslation.value;
        console.log(zValue);
        updateTranslate(activeButtonValues,'z',zValue);

      });
      scaleInput.addEventListener('input', () => {
        const scaleValue= scaleInput.value;
        updateScale(activeButtonValue,scaleValue)
      });
      rotXInput.addEventListener('input', () => {
        const rotxValue = rotXInput.value;
        const deltarotx =  rotxValue - anglex;
        anglex = rotxValue;
        updateRotation(activeButtonValue, deltarotx, 0, 0)
      })
      rotYInput.addEventListener('input', () => {
        const rotyValue = rotYInput.value;
        const deltaroty =  rotyValue - angley;
        angley = rotyValue;
        updateRotation(activeButtonValue, 0, deltaroty, 0)
      })
      rotZInput.addEventListener('input', () => {
        const rotzValue = rotZInput.value;
        const deltarotz =  rotzValue - anglez;
        anglez = rotzValue;
        updateRotation(activeButtonValue, 0, 0, deltarotz)
      })
    }
  });
});
function save() {
  const object = JSON.stringify(objects, null, 4);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(object)}`;
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', dataUri);
  downloadLink.setAttribute('download', 'model.json');
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
const fileUpload = document.getElementById("load");
fileUpload.addEventListener("change", importData);
  
async function importData() {
  if (fileUpload.value !== "") {
    const path = (window.URL || window.webkitURL).createObjectURL(fileUpload.files[0]);
    await initModel(path);
  }
}
async function initModel(filename) {
  const modelJson = await loadFile(filename);
  console.log(modelJson);
  hollowModel = JSON.parse(modelJson);
  const reset = document.getElementById("reset-button");
  reset.click();
}

const loadFile = async (filename) => {
  return await fetchFile(filename);
};

async function fetchFile(filename) {
  return await fetch(filename).then((res) => res.text());
};
setup();
setUpInitScene();