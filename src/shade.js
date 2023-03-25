normalMatrix = invert(multiply(view_matrix, model_matrix));
  transpose(normalMatrix, normalMatrix);

  const invert = (matin) => {
    let matout = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let a00 = matin[0];
    let a01 = matin[1];
    let a02 = matin[2];
    let a03 = matin[3];
    let a10 = matin[4];
    let a11 = matin[5];
    let a12 = matin[6];
    let a13 = matin[7];
    let a20 = matin[8];
    let a21 = matin[9];
    let a22 = matin[10];
    let a23 = matin[11];
    let a30 = matin[12];
    let a31 = matin[13];
    let a32 = matin[14];
    let a33 = matin[15];
  
    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;
    
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  
    if (!det) {
      return null;
    }
  
    det = 1.0 / det;
  
    matout[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    matout[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    matout[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    matout[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    matout[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    matout[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    matout[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    matout[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    matout[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    matout[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    matout[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    matout[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    matout[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    matout[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    matout[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    matout[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    
    return matout;
  };
  