var Engine =  function(options)
{
  this.camera = {};
  this.device = {};
  this.configuration =
  {
    drawingLoopCycle: true,
    displayFPS: true
  };
  this.data = {};

  this.constructor(options);
}
  Engine.prototype.constructor = function(options)
  {
    this.requestAnimationFrameInitialization();
    
    this.camera = options.camera;
    this.device = options.device;
    this.scene = new Engine.CScene();

    if (this.configuration.displayFPS)
    {
      this.data.displayFPS = 
      {
        fps: 0,
        time:
        {
          previous: 0,
          current: 0
        }
      }
    }
  }
  Engine.prototype.requestAnimationFrameInitialization = function()
  {
    window.requestAnimationFrame = (function () 
    {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60)
        };
    })();
  }
  Engine.prototype.render = function()
  {
    requestAnimationFrame(this.drawingLoop.bind(this));
  }
  Engine.prototype.drawingLoop = function()
  {
    if (this.configuration.drawingLoopCycle)
    {
      requestAnimationFrame(this.drawingLoop.bind(this))
    }
    this.device.clear();
    this.drawingLoopFn();
    this.device.render(this.scene, this.camera);
    this.device.present();
    this.displayFPS();
  }
  Engine.prototype.displayFPS = function()
  {
    with (this.data.displayFPS.time)
    {
      previous = current;
      current = new Date().getMilliseconds()/1000;
    }
    this.data.displayFPS.fps = (1/(this.data.displayFPS.time.current-this.data.displayFPS.time.previous)).toFixed(1)
    this.device.workingContext.fillStyle = "#fff";
    this.device.workingContext.fillText('FPS: '+this.data.displayFPS.fps, 10, 25);
  }




var CScene = function()
{
    this.buffer =
    {
      mesh: []
    }
}
  CScene.prototype.getMesh = function(name)
  {
    for(var i = 0; i < this.buffer.mesh.length; i++)
    {
      if (this.buffer.mesh[i].name == name)
      {
        return this.buffer.mesh[i];
      }
    }
  }
  Engine.CScene = CScene;




var CCamera = function(options)
{
  this.Position = options.Position;
  this.Target = options.Target;
  this.Up = options.Up;
  this.aspect = options.aspect;
}
  Engine.CCamera = CCamera;




var CDevice = function(options) 
{
  this.workingCanvas = document.getElementById(options.canvasID);
  this.workingWidth = this.workingCanvas.width;
  this.workingHeight = this.workingCanvas.height;
  this.depthbuffer = new Array(this.workingWidth * this.workingHeight);
  this.workingContext = this.workingCanvas.getContext("2d");
  //this.constructor(options);
}
  /*CDevice.prototype.constructor = function(options)
  {

    this.workingCanvas = document.getElementById(options.canvasID);
    this.workingWidth = this.workingCanvas.width;
    this.workingHeight = this.workingCanvas.height;
    this.depthbuffer = new Array(this.workingWidth * this.workingHeight);

    if (options.fullscale)
    {
      this.setFullScale();
      this.setWorkingWH();
      if (options.scaling)
      {
        this.scaling(options);
      }
    }
    else
    {
      this.workingCanvas.width = options.canvasWidth;
      this.workingCanvas.height = options.canvasHeight;
      this.setWorkingWH();
      if (options.fullscreen)
      {
        this.setFullScreen(options.stretch, options.centering);
      }
      if (options.scaling)
      {
        this.scaling(options);
      }
    }
  }
  CDevice.prototype.setWorkingWH = function()
  {
    this.workingWidth = this.workingCanvas.width;
    this.workingHeight = this.workingCanvas.height;
  }
  CDevice.prototype.setFullScale = function ()
  {
    this.workingCanvas.width = getComputedStyle(document.documentElement).width.toString().slice(0,-2);
    this.workingCanvas.height = getComputedStyle(document.documentElement).height.toString().slice(0,-2);
  }
  CDevice.prototype.setFullScreen = function(stretch, centering)
  {
    if (stretch)
    {
      this.workingCanvas.style.height = getComputedStyle(document.documentElement).height.toString().slice(0,-2);
      this.workingCanvas.style.width = getComputedStyle(document.documentElement).width.toString().slice(0,-2);
    }
    else
    {
      this.workingCanvas.style.height = getComputedStyle(document.documentElement).height.toString().slice(0,-2);
      this.workingCanvas.style.width = this.workingCanvas.style.height*this.workingWidth/this.workingHeight;
      if (centering)
      {
        this.centering();
      }
    }
  }
  CDevice.prototype.centering = function()
  {
    this.workingCanvas.style.left = (getComputedStyle(document.documentElement).width.toString().slice(0,-2)-getComputedStyle(this.workingCanvas).width.toString().slice(0,-2))/2;
  }
  CDevice.prototype.scaling = function (options)
  {
    window.onresize = function()
    {
      if (options.fullscale)
      {
        this.setFullScale();
        this.setWorkingWH();
      }
      else if (options.fullscreen)
      {
        this.setFullScreen(options.stretch);
        this.centering();
      }
    }.bind(this);
    
  }*/
  // This function is called to clear the back buffer with a specific color
CDevice.prototype.clear = function () {
    // Clearing with black color by default
    this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
    // once cleared with black pixels, we're getting back the associated image data to 
    // clear out back buffer
    this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);

    // Clearing depth buffer
    for (var i = 0; i < this.depthbuffer.length; i++) {
        // Max possible value 
        this.depthbuffer[i] = 10000000;
    }
};
  CDevice.prototype.present = function () {
      this.workingContext.putImageData(this.backbuffer, 0, 0);
  };
  // Called to put a pixel on screen at a specific X,Y coordinates
