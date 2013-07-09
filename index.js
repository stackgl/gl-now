"use strict"

var makeGameShell = require("game-shell")
var webglew = require("webglew")

function createGLShell(options) {
  options = options || {}
  
  var extensions = options.extensions || []

  //First create shell
  var shell = makeGameShell(options)

  shell.on("init", function initGLNow() {
  
    //Create canvas
    var canvas = document.createElement("canvas")
    
    //Try initializing WebGL
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if(!gl) {
      shell.emit("gl-error", new Error("Unable to initialize WebGL"))
      return
    }
    
    //Check extensions
    var ext = webglew(gl)
    for(var i=0; i<extensions.length; ++i) {
      if(!(extensions[i] in ext)) {
        shell.emit("gl-error", new Error("Missing extension: " + extensions[i]))
        return
      }
    }

    //Set canvas style
    canvas.style.position = "absolute"
    canvas.style.left = "0px"
    canvas.style.top = "0px"
    shell.element.appendChild(canvas)

    //Load width/height
    canvas.width = shell.width
    canvas.height = shell.height
    
    //Add variables to game-shell
    shell.canvas = canvas
    shell.gl = gl
    
    //Load default parameters
    shell.clearFlags = options.clearFlags === undefined ? (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) : options.clearFlags
    shell.clearColor = options.clearColor || [0.2, 0.4, 0.8, 1.0]
    shell.clearDepth = options.clearDepth || 1.0
    shell.clearStencil = options.clearStencil || 0
    
    shell.on("resize", function(w, h) {
      canvas.width = w
      canvas.height = h
    })

    //Hook render event
    shell.on("render", function renderGLNow(t) {
    
      //Bind default framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      
      //Set viewport
      gl.viewport(0, 0, shell.width, shell.height)
      
      //Clear buffers
      if(shell.clearFlags & gl.STENCIL_BUFFER_BIT) {
        gl.clearStencil(shell.clearStencil)
      }
      if(shell.clearFlags & gl.COLOR_BUFFER_BIT) {
        gl.clearColor(shell.clearColor[0], shell.clearColor[1], shell.clearColor[2], shell.clearColor[3])
      }
      if(shell.clearFlags & gl.DEPTH_BUFFER_BIT) {
        gl.clearDepth(shell.clearDepth)
      }
      if(shell.clearFlags) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
      }
    
      //Render frame
      shell.emit("gl-render", t)
    })
    
    //WebGL initialized
    shell.emit("gl-init")
  })
  
  return shell
}

module.exports = createGLShell