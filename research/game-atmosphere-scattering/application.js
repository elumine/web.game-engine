var GraphicEngine, graphic;

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
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(75, this.wrapper.width() / this.wrapper.height(), 0.1, 10000000);
    this.camera.position.set(0, 0, 0);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(new THREE.Vector3(5, 0, 5));
    this.camera.mode = 'float';
    this.camera.float = {
      fi: 90,
      tetha: 60,
      speed: 5,
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
    /*
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
    */
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
	    this.atmosphere = {
      v3LightPos: new THREE.Vector3(0, 0, 1),
      Kr: 0.0025,
      Km: 0.0015,
      ESun: 20.0,
      g: -0.95,
      innerRadius: 1000,
      outerRadius: 1010,
      wavelength: [0.650, 0.570, 0.475],
      scaleDepth: 0.25,
      fExposure: 1,
      uniforms: {
        atmosphere: 0,
        space: 0
      },
      ground: {
        mesh: 0,
        geometry: 0,
        material: {
          atmosphere: 0,
          space: 0
        }
      },
      sky: {
        mesh: 0,
        geometry: 0,
        material: {
          atmosphere: 0,
          space: 0
        }
      }
    };
    this.camera_atmosphere = new THREE.Object3D;
    this.camera_atmosphere.position.set(0, this.atmosphere.innerRadius + (this.atmosphere.outerRadius - this.atmosphere.innerRadius) / 2, 0);
    this.camera_atmosphere.height = this.camera_atmosphere.position.length();
    this.shader = {
      GroundFromAtmosphereVert: 0,
      GroundFromAtmosphereFrag: 0,
      SkyFromAtmosphereVert: 0,
      SkyFromAtmosphereFrag: 0,
      GroundFromSpaceVert: 0,
      GroundFromSpaceFrag: 0,
      SkyFromSpaceVert: 0,
      SkyFromSpaceFrag: 0
    };
    $.get('GroundFromAtmosphere.vert', (function(_this) {
      return function(data) {
        return _this.shader.GroundFromAtmosphereVert = data;
      };
    })(this));
    $.get('GroundFromAtmosphere.frag', (function(_this) {
      return function(data) {
        return _this.shader.GroundFromAtmosphereFrag = data;
      };
    })(this));
    $.get('SkyFromAtmosphere.vert', (function(_this) {
      return function(data) {
        return _this.shader.SkyFromAtmosphereVert = data;
      };
    })(this));
    $.get('SkyFromAtmosphere.frag', (function(_this) {
      return function(data) {
        return _this.shader.SkyFromAtmosphereFrag = data;
      };
    })(this));
    $.get('GroundFromSpace.vert', (function(_this) {
      return function(data) {
        return _this.shader.GroundFromSpaceVert = data;
      };
    })(this));
    $.get('GroundFromSpace.frag', (function(_this) {
      return function(data) {
        return _this.shader.GroundFromSpaceFrag = data;
      };
    })(this));
    $.get('SkyFromSpace.vert', (function(_this) {
      return function(data) {
        return _this.shader.SkyFromSpaceVert = data;
      };
    })(this));
    $.get('SkyFromSpace.frag', (function(_this) {
      return function(data) {
        return _this.shader.SkyFromSpaceFrag = data;
      };
    })(this));
    this.gui = new dat.GUI;
    this.gui.atmosphere = this.gui.addFolder('atmosphere');
    this.gui.atmosphere.add(this.camera_atmosphere.position, 'x', -this.atmosphere.innerRadius, this.atmosphere.innerRadius);
    this.gui.atmosphere.add(this.camera_atmosphere.position, 'y', this.atmosphere.innerRadius, this.atmosphere.outerRadius);
    this.gui.atmosphere.add(this.camera_atmosphere.position, 'z', -this.atmosphere.innerRadius, this.atmosphere.innerRadius);
    this.gui.atmosphere.add(this.camera_atmosphere, 'height', 0, this.atmosphere.outerRadius);
    this.gui.v3LightPos = this.gui.atmosphere.addFolder('v3LightPos');
    this.gui.v3LightPos.add(this.atmosphere.v3LightPos, 'x', -1, 1);
    this.gui.v3LightPos.add(this.atmosphere.v3LightPos, 'y', -1, 1);
    this.gui.v3LightPos.add(this.atmosphere.v3LightPos, 'z', -1, 1);
    this.gui.atmosphere.add(this.atmosphere, 'Kr', 0, 0.2);
    this.gui.atmosphere.add(this.atmosphere, 'Km', 0, 0.5);
    this.gui.atmosphere.add(this.atmosphere, 'ESun', 0, 500);
    this.gui.atmosphere.add(this.atmosphere, 'g', -0.99, 0);
    this.gui.atmosphere.add(this.atmosphere, 'innerRadius');
    this.gui.atmosphere.add(this.atmosphere, 'outerRadius');
    this.gui.atmosphere.add(this.atmosphere, 'scaleDepth', 0, 0.5);
    this.gui.atmosphere.add(this.atmosphere, 'fExposure', 0, 3);
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
    var axisHelper, diffuse, diffuseNight, geometry, material, maxAnisotropy, mesh;
    diffuse = THREE.ImageUtils.loadTexture('texture.jpg');
    diffuseNight = THREE.ImageUtils.loadTexture('grayscale.jpg');
    this.renderer.setClearColor(0x000000);
    axisHelper = new THREE.AxisHelper(5);
    this.scene.add(axisHelper);
    this.sun = new THREE.Mesh(new THREE.Geometry, new THREE.MeshBasicMaterial);
    this.sun.position.set(10, 10, 10);
    this.sun.update = function(time) {};
    this.scene.add(this.sun);
    geometry = new THREE.SphereGeometry(10, 32, 32);
    material = new THREE.MeshBasicMaterial({
      color: 0xffff00
    });
    mesh = new THREE.Mesh(geometry, material);
    this.sun.add(mesh);
    maxAnisotropy = this.renderer.getMaxAnisotropy();
    diffuse.anisotropy = maxAnisotropy;
    diffuseNight.anisotropy = maxAnisotropy;
    this.atmosphere.uniforms.atmosphere = {
      v3CameraPos: {
        type: 'v3',
        value: this.camera_atmosphere.position
      },
      v3LightPos: {
        type: "v3",
        value: this.atmosphere.v3LightPos
      },
      v3InvWavelength: {
        type: "v3",
        value: new THREE.Vector3(1 / Math.pow(this.atmosphere.wavelength[0], 4), 1 / Math.pow(this.atmosphere.wavelength[1], 4), 1 / Math.pow(this.atmosphere.wavelength[2], 4))
      },
      fCameraHeight: {
        type: "f",
        value: this.camera_atmosphere.height
      },
      fCameraHeight2: {
        type: "f",
        value: this.camera_atmosphere.height * this.camera_atmosphere.height
      },
      fInnerRadius: {
        type: "f",
        value: this.atmosphere.innerRadius
      },
      fInnerRadius2: {
        type: "f",
        value: this.atmosphere.innerRadius * this.atmosphere.innerRadius
      },
      fOuterRadius: {
        type: "f",
        value: this.atmosphere.outerRadius
      },
      fOuterRadius2: {
        type: "f",
        value: this.atmosphere.outerRadius * this.atmosphere.outerRadius
      },
      fKrESun: {
        type: "f",
        value: this.atmosphere.Kr * this.atmosphere.ESun
      },
      fKmESun: {
        type: "f",
        value: this.atmosphere.Km * this.atmosphere.ESun
      },
      fKr4PI: {
        type: "f",
        value: this.atmosphere.Kr * 4.0 * Math.PI
      },
      fKm4PI: {
        type: "f",
        value: this.atmosphere.Km * 4.0 * Math.PI
      },
      fScale: {
        type: "f",
        value: 1 / (this.atmosphere.outerRadius - this.atmosphere.innerRadius)
      },
      fScaleDepth: {
        type: "f",
        value: this.atmosphere.scaleDepth
      },
      fScaleOverScaleDepth: {
        type: "f",
        value: 1 / (this.atmosphere.outerRadius - this.atmosphere.innerRadius) / this.atmosphere.scaleDepth
      },
      fg: {
        type: "f",
        value: this.atmosphere.g
      },
      fg2: {
        type: "f",
        value: this.atmosphere.g * this.atmosphere.g
      },
      fExposure: {
        type: 'f',
        value: this.atmosphere.fExposure
      },
      nSamples: {
        type: "i",
        value: 3
      },
      fSamples: {
        type: "f",
        value: 3.0
      },
      tGround: {
        type: "t",
        value: diffuse
      },
      tNight: {
        type: "t",
        value: diffuseNight
      },
      tBump: {
        type: "t",
        value: 0
      },
      tSkyboxDiffuse: {
        type: "t",
        value: 0
      },
      fNightScale: {
        type: "f",
        value: 1
      }
    };
    this.atmosphere.uniforms.space = {
      v3CameraPos: {
        type: 'v3',
        value: this.camera.position
      },
      v3LightPos: {
        type: "v3",
        value: this.atmosphere.v3LightPos
      },
      v3InvWavelength: {
        type: "v3",
        value: new THREE.Vector3(1 / Math.pow(this.atmosphere.wavelength[0], 4), 1 / Math.pow(this.atmosphere.wavelength[1], 4), 1 / Math.pow(this.atmosphere.wavelength[2], 4))
      },
      fCameraHeight: {
        type: "f",
        value: this.camera.position.length()
      },
      fCameraHeight2: {
        type: "f",
        value: this.camera.position.length() * this.camera.position.length()
      },
      fInnerRadius: {
        type: "f",
        value: this.atmosphere.innerRadius
      },
      fInnerRadius2: {
        type: "f",
        value: this.atmosphere.innerRadius * this.atmosphere.innerRadius
      },
      fOuterRadius: {
        type: "f",
        value: this.atmosphere.outerRadius
      },
      fOuterRadius2: {
        type: "f",
        value: this.atmosphere.outerRadius * this.atmosphere.outerRadius
      },
      fKrESun: {
        type: "f",
        value: this.atmosphere.Kr * this.atmosphere.ESun
      },
      fKmESun: {
        type: "f",
        value: this.atmosphere.Km * this.atmosphere.ESun
      },
      fKr4PI: {
        type: "f",
        value: this.atmosphere.Kr * 4.0 * Math.PI
      },
      fKm4PI: {
        type: "f",
        value: this.atmosphere.Km * 4.0 * Math.PI
      },
      fScale: {
        type: "f",
        value: 1 / (this.atmosphere.outerRadius - this.atmosphere.innerRadius)
      },
      fScaleDepth: {
        type: "f",
        value: this.atmosphere.scaleDepth
      },
      fScaleOverScaleDepth: {
        type: "f",
        value: 1 / (this.atmosphere.outerRadius - this.atmosphere.innerRadius) / this.atmosphere.scaleDepth
      },
      fg: {
        type: "f",
        value: this.atmosphere.g
      },
      fg2: {
        type: "f",
        value: this.atmosphere.g * this.atmosphere.g
      },
      fExposure: {
        type: 'f',
        value: this.atmosphere.fExposure
      },
      nSamples: {
        type: "i",
        value: 3
      },
      fSamples: {
        type: "f",
        value: 3.0
      },
      tGround: {
        type: "t",
        value: diffuse
      },
      tNight: {
        type: "t",
        value: diffuseNight
      },
      tBump: {
        type: "t",
        value: 0
      },
      tSkyboxDiffuse: {
        type: "t",
        value: 0
      },
      fNightScale: {
        type: "f",
        value: 1
      }
    };
    this.atmosphere.ground.material.space = new THREE.ShaderMaterial({
      uniforms: this.atmosphere.uniforms.space,
      vertexShader: this.shader.GroundFromSpaceVert,
      fragmentShader: this.shader.GroundFromSpaceFrag
    });
    this.atmosphere.ground.material.atmosphere = new THREE.ShaderMaterial({
      uniforms: this.atmosphere.uniforms.atmosphere,
      vertexShader: this.shader.GroundFromAtmosphereVert,
      fragmentShader: this.shader.GroundFromAtmosphereFrag
    });
    this.atmosphere.ground.geometry = new THREE.SphereGeometry(this.atmosphere.innerRadius, 100, 100);
    this.atmosphere.ground.mesh = new THREE.Mesh(this.atmosphere.ground.geometry, this.atmosphere.ground.material.atmosphere);
    this.atmosphere.ground.mesh.state = 'atmosphere';
    this.atmosphere.sky.material.space = new THREE.ShaderMaterial({
      uniforms: this.atmosphere.uniforms.space,
      vertexShader: this.shader.SkyFromSpaceVert,
      fragmentShader: this.shader.SkyFromSpaceFrag,
      side: THREE.BackSide,
      transparent: true
    });
    this.atmosphere.sky.material.atmosphere = new THREE.ShaderMaterial({
      uniforms: this.atmosphere.uniforms.atmosphere,
      vertexShader: this.shader.SkyFromAtmosphereVert,
      fragmentShader: this.shader.SkyFromAtmosphereFrag,
      side: THREE.BackSide,
      transparent: true
    });
    this.atmosphere.sky.geometry = new THREE.SphereGeometry(this.atmosphere.outerRadius, 100, 100);
    this.atmosphere.sky.mesh = new THREE.Mesh(this.atmosphere.sky.geometry, this.atmosphere.sky.material.atmosphere);
    this.atmosphere.sky.mesh.state = 'atmosphere';
    this.atmosphere.setMaterial = function(camera, atmosphere) {
      if (camera.position.length() < atmosphere.outerRadius) {
        this.ground.mesh.state = 'atmosphere';
        this.ground.mesh.material = this.ground.material.atmosphere;
        this.sky.mesh.state = 'atmosphere';
        return this.sky.mesh.material = this.sky.material.atmosphere;
      } else {
        this.ground.mesh.state = 'space';
        this.ground.mesh.material = this.ground.material.space;
        this.sky.mesh.state = 'space';
        return this.sky.mesh.material = this.sky.material.space;
      }
    };
    this.scene.add(this.atmosphere.sky.mesh);
    geometry = new THREE.PlaneGeometry(this.atmosphere.outerRadius * 2, this.atmosphere.outerRadius * 2, 1, 1);
    material = new THREE.MeshBasicMaterial({
      map: diffuse
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = this.atmosphere.innerRadius;
    this.scene.add(mesh);
    return this.camera.position.y = mesh.position.y + 1;
  };

  GraphicEngine.prototype.render = function() {
    var dt, fCameraHeight;
    dt = this.clock.getDelta();
    if (this.sun) {
      this.sun.update(dt);
    }
    this.camera.update();
    this.atmosphere.setMaterial(this.camera, this.atmosphere);
    this.atmosphere.uniforms.atmosphere.fCameraHeight.value = this.camera_atmosphere.height;
    this.atmosphere.uniforms.atmosphere.fCameraHeight2.value = this.camera_atmosphere.height * this.camera_atmosphere.height;
    this.atmosphere.uniforms.atmosphere.v3LightPos.value = this.atmosphere.v3LightPos.normalize();
    this.atmosphere.uniforms.atmosphere.fInnerRadius.value = this.atmosphere.innerRadius;
    this.atmosphere.uniforms.atmosphere.fInnerRadius2.value = this.atmosphere.innerRadius * this.atmosphere.innerRadius;
    this.atmosphere.uniforms.atmosphere.fOuterRadius.value = this.atmosphere.outerRadius;
    this.atmosphere.uniforms.atmosphere.fOuterRadius2.value = this.atmosphere.outerRadius * this.atmosphere.outerRadius;
    this.atmosphere.uniforms.atmosphere.fKrESun.value = this.atmosphere.Kr * this.atmosphere.ESun;
    this.atmosphere.uniforms.atmosphere.fKmESun.value = this.atmosphere.Km * this.atmosphere.ESun;
    this.atmosphere.uniforms.atmosphere.fKr4PI.value = this.atmosphere.Kr * 4.0 * Math.PI;
    this.atmosphere.uniforms.atmosphere.fKm4PI.value = this.atmosphere.Km * 4.0 * Math.PI;
    this.atmosphere.uniforms.atmosphere.fScale.value = 1 / (this.atmosphere.outerRadius - this.atmosphere.innerRadius);
    this.atmosphere.uniforms.atmosphere.fScaleDepth.value = this.atmosphere.scaleDepth;
    this.atmosphere.uniforms.atmosphere.fScaleOverScaleDepth.value = 1 / (this.atmosphere.outerRadius - this.atmosphere.innerRadius) / this.atmosphere.scaleDepth;
    this.atmosphere.uniforms.atmosphere.fg.value = this.atmosphere.g;
    this.atmosphere.uniforms.atmosphere.fg2.value = this.atmosphere.g * this.atmosphere.g;
    this.atmosphere.uniforms.atmosphere.fExposure.value = this.atmosphere.fExposure;
    fCameraHeight = this.camera.position.length();
    this.atmosphere.uniforms.space.fCameraHeight.value = fCameraHeight;
    this.atmosphere.uniforms.space.fCameraHeight2.value = fCameraHeight * fCameraHeight;
    this.atmosphere.uniforms.space.v3LightPos.value = this.atmosphere.v3LightPos.normalize();
    this.atmosphere.uniforms.space.fInnerRadius.value = this.atmosphere.innerRadius;
    this.atmosphere.uniforms.space.fInnerRadius2.value = this.atmosphere.innerRadius * this.atmosphere.innerRadius;
    this.atmosphere.uniforms.space.fOuterRadius.value = this.atmosphere.outerRadius;
    this.atmosphere.uniforms.space.fOuterRadius2.value = this.atmosphere.outerRadius * this.atmosphere.outerRadius;
    this.atmosphere.uniforms.space.fKrESun.value = this.atmosphere.Kr * this.atmosphere.ESun;
    this.atmosphere.uniforms.space.fKmESun.value = this.atmosphere.Km * this.atmosphere.ESun;
    this.atmosphere.uniforms.space.fKr4PI.value = this.atmosphere.Kr * 4.0 * Math.PI;
    this.atmosphere.uniforms.space.fKm4PI.value = this.atmosphere.Km * 4.0 * Math.PI;
    this.atmosphere.uniforms.space.fScale.value = 1 / (this.atmosphere.outerRadius - this.atmosphere.innerRadius);
    this.atmosphere.uniforms.space.fScaleDepth.value = this.atmosphere.scaleDepth;
    this.atmosphere.uniforms.space.fScaleOverScaleDepth.value = 1 / (this.atmosphere.outerRadius - this.atmosphere.innerRadius) / this.atmosphere.scaleDepth;
    this.atmosphere.uniforms.space.fg.value = this.atmosphere.g;
    this.atmosphere.uniforms.space.fg2.value = this.atmosphere.g * this.atmosphere.g;
    this.atmosphere.uniforms.space.fExposure.value = this.atmosphere.fExposure;
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
    return this.interval = requestAnimationFrame(this.render.bind(this));
  };

  return GraphicEngine;

})();

graphic = 0;

$(document).ready(function() {
  graphic = new GraphicEngine;
  return setTimeout(function() {
    graphic.initialize();
    return graphic.render();
  }, 1000);
});
