var AssetsManager, Atmosphere, EnvironmentSystem, GraphicEngine, GrassFlat, GrassSystem, ObjectsSystem, Task, Terrain, TerrainFlat, Thread, ThreadManager, assets, graphic, manager,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

manager = {};

graphic = {};

assets = {};

$(document).ready(function() {
  assets = new AssetsManager;
  graphic = new GraphicEngine;
  return manager = new ThreadManager({
    threads: 4
  });
});

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
    this.camera.position.set(-5, 50, -5);
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
    setTimeout((function(_this) {
      return function() {
        return _this.initialize();
      };
    })(this), 1000);
  }

  GraphicEngine.prototype.resize = function() {
    this.camera.aspect = this.wrapper.width() / this.wrapper.height();
    this.camera.updateProjectionMatrix();
    return this.renderer.setSize(this.wrapper.width(), this.wrapper.height());
  };

  GraphicEngine.prototype.stop = function() {
    return cancelAnimationFrame(this.interval);
  };

  GraphicEngine.prototype.initialize = function(options) {
    var axisHelper, gridHelper;
    axisHelper = new THREE.AxisHelper(5);
    this.scene.add(axisHelper);
    gridHelper = new THREE.GridHelper(20, 1);
    this.scene.add(gridHelper);
    this.ambientlight = new THREE.AmbientLight(0xa0a0a0);
    this.scene.add(this.ambientlight);
    this.environment = new EnvironmentSystem;
    this.scene.add(this.environment);
    return this.render();
  };

  GraphicEngine.prototype.render = function() {
    this.camera.update();
    this.environment.update(this.camera);
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
    return this.interval = requestAnimationFrame(this.render.bind(this));
  };

  return GraphicEngine;

})();

EnvironmentSystem = (function(_super) {
  __extends(EnvironmentSystem, _super);

  function EnvironmentSystem(options) {
    var map;
    THREE.Object3D.call(this);
    this.name = 'environment';
    map = document.createElement('img');
    map.src = 'heightmap.png';
    map.addEventListener('load', (function(_this) {
      return function() {
        var canvas;
        canvas = document.createElement('canvas');
        canvas.width = map.width;
        canvas.height = map.height;
        _this.heightmap = canvas.getContext('2d');
        _this.heightmap.drawImage(map, 0, 0, canvas.width, canvas.height);
        map = document.createElement('img');
        map.src = 'grassmap.png';
        return map.addEventListener('load', function() {
          canvas = document.createElement('canvas');
          canvas.width = map.width;
          canvas.height = map.height;
          _this.grassmap = canvas.getContext('2d');
          _this.grassmap.drawImage(map, 0, 0, canvas.width, canvas.height);
          _this.terrain = new Terrain({
            _: _this
          });
          _this.add(_this.terrain);
          return $.get('environment.json', function(data) {
            _this.objects = new ObjectsSystem({
              _: _this,
              asset: JSON.parse(data).objects
            });
            return _this.add(_this.objects);
          });
        });
      };
    })(this));
  }

  EnvironmentSystem.prototype.update = function(camera) {
    if (this.grass) {
      this.grass.update(camera);
    }
    if (this.terrain) {
      return this.terrain.update(camera);
    }
  };

  return EnvironmentSystem;

})(THREE.Object3D);

Atmosphere = (function(_super) {
  __extends(Atmosphere, _super);

  function Atmosphere(options) {
    var geometry, material;
    THREE.Object3D.call(this);
    this.name = 'atmosphere';
    this.options = {
      radius: 1000
    };
    geometry = new THREE.SphereGeometry(this.options.radius, 32, 32);
    material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      side: THREE.BackSide
    });
    this.sphere = new THREE.Mesh(geometry, material);
    this.add(this.sphere);
  }

  return Atmosphere;

})(THREE.Object3D);

