var AssetsManager, GFx, GraphicEngine, assets, graphic;

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
    var count, i, j, _i, _j, _ref, _ref1;
    this._ = _;
    this.gui = new dat.GUI;
    this.renderer = new THREE.WebGLRenderer;
    this.renderer.shadowMapEnabled = true;
    this.rendererStats = new THREEx.RendererStats;
    this.rendererStats.domElement.style.position = 'absolute';
    this.rendererStats.domElement.style.bottom = '0px';
    this.rendererStats.domElement.style.left = '0px';
    this.stats = new Stats;
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.left = '0px';
    this.viewport = $('#viewport');
    this.viewScene = new THREE.Scene;
    count = {
      x: 5,
      y: 6
    };
    this.view = [];
    for (j = _i = 0, _ref = count.y - 1; _i <= _ref; j = _i += 1) {
      this.view[j] = [];
      for (i = _j = 0, _ref1 = count.x - 1; _j <= _ref1; i = _j += 1) {
        this.view[j][i] = new THREE.Mesh(new THREE.PlaneGeometry(this.viewport.width() / 2, this.viewport.height() / 2, 1, 1), new THREE.MeshBasicMaterial);
        this.view[j][i].position.set(i * (this.viewport.width() / 2), j * (this.viewport.height() / 2), 0);
        this.viewScene.add(this.view[j][i]);
      }
    }
    this.viewCamera = new THREE.OrthographicCamera(this.viewport.width() / -2, this.viewport.width() / 2, this.viewport.height() / 2, this.viewport.height() / -2, 1, 1000);
    this.viewCamera.position.set(this.viewport.width() / 2, 0, 1);
    this.viewCamera.scroll = {
      x: 0,
      y: 0
    };
    this.viewCamera.setView = (function(_this) {
      return function() {
        _this.viewCamera.position.x = _this.viewport.width() / 4 + _this.viewport.width() * _this.viewCamera.scroll.x;
        return _this.viewCamera.position.y = _this.viewport.height() / 4 + _this.viewport.height() * _this.viewCamera.scroll.y;
      };
    })(this);
    this.viewCamera.setView();
    this.gui.add(this.viewCamera.scroll, 'x', 0, 5).name('cam.scroll.x').onChange((function(_this) {
      return function(value) {
        return _this.viewCamera.setView();
      };
    })(this));
    this.gui.add(this.viewCamera.scroll, 'y', 0, 5).name('cam.scroll.y').onChange((function(_this) {
      return function(value) {
        return _this.viewCamera.setView();
      };
    })(this));
    this.viewport.append(this.renderer.domElement);
    this.viewport.append(this.stats.domElement);
    this.viewport.append(this.rendererStats.domElement);
    this.clock = new THREE.Clock;
    this.scene = new THREE.Scene;
    this.oscene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(75, this.viewport.width() / this.viewport.height(), 1, 200);
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
    this.gfx = new GFx(this);
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
    return this.gfx.resize();
  };

  GraphicEngine.prototype.stop = function() {
    return cancelAnimationFrame(this.interval);
  };

  GraphicEngine.prototype.initialize = function(options) {
    var axisHelper, box, boxGeo, geometry, gridHelper, i, j, monument, plane, _i, _j;
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
        color: 0xffffff
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
    this.oscene.add(this.sun.occlusion);
    geometry = new THREE.PlaneGeometry(500, 500, 99, 99);
    plane = {
      graphic: new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: 0xff4466
      })),
      occlusion: new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: 0x000000
      }))
    };
    plane.graphic.rotation.x = plane.occlusion.rotation.x = -Math.PI / 2;
    plane.graphic.receiveShadow = true;
    this.scene.add(plane.graphic);
    this.oscene.add(plane.occlusion);
    monument = {
      graphic: new THREE.Mesh(assets.graphic.geometry.monument, assets.graphic.material.monument),
      occlusion: new THREE.Mesh(assets.graphic.geometry.monument, new THREE.MeshBasicMaterial({
        color: 0x000000
      }))
    };
    monument.graphic.rotation.x = monument.occlusion.rotation.x = -Math.PI / 2;
    monument.graphic.scale.x = monument.occlusion.scale.x = 0.1;
    monument.graphic.scale.y = monument.occlusion.scale.y = 0.1;
    monument.graphic.scale.z = monument.occlusion.scale.z = 0.1;
    monument.graphic.castShadow = true;
    this.scene.add(monument.graphic);
    this.oscene.add(monument.occlusion);
    boxGeo = new THREE.BoxGeometry(10, 2, 10);
    for (i = _i = 0; _i <= 10; i = _i += 1) {
      for (j = _j = 0; _j <= 10; j = _j += 1) {
        box = {
          graphic: new THREE.Mesh(boxGeo),
          occlusion: new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({
            color: 0x000000
          }))
        };
        box.graphic.position.set(i * 15 - 75, 1, j * 15 - 75);
        box.occlusion.position.set(i * 15 - 75, 1, j * 15 - 75);
        this.scene.add(box.graphic);
        this.oscene.add(box.occlusion);
      }
    }
    return this.render();
  };

  GraphicEngine.prototype.render = function() {
    var lightPos;
    lightPos = THREE.ExtrasUtils_projectOnScreen(this.viewport.width(), this.viewport.height(), this.sun.light, this.camera);
    this.gfx.godrays1GeneratePass.uniforms.fX.value = lightPos.x / this.viewport.width();
    this.gfx.godrays1GeneratePass.uniforms.fY.value = 1 - lightPos.y / this.viewport.height();
    this.gfx.render();
    this.rendererStats.update(this.renderer);
    this.stats.update();
    this.renderer.render(this.viewScene, this.viewCamera);
    return setTimeout((function(_this) {
      return function() {
        return _this.render();
      };
    })(this), 1000);
  };

  return GraphicEngine;

})();

