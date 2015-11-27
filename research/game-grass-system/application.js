var Flat, GraphicEngine, Grass, Task, Thread, ThreadManager, graphic, manager,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

GraphicEngine = (function() {
  function GraphicEngine(_) {
    this._ = _;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.stats = new Stats;
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.left = '0px';
    this.wrapper = $('#viewport');
    this.wrapper.append(this.renderer.domElement);
    this.wrapper.append(this.stats.domElement);
    this.clock = new THREE.Clock;
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(75, this.wrapper.width() / this.wrapper.height(), 0.1, 10000000);
    this.camera.position.set(-3, 5, -3);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(new THREE.Vector3(5, 0, 5));
    this.camera.mode = 'float';
    this.camera.float = {
      fi: 90,
      tetha: 60,
      speed: 1,
      moving: false,
      set_x: function(v) {
        return this.fi = 90 + 1 * v;
      },
      set_y: function(v) {
        return this.tetha = 60 + 1 * v;
      }
    };
    this.camera.update = function(object) {
      var dx, dy, dz;
      switch (this.mode) {
        case 'float':
          dx = Math.sin(this.float.tetha * Math.PI / 180) * Math.cos(this.float.fi * Math.PI / 180);
          dz = Math.sin(this.float.tetha * Math.PI / 180) * Math.sin(this.float.fi * Math.PI / 180);
          dy = Math.cos(this.float.tetha * Math.PI / 180);
          if (this.float.moving) {
            this.position.set(this.position.x + this.float.speed * dx, this.position.y + this.float.speed * dy, this.position.z + this.float.speed * dz);
          }
          return this.lookAt(new THREE.Vector3(this.position.x + dx, this.position.y + dy, this.position.z + dz));
      }
    };
    this.wrapper.bind('mousedown', (function(_this) {
      return function(e) {
        return _this.camera.float.moving = true;
      };
    })(this));
    this.wrapper.bind('mouseup', (function(_this) {
      return function(e) {
        return _this.camera.float.moving = false;
      };
    })(this));
    this.mouse = {
      current: {
        x: 0,
        y: 0
      },
      previous: {
        x: 0,
        y: 0
      }
    };
    this.wrapper.bind('mousemove', (function(_this) {
      return function(e) {
        var dx, dy;
        _this.mouse.previous.x = _this.mouse.current.x;
        _this.mouse.previous.y = _this.mouse.current.y;
        _this.mouse.current.x = e.offsetX;
        _this.mouse.current.y = e.offsetY;
        dx = _this.mouse.current.x - _this.wrapper.width() / 2;
        dy = _this.mouse.current.y - _this.wrapper.height() / 2;
        _this.camera[_this.camera.mode].set_x(0.5 * dx);
        return _this.camera[_this.camera.mode].set_y(0.5 * dy);
      };
    })(this));
    this.resize();
    window.addEventListener('resize', (function(_this) {
      return function() {
        return _this.resize();
      };
    })(this));
  }

  GraphicEngine.prototype.resize = function() {
    this.camera.aspect = this.wrapper.width() / this.wrapper.height();
    this.camera.updateProjectionMatrix();
    return this.renderer.setSize(this.wrapper.width(), this.wrapper.height());
  };

  GraphicEngine.prototype.stop = function() {
    console.log('GraphicEngine3D.stop');
    return cancelAnimationFrame(this.interval);
  };

  GraphicEngine.prototype.initialize = function(options) {
    var axisHelper, geometry, gridHelper, material, terrain;
    axisHelper = new THREE.AxisHelper(5);
    this.scene.add(axisHelper);
    gridHelper = new THREE.GridHelper(20, 1);
    this.scene.add(gridHelper);
    geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    material = new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('grassmap.png')
    });
    terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.x = 500;
    terrain.position.z = 500;
    this.scene.add(terrain);
    this.grassmap = document.createElement('img');
    this.grassmap.src = 'grassmap.png';
    this.gui = new dat.GUI;
    this.options = {
      size: 1000,
      flatsize: 20,
      dencity: 1,
      distance: 20,
      grassheight: 1,
      grasswidth: 0.3,
      draw: this.draw.bind(this)
    };
    this.gui.add(this.options, 'size', 0, 1000);
    this.gui.add(this.options, 'flatsize', 1, 100);
    this.gui.add(this.options, 'dencity', 1, 5);
    this.gui.add(this.options, 'distance', 0, 25);
    this.gui.add(this.options, 'grassheight', 0, 2);
    this.gui.add(this.options, 'grasswidth', 0, 1);
    this.gui.add(this.options, 'draw');
    this.data = {};
    this.data.distance = [this.options.distance, this.options.distance * 2, this.options.distance * 4, this.options.distance * 6, this.options.distance * 8, this.options.distance * 12];
    this.data.material = [];
    this.data.material[0] = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide
    });
    this.data.material[1] = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide
    });
    this.data.material[2] = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      side: THREE.DoubleSide
    });
    this.data.material[3] = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      side: THREE.DoubleSide
    });
    this.data.material[4] = new THREE.MeshBasicMaterial({
      color: 0x33ff33,
      side: THREE.DoubleSide
    });
    this.data.material[5] = new THREE.MeshBasicMaterial({
      color: 0x3333ff,
      side: THREE.DoubleSide
    });
    return this.grassmap.addEventListener('load', (function(_this) {
      return function() {
        _this.grassmapcanvas = document.createElement('canvas');
        _this.grassmapcanvas.width = _this.grassmap.width;
        _this.grassmapcanvas.height = _this.grassmap.height;
        _this.grassmapctx = _this.grassmapcanvas.getContext('2d');
        _this.grassmapctx.drawImage(_this.grassmap, 0, 0, _this.grassmapcanvas.width, _this.grassmapcanvas.height);
        return _this.draw();
      };
    })(this));
  };

  GraphicEngine.prototype.render = function() {
    this.camera.update();
    if (this.grass) {
      this.grass.update(this.camera);
    }
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
    return this.interval = requestAnimationFrame(this.render.bind(this));
  };

  GraphicEngine.prototype.draw = function() {
    var global, obj;
    obj = this.scene.getObjectByName('global');
    if (obj) {
      this.scene.remove(obj);
    }
    global = new THREE.Object3D;
    global.name = 'global';
    this.grass = new Grass({
      count: this.options.size / this.options.flatsize,
      grassmapctx: this.grassmapctx,
      options: this.options,
      data: this.data
    });
    global.add(this.grass);
    return this.scene.add(global);
  };

  return GraphicEngine;

})();