CDevice.prototype.putPixel = function (x, y, z, color) {
    this.backbufferdata = this.backbuffer.data;
    // As we have a 1-D Array for our back buffer
    // we need to know the equivalent cell index in 1-D based
    // on the 2D coordinates of the screen
    var index = ((x >> 0) + (y >> 0) * this.workingWidth);
    var index4 = index * 4;

    if(this.depthbuffer[index] < z) {
        return; // Discard
    }

    this.depthbuffer[index] = z;

    // RGBA color space is used by the HTML5 canvas 
    this.backbufferdata[index4] = color.r * 255;
    this.backbufferdata[index4 + 1] = color.g * 255;
    this.backbufferdata[index4 + 2] = color.b * 255;
    this.backbufferdata[index4 + 3] = color.a * 255;
};

// Project takes some 3D coordinates and transform them
// in 2D coordinates using the transformation matrix
// It also transform the same coordinates and the normal to the vertex 
// in the 3D world
CDevice.prototype.project = function (vertex, transMat, world) {
    // transforming the coordinates into 2D space
    var point2d = Math.Vector3.TransformCoordinates(vertex.Coordinates, transMat);
    // transforming the coordinates & the normal to the vertex in the 3D world
    var point3DWorld = Math.Vector3.TransformCoordinates(vertex.Coordinates, world);
    var normal3DWorld = Math.Vector3.TransformCoordinates(vertex.Normal, world);

    // The transformed coordinates will be based on coordinate system
    // starting on the center of the screen. But drawing on screen normally starts
    // from top left. We then need to transform them again to have x:0, y:0 on top left.
    var x = point2d.x * this.workingWidth + this.workingWidth / 2.0;
    var y = -point2d.y * this.workingHeight + this.workingHeight / 2.0;

    return ({
        Coordinates: new Math.Vector3(x, y, point2d.z),
        Normal: normal3DWorld,
        WorldCoordinates: point3DWorld,
        TextureCoordinates: vertex.TextureCoordinates
    });
};

  // drawPoint calls putPixel but does the clipping operation before
CDevice.prototype.drawPoint = function (point, color) {
    // Clipping what's visible on screen
    if(point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
        // Drawing a point
        this.putPixel(point.x, point.y, point.z, color);
    }
};
  // Clamping values to keep them between 0 and 1
CDevice.prototype.clamp = function (value, min, max) {
    if (typeof min === "undefined") { min = 0; }
    if (typeof max === "undefined") { max = 1; }
    return Math.max(min, Math.min(value, max));
};

// Interpolating the value between 2 vertices 
// min is the starting point, max the ending point
// and gradient the % between the 2 points

CDevice.prototype.interpolate = function (min, max, gradient) {
    return min + (max - min) * this.clamp(gradient);
};

// Compute the cosine of the angle between the light vector and the normal vector
// Returns a value between 0 and 1
CDevice.prototype.computeNDotL = function (vertex, normal, lightPosition) {
    var lightDirection = lightPosition.subtract(vertex);

    normal.normalize();
    lightDirection.normalize();

    return Math.max(0, Math.Vector3.Dot(normal, lightDirection));
};

// drawing line between 2 points from left to right
// papb -> pcpd
// pa, pb, pc, pd must then be sorted before
CDevice.prototype.processScanLine = function (data, va, vb, vc, vd, color, texture) {
    var pa = va.Coordinates;
    var pb = vb.Coordinates;
    var pc = vc.Coordinates;
    var pd = vd.Coordinates;

    // Thanks to current Y, we can compute the gradient to compute others values like
    // the starting X (sx) and ending X (ex) to draw between
    // if pa.Y == pb.Y or pc.Y == pd.Y, gradient is forced to 1
    var gradient1 = pa.y != pb.y ? (data.currentY - pa.y) / (pb.y - pa.y) : 1;
    var gradient2 = pc.y != pd.y ? (data.currentY - pc.y) / (pd.y - pc.y) : 1;

    var sx = this.interpolate(pa.x, pb.x, gradient1) >> 0;
    var ex = this.interpolate(pc.x, pd.x, gradient2) >> 0;

    // starting Z & ending Z
    var z1 = this.interpolate(pa.z, pb.z, gradient1);
    var z2 = this.interpolate(pc.z, pd.z, gradient2);

    // Interpolating normals on Y
    var snl = this.interpolate(data.ndotla, data.ndotlb, gradient1);
    var enl = this.interpolate(data.ndotlc, data.ndotld, gradient2);

    // Interpolating texture coordinates on Y
    var su = this.interpolate(data.ua, data.ub, gradient1);
    var eu = this.interpolate(data.uc, data.ud, gradient2);
    var sv = this.interpolate(data.va, data.vb, gradient1);
    var ev = this.interpolate(data.vc, data.vd, gradient2);


    // drawing a line from left (sx) to right (ex) 
    for (var x = sx; x < ex; x++) {
        var gradient = (x - sx) / (ex - sx);

        // Interpolating Z, normal and texture coordinates on X
        var z = this.interpolate(z1, z2, gradient);
        var ndotl = this.interpolate(snl, enl, gradient);
        var u = this.interpolate(su, eu, gradient);
        var v = this.interpolate(sv, ev, gradient);

        var textureColor;

        if (texture)
            textureColor = texture.map(u, v);
        else
            textureColor = new Math.Color4(1, 1, 1, 1);

        // changing the native color value using the cosine of the angle
        // between the light vector and the normal vector
        // and the texture color
        this.drawPoint(new Math.Vector3(x, data.currentY, z), 
                       new Math.Color4(color.r * ndotl * textureColor.r, 
                                          color.g * ndotl * textureColor.g, 
                                          color.b * ndotl * textureColor.b, 1));
    }
};

