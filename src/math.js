// // Create a 4x4 identity matrix
// function identityMatrix() {
//     return [
//         [1, 0, 0, 0],
//         [0, 1, 0, 0],
//         [0, 0, 1, 0],
//         [0, 0, 0, 1]
//     ];
// }

// // Multiply two 4x4 matrices
// function multiplyMatrices(matrix1, matrix2) {
//     var result = [];
//     for (var i = 0; i < 4; i++) {
//         result[i] = [];
//         for (var j = 0; j < 4; j++) {
//             result[i][j] = 0;
//             for (var k = 0; k < 4; k++) {
//                 result[i][j] += matrix1[i][k] * matrix2[k][j];
//             }
//         }
//     }
//     return result;
// }

// // Create a translation matrix
// function translationMatrix(tx, ty, tz) {
//     return [
//         [1, 0, 0, tx],
//         [0, 1, 0, ty],
//         [0, 0, 1, tz],
//         [0, 0, 0, 1]
//     ];
// }

// // Create a rotation matrix around the X axis
// function rotationXMatrix(theta) {
//     const cosTheta = Math.cos(theta);
//     const sinTheta = Math.sin(theta);
//     return [
//         [1, 0, 0, 0],
//         [0, cosTheta, -sinTheta, 0],
//         [0, sinTheta, cosTheta, 0],
//         [0, 0, 0, 1]
//     ];
// }

// // Create a rotation matrix around the Y axis
// function rotationYMatrix(theta) {
//     const cosTheta = Math.cos(theta);
//     const sinTheta = Math.sin(theta);
//     return [
//         [cosTheta, 0, sinTheta, 0],
//         [0, 1, 0, 0],
//         [-sinTheta, 0, cosTheta, 0],
//         [0, 0, 0, 1]
//     ];
// }

// // Create a rotation matrix around the Z axis
// function rotationZMatrix(theta) {
//     const cosTheta = Math.cos(theta);
//     const sinTheta = Math.sin(theta);
//     return [
//         [cosTheta, -sinTheta, 0, 0],
//         [sinTheta, cosTheta, 0, 0],
//         [0, 0, 1, 0],
//         [0, 0, 0, 1]
//     ];
// }

// // Create a scaling matrix
// function scalingMatrix(sx, sy, sz) {
//     return [
//         [sx, 0, 0, 0],
//         [0, sy, 0, 0],
//         [0, 0, sz, 0],
//         [0, 0, 0, 1]
//     ];
// }

// // Create a perspective matrix
// function perspectiveMatrix(fovy, aspect, near, far) {
//     const f = 1.0 / Math.tan(fovy / 2);
//     const nf = 1 / (near - far);
//     return [
//         [f / aspect, 0, 0, 0],
//         [0, f, 0, 0],
//         [0, 0, (far + near) * nf, -1],
//         [0, 0, 2 * far * near * nf, 0]
//     ];
// }

// // Create an orthographic projection matrix
// function orthographicMatrix(left, right, bottom, top, n  ear, far) {
//     const tx = -(right + left) / (right - left);
//     const ty = -(top + bottom) / (top - bottom);
//     const tz = -(far + near) / (far - near);

//     return [2 / (right - left), 0, 0, tx, 0, 2 / (top - bottom), 0, ty, 0, 0, -2 / (far - near), tz, 0, 0, 0, 1];
// }

// // Create an oblique projection matrix
// function obliqueMatrix(alpha, phi) {
//     const s = 1 / Math.tan(degreesToRadians(alpha));
//     const c = 1 / Math.tan(degreesToRadians(phi));

//     return [1, 0, c, 0, 0, 1, s, 0, 0, 0, 1, 0, 0, 0, 0, 1];
// }

// // Convert degrees to radians
// function degreesToRadians(degrees) {
//     return degrees * (Math.PI / 180);
// }

// // Convert radians to degrees
// function radiansToDegrees(radians) {
//     return radians * (180 / Math.PI);
// }

// export {
//     identityMatrix,
//     multiplyMatrices,
//     translationMatrix,
//     rotationXMatrix,
//     rotationYMatrix,
//     rotationZMatrix,
//     scalingMatrix,
//     perspectiveMatrix,
//     orthographicMatrix,
//     obliqueMatrix,
//     degreesToRadians,
//     radiansToDegrees
// };