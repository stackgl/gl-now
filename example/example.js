var shell = require("../index.js")()

shell.on("gl-init", function() {
  var gl = shell.gl
  
  //Create fragment shader
  var fs = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fs, [
    "void main() {",
      "gl_FragColor = vec4(1, 0, 0, 1);",
    "}"].join("\n"))
  gl.compileShader(fs)

  //Create vertex shader
  var vs = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vs, [
    "attribute vec3 position;",
    "void main() {",
      "gl_Position = vec4(position, 1.0);",
    "}"].join("\n"))
  gl.compileShader(vs)

  //Link
  var shader = gl.createProgram()
  gl.attachShader(shader, fs)
  gl.attachShader(shader, vs)
  gl.linkProgram(shader)
  gl.useProgram(shader)
  
  //Create buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, 0, 0,
    0, -1, 0,
    1, 1, 0
  ]), gl.STATIC_DRAW)
  
  //Set up attribute pointer
  var position_attribute = gl.getAttribLocation(shader, "position")
  gl.enableVertexAttribArray(position_attribute)
  gl.vertexAttribPointer(position_attribute, 3, gl.FLOAT, false, 0, 0)
})

shell.on("gl-render", function(t) {
  var gl = shell.gl

  //Draw arrays
  gl.drawArrays(gl.TRIANGLES, 0, 3)
})