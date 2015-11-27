var GraphicEngine, settings;

settings = {};

$(document).ready(function() {
  settings = new dat.GUI;
  return setTimeout((function(_this) {
    return function() {
      var graphic;
      return graphic = new GraphicEngine;
    };
  })(this), 2000);
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
    this.camera.position.set(15, 15, 15);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.fi = 90;
    this.camera.tetha = 60;
    this.camera.r = 50;
    settings.add(this.camera, 'r', 1, 100).name('camera.distance');
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
      this.position.set(dx * this.r, dy * this.r, dz * this.r);
      return this.lookAt(new THREE.Vector3(0, 0, 0));
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
    var axisHelper, c, d, geometry, helper, i, light, mesh, s, _i;
    axisHelper = new THREE.AxisHelper(5);
    this.scene.add(axisHelper);
    this.ambientlight = new THREE.AmbientLight(0xa0a0a0);
    this.scene.add(this.ambientlight);
    light = new THREE.DirectionalLight(0xffaa44);
    helper = new THREE.DirectionalLightHelper(light);
    this.scene.add(helper);
    this.scene.add(light);
    this.lod = new THREE.LOD;
    this.lod.rotation.x = -Math.PI / 2;
    this.scene.add(this.lod);
    this.material = MeshWaterMaterial;
    settings.add(this.material.uniforms.waveHeight, 'value', 1, 50).name('wave.h');
    s = 100;
    d = [10, 20, 30, 40, 50, 60];
    c = [100, 75, 50, 25, 15, 10];
    for (i = _i = 0; _i <= 5; i = _i += 1) {
      geometry = new THREE.PlaneGeometry(s, s, c[i], c[i]);
      mesh = new THREE.Mesh(geometry, this.material);
      this.lod.addLevel(mesh, d[i]);
    }
    return this.render();
  };

  GraphicEngine.prototype.render = function() {
    var dt;
    dt = this.clock.getDelta();
    this.camera.update();
    this.lod.update(this.camera);
    if (this.material.uniforms.time.value >= 1) {
      this.material.uniforms.time.value = 0;
    } else {
      this.material.uniforms.time.value += dt / 5;
    }
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
    return this.interval = requestAnimationFrame(this.render.bind(this));
  };

  return GraphicEngine;

})();
