var AssetsManager, Gfx, GfxAddBloom, GfxAddGodrays, GfxAddHDR, GfxBleach, GfxBloomRT, GfxBrightnessContrast, GfxColorCorrection, GfxColorify, GfxDOF, GfxDepthRT, GfxGammaCorrection, GfxGodraysRT, GfxHDRRT, GfxHueSaturation, GfxInput, GfxMotionBlur, GfxOutput, GfxRenderRT, GfxSSAO, GfxVignette, GraphicEngine, assets, graphic;

graphic = {};

assets = {};

$(document).ready(function() {
  assets = new AssetsManager;
  return setTimeout((function(_this) {
    return function() {
      return graphic = new GraphicEngine;
    };
  })(this), 500);
});

GraphicEngine = (function() {
  function GraphicEngine(_) {
    this._ = _;
    this.gui = new dat.GUI;
    this.renderer = new THREE.WebGLRenderer;
    this.rendererStats = new THREEx.RendererStats;
    this.rendererStats.domElement.style.position = 'absolute';
    this.rendererStats.domElement.style.bottom = '0px';
    this.rendererStats.domElement.style.left = '0px';
    this.stats = new Stats;
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.left = '0px';
    this.viewport = $('#viewport');
    this.viewport.append(this.renderer.domElement);
    this.viewport.append(this.stats.domElement);
    this.viewport.append(this.rendererStats.domElement);
    this.clock = new THREE.Clock;
    this.scene = new THREE.Scene;
    this.sunScene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(75, this.viewport.width() / this.viewport.height(), 1, 1000);
    this.camera.position.set(25, 25, 25);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(new THREE.Vector3(0, 25, 0));
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
    this.viewport.bind('mousedown', (function(_this) {
      return function(e) {
        return _this.camera.float.moving = true;
      };
    })(this));
    this.viewport.bind('mouseup', (function(_this) {
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
    this.viewport.bind('mousemove', (function(_this) {
      return function(e) {
        var dx, dy;
        _this.mouse.previous.x = _this.mouse.current.x;
        _this.mouse.previous.y = _this.mouse.current.y;
        _this.mouse.current.x = e.offsetX;
        _this.mouse.current.y = e.offsetY;
        dx = _this.mouse.current.x - _this.viewport.width() / 2;
        dy = _this.mouse.current.y - _this.viewport.height() / 2;
        _this.camera[_this.camera.mode].set_x(0.5 * dx);
        return _this.camera[_this.camera.mode].set_y(0.5 * dy);
      };
    })(this));
    this.gfx = new Gfx(this);
    this.resize();
    window.addEventListener('resize', (function(_this) {
      return function() {
        return _this.resize();
      };
    })(this));
    this.initialize();
  }

  GraphicEngine.prototype.resize = function() {
    this.camera.aspect = this.viewport.width() / this.viewport.height();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewport.width(), this.viewport.height());
    return this.gfx.onResize();
  };

  GraphicEngine.prototype.stop = function() {
    return cancelAnimationFrame(this.interval);
  };

  GraphicEngine.prototype.initialize = function(options) {
    var atmosphere, axisHelper, g1, geometry, gridHelper, i, j, material, mesh, monument, plane, water, _i, _j, _k, _ref;
    this.scene.fog = new THREE.FogExp2(0xd9b45c, 0.005);
    this.renderer.setClearColor(0x000000);
    axisHelper = new THREE.AxisHelper(5);
    this.scene.add(axisHelper);
    gridHelper = new THREE.GridHelper(20, 1);
    this.ambientlight = new THREE.AmbientLight(0x505050);
    this.scene.add(this.ambientlight);
    this.sun = {
      light: new THREE.DirectionalLight(0xffffff, 1),
      occlusion: new THREE.Mesh(new THREE.SphereGeometry(35, 32, 32), new THREE.MeshBasicMaterial({
        color: 0xFFCC33
      }))
    };
    this.sun.light.position.x = this.sun.occlusion.position.x = -100;
    this.sun.light.position.y = this.sun.occlusion.position.y = 30;
    this.sun.light.position.z = this.sun.occlusion.position.z = -100;
    this.sun.light.intensity = 0.5;
    this.sun.light.castShadow = true;
    this.sun.light.shadowMapWidth = 1024;
    this.sun.light.shadowMapHeight = 1024;
    this.sun.light.shadowDarkness = 0.75;
    this.sun.light.shadowCameraNear = 1;
    this.sun.light.shadowCameraFar = 1000;
    this.sun.light.shadowCameraLeft = -50;
    this.sun.light.shadowCameraRight = 50;
    this.sun.light.shadowCameraTop = 50;
    this.sun.light.shadowCameraBottom = -50;
    this.scene.add(this.sun.light);
    this.sunScene.add(this.sun.occlusion);
    atmosphere = {
      graphic: new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), new THREE.MeshBasicMaterial({
        color: 0x663300,
        side: THREE.BackSide
      }))
    };
    this.scene.add(atmosphere.graphic);
    geometry = new THREE.PlaneGeometry(500, 500, 99, 99);
    plane = {
      graphic: new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: 0x500050,
        fog: false
      }))
    };
    plane.graphic.rotation.x = -Math.PI / 2;
    plane.graphic.receiveShadow = true;
    this.scene.add(plane.graphic);
    monument = {
      graphic: new THREE.Mesh(assets.graphic.geometry.monument, assets.graphic.material.monument)
    };
    monument.graphic.rotation.x = -Math.PI / 2;
    monument.graphic.scale.x = 0.1;
    monument.graphic.scale.y = 0.1;
    monument.graphic.scale.z = 0.1;
    monument.graphic.castShadow = true;
    this.scene.add(monument.graphic);
    material = MeshGrassMaterial;
    this.grassMaterial = material;
    geometry = new THREE.Geometry;
    g1 = new THREE.PlaneGeometry(2, 6, 1, 1);
    for (i = _i = 0; _i <= 10; i = _i += 1) {
      for (j = _j = 0; _j <= 10; j = _j += 1) {
        mesh = new THREE.Mesh(g1);
        mesh.position.set(i * 2.5 - 50, 3, j * 2.5);
        mesh.rotation.y = Math.PI * Math.random();
        mesh.updateMatrix();
        geometry.merge(mesh.geometry, mesh.matrix);
      }
    }
    mesh = new THREE.Mesh(geometry, material);
    for (i = _k = 0, _ref = mesh.geometry.vertices.length - 1; _k <= _ref; i = _k += 2) {
      material.attributes.displacement.value[i] = material.attributes.displacement.value[i + 1] = Math.random();
    }
    this.scene.add(mesh);
    material = MeshWaterMaterial;
    material.uniforms.waveMap.value = THREE.ImageUtils.loadTexture('waveMap.png');
    this.waterMaterial = material;
    water = new THREE.Mesh(new THREE.PlaneGeometry(512, 512, 512, 512), material);
    water.position.set(-256, 0, -256);
    water.rotation.set(-Math.PI / 2, 0, 0);
    this.scene.add(water);
    return this.render();
  };

  GraphicEngine.prototype.render = function() {
    var dt;
    dt = this.clock.getDelta();
    this.camera.update();
    if (this.waterMaterial.uniforms.time.value >= 1) {
      this.waterMaterial.uniforms.time.value = 0;
    } else {
      this.waterMaterial.uniforms.time.value += dt / 5;
    }
    if (this.grassMaterial.uniforms.time.value >= 1) {
      this.grassMaterial.uniforms.time.value = 0;
    } else {
      this.grassMaterial.uniforms.time.value += dt / 5;
    }
    this.renderer.render(this.scene, this.camera);
    this.rendererStats.update(this.renderer);
    this.stats.update();
    return this.interval = requestAnimationFrame(this.render.bind(this));
  };

  return GraphicEngine;

})();

