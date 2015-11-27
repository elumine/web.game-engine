var AssetsManager, AtmosphereLayer, CloudLayer, EnvironmentLayer, GraphicEngine, GrassFlat, GrassLayer, InfinityLayer, ObjectsLayer, Task, TerrainLayer, TerrainLayerFlat, Thread, ThreadManager, assets, graphic, manager,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

manager = {};

graphic = {};

assets = {};

$(document).ready(function() {
  manager = new ThreadManager({
    threads: 4
  });
  assets = new AssetsManager;
  return setTimeout((function(_this) {
    return function() {
      return graphic = new GraphicEngine;
    };
  })(this));
});

GraphicEngine = (function() {
  function GraphicEngine(_) {
    this._ = _;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this.rendererStats = new THREEx.RendererStats;
    this.rendererStats.domElement.style.position = 'absolute';
    this.rendererStats.domElement.style.bottom = '0px';
    this.rendererStats.domElement.style.left = '0px';
    this.stats = new Stats;
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.left = '0px';
    this.wrapper = $('#viewport');
    this.wrapper.append(this.renderer.domElement);
    this.wrapper.append(this.stats.domElement);
    this.wrapper.append(this.rendererStats.domElement);
    this.clock = new THREE.Clock;
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(75, this.wrapper.width() / this.wrapper.height(), 0.1, 10000000);
    this.camera.position.set(0, 3, 0);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(new THREE.Vector3(5, 0, 5));
    this.camera.mode = 'float';
    this.camera.float = {
      fi: 90,
      tetha: 60,
      speed: 0.5,
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
    var axisHelper, gridHelper, helper;
    this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.005);
    this.renderer.setClearColor(this.scene.fog.color);
    axisHelper = new THREE.AxisHelper(5);
    this.scene.add(axisHelper);
    gridHelper = new THREE.GridHelper(20, 1);
    this.ambientlight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientlight);
    this.sun = new THREE.Object3D;
    this.sun.radius = 50;
    this.scene.add(this.sun);
    this.sun.light = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.light.target = this.camera;
    this.sun.light.position.x = -50;
    this.sun.light.position.y = 50;
    this.sun.light.position.z = -50;
    this.sun.light.intensity = 0.5;
    this.sun.light.castShadow = true;
    this.sun.light.shadowMapWidth = 4096;
    this.sun.light.shadowMapHeight = 4096;
    this.sun.light.shadowDarkness = 0.75;
    this.sun.light.shadowCameraVisible = true;
    this.sun.light.shadowCameraNear = 1;
    this.sun.light.shadowCameraFar = 1000;
    this.sun.light.shadowCameraLeft = -this.sun.radius;
    this.sun.light.shadowCameraRight = this.sun.radius;
    this.sun.light.shadowCameraTop = this.sun.radius;
    this.sun.light.shadowCameraBottom = -this.sun.radius;
    this.sun.add(this.sun.light);
    helper = new THREE.DirectionalLightHelper(this.sun.light);
    this.scene.add(helper);
    this.define('environmentLayer', new EnvironmentLayer);
    return this.render();
  };

  GraphicEngine.prototype.define = function(name, object) {
    this[name] = object;
    return this.scene.add(this[name]);
  };

  GraphicEngine.prototype.render = function() {
    this.camera.update();
    this.environmentLayer.cloudLayer.rotation.y += 0.01;
    this.sun.rotation.y += 0.01;
    this.sun.position.x = this.camera.position.x;
    this.sun.position.y = this.camera.position.y + 50;
    this.sun.position.z = this.camera.position.z;
    this.environmentLayer.update(this.camera);
    this.renderer.render(this.scene, this.camera);
    this.rendererStats.update(this.renderer);
    this.stats.update();
    return this.interval = requestAnimationFrame(this.render.bind(this));
  };

  return GraphicEngine;

})();