manager = {};

graphic = {};

$(document).ready(function() {
  graphic = new GraphicEngine;
  setTimeout(function() {
    graphic.initialize();
    return graphic.render();
  }, 1000);
  return manager = new ThreadManager({
    threads: 4
  });
});

Grass = (function(_super) {
  __extends(Grass, _super);

  function Grass(options) {
    var i, j, _i, _j, _ref, _ref1;
    THREE.Object3D.call(this);
    this.name = 'grass';
    this.count = options.count, this.grassmapctx = options.grassmapctx, this.options = options.options, this.data = options.data;
    this.initialized = false;
    this.radius = {
      initialization: 50,
      update: 100
    };
    for (i = _i = 0, _ref = this.count - 1; _i <= _ref; i = _i += 1) {
      for (j = _j = 0, _ref1 = this.count - 1; _j <= _ref1; j = _j += 1) {
        this.createFlat(i, j);
      }
    }
  }

  Grass.prototype.createFlat = function(flat_i, flat_j) {
    var flat, hasgrass, i, imagedata, units, x, y, _i, _ref;
    imagedata = this.grassmapctx.getImageData(flat_i * this.options.flatsize, flat_j * this.options.flatsize, this.options.flatsize, this.options.flatsize).data;
    units = [];
    hasgrass = false;
    for (i = _i = 0, _ref = imagedata.length; _i <= _ref; i = _i += 4) {
      y = Math.floor(i / 80);
      if (!units[y]) {
        units[y] = [];
      }
      x = i / 4 - 20 * y;
      units[y][x] = false;
      if (imagedata[i] > 0) {
        if (!hasgrass) {
          hasgrass = true;
        }
        units[y][x] = true;
      }
    }
    if (hasgrass) {
      flat = new Flat({
        flat_i: flat_i,
        flat_j: flat_j,
        units: units,
        options: this.options,
        data: this.data
      });
      flat.position.x = (flat_i + 0.5) * this.options.flatsize;
      flat.position.z = (flat_j + 0.5) * this.options.flatsize;
      return this.add(flat);
    }
  };

  Grass.prototype.update = function(camera) {
    var distance, flat, i, _i, _j, _len, _len1, _ref, _ref1, _results, _results1;
    if (!this.initialized) {
      this.initialized = true;
      _ref = this.children;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        flat = _ref[i];
        distance = new THREE.Vector3(camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z).length();
        if (distance <= this.radius.initialization) {
          flat.checkLevel(camera);
          _results.push(flat.createGeometry());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else {
      _ref1 = this.children;
      _results1 = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        flat = _ref1[_j];
        flat.update(camera);
        distance = new THREE.Vector3(camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z).length();
        if (distance <= this.radius.update) {
          flat.checkLevel(camera);
          _results1.push(flat.checkGeometry(camera));
        } else {
          _results1.push(void 0);
        }
      }
      return _results1;
    }
  };

  return Grass;

})(THREE.Object3D);

Flat = (function(_super) {
  __extends(Flat, _super);

  function Flat(options) {
    this.flat_i = options.flat_i, this.flat_j = options.flat_j, this.options = options.options, this.data = options.data, this.units = options.units;
    THREE.LOD.call(this);
    this.creating = false;
    this.level = false;
  }

  Flat.prototype.checkLevel = function(camera) {
    var distance, level;
    distance = new THREE.Vector3(camera.position.x - this.position.x, camera.position.y - this.position.y, camera.position.z - this.position.z).length();
    if (distance < this.data.distance[0]) {
      level = 0;
    } else if (distance < this.data.distance[1]) {
      level = 1;
    } else if (distance < this.data.distance[2]) {
      level = 2;
    } else if (distance < this.data.distance[3]) {
      level = 3;
    } else {
      level = 4;
    }
    if (this.level !== level) {
      return this.level = level;
    }
  };

  Flat.prototype.checkGeometry = function(camera) {
    var draw, frustum, i, object, _i, _len, _ref;
    frustum = new THREE.Frustum;
    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    if (frustum.containsPoint(this.position)) {
      if (!this.creating) {
        draw = true;
        _ref = this.objects;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          object = _ref[i];
          if (object.distance === this.data.distance[this.level]) {
            draw = false;
          }
        }
        if (draw) {
          return this.createGeometry();
        }
      }
    } else {
      if (this.creating) {
        manager.cancel(this.creating);
        return this.creating = false;
      }
    }
  };

  Flat.prototype.createGeometry = function() {
    this.creating = new Task({
      id: 'createGeometry' + this.flat_i + '' + this.flat_j,
      worker: 'worker',
      data: {
        task: 'createGeometry',
        level: this.level,
        units: this.units,
        options: {
          flatsize: this.options.flatsize,
          dencity: this.options.dencity,
          grasswidth: this.options.grasswidth,
          grassheight: this.options.grassheight
        }
      },
      callback: (function(_this) {
        return function(e) {
          var face, geometry, material, mesh, vertex, _i, _j, _len, _len1, _ref, _ref1;
          geometry = new THREE.Geometry;
          _ref = e.data.geometry.vertices;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            vertex = _ref[_i];
            geometry.vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
          }
          _ref1 = e.data.geometry.faces;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            face = _ref1[_j];
            geometry.faces.push(new THREE.Face3(face.a, face.b, face.c));
          }
          geometry.computeFaceNormals();
          material = _this.data.material[_this.level];
          mesh = new THREE.Mesh(geometry, material);
          _this.addLevel(mesh, _this.data.distance[_this.level]);
          return _this.creating = false;
        };
      })(this)
    });
    return manager["do"](this.creating);
  };

  return Flat;

})(THREE.LOD);