ObjectsSystem = (function(_super) {
  __extends(ObjectsSystem, _super);

  function ObjectsSystem(options) {
    var i, k, object, v, _i, _len, _ref, _ref1;
    this._ = options._, this.asset = options.asset;
    THREE.Object3D.call(this);
    this.name = 'stones';
    this.groups = [];
    _ref = this.asset;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      object = _ref[i];
      this.handleObject(object);
    }
    _ref1 = this.groups;
    for (k in _ref1) {
      v = _ref1[k];
      this.creteGroupGeometry(v, k);
    }
  }

  ObjectsSystem.prototype.handleObject = function(object, parent) {
    var k, model, new_object, v, _ref, _ref1, _results;
    if (parent) {
      if (object.position && parent.position) {
        if (parent.position.x) {
          object.position.x += parent.position.x;
        }
        if (parent.position.y) {
          object.position.y += parent.position.y;
        }
        if (parent.position.z) {
          object.position.z += parent.position.z;
        }
      }
    } else {
      object.position.y = this._.terrain.getHeightValue(object.position.x, object.position.z);
    }
    if (object.model) {
      model = assets.graphic.model[object.model];
    } else {
      model = object;
    }
    if (model.type.json) {
      if (model.geometryID) {
        object.geometry = assets.graphic.geometry[model.geometryID];
        if (!object.geometry.task) {
          object.geometry = getGeometryVFData(object.geometry);
        }
      }
      if (model.materialID) {
        if (!this.groups[model.materialID]) {
          this.groups[model.materialID] = [];
        }
        new_object = {
          geometry: object.geometry,
          position: object.position,
          rotation: object.rotation,
          scale: object.scale,
          data: object.data
        };
        this.groups[model.materialID].push(new_object);
      }
      object.children = {};
      _ref = model.children;
      for (k in _ref) {
        v = _ref[k];
        object.children[k] = JSON.parse(JSON.stringify(v));
      }
      _ref1 = object.children;
      _results = [];
      for (k in _ref1) {
        v = _ref1[k];
        _results.push(this.handleObject(v, object));
      }
      return _results;
    } else {
      model.position.x = object.position.x || 0;
      model.position.y = object.position.y || 0;
      model.position.z = object.position.z || 0;
      model.rotation.x = object.rotation.x || 0;
      model.rotation.y = object.rotation.y || 0;
      model.rotation.z = object.rotation.z || 0;
      model.scale.x = object.scale.x || 1;
      model.scale.y = object.scale.y || 1;
      model.scale.z = object.scale.z || 1;
      return this.add(model);
    }
  };

  ObjectsSystem.prototype.creteGroupGeometry = function(group, materialID) {
    return manager["do"](new Task({
      id: 'ObjectsSystem.creteGroupGeometry' + materialID,
      worker: 'worker',
      data: {
        task: 'ObjectsSystem.creteGroupGeometry',
        group: group
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
          material = assets.graphic.material[materialID];
          mesh = new THREE.Mesh(geometry, material);
          return _this.add(mesh);
        };
      })(this)
    }));
  };

  ObjectsSystem.prototype.update = function() {};

  return ObjectsSystem;

})(THREE.Object3D);

