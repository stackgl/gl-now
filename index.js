"use strict"

var makeGameShell = require("game-shell")
var webglew = require("webglew")

function createGLShell(options) {
  options = options || {}
  
  var extensions = options.extensions || []

  //First create shell
  var shell = makeGameShell(options)
  var scale = shell.scale || 1

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

    //Add variables to game-shell
    shell.canvas = canvas
    shell.gl = gl

    //Load width/height
    resize()

    //Load default parameters
    shell.clearFlags = options.clearFlags === undefined ? (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) : options.clearFlags
    shell.clearColor = options.clearColor || [0.2, 0.4, 0.8, 1.0]
    shell.clearDepth = options.clearDepth || 1.0
    shell.clearStencil = options.clearStencil || 0

    shell.on("resize", resize)

    //Hook render event
    shell.on("render", function renderGLNow(t) {
    
      //Bind default framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      
      //Set viewport
      gl.viewport(0, 0, (shell._width / scale)|0, (shell._height / scale)|0)

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



  function resize() {
    shell.canvas.width = (shell._width / scale)|0
    shell.canvas.height = (shell._height / scale)|0
    shell.canvas.style.width = shell._width + 'px'
    shell.canvas.style.height = shell._height + 'px'
  }

  Object.defineProperty(shell, 'scale', {
    get: function() {
      return scale
    },
    set: function(_scale) {
      _scale = +_scale
      if((_scale <= 0) || isNaN(_scale) || (scale === _scale)) {
        return scale
      }
      scale = _scale
      resize()
      return scale
    }
  })

  Object.defineProperty(shell, "width", {
    get: function() {
      return (shell._width / scale)|0
    }
  })

  Object.defineProperty(shell, "height", {
    get: function() {
      return (shell._height / scale)|0
    }
  })

  return shell
}

module.exports = createGLShell