EnvironmentLayer = (function(_super) {
  __extends(EnvironmentLayer, _super);

  function EnvironmentLayer(options) {
    var map;
    THREE.Object3D.call(this);
    this.name = 'environmentLayer';
    this.define('atmosphereLayer', new AtmosphereLayer);
    this.define('cloudLayer', new CloudLayer);
    this.define('infinityLayer', new InfinityLayer);
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
          return $.get('terrain.json', function(data) {
            _this.define('terrainLayer', new TerrainLayer({
              _: _this,
              asset: JSON.parse(data)
            }));
            return $.get('environment.json', function(data) {
              _this.define('objectsLayer', new ObjectsLayer({
                _: _this,
                asset: JSON.parse(data).objects
              }));
              return _this.define('grassLayer', new GrassLayer({
                _: _this
              }));
            });
          });
        });
      };
    })(this));
  }

  EnvironmentLayer.prototype.update = function(camera) {
    if (this.grassLayer) {
      this.grassLayer.update(camera);
    }
    if (this.terrainLayer) {
      return this.terrainLayer.update(camera);
    }
  };

  return EnvironmentLayer;

})(THREE.Object3D);

AtmosphereLayer = (function(_super) {
  __extends(AtmosphereLayer, _super);

  function AtmosphereLayer(options) {
    var geometry, material;
    THREE.Object3D.call(this);
    this.name = 'atmosphereLayer';
    this.options = {
      radius: 1000
    };
    geometry = new THREE.SphereGeometry(this.options.radius, 32, 32);
    material = assets.graphic.material.atmosphere;
    material.fog = false;
    this.sphere = new THREE.Mesh(geometry, material);
    this.add(this.sphere);
  }

  return AtmosphereLayer;

})(THREE.Object3D);

CloudLayer = (function(_super) {
  __extends(CloudLayer, _super);

  function CloudLayer(options) {
    var i, sprite, wrapper, _i, _ref;
    THREE.Object3D.call(this);
    this.name = 'CloudLayer';
    this.options = {
      radius: 500,
      position: {
        y: 150
      },
      count: 4,
      scale: {
        x: 400,
        y: 200
      }
    };
    for (i = _i = 0, _ref = this.options.count - 1; _i <= _ref; i = _i += 1) {
      wrapper = new THREE.Object3D;
      wrapper.rotation.y = 2 * Math.PI * (i / this.options.count);
      this.add(wrapper);
      sprite = new THREE.Sprite(assets.graphic.material.cloud1);
      sprite.position.x = this.options.radius;
      sprite.position.y = this.options.position.y;
      sprite.scale.set(this.options.scale.x, this.options.scale.y, 1);
      wrapper.add(sprite);
    }
  }

  return CloudLayer;

})(THREE.Object3D);

InfinityLayer = (function(_super) {
  __extends(InfinityLayer, _super);

  function InfinityLayer(options) {
    var geometry, geometry1, geometry2, material, mesh, mesh1, mesh2, mesh3, mesh4;
    THREE.Object3D.call(this);
    this.name = 'infinityLayer';
    this.worldsize = 100;
    this.offset = 1000;
    geometry = new THREE.Geometry;
    geometry1 = new THREE.PlaneGeometry(this.worldsize + 2 * this.offset, this.offset, 1, 1);
    geometry2 = new THREE.PlaneGeometry(this.offset, this.worldsize, 1, 1);
    mesh1 = new THREE.Mesh(geometry1);
    mesh1.position.x = this.worldsize / 2;
    mesh1.position.y = 0;
    mesh1.position.z = -0.5 * this.offset;
    mesh1.rotation.x = -Math.PI / 2;
    mesh1.updateMatrix();
    geometry.merge(mesh1.geometry, mesh1.matrix);
    mesh2 = new THREE.Mesh(geometry1);
    mesh2.position.x = this.worldsize / 2;
    mesh2.position.y = 0;
    mesh2.position.z = 0.5 * this.offset + this.worldsize;
    mesh2.rotation.x = -Math.PI / 2;
    mesh2.updateMatrix();
    geometry.merge(mesh2.geometry, mesh2.matrix);
    mesh3 = new THREE.Mesh(geometry2);
    mesh3.position.x = -0.5 * this.offset;
    mesh3.position.y = 0;
    mesh3.position.z = this.worldsize / 2;
    mesh3.rotation.x = -Math.PI / 2;
    mesh3.updateMatrix();
    geometry.merge(mesh3.geometry, mesh3.matrix);
    mesh4 = new THREE.Mesh(geometry2);
    mesh4.position.x = 0.5 * this.offset + this.worldsize;
    mesh4.position.y = 0;
    mesh4.position.z = this.worldsize / 2;
    mesh4.rotation.x = -Math.PI / 2;
    mesh4.updateMatrix();
    geometry.merge(mesh4.geometry, mesh4.matrix);
    material = assets.graphic.material.water2;
    material.normalMap.repeat.set(this.worldsize / 10, this.worldsize / 10);
    mesh = new THREE.Mesh(geometry, material);
    this.add(mesh);
  }

  return InfinityLayer;

})(THREE.Object3D);