GFx = (function() {
  function GFx(_) {
    var DOFPass, FXAAPass, HDR, SSAO0Pass, SSAO1Pass, bhblur, bleachPass, bloomAddPass, bright_contPass, bvblur, colcorPass, colorifyPass, colorifyPassParams, copyPass, folder, gammaPass, ghblur, godrays1AddPass, gvblur, hue_satPass, luminosityPass, occlusionRenderPass, occlusionblur, renderPass, vignettePass;
    this._ = _;
    folder = {
      gfx: this._.gui.addFolder('GFx')
    };
    folder.gfx.open();
    this.renderTarget = {
      scene: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      FXAA: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      DOF: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      motionblur: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      HDR: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      hue_sat: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      bleach: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      luminosity: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      bright_cont: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      colcor: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      colorify: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      vignette: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      gamma: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      depth: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      SSAO0: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      SSAO1: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      occlusion: new THREE.WebGLRenderTarget(this._.viewport.width() / 4, this._.viewport.height() / 4, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      blur: new THREE.WebGLRenderTarget(this._.viewport.width() / 4, this._.viewport.height() / 4, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      godrays1Generate: new THREE.WebGLRenderTarget(this._.viewport.width() / 4, this._.viewport.height() / 4, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      godrays1Add: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      bloomGenerate: new THREE.WebGLRenderTarget(this._.viewport.width() / 4, this._.viewport.height() / 4, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      }),
      bloomAdd: new THREE.WebGLRenderTarget(this._.viewport.width() / 1, this._.viewport.height() / 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      })
    };
    this._.view[0][0].material.map = this.renderTarget.scene;
    this._.view[0][1].material.map = this.renderTarget.DOF;
    this._.view[0][2].material.map = this.renderTarget.motionblur;
    this._.view[0][3].material.map = this.renderTarget.FXAA;
    this._.view[1][0].material.map = this.renderTarget.HDR;
    this._.view[1][1].material.map = this.renderTarget.gamma;
    this._.view[1][2].material.map = this.renderTarget.colcor;
    this._.view[1][3].material.map = this.renderTarget.colorify;
    this._.view[2][0].material.map = this.renderTarget.bright_cont;
    this._.view[2][1].material.map = this.renderTarget.hue_sat;
    this._.view[2][2].material.map = this.renderTarget.bleach;
    this._.view[2][3].material.map = this.renderTarget.luminosity;
    this._.view[2][4].material.map = this.renderTarget.vignette;
    this._.view[3][0].material.map = this.renderTarget.depth;
    this._.view[3][1].material.map = this.renderTarget.SSAO0;
    this._.view[3][2].material.map = this.renderTarget.SSAO1;
    this._.view[4][0].material.map = this.renderTarget.occlusion;
    this._.view[4][1].material.map = this.renderTarget.blur;
    this._.view[4][2].material.map = this.renderTarget.godrays1Generate;
    this._.view[4][3].material.map = this.renderTarget.godrays1Add;
    this._.view[5][0].material.map = this.renderTarget.bloomGenerate;
    this._.view[5][1].material.map = this.renderTarget.bloomAdd;
    this.composer = {
      scene: new THREE.EffectComposer(this._.renderer, this.renderTarget.scene),
      FXAA: new THREE.EffectComposer(this._.renderer, this.renderTarget.FXAA),
      DOF: new THREE.EffectComposer(this._.renderer, this.renderTarget.DOF),
      motionblur: new THREE.EffectComposer(this._.renderer, this.renderTarget.motionblur),
      HDR: new THREE.EffectComposer(this._.renderer, this.renderTarget.HDR),
      hue_sat: new THREE.EffectComposer(this._.renderer, this.renderTarget.hue_sat),
      bleach: new THREE.EffectComposer(this._.renderer, this.renderTarget.bleach),
      luminosity: new THREE.EffectComposer(this._.renderer, this.renderTarget.luminosity),
      bright_cont: new THREE.EffectComposer(this._.renderer, this.renderTarget.bright_cont),
      colcor: new THREE.EffectComposer(this._.renderer, this.renderTarget.colcor),
      colorify: new THREE.EffectComposer(this._.renderer, this.renderTarget.colorify),
      vignette: new THREE.EffectComposer(this._.renderer, this.renderTarget.vignette),
      gamma: new THREE.EffectComposer(this._.renderer, this.renderTarget.gamma),
      SSAO0: new THREE.EffectComposer(this._.renderer, this.renderTarget.SSAO0),
      SSAO1: new THREE.EffectComposer(this._.renderer, this.renderTarget.SSAO1),
      occlusion: new THREE.EffectComposer(this._.renderer, this.renderTarget.occlusion),
      blur: new THREE.EffectComposer(this._.renderer, this.renderTarget.blur),
      godrays1Generate: new THREE.EffectComposer(this._.renderer, this.renderTarget.godrays1Generate),
      godrays1Add: new THREE.EffectComposer(this._.renderer, this.renderTarget.godrays1Add),
      bloomGenerate: new THREE.EffectComposer(this._.renderer, this.renderTarget.bloomGenerate),
      bloomAdd: new THREE.EffectComposer(this._.renderer, this.renderTarget.bloomAdd)
    };
    copyPass = new THREE.ShaderPass(THREE.CopyShader);
    renderPass = new THREE.RenderPass(this._.scene, this._.camera);
    this.composer.scene.addPass(renderPass);
    this.composer.scene.addPass(copyPass);
    FXAAPass = new THREE.ShaderPass(THREE.FXAAShader);
    FXAAPass.uniforms['resolution'].value.set(1 / this._.viewport.width(), 1 / this._.viewport.height());
    this.composer.FXAA.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.FXAA.addPass(FXAAPass);
    this.composer.FXAA.addPass(copyPass);
    DOFPass = new THREE.ShaderPass(THREE.BokehShader);
    this.composer.DOF.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.DOF.addPass(DOFPass);
    this.composer.DOF.addPass(copyPass);
    DOFPass.uniforms['tDepth'].value = this.renderTarget.depth;
    DOFPass.uniforms['aspect'].value = this._.viewport.width() / this._.viewport.height();
    folder.DOF = folder.gfx.addFolder('DOF');
    folder.DOF.add(DOFPass.uniforms.focus, 'value').name('focus');
    folder.DOF.add(DOFPass.uniforms.aperture, 'value').name('aperture');
    folder.DOF.add(DOFPass.uniforms.maxblur, 'value').name('maxblur');
    this.motionblur = {
      mCurrent: new THREE.Matrix4(),
      mPrev: new THREE.Matrix4(),
      tmpArray: new THREE.Matrix4()
    };
    this.motionblur.motionblurPass = new THREE.ShaderPass(THREE.MotionBlurShader);
    this.motionblur.motionblurPass.uniforms['tDepth'].value = this.renderTarget.depth;
    this.composer.motionblur.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.motionblur.addPass(this.motionblur.motionblurPass);
    this.composer.motionblur.addPass(copyPass);
    folder.motionblur = folder.gfx.addFolder('motionblur');
    folder.motionblur.add(this.motionblur.motionblurPass.uniforms.velocityFactor, 'value').name('velocityFactor');
    HDR = {
      p1: new THREE.ShaderPass(THREE.ThresholdShader),
      p2: new THREE.ShaderPass(THREE.HorizontalBlurShader),
      p3: new THREE.ShaderPass(THREE.VerticalBlurShader),
      p4: new THREE.ShaderPass(THREE.GodRays2.Additive),
      temp1: new THREE.WebGLRenderTarget(this._.viewport.width() / 2, this._.viewport.height() / 2, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBufer: false
      })
    };
    HDR.p2.uniforms.h.value = 2 / this._.viewport.height();
    HDR.p3.uniforms.v.value = 2 / this._.viewport.width();
    HDR.p4.uniforms.tAdd.value = HDR.temp1;
    this.composer.HDR.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.HDR.addPass(HDR.p1);
    this.composer.HDR.addPass(HDR.p2);
    this.composer.HDR.addPass(HDR.p3);
    this.composer.HDR.addPass(new THREE.SavePass(HDR.temp1));
    this.composer.HDR.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.HDR.addPass(HDR.p4);
    this.composer.HDR.addPass(copyPass);
    folder.HDR = folder.gfx.addFolder('HDR');
    folder.HDR.add(HDR.p1.uniforms.threshold, 'value', 0, 1).name('threshold');
    folder.HDR.add(HDR.p2.uniforms.h, 'value', 0, 0.01).name('hblur');
    folder.HDR.add(HDR.p3.uniforms.v, 'value', 0, 0.01).name('vblur');
    hue_satPass = new THREE.ShaderPass(THREE.HueSaturationShader);
    hue_satPass.uniforms['hue'].value = 0.5;
    hue_satPass.uniforms['saturation'].value = 0.5;
    this.composer.hue_sat.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.hue_sat.addPass(hue_satPass);
    this.composer.hue_sat.addPass(copyPass);
    folder.hue_sat = folder.gfx.addFolder('hue, saturation');
    folder.hue_sat.add(hue_satPass.uniforms.hue, 'value').name('hue');
    folder.hue_sat.add(hue_satPass.uniforms.saturation, 'value').name('saturation');
    bleachPass = new THREE.ShaderPass(THREE.BleachBypassShader);
    bleachPass.uniforms['opacity'].value = 0.5;
    this.composer.bleach.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.bleach.addPass(bleachPass);
    this.composer.bleach.addPass(copyPass);
    folder.bleach = folder.gfx.addFolder('bleach');
    folder.bleach.add(bleachPass.uniforms.opacity, 'value').name('opacity');
    luminosityPass = new THREE.ShaderPass(THREE.LuminosityShader);
    this.composer.luminosity.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.luminosity.addPass(luminosityPass);
    this.composer.luminosity.addPass(copyPass);
    folder.luminosity = folder.gfx.addFolder('luminosity');
    bright_contPass = new THREE.ShaderPass(THREE.BrightnessContrastShader);
    bright_contPass.uniforms['brightness'].value = 0.5;
    bright_contPass.uniforms['contrast'].value = 0.5;
    this.composer.bright_cont.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.bright_cont.addPass(bright_contPass);
    this.composer.bright_cont.addPass(copyPass);
    folder.bright_cont = folder.gfx.addFolder('brightness, contrast');
    folder.bright_cont.add(bright_contPass.uniforms.brightness, 'value').name('brightness');
    folder.bright_cont.add(bright_contPass.uniforms.contrast, 'value').name('contrast');
    colcorPass = new THREE.ShaderPass(THREE.ColorCorrectionShader);
    this.composer.colcor.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.colcor.addPass(colcorPass);
    this.composer.colcor.addPass(copyPass);
    colorifyPassParams = {
      color: [255, 255, 255]
    };
    colorifyPass = new THREE.ShaderPass(THREE.ColorifyShader);
    this.composer.colorify.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.colorify.addPass(colorifyPass);
    this.composer.colorify.addPass(copyPass);
    folder.colorify = folder.gfx.addFolder('colorify');
    vignettePass = new THREE.ShaderPass(THREE.VignetteShader);
    this.composer.vignette.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.vignette.addPass(vignettePass);
    this.composer.vignette.addPass(copyPass);
    folder.vignette = folder.gfx.addFolder('vignette');
    folder.vignette.add(vignettePass.uniforms.offset, 'value').name('offset');
    folder.vignette.add(vignettePass.uniforms.darkness, 'value').name('darkness');
    gammaPass = new THREE.ShaderPass(THREE.GammaCorrectionShader);
    this.composer.gamma.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.gamma.addPass(gammaPass);
    this.composer.gamma.addPass(copyPass);
    folder.gamma = folder.gfx.addFolder('gamma');
    folder.gamma.add(gammaPass.uniforms.gamma, 'value').name('gamma');
    SSAO0Pass = new THREE.ShaderPass(THREE.SSAOShader);
    SSAO0Pass.uniforms['tDepth'].value = this.renderTarget.depth;
    SSAO0Pass.uniforms['onlyAO'].value = 1;
    this.composer.SSAO0.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.SSAO0.addPass(SSAO0Pass);
    SSAO1Pass = new THREE.ShaderPass(THREE.SSAOShader);
    SSAO1Pass.uniforms['tDepth'].value = this.renderTarget.depth;
    this.composer.SSAO1.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.SSAO1.addPass(SSAO1Pass);
    folder.SSAO = folder.gfx.addFolder('SSAO');
    folder.SSAO.add(SSAO0Pass.uniforms['aoClamp'], 'value').name('SSAO[0].aoClamp');
    folder.SSAO.add(SSAO0Pass.uniforms['lumInfluence'], 'value').name('SSAO[0].lumInfluence');
    folder.SSAO.add(SSAO1Pass.uniforms['aoClamp'], 'value').name('SSAO[1].aoClamp');
    folder.SSAO.add(SSAO1Pass.uniforms['lumInfluence'], 'value').name('SSAO[1].lumInfluence');
    occlusionRenderPass = new THREE.RenderPass(this._.oscene, this._.camera);
    this.composer.occlusion.addPass(occlusionRenderPass);
    this.composer.occlusion.addPass(copyPass);
    occlusionblur = {
      params: {
        h: 1,
        v: 1
      },
      hblur: new THREE.ShaderPass(THREE.HorizontalBlurShader),
      vblur: new THREE.ShaderPass(THREE.VerticalBlurShader)
    };
    occlusionblur.hblur.uniforms.h.value = occlusionblur.params.h / this._.viewport.width();
    occlusionblur.vblur.uniforms.v.value = occlusionblur.params.v / this._.viewport.height();
    this.composer.blur.addPass(new THREE.TexturePass(this.renderTarget.occlusion));
    this.composer.blur.addPass(occlusionblur.hblur);
    this.composer.blur.addPass(occlusionblur.vblur);
    this.composer.blur.addPass(copyPass);
    folder.occlusionblur = folder.gfx.addFolder('occlusionblur');
    folder.occlusionblur.add(occlusionblur.params, 'h').name('h').onChange((function(_this) {
      return function(value) {
        return occlusionblur.hblur.uniforms.h.value = value / _this._.viewport.width();
      };
    })(this));
    folder.occlusionblur.add(occlusionblur.params, 'v').name('v').onChange((function(_this) {
      return function(value) {
        return occlusionblur.vblur.uniforms.v.value = value / _this._.viewport.height();
      };
    })(this));
    ghblur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
    ghblur.uniforms.h.value = 0.003;
    gvblur = new THREE.ShaderPass(THREE.VerticalBlurShader);
    gvblur.uniforms.v.value = 0.003;
    this.godrays1GeneratePass = new THREE.ShaderPass(THREE.GodRays2.Godrays);
    this.composer.godrays1Generate.addPass(new THREE.TexturePass(this.renderTarget.blur));
    this.composer.godrays1Generate.addPass(this.godrays1GeneratePass);
    this.composer.godrays1Generate.addPass(ghblur);
    this.composer.godrays1Generate.addPass(gvblur);
    folder.godrays1 = folder.gfx.addFolder('godrays1');
    folder.godrays1.add(ghblur.uniforms.h, 'value').name('blur h');
    folder.godrays1.add(gvblur.uniforms.v, 'value').name('blur v');
    folder.godrays1.add(this.godrays1GeneratePass.uniforms.fX, 'value').name('fX');
    folder.godrays1.add(this.godrays1GeneratePass.uniforms.fY, 'value').name('fY');
    folder.godrays1.add(this.godrays1GeneratePass.uniforms.fExposure, 'value').name('fExposure');
    folder.godrays1.add(this.godrays1GeneratePass.uniforms.fDecay, 'value').name('fDecay');
    folder.godrays1.add(this.godrays1GeneratePass.uniforms.fDensity, 'value').name('fDensity');
    folder.godrays1.add(this.godrays1GeneratePass.uniforms.fWeight, 'value').name('fWeight');
    folder.godrays1.add(this.godrays1GeneratePass.uniforms.fClamp, 'value').name('fClamp');
    godrays1AddPass = new THREE.ShaderPass(THREE.GodRays2.Additive);
    godrays1AddPass.uniforms['tAdd'].value = this.renderTarget.godrays1Generate;
    this.composer.godrays1Add.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.godrays1Add.addPass(godrays1AddPass);
    bhblur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
    bhblur.uniforms.h.value = 0.005;
    bvblur = new THREE.ShaderPass(THREE.VerticalBlurShader);
    bvblur.uniforms.v.value = 0.005;
    this.composer.bloomGenerate.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.bloomGenerate.addPass(bhblur);
    this.composer.bloomGenerate.addPass(bvblur);
    this.composer.bloomGenerate.addPass(copyPass);
    folder.bloom = folder.gfx.addFolder('bloom');
    folder.bloom.add(bhblur.uniforms.h, 'value').name('blur h');
    folder.bloom.add(bvblur.uniforms.v, 'value').name('blur v');
    bloomAddPass = new THREE.ShaderPass(THREE.GodRays2.Additive);
    bloomAddPass.uniforms['tAdd'].value = this.renderTarget.bloomGenerate;
    this.composer.bloomAdd.addPass(new THREE.TexturePass(this.renderTarget.scene));
    this.composer.bloomAdd.addPass(bloomAddPass);
  }

  GFx.prototype.resize = function() {};

  GFx.prototype.render = function() {
    this._.scene.overrideMaterial = new THREE.MeshDepthMaterial;
    this._.renderer.render(this._.scene, this._.camera, this.renderTarget.depth);
    this._.scene.overrideMaterial = null;
    this.composer.scene.render();
    this.composer.FXAA.render();
    this.composer.DOF.render();
    this.motionblur.tmpArray.copy(this._.camera.matrixWorldInverse);
    this.motionblur.tmpArray.multiply(this._.camera.projectionMatrix);
    this.motionblur.mCurrent.getInverse(this.motionblur.tmpArray);
    this.motionblur.motionblurPass.uniforms.viewProjectionInverseMatrix.value.copy(this.motionblur.mCurrent);
    this.motionblur.motionblurPass.uniforms.previousViewProjectionMatrix.value.copy(this.motionblur.mPrev);
    this.composer.motionblur.render();
    this.motionblur.mPrev.copy(this.motionblur.tmpArray);
    this.composer.HDR.render();
    this.composer.hue_sat.render();
    this.composer.bleach.render();
    this.composer.luminosity.render();
    this.composer.bright_cont.render();
    this.composer.colcor.render();
    this.composer.colorify.render();
    this.composer.vignette.render();
    this.composer.gamma.render();
    this.composer.SSAO0.render();
    this.composer.SSAO1.render();
    this.composer.occlusion.render();
    this.composer.blur.render();
    this.composer.godrays1Generate.render();
    this.composer.godrays1Add.render();
    this.composer.bloomGenerate.render();
    return this.composer.bloomAdd.render();
  };

  return GFx;

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