CDevice.prototype.drawTriangle = function (v1, v2, v3, color, texture) {
    // Sorting the points in order to always have this order on screen p1, p2 & p3
    // with p1 always up (thus having the Y the lowest possible to be near the top screen)
    // then p2 between p1 & p3
    if (v1.Coordinates.y > v2.Coordinates.y) {
        var temp = v2;
        v2 = v1;
        v1 = temp;
    }

    if (v2.Coordinates.y > v3.Coordinates.y) {
        var temp = v2;
        v2 = v3;
        v3 = temp;
    }

    if (v1.Coordinates.y > v2.Coordinates.y) {
        var temp = v2;
        v2 = v1;
        v1 = temp;
    }

    var p1 = v1.Coordinates;
    var p2 = v2.Coordinates;
    var p3 = v3.Coordinates;

    // Light position
    var lightPos = new Math.Vector3(10, 10, 5);
    // computing the cos of the angle between the light vector and the normal vector
    // it will return a value between 0 and 1 that will be used as the intensity of the color
    var nl1 = this.computeNDotL(v1.WorldCoordinates, v1.Normal, lightPos);
    var nl2 = this.computeNDotL(v2.WorldCoordinates, v2.Normal, lightPos);
    var nl3 = this.computeNDotL(v3.WorldCoordinates, v3.Normal, lightPos);

    var data = {};

    // computing lines' directions
    var dP1P2;
    var dP1P3;

    // http://en.wikipedia.org/wiki/Slope
    // Computing slopes
    if (p2.y - p1.y > 0)
        dP1P2 = (p2.x - p1.x) / (p2.y - p1.y); else
        dP1P2 = 0;

    if (p3.y - p1.y > 0)
        dP1P3 = (p3.x - p1.x) / (p3.y - p1.y); else
        dP1P3 = 0;

    if (dP1P2 > dP1P3) {
        for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
            data.currentY = y;

            if (y < p2.y) {
                data.ndotla = nl1;
                data.ndotlb = nl3;
                data.ndotlc = nl1;
                data.ndotld = nl2;

                data.ua = v1.TextureCoordinates.x;
                data.ub = v3.TextureCoordinates.x;
                data.uc = v1.TextureCoordinates.x;
                data.ud = v2.TextureCoordinates.x;

                data.va = v1.TextureCoordinates.y;
                data.vb = v3.TextureCoordinates.y;
                data.vc = v1.TextureCoordinates.y;
                data.vd = v2.TextureCoordinates.y;


                this.processScanLine(data, v1, v3, v1, v2, color);
            } else {
                data.ndotla = nl1;
                data.ndotlb = nl3;
                data.ndotlc = nl2;
                data.ndotld = nl3;

                data.ua = v1.TextureCoordinates.x;
                        data.ub = v3.TextureCoordinates.x;
                        data.uc = v2.TextureCoordinates.x;
                        data.ud = v3.TextureCoordinates.x;

                        data.va = v1.TextureCoordinates.y;
                        data.vb = v3.TextureCoordinates.y;
                        data.vc = v2.TextureCoordinates.y;
                        data.vd = v3.TextureCoordinates.y;


                this.processScanLine(data, v1, v3, v2, v3, color);
            }
        }
    }
    else {
        for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
            data.currentY = y;

            if (y < p2.y) {
                data.ndotla = nl1;
                data.ndotlb = nl2;
                data.ndotlc = nl1;
                data.ndotld = nl3;

                data.ua = v1.TextureCoordinates.x;
                        data.ub = v2.TextureCoordinates.x;
                        data.uc = v1.TextureCoordinates.x;
                        data.ud = v3.TextureCoordinates.x;

                        data.va = v1.TextureCoordinates.y;
                        data.vb = v2.TextureCoordinates.y;
                        data.vc = v1.TextureCoordinates.y;
                        data.vd = v3.TextureCoordinates.y;

                this.processScanLine(data, v1, v2, v1, v3, color);
            } else {
                data.ndotla = nl2;
                data.ndotlb = nl3;
                data.ndotlc = nl1;
                data.ndotld = nl3;

                data.ua = v2.TextureCoordinates.x;
                        data.ub = v3.TextureCoordinates.x;
                        data.uc = v1.TextureCoordinates.x;
                        data.ud = v3.TextureCoordinates.x;

                        data.va = v2.TextureCoordinates.y;
                        data.vb = v3.TextureCoordinates.y;
                        data.vc = v1.TextureCoordinates.y;
                        data.vd = v3.TextureCoordinates.y;

                this.processScanLine(data, v2, v3, v1, v3, color);
            }
        }
    }
};

  CDevice.prototype.render = function (scene, camera) 
  {
    meshes = scene.buffer.mesh;
      var viewMatrix = Math.Matrix4.LookAtLH(camera.Position, camera.Target, Math.Vector3.Up());
            var projectionMatrix = Math.Matrix4.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);

            for (var index = 0; index < meshes.length; index++) {
                var cMesh = meshes[index];

                var worldMatrix = Math.Matrix4.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(Math.Matrix4.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));

                var worldView = worldMatrix.multiply(viewMatrix);
                var transformMatrix = worldView.multiply(projectionMatrix);

                for (var indexFaces = 0; indexFaces < cMesh.Faces.length; indexFaces++) {
                    var currentFace = cMesh.Faces[indexFaces];
                    
                    var transformedNormal = Math.Vector3.TransformNormal(currentFace.Normal, worldView);

                    if (transformedNormal.z < 0) {
                        var vertexA = cMesh.Vertices[currentFace.A];
                        var vertexB = cMesh.Vertices[currentFace.B];
                        var vertexC = cMesh.Vertices[currentFace.C];

                        var pixelA = this.project(vertexA, transformMatrix, worldMatrix);
                        var pixelB = this.project(vertexB, transformMatrix, worldMatrix);
                        var pixelC = this.project(vertexC, transformMatrix, worldMatrix);

                        var color = 1.0;
                        this.drawTriangle(pixelA, pixelB, pixelC, new Math.Color4(color, color, color, 1), cMesh.Texture);
                    }
                }
            }
        };
  Engine.CDevice = CDevice;