Terrain = (function(_super) {
  __extends(Terrain, _super);

  function Terrain(options) {
    var i, j, _i, _j, _ref, _ref1;
    this._ = options._;
    THREE.Object3D.call(this);
    this.name = 'terrain';
    this.options = {
      size: 1000,
      flatsize: 100,
      distance: 75
    };
    this.data = {};
    this.data.distance = [this.options.distance, this.options.distance * 2, this.options.distance * 3, this.options.distance * 4, this.options.distance * 5, this.options.distance * 6];
    this.data.material = [];
    this.data.material[0] = new THREE.MeshBasicMaterial({
      color: 0xff1111,
      wireframe: true
    });
    this.data.material[1] = new THREE.MeshBasicMaterial({
      color: 0x11ff11,
      wireframe: true
    });
    this.data.material[2] = new THREE.MeshBasicMaterial({
      color: 0x1111ff,
      wireframe: true
    });
    this.data.material[3] = new THREE.MeshBasicMaterial({
      color: 0x1111ff,
      wireframe: true
    });
    this.data.material[4] = new THREE.MeshBasicMaterial({
      color: 0xff11ff,
      wireframe: true
    });
    this.count = this.options.size / this.options.flatsize;
    this.created = false;
    this.initialized = false;
    this.initializing = false;
    this.radius = {
      initialization: 1000,
      update: 250
    };
    for (i = _i = 0, _ref = this.count - 1; _i <= _ref; i = _i += 1) {
      for (j = _j = 0, _ref1 = this.count - 1; _j <= _ref1; j = _j += 1) {
        this.createFlat(i, j);
      }
    }
    this.created = true;
  }

  Terrain.prototype.createFlat = function(i, j) {
    var flat, heightmap_units, imagedata, index, middle_value, x, y, _i, _j, _k, _ref, _ref1, _ref2;
    imagedata = this._.heightmap.getImageData(i * this.options.flatsize, j * this.options.flatsize, this.options.flatsize + 1, this.options.flatsize + 1).data;
    heightmap_units = [];
    middle_value = 1000000;
    for (index = _i = 0, _ref = imagedata.length - 1; _i <= _ref; index = _i += 4) {
      y = Math.floor(index / (4 * (this.options.flatsize + 1)));
      if (!heightmap_units[y]) {
        heightmap_units[y] = [];
      }
      x = index / 4 - (this.options.flatsize + 1) * y;
      heightmap_units[y][x] = imagedata[index];
      if (heightmap_units[y][x] < middle_value) {
        middle_value = heightmap_units[y][x];
      }
    }
    for (y = _j = 0, _ref1 = heightmap_units.length - 1; _j <= _ref1; y = _j += 1) {
      for (x = _k = 0, _ref2 = heightmap_units[y].length - 1; _k <= _ref2; x = _k += 1) {
        heightmap_units[y][x] -= middle_value;
      }
    }
    flat = new TerrainFlat({
      i: i,
      j: j,
      middle_value: middle_value,
      units: heightmap_units,
      options: this.options,
      data: this.data
    });
    return this.add(flat);
  };

  Terrain.prototype.getHeightValue = function(x, z) {
    var i, j;
    i = Math.floor(x);
    j = Math.floor(z);
    if (i >= 0 && j >= 0) {
      return billinearInterpolation({
        A: this._.heightmap.getImageData(i, j, 1, 1).data[0],
        B: this._.heightmap.getImageData(i + 1, j, 1, 1).data[0],
        C: this._.heightmap.getImageData(i + 1, j + 1, 1, 1).data[0],
        D: this._.heightmap.getImageData(i, j + 1, 1, 1).data[0],
        px: x - i,
        py: z - j
      });
    } else {
      return 0;
    }
  };

  Terrain.prototype.update = function(camera) {
    var distance, flat, initialized, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results, _results1;
    if (this.created) {
      if (!this.initialized) {
        if (!this.initializing) {
          this.initializing = true;
          _ref = this.children;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            flat = _ref[_i];
            distance = new THREE.Vector3(camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z).length();
            if (distance <= this.radius.initialization) {
              flat.initializing = true;
              flat.checkLevel(camera);
              _results.push(flat.createGeometry());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        } else {
          initialized = true;
          _ref1 = this.children;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            flat = _ref1[_j];
            if (flat.initializing) {
              if (!flat.initialized) {
                initialized = false;
              }
            }
          }
          if (initialized) {
            this.initializing = false;
            return this.initialized = true;
          }
        }
      } else {
        _ref2 = this.children;
        _results1 = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          flat = _ref2[_k];
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
    }
  };

  return Terrain;

})(THREE.Object3D);

TerrainFlat = (function(_super) {
  __extends(TerrainFlat, _super);

  function TerrainFlat(options) {
    this.i = options.i, this.j = options.j, this.options = options.options, this.data = options.data, this.units = options.units, this.middle_value = options.middle_value;
    THREE.LOD.call(this);
    this.creating = false;
    this.initializing = false;
    this.initialized = false;
    this.level = false;
    this.step = [1, 2, 4, 10, 20, 25];
    this.position.x = (this.i + 0.5) * this.options.flatsize;
    this.position.z = (this.j + 0.5) * this.options.flatsize;
  }

  TerrainFlat.prototype.checkLevel = function(camera) {
    var distance, level, v1, v2;
    this.updateMatrixWorld();
    v1 = new THREE.Vector3;
    v2 = new THREE.Vector3;
    v1.setFromMatrixPosition(camera.matrixWorld);
    v2.setFromMatrixPosition(this.matrixWorld);
    distance = v1.distanceTo(v2);
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
    this.level = level;
    if (this.initialized) {
      return this.update(camera);
    }
  };

  TerrainFlat.prototype.checkGeometry = function(camera) {
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
          console.log('TerrainFlat', this.i, this.j, 'checkGeometry', this.level);
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

  TerrainFlat.prototype.createGeometry = function() {
    this.creating = new Task({
      id: 'TerrainSystem.createTerrainFlatGeometry' + this.i + '' + this.j,
      worker: 'worker',
      data: {
        task: 'TerrainSystem.createTerrainFlatGeometry',
        step: this.step[this.level],
        units: this.units,
        options: {
          flatsize: this.options.flatsize
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
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.y = _this.middle_value;
          _this.addLevel(mesh, _this.data.distance[_this.level]);
          _this.creating = false;
          if (_this.initializing) {
            _this.initializing = false;
            return _this.initialized = true;
          }
        };
      })(this)
    });
    return manager["do"](this.creating);
  };

  return TerrainFlat;

})(THREE.LOD);

GrassSystem = (function(_super) {
  __extends(GrassSystem, _super);

  function GrassSystem(options) {
    var i, j, _i, _j, _ref, _ref1;
    this._ = options._;
    THREE.Object3D.call(this);
    this.name = 'grass';
    this.options = {
      size: 1000,
      flatsize: 20,
      dencity: 2,
      distance: 20,
      grassheight: 1,
      grasswidth: 0.3
    };
    this.data = {};
    this.data.distance = [this.options.distance, this.options.distance * 2, this.options.distance * 3, this.options.distance * 4, this.options.distance * 5, this.options.distance * 6];
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
      color: 0x00ffff,
      side: THREE.DoubleSide
    });
    this.data.material[4] = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      side: THREE.DoubleSide
    });
    this.count = this.options.size / this.options.flatsize;
    this.created = false;
    this.initializing = false;
    this.initialized = false;
    this.radius = {
      initialization: 100,
      update: 150
    };
    for (i = _i = 0, _ref = this.count - 1; _i <= _ref; i = _i += 1) {
      for (j = _j = 0, _ref1 = this.count - 1; _j <= _ref1; j = _j += 1) {
        this.createFlat(i, j);
      }
    }
    this.created = true;
  }

  GrassSystem.prototype.createFlat = function(i, j) {
    var flat, grassmap_units, hasgrass, heightmap_units, imagedata, index, middle_value, x, y, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
    imagedata = this._.grassmap.getImageData(i * this.options.flatsize, j * this.options.flatsize, this.options.flatsize, this.options.flatsize).data;
    grassmap_units = [];
    hasgrass = false;
    for (index = _i = 0, _ref = imagedata.length - 1; _i <= _ref; index = _i += 4) {
      y = Math.floor(index / (4 * this.options.flatsize));
      if (!grassmap_units[y]) {
        grassmap_units[y] = [];
      }
      x = index / 4 - this.options.flatsize * y;
      grassmap_units[y][x] = false;
      if (imagedata[index] > 0) {
        if (!hasgrass) {
          hasgrass = true;
        }
        grassmap_units[y][x] = true;
      }
    }
    if (hasgrass) {
      imagedata = this._.heightmap.getImageData(i * this.options.flatsize, j * this.options.flatsize, this.options.flatsize + 1, this.options.flatsize + 1).data;
      heightmap_units = [];
      middle_value = 1000000;
      for (index = _j = 0, _ref1 = imagedata.length - 1; _j <= _ref1; index = _j += 4) {
        y = Math.floor(index / (4 * (this.options.flatsize + 1)));
        if (!heightmap_units[y]) {
          heightmap_units[y] = [];
        }
        x = index / 4 - (this.options.flatsize + 1) * y;
        heightmap_units[y][x] = imagedata[index];
        if (heightmap_units[y][x] < middle_value) {
          middle_value = heightmap_units[y][x];
        }
      }
      for (y = _k = 0, _ref2 = heightmap_units.length - 1; _k <= _ref2; y = _k += 1) {
        for (x = _l = 0, _ref3 = heightmap_units[y].length - 1; _l <= _ref3; x = _l += 1) {
          heightmap_units[y][x] -= middle_value;
        }
      }
      flat = new GrassFlat({
        i: i,
        j: j,
        units: {
          heightmap: heightmap_units,
          grassmap: grassmap_units
        },
        middle_value: middle_value,
        options: this.options,
        data: this.data
      });
      return this.add(flat);
    }
  };

  GrassSystem.prototype.update = function(camera) {
    var distance, flat, initialized, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results, _results1;
    if (this.created) {
      if (!this.initialized) {
        if (!this.initializing) {
          this.initializing = true;
          _ref = this.children;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            flat = _ref[_i];
            distance = new THREE.Vector3(camera.position.x - flat.position.x, camera.position.y - flat.position.y, camera.position.z - flat.position.z).length();
            if (distance <= this.radius.initialization) {
              flat.initializing = true;
              flat.checkLevel(camera);
              _results.push(flat.createGeometry());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        } else {
          initialized = true;
          _ref1 = this.children;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            flat = _ref1[_j];
            if (flat.initializing) {
              if (!flat.initialized) {
                initialized = false;
              }
            }
          }
          if (initialized) {
            this.initializing = false;
            return this.initialized = true;
          }
        }
      } else {
        _ref2 = this.children;
        _results1 = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          flat = _ref2[_k];
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
    }
  };

  return GrassSystem;

})(THREE.Object3D);

