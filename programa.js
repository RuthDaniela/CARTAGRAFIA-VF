var nucleoRotation = 0.0;
var paisRotation = 0.0;
var luna;
var esfpais = [];
var buffersEsferaPais = [];
var cameraAngleRadians;
var fieldOfViewRadians;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var pasoUsuario = 0;

var cameraRotationMatrix = mat4.create();
mat4.identity(cameraRotationMatrix);

main();

///Traducción de texto
function seleccionLenguajeOrigen(objLenguaOrigen) {
  pasoUsuario+=1;
    var lenguajeDestino = objLenguaOrigen.value
    objDestino = document.getElementById("spanTextoOrigen");
    var traduccion = traducirTexto("es", lenguajeDestino, textoOriginal, objDestino);
}

function seleccionLenguajeDestino(objLenguaDestino) {
  pasoUsuario+=1;
    var lenguajeDestino = objLenguaDestino.value
    var lenguajeOrigen = document.getElementById("lenguaOrigen").value;
    ultimoTexto = document.getElementById("spanTextoOrigen").innerHTML;
    var objNuevoDestino = document.getElementById("spanTextoDestino");
    var traduccion = traducirTexto(lenguajeOrigen, lenguajeDestino, ultimoTexto, objNuevoDestino);
}

function traducirTexto(lengcodiOrigen, lengcodiDestino, texto, obj) {
  url = 'ajx_textoTraducido.php?lengcodiOrigen='+lengcodiOrigen+'&lengcodiDestino='+lengcodiDestino+'&texto='+encodeURI(texto);
  ajax.open('GET', url , true);
  ajax.onreadystatechange = function() {
    if(ajax.readyState==4) {
      var textoTraducido=ajax.responseText;
      textoTraducido=textoTraducido.replace(/&#39;/g,"'");
      textoTraducido=textoTraducido.replace(/&quot;/g,'"');
      obj.innerHTML=textoTraducido;
      return textoTraducido;
    }
  }
  ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  ajax.send(null);
}

//Para orbitar en la escena
function handleMouseDown(event) {
  mouseDown = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function handleMouseUp(event) {
  mouseDown = false;
}

function handleMouseMove(event) {

  if (!mouseDown) {
      return;
  }
  var newX = event.clientX;
  var newY = event.clientY;
  var deltaX = lastMouseX - newX
  var newRotationMatrix = mat4.create();
  mat4.identity(newRotationMatrix);
  mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
  var deltaY = lastMouseY - newY;
  mat4.rotate(newRotationMatrix, newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);
  mat4.multiply(cameraRotationMatrix, cameraRotationMatrix, newRotationMatrix );
  lastMouseX = newX
  lastMouseY = newY;
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
//Para orbitar en la escena
  document.onmousedown = handleMouseDown;
  document.onmouseup = handleMouseUp;
  document.onmousemove = handleMouseMove;


  const vsSource = `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    // POINT COLOR
    uniform vec3 uPointLightingLocation;
    uniform vec3 uPointLightingColor;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
      vTextureCoord = aTextureCoord;

      // Apply lighting effect
      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(0.5, 0.5, 0.5);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;
  const fsSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
  `;
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  const buffers = initBuffers(gl);

  const texture = loadTexture(gl, "https://dl.dropbox.com/s/7w1odgxb32fk32z/texture_psychedelic_by_flatau-d1kfo3g.jpg?raw=1");
  const textureBG = loadTexture(gl, "https://dl.dropbox.com/s/631fyirzhz70n38/pink-wood-texture.jpg?raw=1");

  cameraAngleRadians = degToRad(0);
  fieldOfViewRadians = degToRad(60);
  var then = 0;
  function degToRad(d) {
    return d * Math.PI / 180;
  }
  function radToDeg(r) {
    return r * 180 / Math.PI;
  }
  webglLessonsUI.setupSlider("#perspective", {
    value: radToDeg(fieldOfViewRadians),
    slide: updatePerspective,
    min: 15,
    max: 60});
  function updatePerspective(event, ui) {
    fieldOfViewRadians = degToRad(ui.value);
  }
  // webglLessonsUI.setupSlider("#cameraAngle", {
  //   value: radToDeg(cameraAngleRadians),
  //   slide: updateCameraAngle,
  //   min: -360,
  //   max: 360});
  function updateCameraAngle(event, ui) {
    cameraAngleRadians = degToRad(ui.value);
  }
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    drawScene(gl, programInfo, buffers, texture, deltaTime, textureBG);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function initBuffers(gl) {

  // Esfera núcleo
  {
    luna = crearEsfera (20, 1);
    // pisos, r
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(luna.vertices), gl.STATIC_DRAW);

    textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(luna.textCords), gl.STATIC_DRAW);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(luna.coords), gl.STATIC_DRAW);

    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(luna.normalData),
                    gl.STATIC_DRAW);
  }

  //Esfera prueba