ObjectsLayer = (function(_super) {
  __extends(ObjectsLayer, _super);

  function ObjectsLayer(options) {
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

  ObjectsLayer.prototype.handleObject = function(object, parent) {
    var k, model, new_object, v, _ref, _ref1, _results;
    if (!object.position) {
      object.position = {
        x: 0,
        y: 0,
        z: 0
      };
    }
    if (!object.rotation) {
      object.rotation = {
        x: 0,
        y: 0,
        z: 0
      };
    }
    if (!object.scale) {
      object.scale = {
        x: 0,
        y: 0,
        z: 0
      };
    }
    if (parent) {
      if (parent.position) {
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
      if (parent.rotation) {
        if (parent.rotation.x) {
          object.rotation.x += parent.rotation.x;
        }
        if (parent.rotation.y) {
          object.rotation.y += parent.rotation.y;
        }
        if (parent.rotation.z) {
          object.rotation.z += parent.rotation.z;
        }
      }
      if (parent.scale) {
        if (parent.scale.x) {
          object.scale.x += parent.scale.x;
        }
        if (parent.scale.y) {
          object.scale.y += parent.scale.y;
        }
        if (parent.scale.z) {
          object.scale.z += parent.scale.z;
        }
      }
    } else {
      if (!object.position.y) {
        object.position.y = this._.terrainLayer.getHeightValue(object.position.x, object.position.z);
      }
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

  ObjectsLayer.prototype.creteGroupGeometry = function(group, materialID) {
    return manager["do"](new Task({
      id: 'ObjectsLayer.creteGroupGeometry' + materialID,
      worker: 'worker',
      data: {
        task: 'ObjectsLayer.creteGroupGeometry',
        group: group
      },
      callback: (function(_this) {
        return function(e) {
          var geometry, material, mesh;
          geometry = setGeometryVFData(e.data.geometry);
          material = assets.graphic.material[materialID];
          mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          return _this.add(mesh);
        };
      })(this)
    }));
  };

  ObjectsLayer.prototype.update = function() {};

  return ObjectsLayer;

})(THREE.Object3D);

TerrainLayer = (function(_super) {
  __extends(TerrainLayer, _super);

  function TerrainLayer(options) {
    var i, j, _i, _j, _ref, _ref1;
    this._ = options._, this.asset = options.asset;
    THREE.Object3D.call(this);
    this.name = 'terrainLayer';
    this.options = {
      size: 1000,
      flatsize: 100
    };
    this.data = {};
    this.data.distance = [0, 150, 300, 450, 600, 750];
    this.data.material = assets.graphic.material.terrain;
    this.count = 1;
    this.created = false;
    this.initialized = false;
    this.initializing = false;
    this.radius = {
      initialization: 1000,
      update: 250
    };
    this.createTexure();
    for (i = _i = 0, _ref = this.count - 1; _i <= _ref; i = _i += 1) {
      for (j = _j = 0, _ref1 = this.count - 1; _j <= _ref1; j = _j += 1) {
        this.createFlat(i, j);
      }
    }
    this.created = true;
  }

  TerrainLayer.prototype.createTexure = function() {
    var canvas, object, _i, _len, _ref, _results;
    canvas = document.createElement('canvas');

    /*
    		canvas.style.position = 'absolute'
    		canvas.style.left = '100px'
    		canvas.style.top = '100px'
    		canvas.style.zIndex = 10
    		canvas.style.backgroundColor = '#000'
    		$('#viewport').append canvas
     */
    canvas.width = this.options.size / 5;
    canvas.height = this.options.size / 5;
    this.texture = canvas.getContext('2d');
    _ref = this.asset.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      if (object.type.polygon) {
        _results.push(this.drawPolygon(this.texture, object));
      } else if (object.type.path) {
        _results.push(this.drawPath(this.texture, object));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  TerrainLayer.prototype.drawPolygon = function(c, object) {
    var i, _i, _ref;
    c.beginPath();
    c.moveTo(object.vertices[0].x, object.vertices[0].y);
    for (i = _i = 1, _ref = object.vertices.length - 1; _i <= _ref; i = _i += 1) {
      c.lineTo(object.vertices[i].x, object.vertices[i].y);
    }
    c.lineTo(object.vertices[0].x, object.vertices[0].y);
    c.closePath();
    c.fillStyle = 'rgba(' + object.tileID[0] + ',' + object.tileID[1] + ',' + object.tileID[2] + ', 255)';
    return c.fill();
  };

  TerrainLayer.prototype.drawPath = function(c, object) {
    var i, _i, _ref;
    c.beginPath();
    c.moveTo(object.vertices[0].x, object.vertices[0].y);
    for (i = _i = 1, _ref = object.vertices.length - 1; _i <= _ref; i = _i += 1) {
      c.lineTo(object.vertices[i].x, object.vertices[i].y);
    }
    c.strokeStyle = 'rgba(' + object.tileID[0] + ',' + object.tileID[1] + ',' + object.tileID[2] + ', 255)';
    c.strokeWidth = 1;
    return c.stroke();
  };

  TerrainLayer.prototype.createFlat = function(i, j) {
    var flat, heightmap_units, imagedata, index, max_value, mid_value, min_value, x, y, _i, _j, _k, _ref, _ref1, _ref2;
    imagedata = this._.heightmap.getImageData(i * this.options.flatsize, j * this.options.flatsize, this.options.flatsize + 1, this.options.flatsize + 1).data;
    heightmap_units = [];
    min_value = 1000;
    max_value = 0;
    for (index = _i = 0, _ref = imagedata.length - 1; _i <= _ref; index = _i += 4) {
      y = Math.floor(index / (4 * (this.options.flatsize + 1)));
      if (!heightmap_units[y]) {
        heightmap_units[y] = [];
      }
      x = index / 4 - (this.options.flatsize + 1) * y;
      heightmap_units[y][x] = imagedata[index];
      if (heightmap_units[y][x] < min_value) {
        min_value = heightmap_units[y][x];
      }
      if (heightmap_units[y][x] > max_value) {
        max_value = heightmap_units[y][x];
      }
    }
    mid_value = min_value + (max_value - min_value) / 2;
    for (y = _j = 0, _ref1 = heightmap_units.length - 1; _j <= _ref1; y = _j += 1) {
      for (x = _k = 0, _ref2 = heightmap_units[y].length - 1; _k <= _ref2; x = _k += 1) {
        heightmap_units[y][x] -= mid_value;
      }
    }
    flat = new TerrainLayerFlat({
      i: i,
      j: j,
      mid_value: mid_value,
      units: heightmap_units,
      options: this.options,
      data: this.data,
      globaltexure: this.texture
    });
    return this.add(flat);
  };

  TerrainLayer.prototype.getHeightValue = function(x, z) {
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

  TerrainLayer.prototype.update = function(camera) {
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

  return TerrainLayer;

})(THREE.Object3D);

TerrainLayerFlat = (function(_super) {
  __extends(TerrainLayerFlat, _super);

  function TerrainLayerFlat(options) {
    this.i = options.i, this.j = options.j, this.options = options.options, this.data = options.data, this.units = options.units, this.mid_value = options.mid_value, this.globaltexure = options.globaltexure;
    THREE.LOD.call(this);
    this.creating = false;
    this.initializing = false;
    this.initialized = false;
    this.level = false;
    this.step = [1, 2, 4, 10, 20, 25];
    this.tilesize = 10;
    this.material = this.data.material.clone();
    this.material.map = this.createTexure();
    this.position.x = (this.i + 0.5) * this.options.flatsize;
    this.position.y = this.mid_value;
    this.position.z = (this.j + 0.5) * this.options.flatsize;
  }

  TerrainLayerFlat.prototype.createTexure = function() {
    var b, canvas, ctx, diffuse, g, imagedata, index, r, tile, x, y, _i, _ref;
    canvas = document.createElement('canvas');
    canvas.width = this.options.flatsize * this.tilesize;
    canvas.height = this.options.flatsize * this.tilesize;

    /*
    		canvas.style.position = 'absolute'
    		canvas.style.left = '650px'
    		canvas.style.top = '100px'
    		canvas.style.zIndex = 10
    		canvas.style.backgroundColor = '#000'
     */
    ctx = canvas.getContext('2d');
    imagedata = this.globaltexure.getImageData(this.i * this.options.flatsize, this.j * this.options.flatsize, this.options.flatsize, this.options.flatsize).data;
    for (index = _i = 0, _ref = imagedata.length - 1; _i <= _ref; index = _i += 4) {
      y = Math.floor(index / (4 * this.options.flatsize));
      x = index / 4 - this.options.flatsize * y;
      r = imagedata[index];
      g = imagedata[index + 1];
      b = imagedata[index + 2];
      tile = assets.graphic.images['terrainLayer_tile' + r + '' + g + '' + b];
      if (!tile) {
        tile = assets.graphic.images['terrainLayer_tile000'];
      }
      ctx.drawImage(tile, x * this.tilesize, y * this.tilesize, this.tilesize, this.tilesize);
    }
    diffuse = new THREE.Texture(canvas);
    diffuse.needsUpdate = true;
    return diffuse;
  };

  TerrainLayerFlat.prototype.checkLevel = function(camera) {
    var distance, level, v1, v2;
    this.updateMatrixWorld();
    v1 = new THREE.Vector3;
    v2 = new THREE.Vector3;
    v1.setFromMatrixPosition(camera.matrixWorld);
    v2.setFromMatrixPosition(this.matrixWorld);
    distance = v1.distanceTo(v2);
    if (distance < this.data.distance[1]) {
      level = 0;
    } else if (distance < this.data.distance[2]) {
      level = 1;
    } else if (distance < this.data.distance[3]) {
      level = 2;
    } else if (distance < this.data.distance[4]) {
      level = 3;
    } else {
      level = 4;
    }
    this.level = level;
    if (this.initialized) {
      return this.update(camera);
    }
  };

  TerrainLayerFlat.prototype.checkGeometry = function(camera) {
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

  TerrainLayerFlat.prototype.createGeometry = function() {
    this.creating = new Task({
      id: 'TerrainLayer.createTerrainFlatGeometry' + this.i + '' + this.j,
      worker: 'worker',
      data: {
        task: 'TerrainLayer.createTerrainFlatGeometry',
        step: this.step[this.level],
        units: this.units,
        options: {
          flatsize: this.options.flatsize
        }
      },
      callback: (function(_this) {
        return function(e) {
          var geometry, material, mesh;
          geometry = setGeometryVFData(e.data.geometry);
          material = _this.material;
          mesh = new THREE.Mesh(geometry, material);
          mesh.rotation.x = -Math.PI / 2;
          mesh.receiveShadow = true;
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

  return TerrainLayerFlat;

})(THREE.LOD);

GrassLayer = (function(_super) {
  __extends(GrassLayer, _super);

  function GrassLayer(options) {
    var i, j, _i, _j, _ref, _ref1;
    this._ = options._;
    THREE.Object3D.call(this);
    this.name = 'grassLayer';
    this.options = {
      size: 1000,
      flatsize: 5,
      grassheight: 1
    };
    this.data = {};
    this.data.distance = [0, 5, 15, 25, 35, 45];
    this.data.material = {
      hight: [],
      low: []
    };
    this.data.material.low[0] = assets.graphic.material.grass0_low;
    this.data.material.low[1] = assets.graphic.material.grass1_low;
    this.data.material.low[2] = assets.graphic.material.grass2_low;
    this.data.material.low[3] = assets.graphic.material.grass3_low;
    this.data.material.low[4] = assets.graphic.material.grass4_low;
    this.data.material.hight[0] = assets.graphic.material.grass0_hight;
    this.data.material.hight[1] = assets.graphic.material.grass1_hight;
    this.data.material.hight[2] = assets.graphic.material.grass2_hight;
    this.data.material.hight[3] = assets.graphic.material.grass3_hight;
    this.data.material.hight[4] = assets.graphic.material.grass4_hight;
    this.count = 2;
    this.created = false;
    this.initializing = false;
    this.initialized = false;
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

  GrassLayer.prototype.createFlat = function(i, j) {
    var flat, grassmap_mid_value, grassmap_units, hasgrass, heightmap_mid_value, heightmap_units, imagedata, index, max_value, min_value, x, y, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
    imagedata = this._.grassmap.getImageData(i * this.options.flatsize, j * this.options.flatsize, this.options.flatsize, this.options.flatsize).data;
    grassmap_units = [];
    hasgrass = false;
    min_value = 1000;
    max_value = 0;
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
        grassmap_units[y][x] = imagedata[index];
      }
      if (grassmap_units[y][x] < min_value) {
        min_value = grassmap_units[y][x];
      }
      if (grassmap_units[y][x] > max_value) {
        max_value = grassmap_units[y][x];
      }
    }
    grassmap_mid_value = min_value + (max_value - min_value) / 2;
    if (hasgrass) {
      imagedata = this._.heightmap.getImageData(i * this.options.flatsize, j * this.options.flatsize, this.options.flatsize + 1, this.options.flatsize + 1).data;
      heightmap_units = [];
      min_value = 1000;
      max_value = 0;
      for (index = _j = 0, _ref1 = imagedata.length - 1; _j <= _ref1; index = _j += 4) {
        y = Math.floor(index / (4 * (this.options.flatsize + 1)));
        if (!heightmap_units[y]) {
          heightmap_units[y] = [];
        }
        x = index / 4 - (this.options.flatsize + 1) * y;
        heightmap_units[y][x] = imagedata[index];
        if (heightmap_units[y][x] < min_value) {
          min_value = heightmap_units[y][x];
        }
        if (heightmap_units[y][x] > max_value) {
          max_value = heightmap_units[y][x];
        }
      }
      heightmap_mid_value = min_value + (max_value - min_value) / 2;
      for (y = _k = 0, _ref2 = heightmap_units.length - 1; _k <= _ref2; y = _k += 1) {
        for (x = _l = 0, _ref3 = heightmap_units[y].length - 1; _l <= _ref3; x = _l += 1) {
          heightmap_units[y][x] -= heightmap_mid_value;
        }
      }
      flat = new GrassFlat({
        i: i,
        j: j,
        units: {
          heightmap: heightmap_units,
          grassmap: grassmap_units
        },
        mid_value: {
          grassmap: grassmap_mid_value,
          heightmap: heightmap_mid_value
        },
        options: this.options,
        data: this.data
      });
      return this.add(flat);
    }
  };

  GrassLayer.prototype.update = function(camera) {
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

  return GrassLayer;

})(THREE.Object3D);

GrassFlat = (function(_super) {
  __extends(GrassFlat, _super);

  function GrassFlat(options) {
    this.i = options.i, this.j = options.j, this.options = options.options, this.data = options.data, this.units = options.units, this.mid_value = options.mid_value;
    THREE.LOD.call(this);
    this.creating = false;
    this.initializing = false;
    this.initialized = false;
    this.level = false;
    this.hightgrassLayer = this.mid_value.grassmap < 128 ? false : true;
    this.position.x = (this.i + 0.5) * this.options.flatsize;
    this.position.y = this.mid_value.heightmap;
    this.position.z = (this.j + 0.5) * this.options.flatsize;
  }

  GrassFlat.prototype.checkLevel = function(camera) {
    var distance, level;
    distance = new THREE.Vector3(camera.position.x - this.position.x, camera.position.y - this.position.y, camera.position.z - this.position.z).length();
    if (distance < this.data.distance[1]) {
      level = 0;
    } else if (distance < this.data.distance[2]) {
      level = 1;
    } else if (distance < this.data.distance[3]) {
      level = 2;
    } else if (distance < this.data.distance[4]) {
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
      id: 'GrassLayer.createGrassFlatGeometry' + this.i + '' + this.j,
      worker: 'worker',
      data: {
        task: 'GrassLayer.createGrassFlatGeometry',
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
          var geometry, material, mesh;
          geometry = setGeometryVFData(e.data.geometry);
          if (_this.hightgrassLayer) {
            material = _this.data.material.hight[_this.level];
          } else {
            material = _this.data.material.low[_this.level];
          }
          mesh = new THREE.Mesh(geometry, material);
          mesh.receiveShadow = true;
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
      geometry: {},
      textures: {},
      images: {}
    };
    this.loadImage('terrainLayer_tile000');
    this.loadImage('terrainLayer_tile25500');
    this.loadImage('terrainLayer_tile02550');
    this.loadMaterial('atmosphere');
    this.loadMaterial('terrain');
    this.loadMaterial('water1');
    this.loadMaterial('water2');
    this.loadMaterial('grass0_low');
    this.loadMaterial('grass1_low');
    this.loadMaterial('grass2_low');
    this.loadMaterial('grass3_low');
    this.loadMaterial('grass4_low');
    this.loadMaterial('grass0_hight');
    this.loadMaterial('grass1_hight');
    this.loadMaterial('grass2_hight');
    this.loadMaterial('grass3_hight');
    this.loadMaterial('grass4_hight');
    this.loadMaterial('cloud1');
    this.loadModel('tree1');
    this.loadGeometry('tree1_bottom');
    this.loadMaterial('tree1_bottom');
    this.loadGeometry('tree1_up');
    this.loadMaterial('tree1_up');
    this.loadModel('tree2');
    this.loadGeometry('tree2_bottom');
    this.loadGeometry('tree2_up');
    this.loadModel('tree3');
    this.loadGeometry('tree3_bottom');
    this.loadMaterial('tree3_bottom');
    this.loadGeometry('tree3_up');
    this.loadMaterial('tree3_up');
    this.loadModel('stone1');
    this.loadGeometry('stone1');
    this.loadMaterial('stone1');
    this.loadModel('boush1');
    this.loadGeometry('boush1');
    this.loadMaterial('boush1');
    this.loadModel('boush2');
    this.loadGeometry('boush2');
    this.loadMaterial('boush2');
    this.loadModel('cannabis');
    this.loadGeometry('cannabis');
    this.loadMaterial('cannabis');
    this.loadModel('plant_palm');
    this.loadGeometry('plant_palm');
    this.loadMaterial('plant_palm');
    this.loadModel('plant_tropical');
    this.loadGeometry('plant_tropical');
    this.loadMaterial('plant_tropical');
    this.loadModel('plant_tropical2');
    this.loadGeometry('plant_tropical2');
    this.loadMaterial('plant_tropical2');
    this.loadModel('tree_palm');
    this.loadGeometry('tree_palm');
    this.loadMaterial('tree_palm');
    this.loadModel('weed1');
    this.loadGeometry('weed1');
    this.loadMaterial('weed1');
    this.loadModel('weed2');
    this.loadGeometry('weed2');
    this.loadMaterial('weed2');
    this.loadModel('weed3');
    this.loadGeometry('weed3');
    this.loadMaterial('weed3');
    this.loadModel('weed4');
    this.loadGeometry('weed4');
    this.loadMaterial('weed4');
    this.loadModel('weed5');
    this.loadGeometry('weed5');
    this.loadModel('weed6');
    this.loadGeometry('weed6');
    this.loadMaterial('weed6');
    this.loadModel('weed7');
    this.loadGeometry('weed7');
    this.loadModel('weed8');
    this.loadGeometry('weed8');
    this.loadMaterial('weed8');
  }

  AssetsManager.prototype.loadImage = function(url) {
    var img;
    img = document.createElement('img');
    img.src = 'assets/graphic/textures/' + url + '.png';
    return this.graphic.images[url] = img;
  };

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
    var loadfragmentshader, loadmaterialfile, loadvertexshader;
    $.get('assets/graphic/material/' + url + '/options.json', (function(_this) {
      return function(data) {
        var alpha, bump, diffuse, env, light, normal, options, specular, urls;
        options = JSON.parse(data);
        if (options.map.diffuse) {
          diffuse = THREE.ImageUtils.loadTexture('assets/graphic/material/' + url + '/diffuse.png');
        } else {
          diffuse = false;
        }
        if (options.map.specular) {
          specular = THREE.ImageUtils.loadTexture('assets/graphic/material/' + url + '/specular.png');
        } else {
          specular = false;
        }
        if (options.map.light) {
          light = THREE.ImageUtils.loadTexture('assets/graphic/material/' + url + '/light.png');
        } else {
          light = false;
        }
        if (options.map.alpha) {
          alpha = THREE.ImageUtils.loadTexture('assets/graphic/material/' + url + '/alpha.png');
        } else {
          alpha = false;
        }
        if (options.map.env) {
          urls = ['assets/graphic/material/' + url + '/env.png', 'assets/graphic/material/' + url + '/env.png', 'assets/graphic/material/' + url + '/env.png', 'assets/graphic/material/' + url + '/env.png', 'assets/graphic/material/' + url + '/env.png', 'assets/graphic/material/' + url + '/env.png'];
          env = THREE.ImageUtils.loadTextureCube(urls);
          env.format = THREE.RGBFormat;
        } else {
          env = false;
        }
        if (options.map.normal) {
          normal = THREE.ImageUtils.loadTexture('assets/graphic/material/' + url + '/normal.png');
        } else {
          normal = false;
        }
        if (options.map.bump) {
          bump = THREE.ImageUtils.loadTexture('assets/graphic/material/' + url + '/bump.png');
        } else {
          bump = false;
        }
        if (options.shader) {
          return loadvertexshader(url, function(vert) {
            return loadfragmentshader(url, function(frag) {
              return loadmaterialfile(url, diffuse, specular, light, alpha, env, normal, bump, vert, frag);
            });
          });
        } else {
          return loadmaterialfile(url, diffuse, specular, light, alpha, env, normal, bump);
        }
      };
    })(this));
    loadvertexshader = (function(_this) {
      return function(url, callback) {
        return $.get('assets/graphic/material/' + url + '/shader.vert', function(data) {
          return callback(data);
        });
      };
    })(this);
    loadfragmentshader = (function(_this) {
      return function(url, callback) {
        return $.get('assets/graphic/material/' + url + '/shader.frag', function(data) {
          return callback(data);
        });
      };
    })(this);
    return loadmaterialfile = (function(_this) {
      return function(url, diffuse, specular, light, alpha, env, normal, bump, vert, frag) {
        return $.get('assets/graphic/material/' + url + '/material.js', function(data) {
          eval(data);
          return _this.graphic.material[url] = material;
        });
      };
    })(this);
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

  AssetsManager.prototype.loadTexture = function(url) {
    return this.graphic.textures[url] = THREE.ImageUtils.loadTexture('assets/graphic/textures/' + url + '.png');
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

THREE.Object3D.prototype.define = function(name, object) {
  this[name] = object;
  return this.add(object);
};
