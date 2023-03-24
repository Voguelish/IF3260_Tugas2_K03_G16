var vertices=[];
var oldAngle=0;
var objects=[];
function check(canvas){
  let gl = ['experimental-webgl','webgl','moz-webgl'];
  let flag;
  for(let i=0; i<gl.length;i++){
    try{
      flag=canvas.getContext(gl[i]);
      console.log(canvas.getContext(gl[i]));
    }
    catch(e){}
    if(flag){
      break;
    }
  }
  if(!flag){
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
  
const fragmentShaderText = 'precision mediump float;'+
'varying vec3 vColor;'+
'varying vec3 vLighting;'+

'void main(void) {'+
    'gl_FragColor = vec4(vColor, 1.);'+
    'gl_FragColor.rgb *= vLighting;'+
'}';
function createShader(gl,type, source) {
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

function createProgram(gl,vertexShader, fragmentShader) {
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
function setGeometry(gl,vertices) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.STATIC_DRAW);
}
// Fill the buffer with colors for the 'F'.
function setColors(gl,colors) {
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
  -0.2,-0.2,0.2, -0.18,-0.2,0.2, -0.18,-0.2,-0.2, -0.2,-0.2,-0.2,
  0.18,-0.2,0.2, 0.2,-0.2,0.2, 0.2,-0.2,-0.2, 0.18,-0.2,-0.2,
  -0.2,-0.2,0.2, 0.2,-0.2,0.2, 0.2,-0.2,0.18, -0.2,-0.2,0.18,
  -0.2,-0.2,-0.2, 0.2,-0.2,-0.2, 0.2,-0.2,-0.18, -0.2,-0.2,-0.18,

  //right face
  0.2,-0.2,0.2, 0.2,-0.2,0.18, 0,0.2,-0.01, 0,0.2,0.01,
  0.2,-0.2,-0.2, 0.2,-0.2,-0.18, 0,0.2,0.01, 0,0.2,-0.01,
  0.2,-0.2,0.2, 0.2,-0.2,-0.2, 0.18,-0.18,-0.18, 0.18,-0.18,0.18,

  //front face
  -0.2,-0.2,0.2, 0.2,-0.2,0.2, 0.18,-0.18,0.18, -0.18,-0.18,0.18,
  -0.2,-0.2,0.2, -0.18,-0.2,0.2, 0.02,0.2,0.02, 0,0.2,0.02,
  0.18,-0.2,0.2, 0.2,-0.2,0.2, 0.02,0.2,0.02, 0,0.2,0.02,

  //left face
  -0.2,-0.2,0.2, -0.2,-0.2,0.18, 0,0.2,-0.01, 0,0.2,0.01,
  -0.2,-0.2,-0.2, -0.2,-0.2,-0.18, 0,0.2,0.01, 0,0.2,-0.01,
  -0.2,-0.2,0.2, -0.2,-0.2,-0.2, -0.18,-0.18,-0.18, -0.18,-0.18,0.18,

  //back face
  -0.2,-0.2,-0.2, 0.2,-0.2,-0.2, 0.18,-0.18,-0.18, -0.18,-0.18,-0.18,
  -0.2,-0.2,-0.2, -0.18,-0.2,-0.2, 0.02,0.2,0.02, 0,0.2,0.02,
  0.18,-0.2,-0.2, 0.2,-0.2,-0.2, 0.02,0.2,0.02, 0,0.2,0.02,
];
var vertexNormals = [
   //bottom
   0.0,-1.0,0.0, 0.0,-1.0,0.0, 0.0,-1.0,0.0, 0.0,-1.0,0.0,
   0.0,-1.0,0.0, 0.0,-1.0,0.0, 0.0,-1.0,0.0, 0.0,-1.0,0.0,
   0.0,-1.0,0.0, 0.0,-1.0,0.0, 0.0,-1.0,0.0, 0.0,-1.0,0.0,
   0.0,-1.0,0.0, 0.0,-1.0,0.0, 0.0,-1.0,0.0, 0.0,-1.0,0.0,

   //right
   0.5,0.5,0.0, 0.5,0.5,0.0, 0.5,0.5,0.0, 0.5,0.5,0.0,
   0.5,0.5,0.0, 0.5,0.5,0.0, 0.5,0.5,0.0, 0.5,0.5,0.0,
   0.5,0.5,0.0, 0.5,0.5,0.0, 0.5,0.5,0.0, 0.5,0.5,0.0,

   //front
   0.0,0.0,1.0, 0.0,0.0,1.0, 0.0,0.0,1.0, 0.0,0.0,1.0,
   0.0,0.5,0.5, 0.0,0.5,0.5, 0.0,0.5,0.5, 0.0,0.5,0.5,
   0.0,0.5,0.5, 0.0,0.5,0.5, 0.0,0.5,0.5, 0.0,0.5,0.5,

   //left
   -0.5,0.5,0.0, -0.5,0.5,0.0, -0.5,0.5,0.0, -0.5,0.5,0.0,
   -0.5,0.5,0.0, -0.5,0.5,0.0, -0.5,0.5,0.0, -0.5,0.5,0.0,
   -0.5,0.5,0.0, -0.5,0.5,0.0, -0.5,0.5,0.0, -0.5,0.5,0.0,

   //back
   0.0,0.5,-0.5, 0.0,0.5,-0.5, 0.0,0.5,-0.5, 0.0,0.5,-0.5,
   0.0,0.5,-0.5, 0.0,0.5,-0.5, 0.0,0.5,-0.5, 0.0,0.5,-0.5,
   0.0,0.5,-0.5, 0.0,0.5,-0.5, 0.0,0.5,-0.5, 0.0,0.5,-0.5
];
var colors = [
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,

  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,

  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,

  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,

  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,

  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,

];
for (var i = 0; i < 12*4*4; i++){
  vertices.push(pyramid[i]);
}
const canvas = document.getElementById("canvas");
const gl = check(canvas);
var oldAngle = 0;  
function setup(){
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  canvas.width = Math.round(95 / 100 * vw)
  canvas.height = Math.round(95 / 100 * vh)
  // Setup Shaders
  var vertexShader= createShader(gl, gl.VERTEX_SHADER, vertexShaderText);
  var fragmentShader= createShader(gl,gl.FRAGMENT_SHADER, fragmentShaderText);
  var program = createProgram(gl,vertexShader, fragmentShader);
  var vertBuff= gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuff);
  setGeometry(gl,pyramid);
   // Create and store data into color buffer
   var color_buffer = gl.createBuffer ();
   gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
   setColors(gl,colors);

   var normal_buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),gl.STATIC_DRAW);
  
   _Pmatrix = gl.getUniformLocation(program, "Pmatrix");
   _Vmatrix = gl.getUniformLocation(program, "Vmatrix");
   _Mmatrix = gl.getUniformLocation(program, "Mmatrix");
   _Nmatrix = gl.getUniformLocation(program, "Nmatrix");
 
   gl.bindBuffer(gl.ARRAY_BUFFER, vertBuff);
   var _position = gl.getAttribLocation(program, "position");
   gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
   gl.enableVertexAttribArray(_position);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  var _color = gl.getAttribLocation(program, "color");
  gl.vertexAttribPointer(_color, 3, gl.FLOAT, false,0,0) ;
  gl.enableVertexAttribArray(_color);

  gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
  var _normal = gl.getAttribLocation(program, "normal");
  gl.vertexAttribPointer(_normal, 3, gl.FLOAT, false,0,0);
  gl.enableVertexAttribArray(_normal);
  
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(1, 1, 1, 1);
  gl.clearDepth(1.0);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
  var view_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-2,1 ];
  // draw object
  function draw(proj_matrix, model_matrix, start, end){
     gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix);
     gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);
     gl.uniformMatrix4fv(_Mmatrix, false, model_matrix);
     console.log(_Mmatrix);
     console.log(_Vmatrix);
     console.log(_Pmatrix);

      let normalMatrix = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
      gl.uniformMatrix4fv(_Nmatrix, false, normalMatrix);

     for (var i = start; i < end; i++){
      gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);        
      console.log("masuk gambar" );
     }
  }

  function setUpInitScene(){
    document.getElementById('angle').value = oldAngle;
    var proj_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,0,0, 0,0,0,1 ];
    var model_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ]; 
    objects.push({
       "name" : "pyramid",
       "offset" : 0,
       "end" : 16,
       "numVertices" : 64,
       "vertices" : vertices,
       "color" : colors,
       "normals" : vertexNormals.slice(96*3, 96*3+64*3),
       "projMatrix" : proj_matrix,
       "modelMatrix" : model_matrix
    }); 
    for(var i = 0; i<objects.length; i++){
      console.log(objects[i].vertices); 
      draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);  
      }
      oldAngle = 0;
      document.getElementById('angle').value = oldAngle;
 }
setup();
setUpInitScene();
function yRotate(angleInRadians) {
  return [
    Math.cos(angleInRadians) , 0, Math.sin(angleInRadians), 0,
    0                        , 1, 0                       , 0,
    -Math.sin(angleInRadians), 0, Math.cos(angleInRadians), 0,
    0                        , 0, 0                       , 1,
  ];
}
function updateAngleY(){
  let value = document.getElementById('angle').value;
  value = value*Math.PI/180;
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
    view_matrix=product;
    // view_matrix = multiply(yRotate(move), view_matrix);
  setup();
  for(var i = 0; i<objects.length; i++){
      draw(objects[i].projMatrix, objects[i].modelMatrix, objects[i].offset, objects[i].end);  
  }

  oldAngle = value;
}