ThreadManager = (function() {
  function ThreadManager(options) {
    var i, _i, _ref;
    this.threads = [];
    this.tasks = [];
    for (i = _i = 0, _ref = options.threads - 1; _i <= _ref; i = _i += 1) {
      this.threads[i] = new Thread({
        id: i
      });
    }
    this.interval = setInterval((function(_this) {
      return function() {
        var thread, _j, _len, _ref1, _results;
        if (_this.tasks[0]) {
          _ref1 = _this.threads;
          _results = [];
          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
            thread = _ref1[_j];
            if (thread.idle) {
              if (_this.tasks[0]) {
                thread.process(_this.tasks[0]);
                _results.push(_this.tasks.splice(0, 1));
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      };
    })(this), 1);
  }

  ThreadManager.prototype["do"] = function(task) {
    return this.tasks.push(task);
  };

  ThreadManager.prototype.cancel = function(task) {
    var i, v, _i, _len, _ref, _results;
    _ref = this.tasks;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      v = _ref[i];
      if (v) {
        if (v.id === task.id) {
          console.log('cancel', i);
          if (this.tasks[i]) {
            _results.push(this.tasks.splice(i, 1));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return ThreadManager;

})();

Thread = (function() {
  function Thread(options) {
    this.id = options.id;
    this.idle = true;
    this.worker = {};
  }

  Thread.prototype.process = function(task) {
    var time;
    console.log('Thread.process.start');
    this.idle = false;
    time = new Date;
    console.log('Thread', this.id, 'process', task);
    this.worker = new Worker(task.worker + '.js');
    this.worker.postMessage(task.data);
    return this.worker.addEventListener('message', (function(_this) {
      return function(e) {
        task.callback(e);
        _this.worker.terminate();
        _this.idle = true;
        return console.log('Thread', _this.id, 'finished, total time', (new Date - time) / 1000, 'data', e.data);
      };
    })(this));
  };

  return Thread;

})();

Task = (function() {
  function Task(options) {
    this.id = options.id, this.worker = options.worker, this.callback = options.callback, this.data = options.data;
  }

  return Task;

})();
