// 创建和编译着色器 
function createShader(gl, type, source) { const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { console.error('Error compiling shader:', gl.getShaderInfoLog(shader)); gl.deleteShader(shader); return null; } return shader; }

// 创建和链接程序 
function createProgram(gl, vertexShader, fragmentShader) { const program = gl.createProgram(); gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.error('Error linking program:', gl.getProgramInfoLog(program)); gl.deleteProgram(program); return null; } return program; }

// 创建和设置纹理 
function createTexture(gl, width, height, data)
{
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

// 获取 canvas 元素并创建 WebGL 上下文
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

console.log("gl", gl);
// 顶点着色器源代码
const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = a_position;
    v_texCoord = a_texCoord;
  }
`;

// 片段着色器源代码
const fragmentShaderSource = `
  precision mediump float;

  uniform sampler2D u_textureY;
  uniform sampler2D u_textureU;
  uniform sampler2D u_textureV;

  varying vec2 v_texCoord;

  void main() {
    float y = texture2D(u_textureY, v_texCoord).r;
    float u = texture2D(u_textureU, v_texCoord).r;
    float v = texture2D(u_textureV, v_texCoord).r;

    u = u - 0.5;
    v = v - 0.5;

    float r = y + 1.403 * v;
    float g = y - 0.344 * u - 0.714 * v;
    float b = y + 1.770 * u;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

// 创建、编译和链接着色器程序
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);
console.log("program", program);

// 获取 attribute 和 uniform 变量的位置
const positionLocation = gl.getAttribLocation(program, 'a_position');
const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
const textureYLocation = gl.getUniformLocation(program, 'u_textureY');
const textureULocation = gl.getUniformLocation(program, 'u_textureU');
const textureVLocation = gl.getUniformLocation(program, 'u_textureV');
console.log("positionLocation", positionLocation);
console.log("texCoordLocation", texCoordLocation);
console.log("textureYLocation", textureYLocation);
console.log("textureULocation", textureULocation);
console.log("textureVLocation", textureVLocation);

// 创建顶点缓冲区并设置顶点数据
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1.0, -1.0,
  1.0, -1.0,
  -1.0, 1.0,
  1.0, 1.0,
]), gl.STATIC_DRAW);

// 创建纹理坐标缓冲区并设置纹理坐标数据
const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  0.0, 1.0,
  1.0, 1.0,
  0.0, 0.0,
  1.0, 0.0,
]), gl.STATIC_DRAW);

// 准备 YUV 数据（这里使用简单的颜色数据作为示例）
const width = 256;
const height = 256;
const yData = new Uint8Array(width * height).fill(255);
const uData = new Uint8Array(width * height).fill(222);
const vData = new Uint8Array(width * height).fill(222);

// 创建并设置 Y、U、V 纹理
const textureY = createTexture(gl, width, height, yData);
const textureU = createTexture(gl, width, height, uData);
const textureV = createTexture(gl, width, height, vData);
console.log("textureY", textureY);
console.log("textureU", textureU);
console.log("textureV", textureV);

// 绘制 YUV 数据到 canvas
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

// 设置顶点数据 
gl.enableVertexAttribArray(positionLocation); gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// 设置纹理坐标数据 
gl.enableVertexAttribArray(texCoordLocation); gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer); gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

// 设置 Y 纹理 
gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, textureY); gl.uniform1i(textureYLocation, 0);

// 设置 U 纹理 
gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, textureU); gl.uniform1i(textureULocation, 1);

// 设置 V 纹理 
gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, textureV); gl.uniform1i(textureVLocation, 2);

// 绘制矩形 
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

