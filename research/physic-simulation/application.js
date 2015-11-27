var GraphicEngine;

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
    this.camera.position.set(15, 15, 15);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.fi = 90;
    this.camera.tetha = 60;
    this.camera.r = 25;
    settings.add(this.camera, 'r', 1, 100).name('camera.r');
    this.camera.set_x = function(v) {
      return this.fi = 90 + 1 * v;
    };
    this.camera.set_y = function(v) {
      return this.tetha = 60 + 1 * v;
    };
    this.camera.update = function(object) {
      var dx, dy, dz;
      dx = Math.sin(this.tetha * Math.PI / 180) * Math.cos(this.fi * Math.PI / 180);
      dz = Math.sin(this.tetha * Math.PI / 180) * Math.sin(this.fi * Math.PI / 180);
      dy = Math.cos(this.tetha * Math.PI / 180);
      if (character) {
        this.position.set(character.position.x + dx * this.r, character.position.y + dy * this.r, character.position.z + dz * this.r);
        return this.lookAt(new THREE.Vector3(character.position.x, character.position.y, character.position.z));
      } else {
        this.position.set(dx * this.r, dy * this.r, dz * this.r);
        return this.lookAt(new THREE.Vector3(0, 0, 0));
      }
    };
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
        _this.camera.set_x(0.5 * dx);
        return _this.camera.set_y(0.5 * dy);
      };
    })(this));
    this.resize();
    window.addEventListener('resize', (function(_this) {
      return function() {
        return _this.resize();
      };
    })(this));
    this.start();
  }

  GraphicEngine.prototype.resize = function() {
    this.camera.aspect = this.wrapper.width() / this.wrapper.height();
    this.camera.updateProjectionMatrix();
    return this.renderer.setSize(this.wrapper.width(), this.wrapper.height());
  };

  GraphicEngine.prototype.stop = function() {
    return cancelAnimationFrame(this.interval);
  };

  GraphicEngine.prototype.start = function(options) {
    var axisHelper, light;
    axisHelper = new THREE.AxisHelper(5);
    this.scene.add(axisHelper);
    this.scene.add(new THREE.GridHelper(100, 10));
    this.ambientlight = new THREE.AmbientLight(0x555555);
    this.scene.add(this.ambientlight);
    light = new THREE.DirectionalLight(0xaaaaaa);
    light.position.set(0, 50, 0);
    this.scene.add(light);
    return this.render();
  };

  GraphicEngine.prototype.render = function() {
    this.camera.update();
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
    return this.interval = requestAnimationFrame(this.render.bind(this));
  };

  return GraphicEngine;

})();

var PhysicEngine;

PhysicEngine = (function() {
  function PhysicEngine() {
    this.world = new OIMO.World;
    this.world.timeStep /= 10;
    setInterval((function(_this) {
      return function() {
        return _this.world.step();
      };
    })(this), 1000 / 60);
  }

  return PhysicEngine;

})();

var WorldSystem, lib,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

WorldSystem = (function() {
  function WorldSystem(gamedata) {
    var k, v, _ref, _ref1;
    this.objects = {};
    _ref = gamedata["static"];
    for (k in _ref) {
      v = _ref[k];
      this.add({
        classname: 'GameObject',
        k: k,
        v: v
      });
    }
    _ref1 = gamedata.dynamic;
    for (k in _ref1) {
      v = _ref1[k];
      this.add({
        classname: 'GameObject',
        k: k,
        v: v,
        dynamic: true
      });
    }
    this.add({
      classname: 'Character',
      k: 'character',
      v: gamedata.character,
      dynamic: true
    });
    this.dt = 1000 / 60;
    setInterval((function(_this) {
      return function() {
        return _this.tick(_this.dt);
      };
    })(this), this.dt);
  }

  WorldSystem.prototype.add = function(options) {
    return this.objects[options.k] = new lib[options.classname]({
      k: options.k,
      gamedata: options.v,
      dynamic: options.dynamic
    });
  };

  WorldSystem.prototype.tick = function(dt) {
    var k, v, _ref, _results;
    _ref = this.objects;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      _results.push(v.tick());
    }
    return _results;
  };

  return WorldSystem;

})();

lib = {};