Gfx = (function() {
  function Gfx(_) {
    this._ = _;
    this.settings = this._.gui.addFolder('Gfx');
    this.settings.open();
    this.composer = new THREE.EffectComposer(this._.renderer, void 0);
    this.RT = {};
    this.effects = [];
    this.add(new GfxRenderRT(this));
    this.add(new GfxDepthRT(this));
    this.add(new GfxGodraysRT(this));
    this.add(new GfxHDRRT(this));
    this.add(new GfxBloomRT(this));
    this.add(new GfxInput(this));
    this.add(new GfxOutput(this));
  }

  Gfx.prototype.add = function(v) {
    return this.effects.push(v);
  };

  Gfx.prototype.onResize = function() {
    var v, _i, _len, _ref, _results;
    _ref = this.effects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      if (v.onResize) {
        _results.push(v.onResize());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Gfx.prototype.render = function() {
    var v, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = this.effects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      if (v.beforeRender) {
        v.beforeRender();
      }
    }
    this.composer.render();
    _ref1 = this.effects;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      v = _ref1[_j];
      if (v.afterRender) {
        _results.push(v.afterRender());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Gfx;

})();

GfxRenderRT = (function() {
  function GfxRenderRT(_) {
    this._ = _;
    this._.RT.render = new THREE.WebGLRenderTarget(this._._.viewport.width() / 1, this._._.viewport.height() / 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this.data = {
      FXAA: new THREE.ShaderPass(THREE.FXAAShader)
    };
    this.data.FXAA.uniforms['resolution'].value.set(1 / this._._.viewport.width(), 1 / this._._.viewport.height());
    this._.composer.addPass(new THREE.RenderPass(this._._.scene, this._._.camera));
    this._.composer.addPass(this.data.FXAA);
    this._.composer.addPass(new THREE.SavePass(this._.RT.render));
  }

  return GfxRenderRT;

})();

GfxDepthRT = (function() {
  function GfxDepthRT(_) {
    this._ = _;
    this._.RT.depth = new THREE.WebGLRenderTarget(this._._.viewport.width() / 1, this._._.viewport.height() / 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this.data = {
      far: {
        value: 150,
        temp: 0
      }
    };
    this._.composer.addPass(new THREE.RenderPass(this._._.scene, this._._.camera, new THREE.MeshDepthMaterial));
    this._.composer.addPass(new THREE.SavePass(this._.RT.depth));
  }

  GfxDepthRT.prototype.beforeRender = function() {
    this.data.far.temp = this._._.camera.far;
    return this._._.camera.far = this.data.far.value;
  };

  GfxDepthRT.prototype.afterRender = function() {
    return this._._.camera.far = this.data.far.temp;
  };

  return GfxDepthRT;

})();

GfxGodraysRT = (function() {
  function GfxGodraysRT(_) {
    this._ = _;
    this._.RT.godrays = new THREE.WebGLRenderTarget(this._._.viewport.width() / 8, this._._.viewport.height() / 8, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this.data = {
      occlusion: {
        RT: {
          sun: new THREE.WebGLRenderTarget(this._._.viewport.width() / 8, this._._.viewport.height() / 8, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBufer: false
          }),
          occlusions: new THREE.WebGLRenderTarget(this._._.viewport.width() / 2, this._._.viewport.height() / 2, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBufer: false
          })
        },
        pass: {
          sun: new THREE.RenderPass(this._._.sunScene, this._._.camera),
          occlusions: new THREE.RenderPass(this._._.scene, this._._.camera, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            fog: false
          })),
          generate: new THREE.ShaderPass(THREE.OcclusionGenerateShader)
        },
        blur: {
          hblur: new THREE.ShaderPass(THREE.HorizontalBlurShader),
          vblur: new THREE.ShaderPass(THREE.VerticalBlurShader)
        }
      },
      generate: {
        pass: new THREE.ShaderPass(THREE.GodRays2.Godrays),
        blur: {
          hblur: new THREE.ShaderPass(THREE.HorizontalBlurShader),
          vblur: new THREE.ShaderPass(THREE.VerticalBlurShader)
        }
      }
    };
    this.data.occlusion.blur.hblur.uniforms.h.value = 2 / this._._.viewport.width();
    this.data.occlusion.blur.vblur.uniforms.v.value = 2 / this._._.viewport.height();
    this.data.generate.blur.hblur.uniforms.h.value = 2 / this._._.viewport.width();
    this.data.generate.blur.vblur.uniforms.v.value = 2 / this._._.viewport.height();
    this.data.occlusion.pass.generate.uniforms.tDiffuse2.value = this.data.occlusion.RT.occlusions;
    this._.composer.addPass(this.data.occlusion.pass.sun);
    this._.composer.addPass(new THREE.SavePass(this.data.occlusion.RT.sun));
    this._.composer.addPass(this.data.occlusion.pass.occlusions);
    this._.composer.addPass(new THREE.SavePass(this.data.occlusion.RT.occlusions));
    this._.composer.addPass(new THREE.TexturePass(this.data.occlusion.RT.sun));
    this._.composer.addPass(this.data.occlusion.pass.generate);
    this._.composer.addPass(this.data.occlusion.blur.hblur);
    this._.composer.addPass(this.data.occlusion.blur.vblur);
    this._.composer.addPass(this.data.generate.pass);
    this._.composer.addPass(this.data.generate.blur.hblur);
    this._.composer.addPass(this.data.generate.blur.vblur);
    this._.composer.addPass(new THREE.SavePass(this._.RT.godrays));
    this._.settings.godrays = this._.settings.addFolder('godrays');
    this._.settings.godrays.add(this.data.occlusion.blur.hblur.uniforms.h, 'value', 0, 0.01).name('occlusion.blur.h');
    this._.settings.godrays.add(this.data.occlusion.blur.vblur.uniforms.v, 'value', 0, 0.01).name('occlusion.blur.v');
    this._.settings.godrays.add(this.data.generate.blur.hblur.uniforms.h, 'value', 0, 0.01).name('rays.blur.h');
    this._.settings.godrays.add(this.data.generate.blur.vblur.uniforms.v, 'value', 0, 0.01).name('rays.blur.v');
  }

  return GfxGodraysRT;

})();

GfxHDRRT = (function() {
  function GfxHDRRT(_) {
    this._ = _;
    this._.RT.hdr = new THREE.WebGLRenderTarget(this._._.viewport.width() / 4, this._._.viewport.height() / 4, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this.data = {
      threshold: new THREE.ShaderPass(THREE.ThresholdShader),
      hblur: new THREE.ShaderPass(THREE.HorizontalBlurShader),
      vblur: new THREE.ShaderPass(THREE.VerticalBlurShader)
    };
    this.data.hblur.uniforms.h.value = 0.003;
    this.data.vblur.uniforms.v.value = 0.003;
    this._.composer.addPass(new THREE.TexturePass(this._.RT.render));
    this._.composer.addPass(this.data.threshold);
    this._.composer.addPass(this.data.hblur);
    this._.composer.addPass(this.data.vblur);
    this._.composer.addPass(new THREE.SavePass(this._.RT.hdr));
    this._.settings.hdr = this._.settings.addFolder('HDR');
    this._.settings.hdr.add(this.data.threshold.uniforms.threshold, 'value').name('bloom.threshold');
    this._.settings.hdr.add(this.data.hblur.uniforms.h, 'value').name('bloom.hblur');
    this._.settings.hdr.add(this.data.vblur.uniforms.v, 'value').name('bloom.vblur');
  }

  return GfxHDRRT;

})();

GfxBloomRT = (function() {
  function GfxBloomRT(_) {
    this._ = _;
    this._.RT.bloom = new THREE.WebGLRenderTarget(this._._.viewport.width() / 1, this._._.viewport.height() / 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBufer: false
    });
    this.data = {
      blur: {
        hblur: new THREE.ShaderPass(THREE.HorizontalBlurShader),
        vblur: new THREE.ShaderPass(THREE.VerticalBlurShader)
      }
    };
    this.data.blur.hblur.uniforms.h.value = 0.005;
    this.data.blur.vblur.uniforms.v.value = 0.005;
    this._.composer.addPass(new THREE.TexturePass(this._.RT.render));
    this._.composer.addPass(this.data.blur.hblur);
    this._.composer.addPass(this.data.blur.vblur);
    this._.composer.addPass(new THREE.SavePass(this._.RT.bloom));
  }

  return GfxBloomRT;

})();

GfxInput = (function() {
  function GfxInput(_) {
    this._ = _;
    this._.composer.addPass(new THREE.TexturePass(this._.RT.render));
  }

  return GfxInput;

})();

GfxSSAO = (function() {
  function GfxSSAO(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.SSAOShader)
    };
    this.data.pass.uniforms['tDepth'].value = this._.RT.depth;
    this.data.pass.uniforms['onlyAO'].value = 1;
    this.data.pass.uniforms['size'].value = new THREE.Vector2(this._._.viewport.width(), this._._.viewport.height());
    this.data.pass.uniforms['cameraFar'].value = 150;
    this.data.pass.uniforms['aoClamp'].value = 0.5;
    this.data.pass.uniforms['lumInfluence'].value = 0.5;
    this._.composer.addPass(this.data.pass);
    this._.settings.SSAO = this._.settings.addFolder('SSAO');
    this._.settings.SSAO.add(this.data.pass.uniforms.cameraFar, 'value').name('cameraFar');
    this._.settings.SSAO.add(this.data.pass.uniforms.aoClamp, 'value').name('aoClamp');
    this._.settings.SSAO.add(this.data.pass.uniforms.lumInfluence, 'value').name('lumInfluence');
  }

  return GfxSSAO;

})();

