const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');


// Load model from txt file
function loadModelFromFile(file) {
  if (!(file instanceof Blob)) {
    file = new Blob([file], { type: 'text/plain' });
  }

  const reader = new FileReader();
  reader.readAsText(file);

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const vertices = [];
      const indices = new Uint16Array();
      const colors = [];
      const lines = reader.result.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const values = lines[i].trim().split(' ');
        if (values.length === 6) {
          vertices.push(parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]));
          colors.push(parseFloat(values[3]), parseFloat(values[4]), parseFloat(values[5]));
        } else if (values.length === 3) {
          indices.push(parseInt(values[0]), parseInt(values[1]), parseInt(values[2]));
        }
      }
      resolve({ vertices, indices, colors });
    };

    reader.onerror = () => {
      reject(`Failed to load model from file ${file}.`);
    };
  });
}

let modelData;

async function loadAndUseModel() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    modelData = await loadModelFromFile(file);
    console.log(modelData);

    // Define vertices, indices, and colors of model
    const vertices = modelData.vertices;
    const indices = modelData.indices;
    const colors = modelData.colors;

    // Create buffers
    const vertexBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    // Bind buffers to attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColorLocation);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Draw scene
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  });
  document.body.appendChild(fileInput);
}

loadAndUseModel();


// Define vertices, indices, and colors of model
const vertices = model.vertices;
const indices = model.indices;
const colors = model.colors;

// Create buffers
const vertexBuffer = gl.createBuffer();
const indexBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();

// Bind buffers
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPositionLocation);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aColorLocation);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// Draw model
function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set model matrix
  const modelMatrix = mat4.create();
  mat4.rotateY(modelMatrix, modelMatrix, performance.now() / 1000);
  gl.uniformMatrix4fv(uModelMatrixLocation, false, modelMatrix);

  // Set view matrix
  const cameraRadius = 5;
  const cameraHorizontalRotation = 0;
  const cameraVerticalRotation = 0;
  const cameraTranslationX = 0;
  const cameraTranslationY = 0;
  const cameraTranslationZ = 0;

  const viewMatrix = mat4.create();
  mat4.translate(viewMatrix, viewMatrix, [cameraTranslationX, cameraTranslationY, cameraTranslationZ]);
  mat4.rotateX(viewMatrix, viewMatrix, cameraVerticalRotation);
  mat4.rotateY(viewMatrix, viewMatrix, cameraHorizontalRotation);
  mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraRadius]);
  gl.uniformMatrix4fv(uViewMatrixLocation, false, viewMatrix);

  // Set projection matrix
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fov, aspect, near, far);
  gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix);

  // Draw model
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
// Initialize shaders and program
const vertexShaderSource = `
  attribute highp vec4 aPositionLocation;
  attribute vec4 aColorLocation;
  uniform mat4 uModelMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying lowp vec4 vColor;
  void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPositionLocation;
    vColor = aColorLocation;
  }
`;

const fragmentShaderSource = `
  varying lowp vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
`;

// Create vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
  console.error('Failed to compile vertex shader:', gl.getShaderInfoLog(vertexShader));
}

// Create fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
  console.error('Failed to compile fragment shader:', gl.getShaderInfoLog(fragmentShader));
}

// Create shader program
const program = gl.createProgram();
const aPositionLocation = gl.getAttribLocation(program, 'a_position');
const aColorLocation = gl.getAttribLocation(program, 'a_color');
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error('Failed to link program:', gl.getProgramInfoLog(program));
}

// Get attribute and uniform locations
const uModelMatrixLocation = gl.getUniformLocation(program, 'uModelMatrix');
const uViewMatrixLocation = gl.getUniformLocation(program, 'uViewMatrix');
const uProjectionMatrixLocation = gl.getUniformLocation(program, 'uProjectionMatrix');

// Bind buffers
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPositionLocation);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aColorLocation);

gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);

// BELUM BENER
// Set initial camera position and view direction
let cameraPosition = vec3.fromValues(0, 0, 3);
let viewDirection = vec3.fromValues(0, 0, -1);
let up = vec3.fromValues(0, 1, 0);

// Set up perspective projection
const fov = 45 * Math.PI / 180;
const aspect = gl.canvas.width / gl.canvas.height;
const near = 0.1;
const far = 100;
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, fov, aspect, near, far);

// BELUM BENER
// Set up view matrix
const viewMatrix = mat4.create();
mat4.lookAt(viewMatrix, cameraPosition, vec3.add(vec3.create(), cameraPosition, viewDirection), up);

