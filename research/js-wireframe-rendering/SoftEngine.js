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
    this.device.workingContext.fillStyle = "#FFF";
    this.device.workingContext.font = "italic 12pt Arial";
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
  this.workingCanvas = {};
  this.workingWidth;
  this.workingHeight;

  this.constructor(options);
}
  CDevice.prototype.constructor = function(options)
  {

    this.workingCanvas = document.getElementById(options.canvasID);
    this.setWorkingWH();

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

    this.workingContext = this.workingCanvas.getContext("2d");
  }
  CDevice.prototype.clear = function () {
      this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
      this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
  };
  CDevice.prototype.present = function () {
      this.workingContext.putImageData(this.backbuffer, 0, 0);
  };
  CDevice.prototype.putPixel = function (x, y, color) {
      this.backbufferdata = this.backbuffer.data;
      var index = ((x >> 0) + (y >> 0) * this.workingWidth) * 4;
      this.backbufferdata[index] = color.r * 255;
      this.backbufferdata[index + 1] = color.g * 255;
      this.backbufferdata[index + 2] = color.b * 255;
      this.backbufferdata[index + 3] = color.a * 255;
  };
  CDevice.prototype.project = function (coord, transMat) {
      var point = Math.Vector3.TransformCoordinates(coord, transMat);
      var x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0;
      var y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
      return (new Math.Vector2(x, y));
  };
  CDevice.prototype.drawPoint = function (point) {
      if(point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
          this.putPixel(point.x, point.y, new Math.Color4(1, 1, 0, 1));
      }
  };
  CDevice.prototype.drawLine = function (point0, point1) {
      var dist = point1.subtract(point0).length();
      if(dist < 2) {
          return;
      }
      var middlePoint = point0.add((point1.subtract(point0)).scale(0.5));
      this.drawPoint(middlePoint);
      this.drawLine(point0, middlePoint);
      this.drawLine(middlePoint, point1);
  };
  CDevice.prototype.drawBline = function (point0, point1) {
      var x0 = point0.x >> 0;
      var y0 = point0.y >> 0;
      var x1 = point1.x >> 0;
      var y1 = point1.y >> 0;
      var dx = Math.abs(x1 - x0);
      var dy = Math.abs(y1 - y0);
      var sx = (x0 < x1) ? 1 : -1;
      var sy = (y0 < y1) ? 1 : -1;
      var err = dx - dy;
      while(true) {
          this.drawPoint(new Math.Vector2(x0, y0));
          if((x0 == x1) && (y0 == y1)) {
              break;
          }
          var e2 = 2 * err;
          if(e2 > -dy) {
              err -= dy;
              x0 += sx;
          }
          if(e2 < dx) {
              err += dx;
              y0 += sy;
          }
      }
  };
  CDevice.prototype.render = function (scene, camera) 
  {
    meshes = scene.buffer.mesh;
      var viewMatrix = Math.Matrix4.LookAtLH(camera.Position, camera.Target, camera.Up);
      var projectionMatrix = Math.Matrix4.PerspectiveFovLH(camera.aspect, this.workingWidth / this.workingHeight, camera.znear, camera.zfar);
      for(var index = 0; index < meshes.length; index++) {
          var cMesh = meshes[index];
          var worldMatrix = Math.Matrix4.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(Math.Matrix4.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
          var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);
          for(var indexFaces = 0; indexFaces < cMesh.Faces.length; indexFaces++) {
              var currentFace = cMesh.Faces[indexFaces];
              var vertexA = cMesh.Vertices[currentFace.A];
              var vertexB = cMesh.Vertices[currentFace.B];
              var vertexC = cMesh.Vertices[currentFace.C];
              var pixelA = this.project(vertexA, transformMatrix);
              var pixelB = this.project(vertexB, transformMatrix);
              var pixelC = this.project(vertexC, transformMatrix);
              this.drawBline(pixelA, pixelB);
              this.drawBline(pixelB, pixelC);
              this.drawBline(pixelC, pixelA);
          }
      }
  };
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
    
  }
  Engine.CDevice = CDevice;




  Engine.Geometry = {}
    var CMesh = function(name, verticesCount, facesCount) 
    {
      this.name = name;
      this.Vertices = new Array(verticesCount);
      this.Faces = new Array(facesCount);
      this.Rotation = new Math.Vector3(0, 0, 0);
      this.Position = new Math.Vector3(0, 0, 0);
    }
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