GfxAddGodrays = (function() {
  function GfxAddGodrays(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.GodRays2.Additive)
    };
    this.data.pass.uniforms['tAdd'].value = this._.RT.godrays;
    this.data.pass.uniforms['fCoeff'].value = 1;
    this._.settings.godrays.add(this.data.pass.uniforms.fCoeff, 'value', 0, 10).name('add');
    this._.settings.godrays.add(this.data.pass, 'enabled');
    this._.composer.addPass(this.data.pass);
  }

  return GfxAddGodrays;

})();

GfxAddHDR = (function() {
  function GfxAddHDR(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.HDRBloomAddShader),
      pass2: new THREE.ShaderPass(THREE.GodRays2.Additive)
    };
    this.data.pass.uniforms['tAdd'].value = this._.RT.hdr;
    this.data.pass.uniforms['fCoeff'].value = 1;
    this.data.pass2.uniforms['tAdd'].value = this._.RT.hdr;
    this.data.pass2.uniforms['fCoeff'].value = 1;
    this._.composer.addPass(this.data.pass);
    this._.composer.addPass(this.data.pass2);
    this._.settings.hdr.add(this.data.pass.uniforms.fCoeff, 'value').name('HDRAdd.Coeff');
    this._.settings.hdr.add(this.data.pass.uniforms.fCoeff, 'value').name('Additive.Coeff');
  }

  return GfxAddHDR;

})();