// se crea un array de esferas y lo que retorna
  for (var i=0; i<lenpais.length;i++) {
    esfpais[i] = crearEsfera(20, 0.10);

    positionBufferEsf= gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferEsf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(esfpais[i].vertices), gl.STATIC_DRAW);

    textureCoordBufferEsf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBufferEsf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(esfpais[i].textCords), gl.STATIC_DRAW);

    indexBufferEsf=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferEsf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(esfpais[i].coords), gl.STATIC_DRAW);

    normalBufferEsf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferEsf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(esfpais[i].normalData),
                    gl.STATIC_DRAW);

    buffersEsferaPais.push(
      {
        "positionBufferEsf":positionBufferEsf,
        "textureCoordBufferEsf":textureCoordBufferEsf,
        "indexBufferEsf": indexBufferEsf,
        "normalBufferEsf": normalBufferEsf
      });
  }

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
    normalBuffer: normalBuffer,
  };
}




function drawScene(gl, programInfo, buffers, texture, deltaTime,textureBG) {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  var projectionMatrix = mat4.create();
  var numFs = 5;
  var radius = 200;
  mat4.perspective(projectionMatrix,
                   fieldOfViewRadians,
                   aspect,
                   zNear,
                   zFar);
  var cameraMatrix = mat4.create();
// !!!
  mat4.multiply(cameraMatrix, cameraMatrix, cameraRotationMatrix );

  mat4.rotate(cameraMatrix,  // destination matrix
              cameraMatrix,  // matrix to rotate
              cameraAngleRadians,     // amount to rotate in radians
              [0, 0, 0]);
  mat4.translate(cameraMatrix,     // destination matrix
                 cameraMatrix,     // matrix to translate
                 [0, 0, 15]);  // amount to translate
  var viewMatrix = mat4.create();
  mat4.invert(viewMatrix, cameraMatrix);
  mat4.multiply(projectionMatrix, projectionMatrix, viewMatrix);

  // LUNA
  {
    const modelViewMatrix = mat4.create();
    xLuna = 24 * Math.sin(paisRotation*2);
    yLuna = 12 * Math.cos(paisRotation*2);
    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [0, 0, 0]);  // amount to translate
    mat4.rotate(modelViewMatrix,  // destination matrix
                modelViewMatrix,  // matrix to rotate
                nucleoRotation/5,     // amount to rotate in radians
                [0, 1, 1]);       // axis to rotate around (Z)
    // mat4.rotate(modelViewMatrix,  // destination matrix
    //             modelViewMatrix,  // matrix to rotate
    //             cubeRotation * .7,// amount to rotate in radians
    //             [0, 1, 0]);       // axis to rotate around (X)

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexPosition);
    }
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
      gl.vertexAttribPointer(
          programInfo.attribLocations.textureCoord,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.textureCoord);
    }

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexNormal,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexNormal);
    }


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    gl.uniformMatrix4fv(
         programInfo.uniformLocations.normalMatrix,
         false,
         normalMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    {
      const vertexCount = luna.coords.length;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }

  // esfera lenpais

  for (var i=0; i<lenpais.length;i++) {
    const modelViewMatrixEsf = mat4.create();
    // xEsf = 4 * Math.sin(nucleoRotation*2);
    //yLuna = 12 * Math.cos(paisRotation*2);
    mat4.translate(modelViewMatrixEsf,     // destination matrix
                   modelViewMatrixEsf,     // matrix to translate
                   [lenpais[i].X , lenpais[i].Y, lenpais[i].Z]);  // amount to translate
    // mat4.rotate(modelViewMatrixEsf,  // destination matrix
    //             modelViewMatrixEsf,  // matrix to rotate
    //             paisRotation/5,     // amount to rotate in radians
    //             [1, 1, 1]);       // axis to rotate around (Z)
    mat4.rotate(modelViewMatrixEsf,  // destination matrix
                modelViewMatrixEsf,  // matrix to rotate
                paisRotation/5,     // amount to rotate in radians
                [1, 1, 1]);       // axis to rotate around (Z)

    //mat4.rotate(modelViewMatrix,  // destination matrix
      //          modelViewMatrix,  // matrix to rotate
        //        1 * .7,// amount to rotate in radians
          //      [0, 1, 0]);       // axis to rotate around (X)

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrixEsf);
    mat4.transpose(normalMatrix, normalMatrix);
    //positionBufferEsf
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffersEsferaPais[i].positionBufferEsf);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexPosition,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexPosition);
    }
    //textureCoordBufferEsf
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffersEsferaPais[i].textureCoordBufferEsf);
      gl.vertexAttribPointer(
          programInfo.attribLocations.textureCoord,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.textureCoord);
    }
    //normalBufferEsf
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffersEsferaPais[i].normalBufferEsf);
      gl.vertexAttribPointer(
          programInfo.attribLocations.vertexNormal,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(
          programInfo.attribLocations.vertexNormal);
    }
    //indexBufferEsf
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffersEsferaPais[i].indexBufferEsf);
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrixEsf);

    gl.uniformMatrix4fv(
         programInfo.uniformLocations.normalMatrix,
         false,
         normalMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBG);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
      const vertexCount = esfpais[i].coords.length;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }

  nucleoRotation += deltaTime;
  paisRotation += deltaTime*10;
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.crossOrigin = "";
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
       // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
       //
       //
       // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

       // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.NEAREST);
       // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.NEAREST);
       // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