var Texture = function(filename, width, height) 
{
    this.width = width;
    this.height = height;
    this.load(filename);
}
    Texture.prototype.load = function (filename) {
        var _this = this;
        var imageTexture = new Image();
        imageTexture.height = this.height;
        imageTexture.width = this.width;
        imageTexture.onload = function () {
            var internalCanvas = document.createElement("canvas");
            internalCanvas.width = _this.width;
            internalCanvas.height = _this.height;
            var internalContext = internalCanvas.getContext("2d");
            internalContext.drawImage(imageTexture, 0, 0);
            _this.internalBuffer = internalContext.getImageData(0, 0, _this.width, _this.height);
        };
        imageTexture.src = filename;
    };

    // Takes the U & V coordinates exported by Blender
    // and return the corresponding pixel color in the texture
    Texture.prototype.map = function (tu, tv) {
        if (this.internalBuffer) {
            // using a % operator to cycle/repeat the texture if needed
            var u = Math.abs(((tu * this.width) % this.width)) >> 0;
            var v = Math.abs(((tv * this.height) % this.height)) >> 0;

            var pos = (u + v * this.width) * 4;

            var r = this.internalBuffer.data[pos];
            var g = this.internalBuffer.data[pos + 1];
            var b = this.internalBuffer.data[pos + 2];
            var a = this.internalBuffer.data[pos + 3];

            return new Math.Color4(r / 255.0, g / 255.0, b / 255.0, a / 255.0);
        }
        // Image is not loaded yet
        else {
            return new Math.Color4(1, 1, 1, 1);
        }
    };


Engine.Geometry = {}
    var CMesh = function(name, verticesCount, facesCount) 
    {
      this.name = name;
      this.Vertices = new Array(verticesCount);
      this.Faces = new Array(facesCount);
      this.Rotation = new Math.Vector3(0, 0, 0);
      this.Position = new Math.Vector3(0, 0, 0);
      this.Texture;
    }
    CMesh.prototype.computeFacesNormals = function () {
            for (var indexFaces = 0; indexFaces < this.Faces.length; indexFaces++) {
                var currentFace = this.Faces[indexFaces];

                var vertexA = this.Vertices[currentFace.A];
                var vertexB = this.Vertices[currentFace.B];
                var vertexC = this.Vertices[currentFace.C];

                this.Faces[indexFaces].Normal = (vertexA.Normal.add(vertexB.Normal.add(vertexC.Normal))).scale(1 / 3);
                this.Faces[indexFaces].Normal.normalize();
            }
        };
    Engine.Geometry.CMesh = CMesh;













var Color4 = function(initialR, initialG, initialB, initialA) 
{
  this.r = initialR;
  this.g = initialG;
  this.b = initialB;
  this.a = initialA;
}
  Color4.prototype.toString = function () {
      return "{R: " + this.r + " G:" + this.g + " B:" + this.b + " A:" + this.a + "}";
  };
  Math.Color4 = Color4;