GfxAddBloom = (function() {
  function GfxAddBloom(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.GodRays2.Additive)
    };
    this.data.pass.uniforms['tAdd'].value = this._.RT.bloom;
    this.data.pass.uniforms['fCoeff'].value = 1.5;
    this._.composer.addPass(this.data.pass);
  }

  return GfxAddBloom;

})();

GfxBleach = (function() {
  function GfxBleach(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.BleachBypassShader)
    };
    this.data.pass.uniforms['opacity'].value = 0;
    this._.composer.addPass(this.data.pass);
  }

  return GfxBleach;

})();

GfxHueSaturation = (function() {
  function GfxHueSaturation(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.HueSaturationShader)
    };
    this.data.pass.uniforms['hue'].value = 0.5;
    this.data.pass.uniforms['saturation'].value = 0.5;
    this._.composer.addPass(this.data.pass);
  }

  return GfxHueSaturation;

})();

GfxBrightnessContrast = (function() {
  function GfxBrightnessContrast(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.BrightnessContrastShader)
    };
    this.data.pass.uniforms['brightness'].value = 0;
    this.data.pass.uniforms['contrast'].value = 0;
    this._.composer.addPass(this.data.pass);
  }

  return GfxBrightnessContrast;

})();

GfxColorCorrection = (function() {
  function GfxColorCorrection(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.ColorCorrectionShader)
    };
    this.data.pass.uniforms['powRGB'].value.set(1, 1, 1);
    this.data.pass.uniforms['mulRGB'].value.set(1, 1, 1);
    this._.composer.addPass(this.data.pass);
  }

  return GfxColorCorrection;

})();