// Set up model matrix
const modelMatrix = mat4.create();
mat4.identity(modelMatrix);

// Set uniform values for projection, view, and model matrices
gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix);
gl.uniformMatrix4fv(uViewMatrixLocation, false, viewMatrix);
gl.uniformMatrix4fv(uModelMatrixLocation, false, modelMatrix);

// Set up uniforms and attributes
gl.useProgram(program);
gl.uniformMatrix4fv(uModelMatrixLocation, false, modelMatrix);
gl.uniformMatrix4fv(uViewMatrixLocation, false, viewMatrix);
gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix);

// Set up transformations and projection
function updateModelMatrix() {
  // Update modelMatrix based on user input
  const translation = vec3.fromValues(
    parseFloat(document.getElementById('translation-x').value),
    parseFloat(document.getElementById('translation-y').value),
    parseFloat(document.getElementById('translation-z').value)
  );
  mat4.identity(modelMatrix);
  mat4.translate(modelMatrix, modelMatrix, translation);

  // Scale only has one value, so we can use the same value for x, y, and z
  const scale = parseFloat(document.getElementById('scale-slider').value);
  mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(scale, scale, scale));

  const rotation = vec3.fromValues(
    parseFloat(document.getElementById('rotation-x').value),
    parseFloat(document.getElementById('rotation-y').value),
    parseFloat(document.getElementById('rotation-z').value)
  );
  mat4.rotateX(modelMatrix, modelMatrix, rotation[0] * Math.PI / 180);
  mat4.rotateY(modelMatrix, modelMatrix, rotation[1] * Math.PI / 180);
  mat4.rotateZ(modelMatrix, modelMatrix, rotation[2] * Math.PI / 180);
}

function updateProjectionMatrix() {
  // Update projectionMatrix based on user input
  const projectionType = document.getElementById('projection-select').value;
  switch (projectionType) {
    case 'orthographic':
      mat4.ortho(projectionMatrix, -1, 1, -1, 1, -10, 10);
      break;
    case 'oblique':
      mat4.set(
        projectionMatrix,
        1, 0, -Math.cos(45 * Math.PI / 180), 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );
      break;
    case 'perspective':
      mat4.perspective(projectionMatrix, 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100);
      break;
  }
}

updateModelMatrix();
updateProjectionMatrix();

// Set up event listeners for transformations and projection
document.getElementById('translation-x').addEventListener('input', updateModelMatrix);
document.getElementById('translation-y').addEventListener('input', updateModelMatrix);
document.getElementById('translation-z').addEventListener('input', updateModelMatrix);
document.getElementById('rotation-x').addEventListener('input', updateModelMatrix);
document.getElementById('rotation-y').addEventListener('input', updateModelMatrix);
document.getElementById('rotation-z').addEventListener('input', updateModelMatrix);
document.getElementById('scale-slider').addEventListener('input', updateModelMatrix);
document.getElementById('projection-select').addEventListener('change', updateProjectionMatrix);

// BELUM BENER
// Set up camera controls
function updateCamera() {
  // camera-radius: camera distance to center
  // camera-horizontal-rotation: rotation around y-axis
  // camera-vertical-rotation: up and down camera rotation
  // camera-translation-x: camera translation along x-axis
  // camera-translation-y: camera translation along y-axis
  // camera-translation-z: camera translation along z-axis
  const radius = parseFloat(document.getElementById('camera-radius').value);
  const horizontalRotation = parseFloat(document.getElementById('camera-horizontal-rotation').value) * Math.PI / 180;
  const verticalRotation = parseFloat(document.getElementById('camera-vertical-rotation').value) * Math.PI / 180;
  const translation = vec3.fromValues(
    parseFloat(document.getElementById('camera-translation-x').value),
    parseFloat(document.getElementById('camera-translation-y').value),
    parseFloat(document.getElementById('camera-translation-z').value)
  );
}

updateCamera();

// Set up event listeners for camera controls
document.getElementById('camera-radius').addEventListener('input', updateCamera);
document.getElementById('camera-horizontal-rotation').addEventListener('input', updateCamera);
document.getElementById('camera-vertical-rotation').addEventListener('input', updateCamera);
document.getElementById('camera-translation-x').addEventListener('input', updateCamera);
document.getElementById('camera-translation-y').addEventListener('input', updateCamera);
document.getElementById('camera-translation-z').addEventListener('input', updateCamera);