var Vector2 = function(initialX, initialY) 
{
  this.x = initialX;
  this.y = initialY;
}
  Vector2.prototype.toString = function () 
  {
      return "{X: " + this.x + " Y:" + this.y + "}";
  };
  Vector2.prototype.add = function (otherVector) 
  {
      return new Vector2(this.x + otherVector.x, this.y + otherVector.y);
  };
  Vector2.prototype.subtract = function (otherVector) 
  {
      return new Vector2(this.x - otherVector.x, this.y - otherVector.y);
  };
  Vector2.prototype.negate = function () 
  {
      return new Vector2(-this.x, -this.y);
  };
  Vector2.prototype.scale = function (scale) 
  {
      return new Vector2(this.x * scale, this.y * scale);
  };
  Vector2.prototype.equals = function (otherVector) 
  {
      return this.x === otherVector.x && this.y === otherVector.y;
  };
  Vector2.prototype.length = function () 
  {
      return Math.sqrt(this.x * this.x + this.y * this.y);
  };
  Vector2.prototype.lengthSquared = function () 
  {
      return (this.x * this.x + this.y * this.y);
  };
  Vector2.prototype.normalize = function () 
  {
      var len = this.length();
      if(len === 0) {
          return;
      }
      var num = 1.0 / len;
      this.x *= num;
      this.y *= num;
  };
  Vector2.Zero = function() 
  {
      return new Vector2(0, 0);
  };
  Vector2.Copy = function(source) 
  {
      return new Vector2(source.x, source.y);
  };
  Vector2.Normalize = function(vector) 
  {
      var newVector = Vector2.Copy(vector);
      newVector.normalize();
      return newVector;
  };
  Vector2.Minimize = function(left, right) 
  {
      var x = (left.x < right.x) ? left.x : right.x;
      var y = (left.y < right.y) ? left.y : right.y;
      return new Vector2(x, y);
  };
  Vector2.Maximize = function(left, right) 
  {
      var x = (left.x > right.x) ? left.x : right.x;
      var y = (left.y > right.y) ? left.y : right.y;
      return new Vector2(x, y);
  };
  Vector2.Transform = function(vector, transformation) 
  {
      var x = (vector.x * transformation.m[0]) + (vector.y * transformation.m[4]);
      var y = (vector.x * transformation.m[1]) + (vector.y * transformation.m[5]);
      return new Vector2(x, y);
  };
  Vector2.Distance = function(value1, value2) 
  {
      return Math.sqrt(Vector2.DistanceSquared(value1, value2));
  };
  Vector2.DistanceSquared = function(value1, value2) 
  {
      var x = value1.x - value2.x;
      var y = value1.y - value2.y;
      return (x * x) + (y * y);
  };
  Math.Vector2 = Vector2;

var Vector3 = function(initialX, initialY, initialZ) 
{
  this.x = initialX;
  this.y = initialY;
  this.z = initialZ;
}
  Vector3.prototype.toString = function () 
  {
      return "{X: " + this.x + " Y:" + this.y + " Z:" + this.z + "}";
  };
  Vector3.prototype.add = function (otherVector) 
  {
      return new Vector3(this.x + otherVector.x, this.y + otherVector.y, this.z + otherVector.z);
  };
  Vector3.prototype.subtract = function (otherVector) 
  {
      return new Vector3(this.x - otherVector.x, this.y - otherVector.y, this.z - otherVector.z);
  };
  Vector3.prototype.negate = function () 
  {
      return new Vector3(-this.x, -this.y, -this.z);
  };
  Vector3.prototype.scale = function (scale) 
  {
      return new Vector3(this.x * scale, this.y * scale, this.z * scale);
  };
  Vector3.prototype.equals = function (otherVector) 
  {
      return this.x === otherVector.x && this.y === otherVector.y && this.z === otherVector.z;
  };
  Vector3.prototype.multiply = function (otherVector) 
  {
      return new Vector3(this.x * otherVector.x, this.y * otherVector.y, this.z * otherVector.z);
  };
  Vector3.prototype.divide = function (otherVector) 
  {
      return new Vector3(this.x / otherVector.x, this.y / otherVector.y, this.z / otherVector.z);
  };
  Vector3.prototype.length = function () 
  {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  };
  Vector3.prototype.lengthSquared = function () 
  {
      return (this.x * this.x + this.y * this.y + this.z * this.z);
  };
  Vector3.prototype.normalize = function () 
  {
      var len = this.length();
      if(len === 0) {
          return;
      }
      var num = 1.0 / len;
      this.x *= num;
      this.y *= num;
      this.z *= num;
  };
  Vector3.FromArray = function (array, offset) 
  {
      if(!offset) {
          offset = 0;
      }
      return new Vector3(array[offset], array[offset + 1], array[offset + 2]);
  };
  Vector3.Zero = function () 
  {
      return new Vector3(0, 0, 0);
  };
  Vector3.Up = function () 
  {
      return new Vector3(0, 1.0, 0);
  };
  Vector3.Copy = function (source) 
  {
      return new Vector3(source.x, source.y, source.z);
  };
  Vector3.TransformCoordinates = function (vector, transformation) 
  {
      var x = (vector.x * transformation.m[0]) + (vector.y * transformation.m[4]) + (vector.z * transformation.m[8]) + transformation.m[12];
      var y = (vector.x * transformation.m[1]) + (vector.y * transformation.m[5]) + (vector.z * transformation.m[9]) + transformation.m[13];
      var z = (vector.x * transformation.m[2]) + (vector.y * transformation.m[6]) + (vector.z * transformation.m[10]) + transformation.m[14];
      var w = (vector.x * transformation.m[3]) + (vector.y * transformation.m[7]) + (vector.z * transformation.m[11]) + transformation.m[15];
      return new Vector3(x / w, y / w, z / w);
  };
  Vector3.TransformNormal = function (vector, transformation) 
  {
      var x = (vector.x * transformation.m[0]) + (vector.y * transformation.m[4]) + (vector.z * transformation.m[8]);
      var y = (vector.x * transformation.m[1]) + (vector.y * transformation.m[5]) + (vector.z * transformation.m[9]);
      var z = (vector.x * transformation.m[2]) + (vector.y * transformation.m[6]) + (vector.z * transformation.m[10]);
      return new Vector3(x, y, z);
  };
  Vector3.Dot = function (left, right) 
  {
      return (left.x * right.x + left.y * right.y + left.z * right.z);
  };
  Vector3.Cross = function (left, right) 
  {
      var x = left.y * right.z - left.z * right.y;
      var y = left.z * right.x - left.x * right.z;
      var z = left.x * right.y - left.y * right.x;
      return new Vector3(x, y, z);
  };
  Vector3.Normalize = function (vector) 
  {
      var newVector = Vector3.Copy(vector);
      newVector.normalize();
      return newVector;
  };
  Vector3.Distance = function (value1, value2) 
  {
      return Math.sqrt(Vector3.DistanceSquared(value1, value2));
  };
  Vector3.DistanceSquared = function (value1, value2) 
  {
      var x = value1.x - value2.x;
      var y = value1.y - value2.y;
      var z = value1.z - value2.z;
      return (x * x) + (y * y) + (z * z);
  };
  Math.Vector3 = Vector3;