GfxColorify = (function() {
  function GfxColorify(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.ColorifyShader)
    };
    this.data.pass.uniforms['color'].value = new THREE.Color(0xff0000);
    this.data.pass.enabled = false;
    this._.composer.addPass(this.data.pass);
  }

  return GfxColorify;

})();

GfxGammaCorrection = (function() {
  function GfxGammaCorrection(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.GammaCorrectionShader)
    };
    this.data.pass.uniforms['gamma'].value = 1.5;
    this._.composer.addPass(this.data.pass);
  }

  return GfxGammaCorrection;

})();

GfxVignette = (function() {
  function GfxVignette(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.VignetteShader)
    };
    this.data.pass.uniforms['offset'].value = 1.0;
    this.data.pass.uniforms['darkness'].value = 1.0;
    this._.composer.addPass(this.data.pass);
  }

  return GfxVignette;

})();

GfxDOF = (function() {
  function GfxDOF(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.BokehShader)
    };
    this.data.pass.uniforms['tDepth'].value = this._.RT.depth;
    this.data.pass.uniforms['aspect'].value = this._._.viewport.width() / this._._.viewport.height();
    this.data.pass.uniforms['focus'].value = 1.0;
    this.data.pass.uniforms['aperture'].value = 0.025;
    this.data.pass.uniforms['maxblur'].value = 1.0;
    this._.composer.addPass(this.data.pass);
  }

  return GfxDOF;

})();