GrassFlat = (function(_super) {
  __extends(GrassFlat, _super);

  function GrassFlat(options) {
    this.i = options.i, this.j = options.j, this.options = options.options, this.data = options.data, this.units = options.units, this.middle_value = options.middle_value;
    THREE.LOD.call(this);
    this.creating = false;
    this.initializing = false;
    this.initialized = false;
    this.level = false;
    this.position.x = (this.i + 0.5) * this.options.flatsize;
    this.position.z = (this.j + 0.5) * this.options.flatsize;
  }

  GrassFlat.prototype.checkLevel = function(camera) {
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

  GrassFlat.prototype.checkGeometry = function(camera) {
    var draw, frustum, object, _i, _len, _ref;
    frustum = new THREE.Frustum;
    frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    if (frustum.containsPoint(this.position)) {
      if (!this.creating) {
        draw = true;
        _ref = this.objects;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          object = _ref[_i];
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

  GrassFlat.prototype.createGeometry = function() {
    this.creating = new Task({
      id: 'GrassSystem.createGrassFlatGeometry' + this.i + '' + this.j,
      worker: 'worker',
      data: {
        task: 'GrassSystem.createGrassFlatGeometry',
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
          mesh.position.y = _this.middle_value;
          _this.addLevel(mesh, _this.data.distance[_this.level]);
          _this.creating = false;
          if (_this.initializing) {
            return _this.initialized = true;
          }
        };
      })(this)
    });
    return manager["do"](this.creating);
  };

  return GrassFlat;

})(THREE.LOD);

AssetsManager = (function() {
  function AssetsManager(options) {
    this.graphic = {
      model: {},
      material: {},
      geometry: {}
    };
    this.loadModel('stone1');
    this.loadGeometry('stone1');
    this.loadMaterial('stone1');
    this.loadModel('tree1');
    this.loadGeometry('tree1_bottom');
    this.loadGeometry('tree1_up');
    this.loadMaterial('tree1_up');
    this.loadMaterial('tree1_bottom');
    this.loadModel('building1');
  }

  AssetsManager.prototype.loadModel = function(url) {
    return $.get('assets/graphic/model/' + url + '/options.json', (function(_this) {
      return function(data) {
        var loader, options;
        options = JSON.parse(data);
        if (options.type.json) {
          return $.get('assets/graphic/model/' + url + '/model.json', function(data) {
            _this.graphic.model[url] = JSON.parse(data);
            return _this.graphic.model[url].type = {
              json: true
            };
          });
        } else if (options.type.dae) {
          loader = new THREE.ColladaLoader;
          loader.options.convertUpAxis = true;
          return loader.load('assets/graphic/model/' + url + '/model.dae', function(collada) {
            _this.graphic.model[url] = collada.scene;
            return _this.graphic.model[url].type = {
              dae: true
            };
          });
        }
      };
    })(this));
  };

  AssetsManager.prototype.loadMaterial = function(url) {
    return $.get('assets/graphic/material/' + url + '/options.json', (function(_this) {
      return function(data) {
        var options, texture;
        options = JSON.parse(data);
        if (options.map.texture) {
          texture = THREE.ImageUtils.loadTexture('assets/graphic/material/' + url + '/texture.png');
        }
        return $.get('assets/graphic/material/' + url + '/material.js', function(data) {
          eval(data);
          return _this.graphic.material[url] = material;
        });
      };
    })(this));
  };

  AssetsManager.prototype.loadGeometry = function(url) {
    return $.get('assets/graphic/geometry/' + url + '/options.json', (function(_this) {
      return function(data) {
        var geometry, loader, options;
        options = JSON.parse(data);
        if (options.type.task) {
          return $.get('assets/graphic/geometry/' + url + '/geometry.js', function(data) {
            eval(data);
            return _this.graphic.geometry[url] = geometry;
          });
        } else if (options.type.js) {
          return $.get('assets/graphic/geometry/' + url + '/geometry.js', function(data) {
            eval(data);
            return _this.graphic.geometry[url] = geometry;
          });
        } else if (options.type.dae) {
          loader = new THREE.ColladaLoader;
          loader.options.convertUpAxis = true;
          geometry = new THREE.Geometry;
          loader.load('assets/graphic/geometry/' + url + '/geometry.dae', function(collada) {
            return collada.scene.traverse(function(children) {
              if (children.type === 'Mesh') {
                children.updateMatrix();
                return geometry.merge(children.geometry, children.matrix);
              }
            });
          });
          return _this.graphic.geometry[url] = geometry;
        }
      };
    })(this));
  };

  return AssetsManager;

})();

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
    this.idle = false;
    time = new Date;
    this.worker = new Worker(task.worker + '.js');
    this.worker.postMessage(task.data);
    return this.worker.addEventListener('message', (function(_this) {
      return function(e) {
        task.callback(e);
        _this.worker.terminate();
        return _this.idle = true;
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