lib.GameObject = (function() {
  function GameObject(options) {
    this.name = options.k;
    this.mesh = this.createMesh(options.gamedata);
    this.body = this.createBody(options.gamedata, options.dynamic);
  }

  GameObject.prototype.createMesh = function(gamedata) {
    var geometry, mesh;
    switch (gamedata.collider) {
      case 'box':
        geometry = new THREE.BoxGeometry(gamedata.scale.x, gamedata.scale.y, gamedata.scale.z);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry((gamedata.scale.x + gamedata.scale.y + gamedata.scale.z) / 3);
    }
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
      ambient: 0x0000ff
    }));
    mesh.position.set(gamedata.position.x, gamedata.position.y, gamedata.position.z);
    mesh.rotation.set(gamedata.rotation.x * Math.PI / 180, gamedata.rotation.y * Math.PI / 180, gamedata.rotation.z * Math.PI / 180);
    graphic.scene.add(mesh);
    return mesh;
  };

  GameObject.prototype.createBody = function(gamedata, dynamic) {
    var body, config;
    if (dynamic) {
      config = [1, 0.4, 0.2];
    } else {
      config = [1, 0.4, 0.2];
    }
    switch (gamedata.collider) {
      case 'box':
        body = new OIMO.Body({
          type: 'box',
          pos: [gamedata.position.x, gamedata.position.y, gamedata.position.z],
          size: [gamedata.scale.x, gamedata.scale.y, gamedata.scale.z],
          rot: [gamedata.rotation.x, gamedata.rotation.y, gamedata.rotation.z],
          world: physic.world,
          move: dynamic ? true : false,
          config: config
        });
        break;
      case 'sphere':
        body = new OIMO.Body({
          type: 'sphere',
          pos: [gamedata.position.x, gamedata.position.y, gamedata.position.z],
          size: [(gamedata.scale.x + gamedata.scale.y + gamedata.scale.z) / 3],
          rot: [gamedata.rotation.x, gamedata.rotation.y, gamedata.rotation.z],
          world: physic.world,
          move: dynamic ? true : false,
          config: config
        });
    }
    return body;
  };

  GameObject.prototype.tick = function(dt) {
    this.mesh.position.copy(this.body.getPosition());
    return this.mesh.quaternion.copy(this.body.getQuaternion());
  };

  GameObject.prototype.getHit = function(options) {
    var f, p;
    f = options.vDirection.normalize().multiplyScalar(options.f * this.body.body.mass);
    p = options.source.body.getPosition();
    f = new OIMO.Vec3(f.x, f.y, f.z);
    return this.body.body.applyImpulse(p, f);
  };

  return GameObject;

})();