GfxMotionBlur = (function() {
  function GfxMotionBlur(_) {
    this._ = _;
    this.data = {
      mCurrent: new THREE.Matrix4,
      mPrev: new THREE.Matrix4,
      tmpArray: new THREE.Matrix4,
      pass: new THREE.ShaderPass(THREE.MotionBlurShader)
    };
    this.data.pass.uniforms['tDepth'].value = this._.RT.depth;
    this._.composer.addPass(this.data.pass);
  }

  GfxMotionBlur.prototype.beforeRender = function() {
    this.data.tmpArray.copy(this._._.camera.matrixWorldInverse);
    this.data.tmpArray.multiply(this._._.camera.projectionMatrix);
    this.data.mCurrent.getInverse(this.data.tmpArray);
    this.data.pass.uniforms.viewProjectionInverseMatrix.value.copy(this.data.mCurrent);
    this.data.pass.uniforms.previousViewProjectionMatrix.value.copy(this.data.mPrev);
    return this.data.mPrev.copy(this.data.tmpArray);
  };

  return GfxMotionBlur;

})();

GfxOutput = (function() {
  function GfxOutput(_) {
    this._ = _;
    this.data = {
      pass: new THREE.ShaderPass(THREE.CopyShader)
    };
    this.data.pass.renderToScreen = true;
    this._.composer.addPass(this.data.pass);
  }

  return GfxOutput;

})();

AssetsManager = (function() {
  function AssetsManager(options) {
    this.graphic = {
      model: {},
      material: {},
      geometry: {},
      textures: {},
      images: {}
    };
    this.loadModel('monument');
    this.loadGeometry('monument');
    this.loadMaterial('monument');
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
        } else if (options.type.bin) {
          loader = new THREE.BinaryLoader(true);
          return loader.load('assets/graphic/geometry/' + url + '/geometry.js', function(geometry, materials) {
            return _this.graphic.geometry[url] = geometry;
          });
        }
      };
    })(this));
  };

  AssetsManager.prototype.loadTexture = function(url) {
    return this.graphic.textures[url] = THREE.ImageUtils.loadTexture('assets/graphic/textures/' + url + '.png');
  };

  return AssetsManager;

})();

THREE.ExtrasUtils_projectOnScreen = function(width, height, object, camera) {
  var heightHalf, vector, widthHalf;
  widthHalf = width / 2;
  heightHalf = height / 2;
  vector = new THREE.Vector3;
  vector.setFromMatrixPosition(object.matrixWorld).project(camera);
  vector.x = (vector.x * widthHalf) + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;
  return vector;
};
