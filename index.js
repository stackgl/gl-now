"use strict"

var makeGameShell = require("game-shell")

function createGLShell(options) {
  options = options || {}

  //First create shell
  var shell = makeGameShell(options)

  shell.on("init", function initGLNow() {
  
    //Create canvas
    var canvas = document.createElement("canvas")
    canvas.style.position = "absolute"
    canvas.style.left = "0px"
    canvas.style.top = "0px"
    shell.element.appendChild(canvas)

    //Load width/height
    var width = shell.element.clientWidth
    var height = shell.element.clientHeight    
    canvas.width = width
    canvas.height = height
    
    //Try initializing WebGL
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if(!gl) {
      throw new Error("Unable to initialize WebGL")
    }
    
    //Add variables to game-shell
    shell.canvas = canvas
    shell.gl = gl
    Object.defineProperty(shell, "width", {
      get: function() { return width }
    })
    Object.defineProperty(shell, "height", {
      get: function() { return height }
    })
    
    //Load default parameters
    shell.clearFlags = options.clearFlags === undefined ? (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) : options.clearFlags
    shell.clearColor = options.clearColor || [0.2, 0.4, 0.8, 1.0]
    shell.clearDepth = options.clearDepth || 1.0
    shell.clearStencil = options.clearStencil || 0
    
    //Called when the window is resized or DOM element updates
    function handleResize() {
      var w = shell.element.clientWidth|0
      var h = shell.element.clientHeight|0
      if((w !== width) || (h !== height)) {
        width = w
        height = h
        canvas.width = width
        canvas.height = height
        shell.emit("resize", width, height)
      }
    }
    
    if(typeof MutationObserver !== "undefined") {
      var observer = new MutationObserver(handleResize)
      observer.observe(shell.element, {
        attributes: true,
        subtree: true
      })
    } else {
      shell.element.addEventListener("DOMSubtreeModified", handleResize)
    }
    window.addEventListener("resize", handleResize)

    shell.on("render", function renderGLNow(t) {
    
      //Bind default framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      
      //Set viewport
      gl.viewport(0, 0, width, height)
      
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