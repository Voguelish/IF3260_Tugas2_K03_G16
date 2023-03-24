var vertices = [];
var oldAngle = 0;
var objects = [];
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
for (var i = 0; i < 12 * 4 * 4; i++) {
  vertices.push(pyramid[i]);
}
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
var view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -2, 1];
// draw object
function draw(proj_matrix, model_matrix, start, end) {
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
setup();
setUpInitScene();
function yRotate(angleInRadians) {
  return [
    Math.cos(angleInRadians), 0, Math.sin(angleInRadians), 0,
    0, 1, 0, 0,
    -Math.sin(angleInRadians), 0, Math.cos(angleInRadians), 0,
    0, 0, 0, 1,
  ];
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
function getCenterPoint(start, end, arr){
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
function translation(tx, ty, tz){
  return [
      1,  0,  0,  0,
      0,  1,  0,  0,
      0,  0,  1,  0,
      tx, ty, tz, 1,
  ];
}

function scale(sx, sy, sz){
  return [
    sx, 0,  0,  0,
    0, sy,  0,  0,
    0,  0, sz,  0,
    0,  0,  0,  1,
  ];
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
  let centerPoint = getCenterPoint(objects[idx].offset*12, objects[idx].offset*12 + objects[idx].numVertices*3,vertices);
  var translate_matrix1 = translation(-centerPoint[0], -centerPoint[1], 0);
  var translate_matrix2 = translation(centerPoint[0], centerPoint[1], 0);
  var scale_matrix = scale(value, value, value);
  const product=[];
  for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
          let sum = 0;
          for (var k = 0; k < 4; k++)
              sum = sum + scale_matrix[i * 4 + k] * translate_matrix2[k * 4 + j];
          product[i * 4 + j] = sum;
      }
  }
  const model_matrix=[];
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
    console.log(objects[i].offset.length);
    draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);  
  }
}
const buttons = document.querySelectorAll('#button-container button');
let activeButtonValues="";
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
      const xTranslation= document.getElementById('translation-x');
      const yTranslation= document.getElementById('translation-y');
      const zTranslation= document.getElementById('translation-z');
      xTranslation.addEventListener('change',(e)=>{
        e.preventDefault();
        console.log("pppyramid");

        const xValue= xTranslation.value;
        console.log(xValue);
        updateTranslate(activeButtonValues,'x',xValue);

      });
      yTranslation.addEventListener('change',(e)=>{
        e.preventDefault();
        console.log("pppyramid");

        const yValue= yTranslation.value;
        console.log(yValue);
        updateTranslate(activeButtonValues,'y',yValue);
      });

      zTranslation.addEventListener('change',(e)=>{
        e.preventDefault();
        console.log("pppyramid");

        const zValue= zTranslation.value;
        console.log(zValue);
        updateTranslate(activeButtonValues,'z',zValue);

      });

      const scaleInput = document.getElementById('scale');
      scaleInput.addEventListener("input", (e) => {
        e.preventDefault();
        const scaleValue = scaleInput.value;
        updateScale(activeButtonValues,scaleValue)
      });  
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

// function load() {
//   const inputFile = document.getElementById('load');
//   const file = inputFile.files[0];
//   if (!file) {
//     return;
//   }
//   const reader = new FileReader();
//   reader.onload = function(event) {
//     const contents = event.target.result;
//     const objects= JSON.parse(contents); 
//     document.getElementById('angle').value = 0;
//     for(var j = 0; j<objects.length; i++){
//         draw(objects[j].projMatrix, objects[j].modelMatrix, objects[j].offset, objects[j].end);
//     }
    
//   };
//   reader.readAsText(file);
// }