lib.Character = (function(_super) {
  __extends(Character, _super);

  function Character(options) {
    var character, keyHandler;
    lib.GameObject.call(this, options);
    this.vY = 0;
    this.movespeed = 0;
    this.rotationLeft = false;
    this.rotationRight = false;
    keyHandler = (function(_this) {
      return function(e) {
        switch (e.keyCode) {
          case 49:
            if (e.type === 'keydown') {
              return _this.setHit(49);
            }
            break;
          case 50:
            if (e.type === 'keydown') {
              return _this.setHit(50);
            }
            break;
          case 87:
            if (e.type === 'keydown') {
              return _this.movespeed = 1;
            } else if (e.type === 'keyup') {
              return _this.movespeed = 0;
            }
            break;
          case 83:
            if (e.type === 'keydown') {
              return _this.movespeed = -1;
            } else if (e.type === 'keyup') {
              return _this.movespeed = 0;
            }
            break;
          case 65:
            if (e.type === 'keydown') {
              return _this.rotationLeft = true;
            } else if (e.type === 'keyup') {
              return _this.rotationLeft = false;
            }
            break;
          case 68:
            if (e.type === 'keydown') {
              return _this.rotationRight = true;
            } else if (e.type === 'keyup') {
              return _this.rotationRight = false;
            }
        }
      };
    })(this);
    $(window).bind('keydown', (function(_this) {
      return function(e) {
        return keyHandler(e);
      };
    })(this));
    $(window).bind('keyup', (function(_this) {
      return function(e) {
        return keyHandler(e);
      };
    })(this));
    character = this;
  }

  Character.prototype.tick = function() {
    var x, y;
    lib.GameObject.prototype.tick.call(this);
    if (this.rotationLeft) {
      this.vY -= 2;
    }
    if (this.rotationRight) {
      this.vY += 2;
    }
    x = Math.cos(this.vY * Math.PI / 180) * this.movespeed * 0.25;
    y = Math.sin(this.vY * Math.PI / 180) * this.movespeed * 0.25;
    this.body.body.linearVelocity.set(x, 0, y);
    this.mesh.quaternion.set(0, 0, 0, 1);
    return this.mesh.rotation.set(0, -this.vY * Math.PI / 180, 0);
  };

  Character.prototype.setHit = function(c) {
    var a, d, k, p0, p1, v, _ref, _results;
    p0 = this.body.getPosition();
    _ref = world.objects;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      if (v.name !== this.name) {
        switch (c) {
          case 49:
            p1 = v.body.getPosition();
            d = new THREE.Vector3(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
            if (d.length() < 10) {
              _results.push(v.getHit({
                f: 2,
                vDirection: d,
                source: this
              }));
            } else {
              _results.push(void 0);
            }
            break;
          case 50:
            p1 = v.body.getPosition();
            a = new THREE.Vector3(p0.x, p0.y, p0.z).angleTo(new THREE.Vector3(p1.x, p1.y, p1.z)) * 180 / Math.PI;
            d = new THREE.Vector3(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
            if (a > 85) {
              _results.push(v.getHit({
                f: 1,
                vDirection: d,
                source: this
              }));
            } else {
              _results.push(void 0);
            }
            break;
          default:
            _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Character;

})(lib.GameObject);

var character, gamedata, graphic, physic, settings, world;

gamedata = {
  "static": {
    terrain: {
      position: {
        x: 0,
        y: -5,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 100,
        y: 10,
        z: 100
      },
      collider: 'box'
    },
    s_a: {
      position: {
        x: -10,
        y: 1,
        z: 10
      },
      rotation: {
        x: 0,
        y: 45,
        z: 0
      },
      scale: {
        x: 2,
        y: 2,
        z: 2
      },
      collider: 'box'
    },
    s_b: {
      position: {
        x: -10,
        y: 1.5,
        z: -10
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 2,
        y: 3,
        z: 2
      },
      collider: 'box'
    },
    s_c: {
      position: {
        x: 10,
        y: 2,
        z: 10
      },
      rotation: {
        x: 0,
        y: -45,
        z: 0
      },
      scale: {
        x: 2,
        y: 4,
        z: 2
      },
      collider: 'box'
    },
    s_d: {
      position: {
        x: 10,
        y: 2.5,
        z: -10
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 2,
        y: 5,
        z: 2
      },
      collider: 'box'
    },
    s_a1: {
      position: {
        x: 0,
        y: 1,
        z: 15
      },
      rotation: {
        x: 0,
        y: 45,
        z: 0
      },
      scale: {
        x: 2,
        y: 2,
        z: 2
      },
      collider: 'box'
    },
    s_b1: {
      position: {
        x: 0,
        y: 1.5,
        z: -15
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 2,
        y: 3,
        z: 2
      },
      collider: 'box'
    },
    s_c1: {
      position: {
        x: -15,
        y: 2,
        z: 0
      },
      rotation: {
        x: 0,
        y: -45,
        z: 0
      },
      scale: {
        x: 2,
        y: 4,
        z: 2
      },
      collider: 'box'
    },
    s_d1: {
      position: {
        x: 15,
        y: 2.5,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 2,
        y: 5,
        z: 2
      },
      collider: 'box'
    }
  },
  dynamic: {
    d_a: {
      position: {
        x: -5,
        y: 5,
        z: -5
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_b: {
      position: {
        x: -5,
        y: 5,
        z: 5
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_c: {
      position: {
        x: 5,
        y: 5,
        z: -5
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_d: {
      position: {
        x: 5,
        y: 5,
        z: 5
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_a1: {
      position: {
        x: 0,
        y: 5,
        z: -5
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_b1: {
      position: {
        x: 0,
        y: 5,
        z: 5
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_c1: {
      position: {
        x: 5,
        y: 5,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_d1: {
      position: {
        x: -5,
        y: 5,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_a2: {
      position: {
        x: 1,
        y: 4,
        z: 4
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_b2: {
      position: {
        x: 2,
        y: 3,
        z: 3
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_c2: {
      position: {
        x: 3,
        y: 2,
        z: 2
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_d2: {
      position: {
        x: 4,
        y: 1,
        z: 1
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_a3: {
      position: {
        x: -1,
        y: 4,
        z: 4
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_b3: {
      position: {
        x: -2,
        y: 3,
        z: 3
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_c3: {
      position: {
        x: -3,
        y: 2,
        z: 2
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    },
    d_d3: {
      position: {
        x: -4,
        y: 1,
        z: 1
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1,
        z: 1
      },
      collider: 'box'
    }
  },
  character: {
    position: {
      x: 0,
      y: 2.5,
      z: 0
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 1,
      y: 2,
      z: 1
    },
    collider: 'sphere'
  }
};

character = false;

physic = {};

graphic = {};

world = {};

settings = {};

$(document).ready(function() {
  settings = new dat.GUI;
  physic = new PhysicEngine;
  graphic = new GraphicEngine;
  return world = new WorldSystem(gamedata);
});