var Matrix4 = function() 
{
  //
  this.m = [];
}
  Matrix4.prototype.isIdentity = function () {
      if(this.m[0] != 1.0 || this.m[5] != 1.0 || this.m[10] != 1.0 || this.m[15] != 1.0) {
          return false;
      }
      if(this.m[12] != 0.0 || this.m[13] != 0.0 || this.m[14] != 0.0 || this.m[4] != 0.0 || this.m[6] != 0.0 || this.m[7] != 0.0 || this.m[8] != 0.0 || this.m[9] != 0.0 || this.m[11] != 0.0 || this.m[12] != 0.0 || this.m[13] != 0.0 || this.m[14] != 0.0) {
          return false;
      }
      return true;
  };
  Matrix4.prototype.determinant = function () {
      var temp1 = (this.m[10] * this.m[15]) - (this.m[11] * this.m[14]);
      var temp2 = (this.m[9] * this.m[15]) - (this.m[11] * this.m[13]);
      var temp3 = (this.m[9] * this.m[14]) - (this.m[10] * this.m[13]);
      var temp4 = (this.m[8] * this.m[15]) - (this.m[11] * this.m[12]);
      var temp5 = (this.m[8] * this.m[14]) - (this.m[10] * this.m[12]);
      var temp6 = (this.m[8] * this.m[13]) - (this.m[9] * this.m[12]);
      return ((((this.m[0] * (((this.m[5] * temp1) - (this.m[6] * temp2)) + (this.m[7] * temp3))) - (this.m[1] * (((this.m[4] * temp1) - (this.m[6] * temp4)) + (this.m[7] * temp5)))) + (this.m[2] * (((this.m[4] * temp2) - (this.m[5] * temp4)) + (this.m[7] * temp6)))) - (this.m[3] * (((this.m[4] * temp3) - (this.m[5] * temp5)) + (this.m[6] * temp6))));
  };
  Matrix4.prototype.toArray = function () {
      return this.m;
  };
  Matrix4.prototype.invert = function () {
      var l1 = this.m[0];
      var l2 = this.m[1];
      var l3 = this.m[2];
      var l4 = this.m[3];
      var l5 = this.m[4];
      var l6 = this.m[5];
      var l7 = this.m[6];
      var l8 = this.m[7];
      var l9 = this.m[8];
      var l10 = this.m[9];
      var l11 = this.m[10];
      var l12 = this.m[11];
      var l13 = this.m[12];
      var l14 = this.m[13];
      var l15 = this.m[14];
      var l16 = this.m[15];
      var l17 = (l11 * l16) - (l12 * l15);
      var l18 = (l10 * l16) - (l12 * l14);
      var l19 = (l10 * l15) - (l11 * l14);
      var l20 = (l9 * l16) - (l12 * l13);
      var l21 = (l9 * l15) - (l11 * l13);
      var l22 = (l9 * l14) - (l10 * l13);
      var l23 = ((l6 * l17) - (l7 * l18)) + (l8 * l19);
      var l24 = -(((l5 * l17) - (l7 * l20)) + (l8 * l21));
      var l25 = ((l5 * l18) - (l6 * l20)) + (l8 * l22);
      var l26 = -(((l5 * l19) - (l6 * l21)) + (l7 * l22));
      var l27 = 1.0 / ((((l1 * l23) + (l2 * l24)) + (l3 * l25)) + (l4 * l26));
      var l28 = (l7 * l16) - (l8 * l15);
      var l29 = (l6 * l16) - (l8 * l14);
      var l30 = (l6 * l15) - (l7 * l14);
      var l31 = (l5 * l16) - (l8 * l13);
      var l32 = (l5 * l15) - (l7 * l13);
      var l33 = (l5 * l14) - (l6 * l13);
      var l34 = (l7 * l12) - (l8 * l11);
      var l35 = (l6 * l12) - (l8 * l10);
      var l36 = (l6 * l11) - (l7 * l10);
      var l37 = (l5 * l12) - (l8 * l9);
      var l38 = (l5 * l11) - (l7 * l9);
      var l39 = (l5 * l10) - (l6 * l9);
      this.m[0] = l23 * l27;
      this.m[4] = l24 * l27;
      this.m[8] = l25 * l27;
      this.m[12] = l26 * l27;
      this.m[1] = -(((l2 * l17) - (l3 * l18)) + (l4 * l19)) * l27;
      this.m[5] = (((l1 * l17) - (l3 * l20)) + (l4 * l21)) * l27;
      this.m[9] = -(((l1 * l18) - (l2 * l20)) + (l4 * l22)) * l27;
      this.m[13] = (((l1 * l19) - (l2 * l21)) + (l3 * l22)) * l27;
      this.m[2] = (((l2 * l28) - (l3 * l29)) + (l4 * l30)) * l27;
      this.m[6] = -(((l1 * l28) - (l3 * l31)) + (l4 * l32)) * l27;
      this.m[10] = (((l1 * l29) - (l2 * l31)) + (l4 * l33)) * l27;
      this.m[14] = -(((l1 * l30) - (l2 * l32)) + (l3 * l33)) * l27;
      this.m[3] = -(((l2 * l34) - (l3 * l35)) + (l4 * l36)) * l27;
      this.m[7] = (((l1 * l34) - (l3 * l37)) + (l4 * l38)) * l27;
      this.m[11] = -(((l1 * l35) - (l2 * l37)) + (l4 * l39)) * l27;
      this.m[15] = (((l1 * l36) - (l2 * l38)) + (l3 * l39)) * l27;
  };
  Matrix4.prototype.multiply = function (other) {
      var result = new Matrix4();
      result.m[0] = this.m[0] * other.m[0] + this.m[1] * other.m[4] + this.m[2] * other.m[8] + this.m[3] * other.m[12];
      result.m[1] = this.m[0] * other.m[1] + this.m[1] * other.m[5] + this.m[2] * other.m[9] + this.m[3] * other.m[13];
      result.m[2] = this.m[0] * other.m[2] + this.m[1] * other.m[6] + this.m[2] * other.m[10] + this.m[3] * other.m[14];
      result.m[3] = this.m[0] * other.m[3] + this.m[1] * other.m[7] + this.m[2] * other.m[11] + this.m[3] * other.m[15];
      result.m[4] = this.m[4] * other.m[0] + this.m[5] * other.m[4] + this.m[6] * other.m[8] + this.m[7] * other.m[12];
      result.m[5] = this.m[4] * other.m[1] + this.m[5] * other.m[5] + this.m[6] * other.m[9] + this.m[7] * other.m[13];
      result.m[6] = this.m[4] * other.m[2] + this.m[5] * other.m[6] + this.m[6] * other.m[10] + this.m[7] * other.m[14];
      result.m[7] = this.m[4] * other.m[3] + this.m[5] * other.m[7] + this.m[6] * other.m[11] + this.m[7] * other.m[15];
      result.m[8] = this.m[8] * other.m[0] + this.m[9] * other.m[4] + this.m[10] * other.m[8] + this.m[11] * other.m[12];
      result.m[9] = this.m[8] * other.m[1] + this.m[9] * other.m[5] + this.m[10] * other.m[9] + this.m[11] * other.m[13];
      result.m[10] = this.m[8] * other.m[2] + this.m[9] * other.m[6] + this.m[10] * other.m[10] + this.m[11] * other.m[14];
      result.m[11] = this.m[8] * other.m[3] + this.m[9] * other.m[7] + this.m[10] * other.m[11] + this.m[11] * other.m[15];
      result.m[12] = this.m[12] * other.m[0] + this.m[13] * other.m[4] + this.m[14] * other.m[8] + this.m[15] * other.m[12];
      result.m[13] = this.m[12] * other.m[1] + this.m[13] * other.m[5] + this.m[14] * other.m[9] + this.m[15] * other.m[13];
      result.m[14] = this.m[12] * other.m[2] + this.m[13] * other.m[6] + this.m[14] * other.m[10] + this.m[15] * other.m[14];
      result.m[15] = this.m[12] * other.m[3] + this.m[13] * other.m[7] + this.m[14] * other.m[11] + this.m[15] * other.m[15];
      return result;
  };
  Matrix4.prototype.equals = function (value) {
      return (this.m[0] === value.m[0] && this.m[1] === value.m[1] && this.m[2] === value.m[2] && this.m[3] === value.m[3] && this.m[4] === value.m[4] && this.m[5] === value.m[5] && this.m[6] === value.m[6] && this.m[7] === value.m[7] && this.m[8] === value.m[8] && this.m[9] === value.m[9] && this.m[10] === value.m[10] && this.m[11] === value.m[11] && this.m[12] === value.m[12] && this.m[13] === value.m[13] && this.m[14] === value.m[14] && this.m[15] === value.m[15]);
  };
  Matrix4.FromValues = function (initialM11, initialM12, initialM13, initialM14, initialM21, initialM22, initialM23, initialM24, initialM31, initialM32, initialM33, initialM34, initialM41, initialM42, initialM43, initialM44) {
      var result = new Matrix4();
      result.m[0] = initialM11;
      result.m[1] = initialM12;
      result.m[2] = initialM13;
      result.m[3] = initialM14;
      result.m[4] = initialM21;
      result.m[5] = initialM22;
      result.m[6] = initialM23;
      result.m[7] = initialM24;
      result.m[8] = initialM31;
      result.m[9] = initialM32;
      result.m[10] = initialM33;
      result.m[11] = initialM34;
      result.m[12] = initialM41;
      result.m[13] = initialM42;
      result.m[14] = initialM43;
      result.m[15] = initialM44;
      return result;
  };
  Matrix4.Identity = function () {
      return Matrix4.FromValues(1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0);
  };
  Matrix4.Zero = function () {
      return Matrix4.FromValues(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  };
  Matrix4.Copy = function (source) {
      return Matrix4.FromValues(source.m[0], source.m[1], source.m[2], source.m[3], source.m[4], source.m[5], source.m[6], source.m[7], source.m[8], source.m[9], source.m[10], source.m[11], source.m[12], source.m[13], source.m[14], source.m[15]);
  };
  Matrix4.RotationX = function (angle) {
      var result = Matrix4.Zero();
      var s = Math.sin(angle);
      var c = Math.cos(angle);
      result.m[0] = 1.0;
      result.m[15] = 1.0;
      result.m[5] = c;
      result.m[10] = c;
      result.m[9] = -s;
      result.m[6] = s;
      return result;
  };
  Matrix4.RotationY = function (angle) {
      var result = Matrix4.Zero();
      var s = Math.sin(angle);
      var c = Math.cos(angle);
      result.m[5] = 1.0;
      result.m[15] = 1.0;
      result.m[0] = c;
      result.m[2] = -s;
      result.m[8] = s;
      result.m[10] = c;
      return result;
  };
  Matrix4.RotationZ = function (angle) {
      var result = Matrix4.Zero();
      var s = Math.sin(angle);
      var c = Math.cos(angle);
      result.m[10] = 1.0;
      result.m[15] = 1.0;
      result.m[0] = c;
      result.m[1] = s;
      result.m[4] = -s;
      result.m[5] = c;
      return result;
  };
  Matrix4.RotationAxis = function (axis, angle) {
      var s = Math.sin(-angle);
      var c = Math.cos(-angle);
      var c1 = 1 - c;
      axis.normalize();
      var result = Matrix4.Zero();
      result.m[0] = (axis.x * axis.x) * c1 + c;
      result.m[1] = (axis.x * axis.y) * c1 - (axis.z * s);
      result.m[2] = (axis.x * axis.z) * c1 + (axis.y * s);
      result.m[3] = 0.0;
      result.m[4] = (axis.y * axis.x) * c1 + (axis.z * s);
      result.m[5] = (axis.y * axis.y) * c1 + c;
      result.m[6] = (axis.y * axis.z) * c1 - (axis.x * s);
      result.m[7] = 0.0;
      result.m[8] = (axis.z * axis.x) * c1 - (axis.y * s);
      result.m[9] = (axis.z * axis.y) * c1 + (axis.x * s);
      result.m[10] = (axis.z * axis.z) * c1 + c;
      result.m[11] = 0.0;
      result.m[15] = 1.0;
      return result;
  };
  Matrix4.RotationYawPitchRoll = function (yaw, pitch, roll) {
      return Matrix4.RotationZ(roll).multiply(Matrix4.RotationX(pitch)).multiply(Matrix4.RotationY(yaw));
  };
  Matrix4.Scaling = function (x, y, z) {
      var result = Matrix4.Zero();
      result.m[0] = x;
      result.m[5] = y;
      result.m[10] = z;
      result.m[15] = 1.0;
      return result;
  };
  Matrix4.Translation = function (x, y, z) {
      var result = Matrix4.Identity();
      result.m[12] = x;
      result.m[13] = y;
      result.m[14] = z;
      return result;
  };
  Matrix4.LookAtLH = function (eye, target, up) {
      var zAxis = target.subtract(eye);
      zAxis.normalize();
      var xAxis = Vector3.Cross(up, zAxis);
      xAxis.normalize();
      var yAxis = Vector3.Cross(zAxis, xAxis);
      yAxis.normalize();
      var ex = -Vector3.Dot(xAxis, eye);
      var ey = -Vector3.Dot(yAxis, eye);
      var ez = -Vector3.Dot(zAxis, eye);
      return Matrix4.FromValues(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, ex, ey, ez, 1);
  };
  Matrix4.PerspectiveLH = function (width, height, znear, zfar) {
      var matrix = Matrix4.Zero();
      matrix.m[0] = (2.0 * znear) / width;
      matrix.m[1] = matrix.m[2] = matrix.m[3] = 0.0;
      matrix.m[5] = (2.0 * znear) / height;
      matrix.m[4] = matrix.m[6] = matrix.m[7] = 0.0;
      matrix.m[10] = -zfar / (znear - zfar);
      matrix.m[8] = matrix.m[9] = 0.0;
      matrix.m[11] = 1.0;
      matrix.m[12] = matrix.m[13] = matrix.m[15] = 0.0;
      matrix.m[14] = (znear * zfar) / (znear - zfar);
      return matrix;
  };
  Matrix4.PerspectiveFovLH = function (fov, aspect, znear, zfar) {
      var matrix = Matrix4.Zero();
      var tan = 1.0 / (Math.tan(fov * 0.5));
      matrix.m[0] = tan / aspect;
      matrix.m[1] = matrix.m[2] = matrix.m[3] = 0.0;
      matrix.m[5] = tan;
      matrix.m[4] = matrix.m[6] = matrix.m[7] = 0.0;
      matrix.m[8] = matrix.m[9] = 0.0;
      matrix.m[10] = -zfar / (znear - zfar);
      matrix.m[11] = 1.0;
      matrix.m[12] = matrix.m[13] = matrix.m[15] = 0.0;
      matrix.m[14] = (znear * zfar) / (znear - zfar);
      return matrix;
  };
  Matrix4.Transpose = function (matrix) {
      var result = new Matrix4();
      result.m[0] = matrix.m[0];
      result.m[1] = matrix.m[4];
      result.m[2] = matrix.m[8];
      result.m[3] = matrix.m[12];
      result.m[4] = matrix.m[1];
      result.m[5] = matrix.m[5];
      result.m[6] = matrix.m[9];
      result.m[7] = matrix.m[13];
      result.m[8] = matrix.m[2];
      result.m[9] = matrix.m[6];
      result.m[10] = matrix.m[10];
      result.m[11] = matrix.m[14];
      result.m[12] = matrix.m[3];
      result.m[13] = matrix.m[7];
      result.m[14] = matrix.m[11];
      result.m[15] = matrix.m[15];
      return result;
  };
  Math.Matrix4 = Matrix4;